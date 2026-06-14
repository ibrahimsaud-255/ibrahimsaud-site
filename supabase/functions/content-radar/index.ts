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
  const all: NewsItem[] = [];
  await Promise.all(FEEDS.map(async (f) => {
    try {
      const r = await fetch(f.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (r.ok) all.push(...parseFeed(await r.text(), f.topic).slice(0, 12));
    } catch (_) { /* تجاهل */ }
  }));
  const seen = new Set<string>();
  const uniq = all.filter((i) => {
    const k = i.title.toLowerCase().slice(0, 60);
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  uniq.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  return uniq.slice(0, 40);
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

async function callGemini(prompt: string, key: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: IDEA_SCHEMA, temperature: 0.95 },
    }),
  });
  if (!r.ok) throw new Error("gemini " + r.status + ": " + (await r.text()).slice(0, 300));
  const data = await r.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error("رد فارغ من Gemini");
  return JSON.parse(txt) as Record<string, unknown>[];
}

function newsPrompt(news: NewsItem[], count: number) {
  const headlines = news.map((n, i) => `${i + 1}. [${n.topic}] ${n.title} — ${n.pub} | ${n.url}`).join("\n");
  return `أنت كاتب محتوى لحساب «إبراهيم سعود | تقنية · أعمال · بودكاست».
الجمهور: السوق السعودي والخليجي. المنصّة: تيك توك / ريلز / شورتس.
الهدف: محتوى أخباري سريع الانتشار يبني اسم إبراهيم ويسوّق خدماته.
خدمات إبراهيم: ${SERVICES.join("، ")}.

أهم العناوين الآن:
${headlines}

اختر أقوى ${count} أخبار (انتشاراً وصلةً بمجاله)، وحوّل كل خبر لفكرة فيديو قصير:
- topic: المجال (تقنية/أعمال/تسويق/بودكاست).
- source_title و source_url و source_pub: من الخبر (انسخ الرابط كما هو).
- virality: سطر يشرح ليش قابل للانتشار.
- hook: أول 3 ثواني — جملة توقف التمرير، لهجة سعودية بيضاء.
- script: يُقرأ في 30–45 ثانية، لهجة سعودية/خليجية محكية طبيعية، يبسّط الخبر ويعطي زاوية/فائدة. لا أرقام غير مؤكدة.
- screen_title: 3–6 كلمات للعرض على الشاشة.
- footage: 3–5 كلمات بحث إنجليزية للقطات (B-roll).
- hashtags: 5–7 هاشتاقات.
- service_tie: أنسب خدمة من خدماته.
- cta: جملة ختام تدعو لطلب خدمته بسلاسة.
أرجِع مصفوفة JSON فقط.`;
}

function storyPrompt(count: number, avoid: string[]) {
  return `أنت كاتب قصص لحساب «إبراهيم سعود | تقنية · أعمال · بودكاست».
إبراهيم سرّاد ممتاز يقف أمام الكاميرا ويروي القصة بحماس. المنصّة: تيك توك / ريلز / شورتس.
خدمات إبراهيم: ${SERVICES.join("، ")}.

اكتب ${count} قصص **واقعية ومشهورة وموثّقة** عن أشخاص أو شركات في مجالات: الأعمال/البزنس، التسويق، عالم البودكاست وصناعة المحتوى، والتقنية.
ابدأ بقصص من **العالم العربي أولاً** (السعودية والخليج ثم بقية العرب) ثم قصص **عالمية** من مختلف الدول.
${avoid.length ? `لا تكرّر هذي الشخصيات/الشركات: ${avoid.join("، ")}.` : ""}

لكل قصة:
- topic: المجال (أعمال/تسويق/بودكاست/تقنية).
- source_title: اسم الشخصية أو الشركة.
- source_pub: "عربي" أو "عالمي".
- source_url: اتركه فارغاً "".
- virality: سطر يلخّص ليش القصة ملهمة/جذّابة.
- hook: أول جملة تشدّ المشاهد، لهجة سعودية بيضاء.
- script: سرد مختصر يُقال في 30–60 ثانية بلهجة سعودية/خليجية محكية بحماس، فيه بداية وتحدٍّ وتحوّل ودرس واضح في النهاية. اعتمد على الحقائق المعروفة فقط، وتجنّب الأرقام والتواريخ الدقيقة غير المؤكدة.
- screen_title: 3–6 كلمات للعرض على الشاشة.
- footage: 3–5 كلمات بحث إنجليزية للقطات (B-roll) تناسب القصة.
- hashtags: 5–7 هاشتاقات.
- service_tie: أنسب خدمة من خدمات إبراهيم تُذكر بسلاسة.
- cta: جملة ختام تربط القصة بخدمته وتدعو للطلب.
أرجِع مصفوفة JSON فقط.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) return json({ error: "مفتاح Gemini غير مضبوط (GEMINI_API_KEY)." }, 500);

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
      const avoid = (recent || []).map((r) => r.source_title).filter(Boolean) as string[];
      ideas = await callGemini(storyPrompt(count, avoid), GEMINI_KEY);
    } else {
      const news = await gatherNews();
      if (!news.length) return json({ error: "تعذّر جلب الأخبار الآن، حاول بعد قليل." }, 502);
      ideas = await callGemini(newsPrompt(news, count), GEMINI_KEY);
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
