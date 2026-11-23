-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  المتجر الرقميّ — ibrahimsaud.com/shop/                                ║
-- ║  منتجات رقميّة فقط (ملفّات، حزم، دورات) — بلا شحن.                     ║
-- ║  يُلصق في SQL Editor (لم يُطبَّق على الإنتاج بعد).                      ║
-- ║                                                                        ║
-- ║  shop_products  : الكتالوج + السعر الحقيقيّ (مصدر الحقيقة لما يُخصم).   ║
-- ║                   قراءة علنيّة للنشط فقط، والكتابة للمالك.              ║
-- ║  shop_orders    : الطلبات — لا وصول علنيّ أبداً؛ الدالّة الحافّة «shop»  ║
-- ║                   تكتب بمفتاح الخدمة، والمالك يقرأ من اللوحة.          ║
-- ║  shop_downloads : سجلّ كلّ تنزيل (من، متى، أيّ ملفّ).                   ║
-- ║  shop-files     : حاوية تخزين **خاصّة** — الملفّات لا تُفتح إلا بروابط   ║
-- ║                   موقّعة مدّتها ٦٠ ثانية تصدرها الدالّة بعد التحقّق.   ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ── الكتالوج ─────────────────────────────────────────────────────────────
create table if not exists public.shop_products (
  sku            text primary key,
  slug           text unique not null,          -- يطابق مفتاح المنتج في src/lib/shop.ts
  title          text not null,
  price_sar      numeric(10,2) not null check (price_sar > 0),
  active         boolean not null default false,
  -- [{ "id":"win", "name":"… — ويندوز", "path":"lessons-broadcast/BathAlDurus-Setup.exe", "size_bytes":123 }]
  -- path داخل الحاوية الخاصّة shop-files؛ لا يُرسَل للمتصفّح أبداً.
  files          jsonb not null default '[]'::jsonb,
  max_downloads  int not null default 10 check (max_downloads > 0),   -- لكلّ ملفّ في الطلب الواحد
  sort           int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── الطلبات ──────────────────────────────────────────────────────────────
create table if not exists public.shop_orders (
  id                 uuid primary key default gen_random_uuid(),
  sku                text not null references public.shop_products(sku),
  title              text not null,                 -- لقطة من اسم المنتج وقت الشراء
  amount             numeric(10,2) not null,        -- المبلغ المطلوب من تلر (من shop_products وقتها)
  buyer_name         text not null,
  buyer_email        text not null,
  buyer_phone        text,
  status             text not null default 'pending'
                     check (status in ('pending','paid','failed','cancelled')),
  telr_cart          text unique not null,
  telr_order_ref     text,                          -- مفتاح واجهة الفحص (order_ref) — لا ivp_cart
  telr_tran_ref      text,
  paid_amount        numeric(10,2),
  access_token_hash  text not null,                 -- sha256 للرمز الذي في رابط صفحة الشكر (العائد من تلر)
  email_token_hash   text,                          -- sha256 لرمز ثانٍ مستقلّ في إيميل «طلبك جاهز»
  trusted_devices    jsonb not null default '[]'::jsonb,   -- sha256 لمعرّفات الأجهزة (٣ كحدّ أقصى)
  otp_hash           text,
  otp_expires        timestamptz,
  otp_attempts       int not null default 0,
  otp_sent_at        timestamptz,
  email_sent_at      timestamptz,                   -- إيميل «طلبك جاهز» (يمنع التكرار)
  check_count        int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  paid_at            timestamptz
);
create index if not exists shop_orders_status_idx on public.shop_orders (status, created_at desc);
create index if not exists shop_orders_email_idx  on public.shop_orders (lower(buyer_email));

-- ── سجلّ التنزيلات ───────────────────────────────────────────────────────
create table if not exists public.shop_downloads (
  id        bigint generated always as identity primary key,
  order_id  uuid not null references public.shop_orders(id) on delete cascade,
  file_id   text not null,
  at        timestamptz not null default now(),
  ip        text,
  ua        text
);
create index if not exists shop_downloads_order_idx on public.shop_downloads (order_id, file_id);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.shop_products  enable row level security;
alter table public.shop_orders    enable row level security;
alter table public.shop_downloads enable row level security;

-- الكتالوج: قراءة علنيّة للنشط فقط (الموقع يقرأ السعر الحيّ منه).
drop policy if exists shop_products_public_read on public.shop_products;
create policy shop_products_public_read on public.shop_products for select to anon, authenticated
  using (active);

-- المالك: كلّ شيء على الجداول الثلاثة (نمط هجرة lockdown_owner_only_policies).
do $$ declare t text; begin
  foreach t in array array['shop_products','shop_orders','shop_downloads'] loop
    execute format('drop policy if exists %I on public.%I', t||'_owner', t);
    execute format($p$create policy %I on public.%I for all to authenticated
      using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')
      with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')$p$, t||'_owner', t);
  end loop;
end $$;
-- لا سياسة لـ anon على الطلبات والتنزيلات = لا وصول. الدالّة الحافّة تعمل بمفتاح الخدمة.

-- الزائر يقرأ أعمدة العرض فقط — عمود files (مسارات الحاوية الخاصّة) لا يصله.
-- (الموقع يطلب select=sku,price_sar,active؛ و select=* من زائر يُرفض.)
revoke select on public.shop_products from anon;
grant select (sku, slug, title, price_sar, active, sort) on public.shop_products to anon;

-- ── حاوية الملفّات الخاصّة ───────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('shop-files', 'shop-files', false)
on conflict (id) do update set public = false;

drop policy if exists "shop-files owner" on storage.objects;
create policy "shop-files owner" on storage.objects for all to authenticated
  using (bucket_id = 'shop-files' and (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com')
  with check (bucket_id = 'shop-files' and (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
-- لا قراءة علنيّة: التنزيل فقط بروابط موقّعة (٦٠ ثانية) من الدالّة «shop».

-- ── المنتجات الأولى ──────────────────────────────────────────────────────
-- ⚠️ الأسعار هنا **مبدئيّة** (placeholder) — راجعها قبل التفعيل. السعر في هذا الجدول
-- هو ما يُخصم فعلاً، والصفحة تقرؤه حيّاً فيظهر للعميل نفسه.
insert into public.shop_products (sku, slug, title, price_sar, active, files, max_downloads, sort) values
  ('lessons-broadcast', 'lessons-broadcast', 'برنامج بث الدروس العلمية', 399, true,
   -- الملفّان مستضافان على سيرفر حروف (url) لأنّ حجمهما فوق حدّ Supabase المجّانيّ (٥٠ ميغا)
   '[{"id":"win","name":"برنامج بث الدروس العلمية — ويندوز","url":"__WIN_URL__","size_bytes":265373906},
     {"id":"mac","name":"برنامج بث الدروس العلمية — ماك","url":"__MAC_URL__","size_bytes":215240980}]'::jsonb,
   20, 1),
  ('ai-idea-to-launch', 'ai-idea-to-launch', 'من الفكرة للنشر بالذكاء الاصطناعي — دفعة التأسيس', 399, false,
   '[]'::jsonb, 10, 2)
on conflict (sku) do nothing;

-- ── «حسابي» (٢٠٢٦-١١-٢٣): رموز الدخول بالبريد — الدالّة shop وحدها (RLS بلا سياسات) ──
create table if not exists public.shop_logins (
  email text primary key,
  otp_hash text,
  otp_expires timestamptz,
  otp_attempts int not null default 0,
  otp_sent_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.shop_logins enable row level security;
revoke all on public.shop_logins from anon, authenticated;

-- رقم الإصدار و«وش الجديد» (٢٠٢٦-١١-٢٣) — يظهران في «حسابي» ويُعدّلان من لوحة المتجر
alter table public.shop_products add column if not exists version text;
alter table public.shop_products add column if not exists changelog text;

-- زيارات الموقع (٢٠٢٦-١١-٢٣): بلا IP — الكتابة عبر track_view فقط، والقراءة للمالك
create table if not exists public.site_views (id bigserial primary key, at timestamptz not null default now(), path text not null, ref text, utm text, vid text);
create index if not exists site_views_at on public.site_views (at desc);
create index if not exists site_views_path on public.site_views (path, at desc);
alter table public.site_views enable row level security;
revoke all on public.site_views from anon, authenticated;
grant select on public.site_views to authenticated;
drop policy if exists site_views_owner_read on public.site_views;
create policy site_views_owner_read on public.site_views for select to authenticated using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com');
create or replace function public.track_view(p_path text, p_ref text default null, p_utm text default null, p_vid text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_path is null or length(p_path) > 200 or p_path !~ '^/' then return; end if;
  insert into public.site_views(path, ref, utm, vid) values (p_path, nullif(left(coalesce(p_ref,''),120),''), nullif(left(coalesce(p_utm,''),60),''), nullif(left(coalesce(p_vid,''),40),''));
end $$;
revoke all on function public.track_view(text,text,text,text) from public;
grant execute on function public.track_view(text,text,text,text) to anon, authenticated;
-- رقم واتساب اختياريّ لمن يأخذ الهديّة المجّانيّة
alter table public.subscribers add column if not exists phone text;

-- أكواد App Store الترويجيّة لتطبيق الآيفون (٢٠٢٦-١١-٢٣) — هديّة فقط (شروط آبل)، للمالك فقط
create table if not exists public.ios_promo_codes (code text primary key, app text not null default 'lessons-broadcast', version text,
  created_at timestamptz not null default now(), expires_at timestamptz not null, given_to text, given_email text, given_at timestamptz, note text);
alter table public.ios_promo_codes enable row level security;
revoke all on public.ios_promo_codes from anon;
drop policy if exists ios_promo_codes_owner on public.ios_promo_codes;
create policy ios_promo_codes_owner on public.ios_promo_codes for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com') with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com');
grant select, insert, update, delete on public.ios_promo_codes to authenticated;

-- تذكير السلّة المتروكة (٢٠٢٦-١١-٢٣) — مطفأ افتراضاً؛ يُشغَّل من لوحة المتجر. الدالّة shop-remind والمهمّة shop-remind-hourly:
--   select cron.schedule('shop-remind-hourly','17 * * * *',$$ select net.http_post(url:='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop-remind', headers:='{"Content-Type":"application/json"}'::jsonb, body:='{}'::jsonb); $$);
create table if not exists public.shop_settings (key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
alter table public.shop_settings enable row level security;
revoke all on public.shop_settings from anon;
drop policy if exists shop_settings_owner on public.shop_settings;
create policy shop_settings_owner on public.shop_settings for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com') with check ((auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com');
grant select, insert, update on public.shop_settings to authenticated;
insert into public.shop_settings(key, value) values ('cart_reminders', '{"enabled": false, "first_hours": 3, "second_days": 3, "enabled_at": null}') on conflict (key) do nothing;
alter table public.shop_orders add column if not exists remind1_at timestamptz;
alter table public.shop_orders add column if not exists remind2_at timestamptz;
