# محتوى الاستوديو — خطوات التشغيل

مولّد محتوى بوضعين:
- **📡 أخبار** — أهم أخبار مجالك (تقنية/أعمال/تسويق/بودكاست) من RSS مجاني → سكربتات بلهجتك.
- **📖 قصص** — قصص واقعية مختصرة (عربية ثم عالمية) للسرد أمام الكاميرا.

الصفحة **بدون تسجيل دخول** (خاصة وغير معلنة). التكلفة: **صفر** (RSS مجاني + Gemini مجاني).

---

## 1) مفتاح Gemini المجاني
<https://aistudio.google.com/app/apikey> ← **Create API key** (يبدأ بـ `AIza...`).

## 2) قاعدة البيانات
Supabase ▸ **SQL Editor** ▸ الصق `supabase/content_ideas.sql` ▸ **Run**.
*(آمن لإعادة التشغيل — يضيف عمود `kind` ويفتح الوصول.)*

## 3) نشر الدالة — **بدون تحقّق JWT** (مهم)

### لوحة Supabase
1. Edge Functions ▸ **Create a function** ▸ الاسم `content-radar`.
2. الصق `supabase/functions/content-radar/index.ts` ▸ **Deploy**.
3. في إعدادات الدالة: **عطّل** خيار «Verify JWT» (Enforce JWT verification = OFF).
4. Edge Functions ▸ **Secrets** ▸ أضف `GEMINI_API_KEY` = مفتاحك.

### أو CLI
```bash
supabase secrets set GEMINI_API_KEY=AIza...your-key...
supabase functions deploy content-radar --no-verify-jwt
```

> `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` تُحقن تلقائياً.

## 4) الاستخدام
افتح **`https://ibrahimsaud.com/app/studio.html`** ← يفتح مباشرة.
بدّل بين **📡 أخبار** و**📖 قصص** ← اضغط زر التوليد.

---

## ملاحظات
- بلا تسجيل دخول — الوصول عبر المفتاح العام (الصفحة غير معلنة). لو تبي حماية لاحقاً نضيف رمزاً بسيطاً في الرابط.
- القصص تعتمد معرفة النموذج — **راجع أي رقم/تاريخ قبل النشر**.
- عدد العناصر/الضغطة: عدّل `count` في `studio.html` (1–8).
- مجالات الأخبار: عدّل `FEEDS` في `index.ts`. القصص: عدّل `storyPrompt`.
