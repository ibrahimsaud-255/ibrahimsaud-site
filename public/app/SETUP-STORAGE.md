# إعداد تخزين الملفات والصور (مرة واحدة)

النظام يرفع الملفات إلى **Supabase Storage**. فيه ٣ حاويات (buckets) عامة، كل وحدة تُنشأ مرة وحدة.

| الحاوية (Bucket) | تُستخدم في |
|---|---|
| `task-images` | صور محرّر المهام |
| `product-images` | صور منتجات الكاشير/الكتالوج |
| `supplier-files` | ملفات الموردين (PDF/Excel) |

## ١) أنشئ الحاويات

Supabase Dashboard → **Storage** → **New bucket** — كرّرها لكل اسم:
- الاسم بالضبط: `task-images` ثم `product-images` ثم `supplier-files`
- **Public bucket: مفعّل** (عشان تفتح الملفات/الصور بالرابط مباشرة)
- **Create bucket**

## ٢) أضف صلاحيات الرفع

Supabase Dashboard → **SQL Editor** → الصق ونفّذ:

```sql
-- السماح للمستخدم المسجّل بالرفع/التعديل/الحذف في الحاويات الثلاث
-- (القراءة عامة تلقائياً لأن الحاويات عامة)
do $$
declare b text;
begin
  foreach b in array array['task-images','product-images','supplier-files'] loop
    execute format($f$create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L)$f$, b||' insert', b);
    execute format($f$create policy %I on storage.objects for update to authenticated using (bucket_id = %L)$f$, b||' update', b);
    execute format($f$create policy %I on storage.objects for delete to authenticated using (bucket_id = %L)$f$, b||' delete', b);
  end loop;
end $$;
```

> لو نفّذت السياسات من قبل لـ `task-images` وطلع خطأ «policy already exists»، احذف اسم `task-images` من المصفوفة ونفّذ الباقي.

## خلاص

- **المنتجات/الكاشير:** عند إضافة منتج → «صورة المنتج» → ارفع الصورة.
- **الموردون:** افتح مورّد → «+ ملف» → ارفع الملف (أو الصق رابط Google Drive بدل الرفع).
- لو ظهر خطأ رفع، معناه الحاوية مو منشأة أو الاسم مختلف.
