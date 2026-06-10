// ===== تجربة الريلز (أسلوب تيك توك) =====
// قائمة منسّقة من المقاطع العمودية. لكل مقطع سلايد مستقل ملء الشاشة.
//
// الأفضل (تجربة native كاملة): ارفع ملف mp4 عمودي في public/reels/ ثم استخدم `src`.
//   مواصفات مثالية: 1080×1920 (أو 720×1280)، H.264، ~3–5MB، صورة poster.
//   مثال:
//   {
//     id: "tad-1",
//     src: "/reels/tad-charger-1.mp4",
//     poster: "/reels/tad-charger-1.jpg",
//     client: "متجر TAD",
//     title: "حملة شاحن السفر",
//     roles: ["فكرة", "تصوير", "مونتاج"],
//     logo: "/LOGO_RMG.png",
//   },
//
// بديل مؤقت (حتى ترفع mp4): استخدم `ytId` = معرّف فيديو Shorts يوتيوب.

export type Reel = {
  id: string; // معرّف فريد
  client: string;
  title: string;
  roles: string[];
  logo?: string; // شعار العميل داخل public مثل "/LOGO_RMG.png"
  src?: string; // مسار mp4 عمودي في public/reels (مفضّل — تشغيل native)
  poster?: string; // صورة poster للمقطع
  ytId?: string; // بديل مؤقت: معرّف Shorts يوتيوب
};

export const reels: Reel[] = [
  // —— مقاطع TAD (بديل يوتيوب مؤقت — استبدلها بـ src عند رفع mp4) ——
  {
    id: "tad-1",
    ytId: "hzGpY3rvj0w",
    client: "متجر TAD",
    title: "حملة شاحن السفر",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
  },
  {
    id: "tad-2",
    ytId: "VG-Wk9eKcMo",
    client: "متجر TAD",
    title: "حملة شاحن السفر — زاوية ٢",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
  },
  // —— تغطية البوليفارد (feeh store) ——
  {
    id: "blvd-1",
    ytId: "y9EnZUF3BH8",
    client: "متجر فيه ستور",
    title: "تغطية موسم الرياضات الإلكترونية",
    roles: ["فكرة", "تقديم", "تصوير", "مونتاج"],
  },
  {
    id: "blvd-2",
    ytId: "5g_2DYu7Gu8",
    client: "متجر فيه ستور",
    title: "تغطية البوليفارد — مقابلات",
    roles: ["تقديم", "تصوير", "مونتاج"],
  },
  {
    id: "blvd-3",
    ytId: "8I_ULf59_K8",
    client: "متجر فيه ستور",
    title: "تغطية البوليفارد — لينوفو",
    roles: ["تقديم", "تصوير", "مونتاج"],
  },
  {
    id: "blvd-4",
    ytId: "O-6Qm1vUET0",
    client: "متجر فيه ستور",
    title: "تغطية البوليفارد — فلوق",
    roles: ["تقديم", "تصوير", "مونتاج"],
  },
];

// صورة الـ poster/الخلفية لكل مقطع
export const reelPoster = (r: Reel) =>
  r.poster ??
  (r.ytId ? `https://img.youtube.com/vi/${r.ytId}/hqdefault.jpg` : "");
