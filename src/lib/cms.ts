"use client";

// ===== طبقة محتوى الموقع (مسودة → معاينة → نشر) =====
// المحتوى القابل للتعديل يُخزَّن في Supabase (site_settings):
//   value = المنشور (يراه الزوار) · draft = المسودة (تظهر في وضع المعاينة فقط)
// يُدار من النظام الداخلي: /app/ → «الأعمال (الموقع)» → «محتوى الموقع».
// كل مكوّن يمرّر نصوصه الحالية كاحتياطي، فالموقع يعمل حتى بلا اتصال بالقاعدة.

import { useEffect, useState } from "react";

const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

// ---- وضع المعاينة ----
// ?preview=1 يفعّله (ويبقى مفعّلاً أثناء التنقل عبر sessionStorage)، ?preview=0 يلغيه.
export function isPreview(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search).get("preview");
    if (p === "1") sessionStorage.setItem("site_preview", "1");
    if (p === "0") sessionStorage.removeItem("site_preview");
    return sessionStorage.getItem("site_preview") === "1";
  } catch {
    return false;
  }
}

export function exitPreview() {
  try {
    sessionStorage.removeItem("site_preview");
  } catch {}
  const u = new URL(window.location.href);
  u.searchParams.delete("preview");
  window.location.href = u.toString();
}

// ---- جلب المحتوى (طلب واحد لكل الصفحة، مع كاش) ----
type Row = { key: string; value: unknown; draft: unknown };
let cache: Promise<Map<string, Row>> | null = null;

function fetchAll(): Promise<Map<string, Row>> {
  if (!cache) {
    const get = (select: string) =>
      fetch(`${SUPA_URL}/rest/v1/site_settings?select=${select}`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      }).then((r) => (r.ok ? (r.json() as Promise<Row[]>) : Promise.reject(r.status)));
    cache = get("key,value,draft")
      // لو عمود draft ما زال غير منشأ (قبل تشغيل site_cms.sql) نرجع بدونه
      .catch(() => get("key,value"))
      .then((rows) => new Map((rows || []).map((r) => [r.key, r])))
      .catch(() => new Map());
  }
  return cache;
}

// دمج: القيم المحفوظة تغطي الاحتياطي حقلاً حقلاً (المصفوفات تُستبدل كاملة)
function merge<T>(fallback: T, saved: unknown): T {
  if (saved == null) return fallback;
  if (Array.isArray(saved) || typeof saved !== "object" || typeof fallback !== "object" || Array.isArray(fallback))
    return saved as T;
  const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
    const f = (fallback as Record<string, unknown>)[k];
    out[k] = f !== undefined && v !== null && typeof v === "object" && !Array.isArray(v) ? merge(f, v) : v;
  }
  return out as T;
}

// ---- الهوك العام ----
// useContent("hero", fallback) → المنشور، أو المسودة في وضع المعاينة، أو الاحتياطي.
export function useContent<T>(key: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);
  useEffect(() => {
    let alive = true;
    fetchAll().then((map) => {
      if (!alive) return;
      const row = map.get(key);
      if (!row) return;
      const preview = isPreview();
      const src = preview ? (row.draft ?? row.value) : row.value;
      if (src != null) setData(merge(fallback, src));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return data;
}

// ---- تمييز الكلمة الذهبية ----
// النص "تقنية *أعمال*، وبودكاست." → ما بين النجمتين يظهر بالتدرج الذهبي.
export function goldParts(text: string): { text: string; gold: boolean }[] {
  return (text || "")
    .split(/\*([^*]+)\*/g)
    .map((t, i) => ({ text: t, gold: i % 2 === 1 }))
    .filter((p) => p.text !== "");
}

// رابط واتساب برقم قابل للتعديل من اللوحة
export function waHref(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
