import type { Metadata } from "next";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import { itemBySlug } from "@/lib/shop";
import { SITE_URL } from "@/lib/share";

// النسخة الإنجليزيّة من «برنامج بث الدروس العلمية» — يُحوَّل لها زائر خارج الدول العربيّة متصفّحه بلا عربيّة.
// المحتوى في src/lib/shop.ts (lessons-broadcast-en)، ونصوص الواجهة في src/lib/shopUi.ts.
const item = itemBySlug("lessons-broadcast-en")!;
const PATH = "/en/lessons-broadcast/";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "Islamic Lessons Broadcast — stream mosque lessons live with one button";
const DESC = "Software to stream and record Islamic lessons: the teacher and the book on screen, the Shamela library built in, live on YouTube, Facebook and Telegram at once. Windows, Mac and Android.";
const IMG = { url: `${SITE_URL}/shop/lessons-broadcast/shot-book.jpg`, alt: "Islamic Lessons Broadcast: the book and the teacher" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL, languages: { ar: `${SITE_URL}/lessons-broadcast/`, ru: `${SITE_URL}/ru/lessons-broadcast/`, en: URL } },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: "Ibrahim Saud", locale: "en_US", type: "website", images: [IMG] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [IMG.url] },
};

export default function LessonsBroadcastEn() {
  return <ShopItemView item={item} />;
}
