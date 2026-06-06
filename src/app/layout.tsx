import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const SITE_URL = "https://ibrahimsaud.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "إبراهيم سعود — أصنع إعلانات تبيع",
  description:
    "إبراهيم سعود — إنتاج فيديوهات إعلانية تبيع: من الفكرة والنص، للتصوير، للتعليق الصوتي، للمونتاج النهائي. شغل مع جامعة الملك سعود وعلامات تجارية في السعودية والخليج.",
  keywords: [
    "إبراهيم سعود",
    "إنتاج فيديو",
    "فيديوهات إعلانية",
    "إعلانات",
    "تسويق",
    "مونتاج",
    "بودكاست سعي",
    "السعودية",
  ],
  authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
  openGraph: {
    title: "إبراهيم سعود — أصنع إعلانات تبيع",
    description:
      "إنتاج فيديوهات إعلانية تبيع: فكرة، نص، تصوير، تعليق صوتي، ومونتاج — من شخص واحد.",
    url: SITE_URL,
    siteName: "إبراهيم سعود",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "إبراهيم سعود — أصنع إعلانات تبيع",
    description: "إنتاج فيديوهات إعلانية تبيع. فكرة، نص، تصوير، مونتاج.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${tajawal.variable} antialiased`}>{children}</body>
    </html>
  );
}
