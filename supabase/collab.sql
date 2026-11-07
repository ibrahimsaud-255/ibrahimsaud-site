-- ═══════════════════════════════════════════════════════════════════════════
-- «المتعاونون» — متعاونون من خارج المملكة يبيعون عبر المؤسسة [2026-11-07]
--
-- الحلقة: المتعاون (بوابة /app/collab.html#<رمز> + رمز دخول PIN) يجهّز عرض سعر
-- أو طلب رابط دفع سريع لعميله ← «إرسال للمراجعة» (مهمّة عند إبراهيم) ← إبراهيم
-- يعتمده من اللوحة (js/24-collab.js): يُنشأ عرض السعر الرسميّ في المبيعات + رابط
-- Telr، وتُنشر نسخة العرض المطبوعة للبوابة ← العميل يدفع ← إبراهيم يسجّل الدفع
-- (تُنشأ الفاتورة الرسميّة وتُنشر نسختها) ← تحويل Western Union عبر STC Pay
-- (collab_payouts: يجمع عدّة صفقات في حوالة واحدة، برقم MTCN وإيصال).
-- المتعاون يرفق شواهد العمل (روابط + صور مضغوطة بلا EXIF) لكلّ صفقة.
--
-- الأمان (نفس نمط partner-program.sql): الجداول مالكٍ فقط (RLS)، والمتعاون لا
-- يلمسها إلا عبر دوالّ SECURITY DEFINER تتحقّق من الرمز (٤٨ حرفاً) + PIN مشفّر
-- (bcrypt)، وتُقفل ١٥ دقيقة بعد ٥ محاولات خاطئة. لا يرى إلا صفقاته.
-- طُبّق على الإنتاج ٢٠٢٦-١١-٠٧ (هجرتا collab_partners_portal + collab_set_pin_owner_only)،
-- واختُبرت البوابة كاملة بحساب اختبار حُذف بعدها. أوّل متعاون: صهيب (sohaibsama0@gmail.com).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.collab_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text,
  phone         text,
  country       text default 'المغرب',
  city          text,
  currency      text not null default 'MAD',
  rate          numeric not null default 10 check (rate >= 0 and rate <= 100),
  fee_bearer    text not null default 'partner' check (fee_bearer in ('partner','foundation')),
  perms         jsonb not null default '{"quote":true,"paylink":true,"invoice":true,"statement":true}',
  payout        jsonb not null default '{}',
  status        text not null default 'active' check (status in ('active','suspended')),
  portal_token  text not null unique check (length(portal_token) >= 40),
  pin_hash      text,
  pin_fails     int not null default 0,
  locked_until  timestamptz,
  last_seen     timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.collab_payouts (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.collab_members(id) on delete restrict,
  sent_at     date not null default current_date,
  channel     text not null default 'stcpay_wu',
  sar_sent    numeric not null default 0,   -- المبلغ المرسَل للمستلم بالريال
  fee         numeric not null default 0,   -- رسوم الحوالة الفعليّة (شاملة الضريبة)
  fx          numeric,                      -- سعر الصرف الفعليّ (درهم لكلّ ريال)
  received    numeric,                      -- ما استلمه فعلاً بعملته
  ref         text,                         -- رقم MTCN
  receipt     text,                         -- صورة الإيصال (data URL مضغوط)
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.collab_deals (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references public.collab_members(id) on delete restrict,
  kind           text not null default 'quote' check (kind in ('quote','paylink')),
  status         text not null default 'draft'
                 check (status in ('draft','submitted','changes','approved','paid','settled','cancelled')),
  title          text,
  client         jsonb not null default '{}',
  items          jsonb not null default '[]',
  subtotal       numeric not null default 0,
  vat            numeric not null default 0,
  total          numeric not null default 0,
  pay_method     text not null default 'card' check (pay_method in ('mada','card')),
  rate           numeric not null,
  fee_bearer     text not null default 'partner',
  partner_note   text,
  owner_note     text,
  pay_url        text,
  doc_no         text,
  sale_ref       text,
  invoice_ref    text,
  invoice_no     text,
  quote_html     text,
  invoice_html   text,
  paid           jsonb,     -- {at, amount, method, gateway_fee, ref}
  payout_id      uuid references public.collab_payouts(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  submitted_at   timestamptz
);
create index if not exists collab_deals_member_idx on public.collab_deals(member_id, created_at desc);
create index if not exists collab_deals_payout_idx on public.collab_deals(payout_id);

create table if not exists public.collab_evidence (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.collab_deals(id) on delete cascade,
  member_id   uuid not null references public.collab_members(id) on delete cascade,
  kind        text not null check (kind in ('link','image')),
  url         text,
  caption     text,
  data        text,
  size        int,
  created_at  timestamptz not null default now()
);
create index if not exists collab_evidence_deal_idx on public.collab_evidence(deal_id);
create index if not exists collab_evidence_member_idx on public.collab_evidence(member_id);

create table if not exists public.collab_events (
  id         bigserial primary key,
  deal_id    uuid,
  member_id  uuid,
  actor      text not null,          -- partner | owner
  action     text not null,
  data       jsonb,
  at         timestamptz not null default now()
);
create index if not exists collab_events_deal_idx on public.collab_events(deal_id, at);

create table if not exists public.collab_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ── RLS: مالكٍ فقط ─────────────────────────────────────────────────────────
do $$ declare t text; begin
  foreach t in array array['collab_members','collab_payouts','collab_deals','collab_evidence','collab_events','collab_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_owner', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')
      with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')$p$, t||'_owner', t);
  end loop;
end $$;

-- ── التحقّق: يعيد 'ok:<id>' أو رسالة خطأ (لا يرمي استثناءً كي يُحفظ عدّاد المحاولات) ──
create or replace function public.collab_check(p_token text, p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare m public.collab_members;
begin
  if p_token is null or length(p_token) < 40 then return 'الرابط غير صالح.'; end if;
  select * into m from public.collab_members where portal_token = p_token;
  if not found then return 'الرابط غير صالح.'; end if;
  if m.status <> 'active' then return 'الحساب موقوف حالياً — تواصل مع إبراهيم.'; end if;
  if m.pin_hash is null then return 'لم يُفعَّل رمز الدخول بعد — اطلبه من إبراهيم.'; end if;
  if m.locked_until is not null and m.locked_until > now() then
    return 'محاولات كثيرة خاطئة — حاول بعد ربع ساعة.'; end if;
  if p_pin is null or extensions.crypt(p_pin, m.pin_hash) <> m.pin_hash then
    update public.collab_members set pin_fails = pin_fails + 1,
      locked_until = case when pin_fails + 1 >= 5 then now() + interval '15 minutes' else null end
      where id = m.id;
    return 'رمز الدخول غير صحيح.';
  end if;
  if m.pin_fails > 0 or m.locked_until is not null then
    update public.collab_members set pin_fails = 0, locked_until = null where id = m.id; end if;
  return 'ok:' || m.id::text;
end $$;
revoke all on function public.collab_check(text,text) from public, anon, authenticated;

create or replace function public.collab_log(p_deal uuid, p_member uuid, p_action text, p_data jsonb default null)
returns void language sql security definer set search_path = public as $$
  insert into public.collab_events(deal_id, member_id, actor, action, data) values (p_deal, p_member, 'partner', p_action, p_data)
$$;
revoke all on function public.collab_log(uuid,uuid,text,jsonb) from public, anon, authenticated;

-- ── للمتعاون: كلّ ما في بوابته ───────────────────────────────────────────────
create or replace function public.collab_portal(p_token text, p_pin text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid; res jsonb;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  update public.collab_members set last_seen = now() where id = mid;
  select jsonb_build_object(
    'member', (select jsonb_build_object('id',id,'name',name,'email',email,'country',country,'city',city,
                 'currency',currency,'rate',rate,'fee_bearer',fee_bearer,'perms',perms,'payout',payout)
               from public.collab_members where id = mid),
    'settings', coalesce((select jsonb_object_agg(key, value) from public.collab_settings), '{}'::jsonb),
    'deals', coalesce((select jsonb_agg(jsonb_build_object(
        'id',d.id,'kind',d.kind,'status',d.status,'title',d.title,'client',d.client,'items',d.items,
        'subtotal',d.subtotal,'vat',d.vat,'total',d.total,'pay_method',d.pay_method,'rate',d.rate,
        'fee_bearer',d.fee_bearer,'partner_note',d.partner_note,'owner_note',d.owner_note,'pay_url',d.pay_url,
        'doc_no',d.doc_no,'invoice_no',d.invoice_no,'has_quote',d.quote_html is not null,
        'has_invoice',d.invoice_html is not null,'paid',d.paid,'payout_id',d.payout_id,
        'created_at',d.created_at,'updated_at',d.updated_at,'submitted_at',d.submitted_at,
        'evidence',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'kind',e.kind,'url',e.url,
            'caption',e.caption,'size',e.size,'created_at',e.created_at) order by e.created_at)
          from public.collab_evidence e where e.deal_id = d.id), '[]'::jsonb),
        'events',coalesce((select jsonb_agg(jsonb_build_object('actor',x.actor,'action',x.action,'at',x.at) order by x.at)
          from public.collab_events x where x.deal_id = d.id), '[]'::jsonb)
      ) order by d.created_at desc) from public.collab_deals d where d.member_id = mid), '[]'::jsonb),
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'sent_at',p.sent_at,'channel',p.channel,
        'sar_sent',p.sar_sent,'fee',p.fee,'fx',p.fx,'received',p.received,'ref',p.ref,'note',p.note,
        'has_receipt',p.receipt is not null) order by p.sent_at desc)
      from public.collab_payouts p where p.member_id = mid), '[]'::jsonb)
  ) into res;
  return res;
end $$;

-- ── للمتعاون: حفظ مسودّة (جديدة أو مُعادة للتعديل) — المجاميع تُحسب هنا لا في المتصفّح ──
create or replace function public.collab_save_deal(p_token text, p_pin text, p_deal jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid; m public.collab_members; d public.collab_deals; did uuid;
  k text; its jsonb := '[]'::jsonb; it jsonb; q numeric; pr numeric; sub numeric := 0; vt numeric := 0;
  vat_on boolean;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  select * into m from public.collab_members where id = mid;
  k := coalesce(p_deal->>'kind', 'quote');
  if k not in ('quote','paylink') then return jsonb_build_object('error','نوع غير معروف.'); end if;
  if coalesce((m.perms->>k)::boolean, false) is not true then
    return jsonb_build_object('error','هذه الصلاحيّة غير مفعّلة لحسابك.'); end if;
  if jsonb_typeof(p_deal->'items') is distinct from 'array' or jsonb_array_length(p_deal->'items') = 0
     or jsonb_array_length(p_deal->'items') > 30 then
    return jsonb_build_object('error','أضف بنداً واحداً على الأقلّ (٣٠ كحدّ أعلى).'); end if;
  for it in select * from jsonb_array_elements(p_deal->'items') loop
    q := greatest(coalesce(nullif(it->>'qty','')::numeric, 1), 0);
    pr := greatest(coalesce(nullif(it->>'price','')::numeric, 0), 0);
    if length(coalesce(it->>'desc','')) = 0 then return jsonb_build_object('error','كلّ بند يحتاج وصفاً.'); end if;
    its := its || jsonb_build_array(jsonb_build_object('desc', left(it->>'desc', 300), 'qty', q, 'price', pr));
    sub := sub + round(q * pr, 2);
  end loop;
  if sub <= 0 or sub > 1000000 then return jsonb_build_object('error','المبلغ غير منطقيّ.'); end if;
  vat_on := coalesce((select (value->>'enabled')::boolean from public.collab_settings where key = 'vat'), false);
  if vat_on then vt := round(sub * 0.15, 2); end if;
  if length(coalesce(p_deal#>>'{client,name}','')) < 2 then
    return jsonb_build_object('error','اكتب اسم العميل.'); end if;

  if nullif(p_deal->>'id','') is not null then
    select * into d from public.collab_deals where id = (p_deal->>'id')::uuid and member_id = mid;
    if not found then return jsonb_build_object('error','الصفقة غير موجودة.'); end if;
    if d.status not in ('draft','changes') then
      return jsonb_build_object('error','لا تُعدَّل بعد إرسالها للمراجعة.'); end if;
    update public.collab_deals set kind = k, title = left(p_deal->>'title', 200),
      client = jsonb_build_object('name', left(p_deal#>>'{client,name}',150), 'phone', left(p_deal#>>'{client,phone}',40),
        'email', left(p_deal#>>'{client,email}',150), 'city', left(p_deal#>>'{client,city}',80), 'vat', left(p_deal#>>'{client,vat}',20)),
      items = its, subtotal = sub, vat = vt, total = sub + vt,
      pay_method = case when p_deal->>'pay_method' = 'mada' then 'mada' else 'card' end,
      rate = m.rate, fee_bearer = m.fee_bearer,
      partner_note = left(p_deal->>'partner_note', 2000), updated_at = now()
      where id = d.id;
    did := d.id;
    perform public.collab_log(did, mid, 'edit', null);
  else
    if (select count(*) from public.collab_deals where member_id = mid and status = 'draft') >= 50 then
      return jsonb_build_object('error','مسودّات كثيرة — أرسل أو ألغِ بعضها.'); end if;
    insert into public.collab_deals(member_id, kind, title, client, items, subtotal, vat, total, pay_method, rate, fee_bearer, partner_note)
    values (mid, k, left(p_deal->>'title', 200),
      jsonb_build_object('name', left(p_deal#>>'{client,name}',150), 'phone', left(p_deal#>>'{client,phone}',40),
        'email', left(p_deal#>>'{client,email}',150), 'city', left(p_deal#>>'{client,city}',80), 'vat', left(p_deal#>>'{client,vat}',20)),
      its, sub, vt, sub + vt, case when p_deal->>'pay_method' = 'mada' then 'mada' else 'card' end,
      m.rate, m.fee_bearer, left(p_deal->>'partner_note', 2000))
    returning id into did;
    perform public.collab_log(did, mid, 'create', null);
  end if;
  return jsonb_build_object('ok', true, 'id', did);
end $$;

-- ── للمتعاون: إرسال للمراجعة / إلغاء ─────────────────────────────────────────
create or replace function public.collab_submit(p_token text, p_pin text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  update public.collab_deals set status = 'submitted', submitted_at = now(), updated_at = now()
    where id = p_id and member_id = mid and status in ('draft','changes');
  if not found then return jsonb_build_object('error','لا يمكن إرسالها الآن.'); end if;
  perform public.collab_log(p_id, mid, 'submit', null);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.collab_cancel(p_token text, p_pin text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  update public.collab_deals set status = 'cancelled', updated_at = now()
    where id = p_id and member_id = mid and status in ('draft','changes','submitted');
  if not found then return jsonb_build_object('error','لا يمكن إلغاؤها بعد اعتمادها — راسل إبراهيم.'); end if;
  perform public.collab_log(p_id, mid, 'cancel', null);
  return jsonb_build_object('ok', true);
end $$;

-- ── للمتعاون: شواهد العمل ────────────────────────────────────────────────────
create or replace function public.collab_add_evidence(p_token text, p_pin text, p_deal uuid, p_kind text,
  p_url text, p_caption text, p_data text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid; eid uuid;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  if not exists (select 1 from public.collab_deals where id = p_deal and member_id = mid and status <> 'cancelled') then
    return jsonb_build_object('error','الصفقة غير موجودة.'); end if;
  if (select count(*) from public.collab_evidence where deal_id = p_deal) >= 40 then
    return jsonb_build_object('error','بلغت الحدّ (٤٠ شاهداً للصفقة).'); end if;
  if p_kind = 'link' then
    if p_url is null or p_url !~* '^https?://' or length(p_url) > 1000 then
      return jsonb_build_object('error','الرابط يجب أن يبدأ بـ https://'); end if;
    insert into public.collab_evidence(deal_id, member_id, kind, url, caption)
      values (p_deal, mid, 'link', p_url, left(p_caption, 300)) returning id into eid;
  elsif p_kind = 'image' then
    if p_data is null or p_data !~ '^data:image/(jpeg|png|webp);base64,' or length(p_data) > 900000 then
      return jsonb_build_object('error','الصورة غير صالحة أو أكبر من المسموح.'); end if;
    insert into public.collab_evidence(deal_id, member_id, kind, data, size, caption)
      values (p_deal, mid, 'image', p_data, length(p_data), left(p_caption, 300)) returning id into eid;
  else return jsonb_build_object('error','نوع غير معروف.'); end if;
  perform public.collab_log(p_deal, mid, 'evidence', jsonb_build_object('kind', p_kind));
  return jsonb_build_object('ok', true, 'id', eid);
end $$;

create or replace function public.collab_del_evidence(p_token text, p_pin text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid; did uuid;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  delete from public.collab_evidence e using public.collab_deals d
    where e.id = p_id and e.member_id = mid and d.id = e.deal_id and d.status not in ('settled')
    returning e.deal_id into did;
  if did is null then return jsonb_build_object('error','لا يُحذف شاهد صفقة مُسوّاة.'); end if;
  perform public.collab_log(did, mid, 'evidence_del', null);
  return jsonb_build_object('ok', true);
end $$;

-- ── للمتعاون: محتوى ثقيل عند الطلب (صورة شاهد، مستند رسميّ، إيصال حوالة) ────────
create or replace function public.collab_blob(p_token text, p_pin text, p_what text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text; mid uuid; res_txt text;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  mid := substr(v, 4)::uuid;
  if p_what = 'evidence' then select data into res_txt from public.collab_evidence where id = p_id and member_id = mid;
  elsif p_what = 'quote' then select quote_html into res_txt from public.collab_deals where id = p_id and member_id = mid;
  elsif p_what = 'invoice' then select invoice_html into res_txt from public.collab_deals where id = p_id and member_id = mid;
  elsif p_what = 'receipt' then select receipt into res_txt from public.collab_payouts where id = p_id and member_id = mid;
  end if;
  if res_txt is null then return jsonb_build_object('error','غير متاح.'); end if;
  return jsonb_build_object('ok', true, 'data', res_txt);
end $$;

-- ── للمتعاون: تغيير رمز الدخول ───────────────────────────────────────────────
create or replace function public.collab_change_pin(p_token text, p_pin text, p_new text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v text; mid uuid;
begin
  v := public.collab_check(p_token, p_pin);
  if v not like 'ok:%' then return jsonb_build_object('error', v); end if;
  if p_new !~ '^[0-9]{6,12}$' then return jsonb_build_object('error','الرمز ٦ أرقام على الأقلّ.'); end if;
  mid := substr(v, 4)::uuid;
  update public.collab_members set pin_hash = extensions.crypt(p_new, extensions.gen_salt('bf', 8)) where id = mid;
  perform public.collab_log(null, mid, 'pin_change', null);
  return jsonb_build_object('ok', true);
end $$;

-- ── للمالك: تعيين رمز الدخول (المتصفّح لا يملك bcrypt) ─────────────────────────
create or replace function public.collab_set_pin(p_member uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  if (auth.jwt() ->> 'email') is distinct from 'ibrahimsaud25@gmail.com' then raise exception 'forbidden'; end if;
  if p_pin !~ '^[0-9]{6,12}$' then return jsonb_build_object('error','الرمز ٦ أرقام على الأقلّ.'); end if;
  update public.collab_members set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf', 8)),
    pin_fails = 0, locked_until = null where id = p_member;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.collab_portal(text,text), public.collab_save_deal(text,text,jsonb),
  public.collab_submit(text,text,uuid), public.collab_cancel(text,text,uuid),
  public.collab_add_evidence(text,text,uuid,text,text,text,text), public.collab_del_evidence(text,text,uuid),
  public.collab_blob(text,text,text,uuid), public.collab_change_pin(text,text,text),
  public.collab_set_pin(uuid,text) from public;
grant execute on function public.collab_portal(text,text), public.collab_save_deal(text,text,jsonb),
  public.collab_submit(text,text,uuid), public.collab_cancel(text,text,uuid),
  public.collab_add_evidence(text,text,uuid,text,text,text,text), public.collab_del_evidence(text,text,uuid),
  public.collab_blob(text,text,text,uuid), public.collab_change_pin(text,text,text) to anon, authenticated;
grant execute on function public.collab_set_pin(uuid,text) to authenticated;
revoke execute on function public.collab_set_pin(uuid,text) from anon;

-- ── الرسوم الافتراضيّة (تُعدَّل من اللوحة) ─────────────────────────────────────
-- Telr السعوديّة: مدى ١٪، البطاقات الائتمانيّة (ومنها Apple Pay ببطاقة ائتمان) ٢٫٦٪ + ١ ر.س،
-- وعليها ضريبة ١٥٪. Apple Pay بلا رسوم إضافيّة — تُحسب بسعر البطاقة داخلها.
-- STC Pay → Western Union (المغرب): ٢٠ ر.س + ١٥٪ ضريبة. سعر الصرف تقديريّ ويُحدَّث من التطبيق.
insert into public.collab_settings(key, value) values
  ('fees', '{"madaPct":1,"madaFixed":0,"cardPct":2.6,"cardFixed":1,"feeVat":15,"wuFee":20,"wuVat":15,"fx":2.42,"fxCur":"MAD","fxAt":"2026-11-07"}'),
  ('vat',  '{"enabled":false}')
on conflict (key) do nothing;
