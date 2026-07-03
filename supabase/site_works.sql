-- ============================================================
--  معرض الأعمال + شعارات الشركات — تُدار من لوحة التحكم الداخلية
--  المشروع: rrerwhhxrjyzmnnjsfev (نظام الأعمال)
--  شغّله في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent).
--
--  الفكرة: الأعمال والشعارات تُخزَّن هنا؛ الموقع العام يقرؤها (anon)،
--  والمالك المسجَّل يضيف/يعدّل/يحذف من داخل النظام (لوحة «الأعمال»).
-- ============================================================

-- ===== جدول الأعمال =====
create table if not exists public.site_works (
  id          text primary key,
  client      text,                 -- اسم العميل/الجهة
  title       text,                 -- عنوان العمل
  category    text,                 -- التصنيف (أعمال سينمائية/تغطية فعاليات/إعلانات منتجات/مقابلات الشارع)
  audience    text,                 -- 'companies' | 'stores' | null (عمل خاص)
  roles       jsonb default '[]'::jsonb,   -- الأدوار (إخراج/تصوير/مونتاج…)
  description text,                 -- وصف العمل
  video_url   text,                 -- رابط الفيديو الأساسي
  videos      jsonb default '[]'::jsonb,   -- روابط فيديو إضافية
  bts         text,                 -- رابط الكواليس (اختياري)
  logo        text,                 -- شعار العميل (مسار داخل الموقع أو data URL مرفوع)
  thumb       text,                 -- صورة مصغّرة مخصّصة (وإلا تُشتق من يوتيوب)
  featured    boolean default false,
  sort        int default 0,        -- ترتيب العرض
  created_at  timestamptz not null default now()
);
create index if not exists site_works_sort_idx on public.site_works(sort);

-- ===== جدول شعارات الشركات (الشريط العلوي «موثوق من») =====
create table if not exists public.site_brands (
  id          text primary key,
  name        text,
  logo        text,                 -- مسار داخل الموقع أو data URL مرفوع
  sort        int default 0,
  created_at  timestamptz not null default now()
);
create index if not exists site_brands_sort_idx on public.site_brands(sort);

-- ===== سياسات الوصول (RLS) =====
alter table public.site_works  enable row level security;
alter table public.site_brands enable row level security;

-- القراءة للجميع (الموقع العام) — بيانات معرض عام غير حسّاسة
drop policy if exists sw_select on public.site_works;
create policy sw_select on public.site_works
  for select to anon, authenticated using (true);

drop policy if exists sb_select on public.site_brands;
create policy sb_select on public.site_brands
  for select to anon, authenticated using (true);

-- الكتابة/التعديل/الحذف للمالك المسجَّل فقط (لوحة التحكم)
drop policy if exists sw_write on public.site_works;
create policy sw_write on public.site_works
  for all to authenticated using (true) with check (true);

drop policy if exists sb_write on public.site_brands;
create policy sb_write on public.site_brands
  for all to authenticated using (true) with check (true);
