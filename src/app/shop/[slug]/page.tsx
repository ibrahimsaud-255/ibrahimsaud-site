import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopItemView from "@/components/v2/shop/ShopItemView";
import { itemBySlug, shopItems } from "@/lib/shop";
import { share, SITE_URL } from "@/lib/share";

// صفحة منتج رقميّ: المحتوى من src/lib/shop.ts، والسعر حيّ من shop_products.
// منتج له صفحة عامّة (publicPath) تُعلَن وتُفهرَس هناك، وهذي نسخة المتجر المخفيّة.
export const dynamicParams = false;
export function generateStaticParams() {
  return shopItems.map((i) => ({ slug: i.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = itemBySlug((await params).slug);
  if (!i) return {};
  const title = `${i.name} — المتجر | إبراهيم سعود`;
  return {
    title, description: i.sub, robots: { index: false, follow: false },
    ...(i.publicPath ? { alternates: { canonical: `${SITE_URL}${i.publicPath}` } } : {}),
    ...share({ title, description: i.sub }, `/shop/${i.slug}/`),
  };
}

export default async function ShopItemPage({ params }: Props) {
  const i = itemBySlug((await params).slug);
  if (!i) notFound();
  return <ShopItemView item={i} />;
}
