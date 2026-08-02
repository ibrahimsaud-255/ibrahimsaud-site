// ===== الفيديوهات الإعلانية الطولية (٩:١٦) =====
// هذه هي مادة الموقع الرئيسية: الخدمة الوحيدة = فيديو إعلاني قصير طولي.
// كل مقطع يظهر كبطاقة طولية في الصفحة الرئيسية، والضغط عليها يفتح المشغّل.
//
// مصدر الفيديو — بالأولوية:
//   1) src      → ملف mp4 عمودي داخل public/reels  ← الأفضل (تشغيل تلقائي وصامت مثل تيك توك)
//   2) driveId  → معرّف ملف قوقل درايف (يجب أن يكون «أي شخص لديه الرابط»)
//   3) ytId     → معرّف فيديو/شورتس يوتيوب
//
// الصورة المصغّرة (poster): تُشتق تلقائياً من درايف أو يوتيوب، وتقدر تحدّدها بنفسك.
// لأفضل تجربة: اضغط المقاطع لـ mp4 (1080×1920 ~4MB) وارفعها في public/reels — راجع
// public/reels/README.md — ثم بدّل driveId بـ src.

export type Reel = {
  id: string; // معرّف فريد
  client: string; // اسم العلامة/الجهة
  category: string; // قطاع النشاط — يظهر بالذهبي أسفل البطاقة
  roles: string[]; // دوري في العمل
  desc?: string; // سطر تعريفي داخل المشغّل
  logo?: string; // شعار العميل داخل public (اختياري)
  src?: string; // mp4 عمودي في public/reels (الأفضل)
  poster?: string; // صورة مصغّرة مخصّصة
  driveId?: string; // معرّف ملف قوقل درايف
  ytId?: string; // معرّف يوتيوب / شورتس
  href?: string; // رابط المصدر الأصلي (يفتح خارجياً)
};

export const reels: Reel[] = [
  {
    id: "arkan",
    poster: "/reels/arkan.jpg",
    client: "تسهيل الأركان العقارية",
    category: "عقار",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لجهة عقارية — رسالة واحدة واضحة، وتقديم أمام الكاميرا يبني الثقة.",
    driveId: "1d8OIhQHW8N6ehgvIwgjYdGWx9l2-JwK7",
    href: "https://drive.google.com/file/d/1d8OIhQHW8N6ehgvIwgjYdGWx9l2-JwK7/view",
  },
  {
    id: "jazeel",
    poster: "/reels/jazeel.jpg",
    client: "قهوة جزيل",
    category: "قهوة",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لعلامة قهوة — نبدأ بمشهد يوقف التمرير قبل ما يظهر المنتج.",
    driveId: "15wR0kEH145rP0KQPpiiLt1Cs_IlAWFZn",
    href: "https://drive.google.com/file/d/15wR0kEH145rP0KQPpiiLt1Cs_IlAWFZn/view",
  },
  {
    id: "btech",
    poster: "/reels/btech.jpg",
    client: "BTECH",
    category: "أقفال ذكية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "القفل الذكي داخل بيئة استخدامه — نُري الميزة بدل ما نتكلم عنها.",
    driveId: "1mkxWX7d18-DdWo68GI3bFvub8nY1TBf2",
    href: "https://drive.google.com/file/d/1mkxWX7d18-DdWo68GI3bFvub8nY1TBf2/view",
  },
  {
    id: "lucas-oil",
    poster: "/reels/lucas-oil.jpg",
    client: "Lucas Oil",
    category: "زيوت سيارات",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "تصوير ليلي وإيقاع سريع — الصورة توصّل الإحساس قبل ما يتكلم المنتج.",
    driveId: "1fvRQ3I0FyVdy7klD7Rk86XzT3KRb4rlp",
    href: "https://drive.google.com/file/d/1fvRQ3I0FyVdy7klD7Rk86XzT3KRb4rlp/view",
  },
  {
    id: "anatiqni",
    poster: "/reels/anatiqni.jpg",
    client: "متجر أنا تقني",
    category: "تجارة إلكترونية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "هوك في أول ثانيتين، عرض للمنتجات، ودعوة شراء واضحة في النهاية.",
    driveId: "1E4hCOtfWyzTLwpzxAEgMraR5XE5H-C6r",
    href: "https://drive.google.com/file/d/1E4hCOtfWyzTLwpzxAEgMraR5XE5H-C6r/view",
  },
  {
    id: "ish7nha",
    poster: "/reels/ish7nha.jpg",
    client: "متجر اشحنها",
    category: "تجارة إلكترونية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "التطبيق داخل الكادر — نُري الزبون كيف يطلب بدل ما نشرح له.",
    driveId: "1ZJ7VEHHaBonfHtCfJFOFen3MsRvY29ad",
    href: "https://drive.google.com/file/d/1ZJ7VEHHaBonfHtCfJFOFen3MsRvY29ad/view",
  },
  {
    id: "shorfanni",
    poster: "/reels/shorfanni.jpg",
    client: "تطبيق شور فني",
    category: "تطبيق سيارات",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "مشكلة ثم حل في مشهد واحد — أسرع طريقة توصّل فكرة تطبيق.",
    driveId: "1W0xd1VWlEr6mIDKKKIwoB9gtKdXNx4LC",
    href: "https://drive.google.com/file/d/1W0xd1VWlEr6mIDKKKIwoB9gtKdXNx4LC/view",
  },
  {
    id: "kwentra",
    poster: "/reels/kwentra.jpg",
    client: "كوينترا",
    category: "إنتاج كامل",
    roles: ["إنتاج", "تصوير", "مونتاج"],
    desc: "ما يشترط تظهر بنفسك: هنا الوجه للعميل، والفكرة والتصوير والمونتاج عندي.",
    logo: "/LOGO_kwentra.png",
    driveId: "1GXyc7qji8IHlkI8LOmVdkybSf1B7_Nxj",
    href: "https://drive.google.com/file/d/1GXyc7qji8IHlkI8LOmVdkybSf1B7_Nxj/view",
  },
  {
    id: "tad-1",
    poster: "/reels/tad-1.jpg",
    client: "متجر TAD",
    category: "شواحن وإكسسوارات",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
    desc: "من حملة شاحن السفر — مقطع قصير جاهز للنشر مباشرة.",
    ytId: "hzGpY3rvj0w",
    href: "https://www.youtube.com/shorts/hzGpY3rvj0w",
  },
  {
    id: "tad-2",
    poster: "/reels/tad-2.jpg",
    client: "متجر TAD",
    category: "شواحن وإكسسوارات",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
    desc: "نفس الحملة بزاوية ثانية — تنويع يخدم النشر على أكثر من منصة.",
    ytId: "VG-Wk9eKcMo",
    href: "https://www.youtube.com/shorts/VG-Wk9eKcMo",
  },
];

// ===== مساعدات العرض =====

// الصورة المصغّرة الطولية لكل مقطع
export function reelPoster(r: Reel): string {
  if (r.poster) return r.poster;
  if (r.driveId) return `https://drive.google.com/thumbnail?id=${r.driveId}&sz=w1000`;
  if (r.ytId) return `https://img.youtube.com/vi/${r.ytId}/hqdefault.jpg`;
  return "";
}

// مصدر التشغيل داخل المشغّل
export type ReelSource =
  | { kind: "video"; src: string } // mp4 محلي — تشغيل تلقائي وصامت
  | { kind: "youtube"; src: string } // إطار يوتيوب — تشغيل تلقائي وصامت
  | { kind: "drive"; src: string } // إطار درايف — الزائر يضغط ▶ داخل الإطار
  | { kind: "none" };

export function reelSource(r: Reel): ReelSource {
  if (r.src) return { kind: "video", src: r.src };
  if (r.ytId) {
    const p = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: r.ytId,
      playsinline: "1",
      modestbranding: "1",
      rel: "0",
      enablejsapi: "1",
    });
    return { kind: "youtube", src: `https://www.youtube.com/embed/${r.ytId}?${p}` };
  }
  if (r.driveId)
    return { kind: "drive", src: `https://drive.google.com/file/d/${r.driveId}/preview` };
  return { kind: "none" };
}
