// ===== إعدادات الموقع الأساسية =====
// عدّل القيم هنا فقط؛ تنعكس على كل الموقع.

export const site = {
  name: "إبراهيم سعود",
  tagline: "أصنع إعلانات تبيع",
  bio: "إبراهيم سعود | تقنية أعمال بودكاست",
  whatsapp: "966504895213", // بدون + وبدون أصفار، صيغة دولية
  email: "ibrahimsaud25@gmail.com",
  domain: "ibrahimsaud.com",
  social: {
    tiktok: "https://www.tiktok.com/@ibrahimsaud", // ← عدّل الرابط
    instagram: "", // ← أضف لو تبي
    youtube: "", // ← أضف لو تبي
    x: "",
  },
  // روابط مشاريعك الأخرى (تظهر كبطاقات منفصلة)
  ventures: [
    {
      title: "بودكاست سَعي + الاستديو",
      desc: "بودكاست، استديو للتأجير، ومساحة لاستضافة الضيوف.",
      href: "https://sa3ypodcast.com/", // بودكاست سعي
      tag: "بودكاست",
    },
    {
      title: "حروف ودروس",
      desc: "تطبيق تقني — منتج رقمي أعمل عليه.",
      href: "https://huroofduroos.com/", // حروف ودروس
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
  {
    icon: "📣",
    title: "محتوى الحملة الكامل",
    desc: "كواليس، تجهيزات، ونسخ متعددة — جاهزة للنشر قبل وبعد الإطلاق.",
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
  {
    id: "healthon-open",
    client: "جامعة الملك سعود — هاكاثون هيلثون",
    title: "الفيديو الافتتاحي + الختامي",
    category: "فعاليات",
    roles: ["إخراج", "تصوير", "مونتاج"],
    desc: "مشروع متكامل لهاكاثون هيلثون بجامعة الملك سعود: هوية بصرية متحركة، فيلم افتتاحي يفتح الحدث، وفيلم ختامي يلخّص الإنجاز، إضافة لبوسترات، برومو، ولقطات مشاركين — من الفكرة حتى التسليم.",
    videos: [
      "https://youtu.be/WL-GJ4ZT7Cg",
      "https://youtu.be/7Vmq3eTWQwc",
    ],
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/هيلثون.jpg",
    featured: true,
  },
  {
    id: "rinad-tasis",
    client: "ريناد المجد",
    title: "فيلم يوم التأسيس",
    category: "مؤسسي / سينمائي",
    roles: ["كتابة النص", "تصوير درون", "تمثيل", "تعليق صوتي", "مونتاج"],
    desc: "فيلم سينمائي ليوم التأسيس بلقطات درون وتعليق صوتي ونص كامل — صنعته من الفكرة حتى التسليم، وكنت فيه الممثل والمعلّق والكاتب والمنتج.",
    videos: ["https://www.youtube.com/watch?v=EOOlRJgeT6Y"],
    logo: "/LOGO_RMG.png",
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/يوم%20التأسيس.jpg",
    featured: true,
  },
  {
    id: "feeh-store-campaign",
    client: "متجر فيه ستور (feeh store)",
    title: "الفيديو الرئيسي لحملة الموقع الجديد",
    category: "إعلان منتج / حملة",
    roles: ["فكرة", "إخراج", "تصوير", "مونتاج"],
    desc: "الفيديو الرئيسي لإطلاق الموقع الجديد، يبرز ميزة «اجمع جهازك بنفسك» — إنتاج بمستوى عالٍ ضمن حملة متكاملة شملت تصميم الموقع ومقاطع قصيرة داعمة.",
    videos: ["https://www.youtube.com/watch?v=Bg_9L6TKduc"],
  },
  {
    id: "feeh-store-ad",
    client: "متجر فيه ستور (feeh store)",
    title: "إعلان تمثيلي — على طريقة بريكنج باد",
    category: "إعلان / تمثيل",
    roles: ["فكرة", "إخراج", "تمثيل (بطولة)", "مونتاج"],
    desc: "إعلان درامي لمتجر تجميعات الكمبيوتر بأسلوب «بريكنج باد»: شخصية رئيسية تبيع الأجهزة من سيارتها وتُتمّ صفقاتها — كتبت الفكرة، وأخرجت، وكنت الممثل الأساسي في الإعلان.",
    videos: ["https://www.youtube.com/watch?v=HTojPu3baG8"],
  },
  {
    id: "tad-charger",
    client: "متجر TAD",
    title: "حملة شاحن السفر — ٣ زوايا",
    category: "إعلان منتج",
    roles: ["فكرة", "نص", "تصوير", "مونتاج"],
    desc: "حملة من عدة مقاطع لمنتج واحد: مقطع مصوّر من المغرب، ومقاطع حوارية وتعريفية أمام الكاميرا — استُخدمت في الحملات والتسويق، مع توثيق كواليس التصوير.",
    videos: [
      "https://www.youtube.com/shorts/hzGpY3rvj0w",
      "https://www.youtube.com/shorts/VG-Wk9eKcMo",
      "https://youtu.be/GcA8sjlQduI",
    ],
    bts: "https://youtu.be/2Og0FzpWbX4",
    thumb: "https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/TAD.jpg",
    featured: true,
  },
  {
    id: "store-boulevard",
    client: "متجر فيه ستور (feeh store)",
    title: "تغطية موسم الرياضات الإلكترونية — البوليفارد",
    category: "محتوى تفاعلي / تغطية",
    roles: ["فكرة", "تقديم", "تصوير", "مونتاج"],
    desc: "تغطية لموسم الرياضات الإلكترونية (EWC) من بوليفارد الرياض: مقابلات شارع، مقطع مع لينوفو، لقاء مع صانع المحتوى التقني فيصل السيف، وفلوق جولة في الفعاليات — تصوير وتعليق صوتي ومونتاج.",
    videos: [
      "https://www.youtube.com/shorts/y9EnZUF3BH8",
      "https://www.youtube.com/shorts/5g_2DYu7Gu8",
      "https://www.youtube.com/shorts/8I_ULf59_K8",
      "https://www.youtube.com/shorts/O-6Qm1vUET0",
    ],
  },
  {
    id: "raqmana-program",
    client: "برنامج رقمنة — مع م. أحمد الزيادات",
    title: "رقمنة — التقنية والذكاء الاصطناعي",
    category: "برنامج / إنتاج",
    roles: ["إنتاج"],
    desc: "برنامج من ١٥ حلقة يتناول التقنية والذكاء الاصطناعي، أعدّه وقدّمه المهندس أحمد الزيادات — وكنت المنتج للبرنامج.",
    videos: [
      "https://www.youtube.com/watch?v=inCmiqVSnIQ&list=PL3BjsAHgaCzbaadRYhtrDqcMLaBT5nBVF",
    ],
  },
  {
    id: "akher-faqra",
    client: "برنامج آخر فقرة",
    title: "آخر فقرة — شرح كتب",
    category: "برنامج / تقديم",
    roles: ["إعداد", "تقديم", "مونتاج"],
    desc: "برنامج أشرح فيه الكتب حلقةً حلقة: الموسم الأول لكتاب «صناعة المستهلك» (٩ حلقات)، والموسم الثاني لكتاب «متلازمة التيك توك» (٦ حلقات).",
    videos: [
      "https://www.youtube.com/watch?v=iU9dl6OCejQ&list=PL3BjsAHgaCzbr5W9nN8YL6rDf4tkvG2Kn",
      "https://www.youtube.com/watch?v=wOsdAQfbBTg&list=PL3BjsAHgaCzZKne5praOAmlaGJEDmbqIS",
    ],
  },
  {
    id: "ya-ghulam-podcast",
    client: "بودكاست يا غلام — بالتعاون مع قناة فلق والمدونة استديو",
    title: "بودكاست يا غلام",
    category: "بودكاست",
    roles: ["إعداد", "تقديم"],
    desc: "بودكاست «يا غلام» — كنت المقدّم والمُعِدّ، بالتعاون مع قناة فلق والمدونة استديو.",
    videos: [
      "https://www.youtube.com/watch?v=h9WQT7gMP6E&list=PLWFi7GIBTmLJrXIWM6PlYEHOy-LDA4rRg",
    ],
  },
  {
    id: "fee-alkhatir",
    client: "برنامج في الخاطر",
    title: "في الخاطر — برنامج ساخر",
    category: "كوميدي / ساخر",
    roles: ["فكرة", "تقديم", "مونتاج"],
    desc: "برنامج قصير ساخر يتناول «أشياء في الخاطر» — أنتجت منه ٤ حلقات قبل التوقّف.",
    videos: [
      "https://www.youtube.com/watch?v=38fVZn6OX1U&list=PL3BjsAHgaCzaYHMoLnjODgHrlaXFCizSe",
    ],
  },
  {
    id: "qoot-program",
    client: "برنامج قِوت",
    title: "قِوت — إنتاج تجريبي",
    category: "برنامج / إنتاج",
    roles: ["إنتاج"],
    desc: "برنامج جديد أنتجنا منه حلقتين ومقطعًا ترحيبيًا للمقدّم ومقطعًا دعائيًا تشويقيًا — توقّف لعدم اكتمال التمويل.",
    videos: [
      "https://www.youtube.com/watch?v=FrTmum7RIbw&list=PL3BjsAHgaCzYb3XwijX4iIQj5unA4RrmL",
    ],
  },
  {
    id: "wedding-film",
    client: "مناسبة خاصة",
    title: "فيلم زواج",
    category: "مناسبات / زواج",
    roles: ["تصوير", "مونتاج"],
    desc: "توثيق سينمائي لمناسبة زواج — تصوير ومونتاج يحفظ لحظات اليوم بأسلوب راقٍ.",
    videos: ["https://youtu.be/IIArrpuGomk"],
  },
];

// ===== العلامات التجارية (الشركات اللي اشتغلت معها) =====
// أضف كل شعار: ارفع الصورة في مجلد public ثم اكتب مسارها هنا.
// مثال: { name: "اسم الشركة", logo: "/logo-company.png" },
export const brands: { name: string; logo: string }[] = [
  { name: "ريناد المجد", logo: "/LOGO_RMG.png" },
  { name: "وكونترا", logo: "/LOGO_kwentra.png" },
  { name: "درفت تايم", logo: "/LOGO_3_drift_time.png" },
];
