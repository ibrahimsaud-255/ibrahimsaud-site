-- حاوية ملفّات الشركاء (الاتفاقيات الموقّعة + ختم المؤسسة) — خاصّة، مالكٌ فقط.
-- طُبّقت على الإنتاج في ٤ أكتوبر ٢٠٢٦ (وحدة «الشركاء والعمولات» — public/app/js/20-partners.js).
insert into storage.buckets (id, name, public, file_size_limit)
values ('partner-docs','partner-docs', false, 20971520)
on conflict (id) do update set public = false;

drop policy if exists "partner-docs owner all" on storage.objects;
create policy "partner-docs owner all" on storage.objects for all to authenticated
  using (bucket_id = 'partner-docs' and (auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com')
  with check (bucket_id = 'partner-docs' and (auth.jwt() ->> 'email') = 'ibrahimsaud25@gmail.com');
