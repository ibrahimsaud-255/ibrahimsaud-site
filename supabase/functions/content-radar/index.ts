// ╔══════════════════════════════════════════════════════════════╗
// ║  content-radar — Supabase Edge Function                        ║
// ║  وضعان:                                                        ║
// ║   • news  → أهم أخبار مجال إبراهيم من RSS مجاني → سكربتات.     ║
// ║   • story → قصص واقعية مختصرة (عربي ثم عالمي) للسرد.           ║
// ║  الكتابة عبر Google Gemini (طبقة مجانية). بلا تسجيل دخول.      ║
// ║  انشرها بدون تحقّق JWT:  --no-verify-jwt                       ║
// ╚══════════════════════════════════════════════════════════════╝
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SERVICES = [
  "كتابة النص الإعلاني",
  "التصوير الاحترافي",
  "تصوير درون",
  "التعليق الصوتي",
  "المونتاج والإخراج",
  "إنتاج بودكاست في استوديو سَعي",
];

// مصادر أخبار مجانية (Google News RSS)
const FEEDS = [
  { topic: "تقنية", url: "https://news.google.com/rss/search?q=%D8%AA%D9%82%D9%86%D9%8A%D8%A9%20OR%20%D8%B0%D9%83%D8%A7%D8%A1%20%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A&hl=ar&gl=SA&ceid=SA:ar" },
  { topic: "تقنية", url: "https://news.google.com/rss/search?q=artificial%20intelligence%20OR%20AI%20launch&hl=en-US&gl=US&ceid=US:en" },
  { topic: "أعمال", url: "https://news.google.com/rss/search?q=%D8%B1%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20OR%20%D8%B4%D8%B1%D9%83%D8%A7%D8%AA%20%D9%86%D8%A7%D8%B4%D8%A6%D8%A9&hl=ar&gl=SA&ceid=SA:ar" },
  { topic: "تسويق", url: "https://news.google.com/rss/search?q=%D8%AA%D8%B3%D9%88%D9%8A%D9%82%20%D8%B1%D9%82%D9%85%D9%8A%20OR%20%D8%B3%D9%88%D8%B4%D9%8A%D8%A7%D9%84%20%D9%85%D9%8A%D8%AF%D9%8A%D8%A7&hl=ar&gl=SA&ceid=SA:ar" },
  { topic: "بودكاست", url: "https://news.google.com/rss/search?q=%D8%A8%D9%88%D8%AF%D9%83%D8%A7%D8%B3%D8%AA%20OR%20%D8%B5%D9%86%D8%A7%D8%B9%D8%A9%20%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89&hl=ar&gl=SA&ceid=SA:ar" },
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

type NewsItem = { topic: string; title: string; url: string; pub: string; date: string };

function parseFeed(xml: string, topic: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const b of xml.split(/<item>/i).slice(1)) {
    const t = b.match(/<title>(.*?)<\/title>/s);
    const l = b.match(/<link>(.*?)<\/link>/s);
    const d = b.match(/<pubDate>(.*?)<\/pubDate>/s);
    const s = b.match(/<source[^>]*>(.*?)<\/source>/s);
    if (!t) continue;
    let title = decode(t[1]);
    let pub = s ? decode(s[1]) : "";
    const dash = title.lastIndexOf(" - ");
    if (!pub && dash > 0) { pub = title.slice(dash + 3); title = title.slice(0, dash); }
    else if (dash > 0 && title.endsWith(pub)) title = title.slice(0, dash);
    items.push({ topic, title, url: l ? decode(l[1]) : "", pub, date: d ? decode(d[1]) : "" });
  }
  return items;
}

async function gatherNews(): Promise<NewsItem[]> {
  let all: NewsItem[] = [];
  for (let attempt = 0; attempt < 2 && all.length === 0; attempt++) {
    if (attempt) await new Promise((res) => setTimeout(res, 1500));
    const got: NewsItem[] = [];
    await Promise.all(FEEDS.map(async (f) => {
      try {
        const r = await fetch(f.url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentRadar/1.0)" } });
        if (r.ok) got.push(...parseFeed(await r.text(), f.topic).slice(0, 12));
      } catch (_) { /* تجاهل */ }
    }));
    all = got;
  }
  const seen = new Set<string>();
  const uniq = all.filter((i) => {
    const k = i.title.toLowerCase().slice(0, 60);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  uniq.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  return uniq.slice(0, 18);
}

const IDEA_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      topic: { type: "STRING" },
      source_title: { type: "STRING" },
      source_url: { type: "STRING" },
      source_pub: { type: "STRING" },
      virality: { type: "STRING" },
      hook: { type: "STRING" },
      script: { type: "STRING" },
      screen_title: { type: "STRING" },
      footage: { type: "ARRAY", items: { type: "STRING" } },
      hashtags: { type: "ARRAY", items: { type: "STRING" } },
      service_tie: { type: "STRING" },
      cta: { type: "STRING" },
    },
    required: ["topic", "source_title", "hook", "script", "screen_title", "footage", "hashtags", "service_tie", "cta"],
  },
};

const GROQ_MODEL = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";

async function callLLM(prompt: string, key: string, temperature = 0.85) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature,
    }),
  });
  if (!r.ok) throw new Error("groq " + r.status + ": " + (await r.text()).slice(0, 1200));
  const data = await r.json();
  const txt = data?.choices?.[0]?.message?.content;
  if (!txt) throw new Error("رد فارغ من Groq");
  const parsed = JSON.parse(txt);
  const arr = Array.isArray(parsed)
    ? parsed
    : (Object.values(parsed).find((v) => Array.isArray(v)) as unknown[] | undefined) || [];
  if (!Array.isArray(arr) || !arr.length) throw new Error("تنسيق رد غير متوقع من النموذج");
  return arr as Record<string, unknown>[];
}

// ===== بحث حقيقي من ويكيبيديا (مجاني، بلا مفتاح) لتأصيل القصص =====
async function wikiSearch(query: string, lang: string): Promise<string | null> {
  try {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`;
    const r = await fetch(u, { headers: { "User-Agent": "ibrahimsaud-site/1.0" } });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.query?.search?.[0]?.title || null;
  } catch (_) { return null; }
}
async function wikiSummary(title: string, lang: string) {
  try {
    const u = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const r = await fetch(u, { headers: { "User-Agent": "ibrahimsaud-site/1.0" } });
    if (!r.ok) return null;
    const d = await r.json();
    if ((d.type || "").includes("disambiguation") || !d.extract) return null;
    return {
      extract: d.extract as string,
      url: d?.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch (_) { return null; }
}
async function research(query: string) {
  for (const lang of ["ar", "en"]) {
    const title = await wikiSearch(query, lang);
    if (!title) continue;
    const s = await wikiSummary(title, lang);
    if (s && s.extract.length > 120) return s;
  }
  return null;
}

function newsPrompt(news: NewsItem[], count: number) {
  const headlines = news.map((n, i) => `${i + 1}. ${n.title} — ${n.pub}`).join("\n");
  return `أنت كاتب محتوى لحساب «إبراهيم سعود | تقنية · أعمال · بودكاست».
الجمهور: السوق السعودي والخليجي. المنصّة: تيك توك / ريلز / شورتس.
الهدف: محتوى أخباري سريع الانتشار يبني اسم إبراهيم ويسوّق خدماته.
خدمات إبراهيم: ${SERVICES.join("، ")}.

أهم العناوين الآن:
${headlines}

اختر أقوى ${count} أخبار (انتشاراً وصلةً بمجاله)، وحوّل كل خبر لفكرة فيديو قصير:
- topic: صنّف المجال (تقنية/أعمال/تسويق/بودكاست).
- source_title: انسخ عنوان الخبر حرفياً من القائمة، **بدون أي أقواس أو تصنيف أو إضافات**.
- source_pub: الجهة الناشرة كما وردت.
- virality: سطر يشرح ليش قابل للانتشار.
- hook: جملة صادمة أو سؤال مثير يوقف التمرير فوراً، لهجة سعودية بيضاء. **إذا في العنوان رقم أو مبلغ أو نسبة لافتة، ضعها في الهوك** (مثال: «سوق البودكاست بيوصل ٣٩ مليار دولار!»). ⛔ تجنّب الجمل الضعيفة المبهمة.
- script: يُقرأ في 30–45 ثانية، لهجة سعودية/خليجية محكية طبيعية، يبسّط الخبر ويعطي زاوية/فائدة. **مهم: إذا فيه أرقام أو مبالغ أو نسب أو تواريخ في العنوان فاذكرها صراحةً في السكربت — لأنها تثبت الخبر وتقوّيه.** القاعدة: استخدم كل المعطيات الموجودة في العنوان، والممنوع فقط **اختراع** أرقام أو اقتباسات أو تفاصيل غير موجودة في العنوان.
- **اكتب الهوك والسكربت بالعربية فقط — ممنوع أي حرف غير عربي فيهما** (footage فقط إنجليزي).
- screen_title: 3–6 كلمات للعرض على الشاشة.
- footage: 3–5 كلمات بحث إنجليزية للقطات (B-roll).
- hashtags: 5–7 هاشتاقات.
- service_tie: أنسب خدمة من خدماته.
- cta: جملة ختام تدعو لطلب خدمته بسلاسة.
أرجِع كائن JSON فقط بالشكل: {"ideas": [ ... ]} حيث كل عنصر يحتوي الحقول أعلاه. بدون أي نص خارج JSON.`;
}

// قائمة مرشّحين منسّقة يدوياً — كلهم حقيقيون في مجالات إبراهيم ولهم صفحة ويكيبيديا.
// النموذج لا يختار الأشخاص؛ يكتب فقط من نص ويكيبيديا (يمنع الخروج عن المجال والهلوسة).
const STORY_SEEDS: { name: string; topic: string }[] = [
  // عربي
  { name: "محمد العبار", topic: "أعمال" },
  { name: "فادي غندور", topic: "أعمال" },
  { name: "نجيب ساويرس", topic: "أعمال" },
  { name: "طلال أبو غزالة", topic: "أعمال" },
  { name: "صالح كامل", topic: "أعمال" },
  { name: "لبنى العليان", topic: "أعمال" },
  { name: "الوليد بن طلال", topic: "أعمال" },
  { name: "أحمد الشقيري", topic: "بودكاست" },
  { name: "محمد بن عبد الملك آل الشيخ", topic: "تقنية" },
  // عالمي
  { name: "ستيف جوبز", topic: "تقنية" },
  { name: "إيلون ماسك", topic: "تقنية" },
  { name: "جيف بيزوس", topic: "أعمال" },
  { name: "بيل غيتس", topic: "تقنية" },
  { name: "مارك زوكربيرغ", topic: "تقنية" },
  { name: "سام ألتمان", topic: "تقنية" },
  { name: "جاك ما", topic: "أعمال" },
  { name: "وارن بافيت", topic: "أعمال" },
  { name: "هوارد شولتز", topic: "أعمال" },
  { name: "ريتشارد برانسون", topic: "أعمال" },
  { name: "ساتيا ناديلا", topic: "تقنية" },
  { name: "سوندار بيتشاي", topic: "تقنية" },
  { name: "جو روغان", topic: "بودكاست" },
  { name: "أوبرا وينفري", topic: "بودكاست" },
  { name: "غاري فاينرتشوك", topic: "تسويق" },
];
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// المرحلة 3: كتابة القصص معتمداً **حصرياً** على نصوص ويكيبيديا المرفقة
function storyWritePrompt(sources: { name: string; topic: string; extract: string }[]) {
  const blocks = sources.map((s, i) => `[${i + 1}] ${s.name} (${s.topic}):\n${s.extract}`).join("\n\n");
  return `أنت كاتب قصص لحساب «إبراهيم سعود | تقنية · أعمال · بودكاست». إبراهيم سرّاد يقف أمام الكاميرا ويروي بحماس. المنصّة: تيك توك/ريلز.
خدمات إبراهيم: ${SERVICES.join("، ")}.

التزم بقاعدتين صارمتين:
1) **اكتب كل قصة معتمداً حصرياً على المعلومات المرفقة أدناه من ويكيبيديا.** ممنوع منعاً باتاً إضافة أي اسم أو رقم أو تاريخ أو حدث غير موجود في النص المرفق. إذا كانت المعلومات قليلة، اكتب قصة أقصر بدل أن تختلق.
2) **اكتب بالعربية الفصيحة المبسّطة فقط — ممنوع أي كلمة إنجليزية داخل الهوك أو السرد** (حقل footage فقط يكون إنجليزياً).

المصادر:
${blocks}

لكل مصدر أنتج عنصراً فيه:
- topic: المجال.
- source_title: اسم الشخصية/الشركة كما هو.
- source_pub: "عربي" إن كانت الشخصية/الشركة من دولة عربية، وإلا "عالمي".
- virality: سطر يلخّص ليش القصة ملهمة.
- hook: جملة صادمة أو سؤال مثير أو مفارقة تشدّ المشاهد فوراً، لهجة سعودية بيضاء. ⛔ ممنوع تبدأ بـ«إليك قصة» أو «تعرف على» أو «هذا هو». مثال للأسلوب: «واحد بدأ من تحت الصفر… واليوم اسمه يتردّد في كل مكان».
- script: **سرد قصصي حماسي** (مو تعريف موسوعي!) بلهجة سعودية/خليجية محكية (30–60 ثانية): ابدأ بموقف أو تحدٍّ، ثم التحوّل، ثم درس مؤثّر في النهاية. استخدم الحقائق المرفقة فقط لكن احكها كقصة فيها مشاعر وإيقاع — لا تسرد سيرة جافة.
- screen_title: 3–6 كلمات.
- footage: 3–5 كلمات بحث إنجليزية للقطات (B-roll).
- hashtags: 5–7 هاشتاقات.
- service_tie: أنسب خدمة من خدمات إبراهيم.
- cta: جملة ختام تربط القصة بخدمته.
أرجِع كائن JSON فقط: {"ideas":[ ... ]}.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GROQ_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_KEY) return json({ error: "مفتاح Groq غير مضبوط (GROQ_API_KEY)." }, 500);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "story" ? "story" : "news";
    const count = Math.min(Math.max(Number(body.count) || 5, 1), 8);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    let ideas: Record<string, unknown>[];
    if (mode === "story") {
      // تجنّب تكرار القصص الأخيرة
      const { data: recent } = await admin
        .from("content_ideas").select("source_title")
        .eq("kind", "story").order("created_at", { ascending: false }).limit(40);
      const avoid = (recent || []).map((r) => String(r.source_title)).filter(Boolean);

      // قائمة منسّقة → بحث ويكيبيديا حقيقي → كتابة من المصدر فقط
      const pool = shuffle(STORY_SEEDS.filter((s) => !avoid.includes(s.name)));
      const sources: { name: string; topic: string; extract: string; url: string }[] = [];
      for (const c of (pool.length ? pool : shuffle(STORY_SEEDS))) {
        if (sources.length >= count) break;
        const info = await research(c.name);
        if (info) sources.push({ name: c.name, topic: c.topic, extract: info.extract.slice(0, 650), url: info.url });
      }
      if (!sources.length) return json({ error: "تعذّر العثور على مصادر موثوقة الآن، حاول مرة أخرى." }, 502);

      ideas = await callLLM(storyWritePrompt(sources), GROQ_KEY, 0.7);
      // اربط رابط ويكيبيديا الحقيقي بالاسم
      const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
      for (const x of ideas) {
        const hit = sources.find((s) => norm(s.name) === norm(String(x.source_title)) ||
          norm(s.name).includes(norm(String(x.source_title)).slice(0, 10)));
        if (hit) x.source_url = hit.url;
      }
    } else {
      const news = await gatherNews();
      if (!news.length) return json({ error: "تعذّر جلب الأخبار الآن، حاول بعد قليل." }, 502);
      ideas = await callLLM(newsPrompt(news, count), GROQ_KEY, 0.7);
      // ربط الرابط الحقيقي بمطابقة العنوان (النموذج لا يرى الروابط لتوفير التوكنات)
      const norm = (s: string) => (s || "").replace(/^\s*\[[^\]]*\]\s*/, "").toLowerCase().replace(/\s+/g, " ").trim();
      for (const x of ideas) {
        x.source_title = String(x.source_title || "").replace(/^\s*\[[^\]]*\]\s*/, "").trim();
        const t = norm(String(x.source_title));
        const hit = news.find((n) => {
          const nt = norm(n.title);
          return t.length > 8 && (nt.includes(t.slice(0, 20)) || t.includes(nt.slice(0, 20)));
        });
        if (hit) { x.source_url = hit.url; x.source_pub = hit.pub || x.source_pub; }
      }
    }

    const batch_id = crypto.randomUUID();
    const rows = ideas.map((x) => ({
      owner: null,
      batch_id,
      kind: mode,
      topic: x.topic ?? null,
      source_title: x.source_title ?? null,
      source_url: x.source_url ?? null,
      source_pub: x.source_pub ?? null,
      virality: x.virality ?? null,
      hook: x.hook ?? null,
      script: x.script ?? null,
      screen_title: x.screen_title ?? null,
      footage: Array.isArray(x.footage) ? x.footage : null,
      hashtags: Array.isArray(x.hashtags) ? x.hashtags : null,
      service_tie: x.service_tie ?? null,
      cta: x.cta ?? null,
      status: "new",
    }));
    const { data: inserted, error } = await admin.from("content_ideas").insert(rows).select();
    if (error) return json({ error: "تعذّر الحفظ: " + error.message }, 500);

    return json({ batch_id, mode, count: inserted.length, ideas: inserted });
  } catch (e) {
    return json({ error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
