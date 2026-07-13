# نظام الرسائل البريدية — دليل التفعيل

نظام متكامل داخل لوحة التحكم (قسم «القائمة البريدية»): تكتب الرسالة وتختار
**إرسال الآن** أو **جدولة لوقت لاحق** أو **حفظ كمسودّة**، مع سجلّ حملات كامل
(مجدولة / جارية / تمّت / فشلت / أُلغيت) وإمكانية التعديل والإلغاء والتكرار.

يعمل على: Supabase (قاعدة + دوال Edge) + Resend (الإرسال) + pg_cron (الجدولة).

---

## المكوّنات

| الملف | الدور |
|------|------|
| `supabase/newsletter.sql` | جدول `subscribers` + `newsletter_campaigns` + الصلاحيات |
| `supabase/newsletter_scheduler.sql` | مهمّة pg_cron كل دقيقة تُرسل المجدولة تلقائياً |
| `supabase/functions/newsletter-send/` | دالة الإرسال (تجريبي / إرسال حملة / معالجة المجدولة) |
| `supabase/functions/newsletter-unsub/` | رابط إلغاء الاشتراك في تذييل كل إيميل |
| قسم «القائمة البريدية» في `public/app/index.html` | الواجهة |

---

## خطوات التفعيل (مرّة واحدة)

### ١) قاعدة البيانات
Supabase → **SQL Editor** → New query → الصق محتوى `supabase/newsletter.sql` → **Run**.
(آمن لإعادة التشغيل — لن يحذف بيانات موجودة.)

### ٢) أسرار الدالة
Supabase → **Edge Functions** → **Secrets** (أو Project Settings → Functions) — تأكّد من ضبط:

| السرّ | القيمة |
|------|--------|
| `RESEND_API_KEY` | مفتاح Resend (يبدأ بـ `re_…`) |
| `RESEND_FROM` | `إبراهيم سعود <news@ibrahimsaud.com>` — **دومين موثّق في Resend** (مطلوب للإرسال للخارجيين) |
| `ADMIN_EMAIL` | `ibrahimsaud25@gmail.com` (وجهة «تجريبي لي») |
| `CRON_SECRET` | قيمة سرّية طويلة من عندك (للجدولة) — مثال: 40 حرفاً عشوائياً |

> `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` تُضبطان تلقائياً من Supabase.

### ٣) نشر الدوال
من جهازك (بعد `supabase login` و`supabase link --project-ref rrerwhhxrjyzmnnjsfev`):

```bash
supabase functions deploy newsletter-send --no-verify-jwt
supabase functions deploy newsletter-unsub --no-verify-jwt
```

> **مهم:** `--no-verify-jwt` ضروري لأن الدالة تتحقّق من الصلاحية داخلياً
> (توكن المستخدم المسجَّل للإرسال اليدوي، و`CRON_SECRET` للجدولة). بدونه لن تعمل الجدولة.

### ٤) الجدولة (pg_cron)
افتح `supabase/newsletter_scheduler.sql`، **استبدل `<CRON_SECRET>`** بنفس القيمة التي وضعتها
في أسرار الدالة، ثم شغّله في SQL Editor.

للتأكّد:
```sql
select jobname, schedule, active from cron.job where jobname = 'newsletter-dispatch';
```

---

## كيف يعمل

- **إرسال الآن** → ينشئ حملة ويستدعي الدالة مباشرة (فوري، لا يحتاج pg_cron).
- **جدولة** → يحفظ الحملة بحالة `scheduled` + موعدها. مهمّة pg_cron كل دقيقة تنبّه الدالة
  التي تلتقط كل حملة حان وقتها وترسلها، ثم تحدّث حالتها إلى `sent` مع العدادات.
- **قفل ضد الإرسال المزدوج**: الدالة «تحجز» الحملة (`sending`) قبل الإرسال، فلا تُرسل مرّتين.
- **تعافٍ**: حملة عالقة في `sending` أكثر من ٣٠ دقيقة يعيدها المجدوِل ويحاول من جديد.
- كل إيميل يحوي رابط **إلغاء اشتراك** فريد، وتُزال العناوين المكرّرة تلقائياً.

## اختبار سريع
1. من اللوحة: اكتب رسالة → **تجريبي لي** → تصلك على `ADMIN_EMAIL` (يعمل حتى بدون دومين موثّق).
2. **إرسال الآن** → يرسل لكل المشتركين (يتطلّب دومين موثّق للخارجيين).
3. **جدولة** بعد دقيقتين → راقب تحوّل الحالة إلى «تمّت» تلقائياً.

## إيقاف الجدولة لاحقاً
```sql
select cron.unschedule('newsletter-dispatch');
```
