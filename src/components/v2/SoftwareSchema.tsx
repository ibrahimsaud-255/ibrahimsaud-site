// بيانات منظّمة لمنتج «نظام الجمعيات الشبابية» (SoftwareApplication بسعر الاشتراك المعلن).
// تقول لجوجل ومحرّكات الذكاء الاصطناعي: وش المنتج، لمين، بكم، وعلى أيّ أجهزة.
// ⚠️ لا تضف aggregateRating أو review إلّا من مراجعات حقيقيّة منشورة — جوجل يعاقب التقييمات المختلَقة.
// السعر هنا لازم يطابق CONFIG.plan.price في public/charity/config.js وpkgs.charitySub في v2.ts.
import { SITE_URL } from "@/lib/share";
import { charityApp } from "@/lib/charity-guides";

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
      "@type": "Offer",
      name: "الاشتراك السنويّ",
      price: charityApp.price,
      priceCurrency: "SAR",
      priceSpecification: { "@type": "UnitPriceSpecification", price: charityApp.price, priceCurrency: "SAR", unitText: "سنويّاً", billingDuration: "P1Y" },
      eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "ANN" },
      url: `${SITE_URL}${charityApp.signup}`,
      availability: "https://schema.org/InStock",
      description: `تجربة مجّانيّة ${charityApp.trialDays} يوماً بلا بطاقة، ثمّ ${charityApp.price} ريال سنويّاً.`,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
