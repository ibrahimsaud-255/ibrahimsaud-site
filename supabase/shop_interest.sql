-- «قريباً» في المتجر (/shop/#soon): من يسجّل إيميله ليُبلَّغ أوّل ما ينزل المنتج.
-- هجرة: shop_interest_signups (طُبّقت على rrerwhhxrjyzmnnjsfev في ٢٠٢٦-١١-٢٣).
-- الكتابة من الموقع عبر الدالّة shop_interest_add (SECURITY DEFINER) فقط — لا سياسة إدراج للزائر.
-- القراءة والحذف للمالك وحده: سياسته منسوخة حرفيّاً من shop_settings_owner (لا يُكتب البريد هنا).

create table if not exists public.shop_interest (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  email text not null,
  name text,
  source text,
  created_at timestamptz not null default now()
);
create unique index if not exists shop_interest_product_email on public.shop_interest (product, lower(email));
create index if not exists shop_interest_created on public.shop_interest (created_at desc);

alter table public.shop_interest enable row level security;
revoke all on public.shop_interest from anon;

do $$
declare q text;
begin
  select qual into q from pg_policies where schemaname = 'public' and tablename = 'shop_settings' and policyname = 'shop_settings_owner';
  if q is null then raise exception 'shop_settings_owner policy not found'; end if;
  execute 'drop policy if exists shop_interest_owner on public.shop_interest';
  execute format('create policy shop_interest_owner on public.shop_interest for all to authenticated using (%s) with check (%s)', q, q);
end $$;

-- المنتج مفتاح قصير (course-lessons-broadcast، lessons-publish…) — منتج «قريباً» جديد لا يحتاج هجرة.
-- تكرار نفس البريد لنفس المنتج يُتجاهل بصمت (الواجهة تقول «سجّلناك» في الحالتين).
create or replace function public.shop_interest_add(p_product text, p_email text, p_name text default null, p_source text default null)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare e text := lower(trim(coalesce(p_email, '')));
begin
  if p_product is null or p_product !~ '^[a-z0-9-]{2,40}$' then raise exception 'bad product'; end if;
  if length(e) > 160 or e !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'bad email'; end if;
  -- سقف بسيط ضدّ الإغراق: ٣٠٠ تسجيل في الساعة لكلّ الموقع
  if (select count(*) from public.shop_interest where created_at > now() - interval '1 hour') >= 300 then raise exception 'busy'; end if;
  insert into public.shop_interest(product, email, name, source)
  values (p_product, e, nullif(left(trim(coalesce(p_name, '')), 80), ''), nullif(left(trim(coalesce(p_source, '')), 60), ''))
  on conflict (product, lower(email)) do nothing;
end $$;

revoke all on function public.shop_interest_add(text, text, text, text) from public;
grant execute on function public.shop_interest_add(text, text, text, text) to anon, authenticated;
