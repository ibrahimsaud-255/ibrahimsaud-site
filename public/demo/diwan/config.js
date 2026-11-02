/*
 * config.js — ملف الإعدادات المركزي
 * ══════════════════════════════════════════════════════════════════
 * عدّل هذا الملف مرة واحدة عند الإعداد — كل شيء في النظام يقرأ منه.
 * أو استخدم معالج الإعداد: افتح setup.html في المتصفح.
 *
 * ⚠️ لا تحذف أي مفتاح — فقط غيّر القيمة.
 */
const CONFIG = {

  /* ═══════ Supabase ═══════ */
  supabaseUrl: '',                          // مثال: https://xxxxxxxxxxxx.supabase.co
  supabaseKey: '',                          // المفتاح العلني (anon/publishable)

  /* ═══════ المالك / المؤسسة ═══════ */
  ownerName:    'اسمك هنا',
  ownerEmail:   'demo@ibrahimsaud.com',            // البريد المستخدم للدخول (Admin)
  ownerPhone:   '966500000000',
  companyName:  'ديوان — نسخة عرض',
  companyAddress: 'المدينة، الدولة',

  /* ═══════ الحساب البنكي ═══════ */
  bankName:     '',                          // مثال: البنك الأهلي السعودي
  bankIban:     '',                          // IBAN
  bankAccName:  '',                          // اسم صاحب الحساب
  bankLogo:     '',                          // رابط شعار البنك (اختياري)

  /* ═══════ الضريبة (VAT) ═══════ */
  vatEnabled:   false,
  vatRate:      15,
  vatNumber:    '',
  vatSellerName:'',
  vatCR:        '',

  /* ═══════ الهوية البصرية ═══════ */
  brandName:    'نظام إدارة الأعمال',       // يظهر في الشريط الجانبي
  brandLogo:    '/v2/ibrahim-saud-logo-black-tight.png',                 // رابط الشعار (PNG/SVG) — ضع ملف logo.png في نفس المجلد
  brandAccent:  '#E8C766',                   // اللون الذهبي الرئيسي
  brandAccent2: '#F0D488',                   // اللون الذهبي الثانوي
  brandTagline: 'نظام إدارة الأعمال',

  /* ═══════ العملة والمنطقة ═══════ */
  currency:     'ر.س',                       // رمز العملة
  usdRate:      3.75,                        // سعر الصرف مقابل الدولار
  prayerCity:   'الرياض',
  prayerCountry:'Saudi Arabia',
  prayerMethod: 4,                           // طريقة حساب الصلاة (4 = أم القرى)

  /* ═══════ مسار البيانات المحلي ═══════ */
  storageKey:   'minwal_erp_demo',              // مفتاح localStorage (غيّره لو عندك أكثر من نسخة)

  /* ═══════ حزمة المنظمات (Org Suite) — اختيارية ═══════
     true = فريق متعدد المستخدمين بصلاحيات حسب الأقسام + المهام بروابط Drive + مكتبة المخرجات
            + المالية (سندات صرف/قبض بدورة: طلب ← مراجعة ← اعتماد ← صرف، طباعة، تفقيط، موازنة، قائمة أنشطة)
            + إدارة محتوى موقع العميل + الوارد من نماذج الموقع. تحتاج supabase/org-suite.sql.
     مثال كامل لعميل حقيقي (جمعية): انظر نسخة «جمعية رسو» → system/config.js */
  orgSuite:     true,
  websiteUrl:   '',                        // موقع العميل (لإدارة محتواه من النظام)
  brandLogoLight: '/v2/ibrahim-saud-logo-white-tight.png',                      // شعار أبيض للشريط الجانبي (اختياري)
  brandMark:    '',                        // علامة مائية للسندات المطبوعة (اختياري)
  brandCss:     '',                        // ملف ألوان/خط العميل، مثال: ./assets/brand.css
  license:      '',                        // رقم الترخيص / السجل (يظهر في السندات)
  finance: { cashLimit: 10000, quotesLimit: 10000, boardLimit: 20000, advanceLimit: 5000, inspectLimit: 1000, depositLimit: 10000, budgetTransferPct: 25 },
  // الأقسام وتطبيقاتها والتصنيفات المالية — اتركه فارغاً للقيم العامة، أو انسخ «org» من مثال الجمعية
  org: {
    // terms: { org: 'الشركة', head: 'المدير العام', finHead: 'مدير المالية', board: 'مجلس الإدارة' },
    // depts: { exec:{name:'الإدارة العليا',short:'الإدارة',color:'#CAB05F'}, ... },
    // deptApps: { exec:[...], ... }, inboxRouting: {...}, jobTitles: [...], finance: { revenue:[...], groups:{...}, expense:[...] }, demo: {...}
    // wallImages: [{ key:'client-1', name:'صورة العميل', url:'./wallpapers/client-1.jpg' }], defaultWallpaper: 'client-1', wallOnly: true   // صور العميل كخلفيات (wallOnly: صوره فقط + ما يرفعه الموظف)
    // boardMembers: [['الاسم', 'رئيس مجلس الإدارة'], ...]   // يُعبّأ بهم حضور اجتماعات المجلس (تطبيق الحوكمة)
    // hr: { annualLeave: 21 }                               // نظام العمل السعودي: 21 يوماً و30 بعد خمس سنوات (تلقائي)
    // taskLabels: { green:{c:'#4BCE97',t:'برامج'}, ... }    // تسميات بطاقات المهام (نمط Trello)
    // demo: { ..., avatars: ['assets/avatars/1.webp', ...] } // صور حسابات الفريق في الوضع التجريبي
    // finance: { ..., history: { auditor:'', location:'', years:{ 2025:{ date, src, rev:{}, exp:{}, accruedNew, accruedPaid, prepaidChange, vatChange, eos, ppe:{}, donatedPPE, dep:{} } }, assets:{ furniture:[cost, accDep, 'YYYY-MM-DD'] } } }
    //   ← أرصدة السنوات السابقة من القوائم المراجَعة: تُدخل تلقائياً في المحاسبة (قيود مُرحّلة + إقفال) فيستلم العميل نظامه وتاريخه المالي موجود
  },

  /* ═══════ التطبيقات المفعّلة ═══════ */
  // true = يظهر في القائمة | false = مخفي
  modules: {
    dashboard:   true,
    sales:       true,
    invoicing:   true,
    quoteDesign: true,
    products:    true,
    pos:         true,
    subscriptions:true,
    accounting:  true,
    habits:      true,
    pipeline:    true,
    contacts:    true,
    suppliers:   true,
    appointments:true,
    calendar:    true,
    projects:    true,
    boards:      true,
    blog:        true,
    newsletter:  true,
    ideas:       true,
    workspace:   true,
  },

  /* ═══════ قوالب عروض الأسعار ═══════ */
  // القوالب الافتراضية — عدّلها أو أضف قوالب جديدة حسب مجالك
  quoteTemplates: [
    {
      id: 'service',
      name: 'خدمة عامة',
      depositPct: 50,
      deliveryDays: 7,
      revisions: 2,
      validityDays: 14,
      template: '📜 الشروط والأحكام:\n\n1) آلية الدفع: يُسدَّد {DEPOSIT_PCT}% ({DEPOSIT_AMOUNT}) مقدَّماً عند التعميد، والمتبقي {REMAINING} فور تسليم العمل النهائي.\n\n2) مدة التنفيذ: {DELIVERY_DAYS} أيام عمل من تاريخ استلام العربون.\n\n3) جولات التعديل: {REVISIONS} جولات مجانية — أي تعديل إضافي يُحتسب بسعر مستقل.\n\n4) الملكية الفكرية: تنتقل حقوق الاستخدام كاملةً للعميل بعد سداد كامل المبلغ.\n\n5) صلاحية العرض: {VALIDITY_DAYS} يوماً من تاريخ إصداره.'
    },
    {
      id: 'blank',
      name: 'مخصّص (بدون قالب)',
      depositPct: 50,
      deliveryDays: 0,
      revisions: 0,
      validityDays: 14,
      template: ''
    }
  ],

  /* ═══════ المنتجات الافتراضية ═══════ */
  // تُحمَّل أول مرة فقط — بعدها تُدار من داخل النظام
  defaultProducts: [
    { id: 'p_1', name: 'خدمة أساسية', price: 500, unit: 'خدمة', desc: '' },
    { id: 'p_2', name: 'استشارة', price: 200, unit: 'ساعة', desc: '' },
  ],

  /* ═══════ ملفات هوية الطباعة ═══════ */
  brandProfiles: [
    {
      id: 'default',
      name: 'الهوية الأساسية',
      tagline: '',
      logo: '',
      accent: '#E8C766',
      accent2: '#F0D488',
      ink: '#0a0a0b',
      pattern: 'glow',
      coverStyle: 'classic',
      showPattern: true,
      showQR: true,
      titleSize: 82,
      org: {}
    }
  ],
};
