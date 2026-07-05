-- ============================================================
--  توسعة نظام إدارة الموقع (النسخة ٢)
--  شغّله في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent).
--
--  يضيف:
--  1) أعمدة جديدة لجدول الأعمال: نوع العمل (فيديو/معرض صور)،
--     صور المعرض، تاجات، رابط خارجي.
--  2) جدول خدمات الموقع (يُدار من النظام).
--  3) جدول إعدادات الموقع (صورة الواجهة، الخلفية، روابط التواصل…).
-- ============================================================

-- ===== 1) توسعة جدول الأعمال =====
alter table public.site_works add column if not exists kind   text  default 'video';   -- 'video' | 'gallery'
alter table public.site_works add column if not exists images jsonb default '[]'::jsonb; -- صور المعرض (روابط)
alter table public.site_works add column if not exists tags   jsonb default '[]'::jsonb; -- تاجات حرّة
alter table public.site_works add column if not exists link   text;                     -- رابط خارجي (اختياري)

-- ===== 2) جدول خدمات الموقع =====
create table if not exists public.site_services (
  id          text primary key,
  title       text,                 -- اسم الخدمة (يظهر كتبويب)
  headline    text,                 -- العنوان الكبير داخل التبويب
  description text,                 -- الوصف
  image       text,                 -- صورة مربعة (رابط أو data URL)
  accent      text,                 -- لون مميز (hex) اختياري
  sort        int default 0,
  created_at  timestamptz not null default now()
);
create index if not exists site_services_sort_idx on public.site_services(sort);

alter table public.site_services enable row level security;
drop policy if exists ss_select on public.site_services;
create policy ss_select on public.site_services
  for select to anon, authenticated using (true);
drop policy if exists ss_write on public.site_services;
create policy ss_write on public.site_services
  for all to authenticated using (true) with check (true);

-- ===== 3) جدول إعدادات الموقع (مفتاح/قيمة) =====
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists st_select on public.site_settings;
create policy st_select on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists st_write on public.site_settings;
create policy st_write on public.site_settings
  for all to authenticated using (true) with check (true);
