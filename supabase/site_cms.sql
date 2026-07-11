-- ===== محرر الموقع (مسودة → معاينة → نشر) =====
-- يُنفَّذ مرة واحدة في Supabase → SQL Editor.
-- يضيف عمود «المسودة» لجدول إعدادات الموقع الموجود:
--   value  = المحتوى المنشور (يظهر للزوار)
--   draft  = المسودة (تظهر فقط في وضع المعاينة ?preview=1)
-- زر «نشر» في النظام الداخلي ينسخ draft → value ويصفّر المسودة.

alter table public.site_settings add column if not exists draft jsonb;
alter table public.site_settings add column if not exists published_at timestamptz;

-- (سياسات RLS موجودة من site_works_v2.sql: قراءة عامة، كتابة للمسجّلين)

-- تحقّق
select key,
       (value is not null)  as منشور,
       (draft is not null)  as فيه_مسودة,
       published_at
from public.site_settings
order by key;
