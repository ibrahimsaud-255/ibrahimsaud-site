// المدونة: تُقرأ من Supabase وقت البناء وتطلع صفحات HTML ثابتة يقرؤها جوجل
// (بدل الصفحة القديمة اللي كانت ترسم المقال بالجافاسكربت على رابط ?id=).
// تكتب من لوحة النظام (16-blog.js) كالعادة، والموقع يُعاد بناؤه تلقائياً
// لمّا يتغيّر شي في المقالات (فحص كل نصف ساعة في deploy.yml).
import { SITE_URL } from "@/lib/share";

const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
// مفتاح علنيّ (sb_publishable_) — الحماية في RLS: القراءة للمنشور فقط.
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

export type Post = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt: string;
  body_html: string;
  cover_url: string;
  greg_date: string;
  hijri_date: string;
  reading_min: number;
  published_at: string;
};

export type BlogSettings = { author_name: string; author_title: string; author_avatar_url: string };

// روابط المقالات القديمة (قبل عمود slug في قاعدة البيانات). أيّ مقال له slug
// في الجدول يغلب هذي القائمة، وأيّ مقال بدونهما ياخذ أوّل ٨ خانات من معرّفه.
const LEGACY_SLUGS: Record<string, string> = {
  "e9bdb90c-3bac-4c73-b4ae-5ee037ea9519": "creative-director-one-vision",
  "2a67f5c6-468d-4453-aec2-e06e95200f2c": "who-is-ibrahim-saud",
  "db28fb2a-0909-45a4-9a93-1e5cbd1de00e": "from-idea-to-screen",
  "ba254b8c-69e5-41f1-95f0-bb190e353fda": "riyadh-or-alahsa-next-step",
  "d790f74b-563c-4844-a3c1-496d9a8f135b": "experience-meets-vision",
  "1a660506-426d-49c6-8774-2d7084214113": "reading-and-writing-in-the-ai-era",
  "b1ee1924-d172-42e7-8aed-a3072aeb2114": "nahnu-narzuquk",
  // مقالات «تملك نظامك» (نوفمبر ٢٠٢٦ — مسوّدات تُنشر من اللوحة)
  "e9b5ef13-47fb-425f-b038-c5366e2bcd52": "charity-management-system-own-or-subscribe",
  "b94b1062-042a-4b8e-856b-dda12f0b8b32": "erp-system-cost-small-business",
  "b2328098-9a51-46c3-9a42-ce6a8b04bdc3": "own-your-system-source-code",
  "63259447-f988-4b22-8180-cc39dd89b288": "develop-your-system-with-claude",
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugFor(p: Pick<Post, "id" | "slug">): string {
  const s = (p.slug || "").trim().toLowerCase();
  if (s && SLUG_RE.test(s)) return s;
  return LEGACY_SLUGS[p.id] || `p-${p.id.slice(0, 8)}`;
}

export const postUrl = (p: Pick<Post, "id" | "slug">) => `${SITE_URL}/blog/${slugFor(p)}/`;

async function rest<T>(path: string): Promise<T> {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, cache: "force-cache" });
  // نُفشل البناء بدل ما ننشر مدوّنة فاضية لو Supabase ما ردّ.
  if (!r.ok) throw new Error(`Supabase ${path}: HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

let postsCache: Promise<Post[]> | null = null;
export function getPosts(): Promise<Post[]> {
  postsCache ??= rest<Post[]>("posts?select=*&status=eq.published&order=published_at.desc");
  return postsCache;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => slugFor(p) === slug);
}

export async function getSettings(): Promise<BlogSettings> {
  const fallback = { author_name: "إبراهيم سعود", author_title: "بين التقنية والأعمال", author_avatar_url: "" };
  try {
    const rows = await rest<BlogSettings[]>("blog_settings?select=author_name,author_title,author_avatar_url&id=eq.1");
    return { ...fallback, ...(rows[0] || {}) };
  } catch {
    return fallback;
  }
}

// بصمة المقالات المنشورة — نفس الصيغة اللي يحسبها deploy.yml بـ jq ليعرف هل
// تغيّر شي يستاهل إعادة النشر. لا تغيّرها هنا بدون ما تغيّرها هناك.
export async function blogVersion(): Promise<string> {
  return (await getPosts()).map((p) => `${p.id}@${p.published_at}@${p.slug || ""}`).join(",");
}

// تنظيف HTML المقال: نفس القائمة البيضاء في الصفحة القديمة — وسوم التنسيق بلا خصائص.
// والروابط: <a href> فقط، لصفحات الموقع (/...) أو https — للربط الداخليّ بين المقالات وصفحات الخدمات.
const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "blockquote", "strong", "em", "br", "a"]);
function safeHref(tag: string): string | null {
  const m = tag.match(/\shref\s*=\s*"([^"]*)"/i) || tag.match(/\shref\s*=\s*'([^']*)'/i);
  const href = m?.[1].trim() || "";
  return /^(\/(?!\/)|https:\/\/)/.test(href) ? href.replace(/"/g, "&quot;") : null;
}
export function sanitize(html: string): string {
  return (html || "")
    .replace(/<(script|style|iframe|object)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-zA-Z0-9]+)\b[^>]*>/g, (m, tag: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return "";
      if (t === "br") return "<br>";
      if (m.startsWith("</")) return `</${t}>`;
      if (t === "a") {
        const href = safeHref(m);
        if (!href) return "<a>";
        return href.startsWith("/") || href.startsWith("https://ibrahimsaud.com") ? `<a href="${href}">` : `<a href="${href}" rel="noopener" target="_blank">`;
      }
      return `<${t}>`;
    });
}

export const plain = (html: string) => sanitize(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
