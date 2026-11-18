import type { Metadata } from "next";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import { itemBySlug } from "@/lib/shop";
import { SITE_URL } from "@/lib/share";

// نسخة روسيا من «برنامج بث الدروس العلمية» — يُحوَّل لها زائر روسيا تلقائيّاً من /lessons-broadcast/.
// المحتوى في src/lib/shop.ts (lessons-broadcast-ru)، ونصوص الواجهة في src/lib/shopUi.ts.
const item = itemBySlug("lessons-broadcast-ru")!;
const PATH = "/ru/lessons-broadcast/";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "Трансляция исламских уроков — прямой эфир из мечети одной кнопкой";
const DESC = "Программа для трансляции и записи исламских уроков: лектор и книга на экране, библиотека «Шамиля» внутри, эфир на YouTube, Facebook и Telegram. Windows, Mac и Android.";
const IMG = { url: `${SITE_URL}/shop/lessons-broadcast/shot-book.jpg`, alt: "Трансляция исламских уроков: книга и лектор" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL, languages: { ar: `${SITE_URL}/lessons-broadcast/`, ru: URL } },
  openGraph: { title: TITLE, description: DESC, url: URL, siteName: "Ibrahim Saud", locale: "ru_RU", type: "website", images: [IMG] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [IMG.url] },
};

export default function LessonsBroadcastRu() {
  return <ShopItemView item={item} />;
}
