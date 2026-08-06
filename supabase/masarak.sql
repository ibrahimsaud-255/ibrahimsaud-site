-- ============================================================
--  «مسارك» — أكواد التفعيل ولوحة التحكم
--  شغّله في: Supabase → SQL Editor → New query → Run
--  آمن لإعادة التشغيل (idempotent).
--
--  الفكرة الأمنية:
--   • الجداول مقفلة تماماً (RLS مفعّل بلا أي سياسة) — المفتاح العلني
--     المنشور في الموقع لا يستطيع قراءة الأكواد ولا الكتابة فيها إطلاقاً.
--   • كل تعامل يمرّ عبر دوال SECURITY DEFINER تفحص شروطها بنفسها.
--   • دوال الإدارة تشترط مفتاح المالك، ويُقارَن بتجزئته لا بنصّه.
-- ============================================================

create extension if not exists pgcrypto;

-- ═══════════════ الجداول ═══════════════

-- أكواد التفعيل التي تُباع عبر سلة
create table if not exists public.masarak_codes (
  code         text primary key,
  batch        text,                       -- اسم الدفعة (لتتبّع الطلبات)
  note         text,                       -- ملاحظة حرّة (اسم العميل، رقم الطلب…)
  status       text not null default 'new' -- new | used | revoked
               check (status in ('new', 'used', 'revoked')),
  device       text,                       -- بصمة جهاز أول تفعيل
  token        uuid,                       -- رمز الجلسة بعد التفعيل
  activated_at timestamptz,
  expires_at   timestamptz,                -- نهاية صلاحية الوصول بعد التفعيل
  created_at   timestamptz not null default now()
);
create index if not exists masarak_codes_batch_idx  on public.masarak_codes(batch);
create index if not exists masarak_codes_status_idx on public.masarak_codes(status);
create index if not exists masarak_codes_token_idx  on public.masarak_codes(token);

-- نتائج الطلاب — للإحصاء داخل اللوحة (بلا أي بيانات تعريف شخصية)
create table if not exists public.masarak_results (
  id         uuid primary key default gen_random_uuid(),
  code       text references public.masarak_codes(code) on delete set null,
  track      text,                         -- sci | lit
  gender     text,                         -- male | female
  weighted   numeric,                      -- أعلى نسبة موزونة
  riasec     jsonb,                        -- درجات الميول الست
  anchors    jsonb,                        -- درجات القيم المهنية
  top_majors jsonb,                        -- أعلى خمسة تخصصات مطابقة
  created_at timestamptz not null default now()
);
create index if not exists masarak_results_created_idx on public.masarak_results(created_at desc);

-- مفتاح المالك للوحة التحكم (صف واحد فقط)
create table if not exists public.masarak_admin (
  id       int primary key default 1 check (id = 1),
  key_hash text not null,
  updated_at timestamptz not null default now()
);

-- ═══════════════ الإقفال ═══════════════
-- RLS مفعّل بلا سياسات = لا أحد يصل للجداول مباشرةً إلا service_role.

alter table public.masarak_codes   enable row level security;
alter table public.masarak_results enable row level security;
alter table public.masarak_admin   enable row level security;

-- ═══════════════ أدوات داخلية ═══════════════

create or replace function public.masarak_hash(p_text text)
returns text language sql immutable as $$
  select encode(digest(p_text, 'sha256'), 'hex');
$$;

/** يتحقّق من مفتاح المالك؛ يرمي خطأ إن كان خاطئاً. */
create or replace function public.masarak_require_admin(p_key text)
returns void language plpgsql security definer set search_path = public as $$
declare v_hash text;
begin
  select key_hash into v_hash from public.masarak_admin where id = 1;
  if v_hash is null then
    raise exception 'لم يُضبط مفتاح اللوحة بعد';
  end if;
  if v_hash <> public.masarak_hash(coalesce(p_key, '')) then
    raise exception 'مفتاح غير صحيح';
  end if;
end $$;

/** يضبط مفتاح اللوحة. شغّله مرّة واحدة يدوياً من SQL Editor. */
create or replace function public.masarak_set_admin_key(p_new_key text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.masarak_admin (id, key_hash, updated_at)
  values (1, public.masarak_hash(p_new_key), now())
  on conflict (id) do update
    set key_hash = excluded.key_hash, updated_at = now();
end $$;
revoke all on function public.masarak_set_admin_key(text) from anon, authenticated;

-- ═══════════════ واجهة الطالب ═══════════════

/**
 * تفعيل كود.
 * • كود جديد            → يُفعَّل ويُربط بالجهاز ويُعاد رمز جلسة.
 * • كود مفعَّل بنفس الجهاز → يُعاد الرمز نفسه (حتى لا يضيع الوصول عند مسح المتصفح).
 * • كود مفعَّل بجهاز آخر   → يُرفض.
 */
create or replace function public.masarak_redeem(p_code text, p_device text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r public.masarak_codes%rowtype;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if length(v_code) < 8 then
    return jsonb_build_object('ok', false, 'reason', 'format');
  end if;

  -- المقارنة تتجاهل الشرطات وحالة الأحرف
  select * into r from public.masarak_codes
   where upper(regexp_replace(code, '[^A-Za-z0-9]', '', 'g')) = v_code
   limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if r.status = 'revoked' then
    return jsonb_build_object('ok', false, 'reason', 'revoked');
  end if;

  if r.status = 'used' then
    if r.device is not distinct from p_device then
      if r.expires_at is not null and r.expires_at < now() then
        return jsonb_build_object('ok', false, 'reason', 'expired');
      end if;
      return jsonb_build_object(
        'ok', true, 'token', r.token, 'code', r.code, 'expires_at', r.expires_at
      );
    end if;
    return jsonb_build_object('ok', false, 'reason', 'used');
  end if;

  update public.masarak_codes
     set status = 'used',
         device = p_device,
         token = gen_random_uuid(),
         activated_at = now(),
         expires_at = coalesce(expires_at, now() + interval '365 days')
   where code = r.code
  returning * into r;

  return jsonb_build_object(
    'ok', true, 'token', r.token, 'code', r.code, 'expires_at', r.expires_at
  );
end $$;

/** يتحقّق من صلاحية رمز جلسة محفوظ في متصفّح الطالب. */
create or replace function public.masarak_verify(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.masarak_codes%rowtype;
begin
  select * into r from public.masarak_codes where token = p_token limit 1;
  if not found or r.status <> 'used' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if r.expires_at is not null and r.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;
  return jsonb_build_object('ok', true, 'code', r.code, 'expires_at', r.expires_at);
end $$;

/** يحفظ نتيجة الطالب للإحصاء. لا يُخزَّن أي شيء يعرّف بشخصه. */
create or replace function public.masarak_save_result(
  p_token uuid, p_payload jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.masarak_codes%rowtype;
begin
  select * into r from public.masarak_codes where token = p_token and status = 'used' limit 1;
  if not found then
    return jsonb_build_object('ok', false);
  end if;

  insert into public.masarak_results (code, track, gender, weighted, riasec, anchors, top_majors)
  values (
    r.code,
    p_payload->>'track',
    p_payload->>'gender',
    nullif(p_payload->>'weighted', '')::numeric,
    p_payload->'riasec',
    p_payload->'anchors',
    p_payload->'top_majors'
  );
  return jsonb_build_object('ok', true);
end $$;

-- ═══════════════ واجهة لوحة التحكم ═══════════════

/**
 * توليد دفعة أكواد جديدة.
 * الصيغة: MSRK-XXXX-XXXX بأحرف وأرقام بلا الحروف المتشابهة (O/0/I/1/L).
 * تُعاد الأكواد نصّاً — صدّرها CSV وارفعها في سلة.
 */
create or replace function public.masarak_admin_generate(
  p_key text, p_count int, p_batch text default null, p_valid_days int default 365
) returns setof text language plpgsql security definer set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- بلا O I L 0 1
  v_code text;
  i int;
  j int;
  tries int;
begin
  perform public.masarak_require_admin(p_key);
  if p_count is null or p_count < 1 or p_count > 2000 then
    raise exception 'عدد الأكواد يجب أن يكون بين ١ و٢٠٠٠';
  end if;

  for i in 1..p_count loop
    tries := 0;
    loop
      v_code := 'MSRK-';
      for j in 1..4 loop
        v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      v_code := v_code || '-';
      for j in 1..4 loop
        v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;

      exit when not exists (select 1 from public.masarak_codes where code = v_code);
      tries := tries + 1;
      if tries > 20 then raise exception 'تعذّر توليد كود فريد'; end if;
    end loop;

    insert into public.masarak_codes (code, batch, expires_at)
    values (
      v_code,
      nullif(p_batch, ''),
      case when p_valid_days is null then null else now() + (p_valid_days || ' days')::interval end
    );
    return next v_code;
  end loop;
end $$;

/** إحصاءات اللوحة. */
create or replace function public.masarak_admin_stats(p_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  perform public.masarak_require_admin(p_key);
  select jsonb_build_object(
    'total',    count(*),
    'new',      count(*) filter (where status = 'new'),
    'used',     count(*) filter (where status = 'used'),
    'revoked',  count(*) filter (where status = 'revoked'),
    'today',    count(*) filter (where activated_at >= date_trunc('day', now())),
    'week',     count(*) filter (where activated_at >= now() - interval '7 days'),
    'results',  (select count(*) from public.masarak_results)
  ) into v from public.masarak_codes;
  return v;
end $$;

/** قائمة الأكواد مع إمكانية التصفية بالدفعة أو الحالة. */
create or replace function public.masarak_admin_codes(
  p_key text, p_batch text default null, p_status text default null, p_limit int default 500
) returns setof public.masarak_codes language plpgsql security definer set search_path = public as $$
begin
  perform public.masarak_require_admin(p_key);
  return query
    select * from public.masarak_codes
     where (p_batch  is null or p_batch  = '' or batch  = p_batch)
       and (p_status is null or p_status = '' or status = p_status)
     order by created_at desc
     limit greatest(1, least(coalesce(p_limit, 500), 2000));
end $$;

/** إلغاء كود أو إعادة تفعيله. */
create or replace function public.masarak_admin_set_status(
  p_key text, p_code text, p_status text
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.masarak_require_admin(p_key);
  if p_status not in ('new', 'used', 'revoked') then
    raise exception 'حالة غير معروفة';
  end if;

  update public.masarak_codes
     set status = p_status,
         device = case when p_status = 'new' then null else device end,
         token  = case when p_status = 'new' then null else token  end,
         activated_at = case when p_status = 'new' then null else activated_at end
   where code = p_code;

  return jsonb_build_object('ok', found);
end $$;

/** أسماء الدفعات مع عدد أكواد كل دفعة. */
create or replace function public.masarak_admin_batches(p_key text)
returns table (batch text, total bigint, used bigint)
language plpgsql security definer set search_path = public as $$
begin
  perform public.masarak_require_admin(p_key);
  return query
    select coalesce(c.batch, '—') as batch,
           count(*)                              as total,
           count(*) filter (where c.status = 'used') as used
      from public.masarak_codes c
     group by 1
     order by 1;
end $$;

-- ═══════════════ الصلاحيات ═══════════════
-- الدوال فقط متاحة للمفتاح العلني — لا الجداول.

grant execute on function public.masarak_redeem(text, text)        to anon, authenticated;
grant execute on function public.masarak_verify(uuid)              to anon, authenticated;
grant execute on function public.masarak_save_result(uuid, jsonb)  to anon, authenticated;
grant execute on function public.masarak_admin_generate(text, int, text, int) to anon, authenticated;
grant execute on function public.masarak_admin_stats(text)         to anon, authenticated;
grant execute on function public.masarak_admin_codes(text, text, text, int)  to anon, authenticated;
grant execute on function public.masarak_admin_set_status(text, text, text)  to anon, authenticated;
grant execute on function public.masarak_admin_batches(text)       to anon, authenticated;

-- ============================================================
--  خطوة أخيرة يدوية — اضبط مفتاح اللوحة (غيّر النص!):
--
--    select public.masarak_set_admin_key('اكتب-مفتاحاً-طويلاً-هنا');
--
--  ثم اكتب المفتاح نفسه في لوحة التحكم: /masarak/admin/
--  لا يُخزَّن المفتاح نصّاً في القاعدة ولا يُرسل في أي استجابة.
-- ============================================================
