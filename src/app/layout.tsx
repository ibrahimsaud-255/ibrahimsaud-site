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
    "إبراهيم سعود — خبير إنتاج فيديوهات إعلانية تبيع: من الفكرة والنص، للتصوير، للتعليق الصوتي، للمونتاج النهائي. لعلامات تجارية في السعودية والخليج.",
  keywords: [
    "إبراهيم سعود",
    "إنتاج فيديو",
    "فيديوهات إعلانية",
    "إعلانات",
    "تسويق",
    "مونتاج",
    "السعودية",
  ],
  authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
  icons: {
    icon: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
    apple:
      "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png",
  },
  openGraph: {
    title: "إبراهيم سعود — أصنع إعلانات تبيع",
    description:
      "إنتاج فيديوهات إعلانية تبيع: فكرة، نص، تصوير، تعليق صوتي، ومونتاج.",
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
    title: "إبراهيم سعود — أصنع إعلانات تبيع",
    description: "إنتاج فيديوهات إعلانية تبيع. فكرة، نص، تصوير، مونتاج.",
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
      <body className={`${tajawal.variable} antialiased`}>{children}</body>
    </html>
  );
}
