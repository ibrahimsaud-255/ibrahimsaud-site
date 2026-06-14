# رادار المحتوى — خطوات التشغيل (مرة واحدة)

نظام يطلّع لك أفكار فيديوهات أخبارية جاهزة في مجالك (تقنية/أعمال/تسويق/بودكاست)،
يعيد كتابتها سكربتات «تيك توك» بلهجتك، ويربط كل فكرة بإحدى خدماتك.

التكلفة: **صفر** — الأخبار من RSS مجاني، والكتابة عبر Gemini (طبقة مجانية).

---

## 1) مفتاح Gemini المجاني (دقيقتان)
1. افتح <https://aistudio.google.com/app/apikey>
2. سجّل دخول بحساب Google ← **Create API key** (بدون بطاقة ائتمان).
3. انسخ المفتاح (يبدأ بـ `AIza...`).

## 2) إنشاء جدول الأفكار
- Supabase ▸ **SQL Editor** ▸ الصق محتوى `supabase/content_ideas.sql` ▸ **Run**.

## 3) نشر الدالة (Edge Function)

### الطريقة أ — لوحة Supabase (الأسهل)
1. Supabase ▸ **Edge Functions** ▸ **Create a function** ▸ الاسم: `content-radar`.
2. الصق محتوى `supabase/functions/content-radar/index.ts` ▸ **Deploy**.
3. **Edge Functions ▸ Secrets** (أو Manage secrets) ▸ أضف:
   - الاسم: `GEMINI_API_KEY` — القيمة: مفتاحك من الخطوة 1 ▸ Save.

### الطريقة ب — سطر الأوامر (CLI)
```bash
supabase login
supabase link --project-ref rrerwhhxrjyzmnnjsfev
supabase secrets set GEMINI_API_KEY=AIza...your-key...
supabase functions deploy content-radar
```

> `SUPABASE_URL` و`SUPABASE_ANON_KEY` و`SUPABASE_SERVICE_ROLE_KEY` تُحقن تلقائياً — لا تضفها يدوياً.

## 4) الاستخدام
افتح: **`https://ibrahimsaud.com/app/studio.html`**
ادخل بحسابك ← اضغط **«ولّد أفكار اليوم»**. تطلع الكروت وتنحفظ في الأرشيف.

---

## ملاحظات
- محصور على حساب المدير فقط (`ibrahimsaud25@gmail.com`).
- لتغيير عدد الأفكار/الضغطة: عدّل `count` في `studio.html` (1–8).
- لتعديل مجالات الأخبار: عدّل مصفوفة `FEEDS` في `index.ts`.
- «الأكثر انتشاراً» مقرّبة عبر مصادر موثوقة + الأحدث + حكم الذكاء (قياس الانتشار الدقيق يحتاج APIs مدفوعة للسوشال).
