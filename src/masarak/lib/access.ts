"use client";

/**
 * بوابة التفعيل — التعامل مع أكواد «مسارك».
 *
 * كل نداء يمرّ عبر دالة محمية في القاعدة (RPC)، فلا يستطيع أحد قراءة
 * الأكواد أو تعدادها بالمفتاح العلني. راجع `supabase/masarak.sql`.
 *
 * الربط قابل للنقل: يُقرأ من `public/masarak/backend.json` إن وُجد،
 * وإلا من `config.ts`. وإن لم يُضبط أصلاً تعمل المنصّة في وضع التجربة.
 */

import { BACKEND_FILE, SUPABASE } from "../config";

const TOKEN_KEY = "masarak.token.v1";
const DEVICE_KEY = "masarak.device.v1";
const DEMO_TOKEN = "demo";

export type Backend = { url: string; key: string };

let backend: Backend | null = null;
let backendLoaded = false;

/**
 * يحلّ إعدادات الربط مرّة واحدة.
 * ملف `backend.json` يتقدّم على القيم المكتوبة في الكود، فيمكن نقل المنصّة
 * إلى حساب آخر بتعديل ملف واحد بلا إعادة بناء.
 */
export async function loadBackend(): Promise<Backend | null> {
  if (backendLoaded) return backend;
  backendLoaded = true;

  try {
    const res = await fetch(BACKEND_FILE, { cache: "no-store" });
    if (res.ok) {
      const j = (await res.json()) as Partial<Backend>;
      if (j.url && j.key) {
        backend = { url: j.url, key: j.key };
        return backend;
      }
    }
  } catch {
    /* لا يوجد ملف ربط — نكمل بالقيم المكتوبة */
  }

  backend = SUPABASE.url && SUPABASE.key ? { url: SUPABASE.url, key: SUPABASE.key } : null;
  return backend;
}

/** هل المنصّة مربوطة بقاعدة أكواد؟ (يُنادى بعد loadBackend) */
export function isConfigured(): boolean {
  return backend !== null;
}

export type RedeemResult =
  | { ok: true; token: string; code: string; expiresAt: string | null; demo?: boolean }
  | { ok: false; reason: RedeemFailure };

export type RedeemFailure =
  | "format"
  | "not_found"
  | "used"
  | "revoked"
  | "expired"
  | "network";

export const FAILURE_TEXT: Record<RedeemFailure, string> = {
  format: "صيغة الكود غير صحيحة — تأكّد من نسخه كاملاً.",
  not_found: "هذا الكود غير موجود. راجع رسالة الشراء وانسخه كما هو.",
  used: "هذا الكود مُستخدَم على جهاز آخر. لكل كود جهاز واحد.",
  revoked: "هذا الكود مُلغى. تواصل معنا إن كنت اشتريته حديثاً.",
  expired: "انتهت صلاحية هذا الكود.",
  network: "تعذّر الاتصال. تحقّق من الإنترنت وأعد المحاولة.",
};

/** نداء دالة في القاعدة */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const b = await loadBackend();
  if (!b) throw new Error("backend غير مضبوط");

  const res = await fetch(`${b.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: b.key,
      Authorization: `Bearer ${b.key}`,
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `rpc ${fn} ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * بصمة جهاز ثابتة — لربط الكود بجهاز واحد.
 * قيمة عشوائية محفوظة محلياً؛ لا تُجمع أي معلومة عن الجهاز أو صاحبه.
 */
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export function savedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* التخزين المحلي معطّل — الجلسة تنتهي بإغلاق الصفحة */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* لا شيء */
  }
}

type RedeemRow = {
  ok: boolean;
  token?: string;
  code?: string;
  expires_at?: string | null;
  reason?: RedeemFailure;
};

/** تفعيل كود جديد */
export async function redeem(code: string): Promise<RedeemResult> {
  const b = await loadBackend();
  if (!b) {
    // وضع التجربة: لا خادم، فنفتح المنصّة محلياً
    saveToken(DEMO_TOKEN);
    return { ok: true, token: DEMO_TOKEN, code: "DEMO", expiresAt: null, demo: true };
  }

  try {
    const r = await rpc<RedeemRow>("masarak_redeem", {
      p_code: code,
      p_device: deviceId(),
    });
    if (r.ok && r.token) {
      saveToken(r.token);
      return {
        ok: true,
        token: r.token,
        code: r.code ?? code,
        expiresAt: r.expires_at ?? null,
      };
    }
    return { ok: false, reason: r.reason ?? "not_found" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** فتح المنصّة في وضع التجربة بلا كود */
export function startDemo() {
  saveToken(DEMO_TOKEN);
}

/** التحقّق من جلسة محفوظة — يُنادى مرّة عند فتح المنصة */
export async function verifySaved(): Promise<
  { ok: true; code: string } | { ok: false }
> {
  const token = savedToken();
  if (!token) return { ok: false };
  if (token === DEMO_TOKEN) return { ok: true, code: "DEMO" };

  const b = await loadBackend();
  if (!b) return { ok: false };

  try {
    const r = await rpc<{ ok: boolean; code?: string }>("masarak_verify", {
      p_token: token,
    });
    if (r.ok && r.code) return { ok: true, code: r.code };
    clearToken();
    return { ok: false };
  } catch {
    // انقطاع الشبكة لا يعني بطلان الكود — نسمح بالاستمرار دون تحقّق
    return { ok: true, code: "offline" };
  }
}

/** حفظ نتيجة الطالب للإحصاء (بلا أي بيانات تعريف) */
export async function saveResult(payload: Record<string, unknown>) {
  const token = savedToken();
  if (!token || token === DEMO_TOKEN) return;
  if (!(await loadBackend())) return;
  try {
    await rpc("masarak_save_result", { p_token: token, p_payload: payload });
  } catch {
    /* الإحصاء ليس حرجاً — نتجاهل الفشل بهدوء */
  }
}

/** تنسيق الكود أثناء الكتابة: MSRK-XXXX-XXXX */
export function formatCode(raw: string): string {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
  const parts = [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12)].filter(
    Boolean
  );
  return parts.join("-");
}
