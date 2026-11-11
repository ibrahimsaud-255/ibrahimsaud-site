// بيانات منظّمة لصفحات الخدمات: Service (مع الباقات وأسعارها) + FAQPage + مسار الصفحة.
// تعطي جوجل ومحرّكات الذكاء الاصطناعي (Gemini/ChatGPT) جواباً صريحاً: وش الخدمة، لمين، بكم، ومين يقدّمها.
import { SITE_URL } from "@/lib/share";
import type { Pkg } from "@/lib/v2";

const PERSON = `${SITE_URL}/#ibrahim`;

// «من ٥,٠٠٠» → 5000
function toNumber(price: string): number | null {
  const latin = price.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^\d.]/g, "");
  const n = Number(latin);
  return latin && Number.isFinite(n) ? n : null;
}

type Props = {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  packages?: Pkg[];
  faqs?: { q: string; a: string }[];
};

export default function ServiceSchema({ path, name, description, serviceType, packages = [], faqs = [] }: Props) {
  const url = `${SITE_URL}${path}`;
  const offers = packages
    .filter((p) => p.approved)
    .map((p) => {
      const price = toNumber(p.price);
      if (price === null) return null;
      return {
        "@type": "Offer",
        name: p.name,
        description: p.for,
        priceCurrency: "SAR",
        ...(p.unit
          ? { priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "SAR", unitText: p.unit } }
          : { price }),
        url: p.href ? `${SITE_URL}${p.href}` : `${url}#buy`,
        availability: "https://schema.org/InStock",
      };
    })
    .filter(Boolean);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name,
      description,
      serviceType,
      url,
      inLanguage: "ar",
      provider: { "@id": PERSON },
      areaServed: [{ "@type": "Country", name: "السعودية" }, { "@type": "City", name: "الرياض" }],
      ...(offers.length ? { offers } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "إبراهيم سعود", item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
  ];
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />;
}
