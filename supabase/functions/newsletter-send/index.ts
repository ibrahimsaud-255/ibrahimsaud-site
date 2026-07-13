// ╔══════════════════════════════════════════════════════════════╗
// ║  newsletter-send — Supabase Edge Function                      ║
// ║  يُستدعى من النظام الداخلي لإرسال تدوينة/محتوى لكل المشتركين.   ║
// ║  الإرسال عبر Resend. القراءة بمفتاح الخدمة (يتجاوز RLS).        ║
// ║  انشرها بالتحقّق من JWT (افتراضي) حتى لا يستدعيها إلا مسجَّل.    ║
// ║  البدن: { subject, contentHtml, testOnly?, coverUrl?, url? }   ║
// ╚══════════════════════════════════════════════════════════════╝

const RESEND_API = "https://api.resend.com/emails";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  // supabase-js يضيف x-client-info و x-supabase-api-version تلقائياً؛
  // لازم تُسمح وإلا يحجب المتصفّح الطلب (Failed to send a request to the Edge Function).
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_CORS = { ...CORS, "Content-Type": "application/json" };

function esc(s: unknown) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

// قالب الإيميل الموحّد (هوية سَعي) + تذييل إلغاء الاشتراك
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("ok", { headers: CORS });

  if (!isAuthenticated(req)) {
    return new Response(JSON.stringify({ error: "غير مصرّح — سجّل الدخول" }), { status: 401, headers: JSON_CORS });
  }

  const KEY = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <onboarding@resend.dev>";
  const ADMIN = Deno.env.get("ADMIN_EMAIL") || "ibrahimsaud25@gmail.com";
  const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!KEY) return new Response(JSON.stringify({ error: "RESEND_API_KEY غير مضبوط" }), { status: 500, headers: JSON_CORS });

  const body = await req.json().catch(() => ({}));
  const subject = String(body.subject || "").trim();
  const contentHtml = String(body.contentHtml || "").trim();
  const coverUrl = body.coverUrl ? String(body.coverUrl) : undefined;
  const url = body.url ? String(body.url) : undefined;
  const testOnly = !!body.testOnly;
  if (!subject || !contentHtml) {
    return new Response(JSON.stringify({ error: "العنوان والمحتوى مطلوبان" }), { status: 400, headers: JSON_CORS });
  }

  const unsubBase = `${SUPA_URL}/functions/v1/newsletter-unsub?t=`;

  // إرسال تجريبي للمالك فقط
  if (testOnly) {
    try {
      await sendEmail(KEY, FROM, ADMIN, subject, wrap(subject, contentHtml, unsubBase + "test", coverUrl, url));
      return new Response(JSON.stringify({ ok: true, sent: 1, failed: 0, test: true }), { headers: JSON_CORS });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), { status: 500, headers: JSON_CORS });
    }
  }

  // جلب المشتركين (بمفتاح الخدمة)
  const res = await fetch(
    `${SUPA_URL}/rest/v1/subscribers?select=email,unsub_token&unsubscribed=eq.false`,
    { headers: { apikey: SERVICE, Authorization: "Bearer " + SERVICE } },
  );
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "تعذّر جلب المشتركين: " + res.status }), { status: 500, headers: JSON_CORS });
  }
  const subs = (await res.json()) as { email: string; unsub_token: string }[];

  let sent = 0, failed = 0;
  // دفعات صغيرة لتفادي حدود المعدّل
  const BATCH = 8;
  for (let i = 0; i < subs.length; i += BATCH) {
    const slice = subs.slice(i, i + BATCH);
    await Promise.all(slice.map(async (s) => {
      try {
        await sendEmail(KEY, FROM, s.email, subject, wrap(subject, contentHtml, unsubBase + s.unsub_token, coverUrl, url));
        sent++;
      } catch {
        failed++;
      }
    }));
    if (i + BATCH < subs.length) await new Promise((r) => setTimeout(r, 1100));
  }

  // سجل الإرسال
  try {
    await fetch(`${SUPA_URL}/rest/v1/newsletter_log`, {
      method: "POST",
      headers: { apikey: SERVICE, Authorization: "Bearer " + SERVICE, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ subject, sent, failed }),
    });
  } catch { /* تجاهل */ }

  return new Response(JSON.stringify({ ok: true, sent, failed, total: subs.length }), { headers: JSON_CORS });
});
