import type { Metadata } from "next";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import { itemBySlug } from "@/lib/shop";
import { INTL, INTL_CODES, allLanguages, type IntlCode } from "@/lib/shopIntl";
import { SITE_URL } from "@/lib/share";

// صفحة «برنامج بث الدروس العلمية» بلغات الحملة العالميّة: /fr/ /de/ /tr/ /id/ /ur/ /fa/ /ps/ /ckb/ lessons-broadcast/
// (العربيّة /lessons-broadcast/ والروسيّة والإنجليزيّة لها صفحاتها). المحتوى من src/lib/shopIntl/<code>.json.
export const dynamicParams = false;
export function generateStaticParams() {
  return INTL_CODES.map((lang) => ({ lang }));
}

type Props = { params: Promise<{ lang: string }> };
const LOCALES: Record<IntlCode, string> = { fr: "fr_FR", de: "de_DE", tr: "tr_TR", id: "id_ID", ur: "ur_PK", fa: "fa_AF", ps: "ps_AF", ckb: "ckb_IQ" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang as IntlCode;
  const { title, description } = INTL[lang].item.meta;
  const url = `${SITE_URL}/${lang}/lessons-broadcast/`;
  const img = { url: `${SITE_URL}/shop/lessons-broadcast/shot-book.jpg`, alt: INTL[lang].item.name };
  return {
    title, description,
    alternates: { canonical: url, languages: allLanguages(SITE_URL) },
    openGraph: { title, description, url, siteName: "Ibrahim Saud", locale: LOCALES[lang], type: "website", images: [img] },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}

export default async function LessonsBroadcastIntl({ params }: Props) {
  const lang = (await params).lang;
  return <ShopItemView item={itemBySlug(`lessons-broadcast-${lang}`)!} />;
}
