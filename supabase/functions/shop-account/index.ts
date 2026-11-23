// ╔══════════════════════════════════════════════════════════════════════╗
// ║  shop-account — «حسابي» في المتجر الرقميّ (ibrahimsaud.com/account/)   ║
// ║                                                                        ║
// ║   login-send   {email}             → رمز ٦ أرقام لمن عنده طلب مدفوع     ║
// ║   login-verify {email,code}        → جلسة موقّعة تبقى ٩٠ يوماً          ║
// ║   library      {session}           → كل مشترياته وآخر إصدار من ملفّاتها ║
// ║   download     {session,o,fileId}  → رابط تنزيل (نفس سقف المتجر وسجلّه) ║
// ║                                                                        ║
// ║  منفصلة عن دالّة «shop» (الدفع) عمداً: تقرأ جداولها فقط ولا تلمس الدفع.  ║
// ║  الدخول بلا كلمة مرور، والجلسة HMAC بمفتاح الخدمة (لا تُخزَّن). البرنامج  ║
// ║  نفسه يبقى بلا حساب ولا تفعيل — الحساب للموقع فقط.                       ║
// ║  الرموز في shop_logins (RLS بلا سياسات = الدالّة وحدها).                  ║
// ║     supabase functions deploy shop-account --no-verify-jwt              ║
// ╚══════════════════════════════════════════════════════════════════════╝

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const j = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <noreply@ibrahimsaud.com>";
const SITE = (Deno.env.get("SHOP_SITE_URL") || "https://ibrahimsaud.com").replace(/\/$/, "");

const OTP_TTL_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_DAYS = 90;
const SIGNED_URL_SECONDS = 60;

const svc = { apikey: SERVICE, Authorization: "Bearer " + SERVICE, "Content-Type": "application/json" };
async function rest(method: string, path: string, body?: unknown, prefer?: string) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method, headers: prefer ? { ...svc, Prefer: prefer } : svc,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : null;
}

const enc = new TextEncoder();
async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
const otpCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120;
const isUuid = (s: unknown) => typeof s === "string" && /^[0-9a-f-]{36}$/i.test(s);
const baseSku = (s: string) => s.split("@")[0];
function maskEmail(e: string) {
  const [u, d] = e.split("@");
  return d ? `${u.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, u.length - 2)))}@${d}` : e;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) throw new Error("RESEND_API_KEY غير مضبوط");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 200));
}
// نفس قالب إيميلات المتجر (أبيض بأسلوب آبل، أزرق ضوء الاستوديو)
const mail = (title: string, body: string) => `<div dir="rtl" style="font-family:-apple-system,Tahoma,Arial,sans-serif;background:#F5F5F7;padding:32px 16px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;padding:34px 28px;color:#1D1D1F;text-align:right">
    <div style="font-size:13px;color:#6E6E73;font-weight:bold;margin-bottom:18px">إبراهيم سعود — حسابي</div>
    <h1 style="font-size:24px;line-height:1.4;margin:0 0 14px">${esc(title)}</h1>
    <div style="font-size:16px;line-height:1.9;color:#3A3A3C">${body}</div>
    <p style="font-size:12px;color:#86868B;line-height:1.8;margin-top:26px;border-top:1px solid #E5E5EA;padding-top:16px">
      حسابك: <a href="${SITE}/account/" style="color:#2F66FF">${SITE.replace(/^https?:\/\//, "")}/account</a> — أيّ استفسار ردّ على هذا الإيميل.
    </p>
  </div></div>`;

// ── الجلسة: base64url(email|انتهاء).توقيع ─────────────────────────────────
const b64u = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
let HKEY: CryptoKey | null = null;
async function hmac(s: string) {
  HKEY ??= await crypto.subtle.importKey("raw", enc.encode("shop-session:" + SERVICE), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(new Uint8Array(await crypto.subtle.sign("HMAC", HKEY, enc.encode(s))));
}
async function makeSession(email: string) {
  const payload = b64u(enc.encode(`${email}|${Date.now() + SESSION_DAYS * 86400_000}`));
  return `${payload}.${await hmac(payload)}`;
}
async function readSession(tok: unknown): Promise<string | null> {
  if (typeof tok !== "string" || tok.length > 400) return null;
  const [payload, sig] = tok.split(".");
  if (!payload || !sig || !safeEqual(sig, await hmac(payload))) return null;
  try {
    const [email, exp] = atob(payload.replace(/-/g, "+").replace(/_/g, "/")).split("|");
    return Number(exp) > Date.now() && emailOk(email) ? email : null;
  } catch { return null; }
}

// ── البيانات ───────────────────────────────────────────────────────────────
type FileRow = { id: string; name: string; path?: string; url?: string; size_bytes?: number };
type Product = { sku: string; files: FileRow[]; max_downloads: number };
type Order = { id: string; sku: string; title: string; amount: number; buyer_name: string; buyer_email: string; status: string; paid_at: string | null; hold?: string | null };
type Login = { email: string; otp_hash: string | null; otp_expires: string | null; otp_attempts: number; otp_sent_at: string | null };

const paidOrdersOf = (email: string) =>
  rest("GET", `shop_orders?buyer_email=eq.${encodeURIComponent(email)}&status=eq.paid&select=id,sku,title,amount,buyer_name,buyer_email,status,paid_at,hold&order=paid_at.desc&limit=50`) as Promise<Order[]>;
async function getProduct(sku: string): Promise<Product | null> {
  return ((await rest("GET", `shop_products?sku=eq.${encodeURIComponent(sku)}&select=sku,files,max_downloads`)) as Product[])?.[0] ?? null;
}
const loginRow = async (email: string) =>
  ((await rest("GET", `shop_logins?email=eq.${encodeURIComponent(email)}&select=*`)) as Login[])?.[0];
const patchLogin = (email: string, patch: Record<string, unknown>) =>
  rest("PATCH", `shop_logins?email=eq.${encodeURIComponent(email)}`, patch, "return=minimal");

// ── الإجراءات ──────────────────────────────────────────────────────────────
async function loginSend(b: Record<string, unknown>) {
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!emailOk(email)) return j({ error: "البريد غير صحيح" }, 400);
  // الردّ نفسه لكل بريد صحيح — لا نكشف هل اشترى أم لا.
  const ok = j({ ok: true, to: maskEmail(email) });
  const row = await loginRow(email);
  if (row?.otp_sent_at && Date.now() - new Date(row.otp_sent_at).getTime() < 60_000)
    return j({ error: "أرسلنا رمزاً قبل قليل — انتظر دقيقة قبل طلب رمز جديد" }, 429);
  if (!(await paidOrdersOf(email)).length) return ok;
  const code = otpCode();
  await rest("POST", "shop_logins?on_conflict=email", {
    email, otp_hash: await sha256(email + ":" + code), otp_attempts: 0,
    otp_expires: new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString(), otp_sent_at: new Date().toISOString(),
  }, "resolution=merge-duplicates,return=minimal");
  try {
    await sendEmail(email, `رمز الدخول لحسابك: ${code}`, mail(
      "رمز الدخول",
      `استخدم هذا الرمز للدخول إلى «حسابي» — فيه كلّ مشترياتك وآخر إصدار من ملفّاتها:<br>
       <div style="font-size:34px;font-weight:bold;letter-spacing:8px;margin:18px 0;direction:ltr;text-align:center">${code}</div>
       صالح ${OTP_TTL_MIN} دقائق. إذا ما طلبته أنت تجاهل الإيميل.`,
    ));
  } catch (e) {
    console.error("shop-account: email failed", String(e));
    return j({ error: "تعذّر إرسال الرمز، جرّب بعد قليل" }, 502);
  }
  return ok;
}

async function loginVerify(b: Record<string, unknown>) {
  const email = String(b.email ?? "").trim().toLowerCase();
  const code = String(b.code ?? "").replace(/\D/g, "");
  if (!emailOk(email) || code.length !== 6) return j({ error: "الرمز غير صحيح" }, 400);
  const row = await loginRow(email);
  if (!row?.otp_hash || !row.otp_expires || new Date(row.otp_expires).getTime() < Date.now())
    return j({ error: "الرمز انتهى — اطلب رمزاً جديداً" }, 400);
  if (row.otp_attempts >= OTP_MAX_ATTEMPTS) return j({ error: "محاولات كثيرة — اطلب رمزاً جديداً" }, 429);
  if (!safeEqual(await sha256(email + ":" + code), row.otp_hash)) {
    await patchLogin(email, { otp_attempts: row.otp_attempts + 1 });
    return j({ error: "الرمز غير صحيح" }, 400);
  }
  await patchLogin(email, { otp_hash: null, otp_expires: null, otp_attempts: 0, last_login_at: new Date().toISOString() });
  return j({ ok: true, session: await makeSession(email), email: maskEmail(email) });
}

async function library(b: Record<string, unknown>) {
  const email = await readSession(b.session);
  if (!email) return j({ error: "انتهت الجلسة — ادخل من جديد", relogin: true }, 401);
  const orders = await paidOrdersOf(email);
  const ids = orders.map((o) => o.id);
  const logs = ids.length
    ? (await rest("GET", `shop_downloads?order_id=in.(${ids.join(",")})&select=order_id,file_id`)) as { order_id: string; file_id: string }[]
    : [];
  const products = new Map<string, Product | null>();
  const out = [];
  for (const o of orders) {
    const sku = baseSku(o.sku);
    if (!products.has(sku)) products.set(sku, await getProduct(sku));
    const p = products.get(sku);
    const hold = !!o.hold;
    out.push({
      id: o.id, sku, title: o.title, amount: Number(o.amount), paidAt: o.paid_at, hold,
      files: hold ? [] : (p?.files ?? []).map((f) => ({
        id: f.id, name: f.name, size: f.size_bytes ?? 0, max: p?.max_downloads ?? 10,
        used: logs.filter((l) => l.order_id === o.id && l.file_id === f.id).length,
      })),
    });
  }
  return j({ email: maskEmail(email), name: orders[0]?.buyer_name ?? "", orders: out });
}

async function download(req: Request, b: Record<string, unknown>) {
  const email = await readSession(b.session);
  if (!email) return j({ error: "انتهت الجلسة — ادخل من جديد", relogin: true }, 401);
  if (!isUuid(b.o)) return j({ error: "الطلب غير متاح" }, 404);
  const order = ((await rest("GET", `shop_orders?id=eq.${b.o}&select=id,sku,status,buyer_email,hold`)) as Order[])?.[0];
  if (!order || order.status !== "paid" || order.buyer_email !== email) return j({ error: "الطلب غير متاح" }, 404);
  if (order.hold) return j({ error: "طلبك قيد المراجعة — راسلني ونرتّبه لك" }, 403);
  const p = await getProduct(baseSku(order.sku));
  const f = p?.files.find((x) => x.id === String(b.fileId ?? ""));
  if (!p || !f) return j({ error: "الملفّ غير موجود" }, 404);

  const used = (await rest("GET", `shop_downloads?order_id=eq.${order.id}&file_id=eq.${encodeURIComponent(f.id)}&select=id`)) as unknown[];
  if (used.length >= p.max_downloads)
    return j({ error: `استنفدت مرّات التنزيل (${p.max_downloads}) لهذا الملفّ — راسلني وأفتحها لك` }, 429);
  const log = () => rest("POST", "shop_downloads", {
    order_id: order.id, file_id: f.id,
    ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null,
    ua: ("account · " + (req.headers.get("user-agent") || "")).slice(0, 300),
  }, "return=minimal");
  if (f.url) { await log(); return j({ url: f.url }); }
  if (!f.path) return j({ error: "الملفّ غير جاهز بعد — راسلني" }, 502);
  const sign = await fetch(`${SUPA_URL}/storage/v1/object/sign/shop-files/${f.path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST", headers: svc, body: JSON.stringify({ expiresIn: SIGNED_URL_SECONDS }),
  });
  const s = await sign.json().catch(() => null) as { signedURL?: string } | null;
  if (!sign.ok || !s?.signedURL) return j({ error: "الملفّ غير جاهز بعد — راسلني" }, 502);
  await log();
  const fname = f.path.split("/").pop() || "file";
  return j({ url: `${SUPA_URL}/storage/v1${s.signedURL}&download=${encodeURIComponent(fname)}` });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = String(b.action || "");
  try {
    switch (action) {
      case "login-send": return await loginSend(b);
      case "login-verify": return await loginVerify(b);
      case "library": return await library(b);
      case "download": return await download(req, b);
      default: return j({ error: "unknown action" }, 400);
    }
  } catch (e) {
    console.error("shop-account:", action, String(e));
    return j({ error: "حدث خطأ، جرّب مرّة ثانية" }, 500);
  }
});
