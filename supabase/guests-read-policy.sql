-- تمكين المالك (الحساب المسجَّل دخوله) من قراءة تسجيلات الضيوف داخل النظام
-- شغّل هذا مرة واحدة في Supabase ▸ SQL Editor إن ظهرت رسالة "تعذّر قراءة تسجيلات الضيوف".
-- النموذج العام (الاستبيان) يُدخل بصلاحية anon؛ هذه السياسة تضيف صلاحية القراءة لـ authenticated فقط.

alter table public.guest_registrations enable row level security;

drop policy if exists "owner reads guests" on public.guest_registrations;
create policy "owner reads guests"
  on public.guest_registrations
  for select
  to authenticated
  using (true);
