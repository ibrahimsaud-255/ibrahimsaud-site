-- ═══════════════════════════════════════════════════════════════════════════
-- رسائل برنامج الشركاء الآليّة — [2026-10-22]
-- يُطبَّق بعد partner-program.sql. المشغّلات تنادي الدالّة partner-notify عبر pg_net،
-- والجدولة اليوميّة (9 ص الرياض) تُرسل التذكيرات. السرّ يُولَّد هنا ويُحفظ في
-- pp_settings.notify (مالكٍ فقط)، والدالّة تطابقه بدور الخدمة — لا شيء يُضبط يدويّاً.
-- طُبّق على الإنتاج في ٢٢ أكتوبر ٢٠٢٦ (هجرة partner_program_notify)، والدالّة منشورة (النسخة 2).
-- إيقاف كلّ الرسائل: delete from pp_settings where key='notify';
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.pp_partners add column if not exists notified jsonb not null default '{}'::jsonb;
alter table public.pp_leads    add column if not exists notified jsonb not null default '{}'::jsonb;

insert into public.pp_settings(key, value)
values ('notify', jsonb_build_object(
  'url', 'https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/partner-notify',
  'secret', encode(extensions.gen_random_bytes(24), 'hex')))
on conflict (key) do nothing;

create or replace function public.pp_notify(p_event text, p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare cfg jsonb := public.pp_setting('notify');
begin
  if cfg is null or coalesce(cfg->>'url','') = '' then return; end if;
  perform net.http_post(
    url := cfg->>'url',
    headers := jsonb_build_object('Content-Type','application/json','x-pp-secret', cfg->>'secret'),
    body := jsonb_build_object('event', p_event, 'id', p_id),
    timeout_milliseconds := 20000);
exception when others then
  raise warning 'pp_notify %: %', p_event, sqlerrm;   -- الرسائل لا تُفشل التسجيل أبداً
end $$;
revoke all on function public.pp_notify(text, uuid) from public, anon, authenticated;

create or replace function public.pp_partner_notify_trg() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform public.pp_notify('partner_new', new.id);
  elsif new.status = 'active' and old.status is distinct from 'active' then perform public.pp_notify('partner_active', new.id);
  end if;
  return new;
end $$;
drop trigger if exists pp_partner_notify on public.pp_partners;
create trigger pp_partner_notify after insert or update of status on public.pp_partners
  for each row execute function public.pp_partner_notify_trg();

create or replace function public.pp_lead_notify_trg() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform public.pp_notify('lead_new', new.id); return new; end $$;
drop trigger if exists pp_lead_notify on public.pp_leads;
create trigger pp_lead_notify after insert on public.pp_leads
  for each row execute function public.pp_lead_notify_trg();

select cron.unschedule('pp-daily') where exists (select 1 from cron.job where jobname = 'pp-daily');
select cron.schedule('pp-daily', '0 6 * * *', $$ select public.pp_notify('daily', null) $$);
