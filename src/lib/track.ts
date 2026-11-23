// عدّ الزيارات (بلا IP ولا بيانات شخصيّة): المسار ومصدر الإحالة وutm_source ومعرّف زائر عشوائيّ.
// يكتب عبر الدالّة track_view في Supabase فقط (الجدول site_views مقفل؛ القراءة للمالك من لوحة المتجر).
const RPC = "https://rrerwhhxrjyzmnnjsfev.supabase.co/rest/v1/rpc/track_view";
const KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

function visitorId(): string {
  try {
    let v = localStorage.getItem("is-vid");
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("is-vid", v); }
    return v;
  } catch { return ""; }
}

/** مصدر الزيارة: utm_source أولاً، ثمّ معرّفات الإعلانات/المنصّات، ثمّ نطاق الإحالة. */
function source(q: URLSearchParams, ref: string): string {
  const u = q.get("utm_source");
  if (u) return u.toLowerCase().slice(0, 60);
  if (q.has("ttclid")) return "tiktok";
  if (q.has("fbclid")) return "facebook";
  if (q.has("gclid")) return "google-ads";
  if (/tiktok/i.test(ref)) return "tiktok";
  if (/instagram|l\.instagram/i.test(ref)) return "instagram";
  if (/youtube|youtu\.be/i.test(ref)) return "youtube";
  if (/google\./i.test(ref)) return "google";
  if (/(^|\.)(t\.co|x\.com|twitter\.com)$/i.test(ref)) return "x";
  if (/whatsapp|wa\.me/i.test(ref)) return "whatsapp";
  return "";
}

export function trackView() {
  try {
    if (!/(^|\.)ibrahimsaud\.com$/.test(location.hostname)) return; // لا نعدّ التطوير المحلّيّ
    if (navigator.webdriver || /^\/(app|admin)\b/.test(location.pathname)) return;
    const k = "is-tv:" + location.pathname;
    if (sessionStorage.getItem(k)) return; // مرّة لكل صفحة في الجلسة
    sessionStorage.setItem(k, "1");
    let ref = "";
    try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.host !== location.host) ref = r.host; } catch { /* إحالة غير صالحة */ }
    const q = new URLSearchParams(location.search);
    fetch(RPC, {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ p_path: location.pathname.slice(0, 200), p_ref: ref || null, p_utm: source(q, ref) || null, p_vid: visitorId() || null }),
    }).catch(() => {});
  } catch { /* لا شيء يكسر الصفحة */ }
}
