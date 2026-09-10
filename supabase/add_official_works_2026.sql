-- ============================================================
--  إضافة الأعمال الرسمية للجهات الحكومية (٢٠٢٦-٠٩)
--  المشروع: rrerwhhxrjyzmnnjsfev
--  شغّله في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (upsert).
--
--  الأعمال المضافة (بترتيب الظهور):
--    1. الأحوال المدنية — أبشر
--    2. الهيئة العامة للنقل (TGA)
--    3. هاكاثون هيلثون النهائي — جامعة الملك سعود
--    4. مختبر الابتكار — ريناد المجد
--    5. بودكاست الزيادات — أحمد الزيادات
--
--  ملاحظة: sort سالب → يظهر قبل الأعمال القديمة تلقائياً.
-- ============================================================

insert into public.site_works
  (id, client, title, category, audience, roles, description, video_url, logo, thumb, featured, sort)
values
  (
    'abshr-official',
    'الأحوال المدنية — أبشر',
    'فيلم رسمي — الأحوال المدنية',
    'أفلام حكومية',
    'companies',
    '["إخراج","تصوير","مونتاج","موشن جرافيك"]'::jsonb,
    'فيلم رسمي للأحوال المدنية (منصة أبشر) — تصوير ومونتاج وموشن جرافيك بهوية بصرية تليق بالجهة الحكومية.',
    'https://drive.google.com/file/d/151zNx35cgFp1SbKkB8d-__nyaNgCztV_/view',
    null,
    null,
    true,
    -5
  ),
  (
    'tga-official',
    'الهيئة العامة للنقل (TGA)',
    'فيلم رسمي — الهيئة العامة للنقل',
    'أفلام حكومية',
    'companies',
    '["إخراج","تصوير","مونتاج"]'::jsonb,
    'فيلم مؤسسي للهيئة العامة للنقل — إنتاج كامل بجودة تليق برسالة الهيئة وحضورها.',
    'https://drive.google.com/file/d/1_1qRTwo2asjRWT4lN42bwcOdjFhzjEcw/view',
    '/tga.png',
    null,
    true,
    -4
  ),
  (
    'healthon-final-full',
    'جامعة الملك سعود — المدينة الطبية الجامعية',
    'هاكاثون هيلثون — الفيلم النهائي الكامل',
    'أفلام حكومية',
    'companies',
    '["إخراج","تصوير","مونتاج","موشن"]'::jsonb,
    'الفيلم النهائي الكامل لهاكاثون هيلثون بالمدينة الطبية الجامعية بجامعة الملك سعود — يوثّق الحدث بهوية بصرية متكاملة.',
    'https://drive.google.com/file/d/1H0evE2c3jnNMzKx-jGX0_52E812eq-5R/view',
    null,
    null,
    true,
    -3
  ),
  (
    'rmg-innovation-lab',
    'مجموعة ريناد المجد (RMG)',
    'مختبر الابتكار — ريناد المجد',
    'أفلام مؤسسية',
    'companies',
    '["إخراج","تصوير","مونتاج"]'::jsonb,
    'فيلم تعريفي بمختبر الابتكار في شركة ريناد المجد لتقنية المعلومات — يبرز البيئة والأدوات والفرق.',
    'https://drive.google.com/file/d/1b_ERZ-GHL-oQbmby4gsm9wFBzIjIheyo/view',
    '/LOGO_RMG.png',
    null,
    false,
    -2
  ),
  (
    'zayadat-podcast',
    'بودكاست الزيادات — أحمد الزيادات',
    'منصّة لكل مهني عربي — لقاء أحمد الزيادات',
    'بودكاست وحوارات',
    'companies',
    '["إنتاج","تصوير","إخراج","مونتاج"]'::jsonb,
    'حلقة بودكاست حوارية مع أحمد الزيادات حول منصّة القوالب والأدوات المهنية العربية — إنتاج كامل بهوية سينمائية.',
    'https://drive.google.com/file/d/1iajYRyNP0Zt0GWQa0AJLMzO998KUMZJG/view',
    null,
    null,
    false,
    -1
  )
on conflict (id) do update set
  client      = excluded.client,
  title       = excluded.title,
  category    = excluded.category,
  audience    = excluded.audience,
  roles       = excluded.roles,
  description = excluded.description,
  video_url   = excluded.video_url,
  logo        = excluded.logo,
  thumb       = excluded.thumb,
  featured    = excluded.featured,
  sort        = excluded.sort;

-- تحقّق: يعرض الأعمال الرسمية الجديدة أعلى القائمة
select id, title, sort, featured
from public.site_works
order by sort asc
limit 10;
