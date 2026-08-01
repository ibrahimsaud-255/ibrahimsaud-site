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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "إبراهيم سعود — فيديوهات إعلانية تبيع",
  description:
    "فيديوهات إعلانية قصيرة طولية (٩:١٦) للمتاجر والعلامات التجارية — من الفكرة والسكربت إلى التصوير والمونتاج، جاهزة للنشر على تيك توك وريلز وسناب وشورتس.",
  keywords: [
    "إبراهيم سعود",
    "فيديو إعلاني",
    "إعلانات قصيرة",
    "فيديو طولي",
    "إعلانات تيك توك",
    "ريلز إنستقرام",
    "إعلان متجر إلكتروني",
    "تصوير إعلانات الرياض",
    "السعودية",
  ],
  authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
  icons: {
    icon: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    apple:
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
  },
  openGraph: {
    title: "إبراهيم سعود — فيديوهات إعلانية تبيع",
    description:
      "إعلانات قصيرة طولية لمنتجك — فكرة وسكربت وتصوير ومونتاج، جاهزة للنشر على كل المنصات.",
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
    title: "إبراهيم سعود — فيديوهات إعلانية تبيع",
    description:
      "إعلانات قصيرة طولية لمنتجك — فكرة وسكربت وتصوير ومونتاج، جاهزة للنشر.",
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
        <PreviewBanner />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
