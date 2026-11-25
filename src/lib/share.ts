// بطاقة الرابط لمّا ينرسل في واتساب وإكس ولينكدإن: عنوان الصفحة ووصفها وصورة خاصّة بقسمها.
// الصور في public/og/<id>.jpg (١٢٠٠×٦٣٠) وتُصيَّر من scripts/og/cards.html بـ scripts/og/render.sh.
// قاعدة: لا أسعار في البطاقة — لا في الصورة ولا في العنوان ولا في الوصف؛ نبذة جذّابة فقط.
import type { Metadata } from "next";

export const SITE_URL = "https://ibrahimsaud.com";

const CARDS = {
  home: "إبراهيم سعود — بين التقنية والأعمال",
  ai: "ورش الذكاء الاصطناعي — لا تدرسه… جرّبه",
  charities: "نظام الجمعيات الشبابية",
  "charity-youth-clubs": "نظام الجمعيات الشبابية — الأندية الشبابية",
  "charity-transparency": "معيار الشفافية والإفصاح للجمعيات الأهلية",
  "charity-regulation": "اللائحة التنفيذية لنظام الجمعيات ١٤٤٧هـ",
  jawwali: "جوّالي — نظام الجمعيات الشبابية",
  content: "صناعة المحتوى — إبراهيم سعود",
  video: "الاستوديو — بودكاست وأفلام تعريفيّة في الرياض",
  build: "ابنِ نظامك بنفسك بالذكاء الاصطناعي",
  course: "من الفكرة للنشر — دورة عمليّة",
  ads: "إعلانات المتاجر — فيديو إعلانيّ طوليّ",
  blog: "مدوّنة إبراهيم سعود",
} as const;
export type OgCard = keyof typeof CARDS;

export const ogImage = (card: OgCard) => ({ url: `${SITE_URL}/og/${card}.jpg`, width: 1200, height: 630, alt: CARDS[card] });
export const OG_IMAGE = ogImage("home");

type Img = { url: string; width?: number; height?: number; alt?: string };

export function share(m: { title?: unknown; description?: unknown }, path = "/", card: OgCard | Img = "home"): Pick<Metadata, "openGraph" | "twitter"> {
  const title = String(m.title ?? "إبراهيم سعود — بين التقنية والأعمال");
  const description = m.description ? String(m.description) : undefined;
  const img = typeof card === "string" ? ogImage(card) : card;
  return {
    openGraph: { title, description, url: `${SITE_URL}${path}`, siteName: "إبراهيم سعود", locale: "ar_SA", type: "website", images: [img] },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}
