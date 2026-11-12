// ===== صناعة المحتوى (صفحة /content) — معرض الأعمال مرتّباً بالنوع =====
// الأعمال نفسها في src/lib/site.ts (works) والإعلانات الطوليّة في src/lib/reels.ts.
// هنا بس الترتيب: أيّ عمل يظهر في أيّ قسم وبأيّ ترتيب، والنصوص الخاصّة بالصفحة.
// لإضافة عمل: أضفه في works (site.ts) ثمّ اكتب id حقّه في القسم المناسب تحت.

import { works, waLink, type Work } from "./site";
import { toThumb } from "./embed";

// أعمال خارج site.ts (ما تحتاج تظهر في الموقع القديم)
const extra: Work[] = [
  {
    id: "sa3y-podcast",
    client: "بودكاست سَعي",
    title: "سَعي — حلقة منصّة لمات للفعاليّات",
    category: "بودكاست وحوارات",
    roles: ["فكرة", "تقديم", "تصوير", "مونتاج"],
    desc: "بودكاستي «سَعي»: حوارات مع ناس عندهم معلومة تفيد. تصوير بثلاث كاميرات في الاستوديو ومونتاج كامل.",
    videoUrl: "https://youtu.be/vH3_CC1GsiM",
    thumb: "/v2/shots/podcast-sa3y.jpg",
  },
];

const all = [...works, ...extra];
const byId = (id: string) => {
  const w = all.find((x) => x.id === id);
  if (!w) throw new Error(`content.ts: عمل غير موجود «${id}»`);
  return w;
};

// الشكل: wide = فيديو أفقيّ ١٦:٩ · tall = مقطع طوليّ ٩:١٦ (شورتس)
export type ContentGroup = { id: string; title: string; text: string; shape: "wide" | "tall"; items: Work[] };

// أبرز الأعمال: أوّل شي يشوفه العميل — بطاقات كبيرة
export const featured = ["abshr-official", "tga-official", "healthon-final-full", "rinad-tasis"].map(byId);

export const groups: ContentGroup[] = [
  {
    id: "official",
    title: "أفلام رسميّة ومؤسّسيّة.",
    text: "أفلام لجهات حكوميّة وشركات: فكرة واسكربت وإخراج وتصوير وموشن، بهويّة تليق بالجهة.",
    shape: "wide",
    items: ["abshr-official", "tga-official", "rmg-innovation-lab", "rinad-tasis"].map(byId),
  },
  {
    id: "events",
    title: "تغطية الفعاليّات.",
    text: "هاكاثونات ومؤتمرات: فيلم افتتاحيّ، وتغطية يوميّة، وفيلم ختاميّ يلخّص الحدث.",
    shape: "wide",
    // فيلم الزواج (wedding-film) شِيل: مقطعه على يوتيوب صار غير متاح
    items: ["healthon-final-full", "healthon-open", "healthon-close"].map(byId),
  },
  {
    id: "campaigns",
    title: "حملات وإعلانات.",
    text: "إعلانات لمتاجر وعلامات: من فكرة تمثيليّة كاملة إلى تصوير منتج خارج المملكة.",
    shape: "wide",
    items: ["feeh-campaign", "feeh-breaking-bad", "tad-main", "tad-bts"].map(byId),
  },
  {
    id: "street",
    title: "مقابلات الشارع والتغطية الميدانيّة.",
    text: "تقديم وتصوير ومونتاج من قلب الحدث، بإيقاع المنصّات.",
    shape: "tall",
    items: ["blvd-1", "blvd-2", "blvd-3", "blvd-4"].map(byId),
  },
  {
    id: "podcast",
    title: "بودكاست وحوارات.",
    text: "حلقات حواريّة بثلاث كاميرات، تتقطّع بعدها لمقاطع قصيرة.",
    shape: "wide",
    items: ["zayadat-podcast", "sa3y-podcast"].map(byId),
  },
];

// ===== التصوير الفوتوغرافيّ =====
// القسم يظهر تلقائيّاً أوّل ما تضيف صوراً هنا. ضع الصور في public/content/photos/ (jpg بعرض ~1600px)
// واكتبها: { src: "/content/photos/اسم.jpg", alt: "وصف قصير", client: "اسم الجهة" }
export const photos: { src: string; alt: string; client?: string }[] = [];

// صور الاستوديو (أفقيّة)
export const studioShots = ["/studio/studio-1.jpg", "/studio/studio-2.jpg", "/studio/studio-5.jpg", "/studio/studio-7.jpg"];

export const contentSteps = [
  { name: "الفكرة", text: "نفهم الجهة والجمهور، ونطلّع رسالة وحدة لازم توصل." },
  { name: "الاسكربت", text: "سرد وهوك ولقطات مكتوبة، تعتمدها قبل أيّ تصوير." },
  { name: "التصوير", text: "في موقعك أو في الاستوديو، بإضاءة وصوت احترافيّ. والسفر حسب المشروع." },
  { name: "التسليم", text: "نسخة طويلة ونسخ قصيرة للمنصّات، بجودتها الكاملة على Google Drive." },
];

export const contentWa = (title?: string) =>
  waLink(title ? `السلام عليكم، شفت «${title}» في موقعك وأبي شي مثله` : "السلام عليكم، شفت أعمالك في صناعة المحتوى وأبي أتكلّم معك عن مشروع");

const ytId = (u: string) => u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1];

// صورة العمل: المخصّصة، أو يوتيوب (العموديّة للشورتس)، أو درايف بالرابط المباشر
export function workThumb(w: Work, tall = false): string {
  const url = w.videoUrl || w.videos?.[0] || "";
  if (w.thumb) return w.thumb;
  const yt = ytId(url);
  if (yt) return tall ? `https://i.ytimg.com/vi/${yt}/oardefault.jpg` : `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return (toThumb(url) || "").replace(/^https:\/\/drive\.google\.com\/thumbnail\?id=([\w-]+)&sz=(\S+)$/, "https://lh3.googleusercontent.com/d/$1=w1280");
}

export const workUrl = (w: Work) => w.videoUrl || w.videos?.[0] || w.link || "";

// عدد الأعمال المعروضة في الصفحة (الأقسام + الإعلانات الطوليّة تُضاف في الصفحة)
export const groupedCount = new Set(groups.flatMap((g) => g.items.map((w) => w.id))).size;
