// ╔══════════════════════════════════════════════════════════════════════╗
// ║  shop-remind — تذكير السلّة المتروكة للمتجر الرقميّ (مطفأ افتراضاً)      ║
// ║                                                                        ║
// ║   run      (pg_cron كلّ ساعة: shop-remind-hourly) — لا يفعل شيئاً       ║
// ║            إلا إذا shop_settings.cart_reminders.enabled = true          ║
// ║   preview  {stage}  → يرسل الإيميلين للمالك فقط (للمعاينة)              ║
// ║                                                                        ║
// ║  من فتح الدفع ولم يدفع (ولا طلب مدفوع على بريده): تذكير بعد first_hours  ║
// ║  ساعات، وآخر بعد second_days أيّام — مرّتان كحدّ أقصى، وللطلبات بعد      ║
// ║  enabled_at فقط (لا رسائل للقديم عند التشغيل). idempotent: remind1_at/   ║
// ║  remind2_at تُعلَّم على كلّ طلبات البريد، فتكرار النداء لا يكرّر الإرسال. ║
// ║  بلا واتساب آليّ (قرار إبراهيم) — زرّ «تابِع» في لوحة المتجر يدويّ.       ║
// ║     supabase functions deploy shop-remind --no-verify-jwt               ║
// ╚══════════════════════════════════════════════════════════════════════╝

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <noreply@ibrahimsaud.com>";
const SITE = "https://ibrahimsaud.com";
const OWNER = "ibrahimsaud25@gmail.com";
const WA = "966504895213";
const MAX_PER_RUN = 20;
const WINDOW_DAYS = 10;

const svc = { apikey: SERVICE, Authorization: "Bearer " + SERVICE, "Content-Type": "application/json" };
async function rest(method: string, path: string, body?: unknown, prefer?: string) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method, headers: prefer ? { ...svc, Prefer: prefer } : svc, body: body !== undefined ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) throw new Error("RESEND_API_KEY غير مضبوط");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 200));
}

type Order = { id: string; sku: string; title: string; amount: number; buyer_name: string; buyer_email: string; status: string; pay_method?: string | null; lang?: string | null; created_at: string; remind1_at?: string | null; remind2_at?: string | null };
type Cfg = { enabled?: boolean; first_hours?: number; second_days?: number; enabled_at?: string | null; last_preview?: string | null };

const isAr = (o: Order) => !/-(en|ru)(@|$)/.test(o.sku) && (!o.lang || o.lang === "ar");
function buyUrl(o: Order) {
  const base = o.sku.split("@")[0];
  if (base === "lessons-broadcast") return `${SITE}/lessons-broadcast/#buy`;
  if (base === "lessons-broadcast-ru") return `${SITE}/ru/lessons-broadcast/#buy`;
  if (base === "lessons-broadcast-en") return `${SITE}/${o.lang && o.lang !== "ar" ? o.lang : "en"}/lessons-broadcast/#buy`;
  return `${SITE}/shop/${encodeURIComponent(base)}/#buy`;
}
const waUrl = (o: Order) => `https://wa.me/${WA}?text=${encodeURIComponent(`السلام عليكم، بخصوص طلبي: ${o.title}`)}`;

// ── قالب الإيميل بهويّة إبراهيم سعود (ضوء الاستوديو) ─────────────────────────
// نسخة واحدة متطابقة في shop وshop-account وshop-remind (كلّ دالّة تُنشر وحدها).
// ضوء النافذة الأزرق مربّعات
// بدرجات أزرق مخفّفة جاهزة — عملاء البريد لا يدعمون blur ولا opacity ولا transform.
// الشعار «ملصق»: حروف بيضاء بحدّ أسود — يبين على الخلفيّة الفاتحة والداكنة (وضع الجوال الليليّ) بصورة وحدة،
// لأنّ Gmail وغيره يقلبون خلفيّة الإيميل للداكن ولا يدعمون تبديل الصور. تخدمه دالّة shop (?asset=logo)، ونسخته في public/v2/ibrahim-saud-logo-sticker.png
const BRAND_LOGO = "https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop?asset=logo";
const BRAND_FONT = "'Thmanyah Sans',-apple-system,BlinkMacSystemFont,'SF Arabic','Segoe UI',Tahoma,Arial,sans-serif";
function windowLight(rtl: boolean) {
  // ستّ مربّعات (٣×٢) بمنظور: الأكبر والأقوى في الزاوية الخارجيّة ثمّ تصغر وتخفت للداخل،
  // مثل ضوء النافذة على ستارة الاستوديو (WindowLight في الموقع).
  const cols = [{ w: 16, h: 19, c: ["#8FAEFF", "#B4C8FF"] }, { w: 13, h: 15, c: ["#B4C8FF", "#D3DFFF"] }, { w: 10, h: 11, c: ["#D3DFFF", "#E8EEFF"] }];
  const order = rtl ? cols : [...cols].reverse();
  const row = (i: number) => `<tr>${order.map((k) => `<td style="padding:0;vertical-align:${i ? "top" : "bottom"};font-size:0;line-height:0"><div style="width:${k.w}px;height:${k.h}px;background:${k.c[i]};border-radius:3px;font-size:0;line-height:0">&nbsp;</div></td>`).join("")}</tr>`;
  return `<table role="presentation" dir="ltr" cellpadding="0" cellspacing="3" border="0" style="border-collapse:separate;display:inline-table">${row(0)}${row(1)}</table>`;
}
function brandMail(o: { rtl: boolean; label: string; title: string; body: string; cta?: { href: string; label: string }; foot: string }) {
  const side = o.rtl ? "right" : "left", other = o.rtl ? "left" : "right";
  const btn = o.cta
    ? `<div style="margin:28px 0 8px"><a href="${esc(o.cta.href)}" style="background:#2F66FF;color:#fff;text-decoration:none;font-weight:bold;padding:13px 28px;border-radius:999px;display:inline-block">${esc(o.cta.label)}</a></div>`
    : "";
  return `<div dir="${o.rtl ? "rtl" : "ltr"}" style="font-family:${BRAND_FONT};background:#F5F5F7;padding:32px 16px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;padding:28px 28px 30px;color:#1D1D1F;text-align:${side}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 26px"><tr>
      <td align="${side}" style="text-align:${side};vertical-align:middle"><a href="https://ibrahimsaud.com" style="text-decoration:none;display:inline-block"><img src="${BRAND_LOGO}" width="84" height="55" alt="${o.rtl ? "إبراهيم سعود" : "Ibrahim Saud"}" style="display:block;border:0;outline:none;width:84px;height:55px;font-size:14px;font-weight:bold;color:#1D1D1F;color-scheme:light only"></a></td>
      <td align="${other}" style="text-align:${other};vertical-align:middle">${windowLight(o.rtl)}</td>
    </tr></table>
    <div style="font-size:13px;color:#2F66FF;font-weight:bold;margin:0 0 6px">${o.label}</div>
    <h1 style="font-size:24px;line-height:1.4;margin:0 0 14px;color:#1D1D1F">${esc(o.title)}</h1>
    <div style="font-size:16px;line-height:1.9;color:#3A3A3C">${o.body}</div>
    ${btn}
    <p style="font-size:12px;color:#86868B;line-height:1.8;margin:26px 0 0;border-top:1px solid #E5E5EA;padding-top:16px">${o.foot}</p>
  </div></div>`;
}
// ── /قالب الإيميل ─────────────────────────────────────────────────────────────
function shell(rtl: boolean, title: string, body: string, cta: { href: string; label: string }, foot: string) {
  return brandMail({ rtl, label: rtl ? "المتجر" : "Store", title, body, cta, foot });
}

function email(o: Order, stage: 1 | 2): { subject: string; html: string } {
  const first = String(o.buyer_name || "").trim().split(/\s+/)[0] || "";
  const lb = o.sku.startsWith("lessons-broadcast");
  if (isAr(o)) {
    const help = `لو واجهتك مشكلة في الدفع أو عندك سؤال قبل الشراء، <a href="${waUrl(o)}" style="color:#2F66FF">راسلني على واتساب</a> وأساعدك.`;
    const perks = lb ? `<ul style="padding-right:20px;margin:12px 0">
        <li>دفعة واحدة وتملكه — بلا اشتراك شهريّ ولا سنويّ</li>
        <li>ويندوز وماك وأندرويد من نفس الطلب</li>
        <li>التحديثات مجّاناً من «حسابي» في الموقع</li></ul>` : "";
    if (stage === 1) return {
      subject: `طلبك محفوظ — ${o.title}`,
      html: shell(true, `أهلاً ${first}، ما اكتمل طلبك`, `شفت إنك بدأت تطلب <b>${esc(o.title)}</b> وما اكتمل الدفع.<br>${help}`,
        { href: buyUrl(o), label: "أكمل الطلب" }, "وصلك هذا الإيميل لأنّك بدأت طلباً في موقع ibrahimsaud.com. ما نرسل أكثر من تذكيرين."),
    };
    return {
      subject: `آخر تذكير: ${o.title}`,
      html: shell(true, `${first}، هذا آخر تذكير منّي`, `طلبك <b>${esc(o.title)}</b> ما زال ما اكتمل.${perks}${help}`,
        { href: buyUrl(o), label: "أكمل الطلب" }, "هذا آخر تذكير عن هذا الطلب — ما راح يوصلك غيره."),
    };
  }
  const help = `If you had a problem paying or have a question first, <a href="${waUrl(o)}" style="color:#2F66FF">message me on WhatsApp</a>.`;
  if (stage === 1) return {
    subject: `Your order is saved — ${o.title}`,
    html: shell(false, `Hi ${first}, your order isn't complete`, `You started ordering <b>${esc(o.title)}</b> but the payment didn't go through.<br>${help}`,
      { href: buyUrl(o), label: "Complete your order" }, "You got this because you started an order on ibrahimsaud.com. We send at most two reminders."),
  };
  return {
    subject: `Last reminder: ${o.title}`,
    html: shell(false, `${first}, a last reminder`, `Your order for <b>${esc(o.title)}</b> is still open. One payment and it's yours — Windows, Mac and Android, with free updates.<br>${help}`,
      { href: buyUrl(o), label: "Complete your order" }, "This is the last reminder about this order."),
  };
}

async function getCfg(): Promise<Cfg> {
  const rows = await rest("GET", "shop_settings?key=eq.cart_reminders&select=value") as { value: Cfg }[];
  return rows?.[0]?.value ?? {};
}
const setCfg = (v: Cfg) => rest("PATCH", "shop_settings?key=eq.cart_reminders", { value: v, updated_at: new Date().toISOString() }, "return=minimal");

async function run() {
  const cfg = await getCfg();
  if (!cfg.enabled || !cfg.enabled_at) return { skipped: "disabled" };
  const firstMs = (cfg.first_hours ?? 3) * 3600_000, secondMs = (cfg.second_days ?? 3) * 86400_000;
  const since = new Date(Math.max(Date.parse(cfg.enabled_at), Date.now() - WINDOW_DAYS * 86400_000)).toISOString();
  const open = await rest("GET", `shop_orders?status=in.(pending,failed,cancelled)&created_at=gte.${since}&select=id,sku,title,amount,buyer_name,buyer_email,status,pay_method,lang,created_at,remind1_at,remind2_at&order=created_at.desc&limit=500`) as Order[];
  const cand = open.filter((o) => o.pay_method !== "transfer");
  if (!cand.length) return { checked: 0, sent: 0 };
  const emails = [...new Set(cand.map((o) => o.buyer_email.toLowerCase()))];
  const list = emails.map((e) => `"${e.replace(/"/g, "")}"`).join(",");
  const paid = await rest("GET", `shop_orders?status=eq.paid&buyer_email=in.(${encodeURIComponent(list)})&select=buyer_email`) as { buyer_email: string }[];
  const paidSet = new Set(paid.map((p) => p.buyer_email.toLowerCase()));
  // كلّ طلبات البريد المفتوحة (لا المرشّحة فقط) — للتعليم على الكلّ
  const byEmail = new Map<string, Order[]>();
  for (const o of open) { const e = o.buyer_email.toLowerCase(); if (!byEmail.has(e)) byEmail.set(e, []); byEmail.get(e)!.push(o); }

  let sent = 0;
  const log: string[] = [];
  for (const e of emails) {
    if (sent >= MAX_PER_RUN) break;
    if (paidSet.has(e)) continue;
    const A = byEmail.get(e)!, L = A.filter((o) => o.pay_method !== "transfer")[0];
    if (!L || A.some((o) => o.remind2_at)) continue;
    const age = Date.now() - Date.parse(L.created_at);
    const had1 = A.some((o) => o.remind1_at);
    let stage: 1 | 2 | 0 = 0;
    if (age >= secondMs) stage = 2;
    else if (age >= firstMs && !had1) stage = 1;
    if (!stage) continue;
    const ids = A.map((o) => o.id).join(",");
    const now = new Date().toISOString();
    // نعلّم قبل الإرسال (شرط أنّ العمود فارغ) حتى لا يرسل تشغيلان متزامنان مرّتين
    const col = stage === 1 ? "remind1_at" : "remind2_at";
    const claimed = await rest("PATCH", `shop_orders?id=in.(${ids})&${col}=is.null`, stage === 2 && !had1 ? { remind1_at: now, remind2_at: now } : { [col]: now }, "return=representation") as Order[];
    if (!claimed?.length) continue;
    try {
      const m = email(L, stage);
      await sendEmail(L.buyer_email, m.subject, m.html);
      sent++; log.push(`${stage}:${L.id.slice(0, 8)}`);
    } catch (err) {
      console.error("shop-remind: send failed", L.id, String(err));
      await rest("PATCH", `shop_orders?id=in.(${ids})`, stage === 2 && !had1 ? { remind1_at: null, remind2_at: null } : { [col]: null }, "return=minimal");
    }
  }
  return { checked: emails.length, sent, log };
}

async function preview(b: Record<string, unknown>) {
  const cfg = await getCfg();
  if (cfg.last_preview && Date.now() - Date.parse(cfg.last_preview) < 60_000) return j({ error: "انتظر دقيقة قبل معاينة ثانية" }, 429);
  await setCfg({ ...cfg, last_preview: new Date().toISOString() });
  const sample: Order = { id: "preview", sku: "lessons-broadcast", title: "برنامج بث الدروس العلمية", amount: 299, buyer_name: "إبراهيم", buyer_email: OWNER, status: "pending", created_at: new Date().toISOString(), lang: String(b.lang || "ar") === "en" ? "en" : null };
  if (sample.lang === "en") sample.sku = "lessons-broadcast-en";
  for (const s of [1, 2] as const) { const m = email(sample, s); await sendEmail(OWNER, "[معاينة] " + m.subject, m.html); }
  return j({ ok: true, to: OWNER });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  try {
    if (b.action === "preview") return await preview(b);
    return j(await run());
  } catch (e) {
    console.error("shop-remind:", String(e));
    return j({ error: "حدث خطأ" }, 500);
  }
});
