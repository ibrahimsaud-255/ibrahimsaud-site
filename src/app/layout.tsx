import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import PreviewBanner from "@/components/PreviewBanner";
import { share, SITE_URL } from "@/lib/share";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const PORTRAIT = `${SITE_URL}/ibrahim-portrait.jpg`;

const HOME_TITLE = "إبراهيم سعود — بين التقنية والأعمال";
const HOME_DESC =
  "إبراهيم سعود، بين التقنية والأعمال: ورش وتدريب الذكاء الاصطناعي، وأنظمة إدارة تملكها، والمحتوى بالذكاء الاصطناعي للخبراء والمنشآت في الرياض.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESC,
  keywords: [
    "إبراهيم سعود",
    "بين التقنية والأعمال",
    "ورش الذكاء الاصطناعي",
    "تدريب الذكاء الاصطناعي للشركات",
    "نظام إدارة أعمال",
    "نظام إدارة جمعيات",
    "صناعة المحتوى بالذكاء الاصطناعي",
    "بودكاست سَعي",
    "الرياض",
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
  ...share({ title: HOME_TITLE, description: HOME_DESC }),
};

// ===== البيانات المنظّمة (JSON-LD) =====
// تُعرّف جوجل بمن هو إبراهيم سعود (بين التقنية والأعمال) وتفصله
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
      jobTitle: ["مطوّر أعمال بالذكاء الاصطناعي", "مدرّب ذكاء اصطناعي", "صانع محتوى"],
      description:
        "إبراهيم سعود، بين التقنية والأعمال: يدخّل الذكاء الاصطناعي في شغل المنشآت والجمعيّات بورش وتدريب، وأنظمة إدارة يملكها العميل، ومحتوى بالذكاء الاصطناعي.",
      nationality: { "@type": "Country", name: "السعودية" },
      knowsAbout: [
        "الذكاء الاصطناعي",
        "تدريب الذكاء الاصطناعي",
        "أنظمة إدارة الأعمال",
        "تطوير الأعمال",
        "صناعة المحتوى",
        "الإنتاج المرئي",
        "البودكاست",
      ],
      knowsLanguage: ["ar", "en"],
      sameAs: [
        "https://www.tiktok.com/@ibrahimsaud",
        "https://www.youtube.com/@ibrahimsaud",
        "https://www.youtube.com/@Sa3Podcast",
      ],
      worksFor: {
        "@type": "Organization",
        name: "إبراهيم سعود",
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
        "الموقع الرسمي لإبراهيم سعود — بين التقنية والأعمال.",
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
