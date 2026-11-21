import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/share";
import { getPosts, postUrl } from "@/lib/blog";

// خريطة الموقع لقوقل: الصفحات العامّة فقط (صفحات العملاء الخاصّة ونسخ العرض برّا).
export const dynamic = "force-static";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/content/", priority: 0.9 },
  { path: "/lessons-broadcast/", priority: 0.9 },
  { path: "/ai/", priority: 0.9 },
  { path: "/systems/charities/", priority: 0.9 },
  { path: "/systems/charities/youth-clubs/", priority: 0.8 },
  { path: "/systems/charities/transparency/", priority: 0.8 },
  { path: "/systems/charities/regulation-1447/", priority: 0.8 },
  { path: "/video/", priority: 0.6 },
  { path: "/ad-packages/", priority: 0.5 },
  { path: "/blog/", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // كلّ مقال بتاريخ نشره الحقيقيّ — جوجل يعتمد lastModified ليعرف وش الجديد.
  const posts = (await getPosts()).map((p) => ({ url: postUrl(p), lastModified: new Date(p.published_at), changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: now, changeFrequency: "weekly" as const, priority: p.priority })), ...posts];
}
