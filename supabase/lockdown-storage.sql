-- قفل كتابة دلاء التخزين على بريد المالك (تكملة هجرة lockdown_owner_only_policies)
-- التطبيق: Supabase Dashboard → SQL Editor → الصق وشغّل مرّة واحدة.
-- القراءة العامّة لصور المدوّنة تبقى؛ الكتابة كلّها للمالك فقط.

DROP POLICY IF EXISTS "blog_images_write" ON storage.objects;
CREATE POLICY "blog_images_write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'blog-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com')
  WITH CHECK (bucket_id = 'blog-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');

DROP POLICY IF EXISTS "task-images insert" ON storage.objects;
CREATE POLICY "task-images insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "task-images update" ON storage.objects;
CREATE POLICY "task-images update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'task-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "task-images delete" ON storage.objects;
CREATE POLICY "task-images delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');

DROP POLICY IF EXISTS "product-images insert" ON storage.objects;
CREATE POLICY "product-images insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "product-images update" ON storage.objects;
CREATE POLICY "product-images update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "product-images delete" ON storage.objects;
CREATE POLICY "product-images delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');

DROP POLICY IF EXISTS "supplier-files insert" ON storage.objects;
CREATE POLICY "supplier-files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-files' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "supplier-files update" ON storage.objects;
CREATE POLICY "supplier-files update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'supplier-files' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
DROP POLICY IF EXISTS "supplier-files delete" ON storage.objects;
CREATE POLICY "supplier-files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-files' AND (auth.jwt()->>'email') = 'ibrahimsaud25@gmail.com');
