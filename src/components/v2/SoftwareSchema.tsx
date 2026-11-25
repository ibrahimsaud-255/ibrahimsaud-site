// بيانات منظّمة لمنتج «نظام الجمعيات الشبابية» (SoftwareApplication بسعر الاشتراك المعلن).
// تقول لجوجل ومحرّكات الذكاء الاصطناعي: وش المنتج، لمين، بكم، وعلى أيّ أجهزة.
// ⚠️ لا تضف aggregateRating أو review إلّا من مراجعات حقيقيّة منشورة — جوجل يعاقب التقييمات المختلَقة.
// الأسعار من charityTiers في charity-guides.ts (تطابق CONFIG.plan.tiers وshop_products) — المعروض سعر المؤسّسين.
import { SITE_URL } from "@/lib/share";
import { charityApp, charityTiers, founderSeats } from "@/lib/charity-guides";

export const APP_ID = `${SITE_URL}${charityApp.path}#app`;

export default function SoftwareSchema() {
  const url = `${SITE_URL}${charityApp.path}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: charityApp.name,
    alternateName: charityApp.alternateNames,
    description: charityApp.description,
    url,
    inLanguage: "ar",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "نظام إدارة جمعيّات أهليّة",
    operatingSystem: "Web, iOS, Android",
    featureList: charityApp.features,
    screenshot: `${SITE_URL}${charityApp.screenshot}`,
    audience: { "@type": "Audience", audienceType: "الجمعيّات الشبابيّة والأهليّة في السعوديّة" },
    areaServed: { "@type": "Country", name: "السعودية" },
    publisher: { "@id": `${SITE_URL}/#ibrahim` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "SAR",
      lowPrice: Math.min(...charityTiers.map((t) => t.founder)),
      highPrice: Math.max(...charityTiers.map((t) => t.founder)),
      offerCount: charityTiers.length,
      url: `${SITE_URL}${charityApp.signup}`,
      availability: "https://schema.org/InStock",
      description: `تجربة مجّانيّة ${charityApp.trialDays} يوماً بلا بطاقة، ثمّ اشتراك سنويّ بعدد المشاركين. سعر المؤسّسين لأوّل ${founderSeats} جمعيّة.`,
      offers: charityTiers.map((t) => ({
        "@type": "Offer",
        name: `الاشتراك السنويّ — ${t.name}`,
        price: t.founder,
        priceCurrency: "SAR",
        priceSpecification: { "@type": "UnitPriceSpecification", price: t.founder, priceCurrency: "SAR", unitText: "سنويّاً", billingDuration: "P1Y" },
        url: `${SITE_URL}${charityApp.signup}`,
        availability: "https://schema.org/InStock",
      })),
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
