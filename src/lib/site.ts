// ===== إعدادات الموقع الأساسية =====
// عدّل القيم هنا فقط؛ تنعكس على كل الموقع.

export const site = {
  name: "إبراهيم سعود",
  tagline: "تقنية أعمال وبودكاست",
  bio: "إبراهيم سعود — تقنية أعمال وبودكاست",
  whatsapp: "966504895213", // بدون + وبدون أصفار، صيغة دولية
  email: "ibrahimsaud25@gmail.com",
  domain: "ibrahimsaud.com",
  // رابط الحجز من Cal.com — "اسم-المستخدم/نوع-الحدث"
  // بعد إنشاء حساب Cal.com وربط Google (لتوليد Google Meet)، عدّل هذا السطر.
  // مثال: لو رابطك cal.com/ibrahim-saud/30min اكتب: "ibrahim-saud/30min"
  calLink: "ibrahim-saud/30min",
  social: {
    tiktok: "https://www.tiktok.com/@ibrahimsaud", // ← عدّل الرابط
    instagram: "", // ← أضف لو تبي
    youtube: "https://www.youtube.com/@Sa3y_Podcast",
    x: "",
  },
  // ===== بودكاست سَعي (أصبح قسماً داخل الموقع بدل موقع منفصل) =====
  podcast: {
    name: "سَعي",
    youtube: "https://www.youtube.com/@Sa3y_Podcast",
    tiktok: "https://www.tiktok.com/@sa3y_podcast",
    registerHref: "/register/", // استمارة «كن ضيفاً»
  },
  // روابط مشاريعك الأخرى (تظهر كبطاقات منفصلة)
  ventures: [
    {
      title: "منصة حروف ودروس",
      desc: "منصة تعليمية تساعد المعلّم وتولّد له أسئلة عالية الجودة — منتج تقني قيد الإطلاق.",
      href: "https://ibrahimsaud.com/app/", // ← عدّل للرابط النهائي للمنصة
      tag: "منتج تقني",
    },
  ],
} as const;

export function waLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsapp}?text=${text}`;
}

// ===== الخدمات =====
export const services = [
  {
    icon: "✍️",
    title: "كتابة النص الإعلاني",
    desc: "سكربت يبيع — مبني على المنتج والجمهور، بلهجة تناسب السوق السعودي والخليجي.",
  },
  {
    icon: "🎥",
    title: "التصوير الاحترافي",
    desc: "تصوير في موقعك بمعدات احترافية، مع إضاءة سينمائية ولقطات B-Roll.",
  },
  {
    icon: "🚁",
    title: "تصوير درون",
    desc: "لقطات جوية سينمائية ترفع مستوى أي فيديو مؤسسي أو فعالية.",
  },
  {
    icon: "🎙️",
    title: "التعليق الصوتي",
    desc: "صوت احترافي يوصّل رسالتك — أو إخراج ممثل/مودل أمام الكاميرا.",
  },
  {
    icon: "✂️",
    title: "المونتاج والإخراج",
    desc: "قص، إيقاع، موسيقى، وموشن جرافيك — نسخة طويلة ونسخ قصيرة للنشر.",
  },
] as const;

// ===== كيف نشتغل =====
export const processSteps = [
  {
    n: "01",
    title: "نفهم منتجك",
    desc: "نتفق على الهدف، الجمهور، والرسالة — قبل أي كاميرا.",
  },
  {
    n: "02",
    title: "نكتب القصة",
    desc: "سكربت ومعالجة بصرية تخدم البيع، مو بس تكون «حلوة».",
  },
  {
    n: "03",
    title: "نصوّر وننتج",
    desc: "تصوير، تعليق صوتي، مونتاج — وكواليس نوثّقها للحملة.",
  },
  {
    n: "04",
    title: "نسلّم ونطلق",
    desc: "نسخة رئيسية + نسخ قصيرة للنشر، مع خطة محتوى قبل وبعد.",
  },
] as const;

// ===== الأعمال / دراسات الحالة =====
// videoUrl: ضع رابط يوتيوب/تيك توك/Vimeo أو رابط ملف mp4 على GitHub.
// اتركه فارغًا "" لو لسا ما عندك الرابط — تظهر بطاقة بدون مشغّل.
// audience: الجمهور الذي يخدمه العمل — يُقسّم قسم الأعمال إلى:
//   "companies" = الشركات والجهات (طابع رسمي وميزانيات)
//   "stores"    = المتاجر الإلكترونية (استهداف وأداء وأسعار أقل)
// اتركه فارغاً للأعمال الخاصة التي لا تندرج تحت أي قسم (مثل فيلم زواج).
export type Audience = "companies" | "stores";

export type Work = {
  id: string;
  client: string;
  title: string;
  category: string;
  audience?: Audience;
  roles: string[];
  desc: string;
  videoUrl?: string; // رابط فيديو واحد (اختياري — للتوافق القديم)
  videos?: string[]; // عدة روابط فيديو لنفس العمل
  bts?: string; // رابط فيديو الكواليس (اختياري)
  logo?: string; // مسار شعار العميل داخل public مثل "/LOGO_kwentra.png" (اختياري)
  thumb?: string; // صورة مصغّرة مخصّصة للعمل (اختياري) — وإلا تُستخدم صورة يوتيوب
  featured?: boolean;
};

export const works: Work[] = [
  // ===== تغطية فعاليات (هاكاثونات ومؤتمرات) =====
  {
    id: "healthon-open",
    client: "جامعة الملك سعود — هاكاثون هيلثون",
    title: "هاكاثون هيلثون — الفيلم الافتتاحي",
    category: "تغطية فعاليات",
    audience: "companies",
    roles: ["إخراج", "تصوير", "مونتاج", "موشن"],
    desc: "الفيلم الافتتاحي لهاكاثون هيلثون بجامعة الملك سعود، مع هوية بصرية متحركة تفتح الحدث — من الفكرة حتى التسليم.",
    videoUrl: "https://youtu.be/WL-GJ4ZT7Cg",
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/هيلثون.jpg",
    featured: true,
  },
  {
    id: "healthon-close",
    client: "جامعة الملك سعود — هاكاثون هيلثون",
    title: "هاكاثون هيلثون — الفيلم الختامي",
    category: "تغطية فعاليات",
    audience: "companies",
    roles: ["إخراج", "تصوير", "مونتاج"],
    desc: "الفيلم الختامي الذي يلخّص إنجاز الهاكاثون، إضافة لبوسترات وبرومو ولقطات مشاركين.",
    videoUrl: "https://youtu.be/7Vmq3eTWQwc",
  },

  // ===== أعمال سينمائية =====
  {
    id: "rinad-tasis",
    client: "ريناد المجد",
    title: "فيلم يوم التأسيس",
    category: "أعمال سينمائية",
    audience: "companies",
    roles: ["كتابة النص", "تصوير درون", "تمثيل", "تعليق صوتي", "مونتاج"],
    desc: "فيلم سينمائي ليوم التأسيس بلقطات درون وتعليق صوتي ونص كامل — صنعته من الفكرة حتى التسليم، وكنت فيه الممثل والمعلّق والكاتب والمنتج.",
    videoUrl: "https://www.youtube.com/watch?v=EOOlRJgeT6Y",
    logo: "/LOGO_RMG.png",
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/يوم%20التأسيس.jpg",
    featured: true,
  },
  {
    id: "feeh-breaking-bad",
    client: "متجر فيه ستور (feeh store)",
    title: "إعلان تمثيلي — على طريقة بريكنج باد",
    category: "أعمال سينمائية",
    audience: "companies",
    roles: ["فكرة", "إخراج", "تمثيل (بطولة)", "مونتاج"],
    desc: "إعلان درامي لمتجر تجميعات الكمبيوتر بأسلوب «بريكنج باد»: شخصية رئيسية تبيع الأجهزة من سيارتها وتُتمّ صفقاتها — كتبت الفكرة، وأخرجت، وكنت الممثل الأساسي.",
    videoUrl: "https://www.youtube.com/watch?v=HTojPu3baG8",
  },
  {
    id: "wedding-film",
    client: "مناسبة خاصة",
    title: "فيلم زواج",
    category: "أعمال سينمائية",
    roles: ["تصوير", "مونتاج"],
    desc: "توثيق سينمائي لمناسبة زواج — تصوير ومونتاج يحفظ لحظات اليوم بأسلوب راقٍ.",
    videoUrl: "https://youtu.be/IIArrpuGomk",
  },

  // ===== إعلانات منتجات =====
  {
    id: "feeh-campaign",
    client: "متجر فيه ستور (feeh store)",
    title: "الفيديو الرئيسي لحملة الموقع الجديد",
    category: "إعلانات منتجات",
    audience: "companies",
    roles: ["فكرة", "إخراج", "تصوير", "مونتاج"],
    desc: "الفيديو الرئيسي لإطلاق الموقع الجديد، يبرز ميزة «اجمع جهازك بنفسك» ضمن حملة متكاملة.",
    videoUrl: "https://www.youtube.com/watch?v=Bg_9L6TKduc",
    featured: true,
  },
  {
    id: "tad-main",
    client: "متجر TAD",
    title: "حملة شاحن السفر — الفيديو الرئيسي",
    category: "إعلانات منتجات",
    audience: "stores",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
    desc: "الفيديو الرئيسي لحملة شاحن السفر — مقطع مصوّر من المغرب استُخدم في التسويق.",
    videoUrl: "https://youtu.be/GcA8sjlQduI",
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/TAD.jpg",
  },
  {
    id: "tad-short-1",
    client: "متجر TAD",
    title: "شاحن السفر — مقطع قصير",
    category: "إعلانات منتجات",
    audience: "stores",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "مقطع قصير تعريفي بمنتج شاحن السفر، جاهز للنشر على المنصات.",
    videoUrl: "https://www.youtube.com/shorts/hzGpY3rvj0w",
  },
  {
    id: "tad-short-2",
    client: "متجر TAD",
    title: "شاحن السفر — مقطع قصير ٢",
    category: "إعلانات منتجات",
    audience: "stores",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "مقطع قصير ثانٍ ضمن حملة شاحن السفر، بزاوية مختلفة.",
    videoUrl: "https://www.youtube.com/shorts/VG-Wk9eKcMo",
  },
  {
    id: "tad-bts",
    client: "متجر TAD",
    title: "شاحن السفر — كواليس التصوير",
    category: "إعلانات منتجات",
    audience: "stores",
    roles: ["تصوير", "توثيق"],
    desc: "كواليس تصوير حملة شاحن السفر من المغرب — لقطات من خلف الكاميرا.",
    videoUrl: "https://youtu.be/2Og0FzpWbX4",
  },

  // ===== مقابلات الشارع =====
  {
    id: "blvd-1",
    client: "متجر فيه ستور (feeh store)",
    title: "تغطية موسم الرياضات الإلكترونية (EWC)",
    category: "مقابلات الشارع",
    audience: "stores",
    roles: ["فكرة", "تقديم", "تصوير", "مونتاج"],
    desc: "تغطية لموسم الرياضات الإلكترونية من بوليفارد الرياض — تقديم وتصوير ومونتاج.",
    videoUrl: "https://www.youtube.com/shorts/y9EnZUF3BH8",
  },
  {
    id: "blvd-2",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — مقابلات شارع",
    category: "مقابلات الشارع",
    audience: "stores",
    roles: ["تقديم", "تصوير", "مونتاج"],
    desc: "مقابلات شارع مع الزوّار في موسم الرياضات الإلكترونية.",
    videoUrl: "https://www.youtube.com/shorts/5g_2DYu7Gu8",
  },
  {
    id: "blvd-3",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — لقاء لينوفو",
    category: "مقابلات الشارع",
    audience: "stores",
    roles: ["تقديم", "تصوير", "مونتاج"],
    desc: "مقطع مع لينوفو ضمن تغطية البوليفارد.",
    videoUrl: "https://www.youtube.com/shorts/8I_ULf59_K8",
  },
  {
    id: "blvd-4",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — فلوق الجولة",
    category: "مقابلات الشارع",
    audience: "stores",
    roles: ["تقديم", "تصوير", "مونتاج"],
    desc: "فلوق جولة في الفعاليات، ولقاء مع صانع المحتوى التقني فيصل السيف.",
    videoUrl: "https://www.youtube.com/shorts/O-6Qm1vUET0",
  },
];

// ===== العلامات التجارية (الشركات اللي اشتغلت معها) =====
// أضف كل شعار: ارفع الصورة في مجلد public ثم اكتب مسارها هنا.
// مثال: { name: "اسم الشركة", logo: "/logo-company.png" },
export const brands: { name: string; logo: string }[] = [
  { name: "ريناد المجد", logo: "/LOGO_RMG.png" },
  { name: "الهيئة العامة للنقل", logo: "/tga.png" },
  { name: "إجادة التقنية", logo: "/ejada.png" },
  { name: "فيه ستور", logo: "/feeh-store.webp" },
  { name: "وكونترا", logo: "/LOGO_kwentra.png" },
  { name: "جمعية خير لتحفيظ القرآن", logo: "/khair-quran.png" },
  { name: "درفت تايم", logo: "/LOGO_3_drift_time.png" },
];

// ===== بودكاست سَعي — البرامج التي أنتجناها وقدّمناها =====
// ytId: معرّف فيديو يوتيوب (للصورة المصغّرة)، href: رابط القائمة/الحلقة.
export type Program = {
  title: string;
  desc: string;
  meta?: string; // مثل "١٥ حلقة" أو "موسمان"
  year?: string; // سنة الإنتاج — عدّلها لو غير دقيقة
  active?: boolean; // true = البرنامج قائم الآن (تظهر شارة «قائم الآن»)
  ytId: string;
  href: string;
};

export const programs: Program[] = [
  {
    title: "بودكاست سَعي",
    desc: "البودكاست الرئيسي — نحوّل الخبرة المتخصصة إلى كلام بسيط يفيدك، ونروي قصة السعي خلف كل تجربة.",
    meta: "الحلقة الأحدث",
    year: "٢٠٢٤ – الآن",
    active: true,
    ytId: "1XHrhbIouVM",
    href: "https://www.youtube.com/watch?v=1XHrhbIouVM",
  },
  {
    title: "بودكاست يا غلام",
    desc: "بودكاست حواري — تقديم وإعداد، بالتعاون مع قناة فلق والمدونة استديو.",
    year: "٢٠٢٣",
    ytId: "h9WQT7gMP6E",
    href: "https://www.youtube.com/watch?v=h9WQT7gMP6E&list=PLWFi7GIBTmLJrXIWM6PlYEHOy-LDA4rRg",
  },
];

// ===== خدمات إنتاج البودكاست (داخل استوديو سَعي) =====
export const podcastServices = [
  { icon: "🎬", title: "تصوير وإنتاج", desc: "استوديو مجهّز بكاميرات وإضاءة وصوت احترافي لتصوير حلقاتك بأعلى جودة." },
  { icon: "✂️", title: "مونتاج وتحرير", desc: "تحرير كامل للحلقة + مقاطع قصيرة (Reels) جاهزة للنشر على المنصات." },
  { icon: "🧠", title: "إعداد وتحضير محاور", desc: "بحث وتحضير محاور وأسئلة تخدم جمهورك وتبرز ضيفك بأفضل صورة." },
  { icon: "🎚️", title: "هندسة وتنقية صوت", desc: "معالجة صوتية احترافية تضمن وضوحاً وراحة في الاستماع." },
  { icon: "📈", title: "توزيع على المنصات", desc: "نشر منظّم على يوتيوب والمنصات الصوتية مع تحسين العناوين والأوصاف." },
  { icon: "🎙️", title: "تأجير الاستوديو", desc: "احجز الاستوديو لتصوير محتواك الخاص بساعات مرنة وطاقم مساند." },
] as const;

// ===== باقات تسجيل البودكاست =====
export type PodcastPackage = {
  id: string;
  name: string;
  tagline: string;
  persons: string;
  badge?: string;
  setup: string[]; // المكان والمعدّات
};

// السعر الثابت لتسجيل حلقة بودكاست كاملة (بالريال السعودي)
export const podcastRecordingPrice = 2499;

// مخرجات تسجيل الحلقة — كل مخرج يُعرض ببطاقة بارزة بصورته المعبّرة.
// image: صورة معبّرة داخل public/packages (يبدّلها إبراهيم بصورة أنسب لاحقاً).
export type PackageDeliverable = {
  title: string;
  desc: string;
  image?: string;
};
export const packageDeliverables: PackageDeliverable[] = [
  {
    title: "فيديو مسجّل كامل للحلقة",
    desc: "الحلقة كاملة بجودة عالية، جاهزة للنشر على يوتيوب والمنصات.",
    image: "/packages/deliverable-video.jpg",
  },
  {
    title: "١٠ مقاطع قصيرة (مقتطفات)",
    desc: "عشرة مقاطع عمودية جاهزة للريلز والتيك توك من أبرز لحظات الحلقة.",
    image: "/packages/deliverable-clips.jpg",
  },
  {
    title: "تصاميم الحلقة كاملة",
    desc: "صورة الثمنيل + كاروسيل مقتطفات للضيف والمقدّم + صورة إعلان عن الضيف.",
    image: "/packages/deliverable-designs.jpg",
  },
];

export const podcastPackages: PodcastPackage[] = [
  {
    id: "duo",
    name: "حلقة — مقدّم وضيف",
    tagline: "الباقة الأشهر لحلقة حوارية بشخصين",
    persons: "شخصان (مقدّم + ضيف)",
    badge: "الأكثر طلباً",
    setup: [
      "مكان التصوير (استوديو مجهّز بالكامل)",
      "مايكروفونات احترافية + مكسر صوت",
      "٣ كاميرات: كاميرا للضيف، كاميرا للمقدّم، وكاميرا للاثنين معاً",
    ],
  },
  {
    id: "quad",
    name: "حلقة — ٤ أشخاص",
    tagline: "لحلقات النقاش الجماعي والبانل",
    persons: "أربعة أشخاص",
    setup: [
      "مكان التصوير (استوديو مجهّز بالكامل)",
      "٤ مقاعد لأربعة أشخاص",
      "٤ مايكروفونات احترافية",
      "٣ كاميرات: كاميرا لشخصين، كاميرا لشخصين، وكاميرا واسعة للجميع وللمكان",
    ],
  },
];

// ===== معدّات الاستوديو — استعراض المعدّات =====
// image: مسار صورة المنتج (يُفضّل PNG شفاف) داخل public/gear.
//   لو الصورة غير موجودة بعد، تظهر بطاقة «الصورة قريباً» تلقائياً حتى ترفعها.
// link: رابط الشركة المصنّعة لعرض المواصفات الكاملة.
// specs: أبرز المواصفات (تظهر كقائمة مختصرة على البطاقة).
export type PodcastGearItem = {
  id: string;
  name: string;
  brand: string;
  type: string; // نوع الجهاز (كاميرا / مايك / إضاءة …)
  qty: number; // العدد المتوفّر في الاستوديو
  desc: string;
  image?: string; // صورة المنتج (PNG شفاف يُفضّل)
  link?: string; // رابط المواصفات الرسمية
  amazonUrl?: string; // رابط شراء أمازون (رابط صانع المحتوى/الأفلييت)
  accent?: string; // لون مميّز للبطاقة (توهّج خلف الصورة الشفافة) — hex
  specs?: string[]; // أبرز المواصفات
  hero?: boolean; // إبراز البطاقة (عرض أكبر) — للكاميرا الأساسية
  note?: string;
};

export const podcastGear: PodcastGearItem[] = [
  {
    id: "hollyland-venusliv-air",
    name: "Hollyland VenusLiv Air",
    brand: "HOLLYLAND",
    type: "كاميرا بثّ مباشر 4K (الكاميرا الأساسية)",
    qty: 2,
    desc: "الكاميرا الأساسية في الاستوديو — كاميرا بثّ احترافية بدقة 4K مبنية للتشغيل المتواصل ٢٤/٧. عدسة مخصّصة بفتحة ضخمة F1.05 مع مستشعر CMOS مقاس 1/1.3\" و٥٠ ميجابكسل: صورة نقية حتى في الإضاءة المنخفضة، ألوان واقعية، وخلفية ناعمة (Bokeh). تتصل بالكمبيوتر مباشرة عبر USB دون كرت التقاط، وفيها ضبط ذكي بالـ AI وخلفية خضراء وتحسين بشرة وتصحيح ألوان.",
    image: "/gear/venusliv-air.jpg",
    link: "https://www.hollyland.com/product/venusliv-air",
    hero: true,
    specs: [
      "دقة 4K بمعدّل 30 إطار/ثانية",
      "مستشعر CMOS مقاس 1/1.3\" بدقة ٥٠ ميجابكسل",
      "عدسة مخصّصة بفتحة F1.05 — أداء ممتاز بالإضاءة المنخفضة",
      "خرج 4K عبر UVC (USB 3.0) و HDMI دون كرت التقاط",
      "ضبط ذكي AI (تعريض + توازن أبيض) ومعالجة ألوان واقعية",
      "خلفية خضراء + تراكب صور + تحسين بشرة لحظي",
      "تبريد هوائي للبثّ المتواصل ٢٤/٧ دون سخونة",
      "تحكّم كامل من الجوال (VenusCam) والكمبيوتر (HollyStudio)",
    ],
    note: "يوجد منها اثنتان في الاستوديو — تغطية متعدّدة الزوايا.",
  },
  {
    id: "rode-podmic",
    name: "RØDE PodMic",
    brand: "RØDE",
    type: "مايكروفون بثّ ديناميكي (Cardioid)",
    qty: 2,
    desc: "مايكروفون بثّ ديناميكي بنمط Cardioid وخرج XLR — صوت إذاعي دافئ وعزل ممتاز لضوضاء الغرفة. يحتاج واجهة صوت (RØDECaster أو AI-1 أو ما شابه).",
    image: "/gear/rode-podmic.png",
    accent: "#f0a500",
    note: "يوجد منه اثنان في الاستوديو (مقدّم + ضيف).",
  },
  {
    id: "rodecaster-pro-ii",
    name: "RØDECaster Pro II",
    brand: "RØDE",
    type: "مكسر/استوديو إنتاج متكامل",
    qty: 1,
    desc: "حلّ إنتاج متكامل للبودكاست والبثّ وصناعة المحتوى: يجمع المايكات، يتحكّم بالمستويات والمؤثّرات لحظياً، ويسجّل كل صوت في مسار منفصل لمونتاج أنظف.",
    image: "/gear/rodecaster-pro-ii.png",
    accent: "#a855f7",
    link: "https://rode.com/en/interfaces-and-mixers/rodecaster-series/rodecaster-pro-ii",
  },
  {
    id: "elgato-prompter",
    name: "Elgato Prompter",
    brand: "ELGATO",
    type: "تيليبرومبتر بشاشة مدمجة",
    qty: 1,
    desc: "تيليبرومبتر بشاشة مدمجة يوضع أمام الكاميرا لقراءة النص مع النظر مباشرة إلى العدسة — أداء طبيعي وتواصل بصري دون إمساك ورق. يدعم السحب والإفلات وعرض الشاشة، ويعمل مع الكاميرات وكاميرات الويب والجوال ومع Stream Deck.",
    image: "/gear/elgato-prompter.png",
    accent: "#6366f1",
    link: "https://www.elgato.com/us/en/p/prompter",
    specs: [
      "شاشة مدمجة عالية الدقة أمام العدسة",
      "تواصل بصري مباشر مع الكاميرا أثناء القراءة",
      "تحكّم بالسرعة والنص، ويعمل مع Stream Deck",
      "متوافق مع DSLR وكاميرا الويب والجوال (Mac/PC)",
    ],
  },
  {
    id: "godox-tl30",
    name: "Godox TL30 RGB",
    brand: "GODOX",
    type: "إضاءة RGB أنبوبية (Tube Light)",
    qty: 2,
    desc: "أعمدة إضاءة RGB كاملة الألوان بدقّة لونية عالية (CRI 97+ / TLCI 99+) — تصنع الأجواء اللونية في الخلفية وتضيف عمقاً سينمائياً للمشهد. درجة حرارة لونية من 2700K إلى 6500K مع ٣٧ مؤثّراً ضوئياً وتحكّم عبر تطبيق البلوتوث.",
    image: "/gear/godox-tl30.png",
    accent: "#22d3ee",
    link: "https://www.godox.com/product-c/TL30.html",
    specs: [
      "ألوان كاملة RGB بدقّة CRI 97+ / TLCI 99+",
      "حرارة لونية 2700K–6500K قابلة للتعتيم",
      "٣٧ مؤثّراً ضوئياً (FX) جاهزاً",
      "تحكّم لاسلكي عبر تطبيق البلوتوث + بطارية مدمجة",
    ],
  },
  {
    id: "neewer-fl10",
    name: "NEEWER FL10 RGB",
    brand: "NEEWER",
    type: "إضاءة سبوت RGB محمولة",
    qty: 1,
    desc: "كشّاف LED محمول كامل الألوان مع حامل مكتبي — لإضافة لمسات لونية ومؤثّرات (غروب/أجواء) أو إبراز تفاصيل في الكادر. يأتي مع ٢٠ فلتر Gobo و٤ ألوان وبطارية 7500mAh.",
    image: "/gear/neewer-fl10.png",
    accent: "#3b82f6",
    link: "https://neewer.com",
    specs: [
      "10W بدرجة 6300K ودقّة لونية CRI95+",
      "ألوان RGB + ٤ ألوان جاهزة + ٢٠ فلتر Gobo",
      "بطارية 7500mAh وحامل مكتبي مدمج",
    ],
  },
];

// ===== باقات الفيديوهات الإعلانية =====
// price: السعر بالريال السعودي (عدّله بسهولة من هنا).
// color: لون البطاقة (يطابق صورة الباقة): red / blue / yellow.
// image: صورة الباقة المربّعة داخل public/ad-packages.
// sampleVideos: روابط/معرّفات يوتيوب لأمثلة من الأعمال.
export type AdPackage = {
  id: string;
  name: string;
  price: number;
  color: "red" | "blue" | "yellow";
  image: string;
  tagline: string;
  features: string[];
  badge?: string;
};

// أمثلة من الأعمال الإعلانية (روابط يوتيوب) — تظهر كشريط معرض أسفل الباقات.
export const adSampleVideos: string[] = [
  "https://www.youtube.com/watch?v=N7M71XQv0eg",
  "https://www.youtube.com/watch?v=wpgobMl-7Jg",
  "https://www.youtube.com/watch?v=5Ij0-Jko6-I",
];

export const adPackages: AdPackage[] = [
  {
    id: "single",
    name: "باقة الإعلان الواحد",
    price: 750,
    color: "red",
    image: "/ad-packages/single-red.jpg",
    tagline: "إعلان واحد احترافي من الفكرة حتى التسليم",
    features: [
      "فكرة وسكربت إعلاني مبني على منتجك وجمهورك",
      "تصوير احترافي بإضاءة سينمائية",
      "مونتاج كامل: قص وإيقاع وموسيقى وموشن جرافيك",
      "نسخة رئيسية + نسخة قصيرة جاهزة للنشر",
    ],
  },
  {
    id: "review",
    name: "باقة المراجعة الكاملة",
    price: 1000,
    color: "blue",
    image: "/ad-packages/review-blue.jpg",
    tagline: "مراجعة كاملة لمنتجك أو خدمتك تبني الثقة وتبيع",
    features: [
      "سكربت مراجعة يبرز مزايا المنتج بصدق ووضوح",
      "تصوير تفصيلي للمنتج + لقطات استخدام واقعية",
      "مونتاج متكامل مع جرافيك يبرز النقاط المهمة",
      "نسخة رئيسية + مقاطع قصيرة للمنصات",
    ],
  },
  {
    id: "triple",
    name: "باقة الـ٣ إعلانات",
    price: 1500,
    color: "yellow",
    badge: "الأوفر",
    image: "/ad-packages/triple-yellow.jpg",
    tagline: "ثلاثة إعلانات بسعر موفّر — لحملة متكاملة",
    features: [
      "٣ إعلانات بأفكار وزوايا مختلفة لمنتجك",
      "تصوير ومونتاج احترافي لكل إعلان",
      "تنوّع يخدم الحملة على أكثر من منصة",
      "نسخ رئيسية + نسخ قصيرة لكل إعلان",
    ],
  },
];

// ===== باقات حجز/تأجير الاستوديو =====
// «سجّل وامشِ»: تصوّر في المكان وتستلم اللقطات الخام وتكمل المونتاج بنفسك.
// الأسعار معتمدة من إبراهيم — عدّلها من هنا متى احتجت.
// price: بالريال السعودي. unit: وحدة السعر (ساعة / الجلسة …).
export type StudioRentalPackage = {
  id: string;
  name: string;
  price: number;
  unit: string;
  tagline: string;
  includes: string[];
  badge?: string;
};

export const studioRentalNote =
  "تصوّر في الاستوديو المجهّز وتستلم اللقطات الخام كاملة، وتكمل المونتاج بنفسك. مناسب لصنّاع المحتوى والبودكاست والإعلانات.";

export const studioRental: StudioRentalPackage[] = [
  {
    id: "hour",
    name: "ساعة تصوير",
    price: 150,
    unit: "للساعة",
    tagline: "ابدأ بأقل تكلفة — ادفع بالساعة",
    includes: [
      "استوديو مجهّز بالكامل (إضاءة + صوت + خلفيات)",
      "كاميرات ومايكات الاستوديو جاهزة للتصوير",
      "تستلم اللقطات الخام (RAW) على ذاكرتك",
      "طاقم مساند للإعداد والتشغيل",
    ],
  },
  {
    id: "half-day",
    name: "نصف يوم — ٤ ساعات",
    price: 500,
    unit: "للجلسة",
    badge: "الأنسب",
    tagline: "وقت مريح لتصوير محتوى متعدّد",
    includes: [
      "٤ ساعات تصوير متواصلة في الاستوديو",
      "كل معدّات الاستوديو (كاميرات + إضاءة + صوت)",
      "تستلم اللقطات الخام كاملة",
      "إعادة ترتيب المشهد بين المقاطع",
    ],
  },
  {
    id: "full-day",
    name: "يوم كامل — ٨ ساعات",
    price: 900,
    unit: "لليوم",
    tagline: "للإنتاج المكثّف وتصوير حلقات/إعلانات متعدّدة",
    includes: [
      "٨ ساعات تصوير في الاستوديو",
      "كل المعدّات تحت تصرّفك طوال اليوم",
      "تستلم اللقطات الخام كاملة",
      "أنسب سعر للساعة ضمن الباقات",
    ],
  },
];

// ===== جولة الاستوديو التفاعلية — عناصر المشهد =====
// x/y نِسَب مئوية لموضع النقطة فوق صورة المشهد (studio/tour/stage.jpg).
export type TourItem = {
  file: string;
  title: string;
  x: number;
  y: number;
  text: string;
};

export const studioStage = "/studio/tour/stage.jpg";

export const studioTour: TourItem[] = [
  { file: "/studio/tour/item-0.jpg", title: "الإضاءة العلوية", x: 49, y: 7, text: "سوفت بوكس كبير معلّق فوق الكادر يعطي إضاءة ناعمة ومتساوية على الوجوه بلا ظلال حادة. مصدر الإضاءة الأساسي في الأستديو." },
  { file: "/studio/tour/item-1.jpg", title: "إضاءة الحائط", x: 40, y: 33, text: "إضاءة زرقاء تغسل الستائر فتمنح الخلفية عمقاً ولوناً، وتفصل الضيف عن الجدار. اجعلها أخفت من إضاءة الوجه." },
  { file: "/studio/tour/item-2.jpg", title: "الأباجورة", x: 89, y: 22, text: "إضاءة دافئة داخل الكادر تكسر برودة الإضاءة وتعطي إحساساً منزلياً مريحاً، وتملأ الجانب المظلم من الوجه." },
  { file: "/studio/tour/item-3.jpg", title: "مايك المقدّم", x: 65, y: 50, text: "مايك بثّ احترافي على ذراع متحرّك. ثبّت الزاوية نفسها في كل حلقة لاتساق الصوت، على بُعد قبضة من الفم." },
  { file: "/studio/tour/item-4.jpg", title: "مايك الضيف", x: 42, y: 50, text: "مايك بثّ على ذراع أمام الضيف. اضبط مستواه من المكسر قبل التسجيل وحافظ على ثبات المسافة لصوت نقي." },
  { file: "/studio/tour/item-5.jpg", title: "المكسر — RODECaster Pro II", x: 58, y: 73, text: "قلب الأستديو الصوتي: يجمع المايكات، يتحكّم بالمستويات والمؤثرات لحظياً، ويسجّل كل صوت في مسار منفصل لمونتاج أنظف." },
  { file: "/studio/tour/item-6.jpg", title: "الآيباد", x: 61, y: 60, text: "لعرض محاور الحلقة والملاحظات أثناء التصوير، ومتابعة الوقت دون أوراق في الكادر." },
  { file: "/studio/tour/item-7.jpg", title: "كرسي الضيف", x: 25, y: 75, text: "كرسي خشبي مريح يسار الكادر، يوضع بزاوية بسيطة نحو المقدّم لحوار طبيعي ولغة جسد مريحة." },
  { file: "/studio/tour/item-8.jpg", title: "كرسي المقدّم", x: 80, y: 72, text: "كرسي المقدّم يمين الكادر، ارتفاعه يناسب مستوى المايك والكاميرا لإطار ثابت ومتّزن." },
  { file: "/studio/tour/item-9.jpg", title: "الكنب الأصفر", x: 96, y: 91, text: "لمسة لونية حيوية تكسر رتابة المشهد، ومكان مثالي للقطات B-roll أو افتتاحية غير رسمية." },
];

// ===== الجمهور والبرسونا — مَن أخدمهم =====
// قسمان رئيسيان لكل واحد طابعه وأسعاره ونوع المقاطع، وتحته «برسونا»
// لأصحاب القرار الفعليين. عدّل النصوص والأسماء من هنا، وتنعكس على الموقع.
export type AudienceSegment = {
  id: Audience;
  icon: "building" | "store"; // أيقونة القسم
  label: string; // اسم القسم
  tagline: string; // جملة تعريفية قصيرة
  size: string; // حجم الجهة/الشركة
  budget: string; // طبيعة الميزانية والأسعار
  priceNote: string; // سطر السعر المختصر (شارة)
  needs: string[]; // ايش تحتاج هذه الفئة
  why: string[]; // ليش تحتاجني
  adStyle: string; // طابع المقاطع الإعلانية لهذه الفئة
  clients: string[]; // أمثلة عملاء من هذه الفئة
  cta: string; // نص رسالة واتساب لهذه الفئة
};

export const audiences: AudienceSegment[] = [
  {
    id: "companies",
    icon: "building",
    label: "الشركات والجهات",
    tagline: "طابع رسمي، ميزانيات تسويق مرصودة، ورسالة مؤسسية تبني الثقة.",
    size: "شركات متوسطة وكبيرة، جهات حكومية، جمعيات، وجامعات.",
    budget: "ميزانية تسويق سنوية مرصودة — الجودة والمصداقية تسبق السعر.",
    priceNote: "تسعير مشاريع حسب نطاق العمل",
    needs: [
      "أفلام مؤسسية وتعريفية تليق بالعلامة",
      "تغطية فعاليات ومؤتمرات وهاكاثونات",
      "هوية بصرية متحركة (موشن جرافيك)",
      "محتوى رسمي للتقارير والمناسبات الوطنية",
    ],
    why: [
      "خبرة في الأعمال السينمائية والمؤسسية (هيلثون، ريناد المجد).",
      "إدارة إنتاج كاملة: فكرة، تصوير، درون، تعليق صوتي، مونتاج.",
      "التزام بالطابع الرسمي ومواعيد التسليم والهوية المعتمدة.",
    ],
    adStyle:
      "أفلام سينمائية وتغطيات بإيقاع راقٍ وهوية متحركة — رصانة لا قص صاخب.",
    clients: [
      "جامعة الملك سعود",
      "ريناد المجد",
      "الهيئة العامة للنقل",
      "إجادة التقنية",
      "جمعية خير لتحفيظ القرآن",
    ],
    cta: "السلام عليكم، أنا من شركة/جهة وأبي إنتاج فيديو مؤسسي 🎬",
  },
  {
    id: "stores",
    icon: "store",
    label: "المتاجر الإلكترونية",
    tagline: "استهداف دقيق، مقاطع إعلانية تبيع، وسعر يناسب هامش المتجر.",
    size: "رواد أعمال وأصحاب متاجر — متجر واحد أو أكثر من متجر/علامة.",
    budget: "ميزانية أداء مرنة — كل ريال لازم يرجع مبيعات.",
    priceNote: "باقات جاهزة بأسعار أقل — تبدأ من ٧٥٠ ريال",
    needs: [
      "إعلانات منتجات ومراجعات تبني الثقة وتبيع",
      "مقاطع قصيرة عمودية للريلز والتيك توك",
      "هوك في أول ثانية يوقف التمرير",
      "نسخ متعددة لكل منصة وحملات الإطلاق",
    ],
    why: [
      "أعرف لغة المتاجر وجمهورها (فيه ستور، TAD).",
      "أصنع هوك سريع ونسخ عمودية جاهزة لكل منصة.",
      "أسعار أقل وباقات جاهزة تناسب هامش المتجر.",
    ],
    adStyle:
      "هوك سريع، إيقاع عالٍ، نسخ عمودية للمنصات، ودعوة شراء واضحة.",
    clients: ["فيه ستور (feeh store)", "متجر TAD"],
    cta: "السلام عليكم، عندي متجر إلكتروني وأبي مقاطع إعلانية تبيع 🛒",
  },
];
