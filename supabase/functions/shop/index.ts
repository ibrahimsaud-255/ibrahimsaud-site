// ╔══════════════════════════════════════════════════════════════════════╗
// ║  shop — Supabase Edge Function للمتجر الرقميّ (ibrahimsaud.com/shop/)  ║
// ║                                                                        ║
// ║  دالّة واحدة، الإجراء في `action` (بدن JSON) أو `?action=` في الرابط:   ║
// ║   checkout   {sku,name,email,phone?}   → ينشئ طلباً ورابط دفع تلر       ║
// ║   webhook    (تلر تناديه بعد الدفع)    → يتحقّق لدى تلر ويعلّم «مدفوع»  ║
// ║   order      {o,t,device}              → حالة الطلب وقائمة الملفّات      ║
// ║   otp-send   {o,t,device}              → رمز ٦ أرقام لبريد المشتري       ║
// ║   otp-verify {o,t,device,code}         → يوثّق جهازاً جديداً (٣ كحدّ)    ║
// ║   download   {o,t,device,fileId}       → رابط موقّع مدّته ٦٠ ثانية       ║
// ║                                                                        ║
// ║  تُنشر بلا تحقّق JWT (تلر وزوّار الصفحة ينادونها بلا جلسة):              ║
// ║     supabase functions deploy shop --no-verify-jwt                     ║
// ║  الأسرار: لا مفتاح تلر هنا (الدفع عبر خادم حروف) · RESEND_API_KEY ·    ║
// ║           RESEND_FROM (اختياريّ) · SHOP_SITE_URL · PAY_PROXY_URL         ║
// ║                                                                        ║
// ║  الأمان: السعر من shop_products لا من المتصفّح؛ الدفع يُفحص لدى تلر     ║
// ║  نفسها (order_ref) ويُطابَق المبلغ؛ رابط صفحة الشكر يحمل رمزاً تُخزَّن   ║
// ║  بصمته فقط (sha256)؛ التنزيل لجهاز موثّق فقط (أوّل جهاز يفتح الطلب      ║
// ║  المدفوع، ثمّ برمز على البريد حتى ٣ أجهزة)، بعدد محدود لكلّ ملفّ،       ║
// ║  وبرابط موقّع يموت بعد ٦٠ ثانية — فنسخ الرابط ونشره لا يفتح شيئاً.     ║
// ╚══════════════════════════════════════════════════════════════════════╝

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_CORS = { ...CORS, "Content-Type": "application/json" };
const j = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_CORS });

// ── البيئة ────────────────────────────────────────────────────────────────
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// تلر لا يقبل الطلبات إلا من IP مسجّل (خادم حروف 187.124.119.132)، ودوالّ Supabase
// بلا IP ثابت — فالإنشاء والفحص يمرّان عبر خادم حروف (routes/pay-proxy.ts هناك).
// مفتاح تلر لا يُحفظ هنا أصلاً.
const PAY_PROXY = (Deno.env.get("PAY_PROXY_URL") || "https://huroofduroos.com/api/pay/digital").replace(/\/$/, "");
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = Deno.env.get("RESEND_FROM") || "إبراهيم سعود <onboarding@resend.dev>";
const SITE = (Deno.env.get("SHOP_SITE_URL") || "https://ibrahimsaud.com").replace(/\/$/, "");
const SELF = `${SUPA_URL}/functions/v1/shop`;

const MAX_DEVICES = 3;
const OTP_TTL_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;
const SIGNED_URL_SECONDS = 60;
const MAX_CHECKS = 60; // سقف فحوص تلر لكلّ طلب (polling صفحة الشكر)

// ── أدوات ─────────────────────────────────────────────────────────────────
const svcHeaders = { apikey: SERVICE, Authorization: "Bearer " + SERVICE, "Content-Type": "application/json" };

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

async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

function randomToken(bytes = 24): string {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function otpCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function maskEmail(e: string): string {
  const [u, d] = e.split("@");
  if (!d) return e;
  return `${u.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, u.length - 2)))}@${d}`;
}

const isUuid = (s: unknown) => typeof s === "string" && /^[0-9a-f-]{36}$/i.test(s);
const isDevice = (s: unknown) => typeof s === "string" && s.length >= 16 && s.length <= 128;

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) throw new Error("RESEND_API_KEY غير مضبوط");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) throw new Error("resend " + r.status + ": " + (await r.text()).slice(0, 200));
}

// قالب إيميل بهويّة الموقع (أبيض بأسلوب آبل، أزرق ضوء الاستوديو)
function mail(title: string, body: string, cta?: { href: string; label: string }) {
  const btn = cta
    ? `<div style="margin:28px 0 8px"><a href="${esc(cta.href)}" style="background:#2F66FF;color:#fff;text-decoration:none;font-weight:bold;padding:13px 28px;border-radius:999px;display:inline-block">${esc(cta.label)}</a></div>`
    : "";
  return `<div dir="rtl" style="font-family:-apple-system,Tahoma,Arial,sans-serif;background:#F5F5F7;padding:32px 16px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;padding:34px 28px;color:#1D1D1F;text-align:right">
    <div style="font-size:13px;color:#6E6E73;font-weight:bold;margin-bottom:18px">إبراهيم سعود — المتجر</div>
    <h1 style="font-size:24px;line-height:1.4;margin:0 0 14px">${esc(title)}</h1>
    <div style="font-size:16px;line-height:1.9;color:#3A3A3C">${body}</div>
    ${btn}
    <p style="font-size:12px;color:#86868B;line-height:1.8;margin-top:26px;border-top:1px solid #E5E5EA;padding-top:16px">
      هذا الرابط خاصّ بك — لا تشاركه. التنزيل يعمل على أجهزتك الموثّقة فقط.<br>أيّ استفسار: ردّ على هذا الإيميل أو راسلني من ibrahimsaud.com
    </p>
  </div></div>`;
}

// ── أنواع ─────────────────────────────────────────────────────────────────
// url: ملفّ مستضاف خارج Supabase (مثل سيرفر حروف) — للملفّات الكبيرة فوق حدّ الخطّة المجّانيّة (٥٠ ميغا).
// المسار فيه مجلّد عشوائيّ طويل لا يُخمَّن، ولا يُرسل إلا للمشتري بعد التحقّق، ويتغيّر مع كل إصدار.
type FileRow = { id: string; name: string; path?: string; url?: string; size_bytes?: number };
type Product = { sku: string; slug: string; title: string; price_sar: number; active: boolean; files: FileRow[]; max_downloads: number };
type Order = {
  id: string; sku: string; title: string; amount: number; buyer_name: string; buyer_email: string; buyer_phone: string | null;
  status: "pending" | "paid" | "failed" | "cancelled"; telr_cart: string; telr_order_ref: string | null; telr_tran_ref: string | null;
  access_token_hash: string; email_token_hash: string | null; trusted_devices: string[]; otp_hash: string | null; otp_expires: string | null; otp_attempts: number;
  otp_sent_at: string | null; email_sent_at: string | null; check_count: number; created_at: string; updated_at?: string; paid_at: string | null;
};

async function getProduct(sku: string, activeOnly = true): Promise<Product | null> {
  const rows = await rest("GET", `shop_products?sku=eq.${encodeURIComponent(sku)}${activeOnly ? "&active=eq.true" : ""}&select=*`) as Product[];
  return rows?.[0] ?? null;
}

async function getOrder(id: string): Promise<Order | null> {
  const rows = await rest("GET", `shop_orders?id=eq.${id}&select=*`) as Order[];
  return rows?.[0] ?? null;
}

async function patchOrder(id: string, patch: Record<string, unknown>, extraFilter = "") {
  return await rest("PATCH", `shop_orders?id=eq.${id}${extraFilter}`, { ...patch, updated_at: new Date().toISOString() }, "return=representation") as Order[];
}

/** يتحقّق من رمز الرابط؛ يرجع الطلب أو null. */
async function authOrder(o: unknown, t: unknown): Promise<Order | null> {
  if (!isUuid(o) || typeof t !== "string" || t.length < 20 || t.length > 100) return null;
  const order = await getOrder(o as string);
  if (!order) return null;
  const h = await sha256(t);
  const ok = safeEqual(h, order.access_token_hash) || (!!order.email_token_hash && safeEqual(h, order.email_token_hash));
  return ok ? order : null;
}

// ── تلر (عبر خادم حروف) ─────────────────────────────────────────────────
async function proxy(path: string, body: unknown) {
  const r = await fetch(`${PAY_PROXY}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`proxy ${path} ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
  return d;
}

type Check = { status: "paid" | "pending" | "failed" | "cancelled"; amount: string | null; tranRef: string | null };

/** فحص الطلب لدى تلر بمرجعها (order_ref) — مرجع السلّة وحده لا تعرفه واجهة الفحص. */
async function telrCheck(order: Order): Promise<Check> {
  const d = await proxy("check", { cart: order.telr_cart, orderRef: order.telr_order_ref ?? undefined });
  const st = String(d?.status || "pending");
  const status: Check["status"] = st === "paid" || st === "failed" || st === "cancelled" ? st : "pending";
  return { status, amount: d?.amount ?? null, tranRef: d?.tranRef ?? null };
}

function thanksUrl(order: { id: string }, token: string) {
  return `${SITE}/shop/thanks/?o=${order.id}&t=${encodeURIComponent(token)}`;
}

/**
 * يفحص طلباً معلّقاً لدى تلر ويعلّمه مدفوعاً — idempotent: التحويل pending→paid
 * مشروط بالحالة في الاستعلام نفسه، فإيميل «طلبك جاهز» يُرسل مرّة واحدة مهما
 * تكرّر الـwebhook والـpolling.
 */
async function verifyAndMark(order: Order, force = false): Promise<Order> {
  // السقف يحمي من استطلاع صفحة الشكر بلا نهاية — لكنّ إشعار تلر يُفحص دائماً،
  // وإلا ضاع دفعٌ حقيقيّ وصل بعد أن استُنفد السقف.
  if (order.status === "paid" || (!force && order.check_count >= MAX_CHECKS)) return order;
  let c: Check;
  try {
    c = await telrCheck(order);
  } catch (e) {
    console.error("shop: telr check failed", order.id, String(e));
    return order;
  }
  await patchOrder(order.id, { check_count: order.check_count + 1 });

  if (c.status === "paid") {
    if (c.amount !== null && Number(c.amount) !== Number(order.amount)) {
      console.error("shop: amount mismatch — لا تفعيل", order.id, c.amount, order.amount);
      return order;
    }
    const now = new Date().toISOString();
    const moved = await patchOrder(order.id, {
      status: "paid", paid_at: now, telr_tran_ref: c.tranRef, paid_amount: c.amount ?? order.amount,
    }, "&status=neq.paid");
    if (moved?.length) await notifyPaid(moved[0]);
    return (await getOrder(order.id)) ?? order;
  }
  if ((c.status === "failed" || c.status === "cancelled") && order.status === "pending") {
    const rows = await patchOrder(order.id, { status: c.status }, "&status=eq.pending");
    return rows?.[0] ?? order;
  }
  return order;
}

/**
 * إيميل «طلبك جاهز». الرمز الخام لرابط صفحة الشكر لا نملكه (نخزّن بصمته فقط)،
 * فنُصدر للإيميل رمزاً ثانياً مستقلّاً ونخزّن بصمته في email_token_hash —
 * الرابطان صالحان معاً، ولا رمز خام في القاعدة.
 */
async function notifyPaid(order: Order) {
  if (order.email_sent_at) return;
  try {
    const token = randomToken();
    await patchOrder(order.id, { email_token_hash: await sha256(token) });
    const link = thanksUrl(order, token);
    await sendEmail(
      order.buyer_email,
      `طلبك جاهز — ${order.title}`,
      mail(
        `أهلاً ${order.buyer_name}، طلبك جاهز`,
        `وصلنا دفعك (${Number(order.amount).toLocaleString("ar-SA")} ريال) لـ<b>${esc(order.title)}</b>.<br>
         ملفّاتك تنتظرك في صفحة الطلب. احفظ هذا الإيميل — هو مفتاحك لتنزيلها لاحقاً.`,
        { href: link, label: "افتح ملفّاتك" },
      ),
    );
    await patchOrder(order.id, { email_sent_at: new Date().toISOString() });
  } catch (e) {
    console.error("shop: paid email failed", order.id, String(e));
  }
}

// ── الإجراءات ──────────────────────────────────────────────────────────────
async function checkout(b: Record<string, unknown>) {
  const sku = String(b.sku ?? "").trim();
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const phone = String(b.phone ?? "").trim().replace(/[^\d+]/g, "");
  if (!sku || name.length < 2 || name.length > 80) return j({ error: "اكتب اسمك" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return j({ error: "البريد غير صحيح" }, 400);
  if (phone && (phone.length < 9 || phone.length > 16)) return j({ error: "رقم الجوال غير صحيح" }, 400);

  const p = await getProduct(sku);
  if (!p) return j({ error: "المنتج غير متاح" }, 404);

  const id = crypto.randomUUID();
  const token = randomToken();
  const cart = `is-${Date.now().toString(36)}-${randomToken(4).replace(/[-_]/g, "x")}`;
  const amount = Number(p.price_sar).toFixed(2);

  await rest("POST", "shop_orders", {
    id, sku: p.sku, title: p.title, amount, buyer_name: name, buyer_email: email, buyer_phone: phone || null,
    telr_cart: cart, access_token_hash: await sha256(token),
  }, "return=minimal");

  let d: { url?: string; ref?: string | null; amount?: string };
  try {
    // الخادم يقرأ السعر من shop_products بنفسه ويفرض روابط العودة على صفحة الشكر.
    d = await proxy("create", { sku: p.sku, cart, orderId: id, token });
  } catch (e) {
    console.error("shop: telr create failed", String(e));
    await patchOrder(id, { status: "failed" });
    return j({ error: "تعذّر فتح صفحة الدفع، جرّب بعد قليل" }, 503);
  }
  if (!d?.url) {
    await patchOrder(id, { status: "failed" });
    return j({ error: "خطأ في بوابة الدفع، جرّب مرّة ثانية" }, 502);
  }
  if (d.amount && Number(d.amount) !== Number(amount)) {
    console.error("shop: price drift", amount, d.amount);
  }
  await patchOrder(id, { telr_order_ref: d.ref ?? null });
  return j({ url: d.url });
}

async function webhook(req: Request, b: Record<string, unknown>) {
  const cart = String(b.cart_id ?? b.ivp_cart ?? b.tran_cartid ?? "").trim();
  if (!cart) return j({ ok: false, reason: "missing cart" });
  const rows = await rest("GET", `shop_orders?telr_cart=eq.${encodeURIComponent(cart)}&select=*`) as Order[];
  const order = rows?.[0];
  if (!order) return j({ ok: false, reason: "unknown order" });
  console.log("shop: webhook", cart, req.headers.get("user-agent") ?? "");
  const after = await verifyAndMark(order, true);
  return j({ ok: true, status: after.status });
}

async function filesView(order: Order, p: Product | null) {
  const files = p?.files ?? [];
  const logs = await rest("GET", `shop_downloads?order_id=eq.${order.id}&select=file_id`) as { file_id: string }[];
  const used = (id: string) => logs.filter((l) => l.file_id === id).length;
  return files.map((f) => ({ id: f.id, name: f.name, size: f.size_bytes ?? 0, used: used(f.id), max: p?.max_downloads ?? 10 }));
}

async function orderAction(b: Record<string, unknown>) {
  let order = await authOrder(b.o, b.t);
  if (!order) return j({ error: "رابط الطلب غير صالح" }, 404);
  if (order.status === "pending") order = await verifyAndMark(order);

  const dev = isDevice(b.device) ? await sha256(String(b.device)) : null;
  let devices = Array.isArray(order.trusted_devices) ? order.trusted_devices : [];
  // أوّل جهاز يفتح الطلب المدفوع يصير موثّقاً تلقائيّاً (غالباً جهاز الدفع نفسه).
  if (order.status === "paid" && dev && devices.length === 0) {
    devices = [dev];
    await patchOrder(order.id, { trusted_devices: devices }, "&trusted_devices=eq.[]");
    devices = (await getOrder(order.id))?.trusted_devices ?? devices;
  }
  const trusted = !!dev && devices.includes(dev);
  const p = order.status === "paid" ? await getProduct(order.sku, false) : null;

  return j({
    id: order.id,
    status: order.status,
    title: order.title,
    sku: order.sku,
    amount: Number(order.amount),
    name: order.buyer_name,
    email: maskEmail(order.buyer_email),
    createdAt: order.created_at,
    paidAt: order.paid_at,
    trusted,
    needsVerify: order.status === "paid" && !trusted,
    devicesLeft: Math.max(0, MAX_DEVICES - devices.length),
    files: order.status === "paid" && trusted ? await filesView(order, p) : [],
  });
}

async function otpSend(b: Record<string, unknown>) {
  const order = await authOrder(b.o, b.t);
  if (!order || order.status !== "paid") return j({ error: "الطلب غير متاح" }, 404);
  if (!isDevice(b.device)) return j({ error: "جهاز غير معروف" }, 400);
  const dev = await sha256(String(b.device));
  if (order.trusted_devices.includes(dev)) return j({ ok: true, already: true });
  if (order.trusted_devices.length >= MAX_DEVICES)
    return j({ error: "وصل الطلب لحدّ ٣ أجهزة. راسلني وأفتح لك جهازاً جديداً." }, 403);
  if (order.otp_sent_at && Date.now() - new Date(order.otp_sent_at).getTime() < 60_000)
    return j({ error: "أرسلنا رمزاً قبل قليل — انتظر دقيقة قبل طلب رمز جديد" }, 429);

  const code = otpCode();
  await patchOrder(order.id, {
    otp_hash: await sha256(order.id + ":" + code),
    otp_expires: new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString(),
    otp_attempts: 0,
    otp_sent_at: new Date().toISOString(),
  });
  try {
    await sendEmail(order.buyer_email, `رمز فتح ملفّاتك: ${code}`, mail(
      "رمز التحقّق",
      `استخدم هذا الرمز لفتح ملفّات <b>${esc(order.title)}</b> على جهاز جديد:<br>
       <div style="font-size:34px;font-weight:bold;letter-spacing:8px;margin:18px 0;direction:ltr;text-align:center">${code}</div>
       صالح ${OTP_TTL_MIN} دقائق. إذا ما طلبته أنت تجاهل الإيميل.`,
    ));
  } catch (e) {
    console.error("shop: otp email failed", String(e));
    return j({ error: "تعذّر إرسال الرمز، جرّب بعد قليل" }, 502);
  }
  return j({ ok: true, to: maskEmail(order.buyer_email) });
}

async function otpVerify(b: Record<string, unknown>) {
  const order = await authOrder(b.o, b.t);
  if (!order || order.status !== "paid") return j({ error: "الطلب غير متاح" }, 404);
  if (!isDevice(b.device)) return j({ error: "جهاز غير معروف" }, 400);
  const code = String(b.code ?? "").replace(/\D/g, "");
  if (!order.otp_hash || !order.otp_expires || new Date(order.otp_expires).getTime() < Date.now())
    return j({ error: "الرمز انتهى — اطلب رمزاً جديداً" }, 400);
  if (order.otp_attempts >= OTP_MAX_ATTEMPTS) return j({ error: "محاولات كثيرة — اطلب رمزاً جديداً" }, 429);
  if (!safeEqual(await sha256(order.id + ":" + code), order.otp_hash)) {
    await patchOrder(order.id, { otp_attempts: order.otp_attempts + 1 });
    return j({ error: "الرمز غير صحيح" }, 400);
  }
  const dev = await sha256(String(b.device));
  const devices = order.trusted_devices.includes(dev) ? order.trusted_devices : [...order.trusted_devices, dev];
  if (devices.length > MAX_DEVICES) return j({ error: "وصل الطلب لحدّ ٣ أجهزة. راسلني وأفتح لك جهازاً جديداً." }, 403);
  await patchOrder(order.id, { trusted_devices: devices, otp_hash: null, otp_expires: null, otp_attempts: 0 });
  return j({ ok: true });
}

async function download(req: Request, b: Record<string, unknown>) {
  const order = await authOrder(b.o, b.t);
  if (!order || order.status !== "paid") return j({ error: "الطلب غير متاح" }, 404);
  if (!isDevice(b.device) || !order.trusted_devices.includes(await sha256(String(b.device))))
    return j({ error: "وثّق هذا الجهاز أوّلاً", needsVerify: true }, 403);
  const p = await getProduct(order.sku, false);
  const f = p?.files.find((x) => x.id === String(b.fileId ?? ""));
  if (!p || !f) return j({ error: "الملفّ غير موجود" }, 404);

  const logs = await rest("GET", `shop_downloads?order_id=eq.${order.id}&file_id=eq.${encodeURIComponent(f.id)}&select=id`) as unknown[];
  if (logs.length >= p.max_downloads)
    return j({ error: `استنفدت مرّات التنزيل (${p.max_downloads}) لهذا الملفّ — راسلني وأفتحها لك` }, 429);

  const log = () => rest("POST", "shop_downloads", {
    order_id: order.id, file_id: f.id,
    ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null,
    ua: (req.headers.get("user-agent") || "").slice(0, 300) || null,
  }, "return=minimal");
  // ملفّ مستضاف خارجيّاً (سيرفر حروف)
  if (f.url) { await log(); return j({ url: f.url }); }
  if (!f.path) return j({ error: "الملفّ غير جاهز بعد — راسلني" }, 502);
  const sign = await fetch(`${SUPA_URL}/storage/v1/object/sign/shop-files/${f.path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST", headers: svcHeaders, body: JSON.stringify({ expiresIn: SIGNED_URL_SECONDS }),
  });
  const s = await sign.json().catch(() => null) as { signedURL?: string } | null;
  if (!sign.ok || !s?.signedURL) {
    console.error("shop: sign failed", f.path, sign.status);
    return j({ error: "الملفّ غير جاهز بعد — راسلني" }, 502);
  }
  await log();
  const fname = f.path.split("/").pop() || "file";
  return j({ url: `${SUPA_URL}/storage/v1${s.signedURL}&download=${encodeURIComponent(fname)}`, expiresIn: SIGNED_URL_SECONDS });
}

/**
 * «استرجع طلبي»: يكتب المشتري إيميله فيصله رابط جديد لكل طلب مدفوع عليه.
 * الردّ واحد دائماً (ما نكشف هل الإيميل عندنا)، ومرّة كل دقيقتين لكل طلب.
 */
async function recover(b: Record<string, unknown>) {
  const email = String(b.email ?? "").trim().toLowerCase();
  const ok = j({ ok: true, message: "لو عندك طلب بهذا الإيميل، بيوصلك رابطه خلال دقيقة." });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return ok;
  // تطابق تامّ (eq) لا ilike — وإلا «%@gmail.com» يجيب طلبات غيره. الإيميل يُخزَّن بحروف صغيرة عند الشراء.
  const orders = await rest("GET", `shop_orders?buyer_email=eq.${encodeURIComponent(email)}&status=eq.paid&select=*&order=created_at.desc&limit=5`) as Order[];
  if (!orders.length) return ok;
  const fresh: { order: Order; link: string }[] = [];
  for (const o of orders) {
    if (o.updated_at && Date.now() - new Date(o.updated_at).getTime() < 120_000) continue;
    const token = randomToken();
    await patchOrder(o.id, { email_token_hash: await sha256(token) });
    fresh.push({ order: o, link: thanksUrl(o, token) });
  }
  if (!fresh.length) return ok;
  try {
    await sendEmail(orders[0].buyer_email, "روابط طلباتك", mail(
      `أهلاً ${orders[0].buyer_name}`,
      `هذي روابط طلباتك — تقدر تنزّل منها ملفّاتك وتحديثاتها في أيّ وقت:<br><br>` +
      fresh.map(x => `• <a href="${x.link}">${esc(x.order.title)}</a>`).join("<br>"),
      { href: fresh[0].link, label: "افتح طلبك" },
    ));
  } catch (e) { console.error("shop: recover email failed", String(e)); }
  return ok;
}

// ── الموزّع ────────────────────────────────────────────────────────────────
async function readBody(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) return (await req.json()) ?? {};
    const txt = await req.text();
    if (!txt) return {};
    if (txt.trim().startsWith("{")) return JSON.parse(txt);
    return Object.fromEntries(new URLSearchParams(txt));
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  const url = new URL(req.url);
  const b = await readBody(req);
  const action = String(url.searchParams.get("action") || b.action || "");
  try {
    switch (action) {
      case "checkout": return await checkout(b);
      case "webhook": return await webhook(req, b);
      case "order": return await orderAction(b);
      case "otp-send": return await otpSend(b);
      case "otp-verify": return await otpVerify(b);
      case "download": return await download(req, b);
      case "recover": return await recover(b);
      default: return j({ error: "unknown action" }, 400);
    }
  } catch (e) {
    console.error("shop:", action, String(e));
    // تلر تعيد المحاولة على غير ٢٠٠ — نردّ ٢٠٠ للـwebhook ونسجّل الخطأ.
    return action === "webhook" ? j({ ok: false }) : j({ error: "حدث خطأ، جرّب مرّة ثانية" }, 500);
  }
});
