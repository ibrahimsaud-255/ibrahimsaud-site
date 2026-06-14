-- ╔══════════════════════════════════════════════════════════════╗
-- ║  نظام رادار المحتوى — جدول أفكار الفيديوهات الأخبارية          ║
-- ║  شغّل هذا الملف مرة واحدة في Supabase ▸ SQL Editor             ║
-- ║  آمن لإعادة التشغيل (idempotent).                              ║
-- ╚══════════════════════════════════════════════════════════════╝

create table if not exists public.content_ideas (
  id            uuid primary key default gen_random_uuid(),
  owner         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  batch_id      uuid,                       -- يجمع أفكار نفس الضغطة
  created_at    timestamptz not null default now(),

  topic         text,                       -- تقنية / أعمال / تسويق / بودكاست
  source_title  text,                       -- عنوان الخبر الأصلي
  source_url    text,                       -- رابط المصدر
  source_pub    text,                       -- اسم الجهة الناشرة

  virality      text,                       -- لماذا الخبر قابل للانتشار
  hook          text,                       -- أول 3 ثواني (الخطّاف)
  script        text,                       -- السكربت كامل بلهجتك
  screen_title  text,                       -- العنوان الظاهر على الشاشة
  footage       text[],                     -- كلمات بحث للقطات الفوقية (B-roll)
  hashtags      text[],                     -- هاشتاقات
  service_tie   text,                       -- الخدمة المرتبطة من خدماتك
  cta           text,                       -- جملة الدعوة لطلب الخدمة

  status        text not null default 'new' -- new | used | archived
);

create index if not exists content_ideas_owner_created_idx
  on public.content_ideas (owner, created_at desc);

-- ===== أمان مستوى الصف (RLS) — كل مستخدم يرى صفوفه فقط =====
alter table public.content_ideas enable row level security;

drop policy if exists "content_ideas owner all" on public.content_ideas;
create policy "content_ideas owner all"
  on public.content_ideas
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());
