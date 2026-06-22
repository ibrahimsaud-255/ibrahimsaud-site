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
export type Work = {
  id: string;
  client: string;
  title: string;
  category: string;
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
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "مقطع قصير تعريفي بمنتج شاحن السفر، جاهز للنشر على المنصات.",
    videoUrl: "https://www.youtube.com/shorts/hzGpY3rvj0w",
  },
  {
    id: "tad-short-2",
    client: "متجر TAD",
    title: "شاحن السفر — مقطع قصير ٢",
    category: "إعلانات منتجات",
    roles: ["فكرة", "تصوير", "مونتاج"],
    desc: "مقطع قصير ثانٍ ضمن حملة شاحن السفر، بزاوية مختلفة.",
    videoUrl: "https://www.youtube.com/shorts/VG-Wk9eKcMo",
  },
  {
    id: "tad-bts",
    client: "متجر TAD",
    title: "شاحن السفر — كواليس التصوير",
    category: "إعلانات منتجات",
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
    roles: ["فكرة", "تقديم", "تصوير", "مونتاج"],
    desc: "تغطية لموسم الرياضات الإلكترونية من بوليفارد الرياض — تقديم وتصوير ومونتاج.",
    videoUrl: "https://www.youtube.com/shorts/y9EnZUF3BH8",
  },
  {
    id: "blvd-2",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — مقابلات شارع",
    category: "مقابلات الشارع",
    roles: ["تقديم", "تصوير", "مونتاج"],
    desc: "مقابلات شارع مع الزوّار في موسم الرياضات الإلكترونية.",
    videoUrl: "https://www.youtube.com/shorts/5g_2DYu7Gu8",
  },
  {
    id: "blvd-3",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — لقاء لينوفو",
    category: "مقابلات الشارع",
    roles: ["تقديم", "تصوير", "مونتاج"],
    desc: "مقطع مع لينوفو ضمن تغطية البوليفارد.",
    videoUrl: "https://www.youtube.com/shorts/8I_ULf59_K8",
  },
  {
    id: "blvd-4",
    client: "متجر فيه ستور (feeh store)",
    title: "البوليفارد — فلوق الجولة",
    category: "مقابلات الشارع",
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
    ytId: "hZbfphE2tM4",
    href: "https://www.youtube.com/watch?v=hZbfphE2tM4",
  },
  {
    title: "رقمنة — التقنية والذكاء الاصطناعي",
    desc: "برنامج من ١٥ حلقة عن التقنية والذكاء الاصطناعي، مع المهندس أحمد الزيادات.",
    meta: "١٥ حلقة",
    year: "٢٠٢٤",
    ytId: "inCmiqVSnIQ",
    href: "https://www.youtube.com/watch?v=inCmiqVSnIQ&list=PL3BjsAHgaCzbaadRYhtrDqcMLaBT5nBVF",
  },
  {
    title: "آخر فقرة — شرح كتب",
    desc: "شرح كتب حلقة حلقة: «صناعة المستهلك» و«متلازمة التيك توك».",
    meta: "موسمان",
    year: "٢٠٢٣",
    ytId: "iU9dl6OCejQ",
    href: "https://www.youtube.com/watch?v=iU9dl6OCejQ&list=PL3BjsAHgaCzbr5W9nN8YL6rDf4tkvG2Kn",
  },
  {
    title: "بودكاست يا غلام",
    desc: "بودكاست حواري — تقديم وإعداد، بالتعاون مع قناة فلق والمدونة استديو.",
    year: "٢٠٢٣",
    ytId: "h9WQT7gMP6E",
    href: "https://www.youtube.com/watch?v=h9WQT7gMP6E&list=PLWFi7GIBTmLJrXIWM6PlYEHOy-LDA4rRg",
  },
  {
    title: "في الخاطر — برنامج ساخر",
    desc: "برنامج قصير ساخر يتكلّم عن أشياء «في الخاطر».",
    meta: "٤ حلقات",
    year: "٢٠٢٢",
    ytId: "38fVZn6OX1U",
    href: "https://www.youtube.com/watch?v=38fVZn6OX1U&list=PL3BjsAHgaCzaYHMoLnjODgHrlaXFCizSe",
  },
  {
    title: "قِوت — إنتاج تجريبي",
    desc: "برنامج أنتجنا منه حلقتين ومقاطع تشويقية.",
    year: "٢٠٢٢",
    ytId: "FrTmum7RIbw",
    href: "https://www.youtube.com/watch?v=FrTmum7RIbw&list=PL3BjsAHgaCzYb3XwijX4iIQj5unA4RrmL",
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

// مخرجات مشتركة لكل حلقة (تُعرض مرة واحدة لأنها تنطبق على الباقتين)
export const packageDeliverables: string[] = [
  "فيديو مسجّل كامل للحلقة بجودة عالية",
  "١٠ مقاطع قصيرة (مقتطفات) جاهزة للنشر",
  "تصاميم الحلقة: صورة الثمنيل + صور مقتطفات (كاروسيل) للضيف والمقدّم + صورة إعلان عن الضيف",
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
