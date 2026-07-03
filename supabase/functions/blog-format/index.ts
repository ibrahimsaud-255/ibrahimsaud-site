// ╔══════════════════════════════════════════════════════════════╗
// ║  blog-format — Supabase Edge Function                          ║
// ║  الهدف الوحيد: تنسيق وترتيب مقال إبراهيم (عناوين / فقرات /     ║
// ║  قوائم) دون أي تغيير في كلماته أو معناه. يُعيد HTML + عنوان    ║
// ║  مقترح + مقتطف قصير.                                            ║
// ║  يستخدم DeepSeek (متوافق مع OpenAI). اضبط المفتاح:              ║
// ║    supabase secrets set DEEPSEEK_API_KEY=sk-...                 ║
// ║  انشرها بدون تحقّق JWT:  supabase functions deploy blog-format \
// ║                          --no-verify-jwt                        ║
// ║  يعود تلقائياً إلى Groq (GROQ_API_KEY) إن لم يُضبط DeepSeek.     ║
// ╚══════════════════════════════════════════════════════════════╝

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

const GROQ_MODEL = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";
const DEEPSEEK_MODEL = Deno.env.get("DEEPSEEK_MODEL") || "deepseek-chat";

const SYSTEM = `أنت محرّر تنسيق عربي. مهمتك الوحيدة هي ترتيب وتنسيق نصّ الكاتب فقط — لا غير.

القواعد الصارمة:
1) لا تُغيّر كلمات الكاتب إطلاقاً: ممنوع الإضافة أو الحذف أو إعادة الصياغة أو التصحيح أو الترجمة. كل كلمة في مخرجاتك يجب أن تكون موجودة حرفياً في نص الكاتب.
2) دورك فقط: تقسيم النص إلى فقرات منطقية، واستخراج عناوين فرعية من جُمَل موجودة فعلاً في النص (لا تخترع عنواناً)، وتحويل التعدادات الموجودة إلى قوائم، وترتيب التسلسل إن لزم.
3) أعد المحتوى كـ HTML باستخدام هذه الوسوم فقط: <h2> <h3> <p> <ul> <li> <ol> <blockquote> <strong>. ممنوع أي وسم آخر، وممنوع أي خصائص (attributes) أو سكربت أو تنسيق inline.
4) "title" = عنوان رئيسي قصير مأخوذ حرفياً من كلمات الكاتب (أول جملة دالّة) — لا تخترعه.
5) "excerpt" = مقتطف ≤ 160 حرفاً منسوخ حرفياً من بداية النص.

أعد JSON فقط بالشكل: {"title": "...", "excerpt": "...", "html": "..."}`;

// نداء متوافق مع OpenAI (يخدم DeepSeek وGroq بنفس الشكل)
async function callLLM(url: string, model: string, key: string, text: string) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: "نسّق ورتّب هذا المقال دون تغيير أي كلمة:\n\n" + text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });
  if (!r.ok) throw new Error(r.status + ": " + (await r.text()).slice(0, 800));
  const data = await r.json();
  const txt = data?.choices?.[0]?.message?.content;
  if (!txt) throw new Error("رد فارغ من النموذج");
  return JSON.parse(txt) as { title?: string; excerpt?: string; html?: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const dsKey = Deno.env.get("DEEPSEEK_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!dsKey && !groqKey) {
      return json({ error: "لا مفتاح ذكاء مضبوط — اضبط DEEPSEEK_API_KEY في أسرار الدوال." }, 500);
    }

    const { text } = await req.json().catch(() => ({ text: "" }));
    const clean = (text || "").toString().trim();
    if (clean.length < 10) return json({ error: "النص قصير جداً." }, 400);

    let out: { title?: string; excerpt?: string; html?: string } = {};
    if (dsKey) {
      // DeepSeek أولاً (endpoint متوافق مع OpenAI)
      const dsUrl = Deno.env.get("DEEPSEEK_API_URL") || "https://api.deepseek.com/chat/completions";
      try {
        out = await callLLM(dsUrl, DEEPSEEK_MODEL, dsKey, clean);
      } catch (e) {
        if (!groqKey) throw new Error("deepseek " + ((e as Error).message || e));
        // فشل DeepSeek → جرّب Groq
        out = await callLLM("https://api.groq.com/openai/v1/chat/completions", GROQ_MODEL, groqKey, clean);
      }
    } else {
      out = await callLLM("https://api.groq.com/openai/v1/chat/completions", GROQ_MODEL, groqKey!, clean);
    }

    if (!out.html) throw new Error("لم يُرجِع النموذج تنسيقاً.");
    return json({ title: out.title || "", excerpt: out.excerpt || "", html: out.html });
  } catch (e) {
    return json({ error: (e as Error).message || "خطأ غير متوقع" }, 500);
  }
});
