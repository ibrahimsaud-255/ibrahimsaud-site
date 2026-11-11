-- ============================================================
--  المدونة — إبراهيم سعود
--  شغّل هذا الملف في:  Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent).
--
--  الفكرة:
--   • posts          → المقالات المنشورة (يقرؤها الجميع، يكتبها المدير فقط).
--   • blog_settings  → صف واحد فيه اسم الكاتب وصورته الشخصية المشتركة،
--                      تغيّرها مرّة واحدة فتتغيّر في كل المقالات.
--   • bucket blog-images → صور المقالات والصورة الشخصية (عام للقراءة).
-- ============================================================

-- ── 1) جدول المقالات ────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  excerpt      text default '',
  body_html    text not null default '',
  cover_url    text default '',
  greg_date    text default '',          -- التاريخ الميلادي بالعربي (ثابت وقت النشر)
  hijri_date   text default '',          -- التاريخ الهجري بالعربي (ثابت وقت النشر)
  reading_min  int  default 1,
  status       text default 'published', -- published | draft
  published_at timestamptz default now(),
  created_at   timestamptz default now()
);
create index if not exists posts_published_idx on public.posts(published_at desc);

-- نص المقال الخام (قبل التنسيق) — يُحفظ ليمكن تعديل المسودة/المقال لاحقاً
alter table public.posts add column if not exists raw_text text default '';

alter table public.posts enable row level security;

-- الجميع (anon) يقرؤون المقالات المنشورة فقط
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select to anon, authenticated
  using (status = 'published' or auth.role() = 'authenticated');

-- المدير المصادَق فقط يضيف/يعدّل/يحذف
drop policy if exists posts_write on public.posts;
create policy posts_write on public.posts
  for all to authenticated
  using (true) with check (true);

-- ── 2) إعدادات المدونة (صف واحد، id = 1) ────────────────────
create table if not exists public.blog_settings (
  id                int primary key default 1,
  author_name       text default 'إبراهيم سعود',
  author_title      text default 'تقنية أعمال وبودكاست',
  author_avatar_url text default '',
  updated_at        timestamptz default now(),
  constraint blog_settings_singleton check (id = 1)
);
insert into public.blog_settings (id) values (1) on conflict (id) do nothing;

alter table public.blog_settings enable row level security;

-- الجميع يقرؤون الإعدادات (لعرض الصورة الشخصية للقارئ)
drop policy if exists blog_settings_read on public.blog_settings;
create policy blog_settings_read on public.blog_settings
  for select to anon, authenticated using (true);

-- المدير فقط يعدّل
drop policy if exists blog_settings_write on public.blog_settings;
create policy blog_settings_write on public.blog_settings
  for all to authenticated
  using (true) with check (true);

-- ── 3) bucket صور المدونة (عام) ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- الجميع يقرؤون الصور
drop policy if exists blog_images_read on storage.objects;
create policy blog_images_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'blog-images');

-- المدير المصادَق فقط يرفع/يعدّل/يحذف
drop policy if exists blog_images_write on storage.objects;
create policy blog_images_write on storage.objects
  for all to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

-- ============================================================
--  تحقّق سريع
-- ============================================================
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' and tablename in ('posts','blog_settings');

-- ── رابط المقال (slug) — للصفحات الثابتة /blog/<slug>/ (نوفمبر ٢٠٢٦) ──
-- كلمات إنجليزيّة صغيرة بينها شَرطة. بدونه يستعمل الموقع LEGACY_SLUGS في
-- src/lib/blog.ts أو أوّل ٨ خانات من المعرّف. حقل «رابط المقال» في اللوحة يظهر بعد تشغيل هذا.
alter table public.posts add column if not exists slug text;
create unique index if not exists posts_slug_key on public.posts(slug) where slug is not null and slug <> '';
alter table public.posts drop constraint if exists posts_slug_format;
alter table public.posts add constraint posts_slug_format check (slug is null or slug = '' or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
update public.posts set slug = v.slug from (values
  ('e9bdb90c-3bac-4c73-b4ae-5ee037ea9519'::uuid, 'creative-director-one-vision'),
  ('2a67f5c6-468d-4453-aec2-e06e95200f2c'::uuid, 'who-is-ibrahim-saud'),
  ('db28fb2a-0909-45a4-9a93-1e5cbd1de00e'::uuid, 'from-idea-to-screen'),
  ('ba254b8c-69e5-41f1-95f0-bb190e353fda'::uuid, 'riyadh-or-alahsa-next-step'),
  ('d790f74b-563c-4844-a3c1-496d9a8f135b'::uuid, 'experience-meets-vision'),
  ('1a660506-426d-49c6-8774-2d7084214113'::uuid, 'reading-and-writing-in-the-ai-era'),
  ('b1ee1924-d172-42e7-8aed-a3072aeb2114'::uuid, 'nahnu-narzuquk')
) as v(id, slug) where posts.id = v.id and (posts.slug is null or posts.slug = '');
