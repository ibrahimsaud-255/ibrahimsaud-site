// مقالات قسم «بث الدروس العلمية وتصويرها» في المدوّنة — مكتوبة في الكود (لا في Supabase)
// فتُنشر مع الموقع نفسه وتُراجع في git. خريطة الكلمات اللي يستهدفها كلّ مقال:
// docs/بث-الدروس-كلمات-البحث.md
// قواعد المحتوى: البرنامج مستقلّ (لا ذكر لأيّ محرّك تحته)، لا أسعار بالأرقام، ولا مشاكل تقنيّة معقّدة.
// مقال جديد = ملفّ هنا + سطر في LIST. «الأسئلة الشائعة» في آخره تتحوّل لـFAQPage تلقائيّاً.
import type { Post } from "@/lib/blog";
import { SITE_URL } from "@/lib/share";
import pillar from "./how-to-live-stream-islamic-lessons";
import record from "./record-islamic-lessons-guide";
import app from "./lessons-broadcast-app-guide";
import phone from "./stream-lessons-from-phone";
import multi from "./stream-youtube-facebook-telegram-together";
import mosque from "./mosque-live-streaming-setup";
import book from "./show-book-in-live-lesson";
import publish from "./publish-archive-islamic-lessons";

export type LessonsPost = { slug: string; title: string; excerpt: string; cover: string; body: string };

// الترتيب = ترتيب الظهور (الأحدث أوّلاً)؛ الدليل الأساسيّ أوّلها.
const LIST: LessonsPost[] = [pillar, record, app, phone, multi, mosque, book, publish];

const BASE = Date.parse("2026-11-22T09:00:00Z");
const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

export const LESSONS_SLUGS = LIST.map((p) => p.slug);

export const LESSONS_POSTS: Post[] = LIST.map((p, i) => ({
  id: `lessons-${p.slug}`,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  body_html: p.body,
  cover_url: `${SITE_URL}${p.cover}`,
  greg_date: "",
  hijri_date: "",
  reading_min: Math.max(1, Math.round(words(p.body) / 200)),
  published_at: new Date(BASE - i * 60_000).toISOString(),
}));
