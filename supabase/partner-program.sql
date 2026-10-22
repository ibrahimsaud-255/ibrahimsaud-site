-- ═══════════════════════════════════════════════════════════════════════════
-- برنامج شركاء حروف ودروس (المسار الذاتيّ المؤتمت) — [2026-10-22]
--
-- المسار كاملاً بلا تدخّل يدويّ:
--   huroofduroos.com/partners (طلب)  → pp_apply: تحقّق آليّ + رقم اتفاقية HD-S-xxxx
--   + رابط توقيع (partner_sign_links بنفس قالب اللوحة المنشور في pp_settings)
--   → huroofduroos.com/partners/sign (توقيع) → المشغّل pp_on_signed: الشريك «معتمد»
--   → huroofduroos.com/partners/portal (بوابة برمز سرّيّ) → pp_portal_lead: تسجيل مدرسة
--   مع فحص التكرار (شركاء آخرون + مدارس اللوحة + عملاء قائمون) وتثبيت حماية ٩٠ يوماً آليّاً.
--
-- اللوحة (ibrahimsaud.com/app ← الشركات، js/20-partners.js) تسحب الشركاء والمدارس
-- إلى ملفّاتها تلقائياً، وتنشر للبوابة لقطة (snapshot) بالمراحل والعمولات، وتنشر
-- قالب الاتفاقية وقائمة العملاء في pp_settings. إبراهيم يتدخّل فقط في: البيع، الصرف، الإيقاف.
--
-- الأمان: الجداول مالكٍ فقط (RLS)، والزائر لا يلمسها إلا عبر دوالّ SECURITY DEFINER
-- بمدخلات محدودة الطول ومعدّل طلبات محدود. رمز البوابة ٤٨ حرفاً سداسيّاً عشوائيّاً.
-- يعتمد على partner-sign-links.sql (مطبَّق).
-- طُبّق على الإنتاج في ٢٢ أكتوبر ٢٠٢٦ (هجرة partner_program) واختُبر المسار كاملاً داخل معاملة مُلغاة.
-- ═══════════════════════════════════════════════════════════════════════════

create sequence if not exists public.pp_agreement_seq start 5;   -- آخر رقم في اللوحة كان HD-S-0004
create sequence if not exists public.pp_ambassador_seq start 1;

create table if not exists public.pp_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.pp_partners (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in ('school','ambassador')),
  status         text not null default 'applied'
                 check (status in ('applied','signing','active','waitlist','suspended','rejected','ended')),
  agreement_no   text unique,
  name           text not null,
  phone          text not null,
  email          text,
  city           text,
  profile        jsonb not null default '{}'::jsonb,
  portal_token   text not null unique,
  sign_link_id   uuid references public.partner_sign_links(id) on delete set null,
  rate           numeric,
  protect_days   int,
  signed_at      timestamptz,
  activated_at   timestamptz,
  snapshot       jsonb,
  snapshot_at    timestamptz,
  panel_ref      text,
  imported_at    timestamptz,
  ip             text,
  ua             text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists pp_partners_phone_idx on public.pp_partners(phone);
create index if not exists pp_partners_email_idx on public.pp_partners(lower(email));
create index if not exists pp_partners_ip_idx on public.pp_partners(ip, created_at);

create table if not exists public.pp_leads (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid not null references public.pp_partners(id) on delete cascade,
  school         text not null,
  school_norm    text not null,
  city           text,
  city_norm      text,
  contact_name   text,
  contact_role   text,
  contact_phone  text,
  seats_est      int,
  notes          text,
  status         text not null check (status in ('confirmed','duplicate','existing_client','rejected')),
  decision       text,
  confirmed_at   timestamptz,
  expires_at     timestamptz,
  panel_ref      text,
  imported_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists pp_leads_partner_idx on public.pp_leads(partner_id);
create index if not exists pp_leads_norm_idx on public.pp_leads(school_norm);

-- ── RLS: مالكٍ فقط ─────────────────────────────────────────────────────────
alter table public.pp_settings enable row level security;
alter table public.pp_partners enable row level security;
alter table public.pp_leads    enable row level security;
do $$ declare t text; begin
  foreach t in array array['pp_settings','pp_partners','pp_leads'] loop
    execute format('drop policy if exists %I on public.%I', t||'_owner', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')
      with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')$p$, t||'_owner', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- ── أدوات ──────────────────────────────────────────────────────────────────
-- تطبيع الاسم للمقارنة: بلا تشكيل ولا تطويل، توحيد الألف والتاء المربوطة والياء،
-- وحذف الكلمات العامّة (مدرسة/مدارس/مجمع) حتى «مدارس الرواد» = «الرواد».
create or replace function public.pp_norm(s text) returns text language sql immutable as $$
  select btrim(regexp_replace(
           regexp_replace(
             translate(regexp_replace(lower(coalesce(s,'')), '[ً-ْـ]', '', 'g'), 'أإآةى', 'اااهي'),
             '(^|\s)(مدرسه|مدارس|مجمع|مجمعات)(\s|$)', ' ', 'g'),
           '[^0-9a-zء-ي]+', ' ', 'g'))
$$;

-- الجوال السعوديّ بصيغة 9665XXXXXXXX، أو null إن لم يصحّ.
create or replace function public.pp_phone(s text) returns text language plpgsql immutable as $$
declare d text := regexp_replace(translate(coalesce(s,''), '٠١٢٣٤٥٦٧٨٩', '0123456789'), '\D', '', 'g');
begin
  if d like '00966%' then d := substr(d, 3); end if;
  if d like '05%' and length(d) = 10 then d := '966' || substr(d, 2); end if;
  if d like '5%'  and length(d) = 9  then d := '966' || d; end if;
  if d ~ '^9665[0-9]{8}$' then return d; end if;
  return null;
end $$;

-- آيبان سعوديّ: SA + ٢٢ رقماً + تحقّق mod-97.
create or replace function public.pp_iban_ok(s text) returns boolean language plpgsql immutable as $$
declare i text := upper(regexp_replace(coalesce(s,''), '\s', '', 'g')); r text; m int := 0; c text;
begin
  if i !~ '^SA[0-9]{22}$' then return false; end if;
  r := substr(i, 5) || '2810' || substr(i, 3, 2);   -- S=28 A=10
  foreach c in array regexp_split_to_array(r, '') loop m := (m * 10 + c::int) % 97; end loop;
  return m = 1;
end $$;

-- عنوان الطلب (مقطوع من x-forwarded-for) ووكيل المتصفّح.
create or replace function public.pp_req_ip() returns text language plpgsql stable as $$
begin return nullif(btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for',''), ',', 1)), '');
exception when others then return null; end $$;
create or replace function public.pp_req_ua() returns text language plpgsql stable as $$
begin return left(coalesce(current_setting('request.headers', true)::json ->> 'user-agent',''), 300);
exception when others then return null; end $$;

create or replace function public.pp_setting(k text) returns jsonb language sql stable security definer set search_path = public as $$
  select value from public.pp_settings where key = k
$$;
revoke all on function public.pp_setting(text) from public, anon, authenticated;

create or replace function public.pp_owner_uid() returns uuid language sql stable security definer set search_path = public, auth as $$
  select id from auth.users where email = 'ibrahimsaud25@gmail.com' limit 1
$$;
revoke all on function public.pp_owner_uid() from public, anon, authenticated;

-- ينشئ رابط توقيع لشريكٍ من القالب المنشور (صالح ٧ أيام) ويعيد رمزه.
create or replace function public.pp_new_sign_link(p public.pp_partners) returns text
language plpgsql security definer set search_path = public as $$
declare tpl jsonb := public.pp_setting('sign_template'); tok text; d date := (now() at time zone 'Asia/Riyadh')::date; lid uuid;
begin
  if tpl is null then raise exception 'sign_template missing'; end if;
  tok := encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.partner_sign_links(token, owner, partner_ref, payload, expires_at)
  values (tok, public.pp_owner_uid(), 'pp:' || p.id,
    (tpl - 'customers') || jsonb_build_object(
      'v', 1, 'no', p.agreement_no, 'date', to_char(d, 'YYYY-MM-DD'), 'dateFmt', to_char(d, 'DD/MM/YYYY'),
      'hijri', '', 'day', '', 'program', true, 'portal', p.portal_token,
      'partner', jsonb_build_object('name', p.name, 'nationality', coalesce(p.profile->>'nationality',''), 'idNo', '',
                                    'city', coalesce(p.city,''), 'phone', p.phone, 'email', coalesce(p.email,''), 'bank', '', 'iban', ''),
      'createdAt', now()),
    now() + interval '7 days')
  returning id into lid;
  update public.pp_partners set sign_link_id = lid, updated_at = now() where id = p.id;
  return tok;
end $$;
revoke all on function public.pp_new_sign_link(public.pp_partners) from public, anon, authenticated;

-- ── للزائر: إعدادات البرنامج العامّة + نصّ الاتفاقية (بلا التوقيع والختم) ─────
create or replace function public.pp_terms() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'program', coalesce(public.pp_setting('program'), '{}'::jsonb),
    'agreement', (select value - 'ownerSig' - 'stamp' - 'customers' from public.pp_settings where key = 'sign_template'))
$$;

-- ── للزائر: طلب الانضمام ────────────────────────────────────────────────────
create or replace function public.pp_apply(p_kind text, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_ip text := public.pp_req_ip(); v_ua text := public.pp_req_ua();
  prog jsonb := coalesce(public.pp_setting('program'), '{}'::jsonb);
  tpl jsonb := public.pp_setting('sign_template');
  v_name text := left(btrim(coalesce(p_data->>'name','')), 120);
  v_phone text := public.pp_phone(p_data->>'phone');
  v_email text := lower(left(btrim(coalesce(p_data->>'email','')), 160));
  v_city text := left(btrim(coalesce(p_data->>'city','')), 80);
  v_prof jsonb := '{}'::jsonb; k text; r public.pp_partners; tok text; ptok text;
begin
  if p_kind not in ('school','ambassador') then return jsonb_build_object('ok',false,'error','مسار غير معروف'); end if;
  if p_kind = 'school' and coalesce((prog->>'schoolsOpen')::boolean, true) is not true then
    return jsonb_build_object('ok',false,'error','التسجيل في مسار المدارس مغلق مؤقّتاً'); end if;
  if p_kind = 'ambassador' and coalesce((prog->>'ambassadorsOpen')::boolean, true) is not true then
    return jsonb_build_object('ok',false,'error','قائمة السفراء مكتملة حالياً'); end if;
  if coalesce(p_data->>'website','') <> '' then return jsonb_build_object('ok',true,'kind',p_kind); end if; -- فخّ البوتات
  if v_ip is not null and (select count(*) from public.pp_partners where ip = v_ip and created_at > now() - interval '1 day') >= 5 then
    return jsonb_build_object('ok',false,'error','طلبات كثيرة من نفس الشبكة — حاول غداً'); end if;
  if array_length(regexp_split_to_array(v_name, '\s+'), 1) < 3 or length(v_name) < 8 then
    return jsonb_build_object('ok',false,'error','اكتب اسمك الثلاثي على الأقل كما في الهوية'); end if;
  if v_phone is null then return jsonb_build_object('ok',false,'error','رقم الجوال غير صحيح — مثال: 05xxxxxxxx'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then return jsonb_build_object('ok',false,'error','البريد الإلكتروني غير صحيح'); end if;
  if length(v_city) < 2 then return jsonb_build_object('ok',false,'error','اكتب مدينتك'); end if;
  if coalesce((p_data->>'agreed')::boolean, false) is not true then
    return jsonb_build_object('ok',false,'error','يلزم الموافقة على شروط البرنامج'); end if;

  -- طلب قائم بنفس الجوال أو البريد؟ لا نعيد رمز البوابة لمن يعرف رقماً فقط.
  if exists (select 1 from public.pp_partners where kind = p_kind and (phone = v_phone or lower(email) = v_email)
             and status not in ('rejected','ended')) then
    return jsonb_build_object('ok',false,'code','exists','error','لديك طلب قائم بهذا الجوال أو البريد. افتح رابط بوابتك من رسالة الترحيب، أو تواصل مع فريق الشراكات.'); end if;
  if p_kind = 'school' and exists (select 1 from public.app_state s, jsonb_array_elements(coalesce(s.data->'partners','[]'::jsonb)) x
             where public.pp_phone(x->>'phone') = v_phone) then
    return jsonb_build_object('ok',false,'code','exists','error','أنت شريك مسجّل لدينا مسبقاً. تواصل مع فريق الشراكات لإرسال رابط بوابتك.'); end if;

  foreach k in array array['nationality','background','experience','regions','channels','followers','heard','notes','schoolsEst'] loop
    if coalesce(p_data->>k,'') <> '' then v_prof := v_prof || jsonb_build_object(k, left(btrim(p_data->>k), 500)); end if;
  end loop;
  ptok := encode(extensions.gen_random_bytes(24), 'hex');

  if p_kind = 'ambassador' then
    insert into public.pp_partners(kind, status, agreement_no, name, phone, email, city, profile, portal_token, rate, ip, ua)
    values ('ambassador', 'waitlist', 'HD-A-' || lpad(nextval('public.pp_ambassador_seq')::text, 4, '0'),
            v_name, v_phone, v_email, v_city, v_prof, ptok, coalesce((prog->>'ambassadorRate')::numeric, 20), v_ip, v_ua)
    returning * into r;
    return jsonb_build_object('ok',true,'kind','ambassador','ref',r.agreement_no);
  end if;

  if tpl is null then return jsonb_build_object('ok',false,'error','البرنامج قيد التحديث — حاول بعد قليل'); end if;
  insert into public.pp_partners(kind, status, agreement_no, name, phone, email, city, profile, portal_token, rate, protect_days, ip, ua)
  values ('school',
          case when coalesce((prog->>'autoApprove')::boolean, true) then 'signing' else 'applied' end,
          coalesce(tpl->>'prefix','HD-S-') || lpad(nextval('public.pp_agreement_seq')::text, 4, '0'),
          v_name, v_phone, v_email, v_city, v_prof, ptok,
          coalesce((tpl->>'rate')::numeric, 10), coalesce((tpl->>'protectDays')::int, 90), v_ip, v_ua)
  returning * into r;
  if r.status = 'applied' then
    return jsonb_build_object('ok',true,'kind','school','review',true,'agreement_no',r.agreement_no,'portal',ptok); end if;
  tok := public.pp_new_sign_link(r);
  return jsonb_build_object('ok',true,'kind','school','agreement_no',r.agreement_no,'sign',tok,'portal',ptok);
end $$;

-- ── تشديد التوقيع لروابط البرنامج: الهويّة والآيبان إلزاميّان وصحيحان ─────────
create or replace function public.pp_sign_guard() returns trigger language plpgsql security definer set search_path = public as $$
declare d jsonb := new.signer_data;
begin
  if new.partner_ref like 'pp:%' and new.status = 'signed' and old.status is distinct from 'signed' then
    if coalesce(d->>'idNo','') !~ '^[12][0-9]{9}$' then raise exception 'رقم الهوية / الإقامة غير صحيح (١٠ أرقام تبدأ بـ ١ أو ٢)'; end if;
    if not public.pp_iban_ok(d->>'iban') then raise exception 'رقم الآيبان غير صحيح — يبدأ بـ SA ويتكوّن من ٢٤ خانة'; end if;
    if length(coalesce(d->>'bank','')) < 2 then raise exception 'اكتب اسم البنك لتحويل العمولات'; end if;
  end if;
  return new;
end $$;
drop trigger if exists pp_sign_guard on public.partner_sign_links;
create trigger pp_sign_guard before update on public.partner_sign_links for each row execute function public.pp_sign_guard();

-- ── بعد التوقيع: الشريك معتمد آليّاً ─────────────────────────────────────────
create or replace function public.pp_on_signed() returns trigger language plpgsql security definer set search_path = public as $$
declare d jsonb := new.signer_data;
begin
  if new.partner_ref like 'pp:%' and new.status = 'signed' and old.status is distinct from 'signed' then
    update public.pp_partners
       set status = 'active', signed_at = new.signed_at, activated_at = now(), updated_at = now(),
           name = coalesce(nullif(d->>'name',''), name),
           phone = coalesce(public.pp_phone(d->>'phone'), phone),
           email = coalesce(nullif(lower(d->>'email'),''), email),
           city = coalesce(nullif(d->>'city',''), city)
     where id = substr(new.partner_ref, 4)::uuid and status in ('signing','applied');
  end if;
  return new;
end $$;
drop trigger if exists pp_on_signed on public.partner_sign_links;
create trigger pp_on_signed after update on public.partner_sign_links for each row execute function public.pp_on_signed();

-- رسائل الحارس تصل للموقّع: sign_link_submit يلتقط الاستثناء ويعيده خطأً مقروءاً.
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
  v_data := '{}'::jsonb;
  foreach k in array array['name','nationality','idNo','city','phone','email','bank','iban'] loop
    v_data := v_data || jsonb_build_object(k, left(coalesce(btrim(p_data ->> k),''), 120));
  end loop;
  if r.partner_ref like 'pp:%' then
    v_data := v_data || jsonb_build_object('idNo', translate(v_data->>'idNo', '٠١٢٣٤٥٦٧٨٩', '0123456789'),
                                           'iban', upper(regexp_replace(translate(v_data->>'iban', '٠١٢٣٤٥٦٧٨٩', '0123456789'), '\s', '', 'g')));
  end if;
  if length(v_data->>'name') < 6 or length(v_data->>'idNo') < 8 or length(v_data->>'phone') < 9 then
    return jsonb_build_object('ok',false,'error','أكمل الاسم ورقم الهوية والجوال'); end if;
  if coalesce((p_data ->> 'agreed')::boolean, false) is not true then
    return jsonb_build_object('ok',false,'error','يجب الموافقة على البنود'); end if;
  v_ip := public.pp_req_ip(); v_ua := public.pp_req_ua();
  v_hash := encode(extensions.digest(convert_to(r.payload::text || v_data::text || p_signature, 'UTF8'), 'sha256'), 'hex');
  begin
    update public.partner_sign_links
       set status = 'signed', signed_at = now(), signer_data = v_data, signature = p_signature,
           signer_ip = v_ip, signer_ua = v_ua, doc_hash = v_hash
     where id = r.id;
  exception when raise_exception then
    return jsonb_build_object('ok',false,'error',sqlerrm);
  end;
  return jsonb_build_object('ok',true,'signed_at',now(),'doc_hash',v_hash);
end $$;

-- ── للشريك: البوابة ─────────────────────────────────────────────────────────
create or replace function public.pp_portal(p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.pp_partners; l public.partner_sign_links; tok text; leads jsonb;
begin
  if p_token is null or length(p_token) < 40 then return jsonb_build_object('state','invalid'); end if;
  select * into r from public.pp_partners where portal_token = p_token;
  if not found or r.status in ('rejected') then return jsonb_build_object('state','invalid'); end if;

  -- لم يوقّع بعد: أعد رابط التوقيع القائم، أو جدّده آليّاً إن انتهى.
  if r.status = 'signing' then
    select * into l from public.partner_sign_links where id = r.sign_link_id;
    if l.id is null or l.status = 'revoked' or (l.status = 'pending' and l.expires_at < now()) then
      tok := public.pp_new_sign_link(r);
    elsif l.status = 'pending' then tok := l.token;
    end if;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', x.id, 'school', x.school, 'city', x.city, 'status', x.status, 'decision', x.decision,
           'contact', x.contact_name, 'seats', x.seats_est,
           'confirmed_at', x.confirmed_at, 'expires_at', x.expires_at, 'created_at', x.created_at)
         order by x.created_at desc), '[]'::jsonb)
    into leads from public.pp_leads x where x.partner_id = r.id;

  return jsonb_build_object(
    'state', r.status, 'kind', r.kind, 'agreement_no', r.agreement_no, 'name', r.name,
    'city', r.city, 'email', r.email, 'rate', r.rate, 'protect_days', r.protect_days,
    'created_at', r.created_at, 'signed_at', r.signed_at, 'sign', tok,
    'leads', leads, 'snapshot', r.snapshot, 'snapshot_at', r.snapshot_at,
    'program', coalesce(public.pp_setting('program'), '{}'::jsonb));
end $$;

-- ── للشريك: تسجيل مدرسة (فحص تكرار + حماية آليّة) ────────────────────────────
create or replace function public.pp_portal_lead(p_token text, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  r public.pp_partners; v_school text := left(btrim(coalesce(p_data->>'school','')), 140);
  v_city text := left(btrim(coalesce(p_data->>'city','')), 80);
  v_norm text; v_cnorm text; v_phone text; v_seats int; c record; v_status text; v_msg text;
  v_exp timestamptz; customers jsonb := coalesce(public.pp_setting('customers'), '[]'::jsonb); x public.pp_leads;
begin
  select * into r from public.pp_partners where portal_token = p_token and length(p_token) >= 40;
  if not found then return jsonb_build_object('ok',false,'error','الرابط غير صالح'); end if;
  if r.status <> 'active' then return jsonb_build_object('ok',false,'error','يتاح تسجيل المدارس بعد توقيع الاتفاقية واعتمادها'); end if;
  if (select count(*) from public.pp_leads where partner_id = r.id and created_at > now() - interval '1 day') >= 25 then
    return jsonb_build_object('ok',false,'error','وصلت حدّ التسجيل اليوميّ (٢٥ مدرسة) — أكمل غداً'); end if;
  v_norm := public.pp_norm(v_school); v_cnorm := public.pp_norm(v_city);
  if length(v_norm) < 3 then return jsonb_build_object('ok',false,'error','اكتب اسم المدرسة كاملاً'); end if;
  if length(v_cnorm) < 2 then return jsonb_build_object('ok',false,'error','اكتب مدينة المدرسة'); end if;
  if length(btrim(coalesce(p_data->>'contact',''))) < 3 then return jsonb_build_object('ok',false,'error','اكتب اسم المسؤول الذي تواصلت معه'); end if;
  v_phone := public.pp_phone(p_data->>'phone');
  if coalesce(p_data->>'phone','') <> '' and v_phone is null then return jsonb_build_object('ok',false,'error','جوال المسؤول غير صحيح'); end if;
  v_seats := nullif(regexp_replace(coalesce(p_data->>'seats',''), '\D', '', 'g'), '')::int;

  -- ١) عميل قائم لدينا (قائمة تنشرها اللوحة من حزم المدارس)
  if customers ? v_norm then
    v_status := 'existing_client'; v_msg := 'هذه المدرسة عميل قائم لدى حروف ودروس، فلا تُسجَّل كإحالة جديدة.';
  end if;
  -- ٢) مسجّلة لدى شريك آخر (أو لديك) وحمايتها سارية
  if v_status is null then
    select x2.*, (x2.partner_id = r.id) as mine into c from public.pp_leads x2
     where x2.school_norm = v_norm and coalesce(x2.city_norm,'') = v_cnorm
       and x2.status = 'confirmed' and x2.expires_at > now() limit 1;
    if found then
      v_status := 'duplicate';
      v_msg := case when c.mine then 'هذه المدرسة مسجّلة باسمك مسبقاً، وحمايتها سارية حتى ' || to_char(c.expires_at at time zone 'Asia/Riyadh','DD/MM/YYYY') || '.'
                    else 'هذه المدرسة مسجّلة باسم شريك آخر وحمايتها سارية. حسب المادة الرابعة الأولويّة لمن سبق تسجيله.' end;
    end if;
  end if;
  -- ٣) مسجّلة يدويّاً في اللوحة لشريك آخر ومرحلتها مفتوحة
  if v_status is null and exists (
      select 1 from public.app_state s, jsonb_array_elements(coalesce(s.data->'partnerLeads','[]'::jsonb)) y
       where coalesce(y->>'ppLeadId','') = '' and public.pp_norm(y->>'school') = v_norm
         and coalesce(y->>'stage','') not in ('lost')
         and left(coalesce(nullif(y->>'confirmedAt',''), nullif(y->>'registeredAt',''), '1970-01-01'), 10)::date + coalesce(r.protect_days, 90) > current_date) then
    v_status := 'duplicate'; v_msg := 'هذه المدرسة مسجّلة لدينا مسبقاً عبر شريك آخر وحمايتها سارية.';
  end if;
  if v_status is null then
    v_status := 'confirmed'; v_exp := now() + make_interval(days => coalesce(r.protect_days, 90));
    v_msg := 'تم تأكيد التسجيل باسمك. حماية المدرسة سارية حتى ' || to_char(v_exp at time zone 'Asia/Riyadh','DD/MM/YYYY') || '.';
  end if;

  insert into public.pp_leads(partner_id, school, school_norm, city, city_norm, contact_name, contact_role, contact_phone,
                              seats_est, notes, status, decision, confirmed_at, expires_at)
  values (r.id, v_school, v_norm, v_city, v_cnorm, left(btrim(p_data->>'contact'),100), left(btrim(coalesce(p_data->>'role','')),60),
          v_phone, v_seats, left(btrim(coalesce(p_data->>'notes','')),500), v_status, v_msg,
          case when v_status = 'confirmed' then now() end, v_exp)
  returning * into x;
  return jsonb_build_object('ok',true,'id',x.id,'status',v_status,'decision',v_msg,'expires_at',v_exp);
end $$;

-- ── للمالك: رقم الاتفاقية التالي (اللوحة تأخذ أرقامها من نفس العدّاد) ─────────
create or replace function public.pp_next_agreement_no() returns text
language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() ->> 'email') is distinct from 'ibrahimsaud25@gmail.com' then raise exception 'forbidden'; end if;
  return coalesce(public.pp_setting('sign_template')->>'prefix','HD-S-') || lpad(nextval('public.pp_agreement_seq')::text, 4, '0');
end $$;

-- ── الصلاحيات ──────────────────────────────────────────────────────────────
revoke all on function public.pp_terms() from public;
revoke all on function public.pp_apply(text, jsonb) from public;
revoke all on function public.pp_portal(text) from public;
revoke all on function public.pp_portal_lead(text, jsonb) from public;
revoke all on function public.pp_next_agreement_no() from public;
grant execute on function public.pp_terms() to anon, authenticated;
grant execute on function public.pp_apply(text, jsonb) to anon, authenticated;
grant execute on function public.pp_portal(text) to anon, authenticated;
grant execute on function public.pp_portal_lead(text, jsonb) to anon, authenticated;
grant execute on function public.pp_next_agreement_no() to authenticated;
grant execute on function public.sign_link_submit(text, jsonb, text) to anon, authenticated;
revoke all on sequence public.pp_agreement_seq, public.pp_ambassador_seq from anon, authenticated;
