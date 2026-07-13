-- ============================================================
--  جدولة الرسائل البريدية — pg_cron + pg_net
--  المشروع: rrerwhhxrjyzmnnjsfev
--  يشغّل مهمة كل دقيقة تنبّه دالة newsletter-send لمعالجة الحملات
--  المجدولة التي حان وقتها. شغّله مرّة واحدة في: Supabase → SQL Editor.
--
--  ⚠️ قبل التشغيل: استبدل <CRON_SECRET> بقيمة سرّية طويلة من عندك،
--     وضَع نفس القيمة في متغيّر بيئة الدالة باسم CRON_SECRET
--     (Supabase → Edge Functions → newsletter-send → Secrets).
--  آمن لإعادة التشغيل (idempotent).
-- ============================================================

-- الامتدادات المطلوبة (متوفّرة على Supabase)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- أزل المهمة القديمة إن وُجدت (لتفادي التكرار عند إعادة التشغيل)
select cron.unschedule('newsletter-dispatch')
where exists (select 1 from cron.job where jobname = 'newsletter-dispatch');

-- مهمة كل دقيقة: تطلب من الدالة معالجة المستحقّ من الحملات المجدولة
select cron.schedule(
  'newsletter-dispatch',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/newsletter-send',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', '<CRON_SECRET>'
               ),
    body    := jsonb_build_object('mode', 'cron'),
    timeout_milliseconds := 55000
  );
  $$
);

-- للتأكّد أن المهمة سُجّلت:
--   select jobname, schedule, active from cron.job where jobname = 'newsletter-dispatch';
-- لإيقاف الجدولة لاحقاً:
--   select cron.unschedule('newsletter-dispatch');
