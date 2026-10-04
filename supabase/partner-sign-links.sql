-- روابط التوقيع الإلكترونيّ لاتفاقيات الشركاء (وحدة «الشركاء والعمولات» — 20-partners.js + /sign/)
-- المالك ينشئ الرابط من اللوحة (سياسة مالكٍ فقط). الشريك لا يلمس الجدول أبداً:
-- يصل عبر دالّتين SECURITY DEFINER بالرمز السرّيّ فقط (نفس نمط روابط الفريلانسرز).
-- طُبّقت على الإنتاج في ٤ أكتوبر ٢٠٢٦.

create table if not exists public.partner_sign_links (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,
  owner        uuid not null default auth.uid(),
  partner_ref  text not null,                 -- معرّف الشريك داخل app_state
  payload      jsonb not null,                -- نصّ الاتفاقية كاملاً (البنود مُعبّأة) + بيانات الطرف الأول + الختم والتوقيع
  expires_at   timestamptz not null,
  status       text not null default 'pending' check (status in ('pending','signed','revoked')),
  opened_at    timestamptz,
  open_count   int not null default 0,
  signed_at    timestamptz,
  signer_data  jsonb,
  signature    text,
  signer_ip    text,
  signer_ua    text,
  doc_hash     text,                          -- SHA-256 لنصّ الاتفاقية + بيانات الموقّع + التوقيع
  imported_at  timestamptz,                   -- متى سحبت اللوحة التوقيع إلى ملفّ الشريك
  created_at   timestamptz not null default now()
);
create index if not exists partner_sign_links_partner_idx on public.partner_sign_links(partner_ref);

alter table public.partner_sign_links enable row level security;
drop policy if exists partner_sign_links_owner on public.partner_sign_links;
create policy partner_sign_links_owner on public.partner_sign_links for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com');
revoke all on public.partner_sign_links from anon;

-- قراءة الرابط (للشريك): يعيد الاتفاقية ما دام صالحاً. بعد التوقيع تبقى النسخة الموقّعة
-- متاحةً للتحميل حتى انتهاء الرابط أو ٣ أيام من التوقيع (أيّهما أبعد).
create or replace function public.sign_link_get(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.partner_sign_links;
begin
  if p_token is null or length(p_token) < 32 then return jsonb_build_object('state','invalid'); end if;
  select * into r from public.partner_sign_links where token = p_token;
  if not found or r.status = 'revoked' then return jsonb_build_object('state','invalid'); end if;
  if r.status = 'pending' and r.expires_at < now() then
    return jsonb_build_object('state','expired','expires_at',r.expires_at);
  end if;
  if r.status = 'signed' and greatest(r.expires_at, r.signed_at + interval '3 days') < now() then
    return jsonb_build_object('state','closed');
  end if;
  update public.partner_sign_links set opened_at = coalesce(opened_at, now()), open_count = open_count + 1 where id = r.id;
  return jsonb_build_object(
    'state', r.status, 'payload', r.payload, 'expires_at', r.expires_at,
    'signed_at', r.signed_at, 'signer_data', r.signer_data, 'signature', r.signature, 'doc_hash', r.doc_hash);
end $$;

-- التوقيع (للشريك): مرّة واحدة فقط، قبل انتهاء الرابط.
create or replace function public.sign_link_submit(p_token text, p_data jsonb, p_signature text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.partner_sign_links; v_ip text; v_ua text; v_hash text; v_data jsonb; k text;
begin
  select * into r from public.partner_sign_links where token = p_token for update;
  if not found or r.status = 'revoked' then return jsonb_build_object('ok',false,'error','الرابط غير صالح'); end if;
  if r.status = 'signed' then return jsonb_build_object('ok',false,'error','تم توقيع هذه الاتفاقية مسبقاً'); end if;
  if r.expires_at < now() then return jsonb_build_object('ok',false,'error','انتهت صلاحية الرابط — اطلب رابطاً جديداً'); end if;
  if p_signature is null or p_signature not like 'data:image/png;base64,%' or length(p_signature) > 400000 then
    return jsonb_build_object('ok',false,'error','التوقيع غير صالح'); end if;
  -- نأخذ الحقول المعروفة فقط، بطولٍ محدود
  v_data := '{}'::jsonb;
  foreach k in array array['name','nationality','idNo','city','phone','email','bank','iban'] loop
    v_data := v_data || jsonb_build_object(k, left(coalesce(btrim(p_data ->> k),''), 120));
  end loop;
  if length(v_data->>'name') < 6 or length(v_data->>'idNo') < 8 or length(v_data->>'phone') < 9 then
    return jsonb_build_object('ok',false,'error','أكمل الاسم ورقم الهوية والجوال'); end if;
  if coalesce((p_data ->> 'agreed')::boolean, false) is not true then
    return jsonb_build_object('ok',false,'error','يجب الموافقة على البنود'); end if;
  begin
    v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for',''), ',', 1);
    v_ua := left(coalesce(current_setting('request.headers', true)::json ->> 'user-agent',''), 300);
  exception when others then v_ip := null; v_ua := null; end;
  v_hash := encode(extensions.digest(convert_to(r.payload::text || v_data::text || p_signature, 'UTF8'), 'sha256'), 'hex');
  update public.partner_sign_links
     set status = 'signed', signed_at = now(), signer_data = v_data, signature = p_signature,
         signer_ip = v_ip, signer_ua = v_ua, doc_hash = v_hash
   where id = r.id;
  return jsonb_build_object('ok',true,'signed_at',now(),'doc_hash',v_hash);
end $$;

revoke all on function public.sign_link_get(text) from public;
revoke all on function public.sign_link_submit(text, jsonb, text) from public;
grant execute on function public.sign_link_get(text) to anon, authenticated;
grant execute on function public.sign_link_submit(text, jsonb, text) to anon, authenticated;
