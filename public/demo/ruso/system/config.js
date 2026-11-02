/*
 * config.js — إعدادات نظام جمعية رسو الداخلي
 * ══════════════════════════════════════════════════════════════════
 * نفس مشروع Supabase الذي يستخدمه الموقع (website/assets/js/config.js).
 * إذا تُرك supabaseUrl فارغاً يعمل النظام بـ«الوضع التجريبي»: بيانات محلية
 * في المتصفح فقط، مع إمكانية تجربة النظام بصلاحيات كل قسم.
 */
const CONFIG = {

  /* ═══════ Supabase ═══════ */
  supabaseUrl: '',
  supabaseKey: '',
  websiteUrl:  '../website/',

  /* ═══════ الجمعية ═══════ */
  ownerName:    'عبدالإله بن عبدالعزيز بالطيور',
  ownerEmail:   'ADMIN_EMAIL@ruso.org.sa',        // نفس البريد في supabase/schema.sql (القسم 0)
  ownerPhone:   '966500000000',
  companyName:  'جمعية رسو لبناء الشخصية',
  companyAddress: 'الأحساء، الهفوف، حي الخالدية',
  license:      '0000000000',

  /* ═══════ الحساب البنكي ═══════ */
  bankName:     'مصرف الراجحي',
  bankIban:     '',
  bankAccName:  'جمعية رسو لبناء الشخصية',
  bankLogo:     '',

  /* ═══════ الضريبة (VAT) ═══════ */
  vatEnabled:   false,
  vatRate:      15,
  vatNumber:    '',
  vatSellerName:'',
  vatCR:        '',

  /* ═══════ الهوية البصرية ═══════ */
  brandName:    'نظام رسو',
  brandLogo:    './assets/logo-horizontal.svg',        // للخلفيات الفاتحة (الدخول، الطباعة)
  brandLogoLight: './assets/logo-horizontal-white.svg', // للشريط الجانبي الداكن
  brandMark:    './assets/mark.svg',                   // علامة مائية في السندات المطبوعة
  printFontFamily: 'F',
  printFonts:   '@font-face{font-family:F;src:url(assets/fonts/frutiger-light.ttf)}@font-face{font-family:F;src:url(assets/fonts/frutiger-bold.ttf);font-weight:700}',
  brandAccent:  '#CAB05F',
  brandAccent2: '#D9C27A',
  brandTagline: 'النظام الداخلي — جمعية رسو لبناء الشخصية',

  /* ═══════ العملة والمنطقة ═══════ */
  currency:     'ر.س',
  usdRate:      3.75,
  prayerCity:   'Al Hofuf',
  prayerCountry:'Saudi Arabia',
  prayerMethod: 4,

  storageKey:   'ruso_minwal_demo',

  /* ═══════ حدود اللوائح المالية (لائحة الصلاحيات وسياسة الصرف) ═══════ */
  finance: {
    cashLimit:      10000,   // الصرف النقدي لا يتجاوز 10,000 — ما زاد بشيك أو حوالة
    quotesLimit:    10000,   // المشتريات فوق 10,000 تتطلب 3 عروض أسعار
    boardLimit:     20000,   // العقود والصرف فوق 20,000 ← اعتماد مجلس الإدارة
    advanceLimit:   5000,    // السلف والعهد في حدود 5,000
    inspectLimit:   1000,    // محضر فحص للأصناف فوق 1,000
    depositLimit:   10000,   // المتحصلات فوق 10,000 تودع خلال يوم عمل
    budgetTransferPct: 25,   // مناقلة المدير التنفيذي بين البنود حتى 25%
  },


  /* ═══════ الهيكل التنظيمي والصلاحيات (من «الهيكل التنظيمي» و«التشكيلات الإدارية») ═══════
     النظام يقرأ الأقسام وتطبيقات كل قسم والتصنيفات المالية من هنا — هذا هو الجزء الخاص بكل عميل. */
  org: {
    terms: { org: 'الجمعية', head: 'المدير التنفيذي', finHead: 'مدير الشؤون الإدارية والمالية', board: 'مجلس الإدارة' },
    roles: { admin: 'المدير التنفيذي', manager: 'مدير إدارة / رئيس وحدة', staff: 'موظف' },
    depts: {
      exec:         { name: 'الإدارة التنفيذية', short: 'التنفيذية', color: '#CAB05F', units: ['المدير التنفيذي', 'مساعد إداري'] },
      projects:     { name: 'إدارة المشاريع', short: 'المشاريع', color: '#41747F', units: ['قسم البيئات القيمية', 'قسم البرامج العامة', 'قسم العاملين مع الشباب'] },
      comms:        { name: 'إدارة الاتصال والتسويق', short: 'الاتصال والتسويق', color: '#6C8EBF', units: ['قسم الاتصال والشراكات', 'قسم الإعلام والتسويق', 'قسم تنمية الموارد المالية'] },
      admin_fin:    { name: 'إدارة الشؤون الإدارية والمالية', short: 'الإدارية والمالية', color: '#8A6D3B', units: ['قسم الشؤون المالية', 'قسم الموارد البشرية', 'قسم الخدمات المساندة', 'قسم تقنية المعلومات'] },
      excellence:   { name: 'وحدة التميز المؤسسي', short: 'التميز المؤسسي', color: '#7B5EA7', units: [] },
      volunteering: { name: 'وحدة التطوع', short: 'التطوع', color: '#3E9B6E', units: [] },
    },
    // التطبيقات الافتراضية لكل قسم (المدير التنفيذي يرى كل شيء، ويمكنه تخصيص أي موظف)
    deptApps: {
      exec:         ['site', 'inbox', 'tasks', 'library', 'finance', 'donors', 'team', 'programs', 'reports', 'newsletter', 'beneficiaries', 'volunteers', 'hr', 'procurement', 'governance', 'grants', 'mail'],
      comms:        ['site', 'inbox', 'programs', 'donors', 'tasks', 'library', 'newsletter', 'grants', 'mail'],
      projects:     ['programs', 'inbox', 'tasks', 'library', 'beneficiaries'],
      admin_fin:    ['finance', 'donors', 'reports', 'tasks', 'library', 'hr', 'procurement', 'mail'],
      excellence:   ['reports', 'tasks', 'library', 'governance', 'beneficiaries'],
      volunteering: ['inbox', 'tasks', 'library', 'volunteers'],
    },
    // من أي قسم تصل طلبات الموقع (تسجيل البرامج للمشاريع، التطوع لوحدة التطوع…)
    inboxRouting: { registration: ['projects'], volunteer: ['volunteering'], job: ['admin_fin'], partnership: ['comms'], support: ['comms'], contact: ['comms'] },
    // أعضاء مجلس الإدارة (الدورة الأولى 2024–2028) — يُعبَّأ بهم حضور اجتماعات المجلس تلقائياً
    boardMembers: [['د. محمد بن صالح أبابطين', 'رئيس مجلس الإدارة'], ['د. محمد بن عبدالله بوطيبان', 'نائب رئيس مجلس الإدارة'], ['م. خالد بن مرزوق السعد', 'عضو مجلس الإدارة'], ['أ. محمد بن عبدالعزيز الدليجان', 'عضو مجلس الإدارة'], ['د. عبدالعزيز بن خالد الشريدي', 'عضو مجلس الإدارة']],
    hr: { annualLeave: 21 },   // نظام العمل: 21 يوماً، و30 بعد خمس سنوات خدمة
    appLabels: { programs: 'البرامج (في الموقع)', donors: 'الداعمون والمانحون' },
    // صور الجمعية كخلفيات (تظهر أولاً في نافذة «خلفية الشاشة») — وكل موظف يقدر يرفع صوره
    wallImages: [
      { key: 'ruso-flow-teal',    name: 'موجة رسو',        url: './wallpapers/ruso-flow-teal.jpg' },
      { key: 'ruso-flow-night',   name: 'ليل رسو',         url: './wallpapers/ruso-flow-night.jpg' },
      { key: 'ruso-flow-sunset',  name: 'غروب رسو',        url: './wallpapers/ruso-flow-sunset.jpg' },
      { key: 'ruso-bigsur-color', name: 'طبقات الهوية',     url: './wallpapers/ruso-bigsur-color.jpg' },
      { key: 'ruso-dunes-black',  name: 'كثبان داكنة',      url: './wallpapers/ruso-dunes-black.jpg' },
      { key: 'ruso-oasis',        name: 'واحة الأحساء',     url: './wallpapers/ruso-oasis.jpg' },
    ],
    wallOnly: true,                    // لا تُعرض خلفيات النظام العامة — صور الجمعية فقط + ما يرفعه الموظف
    defaultWallpaper: 'ruso-flow-teal',
    jobTitles: ['المدير التنفيذي', 'مساعد إداري', 'رئيس وحدة التميز المؤسسي', 'رئيس وحدة التطوع', 'مدير إدارة المشاريع', 'رئيس قسم التدريب والتطوير', 'منسق مشاريع', 'أخصائي مشاريع', 'رئيس قسم البرامج العامة', 'مدير إدارة الاتصال والتسويق', 'رئيس قسم الاتصال والشراكات', 'أخصائي اتصال وشراكات', 'رئيس قسم الإعلام والتسويق', 'أخصائي إعلام وتسويق', 'رئيس قسم تنمية الموارد المالية', 'أخصائي تنمية موارد مالية', 'مدير إدارة الشؤون الإدارية والمالية', 'رئيس قسم الشؤون المالية', 'محاسب', 'أمين الصندوق', 'رئيس قسم الموارد البشرية', 'رئيس قسم الخدمات المساندة', 'موظف استقبال', 'متطوع'],
    /* التصنيفات المالية — من القوائم المالية المراجَعة للجمعية 2024–2025 (قائمة الأنشطة) */
    finance: {
      revenue: [
        { key: 'membership', name: 'اشتراكات الأعضاء' },
        { key: 'don_grantors', name: 'تبرعات نقدية — المؤسسات المانحة وكبار الداعمين' },
        { key: 'don_general', name: 'تبرعات نقدية عامة' },
        { key: 'in_kind', name: 'تبرعات عينية' },
        { key: 'gov_grants', name: 'إعانات حكومية' },
        { key: 'program_rev', name: 'إيرادات البرامج والأنشطة' },
        { key: 'other_rev', name: 'إيرادات أخرى' },
      ],
      groups: { activities: 'تكلفة الأنشطة', allocated: 'مصاريف محملة على النشاط', admin: 'المصروفات الإدارية والعمومية', capital: 'ممتلكات وآلات ومعدات' },
      /* البيانات الحقيقية من القوائم المالية المراجَعة — تُدخل تلقائياً في المحاسبة أول مرة (قيود إجمالية مُرحّلة + إقفال كل سنة) */
      history: {
        auditor: 'أرقام توضيحية — نسخة عرض', location: 'مقر الجمعية — الأحساء',
        years: {
          2024: { date: '2024-12-31', src: 'القوائم المالية للفترة من 29 يناير 2024 حتى 31 ديسمبر 2024',
            rev: { membership: 996, don_grantors: 232400, in_kind: 3, gov_grants: 83000 },
            exp: { prog_exp: 55212, al_rent: 1950, al_bank: 29, al_prof: 4980, al_media: 1245, ad_gov: 2820, ad_gov2: 9960 },
            accruedNew: 11164, accruedPaid: 0, prepaidChange: 36122, vatChange: 13185, eos: 0,
            ppe: { computers: 3660, leasehold: 17173, machinery: 17067 }, donatedPPE: 1, dep: { computers: 94, leasehold: 471, machinery: 657 } },
          2025: { date: '2025-12-31', src: 'القوائم المالية للسنة المنتهية في 31 ديسمبر 2025',
            rev: { membership: 2988, don_grantors: 298385, don_general: 1911, in_kind: 3106, gov_grants: 388440, program_rev: 15129 },
            exp: { prog_exp: 327479, al_salaries: 17275, al_rent: 4546, al_maint: 1472, al_bank: 101, al_incent: 12052, al_prof: 4980, al_station: 1521, al_hosp: 574, al_media: 111, al_train: 94,
              ad_salaries: 38514, ad_rent: 6041, ad_utilities: 596, ad_bank: 26, ad_incent: 2208, ad_gosi: 9313 },
            accruedNew: 6640, accruedPaid: 11164, prepaidChange: -6021, vatChange: 20454, eos: 4401,
            ppe: { furniture: 42712, computers: 23981, leasehold: 23130, machinery: 613 }, donatedPPE: 0, dep: { furniture: 4271, computers: 2764, leasehold: 4030, machinery: 1768 } },
        },
        // الأصول بأرصدة 31/12/2025 (إيضاح 6): [التكلفة، مجمع الإهلاك، تاريخ أول اقتناء]
        assets: { furniture: [42712, 4271, '2025-01-01'], computers: [27641, 2858, '2024-06-01'], leasehold: [40302, 4502, '2024-06-01'], machinery: [17681, 2424, '2024-06-01'] },
      },
      expense: [
        { key: 'prog_exp', group: 'activities', name: 'مصروفات برامج وأنشطة' },
        { key: 'al_salaries', group: 'allocated', name: 'رواتب وبدلات تشغيلية' },
        { key: 'al_rent', group: 'allocated', name: 'إيجارات وبدل سكن (تشغيلي)' },
        { key: 'al_maint', group: 'allocated', name: 'صيانة وإصلاح' },
        { key: 'al_bank', group: 'allocated', name: 'مصاريف بنكية (تشغيلية)' },
        { key: 'al_incent', group: 'allocated', name: 'حوافز ومكافآت (تشغيلية)' },
        { key: 'al_prof', group: 'allocated', name: 'أتعاب مهنية واستشارات' },
        { key: 'al_station', group: 'allocated', name: 'قرطاسية ومطبوعات' },
        { key: 'al_hosp', group: 'allocated', name: 'ضيافة ونظافة' },
        { key: 'al_media', group: 'allocated', name: 'مواد إعلامية' },
        { key: 'al_train', group: 'allocated', name: 'التدريب والتطوير' },
        { key: 'ad_salaries', group: 'admin', name: 'رواتب وأجور وبدلات إدارية' },
        { key: 'ad_rent', group: 'admin', name: 'إيجارات وبدل سكن (إداري)' },
        { key: 'ad_utilities', group: 'admin', name: 'هاتف وكهرباء وماء' },
        { key: 'ad_bank', group: 'admin', name: 'مصاريف بنكية (إدارية)' },
        { key: 'ad_incent', group: 'admin', name: 'حوافز ومكافآت (إدارية)' },
        { key: 'ad_gosi', group: 'admin', name: 'التأمينات الاجتماعية' },
        { key: 'ad_eos', group: 'admin', name: 'مكافأة نهاية الخدمة' },
        { key: 'ad_gov', group: 'admin', name: 'رسوم حكومية' },
        { key: 'ad_gov2', group: 'admin', name: 'مصاريف حوكمة' },
        { key: 'cap_assets', group: 'capital', name: 'شراء أصول ثابتة (> 1,000 ريال)' },
      ],
    },
    /* بيانات الوضع التجريبي فقط (فريق العمل من التقرير السنوي 2025) */
    demo: {
      members: [
        ['عبدالإله بن عبدالعزيز بالطيور', 'المدير التنفيذي', 'exec', 'admin'],
        ['عبدالعزيز بن أحمد بوعلي', 'مدير إدارة الاتصال والتسويق', 'comms', 'manager'],
        ['حذيفة بن عبدالعزيز الحادي', 'مدير إدارة الشؤون الإدارية والمالية', 'admin_fin', 'manager'],
        ['مالك بن عبدالله العبيد', 'مدير إدارة المشاريع', 'projects', 'manager'],
        ['عبدالرحمن بن محمد الغنام', 'رئيس قسم الخدمات المساندة', 'admin_fin', 'staff', ['tasks', 'library']],
        ['عبدالعزيز بن خالد الحمل', 'أخصائي مشاريع', 'projects', 'staff'],
      ],
      /* صور الحسابات (بنفس ترتيب members) — كل موظف يغيّر صورته من «حسابي» */
      avatars: ['assets/avatars/team-1.webp', 'assets/avatars/team-2.webp', 'assets/avatars/team-3.webp', 'assets/avatars/team-4.webp', 'assets/avatars/team-5.webp', 'assets/avatars/team-6.webp'],
      programs: [['strategic-compass', 'مجتمع البوصلة الاستراتيجية للعاملين مع الشباب'], ['afaq', 'برنامج آفاق'], ['summer-club', 'نادي رسو الصيفي'], ['ruso-environment', 'بيئة رسو'], ['binaa', 'بناء']],
      donors: ['مؤسسة غيث الخيرية', 'مؤسسة العجيمي الخيرية', 'أوقاف الضحيان', 'المجلس التخصصي للجمعيات الشبابية'],
    },
  },

  /* ═══════ تطبيقات نظام بزنس الأصلية ═══════
     المفعّل منها للجمعية: التقويم والخرائط الذهنية (مساحة شخصية لكل موظف).
     الباقي مخفي — الكود محفوظ ويمكن تفعيله لاحقاً. */
  modules: {
    dashboard:   false,
    sales:       false,
    invoicing:   false,
    quoteDesign: false,
    products:    false,
    pos:         false,
    subscriptions:false,
    accounting:  false,
    habits:      false,
    pipeline:    false,
    contacts:    false,
    suppliers:   false,
    appointments:false,
    calendar:    true,
    projects:    false,
    boards:      true,
    blog:        false,
    newsletter:  false,
    ideas:       false,
    workspace:   false,
  },

  quoteTemplates: [{ id: 'blank', name: 'مخصّص', depositPct: 0, deliveryDays: 0, revisions: 0, validityDays: 14, template: '' }],
  defaultProducts: [],
  brandProfiles: [{ id: 'default', name: 'هوية رسو', tagline: '', logo: '', accent: '#CAB05F', accent2: '#41747F', ink: '#14292D', pattern: 'glow', coverStyle: 'classic', showPattern: true, showQR: false, titleSize: 82, org: {} }],
};
