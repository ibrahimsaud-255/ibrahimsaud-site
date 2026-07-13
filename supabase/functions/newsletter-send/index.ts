// ╔══════════════════════════════════════════════════════════════╗
// ║  newsletter-send — Supabase Edge Function                      ║
// ║  نظام الرسائل المتكامل. الإرسال عبر Resend، القراءة بمفتاح       ║
// ║  الخدمة (يتجاوز RLS). ثلاثة أوضاع حسب بدن الطلب:                ║
// ║   1) { testOnly:true, subject, contentHtml, coverUrl?, url? }  ║
// ║        → نسخة تجريبية للمالك فقط (يتطلّب تسجيل دخول).           ║
// ║   2) { campaignId }                                            ║
// ║        → إرسال حملة الآن (مسجَّل دخول أو نداء مجدوِل بالسرّ).      ║
// ║   3) { mode:"cron" }                                           ║
// ║        → معالجة كل الحملات المجدولة المستحقّة (نداء pg_cron).    ║
// ║  انشرها بالتحقّق من JWT (افتراضي). أوضاع cron تُصادَق بـ         ║
// ║  x-cron-secret == CRON_SECRET.                                 ║
// ╚══════════════════════════════════════════════════════════════╝

const RESEND_API = "https://api.resend.com/emails";
const CAMPAIGNS = "newsletter_campaigns";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  // supabase-js يضيف x-client-info و x-supabase-api-version تلقائياً؛
  // لازم تُسمح وإلا يحجب المتصفّح الطلب (Failed to send a request to the Edge Function).
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-supabase-api-version, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_CORS = { ...CORS, "Content-Type": "application/json" };

const j = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_CORS });

function esc(s: unknown) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

// قالب الإيميل الموحّد (هوية إبراهيم سعود) + تذييل إلغاء الاشتراك
function wrap(subject: string, contentHtml: string, unsubUrl: string, coverUrl?: string, url?: string) {
  const cover = coverUrl
    ? `<img src="${esc(coverUrl)}" alt="" style="width:100%;border-radius:12px;margin-bottom:18px">`
    : "";
  const cta = url
    ? `<div style="text-align:center;margin:26px 0 6px"><a href="${esc(url)}" style="background:#f5a623;color:#0a0a0b;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:10px;display:inline-block">اقرأ على الموقع</a></div>`
    : "";
  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0a0a0b;color:#f4f4f5;padding:28px;border-radius:14px;max-width:600px;margin:auto">
    <div style="text-align:center;color:#f5a623;font-weight:bold;letter-spacing:2px;font-size:13px;margin-bottom:14px">إبراهيم سعود — تقنية أعمال وبودكاست</div>
    <h1 style="font-size:22px;margin:0 0 16px;line-height:1.5">${esc(subject)}</h1>
    ${cover}
    <div style="font-size:15px;line-height:1.9;color:#e6e6ea">${contentHtml}</div>
    ${cta}
    <hr style="border:none;border-top:1px solid #26262b;margin:26px 0 14px">
    <p style="font-size:12px;color:#8a8a92;text-align:center;line-height:1.7">
      وصلك هذا الإيميل لأنك مشترك في قائمة إبراهيم سعود البريدية.<br>
      <a href="${esc(unsubUrl)}" style="color:#8a8a92">إلغاء الاشتراك</a>
    </p>
  </div>`;
}

async function sendEmail(key: string, from: string, to: string, subject: string, html: string) {
  const r = await fetch(RESEND_API, {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 200));
  return r.json();
}

// يتحقّق أن المستدعي مستخدم مسجَّل (role=authenticated) لا مجرّد anon
function isAuthenticated(req: Request): boolean {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const payload = JSON.parse(atob(tok.split(".")[1] || ""));
    return payload && payload.role === "authenticated";
  } catch {
    return false;
  }
}

// إعدادات البيئة (تُقرأ مرّة عند أول طلب)
const KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <onboarding@resend.dev>";
const ADMIN = Deno.env.get("ADMIN_EMAIL") || "ibrahimsaud25@gmail.com";
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
const UNSUB_BASE = `${SUPA_URL}/functions/v1/newsletter-unsub?t=`;

const svcHeaders = {
  apikey: SERVICE,
  Authorization: "Bearer " + SERVICE,
  "Content-Type": "application/json",
};

// PostgREST سريع
async function rest(method: string, path: string, body?: unknown, prefer?: string) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...svcHeaders, Prefer: prefer } : svcHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : null;
}

type Campaign = {
  id: string;
  subject: string;
  content_html: string;
  cover_url?: string | null;
  cta_url?: string | null;
};

// يرسل حملة واحدة لكل المشتركين النشطين. يفترض أن الحملة "محجوزة" (status=sending).
async function deliverCampaign(c: Campaign) {
  const subs = (await rest(
    "GET",
    `subscribers?select=email,unsub_token&unsubscribed=eq.false`,
  )) as { email: string; unsub_token: string }[];

  // إزالة التكرار حسب البريد
  const seen = new Set<string>();
  const list = subs.filter((s) => {
    const e = (s.email || "").trim().toLowerCase();
    if (!e || seen.has(e)) return false;
    seen.add(e);
    return true;
  });

  let sent = 0, failed = 0;
  const BATCH = 8;
  for (let i = 0; i < list.length; i += BATCH) {
    const slice = list.slice(i, i + BATCH);
    await Promise.all(slice.map(async (s) => {
      try {
        await sendEmail(
          KEY!,
          FROM,
          s.email,
          c.subject,
          wrap(c.subject, c.content_html, UNSUB_BASE + s.unsub_token, c.cover_url || undefined, c.cta_url || undefined),
        );
        sent++;
      } catch {
        failed++;
      }
    }));
    if (i + BATCH < list.length) await new Promise((r) => setTimeout(r, 1100));
  }

  // تحديث الحملة → تمّت
  await rest(
    "PATCH",
    `${CAMPAIGNS}?id=eq.${c.id}`,
    { status: "sent", sent_at: new Date().toISOString(), sent_count: sent, failed_count: failed, total_count: list.length, error: null },
    "return=minimal",
  );
  // سجل الإرسال (توافقية)
  try {
    await rest("POST", "newsletter_log", { subject: c.subject, sent, failed }, "return=minimal");
  } catch { /* تجاهل */ }

  return { sent, failed, total: list.length };
}

// يحجز حملة للمعالجة (يمنع الإرسال المزدوج). يعيد الصفّ إن نجح الحجز، وإلا null.
async function claim(campaignId: string): Promise<Campaign | null> {
  const rows = (await rest(
    "PATCH",
    // نحجز فقط ما كان مجدولاً أو مسودّة (لا نلمس sending/sent/canceled)
    `${CAMPAIGNS}?id=eq.${campaignId}&status=in.(scheduled,draft)`,
    { status: "sending", started_at: new Date().toISOString() },
    "return=representation",
  )) as Campaign[];
  return rows && rows.length ? rows[0] : null;
}

// معالجة حملة واحدة مع التقاط الأخطاء وتحديث الحالة
async function processCampaign(campaignId: string) {
  const c = await claim(campaignId);
  if (!c) return { id: campaignId, skipped: true };
  try {
    const res = await deliverCampaign(c);
    return { id: campaignId, ...res };
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e).slice(0, 300);
    await rest("PATCH", `${CAMPAIGNS}?id=eq.${campaignId}`, { status: "failed", error: msg }, "return=minimal")
      .catch(() => {});
    return { id: campaignId, error: msg };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("ok", { headers: CORS });

  if (!SUPA_URL || !SERVICE) return j({ error: "إعداد Supabase ناقص" }, 500);
  if (!KEY) return j({ error: "RESEND_API_KEY غير مضبوط" }, 500);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const mode = String(body.mode || "");
  const cronOk = !!CRON_SECRET && req.headers.get("x-cron-secret") === CRON_SECRET;
  const userOk = isAuthenticated(req);

  // ───── الوضع 3: المجدوِل (pg_cron) — يعالج المستحقّ ─────
  if (mode === "cron") {
    if (!cronOk) return j({ error: "غير مصرّح (cron)" }, 401);
    const nowIso = new Date().toISOString();
    // مجدولة حان وقتها + تعافٍ من العالقة في sending أكثر من 30 دقيقة
    const staleIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const due = (await rest(
      "GET",
      `${CAMPAIGNS}?select=id&or=(and(status.eq.scheduled,scheduled_at.lte.${encodeURIComponent(nowIso)}),and(status.eq.sending,started_at.lt.${encodeURIComponent(staleIso)}))&order=scheduled_at.asc&limit=5`,
    )) as { id: string }[];
    const results = [];
    for (const row of due) {
      // للعالقة: أعِدها scheduled ثم احجزها من جديد
      await rest("PATCH", `${CAMPAIGNS}?id=eq.${row.id}&status=eq.sending`, { status: "scheduled" }, "return=minimal")
        .catch(() => {});
      results.push(await processCampaign(row.id));
    }
    return j({ ok: true, processed: results.length, results });
  }

  // بقية الأوضاع تتطلّب تسجيل دخول (أو سرّ cron لنداء داخلي)
  if (!userOk && !cronOk) return j({ error: "غير مصرّح — سجّل الدخول" }, 401);

  // ───── الوضع 1: إرسال تجريبي للمالك ─────
  if (body.testOnly) {
    const subject = String(body.subject || "").trim();
    const contentHtml = String(body.contentHtml || "").trim();
    if (!subject || !contentHtml) return j({ error: "العنوان والمحتوى مطلوبان" }, 400);
    try {
      await sendEmail(
        KEY,
        FROM,
        ADMIN,
        subject,
        wrap(subject, contentHtml, UNSUB_BASE + "test", body.coverUrl ? String(body.coverUrl) : undefined, body.url ? String(body.url) : undefined),
      );
      return j({ ok: true, sent: 1, failed: 0, test: true });
    } catch (e) {
      return j({ error: String(e instanceof Error ? e.message : e) }, 500);
    }
  }

  // ───── الوضع 2: إرسال حملة الآن ─────
  const campaignId = body.campaignId ? String(body.campaignId) : "";
  if (campaignId) {
    const res = await processCampaign(campaignId);
    if (res.skipped) return j({ ok: true, skipped: true, note: "الحملة أُرسلت أو أُلغيت مسبقاً" });
    if (res.error) return j({ error: res.error }, 500);
    return j({ ok: true, ...res });
  }

  return j({ error: "طلب غير معروف — مرّر campaignId أو testOnly أو mode:cron" }, 400);
});
