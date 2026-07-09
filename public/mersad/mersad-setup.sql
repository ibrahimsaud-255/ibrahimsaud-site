-- ═══════════════════════════════════════════════════════════════
--  إعداد مرصاد على Supabase — شغّله مرة واحدة
--  Supabase Dashboard → SQL Editor → الصق هذا الملف → Run
-- ═══════════════════════════════════════════════════════════════

-- جدول واحد يخزّن كل مستندات مرصاد (مشاريع، مجلدات، مشاركات، محادثات)
create table if not exists public.mersad_docs (
  path       text primary key,                       -- المسار الكامل للمستند، مثل users/<uid>/projects/<id>
  parent     text not null,                          -- مسار المجموعة الأم (للاستعلام)
  data       jsonb not null default '{}'::jsonb,     -- محتوى المستند
  updated_at timestamptz not null default now()
);

create index if not exists mersad_docs_parent_idx on public.mersad_docs (parent);

alter table public.mersad_docs enable row level security;

-- المستخدم المسجّل (أنت): صلاحية كاملة
drop policy if exists "mersad auth all" on public.mersad_docs;
create policy "mersad auth all" on public.mersad_docs
  for all to authenticated using (true) with check (true);

-- الزوّار (روابط المشاركة مع العملاء): قراءة المشاركات فقط
drop policy if exists "mersad anon read shares" on public.mersad_docs;
create policy "mersad anon read shares" on public.mersad_docs
  for select to anon
  using (
    path like 'sharedProjects/%'   or
    path like 'sharedFolderLinks/%' or
    path like 'projectChats/%'      or
    path like 'folderShares/%'
  );

-- الزوّار: تعديل روابط المشاركة القابلة للتحرير + كتابة رسائل المحادثة
drop policy if exists "mersad anon insert shares" on public.mersad_docs;
create policy "mersad anon insert shares" on public.mersad_docs
  for insert to anon
  with check (path like 'sharedProjects/%' or path like 'projectChats/%');

drop policy if exists "mersad anon update shares" on public.mersad_docs;
create policy "mersad anon update shares" on public.mersad_docs
  for update to anon
  using (path like 'sharedProjects/%' or path like 'projectChats/%')
  with check (path like 'sharedProjects/%' or path like 'projectChats/%');
