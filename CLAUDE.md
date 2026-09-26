# ibrahimsaud.com — دليل الانطلاق السريع

موقع إبراهيم سعود الشخصيّ + **النظام الداخليّ** (لوحة إدارة كلّ شيء، ومنها
منصّة حروف ودروس). هذا الملفّ نقطة البداية لأيّ مبرمج أو جلسة AI.

@AGENTS.md

## الحقائق الخمس التي تمنع الضياع

1. **Next.js تصدير ثابت → GitHub Pages**: `next.config.ts` فيه `output:"export"`.
   الدفع إلى `main` ينشر تلقائيّاً (`.github/workflows/deploy.yml`).
   **لا تعدّل `out/` أبداً** — يُعاد توليده.
2. **محتوى الموقع العامّ في `src/lib/site.ts`** (~900 سطر) — النصوص والبطاقات
   والروابط كلّها هناك، لا داخل المكوّنات.
3. **`src/app/` ≠ `public/app/`**: الأولى مسارات Next للموقع العامّ؛ الثانية
   **النظام الداخليّ** — ملفّ واحد `public/app/index.html` (~700KB): ٢١ تطبيقاً،
   ~٧٤٠ دالّة في نطاق عامّ واحد، و٤٠٠+ معالج `onclick="..."` — لذلك **كلّ
   الدوالّ يجب أن تبقى عامّة (global)**، وإعادة تسمية أيّ دالّة تستلزم بحثاً
   نصّيّاً كاملاً في الملفّ. الشقيقان: `growth-apps.js` (بنك الأفكار، مثال
   الاستخلاص الناجح) و`r.html` (غرفة مشروع للعميل).
4. **`public/` يحوي أيضاً ~٨ مواقع مصغّرة مستقلّة** تتجاوز Next كلّياً
   (`ilogistics/`، `nama-demo/`، `takween/`، `blog/`، `register/`، `gate/`…) —
   تُنشر كما هي.
5. **جسر حروف**: تبويب «حروف» في اللوحة (والأدمن React في
   `src/app/admin/huroof-schools/`) ينادي `https://huroofduroos.com/api/admin/*`
   بترويسة `x-system-token` = **جلسة Supabase هذا المشروع** (لا سرّ ثابت)؛
   خادم حروف يطابق البريد مع `EXTERNAL_ADMIN_EMAILS` عنده. تغيير مشروع
   Supabase هنا أو البريد المسموح هناك = اللوحة تنكسر بصمت.

## Supabase (rrerwhhxrjyzmnnjsfev)

- المفتاح في الصفحات علنيّ (`sb_publishable_`) — الحماية الحقيقيّة RLS.
- منذ ٢٧ سبتمبر ٢٠٢٦: **كلّ سياسات الكتابة مقصورة على بريد المالك**
  (هجرة `lockdown_owner_only_policies`). أيّ جدول جديد يأخذ سياسة مالكٍ
  مثلها — لا `to authenticated using(true)` أبداً.
- `supabase/*.sql` تعريفات تاريخيّة؛ `supabase/lockdown-storage.sql` قفل
  التخزين (يُلصق في SQL Editor). الدوالّ الحافّة في `supabase/functions/`
  (النشرة، تنسيق المدوّنة…).

## أوامر

```bash
npm run dev        # تطوير محلّيّ
npm run build      # يبني out/ (يتحقّق قبل الدفع)
./deploy.sh        # بناء + commit + push → GitHub Pages ينشر
```

## وثائق أعمق

`DEPLOY.md` (Pages + DNS) · `طريقة-الاستخدام.md` و`دليل-تعديل-الموقع.md`
(أدلّة التشغيل) · `docs/NEWSLETTER_SETUP.md` · `public/gate/README.md`
