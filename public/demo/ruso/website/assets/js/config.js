/*
 * إعدادات الموقع — عدّل هذا الملف فقط عند الربط بقاعدة البيانات.
 * المفتاح هنا هو المفتاح العلني (anon / publishable) — آمن في المتصفح،
 * والحماية الحقيقية في سياسات RLS داخل supabase/schema.sql.
 * إذا تُرك فارغاً يعمل الموقع بالمحتوى الافتراضي (content.js) والنماذج لا ترسل.
 */
window.RUSO_CONFIG = {
  supabaseUrl: '',   // مثال: https://xxxxxxxx.supabase.co
  supabaseKey: '',   // anon / publishable key
  systemUrl: '../system/index.html'
};
