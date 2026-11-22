import type { Metadata } from "next";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import CharityPromo from "@/components/v2/CharityPromo";
import BlogLinks from "@/components/v2/BlogLinks";
import LangRedirect from "@/components/v2/shop/LangRedirect";
import { itemBySlug } from "@/lib/shop";
import { SITE_URL } from "@/lib/share";
import { allLanguages } from "@/lib/shopIntl";

// الصفحة العامّة المعلَنة لـ«برنامج بث الدروس العلمية» (رابط البايو + محرّكات البحث).
// المحتوى نفسه من src/lib/shop.ts؛ نسخة /shop/lessons-broadcast/ مخفيّة وتشير هنا (canonical).
const item = itemBySlug("lessons-broadcast")!;
const PATH = "/lessons-broadcast/";
const URL = `${SITE_URL}${PATH}`;
// الكلمات المستهدفة وخريطتها: docs/بث-الدروس-كلمات-البحث.md (العنوان والوصف بلا تشكيل ليطابقا ما يُكتب في البحث).
const TITLE = "برنامج بث الدروس العلمية وتصويرها وتسجيلها — بث مباشر من المسجد";
const DESC = "برنامج وتطبيق لبث الدروس العلمية وتصويرها وتسجيلها: الشيخ والكتاب في الشاشة، المكتبة الشاملة، وبث مباشر على يوتيوب وفيسبوك وتيليجرام. ويندوز وماك وأندرويد وآيفون.";
const IMG = { url: `${SITE_URL}/shop/lessons-broadcast/shot-book.jpg`, alt: "برنامج بث الدروس العلمية: الكتاب مع المتحدّث" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["برنامج بث الدروس العلمية", "بث الدروس العلمية", "بث دروس علمية", "تصوير الدروس العلمية", "تسجيل دروس علمية", "تطبيق بث الدروس", "برنامج بث الدروس", "طريقة بث الدروس العلمية", "بث مباشر من المسجد", "بثوث علمية", "بث دروس المساجد", "تصوير المحاضرات", "المكتبة الشاملة"],
  alternates: { canonical: URL, languages: allLanguages(SITE_URL) },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: "إبراهيم سعود", locale: "ar_SA", type: "website", images: [IMG] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [IMG.url] },
};

// سعر الـschema = السعر الحيّ وقت البناء: سعر العرض (مع priceValidUntil) ما دام العرض قائماً، وإلّا الأساسيّ.
// (لا يظهر في نصّ الصفحة — جوجل يقارنه بالسعر المعروض، فلازم يطابقه.)
const onSale = item.sale && Date.now() < Date.parse(item.sale.until);
const salePrice = onSale ? Number(Object.entries(item.sale!.was).find(([, was]) => was === item.fallbackPrice)?.[0]) || 0 : 0;
const ARTICLES = ["how-to-live-stream-islamic-lessons", "record-islamic-lessons-guide", "lessons-broadcast-app-guide", "stream-lessons-from-phone", "stream-youtube-facebook-telegram-together", "mosque-live-streaming-setup", "show-book-in-live-lesson", "publish-archive-islamic-lessons"];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${URL}#app`,
      name: item.name,
      alternateName: ["برنامج بث الدروس", "تطبيق بث الدروس", "برنامج تصوير الدروس العلمية", "برنامج تسجيل الدروس العلمية", "Islamic Lessons Broadcast"],
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "بث مباشر وتسجيل الدروس العلمية",
      operatingSystem: "Windows 10, Windows 11, macOS 12+, Android 8+, iOS, iPadOS",
      inLanguage: "ar",
      description: DESC,
      url: URL,
      image: IMG.url,
      screenshot: (item.shots || []).map((x) => ({ "@type": "ImageObject", url: `${SITE_URL}${x.src}`, caption: x.alt })),
      featureList: item.inside.map((x) => x.title),
      author: { "@type": "Person", "@id": `${SITE_URL}/#ibrahim`, name: "إبراهيم سعود", url: SITE_URL },
      offers: {
        "@type": "Offer",
        price: salePrice || item.fallbackPrice,
        priceCurrency: "SAR",
        ...(salePrice ? { priceValidUntil: item.sale!.until.slice(0, 10) } : {}),
        availability: "https://schema.org/InStock",
        url: `${URL}#buy`,
      },
    },
    {
      "@type": "WebPage",
      "@id": URL,
      url: URL,
      name: TITLE,
      inLanguage: "ar",
      about: { "@id": `${URL}#app` },
      breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "إبراهيم سعود", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: item.name, item: URL },
      ] },
      relatedLink: ARTICLES.map((a) => `${SITE_URL}/blog/${a}/`),
    },
    {
      "@type": "FAQPage",
      "@id": `${URL}#faq`,
      // سؤال المحرّك تحت البرنامج يبقى في الصفحة لمن يسأل، لكن لا نعطيه لجوجل مقتطفاً (البرنامج يُقدَّم مستقلّاً).
      mainEntity: item.faqs.filter((f) => !/OBS/i.test(f.q + f.a)).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function LessonsBroadcast() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LangRedirect sku={item.sku} />
      <ShopItemView item={item} promo={<><CharityPromo /><BlogLinks topic="lessons" first={ARTICLES} max={8} alt /></>} />
    </>
  );
}
