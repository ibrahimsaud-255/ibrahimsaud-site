# النشر التلقائي — دليل التفعيل (المرحلة ١)

**الفكرة:** تلصق رابط مقطع تيك توك في صفحة «النشر التلقائي» بالنظام → GitHub Actions (مجاني) ينزّل المقطع ويرفعه **يوتيوب شورتس** تلقائياً كل ٣٠ دقيقة، ويحدّث الحالة أمامك.

**التكلفة: صفر ريال** — لا سيرفر ولا اشتراك repurpose.io.

---

## الخطوة ١ — قاعدة البيانات (مرة واحدة)

Supabase ← SQL Editor ← New query ← شغّل ملف `supabase/publish_queue.sql`.

## الخطوة ٢ — مفاتيح يوتيوب (مرة واحدة، ~10 دقائق)

1. افتح [Google Cloud Console](https://console.cloud.google.com) ← أنشئ مشروعاً (أو استخدم مشروعك الحالي).
2. **APIs & Services ← Library** ← ابحث «YouTube Data API v3» ← **Enable**.
3. **APIs & Services ← OAuth consent screen**:
   - النوع: External ← عبّئ الاسم والإيميل ← احفظ.
   - **Audience ← Test users** ← أضف إيميل قناتك (ibrahimsaud25@gmail.com).
4. **APIs & Services ← Credentials ← Create Credentials ← OAuth client ID**:
   - النوع: **Desktop app** ← أنشئ.
   - انسخ **Client ID** و **Client Secret**.
5. على جهازك، في مجلد المشروع:
   ```bash
   python3 scripts/yt_get_token.py "CLIENT_ID" "CLIENT_SECRET"
   ```
   يفتح المتصفح ← سجّل دخول حساب قناتك ← اسمح ← يطبع لك `YT_REFRESH_TOKEN`.

## الخطوة ٣ — أسرار GitHub (مرة واحدة)

افتح [إعدادات الأسرار في المستودع](https://github.com/ibrahimsaud-255/ibrahimsaud-site/settings/secrets/actions) ← **New repository secret** وأضف الخمسة:

| الاسم | القيمة |
|---|---|
| `SUPABASE_URL` | `https://rrerwhhxrjyzmnnjsfev.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | من Supabase ← Project Settings ← API keys ← service_role |
| `YT_CLIENT_ID` | من الخطوة ٢ |
| `YT_CLIENT_SECRET` | من الخطوة ٢ |
| `YT_REFRESH_TOKEN` | من الخطوة ٢ |

## الخطوة ٤ — جرّب

1. افتح النظام ← **النشر التلقائي** ← الصق رابط مقطع تيك توك + العنوان ← «أضف للطابور».
2. GitHub ← تبويب **Actions** ← «Auto Publish» ← **Run workflow** (أو انتظر حتى ٣٠ دقيقة).
3. الحالة تتحدث في النظام: `pending ← processing ← done` مع رابط الشورت الناتج.

---

## ملاحظات مهمة

- **العلامة المائية:** المقطع المنزّل من تيك توك يحمل علامة تيك توك المائية غالباً، ويوتيوب قد يقلّل وصول الشورتس ذات العلامة. **الأفضل مستقبلاً:** نرفع الملف الأصلي (بدون علامة) في النظام مباشرة — هذه المرحلة ٢.
- **حصة يوتيوب اليومية:** رفع الفيديو يستهلك 1600 وحدة من حصة 10,000 — يعني حتى ~6 مقاطع يومياً، وهذا يكفيك.
- **تطبيق «Testing»:** ما دام تطبيق Google في وضع الاختبار، الـ refresh token قد ينتهي كل ٧ أيام. الحل: من OAuth consent screen اضغط **Publish app** (لا يحتاج مراجعة لأن الاستخدام شخصي).

## المراحل القادمة (لما تكون جاهز)

- **المرحلة ٢:** رفع الملف الأصلي من النظام (بدون علامة مائية) إلى Supabase Storage ثم النشر منه.
- **المرحلة ٣:** لينكدإن (API رسمي متاح)، إنستقرام ريلز (يتطلب حساب Business + Graph API).
- سناب شات وX: لا توفر API نشر عام حالياً — تبقى يدوية.
