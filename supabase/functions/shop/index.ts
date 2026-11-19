// ╔══════════════════════════════════════════════════════════════════════╗
// ║  shop — Supabase Edge Function للمتجر الرقميّ (ibrahimsaud.com/shop/)  ║
// ║                                                                        ║
// ║  دالّة واحدة، الإجراء في `action` (بدن JSON) أو `?action=` في الرابط:   ║
// ║   checkout   {sku,name,email,phone?,country?} → طلب ورابط دفع تلر       ║
// ║   webhook    (تلر تناديه بعد الدفع)    → يتحقّق لدى تلر ويعلّم «مدفوع»  ║
// ║   order      {o,t,device}              → حالة الطلب وقائمة الملفّات      ║
// ║   otp-send   {o,t,device}              → رمز ٦ أرقام لبريد المشتري       ║
// ║   otp-verify {o,t,device,code}         → يوثّق جهازاً جديداً (٣ كحدّ)    ║
// ║   download   {o,t,device,fileId}       → رابط موقّع مدّته ٦٠ ثانية       ║
// ║   transfer   {sku,name,email,phone?}   → طلب «بالتحويل» بانتظار الاعتماد  ║
// ║   transfer-notify {id}                 → بعد اعتماده من اللوحة: الرابط   ║
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

// نسختا روسيا والإنجليزيّة (sku ينتهي بـ -ru / -en): الإيميلات وصفحة الطلب بلغتها.
type Lang = "ar" | "ru" | "en";
const langOf = (sku?: string | null): Lang => {
  const m = sku ? /-(ru|en)(@|$)/.exec(sku) : null;
  return m ? (m[1] as Lang) : "ar";
};
const MAIL_UI = {
  ru: { head: "Ibrahim Saud — Store", foot: "Эта ссылка личная — не делитесь ею. Скачивание работает только на ваших подтверждённых устройствах.<br>Вопросы: ответьте на это письмо или напишите мне через ibrahimsaud.com" },
  en: { head: "Ibrahim Saud — Store", foot: "This link is yours — don't share it. Downloads work only on your verified devices.<br>Questions: reply to this email or message me from ibrahimsaud.com" },
  ar: { head: "إبراهيم سعود — المتجر", foot: "هذا الرابط خاصّ بك — لا تشاركه. التنزيل يعمل على أجهزتك الموثّقة فقط.<br>أيّ استفسار: ردّ على هذا الإيميل أو راسلني من ibrahimsaud.com" },
};

// قالب إيميل بهويّة الموقع (أبيض بأسلوب آبل، أزرق ضوء الاستوديو)
function mail(title: string, body: string, cta?: { href: string; label: string }, lang: Lang = "ar") {
  const ui = MAIL_UI[lang], ltr = lang !== "ar";
  const btn = cta
    ? `<div style="margin:28px 0 8px"><a href="${esc(cta.href)}" style="background:#2F66FF;color:#fff;text-decoration:none;font-weight:bold;padding:13px 28px;border-radius:999px;display:inline-block">${esc(cta.label)}</a></div>`
    : "";
  return `<div dir="${ltr ? "ltr" : "rtl"}" style="font-family:-apple-system,Tahoma,Arial,sans-serif;background:#F5F5F7;padding:32px 16px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;padding:34px 28px;color:#1D1D1F;text-align:${ltr ? "left" : "right"}">
    <div style="font-size:13px;color:#6E6E73;font-weight:bold;margin-bottom:18px">${ui.head}</div>
    <h1 style="font-size:24px;line-height:1.4;margin:0 0 14px">${esc(title)}</h1>
    <div style="font-size:16px;line-height:1.9;color:#3A3A3C">${body}</div>
    ${btn}
    <p style="font-size:12px;color:#86868B;line-height:1.8;margin-top:26px;border-top:1px solid #E5E5EA;padding-top:16px">
      ${ui.foot}
    </p>
  </div></div>`;
}

// ── أنواع ─────────────────────────────────────────────────────────────────
// url: ملفّ مستضاف خارج Supabase (مثل سيرفر حروف) — للملفّات الكبيرة فوق حدّ الخطّة المجّانيّة (٥٠ ميغا).
// المسار فيه مجلّد عشوائيّ طويل لا يُخمَّن، ولا يُرسل إلا للمشتري بعد التحقّق، ويتغيّر مع كل إصدار.
type FileRow = { id: string; name: string; path?: string; url?: string; size_bytes?: number };
type Product = { sku: string; slug: string; title: string; price_sar: number; active: boolean; files: FileRow[]; max_downloads: number; regional?: Record<string, string> };
type Order = {
  id: string; sku: string; title: string; amount: number; buyer_name: string; buyer_email: string; buyer_phone: string | null;
  status: "pending" | "paid" | "failed" | "cancelled"; telr_cart: string; telr_order_ref: string | null; telr_tran_ref: string | null;
  access_token_hash: string; email_token_hash: string | null; trusted_devices: string[]; otp_hash: string | null; otp_expires: string | null; otp_attempts: number;
  otp_sent_at: string | null; email_sent_at: string | null; check_count: number; created_at: string; updated_at?: string; paid_at: string | null;
  buyer_country?: string | null; ip_country?: string | null; card_country?: string | null; hold?: string | null; pay_method?: "telr" | "transfer"; lang?: string | null;
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

// ── السعر حسب بلد الزائر (غير معلَن) ─────────────────────────────────────
// المنتج الأساسيّ يحمل regional: { "EG": "sku@t3", … } وكل فئة صفّ بسعرها. البلد من الاتّصال؛
// وبعد الدفع نطابق بلد البطاقة: سعر خاصّ ببطاقة من بلد بسعر كامل ← «مراجعة» (يوقف التنزيل).
const GEO = new Map<string, string>();
async function visitorCountry(req: Request): Promise<string> {
  const h = (req.headers.get("cf-ipcountry") || "").toUpperCase();
  if (/^[A-Z]{2}$/.test(h) && h !== "XX" && h !== "T1") return h;
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (!ip) return "";
  if (GEO.has(ip)) return GEO.get(ip)!;
  try {
    const r = await fetch(`https://api.country.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(2500) });
    const d = await r.json().catch(() => ({})) as { country?: string };
    const c = String(d?.country || "").toUpperCase();
    if (/^[A-Z]{2}$/.test(c)) { if (GEO.size > 5000) GEO.clear(); GEO.set(ip, c); return c; }
  } catch { /* بلا بلد = السعر الأساسيّ */ }
  return "";
}
const baseSku = (s: string) => s.split("@")[0];
// البلد بالترتيب: ما اختاره المشتري يدويّاً ← المنطقة الزمنيّة لجهازه ← بلد الاتّصال (IP).
// كثيرون يتصفّحون بـVPN (أفغانستان مثلاً تظهر قطر) — الـVPN يغيّر الـIP لا ساعة الجهاز.
// ولا شيء من هذا يفتح شيئاً وحده: بلد البطاقة بعد الدفع يُطابَق (سعره أعلى ← «مراجعة»)، والتحويل يُعتمد يدويّاً.
const claimedCountry = (v: unknown) => {
  const c = String(v ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : "";
};
const TZ: Record<string, string> = {
  "Asia/Riyadh": "SA", "Asia/Dubai": "AE", "Asia/Kuwait": "KW", "Asia/Qatar": "QA", "Asia/Bahrain": "BH", "Asia/Muscat": "OM",
  "Asia/Amman": "JO", "Asia/Baghdad": "IQ", "Asia/Gaza": "PS", "Asia/Hebron": "PS", "Asia/Beirut": "LB", "Asia/Damascus": "SY", "Asia/Aden": "YE",
  "Africa/Cairo": "EG", "Africa/Khartoum": "SD", "Africa/Tripoli": "LY", "Africa/Tunis": "TN", "Africa/Algiers": "DZ", "Africa/Casablanca": "MA",
  "Africa/El_Aaiun": "MA", "Africa/Nouakchott": "MR", "Africa/Mogadishu": "SO", "Africa/Djibouti": "DJ", "Indian/Comoro": "KM",
  "Africa/Ndjamena": "TD", "Africa/Juba": "SS", "Africa/Asmara": "ER", "Africa/Niamey": "NE", "Africa/Bamako": "ML", "Africa/Dakar": "SN",
  "Africa/Banjul": "GM", "Africa/Conakry": "GN", "Africa/Ouagadougou": "BF", "Africa/Addis_Ababa": "ET", "Africa/Nairobi": "KE",
  "Africa/Dar_es_Salaam": "TZ", "Africa/Lagos": "NG", "Asia/Kabul": "AF", "Asia/Karachi": "PK", "Asia/Dhaka": "BD", "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN", "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID", "Asia/Pontianak": "ID", "Asia/Kuala_Lumpur": "MY",
  "Asia/Kuching": "MY", "Indian/Maldives": "MV", "Europe/Istanbul": "TR", "Asia/Istanbul": "TR", "Asia/Almaty": "KZ", "Asia/Qostanay": "KZ",
  "Asia/Tashkent": "UZ", "Asia/Samarkand": "UZ", "Asia/Bishkek": "KG", "Asia/Dushanbe": "TJ", "Asia/Ashgabat": "TM", "Asia/Baku": "AZ",
  "Europe/Sarajevo": "BA", "Europe/Tirane": "AL", "Asia/Brunei": "BN", "Asia/Singapore": "SG",
  // الدول الغربيّة وروسيا (فئة ٣٩٩ بلا خصم) — ساعة الجهاز تكشفها حتى مع VPN
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US",
  "America/Anchorage": "US", "Pacific/Honolulu": "US", "America/Detroit": "US", "America/Indiana/Indianapolis": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU",
  "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Pacific/Auckland": "NZ", "Europe/Zurich": "CH", "Europe/Oslo": "NO",
  "Atlantic/Reykjavik": "IS", "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Madrid": "ES", "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Stockholm": "SE", "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI", "Europe/Warsaw": "PL", "Europe/Lisbon": "PT", "Europe/Prague": "CZ", "Europe/Athens": "GR",
  "Europe/Budapest": "HU", "Europe/Bucharest": "RO", "Europe/Sofia": "BG", "Europe/Luxembourg": "LU", "Europe/Moscow": "RU",
};
const tzCountry = (v: unknown) => TZ[String(v ?? "").trim()] || "";
async function priceFor(req: Request, sku: string, claimed?: unknown, tz?: unknown): Promise<{ base: Product; p: Product; country: string; ip: string } | null> {
  const base = await getProduct(baseSku(sku));
  if (!base) return null;
  const ip = await visitorCountry(req);
  const country = claimedCountry(claimed) || tzCountry(tz) || ip;
  const tier = base.regional?.[country];
  const p = (tier && await getProduct(tier)) || base;
  return { base, p, country, ip };
}
/** سعر بلدٍ ما لهذا المنتج (الأساسيّ إن لم يكن له سعر خاصّ). */
async function countryPrice(base: Product, country: string): Promise<number> {
  const tier = base.regional?.[country];
  const p = tier ? await getProduct(tier, false) : null;
  return Number((p ?? base).price_sar);
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

type Check = { status: "paid" | "pending" | "failed" | "cancelled"; amount: string | null; tranRef: string | null; cardCountry: string | null };

/** فحص الطلب لدى تلر بمرجعها (order_ref) — مرجع السلّة وحده لا تعرفه واجهة الفحص. */
async function telrCheck(order: Order): Promise<Check> {
  const d = await proxy("check", { cart: order.telr_cart, orderRef: order.telr_order_ref ?? undefined });
  const st = String(d?.status || "pending");
  const status: Check["status"] = st === "paid" || st === "failed" || st === "cancelled" ? st : "pending";
  return { status, amount: d?.amount ?? null, tranRef: d?.tranRef ?? null, cardCountry: d?.cardCountry ?? null };
}

// لغة صفحة الشراء (النسخة العالميّة تُباع بعدّة لغات بنفس الـsku) ← رابط صفحة الطلب يفتح بها.
const PAGE_LANGS = new Set(["ar", "en", "ru", "fr", "de", "tr", "id", "ur", "fa", "ps", "ckb"]);
function thanksUrl(order: { id: string; sku?: string; lang?: string | null }, token: string) {
  const l = order.lang && PAGE_LANGS.has(order.lang) ? order.lang : langOf(order.sku);
  return `${SITE}/shop/thanks/?o=${order.id}&t=${encodeURIComponent(token)}${l !== "ar" ? `&l=${l}` : ""}`;
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
    // دُفع ببطاقة من بلد سعره أعلى ممّا دُفع (فئة رخيصة، أو السعر الأساسيّ ببطاقة من بلد الـ٣٩٩) ← مراجعة قبل التنزيل
    let hold: string | null = null;
    if (c.cardCountry) {
      const base = await getProduct(baseSku(order.sku), false);
      if (base && (await countryPrice(base, c.cardCountry.toUpperCase())) > Number(order.amount)) hold = "card_country";
    }
    const moved = await patchOrder(order.id, {
      status: "paid", paid_at: now, telr_tran_ref: c.tranRef, paid_amount: c.amount ?? order.amount,
      card_country: c.cardCountry, hold,
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
    const lang = langOf(order.sku);
    await sendEmail(
      order.buyer_email,
      lang === "ru" ? `Ваш заказ готов — ${order.title}` : lang === "en" ? `Your order is ready — ${order.title}` : `طلبك جاهز — ${order.title}`,
      lang === "ru" ? mail(
        `Здравствуйте, ${order.buyer_name}! Ваш заказ готов`,
        `Оплата получена (${Number(order.amount)} SAR) — <b>${esc(order.title)}</b>.<br>
         Файлы ждут вас на странице заказа. Сохраните это письмо — это ваш ключ для скачивания в будущем.`,
        { href: link, label: "Открыть файлы" }, "ru",
      ) : lang === "en" ? mail(
        `Hi ${order.buyer_name}, your order is ready`,
        `We received your payment (${Number(order.amount)} SAR) for <b>${esc(order.title)}</b>.<br>
         Your files are waiting on your order page. Keep this email — it's your key to download them later.`,
        { href: link, label: "Open your files" }, "en",
      ) : mail(
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
async function checkout(req: Request, b: Record<string, unknown>) {
  const sku = String(b.sku ?? "").trim();
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const phone = String(b.phone ?? "").trim().replace(/[^\d+]/g, "");
  if (!sku || name.length < 2 || name.length > 80) return j({ error: "اكتب اسمك" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return j({ error: "البريد غير صحيح" }, 400);
  if (phone && (phone.length < 9 || phone.length > 16)) return j({ error: "رقم الجوال غير صحيح" }, 400);

  const pr = await priceFor(req, sku, b.country, b.tz);
  if (!pr) return j({ error: "المنتج غير متاح" }, 404);
  const p = pr.p;

  const id = crypto.randomUUID();
  const token = randomToken();
  const cart = `is-${Date.now().toString(36)}-${randomToken(4).replace(/[-_]/g, "x")}`;
  const amount = Number(p.price_sar).toFixed(2);

  await rest("POST", "shop_orders", {
    id, sku: p.sku, title: pr.base.title, amount, buyer_name: name, buyer_email: email, buyer_phone: phone || null,
    telr_cart: cart, access_token_hash: await sha256(token), buyer_country: pr.country || null, ip_country: pr.ip || null,
    lang: PAGE_LANGS.has(String(b.lang)) ? String(b.lang) : null,
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
  if (order.status === "pending" && order.pay_method !== "transfer") order = await verifyAndMark(order);

  const dev = isDevice(b.device) ? await sha256(String(b.device)) : null;
  let devices = Array.isArray(order.trusted_devices) ? order.trusted_devices : [];
  // أوّل جهاز يفتح الطلب المدفوع يصير موثّقاً تلقائيّاً (غالباً جهاز الدفع نفسه).
  if (order.status === "paid" && dev && devices.length === 0) {
    devices = [dev];
    await patchOrder(order.id, { trusted_devices: devices }, "&trusted_devices=eq.[]");
    devices = (await getOrder(order.id))?.trusted_devices ?? devices;
  }
  const trusted = !!dev && devices.includes(dev);
  const p = order.status === "paid" ? await getProduct(baseSku(order.sku), false) : null;
  const hold = order.status === "paid" && !!order.hold;

  return j({
    id: order.id,
    status: order.status,
    title: order.title,
    sku: baseSku(order.sku),
    amount: Number(order.amount),
    hold,
    name: order.buyer_name,
    email: maskEmail(order.buyer_email),
    createdAt: order.created_at,
    paidAt: order.paid_at,
    trusted,
    needsVerify: order.status === "paid" && !trusted,
    devicesLeft: Math.max(0, MAX_DEVICES - devices.length),
    files: order.status === "paid" && trusted && !hold ? await filesView(order, p) : [],
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
    const lang = langOf(order.sku);
    const codeBox = `<div style="font-size:34px;font-weight:bold;letter-spacing:8px;margin:18px 0;direction:ltr;text-align:center">${code}</div>`;
    if (lang === "ru") await sendEmail(order.buyer_email, `Код для доступа к файлам: ${code}`, mail(
      "Код подтверждения",
      `Используйте этот код, чтобы открыть файлы <b>${esc(order.title)}</b> на новом устройстве:<br>${codeBox}
       Код действует ${OTP_TTL_MIN} минут. Если вы его не запрашивали, просто проигнорируйте это письмо.`, undefined, "ru",
    ));
    else if (lang === "en") await sendEmail(order.buyer_email, `Your code to open your files: ${code}`, mail(
      "Verification code",
      `Use this code to open the files of <b>${esc(order.title)}</b> on a new device:<br>${codeBox}
       Valid for ${OTP_TTL_MIN} minutes. If you didn't request it, just ignore this email.`, undefined, "en",
    ));
    else await sendEmail(order.buyer_email, `رمز فتح ملفّاتك: ${code}`, mail(
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
  if (order.hold) return j({ error: "طلبك قيد المراجعة — راسلني ونرتّبه لك" }, 403);
  const p = await getProduct(baseSku(order.sku), false);
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
    const lang = langOf(orders[0].sku);
    if (lang === "ru") await sendEmail(orders[0].buyer_email, "Ссылки на ваши заказы", mail(
      `Здравствуйте, ${orders[0].buyer_name}`,
      `Вот ссылки на ваши заказы — скачивайте файлы и обновления в любое время:<br><br>` +
      fresh.map(x => `• <a href="${x.link}">${esc(x.order.title)}</a>`).join("<br>"),
      { href: fresh[0].link, label: "Открыть заказ" }, "ru",
    ));
    else if (lang === "en") await sendEmail(orders[0].buyer_email, "Your order links", mail(
      `Hi ${orders[0].buyer_name}`,
      `Here are your order links — download your files and their updates any time:<br><br>` +
      fresh.map(x => `• <a href="${x.link}">${esc(x.order.title)}</a>`).join("<br>"),
      { href: fresh[0].link, label: "Open your order" }, "en",
    ));
    else await sendEmail(orders[0].buyer_email, "روابط طلباتك", mail(
      `أهلاً ${orders[0].buyer_name}`,
      `هذي روابط طلباتك — تقدر تنزّل منها ملفّاتك وتحديثاتها في أيّ وقت:<br><br>` +
      fresh.map(x => `• <a href="${x.link}">${esc(x.order.title)}</a>`).join("<br>"),
      { href: fresh[0].link, label: "افتح طلبك" },
    ));
  } catch (e) { console.error("shop: recover email failed", String(e)); }
  return ok;
}


// ── الدفع بالتحويل (لمن لا بطاقة عنده أو بلده محجوب في تلر كاليمن والسودان) ──
// الطلب يُسجَّل «بانتظار» بسعر بلد الزائر، والمشتري يراسل إبراهيم على واتساب برقم الطلب.
// الاعتماد من لوحة «المتجر الرقميّ» بجلسة المالك (RLS تحمي التحديث)، ثمّ «transfer-notify»
// يرسل رابط الطلب — ولا يفعل شيئاً إلا لطلب تحويل صار مدفوعاً ولم يُرسَل له بعد.
const orderRef = (id: string) => id.slice(0, 8).toUpperCase();

async function transfer(req: Request, b: Record<string, unknown>) {
  const sku = String(b.sku ?? "").trim();
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const phone = String(b.phone ?? "").trim().replace(/[^\d+]/g, "");
  if (!sku || name.length < 2 || name.length > 80) return j({ error: "اكتب اسمك" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return j({ error: "البريد غير صحيح" }, 400);
  if (phone && (phone.length < 9 || phone.length > 16)) return j({ error: "رقم الجوال غير صحيح" }, 400);
  const pr = await priceFor(req, sku, b.country, b.tz);
  if (!pr) return j({ error: "المنتج غير متاح" }, 404);

  // نفس الإيميل خلال ساعة = نفس الطلب (لا نكرّر الطلبات لو ضغط مرّتين)
  const since = new Date(Date.now() - 3600_000).toISOString();
  const dup = await rest("GET", `shop_orders?buyer_email=eq.${encodeURIComponent(email)}&pay_method=eq.transfer&status=eq.pending&sku=eq.${encodeURIComponent(pr.p.sku)}&created_at=gte.${since}&select=id,amount&limit=1`) as Order[];
  if (dup?.length) return j({ ref: orderRef(dup[0].id), amount: Number(dup[0].amount), country: pr.country });

  // سقف عامّ ضدّ الإغراق: ٢٠ طلب تحويل كل ١٠ دقائق
  const recent = await rest("GET", `shop_orders?pay_method=eq.transfer&created_at=gte.${new Date(Date.now() - 600_000).toISOString()}&select=id&limit=21`) as Order[];
  if ((recent?.length ?? 0) > 20) return j({ error: "ضغط على الطلبات الحين، جرّب بعد دقائق أو راسلني على واتساب" }, 429);

  const id = crypto.randomUUID();
  const amount = Number(pr.p.price_sar).toFixed(2);
  await rest("POST", "shop_orders", {
    id, sku: pr.p.sku, title: pr.base.title, amount, buyer_name: name, buyer_email: email, buyer_phone: phone || null,
    telr_cart: `tr-${id}`, access_token_hash: await sha256(randomToken()), buyer_country: pr.country || null, ip_country: pr.ip || null, pay_method: "transfer",
  }, "return=minimal");
  return j({ ref: orderRef(id), amount: Number(amount), country: pr.country });
}

/** بعد اعتماد المالك من اللوحة: يرسل «طلبك جاهز» مرّة واحدة. */
async function transferNotify(b: Record<string, unknown>) {
  if (!isUuid(b.id)) return j({ error: "طلب غير صالح" }, 400);
  const order = await getOrder(String(b.id));
  if (!order || order.pay_method !== "transfer" || order.status !== "paid") return j({ error: "الطلب غير معتمد" }, 404);
  if (order.email_sent_at) return j({ ok: true, already: true });
  await notifyPaid(order);
  const after = await getOrder(order.id);
  return after?.email_sent_at ? j({ ok: true }) : j({ error: "تعذّر إرسال الإيميل" }, 502);
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
      case "checkout": return await checkout(req, b);
      case "transfer": return await transfer(req, b);
      case "transfer-notify": return await transferNotify(b);
      case "price": {
        const pr = await priceFor(req, String(b.sku ?? ""), b.country, b.tz);
        return pr ? j({ price: Number(pr.p.price_sar), country: pr.country, ip: pr.ip }) : j({ error: "المنتج غير متاح" }, 404);
      }
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
