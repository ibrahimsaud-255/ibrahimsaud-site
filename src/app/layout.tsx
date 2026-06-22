import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const SITE_URL = "https://ibrahimsaud.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "إبراهيم سعود — تقنية أعمال وبودكاست",
  description:
    "إبراهيم سعود — أوظّف التقنية في تطوير الأعمال والأنظمة، وأنتج البودكاست والمحتوى المرئي من استوديو مجهّز بالرياض. تقنية أعمال، بودكاست سَعي، وإنتاج إعلامي.",
  keywords: [
    "إبراهيم سعود",
    "تقنية أعمال",
    "بودكاست",
    "بودكاست سعي",
    "أنظمة أعمال",
    "إنتاج بودكاست",
    "إنتاج محتوى",
    "استوديو بودكاست الرياض",
    "السعودية",
  ],
  authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
  icons: {
    icon: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    apple:
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
  },
  openGraph: {
    title: "إبراهيم سعود — تقنية أعمال وبودكاست",
    description:
      "تقنية تخدم أعمالك، وبودكاست ومحتوى مرئي يبني حضورك — من استوديو مجهّز بالرياض.",
    url: SITE_URL,
    siteName: "إبراهيم سعود",
    locale: "ar_SA",
    type: "website",
    images: [
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "إبراهيم سعود — تقنية أعمال وبودكاست",
    description:
      "تقنية تخدم أعمالك، وبودكاست ومحتوى مرئي يبني حضورك.",
    images: [
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${tajawal.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
