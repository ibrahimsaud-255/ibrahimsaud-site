// ╔══════════════════════════════════════════════════════════════╗
// ║  content-radar — Supabase Edge Function                        ║
// ║  يجيب أهم أخبار مجال إبراهيم سعود من RSS مجاني،                 ║
// ║  ويعيد كتابتها سكربتات «أخبار تيك توك» بلهجة سعودية/خليجية       ║
// ║  عبر Google Gemini (طبقة مجانية)، ويحفظها في content_ideas.    ║
// ╚══════════════════════════════════════════════════════════════╝
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "ibrahimsaud25@gmail.com";

// خدمات إبراهيم — يربط الذكاء كل فكرة بأنسب خدمة
const SERVICES = [
  "كتابة النص الإعلاني",
  "التصوير الاحترافي",
  "تصوير درون",
  "التعليق الصوتي",
  "المونتاج والإخراج",
  "إنتاج بودكاست في استوديو سَعي",
];

// مصادر أخبار مجانية (Google News RSS) — مجال: تقنية / أعمال / تسويق / بودكاست
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
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// استخراج عناصر RSS بدون مكتبات — كافٍ لصيغة Google News
function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
}

function parseFeed(xml: string, topic: string) {
  const items: { topic: string; title: string; url: string; pub: string; date: string }[] = [];
  const blocks = xml.split(/<item>/i).slice(1);
  for (const b of blocks) {
    const t = b.match(/<title>(.*?)<\/title>/s);
    const l = b.match(/<link>(.*?)<\/link>/s);
    const d = b.match(/<pubDate>(.*?)<\/pubDate>/s);
    const s = b.match(/<source[^>]*>(.*?)<\/source>/s);
    if (!t) continue;
    let title = decode(t[1]);
    let pub = s ? decode(s[1]) : "";
    // Google News يضع " - المصدر" في نهاية العنوان
    const dash = title.lastIndexOf(" - ");
    if (!pub && dash > 0) { pub = title.slice(dash + 3); title = title.slice(0, dash); }
    else if (dash > 0 && title.endsWith(pub)) title = title.slice(0, dash);
    items.push({ topic, title, url: l ? decode(l[1]) : "", pub, date: d ? decode(d[1]) : "" });
  }
  return items;
}

async function gatherNews() {
  const all: { topic: string; title: string; url: string; pub: string; date: string }[] = [];
  await Promise.all(FEEDS.map(async (f) => {
    try {
      const r = await fetch(f.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!r.ok) return;
      const xml = await r.text();
      all.push(...parseFeed(xml, f.topic).slice(0, 12));
    } catch (_) { /* تجاهل المصدر المتعطّل */ }
  }));
  // إزالة التكرار + الأحدث أولاً
  const seen = new Set<string>();
  const uniq = all.filter((i) => {
    const k = i.title.toLowerCase().slice(0, 60);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
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

type NewsItem = { topic: string; title: string; url: string; pub: string; date: string };

async function writeScripts(news: NewsItem[], count: number, geminiKey: string) {
  const headlines = news.map((n, i) => `${i + 1}. [${n.topic}] ${n.title} — ${n.pub} | ${n.url}`).join("\n");
  const prompt = `أنت كاتب محتوى لحساب «إبراهيم سعود | تقنية · أعمال · بودكاست».
الجمهور: السوق السعودي والخليجي. المنصّة: تيك توك / ريلز / شورتس.
الهدف: محتوى أخباري سريع الانتشار يبني اسم إبراهيم ويسوّق خدماته.

خدمات إبراهيم: ${SERVICES.join("، ")}.

هذي أهم العناوين من آخر الأخبار:
${headlines}

اختر أقوى ${count} أخبار من ناحية قابلية الانتشار والصلة بمجال إبراهيم، وحوّل كل خبر إلى فكرة فيديو قصير بهذي المواصفات:
- topic: نوع المجال (تقنية/أعمال/تسويق/بودكاست).
- source_title و source_url و source_pub: من الخبر الأصلي (انسخ الرابط كما هو).
- virality: سطر واحد يشرح ليش الخبر قابل للانتشار.
- hook: أول 3 ثواني — جملة صادمة/فضولية توقف التمرير، بلهجة سعودية بيضاء.
- script: سكربت يُقرأ في 30–45 ثانية، بلهجة سعودية/خليجية طبيعية محكية (مو فصحى جامدة)، يشرح الخبر ببساطة ويعطي زاوية رأي أو فائدة. لا تذكر أرقام أو مصادر غير مؤكدة.
- screen_title: عنوان قصير (٣–٦ كلمات) يظهر مكتوب على الشاشة.
- footage: ٣–٥ كلمات بحث إنجليزية للقطات الفوقية (B-roll) المناسبة للخبر.
- hashtags: ٥–٧ هاشتاقات عربية/إنجليزية مناسبة.
- service_tie: أنسب خدمة من خدمات إبراهيم يُذكر إليها بشكل طبيعي.
- cta: جملة ختام تدعو لطلب خدمته من غير ما تكون فجّة.

أرجِع مصفوفة JSON فقط مطابقة للمخطط.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_KEY) return json({ error: "مفتاح Gemini غير مضبوط في أسرار الدالة (GEMINI_API_KEY)." }, 500);

    // التحقق من هوية المستخدم — حساب المدير فقط
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user || (u.user.email || "").toLowerCase() !== ADMIN_EMAIL) {
      return json({ error: "غير مصرّح" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(body.count) || 5, 1), 8);

    const news = await gatherNews();
    if (!news.length) return json({ error: "تعذّر جلب الأخبار الآن، حاول بعد قليل." }, 502);

    const ideas = await writeScripts(news, count, GEMINI_KEY);

    // حفظ بصلاحية الخدمة، مع نسبة الملكية للمستخدم
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const batch_id = crypto.randomUUID();
    const rows = ideas.map((x) => ({
      owner: u.user.id,
      batch_id,
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

    return json({ batch_id, count: inserted.length, ideas: inserted });
  } catch (e) {
    return json({ error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
