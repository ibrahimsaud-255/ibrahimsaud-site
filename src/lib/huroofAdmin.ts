"use client";

// ===== إدارة حزم مدارس «حروف ودروس» من هذه اللوحة =====
// الرمز يُصدره مشروع Supabase الخاص بهذا الموقع، ويتحقّق منه خادمُ حروف
// ودروس عبر `EXTERNAL_ADMIN_EMAILS`. لا اعتماديّة جديدة — نداءٌ مباشر
// كما في `cms.ts` و`siteData.ts`.

const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

const TOKEN_KEY = "huroof_admin_token";

/** خادم «حروف ودروس». الترويسة `x-system-token` هي جسرُ الإذن إليه. */
const HUROOF_API = "https://huroofduroos.com";

/*
 * `sessionStorage` لا `localStorage`.
 *
 * رمزُ لوحةٍ تُنشئ عقوداً وتبيع حزماً لا يبقى في المتصفّح بعد إغلاقه.
 * وعمرُ الرمز ساعةٌ على أيّة حال، فالبقاء بعدها لا يفيد ويزيد ما يُسرق.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(t: string | null) {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* متصفّحٌ يمنع التخزين — تبقى الجلسة في الذاكرة حتى التحديث. */
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { error_description?: string };
    throw new Error(
      /invalid/i.test(b.error_description ?? "")
        ? "البريد أو كلمة المرور غير صحيحة."
        : (b.error_description ?? "تعذّر تسجيل الدخول"),
    );
  }
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("لم يصل رمز الجلسة");
  setToken(body.access_token);
}

export function signOut() {
  setToken(null);
}

/**
 * ينادي واجهة حروف ودروس مباشرةً من المتصفّح.
 *
 * ─── ولماذا بلا وسيطٍ خادميّ ───────────────────────────────────────────
 * هذا الموقع يُصدَّر ساكناً إلى GitHub Pages (`output: "export"`)، فلا
 * خادمَ فيه يستضيف وسيطاً. وكانت الفكرة الأولى وسيطاً في `‎/api/huroof`،
 * فرفضه البناء صراحةً — وهو رفضٌ في محلّه لا عقبةٌ تُلتفّ.
 *
 * والنداء المباشر سليمٌ هنا: الرمز رمزُ جلسةٍ محدود العمر، والتحقّق منه
 * يقع في خادم حروف ودروس (`externalAdmin.ts`) الذي يسأل Supabase ويطابق
 * البريد بـ`EXTERNAL_ADMIN_EMAILS`. ولا سرَّ في هذا الملفّ يُخشى كشفُه.
 *
 * ويرمي `AuthExpired` عند ‎401‎ كي تُميّزها الصفحة عن أخطاء البيانات:
 * انتهاءُ الجلسة يُعالَج بإعادة الدخول لا برسالةِ خطأ حمراء.
 */
export class AuthExpired extends Error {
  constructor() {
    super("انتهت الجلسة");
    this.name = "AuthExpired";
  }
}

export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();
  if (!token) throw new AuthExpired();

  const res = await fetch(`${HUROOF_API}/api/${path}`, {
    method: init.method ?? "GET",
    headers: { "x-system-token": token, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (res.status === 401) {
    setToken(null);
    throw new AuthExpired();
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((body.error as string) ?? `تعذّر التنفيذ (${res.status})`);
  }
  return body as T;
}

/* ===== التسعير — مطابقٌ لـ`B2B_TIERS` في خادم حروف ودروس ===== */

export const TIERS = [
  { minSeats: 50, price: 99, label: "خصم ٥٠٪" },
  { minSeats: 25, price: 129, label: "خصم ٣٥٪" },
  { minSeats: 10, price: 149, label: "خصم ٢٥٪" },
];

export const MIN_SEATS = 10;

export function quote(seats: number) {
  const t = TIERS.find((x) => seats >= x.minSeats) ?? TIERS[TIERS.length - 1];
  return { perSeat: t.price, total: t.price * seats, label: t.label };
}

export function suggestSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export interface OrgRow {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "expired";
  seatsTotal: number;
  activeSeats: number;
  emptySeats: number;
  endsAt: string;
  pricePerSeat: string | null;
  city: string | null;
}
