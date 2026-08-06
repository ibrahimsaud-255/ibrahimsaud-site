-- ============================================================================
-- بوابة مواقع العملاء — القفل والفتح + إحصاءات الزيارات + طَرْق الباب
-- يُنفَّذ مرة واحدة في مشروع Supabase الرئيسي (نفس مشروع النظام):
--   لوحة Supabase ← SQL Editor ← الصق ← Run
-- ============================================================================

-- ------------------------------------------------------------- المواقع --
create table if not exists client_sites (
  slug        text primary key,                  -- المعرّف في الرابط: manabir | sarah | ilogistics
  name        text not null,                     -- الاسم الظاهر في النظام
  url         text not null,                     -- المسار: /manabir/
  client_id   text,                              -- معرّف العميل في نظام العملاء (contacts)
  client_name text,                              -- اسم العميل (نسخة للعرض السريع)
  status      text not null default 'open',      -- open = مفتوح | locked = مقفل
  expires_at  timestamptz,                       -- إن وُجد: يُقفل تلقائياً بعد هذا الوقت
  note        text,                              -- رسالة تظهر للعميل في شاشة القفل
  wa_phone    text default '966504895213',       -- رقم واتساب زر التواصل في شاشة القفل
  owner_key   text default encode(gen_random_bytes(9),'hex'),  -- مفتاح معاينتك الخاص (لا يخرج من القاعدة)
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- لو كان الجدول موجوداً من قبل بدون هذه الأعمدة
alter table client_sites add column if not exists owner_key text default encode(gen_random_bytes(9),'hex');
alter table client_sites add column if not exists wa_phone  text default '966504895213';

-- ------------------------------------------------------------ الزيارات --
create table if not exists site_visits (
  id      bigserial primary key,
  slug    text not null,
  path    text,                                  -- الصفحة التي فُتحت
  ref     text,                                  -- من أين جاء الزائر
  device  text,                                  -- mobile | desktop
  visitor text,                                  -- معرّف عشوائي للزائر (بلا بيانات شخصية)
  at      timestamptz default now()
);
create index if not exists site_visits_slug_at_idx on site_visits(slug, at desc);

-- ---------------------------------------------------------- طَرْق الباب --
create table if not exists site_knocks (
  id    bigserial primary key,
  slug  text not null,
  name  text,
  phone text,
  msg   text,
  seen  boolean default false,
  at    timestamptz default now()
);
create index if not exists site_knocks_slug_at_idx on site_knocks(slug, at desc);

-- تحديث updated_at تلقائياً
create or replace function touch_client_sites() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

drop trigger if exists client_sites_touch on client_sites;
create trigger client_sites_touch before update on client_sites
  for each row execute function touch_client_sites();

-- ============================================================================
-- الحماية (RLS)
--   الزائر (anon): يقرأ حالة الموقع فقط، ويسجّل زيارة أو طَرْقة — ولا شيء غير ذلك.
--   أنت (authenticated): تحكّم كامل.
-- ============================================================================
alter table client_sites enable row level security;
alter table site_visits  enable row level security;
alter table site_knocks  enable row level security;

-- المواقع: لا وصول مباشر للزائر إطلاقاً (يقرأ الحالة عبر الدالة أدناه فقط)
drop policy if exists sites_read   on client_sites;
drop policy if exists sites_write  on client_sites;
create policy sites_write  on client_sites for all to authenticated using (true) with check (true);
revoke all on client_sites from anon;

-- ------------------------------------------------------------------------
-- دالة البوابة: كل ما يستطيع الزائر معرفته — مفتوح أم مقفل، والرسالة فقط.
-- مفتاح المعاينة (owner_key) يبقى داخل القاعدة ولا يُرسل للمتصفح أبداً.
-- ------------------------------------------------------------------------
create or replace function gate_state(p_slug text, p_key text default null)
returns table(state text, note text, wa text, owner boolean)
language sql
security definer
set search_path = public
as $$
  select
    case
      when p_key is not null and p_key <> '' and p_key = s.owner_key then 'open'
      when s.status = 'open' and (s.expires_at is null or s.expires_at > now()) then 'open'
      else 'locked'
    end,
    coalesce(s.note, ''),
    coalesce(s.wa_phone, '966504895213'),
    (p_key is not null and p_key <> '' and p_key = s.owner_key)
  from client_sites s
  where s.slug = p_slug;
$$;

revoke all on function gate_state(text, text) from public;
grant execute on function gate_state(text, text) to anon, authenticated;

-- الزيارات: الزائر يكتب فقط، وأنت تقرأ
drop policy if exists visits_insert on site_visits;
create policy visits_insert on site_visits for insert to anon, authenticated with check (true);
drop policy if exists visits_read   on site_visits;
create policy visits_read   on site_visits for select to authenticated using (true);
drop policy if exists visits_purge  on site_visits;
create policy visits_purge  on site_visits for delete to authenticated using (true);

-- الطَرْقات: الزائر يكتب، وأنت تقرأ وتعلّمها مقروءة
drop policy if exists knocks_insert on site_knocks;
create policy knocks_insert on site_knocks for insert to anon, authenticated with check (true);
drop policy if exists knocks_read   on site_knocks;
create policy knocks_read   on site_knocks for select to authenticated using (true);
drop policy if exists knocks_update on site_knocks;
create policy knocks_update on site_knocks for update to authenticated using (true) with check (true);
drop policy if exists knocks_delete on site_knocks;
create policy knocks_delete on site_knocks for delete to authenticated using (true);

-- ============================================================================
-- المواقع الحالية (تُدار بعد ذلك من داخل النظام)
-- ============================================================================
insert into client_sites (slug, name, url, client_name, status, note) values
  ('manabir',    'منابر — منصة المحاضرات',        '/manabir/',    '', 'open', ''),
  ('sarah',      'إبرة سارة — متجر الخياطة',       '/sarah/',      '', 'open', ''),
  ('ilogistics', 'التكامل المتحدة — اللوجستيات',  '/ilogistics/', '', 'open', ''),
  ('masarak',    'مسارك — منصة القبول الجامعي',    '/masarak/',    '', 'open', '')
on conflict (slug) do nothing;

-- ============================================================================
-- تنظيف الزيارات الأقدم من ٦ أشهر (اختياري — نفّذه عند الحاجة)
--   delete from site_visits where at < now() - interval '6 months';
-- ============================================================================
