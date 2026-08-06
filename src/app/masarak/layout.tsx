import type { Metadata } from "next";
// كل أنماط المنصة محصورة داخل .masarak — لا تؤثر على بقية الموقع
import "@/masarak/masarak.css";

export const metadata: Metadata = {
  // نموذج أوّلي لعرضه على العميل: لا يظهر في نتائج البحث ولا يُؤرشف.
  // احذف هذا السطر عند الإطلاق الرسمي ليبدأ ظهوره في جوجل.
  robots: { index: false, follow: false, nocache: true },
  title: "مسارك — احسب نسبتك الموزونة واعرف تخصصاتك الجامعية",
  description:
    "أدخل نسبة الثانوية ودرجة القدرات والتحصيلي، واعرف التخصصات التي تفتح لك في الجامعات السعودية مرتّبةً من الأصعب إلى الأسهل، مع معادلة كل جامعة على حدة.",
  keywords: [
    "النسبة الموزونة",
    "حاسبة الموزونة",
    "القبول الجامعي",
    "الجامعات السعودية",
    "اختبار القدرات",
    "الاختبار التحصيلي",
    "تخصصات الجامعات",
    "نسب القبول",
  ],
  openGraph: {
    title: "مسارك — درجاتك تعرف طريقها",
    description:
      "منصّة تحوّل درجاتك إلى قائمة تخصصات وجامعات تفتح لك في المملكة.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function MasarakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
