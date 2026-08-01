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
    desc: "إعلان طولي لجهة عقارية — رسالة واحدة واضحة في أقل من دقيقة.",
    driveId: "1d8OIhQHW8N6ehgvIwgjYdGWx9l2-JwK7",
    href: "https://drive.google.com/file/d/1d8OIhQHW8N6ehgvIwgjYdGWx9l2-JwK7/view",
  },
  {
    id: "btech",
    poster: "/reels/btech.jpg",
    client: "BTECH",
    category: "أقفال ذكية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لمنتج أقفال ذكية — عرض المنتج داخل بيئة استخدامه.",
    driveId: "1mkxWX7d18-DdWo68GI3bFvub8nY1TBf2",
    href: "https://drive.google.com/file/d/1mkxWX7d18-DdWo68GI3bFvub8nY1TBf2/view",
  },
  {
    id: "lucas-oil",
    poster: "/reels/lucas-oil.jpg",
    client: "Lucas Oil",
    category: "زيوت سيارات",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لعلامة زيوت سيارات — تصوير ليلي وإيقاع سريع.",
    driveId: "1fvRQ3I0FyVdy7klD7Rk86XzT3KRb4rlp",
    href: "https://drive.google.com/file/d/1fvRQ3I0FyVdy7klD7Rk86XzT3KRb4rlp/view",
  },
  {
    id: "anatiqni",
    poster: "/reels/anatiqni.jpg",
    client: "متجر أنا تقني",
    category: "تجارة إلكترونية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لمتجر إلكتروني — هوك سريع ودعوة شراء واضحة.",
    driveId: "1E4hCOtfWyzTLwpzxAEgMraR5XE5H-C6r",
    href: "https://drive.google.com/file/d/1E4hCOtfWyzTLwpzxAEgMraR5XE5H-C6r/view",
  },
  {
    id: "ish7nha",
    poster: "/reels/ish7nha.jpg",
    client: "متجر اشحنها",
    category: "تجارة إلكترونية",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لمتجر إلكتروني — عرض التطبيق والمنتجات داخل الكادر.",
    driveId: "1ZJ7VEHHaBonfHtCfJFOFen3MsRvY29ad",
    href: "https://drive.google.com/file/d/1ZJ7VEHHaBonfHtCfJFOFen3MsRvY29ad/view",
  },
  {
    id: "shorfanni",
    poster: "/reels/shorfanni.jpg",
    client: "تطبيق شور فني",
    category: "تطبيق سيارات",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "إعلان طولي لتطبيق خدمات سيارات — مشكلة ثم حل في مشهد واحد.",
    driveId: "1W0xd1VWlEr6mIDKKKIwoB9gtKdXNx4LC",
    href: "https://drive.google.com/file/d/1W0xd1VWlEr6mIDKKKIwoB9gtKdXNx4LC/view",
  },
  {
    id: "kwentra",
    poster: "/reels/kwentra.jpg",
    client: "كوينترا",
    category: "إنتاج كامل",
    roles: ["إنتاج", "تصوير", "مونتاج"],
    desc: "إعلان أنتجته وصوّرته وركّبته — الوجه أمام الكاميرا للعميل، والإنتاج كامل عندي.",
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
    desc: "مقطع إعلاني قصير ضمن حملة شاحن السفر.",
    ytId: "hzGpY3rvj0w",
    href: "https://www.youtube.com/shorts/hzGpY3rvj0w",
  },
  {
    id: "tad-2",
    poster: "/reels/tad-2.jpg",
    client: "متجر TAD",
    category: "شواحن وإكسسوارات",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
    desc: "مقطع إعلاني قصير من حملة شاحن السفر — زاوية ثانية.",
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
