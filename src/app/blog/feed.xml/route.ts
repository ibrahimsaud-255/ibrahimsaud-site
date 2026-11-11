// خلاصة RSS للمدونة — تساعد جوجل وبينق وقارئات الأخبار تلقط المقالات الجديدة بسرعة.
import { SITE_URL } from "@/lib/share";
import { getPosts, plain, postUrl } from "@/lib/blog";

export const dynamic = "force-static";

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPosts();
  const items = posts.map((p) => `<item><title>${x(p.title)}</title><link>${postUrl(p)}</link><guid isPermaLink="true">${postUrl(p)}</guid><pubDate>${new Date(p.published_at).toUTCString()}</pubDate><description>${x(p.excerpt || plain(p.body_html).slice(0, 300))}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>مدونة إبراهيم سعود</title><link>${SITE_URL}/blog/</link><atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/><description>الذكاء الاصطناعي في الأعمال، وأنظمة الإدارة، وصناعة المحتوى.</description><language>ar</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
