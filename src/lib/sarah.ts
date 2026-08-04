// ===================================================================
// متجر «إبرة سارة» — ملف الإعدادات الوحيد
// كل شيء في المتجر (المنتجات، الأسعار، الصور، الخامات، الألوان،
// المقاسات، الشحن، بيانات التحويل البنكي) يُعدَّل من هنا فقط.
// راجع: دليل-متجر-إبرة-سارة.md
// ===================================================================

// ------------------------- بيانات المتجر -------------------------
export const sarah = {
  name: "إبرة سارة",
  tagline: "خياطة وتفصيل نسائي على مقاسك",
  intro:
    "قطعة واحدة تُخاط لك أنتِ: تختارين الخامة واللون والمقاس، ونخيطها بمقاسات عالمية معتمدة أو على مقاسك أنتِ بالضبط.",
  // رقم واتساب المتجر بصيغة دولية بدون + وبدون أصفار  ← عدّليه
  whatsapp: "966534801109",
  instagram: "", // مثال: https://instagram.com/ebrat.sarah
  snapchat: "",
  tiktok: "",
  city: "الرياض",
  workHours: "السبت – الخميس، ١٠ص – ٩م",
  // مدة التنفيذ الافتراضية (تظهر في الهيرو والأسئلة)
  leadTime: "٥–٧ أيام عمل",
  // إشعار مؤقت أعلى الموقع (اتركيه فارغاً "" لإخفائه)
  notice:
    "نسخة أولية من متجر «إبرة سارة» — الصور والأسعار قابلة للتحديث، والطلب حالياً يتم عبر واتساب والتحويل البنكي.",
} as const;

// --------------------- بيانات التحويل البنكي ---------------------
// تظهر للعميلة بعد تجهيز الطلب. عدّلي القيم ثم ارفعي الموقع.
export const bank = {
  bankName: "مصرف الراجحي",
  accountName: "إبرة سارة",
  iban: "SA00 0000 0000 0000 0000 0000",
  note: "التحويل بنفس الاسم غير مطلوب، لكن يلزم إرسال صورة الإيصال عبر واتساب لتأكيد الطلب.",
} as const;

// ------------------------- وسائل الدفع -------------------------
// cardsEnabled: false ← تظهر شعارات مدى/فيزا/ماستركارد بوسم «قريباً»
// حوّليها إلى true فقط بعد ربط بوابة دفع أو اعتماد روابط دفع فعلية.
export const payments = {
  cardsEnabled: false,
} as const;

export function waLink(message: string) {
  return `https://wa.me/${sarah.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function sar(n: number) {
  return `${n.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س`;
}

// ===================================================================
//                       المقاسات العالمية
// المرجع: جداول التحويل العالمية المعتمدة (INT / EU / UK / US / FR / IT)
// القاعدة: US = EU − 32   |   UK = US + 4   |   AU = UK
// القياسات بالسنتيمتر على الجسم (وليس على القطعة).
// ===================================================================
export type AlphaSize = {
  intl: string; // المقاس العالمي بالحروف
  eu: string;
  uk: string;
  us: string;
  fr: string;
  it: string;
  bust: [number, number]; // محيط الصدر
  waist: [number, number]; // محيط الخصر
  hips: [number, number]; // محيط الأرداف
};

export const alphaSizes: AlphaSize[] = [
  { intl: "XS", eu: "34", uk: "6", us: "2", fr: "36", it: "38", bust: [78, 82], waist: [60, 64], hips: [86, 90] },
  { intl: "S", eu: "36", uk: "8", us: "4", fr: "38", it: "40", bust: [83, 87], waist: [65, 69], hips: [91, 95] },
  { intl: "M", eu: "38", uk: "10", us: "6", fr: "40", it: "42", bust: [88, 93], waist: [70, 75], hips: [96, 101] },
  { intl: "L", eu: "40", uk: "12", us: "8", fr: "42", it: "44", bust: [94, 99], waist: [76, 82], hips: [102, 107] },
  { intl: "XL", eu: "42", uk: "14", us: "10", fr: "44", it: "46", bust: [100, 106], waist: [83, 89], hips: [108, 114] },
  { intl: "2XL", eu: "44", uk: "16", us: "12", fr: "46", it: "48", bust: [107, 114], waist: [90, 97], hips: [115, 122] },
  { intl: "3XL", eu: "46", uk: "18", us: "14", fr: "48", it: "50", bust: [115, 122], waist: [98, 105], hips: [123, 130] },
  { intl: "4XL", eu: "48", uk: "20", us: "16", fr: "50", it: "52", bust: [123, 130], waist: [106, 113], hips: [131, 138] },
];

// المقاس المقترح من قياس الصدر/الخصر/الورك (يُستخدم في «حدّدي مقاسك»)
export function suggestSize(bust: number, waist: number, hips: number) {
  const score = (s: AlphaSize) => {
    const d = (v: number, r: [number, number]) =>
      v < r[0] ? r[0] - v : v > r[1] ? v - r[1] : 0;
    // الصدر والورك أهم من الخصر في التفصيل النسائي
    return d(bust, s.bust) * 1.2 + d(hips, s.hips) * 1.1 + d(waist, s.waist) * 0.8;
  };
  return [...alphaSizes].sort((a, b) => score(a) - score(b))[0];
}

// ----------- مقاسات الأطوال للعبايات والجلابيات (بالبوصة) -----------
// المقاس هنا = الطول الكلي من أعلى الكتف حتى الطرف السفلي، وهو النظام
// العالمي المتّبع للعبايات (٥٢ إلى ٦٠)، ويُختار حسب طول الجسم.
export type LengthSize = {
  size: string; // بالبوصة
  cm: number; // الطول بالسنتيمتر
  height: [number, number]; // طول الجسم المناسب (سم)
  heightFt: string; // بالأقدام للمرجع العالمي
};

export const lengthSizes: LengthSize[] = [
  { size: "52", cm: 132, height: [150, 157], heightFt: "4'11\" – 5'2\"" },
  { size: "54", cm: 137, height: [158, 163], heightFt: "5'3\" – 5'4\"" },
  { size: "56", cm: 142, height: [164, 169], heightFt: "5'5\" – 5'6\"" },
  { size: "58", cm: 147, height: [170, 174], heightFt: "5'7\" – 5'8\"" },
  { size: "60", cm: 152, height: [175, 183], heightFt: "5'9\" – 6'0\"" },
];

export function suggestLength(heightCm: number) {
  return (
    lengthSizes.find((l) => heightCm >= l.height[0] && heightCm <= l.height[1]) ??
    (heightCm < 150 ? lengthSizes[0] : lengthSizes[lengthSizes.length - 1])
  );
}

// ---------------- قياسات التفصيل على المقاس (ISO 8559) ----------------
// نقاط القياس العالمية المعتمدة في التفصيل. تظهر كحقول في نموذج الطلب.
export type MeasureField = { key: string; label: string; hint: string; required?: boolean };

export const customMeasures: MeasureField[] = [
  { key: "height", label: "الطول الكلي للجسم", hint: "سم — واقفة بدون كعب", required: true },
  { key: "bust", label: "محيط الصدر", hint: "سم — عند أوسع نقطة", required: true },
  { key: "underbust", label: "محيط تحت الصدر", hint: "سم" },
  { key: "waist", label: "محيط الخصر", hint: "سم — أضيق نقطة", required: true },
  { key: "hips", label: "محيط الأرداف", hint: "سم — أوسع نقطة", required: true },
  { key: "shoulder", label: "عرض الكتف", hint: "سم — من كتف لكتف" },
  { key: "sleeve", label: "طول الكم", hint: "سم — من الكتف حتى المعصم" },
  { key: "armhole", label: "محيط أعلى الذراع", hint: "سم" },
  { key: "backLength", label: "طول الظهر حتى الخصر", hint: "سم" },
  { key: "garmentLength", label: "الطول المطلوب للقطعة", hint: "سم — من الكتف حتى الطرف", required: true },
  { key: "neck", label: "محيط الرقبة", hint: "سم" },
];

// ===================================================================
//                    خامات المورد (Fabrics)
// كل خامة لها: صورة (خانة جاهزة) + فرق سعر + ألوان متوفرة + وصف أمر
// الذكاء الاصطناعي لتوليد صورة الخامة (aiPrompt).
// الصور تُرفع في: public/sarah/fabrics/<id>.webp
// ===================================================================
export type Fabric = {
  id: string;
  name: string;
  en: string;
  desc: string;
  priceDelta: number; // يُضاف على سعر القطعة (٠ = مشمول)
  colors: string[];
  image?: string; // اتركيه فارغاً حتى ترفعي الصورة
  aiPrompt: string; // أمر توليد الصورة بالذكاء الاصطناعي
};

export const fabrics: Fabric[] = [
  {
    id: "nida",
    name: "نيدا فرنسي",
    en: "French Nida",
    desc: "الخامة القياسية للعبايات: مطفية، ثقيلة نسبياً، لا تشفّ ولا تتجعّد.",
    priceDelta: 0,
    colors: ["أسود", "كحلي", "رمادي فحمي", "بني داكن"],
    image: "/sarah/fabrics/nida.svg",
    aiPrompt:
      "Studio macro photograph of matte black French Nida fabric, heavy opaque crepe weave, soft even folds, neutral beige background, natural soft light, high detail texture, 1:1 square, photorealistic.",
  },
  {
    id: "japanese-crepe",
    name: "كريب ياباني",
    en: "Japanese Crepe",
    desc: "انسدال فخم وثِقل مريح — الأفضل للعبايات والفساتين الرسمية.",
    priceDelta: 60,
    colors: ["أسود", "كحلي", "زيتي", "خمري", "بيج رملي"],
    image: "/sarah/fabrics/japanese-crepe.svg",
    aiPrompt:
      "Studio macro photograph of Japanese crepe fabric in deep olive, fine pebbled texture, luxurious drape with soft vertical folds, warm neutral background, soft diffused light, 1:1 square, photorealistic.",
  },
  {
    id: "silk-satin",
    name: "ساتان حرير",
    en: "Silk Satin",
    desc: "لمعة ناعمة وملمس بارد — للفساتين والقفاطين والأطقم المنزلية.",
    priceDelta: 120,
    colors: ["أوف وايت", "وردي مغبر", "خمري", "أزرق ملكي", "ذهبي شامبين"],
    image: "/sarah/fabrics/silk-satin.svg",
    aiPrompt:
      "Studio macro photograph of champagne gold silk satin, glossy liquid sheen, elegant flowing folds, soft highlights and shadows, cream background, 1:1 square, photorealistic.",
  },
  {
    id: "chiffon",
    name: "شيفون حرير",
    en: "Silk Chiffon",
    desc: "خفيف وشفّاف — يُستخدم طبقات مع بطانة كاملة.",
    priceDelta: 80,
    colors: ["أوف وايت", "بيج رملي", "وردي مغبر", "أسود", "سماوي"],
    image: "/sarah/fabrics/chiffon.svg",
    aiPrompt:
      "Studio macro photograph of dusty rose silk chiffon, sheer airy layers, delicate translucent folds floating, soft white background, backlit, 1:1 square, photorealistic.",
  },
  {
    id: "linen",
    name: "كتان مخلوط",
    en: "Linen Blend",
    desc: "خامة صيفية تتنفّس — للجلابيات اليومية والقمصان والتنانير.",
    priceDelta: 40,
    colors: ["بيج رملي", "أبيض", "زيتي", "أزرق باهت", "رمادي فاتح"],
    image: "/sarah/fabrics/linen.svg",
    aiPrompt:
      "Studio macro photograph of natural sand beige linen blend fabric, visible woven slub texture, relaxed folds, warm daylight, minimal neutral background, 1:1 square, photorealistic.",
  },
  {
    id: "velvet",
    name: "مخمل",
    en: "Velvet",
    desc: "وبَر قصير وعمق لوني — لفساتين وقفاطين المناسبات الشتوية.",
    priceDelta: 150,
    colors: ["خمري", "أخضر زمردي", "كحلي", "أسود", "بنفسجي"],
    image: "/sarah/fabrics/velvet.svg",
    aiPrompt:
      "Studio macro photograph of emerald green velvet fabric, short dense pile catching light, rich depth and sheen variation, dark neutral background, dramatic soft light, 1:1 square, photorealistic.",
  },
  {
    id: "embroidered-lace",
    name: "دانتيل مطرّز",
    en: "Embroidered Lace",
    desc: "تطريز شبكي فاخر — يُركّب كطبقة على الأكمام أو الصدر أو القطعة كاملة.",
    priceDelta: 220,
    colors: ["أوف وايت", "أسود", "شامبين", "وردي"],
    image: "/sarah/fabrics/embroidered-lace.svg",
    aiPrompt:
      "Studio macro photograph of off-white embroidered floral lace fabric, fine tulle net base, raised thread embroidery, delicate scalloped edge, soft cream background, 1:1 square, photorealistic.",
  },
  {
    id: "beaded-tulle",
    name: "تُل مطرّز بالخرز",
    en: "Beaded Tulle",
    desc: "خرز وكريستال مخيَّط يدوياً على تُل — لفساتين السهرة والزفاف.",
    priceDelta: 350,
    colors: ["أوف وايت", "شامبين", "فضي", "أسود"],
    image: "/sarah/fabrics/beaded-tulle.svg",
    aiPrompt:
      "Studio macro photograph of champagne beaded tulle fabric, hand-sewn crystals and pearls catching light, sheer net base, sparkling highlights, soft dark background, 1:1 square, photorealistic.",
  },
  {
    id: "egyptian-cotton",
    name: "قطن مصري",
    en: "Egyptian Cotton",
    desc: "قطن طويل التيلة — للأطقم المنزلية والقمصان المريحة.",
    priceDelta: 30,
    colors: ["أبيض", "بيج", "سماوي", "وردي فاتح", "رمادي"],
    image: "/sarah/fabrics/egyptian-cotton.svg",
    aiPrompt:
      "Studio macro photograph of white Egyptian cotton fabric, fine smooth weave, crisp soft folds, bright natural light, clean white background, 1:1 square, photorealistic.",
  },
  {
    id: "georgette",
    name: "جورجيت",
    en: "Georgette",
    desc: "خفيف ومتين وحركته جميلة — للجلابيات والفساتين اليومية.",
    priceDelta: 50,
    colors: ["أسود", "كحلي", "زيتي", "بيج رملي", "خمري"],
    image: "/sarah/fabrics/georgette.svg",
    aiPrompt:
      "Studio macro photograph of navy georgette fabric, lightweight crinkled surface, fluid rippling drape, soft neutral background, diffused studio light, 1:1 square, photorealistic.",
  },
];

export const fabricById = (id: string) => fabrics.find((f) => f.id === id);

// ===================================================================
//                         الإضافات (Add-ons)
// ===================================================================
export type AddOn = { id: string; label: string; price: number; desc: string };

export const addOns: AddOn[] = [
  { id: "hand-embroidery", label: "تطريز يدوي", price: 150, desc: "تطريز على الأكمام أو الصدر أو الأطراف." },
  { id: "beads", label: "خرز وكريستال", price: 200, desc: "تفاصيل خرز مخيَّطة يدوياً." },
  { id: "full-lining", label: "بطانة كاملة", price: 80, desc: "بطانة داخلية للخامات الخفيفة أو الشفّافة." },
  { id: "belt", label: "حزام من نفس الخامة", price: 60, desc: "حزام مفصّل على القطعة." },
  { id: "rush", label: "تنفيذ سريع (٤٨ ساعة)", price: 120, desc: "أولوية في التنفيذ والتسليم." },
  { id: "gift-wrap", label: "تغليف هدية", price: 25, desc: "علبة وتغليف وبطاقة إهداء." },
];

export const addOnById = (id: string) => addOns.find((a) => a.id === id);

// ===================================================================
//                          المنتجات
// sizing: "alpha"  = مقاسات عالمية بالحروف (XS…4XL)
//         "length" = مقاسات الطول للعبايات (٥٢…٦٠)
//         "custom" = تفصيل على المقاس فقط
// images: خانات الصور — ارفعي الصور في public/sarah/products/
//         واتركي الخانة "" حتى ذلك الحين (يظهر مكان الصورة تلقائياً).
// ===================================================================
export type Product = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  desc: string;
  price: number; // السعر الأساسي (يبدأ من)
  oldPrice?: number;
  days: string; // مدة التنفيذ
  sizing: "alpha" | "length" | "custom";
  fabrics: string[]; // معرّفات الخامات المتاحة
  addOns: string[]; // معرّفات الإضافات المتاحة
  images: string[]; // خانات الصور (٤ خانات لكل منتج)
  aiPrompt: string; // أمر توليد صور المنتج بالذكاء الاصطناعي
  featured?: boolean;
  includes: string[]; // ما يشمله السعر
};

export const categories = [
  { id: "abaya", name: "عبايات" },
  { id: "dress", name: "فساتين" },
  { id: "jalabiya", name: "جلابيات وقفاطين" },
  { id: "daily", name: "قطع يومية" },
  { id: "service", name: "خدمات تعديل" },
] as const;

export const products: Product[] = [
  {
    id: "abaya-classic",
    name: "عباية تفصيل كلاسيك",
    category: "abaya",
    tagline: "قَصّة مستقيمة أنيقة بخامة تختارينها",
    desc: "عباية مفصّلة بقَصّة كلاسيكية مستقيمة، أكمام واسعة أو ضيقة حسب طلبك، مع خياطة داخلية مُنظّفة بالكامل. المقاس بنظام الأطوال العالمي (٥٢–٦٠) حسب طولك.",
    price: 450,
    days: "٥–٧ أيام",
    sizing: "length",
    fabrics: ["nida", "japanese-crepe", "georgette", "linen"],
    addOns: ["hand-embroidery", "beads", "full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/abaya-classic-1.svg", "/sarah/products/abaya-classic-2.svg", "/sarah/products/abaya-classic-3.svg", "/sarah/products/abaya-classic-4.svg"],
    aiPrompt:
      "Editorial fashion photograph of an elegant black tailored abaya on a faceless mannequin, straight classic cut, matte crepe fabric with beautiful drape, warm sand-beige studio backdrop, soft directional light, full length, 4:5 portrait, photorealistic, luxury modest fashion catalog.",
    featured: true,
    includes: ["استشارة قَصّة ولون", "خياطة داخلية منظّفة", "كي وتغليف", "تعديل مقاس مجاني بعد الاستلام"],
  },
  {
    id: "abaya-embroidered",
    name: "عباية مطرّزة",
    category: "abaya",
    tagline: "تطريز يدوي على الأكمام والأطراف",
    desc: "عباية بتطريز يدوي مصمّم خصيصاً — تختارين موضع التطريز (أكمام / أطراف / صدر) ولونه. مناسبة للمناسبات والدوام الرسمي.",
    price: 690,
    days: "٧–١٠ أيام",
    sizing: "length",
    fabrics: ["nida", "japanese-crepe", "silk-satin", "georgette"],
    addOns: ["beads", "full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/abaya-embroidered-1.svg", "/sarah/products/abaya-embroidered-2.svg", "/sarah/products/abaya-embroidered-3.svg", "/sarah/products/abaya-embroidered-4.svg"],
    aiPrompt:
      "Editorial fashion photograph of a black abaya with delicate gold hand embroidery on the sleeves and hem, on a faceless mannequin, luxurious crepe fabric, cream studio backdrop, soft golden light, full length, 4:5 portrait, photorealistic, luxury modest fashion catalog.",
    featured: true,
    includes: ["تصميم نقشة التطريز معك", "تطريز يدوي", "كي وتغليف", "تعديل مقاس مجاني بعد الاستلام"],
  },
  {
    id: "abaya-prayer",
    name: "عباية صلاة",
    category: "abaya",
    tagline: "قطعة واحدة خفيفة وسهلة",
    desc: "عباية صلاة بقطعة واحدة أو قطعتين، خامة خفيفة تتنفّس، مقاس واسع مريح.",
    price: 180,
    days: "٣–٤ أيام",
    sizing: "alpha",
    fabrics: ["egyptian-cotton", "georgette", "linen"],
    addOns: ["gift-wrap", "rush"],
    images: ["/sarah/products/abaya-prayer-1.svg", "/sarah/products/abaya-prayer-2.svg", "/sarah/products/abaya-prayer-3.svg", "/sarah/products/abaya-prayer-4.svg"],
    aiPrompt:
      "Product photograph of a soft cream two-piece prayer garment neatly folded and styled on a light wooden surface, gentle cotton texture, natural window light, minimal warm background, 4:5 portrait, photorealistic.",
    includes: ["خامة تتنفّس", "خياطة منظّفة", "كيس حفظ قماشي"],
  },
  {
    id: "evening-dress",
    name: "فستان سهرة تفصيل",
    category: "dress",
    tagline: "مفصّل على مقاسك بالكامل",
    desc: "فستان سهرة يُفصَّل على قياساتك أنتِ: نأخذ ١١ قياساً، ونرسل لك رسم القَصّة قبل التنفيذ. خامات فاخرة وتطريز اختياري.",
    price: 1200,
    days: "١٠–١٤ يوم",
    sizing: "custom",
    fabrics: ["silk-satin", "velvet", "beaded-tulle", "embroidered-lace", "chiffon"],
    addOns: ["hand-embroidery", "beads", "full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/evening-dress-1.svg", "/sarah/products/evening-dress-2.svg", "/sarah/products/evening-dress-3.svg", "/sarah/products/evening-dress-4.svg"],
    aiPrompt:
      "High-end editorial photograph of a floor-length emerald velvet evening gown on a faceless mannequin, sculpted bodice, dramatic flowing skirt, dark moody studio backdrop, cinematic side light, full length, 4:5 portrait, photorealistic, couture catalog.",
    featured: true,
    includes: ["أخذ ١١ قياساً", "بروفة قَصّة قبل التنفيذ", "بطانة كاملة", "جولتا تعديل مجاناً"],
  },
  {
    id: "day-dress",
    name: "فستان يومي",
    category: "dress",
    tagline: "قَصّة مريحة لخامات صيفية",
    desc: "فستان يومي بقَصّة مريحة وخامة تتنفّس — للدوام والزيارات. متاح بمقاسات عالمية أو تفصيل على المقاس.",
    price: 450,
    days: "٤–٦ أيام",
    sizing: "alpha",
    fabrics: ["linen", "egyptian-cotton", "georgette", "chiffon"],
    addOns: ["full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/day-dress-1.svg", "/sarah/products/day-dress-2.svg", "/sarah/products/day-dress-3.svg", "/sarah/products/day-dress-4.svg"],
    aiPrompt:
      "Editorial photograph of a sand-beige linen midi day dress on a faceless mannequin, relaxed elegant cut, soft natural folds, bright airy studio with warm daylight, full length, 4:5 portrait, photorealistic, modest fashion catalog.",
    includes: ["خامة صيفية", "جيوب جانبية اختيارية", "كي وتغليف"],
  },
  {
    id: "jalabiya",
    name: "جلابية مطرّزة",
    category: "jalabiya",
    tagline: "واسعة ومريحة بتطريز خليجي",
    desc: "جلابية بقَصّة واسعة وتطريز على الصدر والأكمام — للبيت والاستقبال والعيد.",
    price: 380,
    days: "٤–٦ أيام",
    sizing: "alpha",
    fabrics: ["georgette", "linen", "silk-satin", "egyptian-cotton"],
    addOns: ["hand-embroidery", "beads", "full-lining", "gift-wrap", "rush"],
    images: ["/sarah/products/jalabiya-1.svg", "/sarah/products/jalabiya-2.svg", "/sarah/products/jalabiya-3.svg", "/sarah/products/jalabiya-4.svg"],
    aiPrompt:
      "Editorial photograph of a loose flowing jalabiya in dusty rose with intricate gold embroidery at the neckline and sleeves, faceless mannequin, soft satin sheen, warm cream backdrop, gentle light, full length, 4:5 portrait, photorealistic, Gulf modest fashion catalog.",
    includes: ["تطريز صدر وأكمام", "قَصّة واسعة مريحة", "كي وتغليف"],
  },
  {
    id: "kaftan",
    name: "قفطان مغربي",
    category: "jalabiya",
    tagline: "حزام وتفاصيل يدوية",
    desc: "قفطان بقَصّة مغربية مع حزام من نفس الخامة وتفاصيل سفيفة/خرز حسب الطلب.",
    price: 850,
    days: "٨–١٢ يوم",
    sizing: "custom",
    fabrics: ["silk-satin", "velvet", "embroidered-lace", "beaded-tulle"],
    addOns: ["hand-embroidery", "beads", "full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/kaftan-1.svg", "/sarah/products/kaftan-2.svg", "/sarah/products/kaftan-3.svg", "/sarah/products/kaftan-4.svg"],
    aiPrompt:
      "Luxury editorial photograph of a royal blue Moroccan kaftan with gold hand-woven trim and matching belt, faceless mannequin, rich satin fabric, ornate warm studio backdrop, dramatic soft light, full length, 4:5 portrait, photorealistic, couture catalog.",
    includes: ["حزام من نفس الخامة", "بطانة كاملة", "تفاصيل يدوية", "جولتا تعديل مجاناً"],
  },
  {
    id: "home-set",
    name: "طقم منزلي (روب + قميص)",
    category: "daily",
    tagline: "ساتان أو قطن مصري",
    desc: "طقم من قطعتين: روب طويل وقميص — خامة ساتان ناعمة أو قطن مصري، مع إمكانية تطريز الاسم.",
    price: 320,
    days: "٤–٥ أيام",
    sizing: "alpha",
    fabrics: ["silk-satin", "egyptian-cotton"],
    addOns: ["hand-embroidery", "gift-wrap", "rush"],
    images: ["/sarah/products/home-set-1.svg", "/sarah/products/home-set-2.svg", "/sarah/products/home-set-3.svg", "/sarah/products/home-set-4.svg"],
    aiPrompt:
      "Product photograph of a two-piece champagne silk satin robe and slip set, elegantly styled on a soft bed of neutral linen, glossy fabric highlights, warm morning light, minimal background, 4:5 portrait, photorealistic, luxury loungewear catalog.",
    includes: ["قطعتان", "تطريز الاسم اختياري", "تغليف أنيق"],
  },
  {
    id: "skirt",
    name: "تنورة تفصيل",
    category: "daily",
    tagline: "طويلة أو ميدي بقَصّة تختارينها",
    desc: "تنورة مفصّلة: مستقيمة، بليسيه، أو كلوش — بالطول الذي تحدّدينه.",
    price: 240,
    days: "٣–٥ أيام",
    sizing: "alpha",
    fabrics: ["japanese-crepe", "linen", "silk-satin", "georgette"],
    addOns: ["full-lining", "belt", "rush", "gift-wrap"],
    images: ["/sarah/products/skirt-1.svg", "/sarah/products/skirt-2.svg", "/sarah/products/skirt-3.svg", "/sarah/products/skirt-4.svg"],
    aiPrompt:
      "Product photograph of a long pleated olive crepe skirt on a faceless mannequin, crisp pleats with elegant movement, neutral warm studio backdrop, soft light, 4:5 portrait, photorealistic, fashion catalog.",
    includes: ["اختيار القَصّة والطول", "خصر مطاطي أو سحاب مخفي", "كي وتغليف"],
  },
  {
    id: "blouse",
    name: "بلوزة / قميص تفصيل",
    category: "daily",
    tagline: "قطعة أساسية على مقاسك",
    desc: "بلوزة أو قميص بقَصّة كلاسيكية أو واسعة، بأكمام طويلة، مناسبة للدوام.",
    price: 210,
    days: "٣–٥ أيام",
    sizing: "alpha",
    fabrics: ["egyptian-cotton", "silk-satin", "chiffon", "linen"],
    addOns: ["full-lining", "hand-embroidery", "rush", "gift-wrap"],
    images: ["/sarah/products/blouse-1.svg", "/sarah/products/blouse-2.svg", "/sarah/products/blouse-3.svg", "/sarah/products/blouse-4.svg"],
    aiPrompt:
      "Product photograph of a crisp white cotton blouse with long sleeves on a faceless mannequin, clean tailored lines, bright minimal studio background, soft even light, 4:5 portrait, photorealistic, fashion catalog.",
    includes: ["قَصّة كلاسيكية أو واسعة", "أزرار مخفية اختيارية", "كي وتغليف"],
  },
  {
    id: "alteration",
    name: "تعديل وتضييق",
    category: "service",
    tagline: "قطعتك عندك ونضبّطها على مقاسك",
    desc: "تضييق أو توسيع أو تقصير أي قطعة جاهزة — عبايات، فساتين، بناطيل، أكمام. السعر حسب نوع التعديل.",
    price: 60,
    days: "٢–٣ أيام",
    sizing: "custom",
    fabrics: [],
    addOns: ["rush"],
    images: ["/sarah/products/alteration-1.svg", "/sarah/products/alteration-2.svg", "/sarah/products/alteration-3.svg", "/sarah/products/alteration-4.svg"],
    aiPrompt:
      "Close-up photograph of a tailor's hands pinning and adjusting a garment on a dress form, measuring tape and pincushion nearby, warm atelier light, shallow depth of field, 4:5 portrait, photorealistic.",
    includes: ["فحص القطعة قبل البدء", "سعر يُحدَّد بعد المعاينة", "إعادة كي"],
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);

// ===================================================================
//                      الشحن — كل مناطق المملكة
// ===================================================================
export type Region = { name: string; cities: string; fee: number; days: string };

export const regions: Region[] = [
  { name: "الرياض", cities: "الرياض، الخرج، الدرعية، المجمعة", fee: 25, days: "١–٢ يوم" },
  { name: "مكة المكرمة", cities: "جدة، مكة، الطائف، رابغ", fee: 35, days: "٢–٤ أيام" },
  { name: "المنطقة الشرقية", cities: "الدمام، الخبر، الظهران، الأحساء، الجبيل", fee: 35, days: "٢–٤ أيام" },
  { name: "المدينة المنورة", cities: "المدينة، ينبع، العلا", fee: 35, days: "٢–٤ أيام" },
  { name: "القصيم", cities: "بريدة، عنيزة، الرس", fee: 35, days: "٢–٤ أيام" },
  { name: "عسير", cities: "أبها، خميس مشيط، بيشة", fee: 45, days: "٣–٥ أيام" },
  { name: "تبوك", cities: "تبوك، ضباء، الوجه", fee: 45, days: "٣–٥ أيام" },
  { name: "حائل", cities: "حائل، بقعاء", fee: 45, days: "٣–٥ أيام" },
  { name: "جازان", cities: "جازان، صبيا، أبو عريش", fee: 45, days: "٣–٥ أيام" },
  { name: "نجران", cities: "نجران، شرورة", fee: 45, days: "٤–٦ أيام" },
  { name: "الباحة", cities: "الباحة، بلجرشي", fee: 45, days: "٤–٦ أيام" },
  { name: "الجوف", cities: "سكاكا، دومة الجندل، القريات", fee: 45, days: "٤–٦ أيام" },
  { name: "الحدود الشمالية", cities: "عرعر، رفحاء، طريف", fee: 45, days: "٤–٦ أيام" },
];

export const freeShippingOver = 900; // شحن مجاني فوق هذا المبلغ (٠ = تعطيل)

export function shippingFee(regionName: string, subtotal: number) {
  const r = regions.find((x) => x.name === regionName);
  if (!r) return 0;
  if (freeShippingOver > 0 && subtotal >= freeShippingOver) return 0;
  return r.fee;
}

// ===================================================================
//                        الأسئلة الشائعة
// ===================================================================
export const faq = [
  {
    q: "كيف أعرف مقاسي؟",
    a: "عندنا ثلاث طرق: المقاسات العالمية بالحروف (XS–4XL) مع جدول تحويل لـ EU/UK/US، أو مقاسات الطول للعبايات (٥٢–٦٠) حسب طولك، أو التفصيل على مقاسك بأخذ ١١ قياساً. وفي صفحة المقاسات حاسبة تقترح لك المقاس من قياساتك.",
  },
  {
    q: "كيف أدفع؟",
    a: "لا يوجد دفع إلكتروني حالياً. تُرسلين الطلب عبر واتساب، نؤكّد لك السعر النهائي، ثم تحوّلين بنكياً وترسلين صورة الإيصال — ويبدأ التنفيذ مباشرة.",
  },
  {
    q: "هل توصلون لكل مناطق المملكة؟",
    a: "نعم، نشحن لجميع مناطق المملكة الثلاث عشرة. رسوم الشحن ومدة التوصيل تظهر لك في نموذج الطلب حسب منطقتك، والشحن مجاني للطلبات فوق ٩٠٠ ر.س.",
  },
  {
    q: "كم يستغرق التنفيذ؟",
    a: "من ٣ إلى ٧ أيام عمل للقطع العادية، ومن ١٠ إلى ١٤ يوماً لفساتين السهرة والقفاطين المفصّلة. يوجد خيار تنفيذ سريع خلال ٤٨ ساعة برسوم إضافية.",
  },
  {
    q: "لو المقاس ما ضبط؟",
    a: "تعديل المقاس مجاني مرة واحدة خلال ٧ أيام من الاستلام لقطع التفصيل — تُرسلين القطعة ونضبّطها ونعيدها لك.",
  },
  {
    q: "هل أقدر أجيب قماشي؟",
    a: "نعم. لو عندك قماشك الخاص يُخصم من السعر مقابل الخامة، تواصلي معنا في واتساب لتحديد السعر النهائي.",
  },
];
