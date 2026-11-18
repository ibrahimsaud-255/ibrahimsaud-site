import type { Metadata } from "next";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import LangRedirect from "@/components/v2/shop/LangRedirect";
import { itemBySlug } from "@/lib/shop";
import { SITE_URL } from "@/lib/share";

// الصفحة العامّة المعلَنة لـ«برنامج بث الدروس العلمية» (رابط البايو + محرّكات البحث).
// المحتوى نفسه من src/lib/shop.ts؛ نسخة /shop/lessons-broadcast/ مخفيّة وتشير هنا (canonical).
const item = itemBySlug("lessons-broadcast")!;
const PATH = "/lessons-broadcast/";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "برنامج بث الدروس العلمية وتصويرها — بثّ مباشر من المسجد بضغطة زر";
const DESC = "برنامج عربيّ لبثّ الدروس العلميّة وتصويرها: الشيخ والكتاب في الشاشة، المكتبة الشاملة داخله، وبثّ مباشر على يوتيوب وفيسبوك وتيليجرام. ويندوز وماك وأندرويد.";
const IMG = { url: `${SITE_URL}/shop/lessons-broadcast/shot-book.jpg`, alt: "برنامج بث الدروس العلمية: الكتاب مع المتحدّث" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["بث الدروس العلمية", "تصوير الدروس العلمية", "بثوث علمية", "بث مباشر للدروس", "برنامج بث مباشر عربي", "بث دروس المساجد", "تصوير المحاضرات", "المكتبة الشاملة"],
  alternates: { canonical: URL, languages: { ar: URL, ru: `${SITE_URL}/ru/lessons-broadcast/`, en: `${SITE_URL}/en/lessons-broadcast/` } },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: "إبراهيم سعود", locale: "ar_SA", type: "website", images: [IMG] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [IMG.url] },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    alternateName: ["برنامج بث الدروس", "برنامج تصوير الدروس العلمية"],
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows 10, Windows 11, macOS 12+, Android 8+",
    inLanguage: "ar",
    description: DESC,
    url: URL,
    image: IMG.url,
    author: { "@type": "Person", name: "إبراهيم سعود", url: SITE_URL },
    offers: { "@type": "Offer", price: item.fallbackPrice, priceCurrency: "SAR", availability: "https://schema.org/InStock", url: `${URL}#buy` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: item.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

export default function LessonsBroadcast() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LangRedirect sku={item.sku} ru="/ru/lessons-broadcast/" en="/en/lessons-broadcast/" />
      <ShopItemView item={item} />
    </>
  );
}
