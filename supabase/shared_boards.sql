-- ============================================================
--  مشاركة الخرائط الذهنية برابط — تعاون حيّ على لوحة واحدة
--  المشروع: rrerwhhxrjyzmnnjsfev (نظام الأعمال)
--  آمن لإعادة التشغيل (idempotent). إضافي فقط — لا يحذف شيئاً.
--
--  الفكرة: اللوحة المشتركة تُنسخ من S.boards إلى shared_boards. المالك
--  يصل لصفّه عبر RLS، والشريك (بلا حساب) يصل عبر دوال RPC بالتوكن فقط —
--  لا يرى أيّ شيء آخر من النظام. الحفظ «قارن ثم بدّل» على rev: لو تغيّرت
--  اللوحة منذ آخر قراءة يرجع conflict مع النسخة الأحدث ويدمج العميل.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.shared_boards (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid(),
  board_id    text not null,                                   -- = id اللوحة في app_state
  name        text,
  data        jsonb not null default '{}'::jsonb,              -- {name,items,edges,scenes}
  rev         bigint not null default 1,
  token       text not null unique default encode(gen_random_bytes(18),'hex'),
  can_edit    boolean not null default true,                   -- false = مشاهدة فقط
  enabled     boolean not null default true,                   -- إيقاف الرابط بلا حذف
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (owner, board_id)
);

alter table public.shared_boards enable row level security;
drop policy if exists shared_boards_owner on public.shared_boards;
create policy shared_boards_owner on public.shared_boards
  for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

-- قراءة اللوحة بالتوكن
create or replace function public.board_share_get(p_token text)
returns jsonb language sql security definer set search_path = public stable as $$
  select coalesce(
    (select jsonb_build_object('ok',true,'name',name,'data',data,'rev',rev,'can_edit',can_edit)
       from shared_boards where token = p_token and enabled),
    jsonb_build_object('ok',false,'err','not_found'));
$$;

-- الحفظ بالتوكن: يُقبل فقط إن كانت p_rev هي النسخة الحاليّة
create or replace function public.board_share_save(p_token text, p_data jsonb, p_rev bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r shared_boards%rowtype;
begin
  select * into r from shared_boards where token = p_token and enabled for update;
  if not found then return jsonb_build_object('ok',false,'err','not_found'); end if;
  if not r.can_edit then return jsonb_build_object('ok',false,'err','read_only'); end if;
  if jsonb_typeof(p_data) <> 'object' or jsonb_typeof(p_data->'items') <> 'array' then
    return jsonb_build_object('ok',false,'err','bad_data'); end if;
  if pg_column_size(p_data) > 6000000 then return jsonb_build_object('ok',false,'err','too_large'); end if;
  if r.rev <> p_rev then
    return jsonb_build_object('ok',false,'err','conflict','rev',r.rev,'data',r.data); end if;
  update shared_boards set data = p_data, rev = r.rev + 1, name = coalesce(p_data->>'name', name), updated_at = now()
    where id = r.id;
  return jsonb_build_object('ok',true,'rev',r.rev + 1);
end $$;

revoke all on function public.board_share_get(text) from public;
revoke all on function public.board_share_save(text, jsonb, bigint) from public;
grant execute on function public.board_share_get(text) to anon, authenticated;
grant execute on function public.board_share_save(text, jsonb, bigint) to anon, authenticated;
