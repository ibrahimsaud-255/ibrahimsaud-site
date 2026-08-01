-- ============================================================
--  تهيئة قاعدة Supabase لتشغيل نظام إبراهيم سعود (محرّك أودو)
--  Supabase ← SQL Editor ← New query
--
--  ⚠️ شغّل كل دفعة وحدها (الصق الدفعة ← Run ← ثم التالية)
--     لأن Supabase يقطع الاتصال في بعض عمليات الأدوار،
--     وتشغيلها منفصلة يضمن حفظ ما نجح.
-- ============================================================


-- ══════════ الدفعة ١: مستخدم النظام ══════════
-- ⚠️ غيّر كلمة المرور قبل التشغيل، واحفظها — تحتاجها على الخادم

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'odoo_app') THEN
        CREATE ROLE odoo_app LOGIN PASSWORD 'ضع_كلمة_مرور_قوية_هنا';
    END IF;
END
$$;


-- ══════════ الدفعة ٢: المخطّط المعزول ══════════
-- المخطّط يملكه postgres (Supabase يمنع نقل الملكية)، ومستخدم النظام
-- يملك صلاحية الإنشاء داخله — وهذا كل ما يحتاجه.
-- الجداول التي ينشئها النظام تصير مملوكة له تلقائياً.

CREATE SCHEMA IF NOT EXISTS odoo;
GRANT USAGE, CREATE ON SCHEMA odoo TO odoo_app;


-- ══════════ الدفعة ٣: الحجب الأمني ══════════
-- بيانات النظام (المستخدمون، الفواتير، العملاء) محجوبة عن مفتاح anon
-- المنشور في كود موقعك، وعن أي دور عام.

REVOKE ALL ON SCHEMA odoo FROM PUBLIC;

DO $$
DECLARE
    r text;
BEGIN
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated']
    LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
            EXECUTE format('REVOKE ALL ON SCHEMA odoo FROM %I', r);
            RAISE NOTICE 'حُجب مخطّط odoo عن الدور %', r;
        END IF;
    END LOOP;
END
$$;


-- ══════════ الدفعة ٤: حماية بيانات موقعك ══════════
-- مستخدم النظام يقرأ public للحاجة التقنية فقط، وممنوع من الكتابة فيه
-- فلا يقدر يمسّ جداول موقعك ونظامك الحالي.

GRANT USAGE ON SCHEMA public TO odoo_app;
REVOKE CREATE ON SCHEMA public FROM odoo_app;


-- ══════════ الدفعة ٥: التحقق ══════════
-- المتوقّع: صفٌّ للمخطّط odoo، وصلاحية CREATE = true لمستخدم النظام

SELECT
    n.nspname                                   AS "المخطّط",
    pg_get_userbyid(n.nspowner)                 AS "المالك",
    has_schema_privilege('odoo_app', n.nspname, 'CREATE') AS "النظام يقدر ينشئ",
    has_schema_privilege('anon', n.nspname, 'USAGE')      AS "anon يشوفه ⚠️"
FROM pg_namespace n
WHERE n.nspname IN ('odoo', 'public');


-- ============================================================
--  ملاحظة: توجيه النظام للكتابة داخل مخطّط odoo يتم من جهة الخادم
--  عبر PGOPTIONS في ملف الخدمة (لا يحتاج أي صلاحية هنا).
--  هذا مضبوط تلقائياً في oracle-setup.sh
-- ============================================================
