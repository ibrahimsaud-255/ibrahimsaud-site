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
  // مقالات الجمعيّات (نوفمبر ٢٠٢٦ — مسوّدات تُنشر معاً لأنّها تربط ببعض)
  "6dd518ab-6d95-4d7b-8773-8cca6a09e8ae": "charity-management-system-features",
  "a2ecb181-c9ca-4ba1-8118-0bb80856825d": "charity-payment-voucher-approval-workflow",
  "4ff6906f-5832-4cf6-b99f-649908110368": "nonprofit-governance-digital",
  "ac7e2afe-fbdd-48fd-befe-7268042d9373": "charity-website-essentials",
  "d4b36062-e434-4100-aebe-3062d331e951": "volunteer-management-system",  // مكتبة التأسيس (نوفمبر ٢٠٢٦): مقالات طويلة لكلّ ما يبحث عنه عملاء الأنظمة والجمعيّات والذكاء الاصطناعي والإعلانات
  "2159b8b9-fbda-4b67-984d-166594415c73": "erp-system-guide-saudi",
  "5c96e8ad-ac4b-48dc-9605-a20ecc6499d5": "accounting-system-small-business",
  "2055f176-a2c3-4122-9baa-8fa26eb4c680": "invoicing-quotation-system",
  "895bba56-7779-4692-9d58-dfd1d3c59d14": "e-invoicing-saudi-guide",
  "39f42217-7635-46c2-8ecf-49c82e5f79ec": "crm-system-small-business",
  "23709e01-7c00-478c-a1b1-409581adf126": "inventory-management-system",
  "66105faf-e752-470f-ad00-80c01c6400a4": "replace-excel-whatsapp-system",
  "f13992eb-16ee-4c98-9131-a79c9b7f029a": "ready-made-vs-custom-system",
  "2b9c4f1a-b170-45e0-8cdb-c86fe52720c6": "saas-vs-owned-system-cost",
  "0dd0ba6a-4c5b-4b9d-b804-5d4917639d91": "project-task-management-system",
  "d9c6bcd5-b8cc-404f-92b0-b23d68216d25": "hr-system-small-business",
  "9282d55c-f525-4906-9afb-4552604c6f6f": "ai-built-business-systems",
  "d403a28b-431c-45de-9329-e88620d1dc83": "how-to-choose-software-developer",
  "98b2028b-1171-46d8-9a6d-f199c24f827f": "freelancer-business-system",
  "7ca3df46-4b68-4642-9450-f906bea51758": "digital-transformation-small-business",
  "32350b41-2f20-4b5c-affa-6f7799d0c36a": "nonprofit-accounting-guide",
  "9c9114e5-e757-4f2c-9220-3def38a9da93": "beneficiary-management-system",
  "05461b53-793b-4399-b2d9-94a3d9e323cd": "nonprofit-digital-transformation",
  "8b6542d8-0bfd-4e64-87e2-9d4c0fafb803": "donation-donor-management",
  "b9c022fe-b5cb-4e14-8d10-4c62e691be27": "charity-reports-transparency",
  "8cbce4d1-bb99-44e5-95d4-0a0041ed020e": "ai-workshop-for-companies",
  "f62894e6-8639-46a9-878f-1a2af45e3e1d": "ai-use-cases-small-business",
  "dcd8a7c5-9f6f-4458-aca6-56e6f3b42f28": "ai-usage-policy-template",
  "9e13eb11-e364-4469-95a6-53552e8e5224": "claude-vs-chatgpt-vs-gemini",
  "c9ad0112-36e7-444d-9195-f0106d545633": "prompt-writing-guide-arabic",
  "1b9d14c6-8ffa-42cd-a942-f642232be2f0": "ai-workshop-for-schools-students",
  "4458be90-eff7-4085-88dd-f3f4876a0632": "ai-for-nonprofits",
  "bd3417f1-f8e2-4d93-a07f-b4e0b3bb4106": "build-with-ai-without-coding",
  "0b79a69d-f13f-479a-8c0e-f7bb494356ec": "store-video-ads-guide",
  "bc40c56a-8c94-496b-85f6-d37caaee0bdb": "video-ad-production-cost-saudi",
  "5c06c46d-6efa-47c9-ba14-e8ac6b7c14f0": "ad-script-hook-guide",
  "483c98b2-334e-415b-aa79-8dada791ebe7": "company-profile-video",
  "8e22ac8a-ec3a-49b7-ba67-968910e651a1": "business-podcast-guide",
  "2ea44f11-9df0-43c9-affd-e9d782cd2ae4": "personal-branding-linkedin",
  "892d736f-7f3e-4dd0-8012-69ca845ccf6a": "company-website-design-saudi",
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

// تنظيف HTML المقال: وسوم التنسيق والجداول بلا خصائص.
// والروابط: <a href> فقط، لصفحات الموقع (/...) أو https — للربط الداخليّ بين المقالات وصفحات الخدمات.
const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "blockquote", "strong", "em", "br", "a", "table", "thead", "tbody", "tr", "th", "td"]);
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

// ===== أقسام المدوّنة =====
// كلّ مقال ينتمي لقسم (من رابطه): يُجمَع تحته في صفحة المدوّنة، ويأخذ دعوة الخدمة المناسبة،
// وتُقترح عليه مقالات قسمه، وتعرض صفحة الخدمة مقالات قسمها (BlogLinks).
export type TopicKey = "systems" | "charities" | "ai" | "media" | "journal";
export const TOPICS: Record<TopicKey, { name: string; cta: { title: string; text: string; href: string; label: string } }> = {
  charities: {
    name: "أنظمة الجمعيّات",
    cta: { title: "تبي نظام لجمعيّتكم؟", text: "سندات صرف بدورة اعتماد، ومحاسبة غير ربحيّة، ومستفيدون وتطوّع وحوكمة، وموقع يُدار من النظام. جرّبوا نظام جمعيّة حقيقيّ قبل أيّ كلام، والكود وقاعدة البيانات باسم الجمعيّة.", href: "/systems/charities/", label: "نظام الجمعيّات" },
  },
  systems: {
    name: "أنظمة الإدارة للمنشآت",
    cta: { title: "تبي نظام لمنشأتك؟", text: "عروض أسعار وفواتير ومحاسبة وعملاء ومشاريع في نظام واحد على مقاسك. دفعة وحدة بلا اشتراك، والكود باسمك، وأعلّمك تطوّره بنفسك مع Claude.", href: "/systems/", label: "النظام" },
  },
  ai: {
    name: "الذكاء الاصطناعي في العمل",
    cta: { title: "ورشة ذكاء اصطناعي لفريقك؟", text: "ورش حضوريّة أو عن بعد، مبنيّة على شغل جهتكم: كيف تكلّمونه صحّ، والأدوات اللي تفرق، وكلّ واحد يطلع وقد طبّق بيده.", href: "/ai/", label: "ورش الذكاء الاصطناعي" },
  },
  media: {
    name: "الإعلانات والفيديو والحضور",
    cta: { title: "تبي إعلان يبيع أو محتوى يعرّف بك؟", text: "إعلانات طوليّة للمتاجر من ٧٥٠ ريال بتسليم خلال ٣ أيّام، وبودكاست وفيلم تعريفيّ، وباقات حضور كاملة.", href: "/ad-packages/", label: "باقات الإعلانات" },
  },
  journal: {
    name: "يوميّات وأفكار",
    cta: { title: "تبغى نظام لمنشأتك أو ورشة لفريقك؟", text: "أبني أنظمة إدارة عربيّة تملكها بدل الاشتراكات، وأدرّب الفرق على الذكاء الاصطناعي في شغلهم اليوميّ.", href: "/systems/", label: "النظام" },
  },
};
export const TOPIC_ORDER: TopicKey[] = ["systems", "charities", "ai", "media", "journal"];

const TOPIC_OF: Record<string, TopicKey> = {};
const put = (t: TopicKey, slugs: string) => slugs.split(/\s+/).filter(Boolean).forEach((s) => (TOPIC_OF[s] = t));
put("systems", `erp-system-guide-saudi accounting-system-small-business invoicing-quotation-system e-invoicing-saudi-guide
  crm-system-small-business inventory-management-system replace-excel-whatsapp-system ready-made-vs-custom-system
  saas-vs-owned-system-cost project-task-management-system hr-system-small-business ai-built-business-systems
  how-to-choose-software-developer freelancer-business-system digital-transformation-small-business
  erp-system-cost-small-business own-your-system-source-code develop-your-system-with-claude company-website-design-saudi`);
put("charities", `charity-management-system-own-or-subscribe charity-management-system-features charity-payment-voucher-approval-workflow
  nonprofit-governance-digital charity-website-essentials volunteer-management-system nonprofit-accounting-guide
  beneficiary-management-system nonprofit-digital-transformation donation-donor-management charity-reports-transparency`);
put("ai", `ai-workshop-for-companies ai-use-cases-small-business ai-usage-policy-template claude-vs-chatgpt-vs-gemini
  prompt-writing-guide-arabic ai-workshop-for-schools-students ai-for-nonprofits build-with-ai-without-coding reading-and-writing-in-the-ai-era`);
put("media", `store-video-ads-guide video-ad-production-cost-saudi ad-script-hook-guide company-profile-video business-podcast-guide
  personal-branding-linkedin creative-director-one-vision from-idea-to-screen`);

export const topicOf = (p: Pick<Post, "id" | "slug">): TopicKey => TOPIC_OF[slugFor(p)] || "journal";

// مقالات مقترحة: من نفس القسم أوّلاً، ثمّ الباقي.
export function related(p: Post, all: Post[], n = 4): Post[] {
  const t = topicOf(p);
  const others = all.filter((x) => x.id !== p.id);
  return [...others.filter((x) => topicOf(x) === t), ...others.filter((x) => topicOf(x) !== t)].slice(0, n);
}

// تاريخ المقال: الحقل المكتوب من اللوحة، وإلّا يُحسب من تاريخ النشر.
export function dateLabel(p: Pick<Post, "greg_date" | "published_at">): string {
  if (p.greg_date) return p.greg_date;
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(p.published_at));
  } catch {
    return "";
  }
}

// «أسئلة شائعة» في آخر المقال (h2 ثمّ أزواج h3/p) → FAQPage لجوجل.
export function faqsOf(html: string): { q: string; a: string }[] {
  const clean = sanitize(html);
  const i = clean.search(/<h2>\s*(الأسئلة الشائعة|أسئلة شائعة)\s*<\/h2>/);
  if (i < 0) return [];
  const rest = clean.slice(i).replace(/^<h2>[\s\S]*?<\/h2>/, "");
  const end = rest.search(/<h2>/);
  const part = end < 0 ? rest : rest.slice(0, end);
  const out: { q: string; a: string }[] = [];
  const re = /<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(part))) {
    const q = m[1].replace(/<[^>]+>/g, "").trim();
    const a = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (q && a) out.push({ q, a });
  }
  return out;
}
