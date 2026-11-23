// ╔══════════════════════════════════════════════════════════════════════╗
// ║  shop-mail — إيميلات القمع غير الآنيّة                                  ║
// ║                                                                        ║
// ║   seq-run        (pg_cron: kit-seq-hourly) سلسلة «قائمة تجهيز المسجد»    ║
// ║                  ٧ إيميلات يوماً بيوم — لا تفعل شيئاً وهي مطفأة          ║
// ║                  (shop_settings.kit_sequence.enabled)، وللمشتركين بعد     ║
// ║                  enabled_at فقط، وتتوقّف لمن ألغى أو اشترى.               ║
// ║   seq-preview    → الإيميلات السبعة لبريد المالك فقط                      ║
// ║   update-preview {sku}  (المالك) → إعلان التحديث لبريده فقط               ║
// ║   update-send    {sku}  (المالك) → لكلّ مشتري المنتج (مرّة لكل إصدار)      ║
// ║                                                                        ║
// ║  «المالك» = جلسة Supabase ببريد المالك في ترويسة Authorization.          ║
// ║     supabase functions deploy shop-mail --no-verify-jwt                 ║
// ╚══════════════════════════════════════════════════════════════════════╝

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-user-token", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <noreply@ibrahimsaud.com>";
const SITE = "https://ibrahimsaud.com";
const OWNER = "ibrahimsaud25@gmail.com";
const WA = "966504895213";
const UNSUB = `${SUPA_URL}/functions/v1/newsletter-unsub?t=`;

const svc = { apikey: SERVICE, Authorization: "Bearer " + SERVICE, "Content-Type": "application/json" };
async function rest(method: string, path: string, body?: unknown, prefer?: string) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method, headers: prefer ? { ...svc, Prefer: prefer } : svc, body: body !== undefined ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) throw new Error("RESEND_API_KEY غير مضبوط");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 200));
}

function shell(title: string, body: string, cta: { href: string; label: string } | null, foot: string) {
  return `<div dir="rtl" style="font-family:-apple-system,Tahoma,Arial,sans-serif;background:#F5F5F7;padding:32px 16px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;padding:34px 28px;color:#1D1D1F;text-align:right">
    <div style="font-size:13px;color:#6E6E73;font-weight:bold;margin-bottom:18px">إبراهيم سعود</div>
    <h1 style="font-size:24px;line-height:1.4;margin:0 0 14px">${esc(title)}</h1>
    <div style="font-size:16px;line-height:1.9;color:#3A3A3C">${body}</div>
    ${cta ? `<div style="margin:28px 0 8px"><a href="${esc(cta.href)}" style="background:#2F66FF;color:#fff;text-decoration:none;font-weight:bold;padding:13px 28px;border-radius:999px;display:inline-block">${esc(cta.label)}</a></div>` : ""}
    <p style="font-size:12px;color:#86868B;line-height:1.8;margin-top:26px;border-top:1px solid #E5E5EA;padding-top:16px">${foot}</p>
  </div></div>`;
}

// ── سلسلة «قائمة تجهيز المسجد لبث الدروس» — ٧ إيميلات (اليوم ٠ … ٦) ──────────
// المحتوى من مقالة تجهيز المسجد وصفحة البرنامج — لا ادّعاءات خارجها.
const PRODUCT = `${SITE}/lessons-broadcast/`;
const ul = (xs: string[]) => `<ul style="padding-right:20px;margin:10px 0">${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const SEQ: { subject: string; title: string; body: string; cta: { href: string; label: string } }[] = [
  {
    subject: "قائمتك جاهزة: تجهيز المسجد لبث الدروس",
    title: "قائمتك جاهزة للطباعة",
    body: `هذي قائمة تجهيز المسجد لبثّ الدروس: المعدّات بثلاثة مستويات، وفحص قبل الدرس بربع ساعة، وورقة تشغيل تلصقها على باب غرفة الإعلام.<br><br>
      أهمّ قاعدة فيها: <b>الصوت أوّلاً، ثمّ الإنترنت، ثمّ الصورة</b>. المشاهد يتحمّل صورة متوسّطة، لكنّه يقفل البثّ إذا كان الصوت فيه صدى.<br><br>
      في الأيّام الجاية أرسل لك كلّ يوم نقطة وحدة من تجربتي في بثّ الدروس.`,
    cta: { href: `${SITE}/lessons-broadcast/kit/?k=1`, label: "افتح القائمة" },
  },
  {
    subject: "٣ أخطاء تخرّب بثّ الدرس",
    title: "٣ أخطاء تخرّب بثّ الدرس",
    body: `${ul([
      "<b>المايك بعيد عن الشيخ:</b> مايك الجوّال أو الكاميرا يلتقط صدى المسجد كلّه. الحلّ: مايك لاسلكيّ صغير يُشبك على الثوب.",
      "<b>الإنترنت بسرعة التنزيل لا الرفع:</b> البثّ يحتاج سرعة <b>رفع</b> — نحو ٦ ميغابت لكل منصّة بجودة Full HD. واختبره والمسجد ممتلئ، لا وقت الفراغ.",
      "<b>الكتاب ما يبان:</b> الطالب البعيد يسمع «انظر للسطر الثالث» وما يشوف شيئاً.",
    ])}الأوّل والثاني تحلّهم المعدّات، والثالث يحلّه البرنامج.`,
    cta: { href: PRODUCT, label: "شوف كيف يظهر الكتاب" },
  },
  {
    subject: "ليش سوّيت برنامج بث الدروس؟",
    title: "طلبتوه… فسوّيته",
    body: `نزّلت مقطعاً عن بثّ دروس المساجد، وجاب أكثر من ١٠٠ تعليق بنفس الطلب: «نبي الطريقة».<br><br>
      الطريقة المعتادة فريق تصوير ومونتير وبرامج بثّ معقّدة — وهذا ما يتوفّر لكلّ مسجد أو جمعيّة. فبدل ما أعقّدكم في الربط والتقنية، سوّيت برنامجاً جاهزاً: تختار الكتاب، تكتب اسم الشيخ، وتضغط «بثّ مباشر».`,
    cta: { href: PRODUCT, label: "شوف البرنامج" },
  },
  {
    subject: "الكتاب في الشاشة — ليش يفرق؟",
    title: "الطالب البعيد يقرأ مع الشيخ",
    body: `في درس شرح المتون، نصف الفائدة في متابعة النصّ. لمّا تظهر صفحة الكتاب بجانب الشيخ، الطالب في بيته يتابع سطراً سطراً كأنّه في الحلقة.<br><br>
      في البرنامج: <b>المكتبة الشاملة داخله</b> (أكثر من ٨٥٠٠ كتاب) بصفحات الطبعة المصوّرة أو نصّاً مرتّباً، وشريط ذهبيّ يمشي مع القارئ، والتكبير على الصفحة بضغطة — وأيّ كتاب PDF من جهازك.`,
    cta: { href: `${PRODUCT}#inside`, label: "وش بالداخل؟" },
  },
  {
    subject: "صوت المسجد في البثّ: الطريقتان",
    title: "صوت نقيّ بدون صدى",
    body: `${ul([
      "<b>مايك لاسلكيّ للشيخ</b> (وآخر للقارئ في شرح المتون) — أسهل حلّ ويلتقط الصوت واضحاً مهما كان صدى المسجد.",
      "<b>أو خطّ من مكسر المسجد</b> إلى جهاز البثّ عبر كرت صوت صغير — من المكسر لا من السمّاعات حتى ما يدخل الصدى.",
    ])}وبعدها تبقى أصوات المكيّفات والحركة: البرنامج فيه تنقية الضوضاء وتسوية الصوت جاهزة بدون إعدادات، ومايك مستقلّ للقارئ.`,
    cta: { href: PRODUCT, label: "شوف البرنامج" },
  },
  {
    subject: "جهازنا قديم؟ ما عندنا تقنيّ؟",
    title: "أسئلة تتكرّر قبل البداية",
    body: `${ul([
      "<b>الجهاز:</b> لجودة Full HD يكفي ويندوز ١٠ أو ١١ بمعالج Core i5 الجيل الثامن فما فوق، أو ماك M1، وذاكرة ٨ جيجا. وأندرويد ٨ فما فوق على الجوّال.",
      "<b>ما عندنا تقنيّ:</b> البرنامج عربيّ وأزراره كبيرة: تختار الكتاب، تكتب اسم الشيخ، وتضغط «بثّ مباشر».",
      "<b>نبي نسجّل بدون بثّ:</b> تضغط «تسجيل» بدل «بثّ مباشر» فيُحفظ الدرس كاملاً على جهازك.",
    ])}`,
    cta: { href: `${PRODUCT}#specs`, label: "المتطلّبات كاملة" },
  },
  {
    subject: "برنامج بث الدروس العلمية — دفعة واحدة",
    title: "جاهز تبدأ؟",
    body: `«برنامج بث الدروس العلمية»: الشيخ والكتاب في الشاشة، والمكتبة الشاملة داخله، ويوتيوب وفيسبوك وتيليجرام معاً — من جهاز واحد، بدون فريق تصوير.
      ${ul(["دفعة واحدة وتملكه — بلا اشتراك", "ويندوز وماك وأندرويد من نفس الطلب (الآيفون تطبيق منفصل في App Store)", "التحديثات مجّاناً من «حسابي»"])}
      وأيّ سؤال قبل الشراء: <a href="https://wa.me/${WA}?text=${encodeURIComponent("السلام عليكم، عندي سؤال عن برنامج بث الدروس")}" style="color:#2F66FF">راسلني على واتساب</a>.`,
    cta: { href: `${PRODUCT}#buy`, label: "اشترِ البرنامج" },
  },
];
const seqFoot = (token?: string) => `وصلك هذا لأنّك أخذت «قائمة تجهيز المسجد لبث الدروس» من ibrahimsaud.com.${token ? ` <a href="${UNSUB}${encodeURIComponent(token)}" style="color:#86868B">إلغاء الاشتراك</a>` : ""}`;

type Cfg = { enabled?: boolean; enabled_at?: string | null; last_preview?: string | null };
type Sub = { id: string; email: string; name: string | null; unsub_token: string; unsubscribed: boolean; created_at: string; seq_step: number; seq_at: string | null };
const getSetting = async <T,>(key: string): Promise<T> => ((await rest("GET", `shop_settings?key=eq.${key}&select=value`)) as { value: T }[])?.[0]?.value ?? ({} as T);
const setSetting = (key: string, v: unknown) => rest("PATCH", `shop_settings?key=eq.${key}`, { value: v, updated_at: new Date().toISOString() }, "return=minimal");

async function seqRun() {
  const cfg = await getSetting<Cfg>("kit_sequence");
  if (!cfg.enabled || !cfg.enabled_at) return { skipped: "disabled" };
  const subs = await rest("GET", `subscribers?source=eq.lb-kit&unsubscribed=eq.false&seq_step=lt.${SEQ.length}&created_at=gte.${encodeURIComponent(cfg.enabled_at)}&select=id,email,name,unsub_token,unsubscribed,created_at,seq_step,seq_at&order=created_at.asc&limit=200`) as Sub[];
  if (!subs.length) return { checked: 0, sent: 0 };
  const list = subs.map((s) => `"${s.email.replace(/"/g, "")}"`).join(",");
  const buyers = new Set((await rest("GET", `shop_orders?status=eq.paid&buyer_email=in.(${encodeURIComponent(list)})&select=buyer_email`) as { buyer_email: string }[]).map((o) => o.buyer_email.toLowerCase()));
  let sent = 0;
  for (const s of subs) {
    if (sent >= 40) break;
    if (buyers.has(s.email.toLowerCase())) { await rest("PATCH", `subscribers?id=eq.${s.id}`, { seq_step: SEQ.length }, "return=minimal"); continue; } // اشترى: تتوقّف السلسلة
    const due = Date.parse(s.created_at) + s.seq_step * 86400_000; // الإيميل n بعد n يوماً من الاشتراك
    if (Date.now() < due) continue;
    if (s.seq_at && Date.now() - Date.parse(s.seq_at) < 20 * 3600_000) continue; // لا إيميلين في نفس اليوم
    const claimed = await rest("PATCH", `subscribers?id=eq.${s.id}&seq_step=eq.${s.seq_step}`, { seq_step: s.seq_step + 1, seq_at: new Date().toISOString() }, "return=representation") as Sub[];
    if (!claimed?.length) continue;
    const m = SEQ[s.seq_step];
    try {
      await sendEmail(s.email, m.subject, shell(s.seq_step === 0 && s.name ? `أهلاً ${s.name.split(/\s+/)[0]}، ${m.title}` : m.title, m.body, m.cta, seqFoot(s.unsub_token)));
      sent++; await sleep(150);
    } catch (e) {
      console.error("shop-mail: seq send failed", s.id, String(e));
      await rest("PATCH", `subscribers?id=eq.${s.id}`, { seq_step: s.seq_step, seq_at: s.seq_at }, "return=minimal");
    }
  }
  return { checked: subs.length, sent };
}

async function seqPreview() {
  const cfg = await getSetting<Cfg>("kit_sequence");
  if (cfg.last_preview && Date.now() - Date.parse(cfg.last_preview) < 120_000) return j({ error: "انتظر دقيقتين قبل معاينة ثانية" }, 429);
  await setSetting("kit_sequence", { ...cfg, last_preview: new Date().toISOString() });
  for (let i = 0; i < SEQ.length; i++) { const m = SEQ[i]; await sendEmail(OWNER, `[معاينة ${i + 1}/${SEQ.length}] ${m.subject}`, shell(m.title, m.body, m.cta, seqFoot())); await sleep(200); }
  return j({ ok: true, to: OWNER, count: SEQ.length });
}

// ── إعلان تحديث لمشتري منتج (المالك فقط) ────────────────────────────────────
async function isOwner(req: Request) {
  const tok = (req.headers.get("x-user-token") || "").trim();
  if (!tok) return false;
  const r = await fetch(`${SUPA_URL}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: "Bearer " + tok } });
  if (!r.ok) return false;
  const u = await r.json().catch(() => ({})) as { email?: string };
  return (u.email || "").toLowerCase() === OWNER;
}
type Product = { sku: string; title: string; version: string | null; changelog: string | null };
function updateMail(p: Product, name: string) {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  const items = (p.changelog || "").split(/\n+/).map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  return {
    subject: `تحديث جديد${p.version ? " " + p.version : ""} — ${p.title}`,
    html: shell(`أهلاً ${first}، نزل تحديث جديد`, `نزل إصدار جديد من <b>${esc(p.title)}</b>${p.version ? ` (<span dir="ltr">${esc(p.version)}</span>)` : ""}، مجّاناً لنسختك.${items.length ? `<br><br><b>وش الجديد:</b>${ul(items.map(esc))}` : ""}
      <br>نزّله من «حسابي»: تدخل ببريدك ويوصلك رمز، وتلقى آخر إصدار لكلّ أجهزتك.`,
      { href: `${SITE}/account/`, label: "نزّل التحديث من حسابي" }, "وصلك هذا لأنّك اشتريت هذا المنتج من ibrahimsaud.com."),
  };
}
async function updateAction(req: Request, b: Record<string, unknown>, send: boolean) {
  if (!(await isOwner(req))) return j({ error: "للمالك فقط" }, 403);
  const sku = String(b.sku || "").split("@")[0];
  const p = ((await rest("GET", `shop_products?sku=eq.${encodeURIComponent(sku)}&select=sku,title,version,changelog`)) as Product[])?.[0];
  if (!p) return j({ error: "المنتج غير موجود" }, 404);
  if (!p.version) return j({ error: "اكتب رقم الإصدار في بطاقة المنتج أوّلاً" }, 400);
  if (!send) { const m = updateMail(p, "إبراهيم"); await sendEmail(OWNER, "[معاينة] " + m.subject, m.html); return j({ ok: true, to: OWNER }); }
  const log = await getSetting<{ sent?: { sku: string; version: string; at: string; count: number }[] }>("update_mail");
  if ((log.sent || []).some((x) => x.sku === sku && x.version === p.version) && !b.force)
    return j({ error: `أرسلت إعلان الإصدار ${p.version} من قبل`, already: true }, 409);
  // مشترو هذا المنتج بالضبط وفئاته السعريّة (sku و sku@tN) — النسخ الأخرى (‎-en/-ru) لها بطاقتها وإعلانها بلغتها.
  // بريد واحد مرّة واحدة، بلا طلبات «مراجعة».
  const orFilter = encodeURIComponent(`(sku.eq.${sku},sku.like.${sku}@*)`);
  const orders = await rest("GET", `shop_orders?status=eq.paid&hold=is.null&or=${orFilter}&select=buyer_email,buyer_name&order=paid_at.asc&limit=5000`) as { buyer_email: string; buyer_name: string }[];
  const seen = new Map<string, string>();
  for (const o of orders) { const e = o.buyer_email.toLowerCase(); if (!seen.has(e)) seen.set(e, o.buyer_name); }
  let count = 0, failed = 0;
  for (const [e, n] of seen) {
    try { const m = updateMail(p, n); await sendEmail(e, m.subject, m.html); count++; } catch (err) { failed++; console.error("shop-mail: update send failed", String(err)); }
    await sleep(150);
  }
  await setSetting("update_mail", { sent: [...(log.sent || []), { sku, version: p.version, at: new Date().toISOString(), count }] });
  return j({ ok: true, count, failed });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  try {
    switch (b.action) {
      case "seq-preview": return await seqPreview();
      case "update-preview": return await updateAction(req, b, false);
      case "update-send": return await updateAction(req, b, true);
      default: return j(await seqRun());
    }
  } catch (e) {
    console.error("shop-mail:", String(e));
    return j({ error: "حدث خطأ" }, 500);
  }
});
