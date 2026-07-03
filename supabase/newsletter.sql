-- ============================================================
--  القائمة البريدية — اشتراك الزوّار + إرسال المدونة إليهم
--  المشروع: rrerwhhxrjyzmnnjsfev (نظام الأعمال)
--  شغّله في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent).
--
--  الزائر يشترك من الموقع (anon insert فقط)، المالك يقرأ/يحذف،
--  ودالة الإرسال/إلغاء الاشتراك تعملان بمفتاح الخدمة (تتجاوز RLS).
-- ============================================================

create table if not exists public.subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  name         text default '',
  source       text default '',        -- من أين اشترك: home / blog
  unsub_token  text not null default replace(gen_random_uuid()::text, '-', ''),
  unsubscribed boolean default false,
  created_at   timestamptz not null default now()
);
create index if not exists subscribers_created_idx on public.subscribers(created_at desc);

alter table public.subscribers enable row level security;

-- الزائر يشترك فقط (لا يقرأ) — لا بريد يُكشف
drop policy if exists sub_insert on public.subscribers;
create policy sub_insert on public.subscribers
  for insert to anon, authenticated
  with check (true);

-- القراءة/الحذف للمالك المسجَّل فقط (لوحة التحكم)
drop policy if exists sub_read on public.subscribers;
create policy sub_read on public.subscribers
  for select to authenticated using (true);

drop policy if exists sub_del on public.subscribers;
create policy sub_del on public.subscribers
  for delete to authenticated using (true);

drop policy if exists sub_upd on public.subscribers;
create policy sub_upd on public.subscribers
  for update to authenticated using (true) with check (true);

-- (اختياري) سجل الرسائل المُرسلة — لتتبّع آخر إرسال
create table if not exists public.newsletter_log (
  id          uuid primary key default gen_random_uuid(),
  subject     text,
  sent        int default 0,
  failed      int default 0,
  created_at  timestamptz not null default now()
);
alter table public.newsletter_log enable row level security;
drop policy if exists nl_read on public.newsletter_log;
create policy nl_read on public.newsletter_log
  for select to authenticated using (true);
