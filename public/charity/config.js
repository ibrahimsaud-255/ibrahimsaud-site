/*
 * config.js — «نظام الجمعيات» (نسخة الاشتراك العامّة)
 * ══════════════════════════════════════════════════════════════════
 * نسخة واحدة تخدم كلّ الجمعيّات المشتركة: كلّ جمعيّة صفّ في جدول orgs، وبياناتها
 * معزولة بـRLS (supabase/charity/schema.sql). بيانات الجمعيّة نفسها (الاسم، الترخيص،
 * البنك…) لا تُكتب هنا — تعبّيها الجمعيّة من «بيانات الجمعيّة» وتُحمَّل بعد الدخول
 * وتُدمج فوق هذا الملفّ (orgApplyProfile في 20-org-core.js).
 *
 * طبقة البيانات كلّها في RDB + loadCloud/saveCloud — لو تغيّر مزوّد القاعدة لاحقاً
 * يتغيّر هذان الموضعان فقط.
 *
 * supabaseUrl فارغ أو ?demo=1 ← وضع تجريبيّ ببيانات محلّيّة في المتصفّح فقط.
 */
const CONFIG = {

  /* ═══════ Neon (مشروع old-hill-68244483 — services/charity) ═══════
     عناوين عامّة (لا أسرار): الدخول، واجهة البيانات (RLS)، الدالّة api، وحاوية الصور.
     الموقع المنشور ← فرع production؛ التشغيل المحلّيّ (localhost) ← فرع staging. */
  neonBranches: {
    production: { authUrl: 'https://ep-patient-queen-batp51vm.neonauth.c-8.eu-central-1.aws.neon.tech/neondb/auth', dataApiUrl: 'https://ep-patient-queen-batp51vm.apirest.c-8.eu-central-1.aws.neon.tech/neondb/rest/v1', apiUrl: 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech', mediaUrl: 'https://br-dark-band-bajth6rv.storage.c-8.eu-central-1.aws.neon.tech/media' },
    staging:    { authUrl: 'https://ep-wandering-moon-baiqtdb5.neonauth.c-8.eu-central-1.aws.neon.tech/neondb/auth', dataApiUrl: 'https://ep-wandering-moon-baiqtdb5.apirest.c-8.eu-central-1.aws.neon.tech/neondb/rest/v1', apiUrl: 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech', mediaUrl: 'https://br-red-smoke-baq7yp0d.storage.c-8.eu-central-1.aws.neon.tech/media' },
  },
  supabaseUrl: 'neon',   // غير فارغ = وضع حقيقيّ (فارغ = النسخة التجريبيّة المحلّيّة)
  supabaseKey: 'neon',
  websiteUrl:  '',
  /* «موقع الجمعيّة»: هدف سجلّ CNAME لنطاقات الجمعيّات الخاصّة — فارغ = ربط النطاقات لم يُفعَّل بعد (يُحفظ النطاق ويُفعَّل لاحقاً) */
  siteDomainTarget: '',

  /* ═══════ الاشتراك ═══════ */
  /* الباقات بعدد المشاركين (docs/نظام-الجمعيات/دراسة-التسعير.md) — للعرض فقط؛ السعر الذي يُدفع فعلاً
     في shop_products (أصناف charity-year…) والحدّ تتحقّق منه الدالّة api (PLANS). غيّرها معاً.
     founder = سعر المؤسّسين لأوّل ٢٠ جمعيّة، ويبقى لها ما دامت تجدّد. cap 0 = بلا حدّ. */
  plan: { price: 1490, currency: 'ر.س', period: 'سنة', trialDays: 14, payFn: 'charity-pay', founderSeats: 20,
    tiers: [
      { id: '150', name: '١٥٠ مشاركاً', cap: 150, price: 1490, founder: 990 },
      { id: '400', name: '٤٠٠ مشارك',  cap: 400, price: 2490, founder: 1690 },
      { id: 'max', name: 'بلا حدّ',     cap: 0,   price: 3990, founder: 2690 },
    ] },
  salesUrl: '/systems/charities/',

  /* ═══════ الجمعية — قيم افتراضيّة تُستبدل ببيانات الجمعيّة بعد الدخول ═══════ */
  ownerName:    'المدير التنفيذي',
  ownerEmail:   '',
  ownerPhone:   '',
  companyName:  'جمعيّتك',
  companyAddress: '',
  license:      '',

  bankName:     '',
  bankIban:     '',
  bankAccName:  '',
  bankLogo:     '',

  vatEnabled:   false,
  vatRate:      15,
  vatNumber:    '',
  vatSellerName:'',
  vatCR:        '',

  /* ═══════ الهوية البصرية ═══════ */
  brandName:    'نظام الجمعيات الشبابية',
  brandLogo:    './assets/logo-black.png?v=2',      // المطبوعات — يُستبدل بشعار الجمعيّة إن وضعته
  brandLogoLight: './assets/logo-blue.png?v=2',     // الشريط الجانبيّ — شعار المنتج دائماً
  brandMark:    '',
  printFontFamily: 'F',
  printFonts:   '@font-face{font-family:F;src:url(/fonts/thmanyah/thmanyahsans-Regular.woff2)}@font-face{font-family:F;src:url(/fonts/thmanyah/thmanyahsans-Bold.woff2);font-weight:700}',
  brandAccent:  '#1003BD',
  brandAccent2: '#4A3FE0',
  brandTagline: 'نظام الجمعيات الشبابية',

  currency:     'ر.س',
  usdRate:      3.75,
  prayerCity:   'Riyadh',
  prayerCountry:'Saudi Arabia',
  prayerMethod: 4,

  storageKey:   'charity_nizam',

  /* ═══════ حدود اللوائح المالية (افتراضيّة شائعة — الجمعيّة تغيّرها من بيانات الجمعيّة) ═══════ */
  finance: {
    cashLimit:      10000,
    quotesLimit:    10000,
    boardLimit:     20000,
    advanceLimit:   5000,
    inspectLimit:   1000,
    depositLimit:   10000,
    budgetTransferPct: 25,
  },

  /* ═══════ الهيكل التنظيمي — هيكل عامّ يناسب أغلب الجمعيّات الأهليّة ═══════ */
  org: {
    terms: { org: 'الجمعية', head: 'المدير التنفيذي', finHead: 'المدير المالي والإداري', board: 'مجلس الإدارة' },
    roles: { admin: 'المدير التنفيذي', manager: 'مدير إدارة / رئيس وحدة', staff: 'موظف' },
    depts: {
      exec:         { name: 'الإدارة التنفيذية', short: 'التنفيذية', color: '#1003BD', units: ['المدير التنفيذي', 'السكرتارية'] },
      programs:     { name: 'إدارة البرامج والمشاريع', short: 'البرامج', color: '#34C759', units: [] },
      comms:        { name: 'تنمية الموارد والاتصال', short: 'الموارد والاتصال', color: '#FF9500', units: [] },
      admin_fin:    { name: 'الشؤون الإدارية والمالية', short: 'الإدارية والمالية', color: '#AF52DE', units: ['المحاسبة', 'الموارد البشرية'] },
      volunteering: { name: 'وحدة التطوع', short: 'التطوع', color: '#30B0C7', units: [] },
    },
    deptApps: {
      exec:         ['site', 'inbox', 'tasks', 'library', 'finance', 'donors', 'team', 'programs', 'reports', 'newsletter', 'beneficiaries', 'volunteers', 'hr', 'procurement', 'governance', 'grants', 'mail'],
      programs:     ['programs', 'inbox', 'tasks', 'library', 'beneficiaries'],
      comms:        ['site', 'inbox', 'programs', 'donors', 'tasks', 'library', 'newsletter', 'grants', 'mail'],
      admin_fin:    ['finance', 'donors', 'reports', 'tasks', 'library', 'hr', 'procurement', 'mail'],
      volunteering: ['inbox', 'tasks', 'library', 'volunteers'],
    },
    inboxRouting: { registration: ['programs'], volunteer: ['volunteering'], job: ['admin_fin'], partnership: ['comms'], support: ['comms'], contact: ['comms'] },
    boardMembers: [],
    hr: { annualLeave: 21 },
    appLabels: { programs: 'البرامج (في الموقع)', donors: 'الداعمون والمانحون' },
    wallImages: [],          // خلفيّات النظام الجاهزة (WALL_IMAGES في 04-home.js) — نفس خلفيّات نظام إبراهيم
    wallOnly: false,
    defaultWallpaper: 'tahoe-blue',
    jobTitles: ['المدير التنفيذي', 'سكرتير', 'مدير البرامج والمشاريع', 'منسق برامج', 'أخصائي اجتماعي', 'مدير تنمية الموارد', 'أخصائي اتصال وشراكات', 'أخصائي إعلام', 'المدير المالي والإداري', 'محاسب', 'أمين الصندوق', 'أخصائي موارد بشرية', 'منسق التطوع', 'متطوع'],
    /* التصنيفات المالية — بنود قائمة الأنشطة الشائعة للمنشآت غير الهادفة للربح */
    finance: {
      revenue: [
        { key: 'membership', name: 'اشتراكات الأعضاء' },
        { key: 'don_grantors', name: 'تبرعات نقدية — المؤسسات المانحة وكبار الداعمين' },
        { key: 'don_general', name: 'تبرعات نقدية عامة' },
        { key: 'zakat', name: 'الزكاة' },
        { key: 'in_kind', name: 'تبرعات عينية' },
        { key: 'gov_grants', name: 'إعانات حكومية' },
        { key: 'program_rev', name: 'إيرادات البرامج والأنشطة' },
        { key: 'other_rev', name: 'إيرادات أخرى' },
      ],
      groups: { activities: 'تكلفة الأنشطة', allocated: 'مصاريف محملة على النشاط', admin: 'المصروفات الإدارية والعمومية', capital: 'ممتلكات وآلات ومعدات' },
      expense: [
        { key: 'prog_exp', group: 'activities', name: 'مصروفات برامج وأنشطة' },
        { key: 'aid', group: 'activities', name: 'مساعدات للمستفيدين' },
        { key: 'al_salaries', group: 'allocated', name: 'رواتب وبدلات تشغيلية' },
        { key: 'al_rent', group: 'allocated', name: 'إيجارات (تشغيلي)' },
        { key: 'al_maint', group: 'allocated', name: 'صيانة وإصلاح' },
        { key: 'al_prof', group: 'allocated', name: 'أتعاب مهنية واستشارات' },
        { key: 'al_station', group: 'allocated', name: 'قرطاسية ومطبوعات' },
        { key: 'al_media', group: 'allocated', name: 'مواد إعلامية' },
        { key: 'al_train', group: 'allocated', name: 'التدريب والتطوير' },
        { key: 'ad_salaries', group: 'admin', name: 'رواتب وأجور وبدلات إدارية' },
        { key: 'ad_rent', group: 'admin', name: 'إيجارات (إداري)' },
        { key: 'ad_utilities', group: 'admin', name: 'هاتف وكهرباء وماء' },
        { key: 'ad_bank', group: 'admin', name: 'مصاريف بنكية' },
        { key: 'ad_gosi', group: 'admin', name: 'التأمينات الاجتماعية' },
        { key: 'ad_eos', group: 'admin', name: 'مكافأة نهاية الخدمة' },
        { key: 'ad_gov', group: 'admin', name: 'رسوم حكومية' },
        { key: 'ad_gov2', group: 'admin', name: 'مصاريف حوكمة' },
        { key: 'cap_assets', group: 'capital', name: 'شراء أصول ثابتة (> 1,000 ريال)' },
      ],
    },
    /* بيانات الوضع التجريبي فقط — أسماء توضيحيّة */
    demo: {
      members: [
        ['أ. عبدالله المحمد', 'المدير التنفيذي', 'exec', 'admin'],
        ['أ. سارة العتيبي', 'مدير تنمية الموارد', 'comms', 'manager'],
        ['أ. خالد الشهري', 'المدير المالي والإداري', 'admin_fin', 'manager'],
        ['أ. نورة القحطاني', 'مدير البرامج والمشاريع', 'programs', 'manager'],
        ['أ. فهد الدوسري', 'محاسب', 'admin_fin', 'staff', ['tasks', 'library']],
        ['أ. ريم الزهراني', 'منسق برامج', 'programs', 'staff'],
      ],
      avatars: [],
      programs: [['quran-circles', 'حلقات تحفيظ القرآن'], ['family-aid', 'برنامج دعم الأسر'], ['summer-club', 'النادي الصيفي'], ['youth-skills', 'مهارات الشباب'], ['ramadan-baskets', 'السلال الرمضانية']],
      donors: ['مؤسسة خيرية مانحة', 'داعم رئيسي', 'شركة راعية', 'متبرع فرد'],
    },
  },

  /* تطبيقات نظام الأعمال الأصليّة — المفعّل منها للجمعيّة: التقويم والخرائط الذهنية */
  modules: {
    dashboard: false, sales: false, invoicing: false, quoteDesign: false, products: false, pos: false,
    subscriptions: false, accounting: false, habits: false, pipeline: false, contacts: false, suppliers: false,
    appointments: false, calendar: true, projects: false, boards: true, blog: false, newsletter: false,
    ideas: false, workspace: false,
  },

  quoteTemplates: [{ id: 'blank', name: 'مخصّص', depositPct: 0, deliveryDays: 0, revisions: 0, validityDays: 14, template: '' }],
  defaultProducts: [],
  brandProfiles: [{ id: 'default', name: 'هوية الجمعية', tagline: '', logo: '', accent: '#1003BD', accent2: '#6E6E73', ink: '#1D1D1F', pattern: 'glow', coverStyle: 'classic', showPattern: true, showQR: false, titleSize: 82, org: {} }],
};
CONFIG.neon = CONFIG.neonBranches[/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'staging' : 'production'];
