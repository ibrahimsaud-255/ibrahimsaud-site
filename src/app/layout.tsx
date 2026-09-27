import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import PreviewBanner from "@/components/PreviewBanner";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const SITE_URL = "https://ibrahimsaud.com";
const PORTRAIT = `${SITE_URL}/ibrahim-portrait.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "إبراهيم سعود — مخرج ومنتج ومدير إبداعي | من الفكرة إلى التسليم",
  description:
    "إبراهيم سعود مخرج ومنتج ومدير إبداعي سعودي. أقود العمل المرئي من الفكرة حتى التسليم — كتابةً وإخراجاً وتصويراً ومونتاجاً: أفلام، حملات، بودكاست، وتغطيات لعلامات وجهات في السعودية والخليج، بأكثر من ٣٠ عملاً مرئياً.",
  keywords: [
    "إبراهيم سعود",
    "مخرج",
    "منتج",
    "مدير إبداعي",
    "مخرج سعودي",
    "صناعة الأفلام",
    "إنتاج مرئي",
    "بودكاست سَعي",
    "حملات إعلانية",
    "تصوير وإخراج الرياض",
    "السعودية",
  ],
  alternates: { canonical: SITE_URL },
  authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
  creator: "إبراهيم سعود",
  icons: {
    icon: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    apple:
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
  },
  openGraph: {
    title: "إبراهيم سعود — مخرج ومنتج ومدير إبداعي",
    description:
      "مخرج ومنتج ومدير إبداعي سعودي. من الفكرة إلى التسليم: أفلام وحملات وبودكاست وتغطيات لعلامات وجهات في السعودية والخليج.",
    url: SITE_URL,
    siteName: "إبراهيم سعود",
    locale: "ar_SA",
    type: "profile",
    images: [PORTRAIT],
  },
  twitter: {
    card: "summary_large_image",
    title: "إبراهيم سعود — مخرج ومنتج ومدير إبداعي",
    description:
      "من الفكرة إلى التسليم: أفلام وحملات وبودكاست وتغطيات لعلامات وجهات في السعودية والخليج.",
    images: [PORTRAIT],
  },
};

// ===== البيانات المنظّمة (JSON-LD) =====
// تُعرّف جوجل بمن هو إبراهيم سعود (شخص حقيقي: مخرج/منتج/مدير إبداعي) وتفصله
// عن الشخصيات التاريخية المتشابهة في الاسم، وتفتح الباب للوحة المعرفة.
const PERSON_ID = `${SITE_URL}/#ibrahim`;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "إبراهيم سعود",
      alternateName: "Ibrahim Saud",
      url: SITE_URL,
      image: PORTRAIT,
      jobTitle: ["مدير إبداعي", "مخرج", "منتج"],
      description:
        "مخرج ومنتج ومدير إبداعي سعودي يقود العمل المرئي من الفكرة حتى التسليم — كتابةً وإخراجاً وتصويراً ومونتاجاً — لأفلام وحملات وبودكاست وتغطيات لعلامات وجهات في السعودية والخليج.",
      nationality: { "@type": "Country", name: "السعودية" },
      knowsAbout: [
        "الإخراج",
        "الإنتاج المرئي",
        "صناعة الأفلام",
        "المونتاج",
        "التصوير السينمائي",
        "الإعلانات",
        "البودكاست",
        "الإدارة الإبداعية",
      ],
      knowsLanguage: ["ar", "en"],
      sameAs: [
        "https://www.tiktok.com/@ibrahimsaud",
        "https://www.youtube.com/@Sa3y_Podcast",
      ],
      worksFor: {
        "@type": "Organization",
        name: "إبراهيم سعود للإنتاج المرئي",
        url: SITE_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "إبراهيم سعود",
      inLanguage: "ar",
      description:
        "الموقع الرسمي لإبراهيم سعود — مخرج ومنتج ومدير إبداعي سعودي.",
      about: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile`,
      url: SITE_URL,
      inLanguage: "ar",
      mainEntity: { "@id": PERSON_ID },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <head>
        {/* بيانات منظّمة تُعرّف جوجل بإبراهيم سعود (Person + WebSite + ProfilePage) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* بوابة مواقع العملاء — تعمل على المسارات المذكورة فقط، وبقية الموقع لا تتأثر */}
        <script src="/gate/gate.js" data-map='{"/sarah":"sarah"}' />
      </head>
      <body className={`${tajawal.variable} antialiased`}>
        <PreviewBanner />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
