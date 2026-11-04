import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/share";

// خريطة الموقع لقوقل: الصفحات العامّة فقط (صفحات العملاء الخاصّة ونسخ العرض برّا).
export const dynamic = "force-static";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/ai/", priority: 0.9 },
  { path: "/build/", priority: 0.9 },
  { path: "/systems/", priority: 0.9 },
  { path: "/brand/", priority: 0.7 },
  { path: "/video/", priority: 0.6 },
  { path: "/store/", priority: 0.6 },
  { path: "/ad-packages/", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: new Date(), changeFrequency: "weekly", priority: p.priority }));
}
