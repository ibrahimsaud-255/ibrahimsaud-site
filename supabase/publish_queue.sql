-- ============================================================
--  النشر التلقائي — طابور النشر (المرحلة ١)
--  شغّله في: Supabase → SQL Editor → New query → Run
--  الفكرة: تضيف مقطعاً من النظام ← GitHub Actions ينزّله وينشره
--  على المنصات المحددة ويحدّث الحالة.
-- ============================================================

create table if not exists public.publish_queue (
  id          text primary key,
  video_url   text not null,            -- رابط مقطع تيك توك (أو رابط فيديو مباشر)
  title       text,                     -- عنوان المقطع
  caption     text,                     -- الوصف/الكابشن
  platforms   jsonb default '["youtube"]'::jsonb, -- المنصات المطلوبة
  status      text default 'pending',   -- pending | processing | done | error
  results     jsonb default '{}'::jsonb,-- روابط النشر الناتجة أو رسالة الخطأ
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists publish_queue_status_idx on public.publish_queue(status);

alter table public.publish_queue enable row level security;
drop policy if exists pq_all on public.publish_queue;
create policy pq_all on public.publish_queue
  for all to anon, authenticated using (true) with check (true);
