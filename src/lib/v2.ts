// ===== محتوى الموقع (هوية «ضوء الاستوديو» بهندسة صفحات آبل — نوفمبر ٢٠٢٦) =====
// كلّ النصوص والأسعار هنا. الخطّة والفئات في:
//   ~/Desktop/ابراهيم سعود/03_الاستراتيجية/خطة_الموقع_والبراند_نوفمبر_2026.md
//   ~/Desktop/ابراهيم سعود/00_السياق/الفئات_المستهدفة.md
// الأسعار المعلَّمة approved: true مقترحة وتنتظر اعتماد إبراهيم قبل النشر.
//
// التسميات على طريقة آبل: كلّ منتج اسمه كلمة وحدة، والفئة لاحقة ثابتة:
//   بلا لاحقة = الأساس · Pro = الكامل · + = اشتراك شهريّ.
// «نَسَق» حلّ محلّ «منوال» اسماً لنظام الإدارة.

import { waLink } from "./site";
import paylinks from "./paylinks.json";

export const waHref = (msg = "السلام عليكم، أبي أحجز مكالمة تعارف") => waLink(msg);
// رابط Cal.com في site.calLink يرجع 404 (نوفمبر ٢٠٢٦) — الحجز عبر واتساب لين يتفعّل الحساب،
// وبعدها: bookHref = `https://cal.com/${site.calLink}`
export const bookHref = waHref("السلام عليكم، أبي أحجز مكالمة تعارف ٢٠ دقيقة");

export type Memoji =
  | "happy" | "big_happy" | "wink" | "one_raised_eyebrow" | "head_tilt" | "hands_on_hips"
  | "proud" | "surprise" | "grizzled" | "annoyed" | "pleasant_neutral" | "yearbook"
  | "pursed_lips" | "front_pucker" | "tongue_out";

export const hero = {
  eyebrow: "إبراهيم سعود",
  title: ["بين التقنية", "والأعمال."],
  sub: "أدخّل الذكاء الاصطناعي في شغلك: نظام يدير الشغل، ومحتوى يوصل، وفريق يتعلّم يطوّرها بنفسه. فرد واحد، بتسليم بمستوى الشركات.",
};

// يتلوّن كلمة كلمة مع التمرير
export const manifesto =
  "قبل ما أبيعها لك، بنيتها لنفسي. موقع يجيب العملاء، ونظام يطلع عروض الأسعار والفواتير، واستوديو يصوّر، وذكاء اصطناعي يكتب وينشر. هذي قصّتي، وممكن تصير قصّتك.";

// ===== الباقات =====
export type Pkg = {
  id: string;
  name: string;
  for: string;
  price: string;
  unit?: string;
  approved: boolean; // false = سعر مقترح ينتظر اعتماد إبراهيم
  items: string[];
  featured?: boolean;
  half?: string; // نصف المبلغ (الدفعة الأولى) للعرض، للباقات اللي تُدفع على دفعتين
  href?: string; // رابط بدل واتساب
};

// ===== روابط الدفع =====
// الروابط في src/lib/paylinks.json، وتُعبّأ من جدول الإكسل بـ tools/paylinks.py (make ثمّ import).
// لكلّ باقة: full = المبلغ كامل، half = الدفعة الأولى (نصف المبلغ). الباقة بلا رابط يبقى زرّها واتساب.
export const payLinks = paylinks as Record<string, { full?: string; half?: string }>;

export const pkgs = {
  session: { id: "session", name: "جلسة التشخيص", for: "قبل أيّ باقة", price: "٣٠٠", approved: true, items: ["ساعة في الاستوديو أو أونلاين", "خطّة مكتوبة لوضعك", "تُخصم من أيّ باقة"] },
  hudoor: { id: "hudoor", name: "حضور", for: "تبدأ حضورك", price: "٤,٩٠٠", half: "٢,٤٥٠", approved: true, items: ["يوم تصوير", "صور لينكدإن احترافيّة", "فيديو تعريفيّ", "صفحة شخصيّة وبايو"] },
  hudoorPro: { id: "hudoor-pro", name: "حضور Pro", for: "كلّ شي من الصفر", price: "١٤,٩٠٠", half: "٧,٤٥٠", approved: true, featured: true, items: ["جلسة تشخيص وخطّة", "هويّة في Claude", "موقع بصفحة بيع وباقات", "نظام عروض أسعار وفواتير", "يوم استوديو: فيديو وصور و٨ مقاطع", "خطّة محتوى ٩٠ يوماً"] },
  hudoorPlus: { id: "hudoor-plus", name: "حضور+", for: "محتوى كلّ شهر", price: "٦,٥٠٠", unit: "شهريّاً", approved: true, items: ["يوم تصوير شهريّ", "١٦ مقطعاً", "النشر على حساباتك"] },
  hawiya: { id: "hawiya", name: "هويّة", for: "هويّتك داخل Claude", price: "١,٤٩٠", half: "٧٤٥", approved: true, items: ["مهارة Claude بهويّتك: أغلفة ومنشورات وموشن", "دليل هويّة PDF تعرضه وتشاركه", "الخطّ واللون والشعار", "تشارك المهارة مع فريقك في Claude"] },
  publish: { id: "publish", name: "حزمة النشر", for: "فكرة وحدة، كلّ المنصّات", price: "٣,٩٠٠", half: "١,٩٥٠", approved: true, items: ["دفتر NotebookLM بمعادلة الانتشار وهويّتك", "برومت حزمة النشر", "أستوديو نشر مربوط بحساباتك"] },
  podcast: { id: "podcast", name: "حلقة بودكاست", for: "تبدأ بها محتواك", price: "٢,٧٥٠", half: "١,٣٧٥", approved: true, items: ["تصوير في الاستوديو بثلاث كاميرات", "الحلقة كاملة جاهزة ليوتيوب", "١٠ مقاطع قصيرة", "تصاميم الحلقة والغلاف"] },
  film: { id: "film", name: "فيلم الخدمة", for: "فيلم تعريفيّ واحد", price: "٣,٤٠٠", half: "١,٧٠٠", approved: true, featured: true, items: ["فكرة واسكربت", "تصوير أو موشن", "نسخة ٦٠–٩٠ ثانية", "٣ نسخ قصيرة"] },
  storeAds: { id: "store-ads", name: "إعلانات المتاجر", for: "للمتاجر الإلكترونيّة", price: "من ٧٥٠", approved: true, href: "/ad-packages/", items: ["إعلان طوليّ ٩:١٦", "هوك واسكربت", "تسليم خلال ٣ أيّام"] },
  nasaq: { id: "nasaq", name: "نَسَق", for: "للمنشآت وشركات الشخص الواحد", price: "من ٥,٠٠٠", approved: true, items: ["نظام على مقاسك", "عروض أسعار وفواتير ومحاسبة", "العملاء والمشاريع والتقويم", "تدريب التعديل بـClaude"] },
  nasaqPro: { id: "nasaq-pro", name: "نَسَق Pro", for: "للجمعيّات والجهات بفِرق", price: "من ٧,٠٠٠", approved: true, featured: true, items: ["كلّ ما في نَسَق", "فريق وصلاحيّات لكلّ قسم", "ماليّة بدورة اعتماد، وحوكمة", "المستفيدون والتطوّع والموارد البشريّة", "موقع الجهة يُدار من النظام"] },
} satisfies Record<string, Pkg>;


// ===== إعلانات المتاجر (صفحة /ad-packages) =====
export const adPkgs: Pkg[] = [
  { id: "ad-single", name: "الإعلان الواحد", for: "ابدأ بإعلان وشوف الفرق", price: "٧٥٠", approved: true, items: ["فكرة وسكربت على منتجك وجمهورك، تعتمده قبل التصوير", "تصوير طوليّ ٩:١٦ بإضاءة وصوت احترافيّ", "مونتاج كامل: إيقاع ونصّ على الشاشة", "تسليم خلال ٣ أيّام، وجولتا تعديل"] },
  { id: "ad-review", name: "المراجعة الكاملة", for: "تبني ثقة المتردّد", price: "١,٠٠٠", approved: true, items: ["سكربت مراجعة يبرز المزايا بصدق، بلا مبالغة", "تصوير تفصيليّ للمنتج ولقطات استخدام واقعيّة", "جرافيك على الشاشة يبرز اللي يهمّ المشتري", "تسليم خلال ٣ أيّام، وجولتا تعديل"] },
  { id: "ad-triple", name: "٣ إعلانات", for: "الأوفر · تعرف أيّ فكرة تبيع", price: "١,٥٠٠", approved: true, featured: true, items: ["٣ إعلانات بزوايا وأفكار مختلفة لنفس المنتج", "تختبر الفكرة مع جمهورك قبل ما تصرف على الإعلانات", "تصوير ومونتاج احترافيّ لكلّ إعلان", "محتوى يكفيك أسابيع نشر"] },
];

export const adCompare: Compare = {
  models: [{ name: "الإعلان الواحد", price: "٧٥٠" }, { name: "المراجعة الكاملة", price: "١,٠٠٠" }, { name: "٣ إعلانات", price: "١,٥٠٠" }],
  rows: [
    { label: "عدد الإعلانات", v: ["إعلان واحد", "إعلان واحد", "٣ إعلانات"] },
    { label: "نوع الإعلان", v: ["إعلان طوليّ", "مراجعة منتج", "٣ أفكار مختلفة"] },
    { label: "فكرة وسكربت تعتمده", v: [true, true, true] },
    { label: "جرافيك يبرز المزايا", v: [false, true, false] },
    { label: "اختبار أيّ فكرة تبيع", v: [false, false, true] },
    { label: "التسليم", v: ["٣ أيّام", "٣ أيّام", "٣ أيّام"] },
    { label: "جولتا تعديل مجانيّة", v: [true, true, true] },
  ],
};

export const adSteps = [
  { name: "الفكرة", text: "نفهم منتجك وجمهورك، ونكتب فكرة وسكربت بهوك سريع ورسالة وحدة." },
  { name: "تعتمده", text: "ما نصوّر شي قبل ما تعتمد السكربت. ولا رسوم إضافيّة بعد الاتفاق." },
  { name: "التصوير", text: "تصوير طوليّ ٩:١٦ بإضاءة وصوت احترافيّ، ومونتاج بإيقاع المنصّات." },
  { name: "التسليم", text: "خلال ٣ أيّام، بنسخ جاهزة للنشر وجولتي تعديل مجانيّة." },
];

export const faqs = [
  { q: "من وين أبدأ؟", a: "من مكالمة تعارف ٢٠ دقيقة، مجّانيّة. أسمع وضعك وأقول لك وش تحتاج فعلاً، حتى لو كان أقلّ من باقة." },
  { q: "أنا مو تقنيّ، أقدر أعدّل على موقعي ونظامي؟", a: "نعم. كلّ شي أبنيه يجي معه تدريب، وتقدر تعدّل عليه بالذكاء الاصطناعيّ (Claude) بكلام عاديّ." },
  { q: "لازم أطلع قدّام الكاميرا؟", a: "لا. نقدر نبني حضورك بصوتك وكتابتك وإيموجي مثل اللي تشوفه هنا، ونطلّعك بالتدريج لو حبّيت." },
  { q: "كيف الدفع؟", a: "أرسل لك عرض سعر أوّلاً. تدفع نصف المبلغ ونبدأ الشغل، والنصف الثاني عند التسليم، بفاتورة رسميّة." },
  { q: "كيف أستلم الشغل؟", a: "الفيديو والتصاميم على Google Drive بجودتها الكاملة. والمواقع والأنظمة تنبني على حساب GitHub باسم جهتك وقاعدة بيانات خاصّة بها، فالكود ملكك من أوّل يوم." },
  { q: "وين الاستوديو؟", a: "في الرياض. تحجز موعد وأرسل لك الموقع." },
];

export const tools = [
  { name: "Claude", img: "/tools/claude.svg" },
  { name: "Antigravity", img: "/tools/antigravity.png" },
  { name: "Kimi", img: "/tools/kimi.png" },
  { name: "Blender", img: "/tools/blender.svg" },
  { name: "Final Cut Pro", img: "/tools/finalcut.png" },
  { name: "DaVinci Resolve", img: "/tools/davinci.png" },
  { name: "Photoshop", img: "/tools/photoshop.webp" },
  { name: "NotebookLM", img: "/tools/notebooklm.png" },
  { name: "Gemini", img: "/tools/gemini.png" },
  { name: "Higgsfield", img: "/tools/higgsfield.png" },
];

// لماذا تشتغل معي — تتكرّر في كلّ صفحة منتج (مثل «لماذا آبل» تحت كلّ منتج)
export const why = [
  { title: "المكالمة الأولى مجّانيّة.", text: "٢٠ دقيقة أسمع فيها وضعك وأقول لك وش تحتاج فعلاً، حتى لو أقلّ من باقة.", memoji: "wink" as Memoji },
  { title: "طبّقته على نفسي أوّل.", text: "كلّ شي أبيعه شغّال عندي اليوم: حروف ودروس، وهذا الموقع، والاستوديو.", memoji: "proud" as Memoji },
  { title: "تعدّل بنفسك.", text: "تتدرّب تعدّل موقعك ونظامك بـClaude بكلام عاديّ، بدون مبرمج.", memoji: "big_happy" as Memoji },
  { title: "نصف المبلغ ونبدأ.", text: "عرض سعر أوّلاً، ثمّ نصف المبلغ ونبدأ الشغل، والباقي عند التسليم، بفاتورة رسميّة.", memoji: "happy" as Memoji },
];

// ===== نسخ العرض الحيّة (public/demo — تُبنى بـ tools/build-demos.py) =====
// كلّها بالوضع التجريبيّ: بيانات الزائر في متصفّحه فقط، بلا قاعدة بيانات.
// client: عمل سوّاه إبراهيم لعميل (يُعرض تحت «أعمال لعملائي» لا كمنتج له)
export type Demo = { id: string; name: string; kind: string; text: string; img: string; href: string; dash?: string; qr: string; client?: boolean; logo?: string };
export const demos: Demo[] = [
  { id: "nasaq", name: "نَسَق", kind: "نظامي · نسخة عرض", text: "نسخة من نظامي ببيانات تجريبيّة: المكتب، والمبيعات، والفوترة، وعروض الأسعار، والعملاء، والتقويم.", img: "/v2/shots/demo-nasaq.jpg", href: "/demo/nasaq/index.html", qr: "/v2/qr/nasaq.svg" },
  { id: "ruso", name: "جمعيّة رسو لبناء الشخصيّة", kind: "جمعيّة أهليّة · موقع ونظام داخليّ", client: true, logo: "/v2/logos/ruso.svg", text: "موقع الجمعيّة ولوحة تحكّمها: سندات صرف، وحوكمة، ومستفيدون، وتطوّع.", img: "/v2/shots/demo-ruso-site.jpg", href: "/demo/ruso/website/index.html", dash: "/demo/ruso/system/index.html", qr: "/v2/qr/ruso.svg" },
  { id: "manabir", name: "منابر", kind: "منصّة دعويّة · خمس صلاحيّات", client: true, logo: "/v2/logos/manabir.png", text: "تنظيم الأنشطة الدعويّة في المساجد: ادخل كمدير النظام، أو ممثّل الوزارة، أو مشرف المسجد.", img: "/v2/shots/demo-manabir.jpg", href: "/demo/manabir/index.html?login=1", dash: "/demo/manabir/index.html?dash=1", qr: "/v2/qr/manabir.svg" },
  { id: "takamul", name: "التكامل المتّحدة", kind: "شركة استشارات · موقع ولوحة محتوى", client: true, logo: "/v2/logos/takamul.png", text: "موقع شركة استشارات بالعربيّ والإنجليزيّ، ومحتواه كلّه يتعدّل من لوحة تحكّم.", img: "/v2/shots/demo-takamul.jpg", href: "/demo/takamul/index.html", dash: "/demo/takamul/dashboard/index.html", qr: "/v2/qr/takamul.svg" },
];

// ===== المنتجات (صفحة لكلّ منتج، وكلّ حملة جوجل تودّي لوحدة) =====
export type Highlight = { title: string; text: string; img: string; kind: "phone" | "cover" | "memoji" | "frame"; dark?: boolean };
export type Compare = { models: { name: string; price: string; unit?: string }[]; rows: { label: string; v: (string | boolean)[] }[] };

export type QuoteField = { id: string; label: string; type?: "select" | "text" | "textarea"; options?: string[]; placeholder?: string };

export type Product = {
  slug: "brand" | "systems" | "video";
  href: string;
  name: string;
  kicker: string;
  meta: { title: string; description: string };
  headline: string;
  sub: string;
  from: string;
  memoji: Memoji;
  heroPhones?: string[];
  heroImg?: string;
  heroScreen?: { src: string; url: string; phone?: string };
  // قسم «نظام على الكمبيوتر»: لقطة حقيقيّة في نافذة متصفّح
  screen?: { title: string; text: string; src: string; url: string; phone?: string; href?: string };
  highlights: Highlight[];
  journey?: { title: string; steps: { name: string; text: string }[] };
  features: { title: string; sub?: string; items: { title: string; text: string }[] }[];
  // logos: شعار العميل وشعار الأداة فوق العنوان (مثل «سعد السيف × Claude»)
  showcase?: { id?: string; eyebrow: string; title: string; text: string; imgs: string[]; logos?: { src: string; alt: string; label?: string }[] };
  demos?: boolean;
  showWorks?: boolean;
  // صفحة بيع مؤسّسيّة: وش تستلم، كيف نشتغل، الملكيّة، ونموذج طلب عرض سعر
  deliverables?: { title: string; items: string[] };
  process?: { name: string; text: string }[];
  ownership?: { title: string; sub: string; items: { title: string; text: string }[] };
  quote?: { subject: string; fields: QuoteField[] };
  compare: Compare;
  packages: Pkg[];
  addons?: Pkg[];
  faqs: { q: string; a: string }[];
  final: string;
};

export const products: Record<Product["slug"], Product> = {
  brand: {
    slug: "brand",
    href: "/brand/",
    name: "حضور",
    kicker: "البراند الشخصيّ",
    meta: {
      title: "حضور — بناء البراند الشخصيّ للخبراء: موقع وبودكاست وهويّة | إبراهيم سعود",
      description: "للخبراء والمستشارين والمدرّبين: موقع شخصيّ يبيع، تصوير بودكاست في الرياض، صور لينكدإن، هويّة بصريّة ومهارة Claude، ونظام عروض أسعار وفواتير.",
    },
    headline: "خبرتك ٢٠ سنة. خلّ السوق يشوفها.",
    sub: "طلعت من الوظيفة أو تفكّر تطلع؟ حضور يبني لك اللي يحتاجه الخبير المستقلّ: صورة يثق فيها العميل، ومحتوى يوصل، ونظام يدير شغلك.",
    from: "يبدأ من ٤,٩٠٠ ريال",
    memoji: "one_raised_eyebrow",
    highlights: [
      { title: "صفحة تبيع بدالك.", text: "من أنت، ووش تقدّم، وكم سعره، وزرّ حجز. مثل هذي الصفحة.", img: "/v2/memoji/hands_on_hips.png", kind: "memoji" },
      { title: "حلقة تصير عشرة مقاطع.", text: "استوديو بثلاث كاميرات في الرياض، وحلقة تتقطّع لمحتوى شهر.", img: "/v2/shots/studio.jpg", kind: "cover", dark: true },
      { title: "هويّتك داخل Claude.", text: "تقول «سوّ لي غلاف لهالحلقة» ويطلع بخطّك ولونك.", img: "/v2/shots/saad-quote.jpg", kind: "frame", dark: true },
      { title: "نظام بدل المدير.", text: "عروض أسعار وفواتير ومتابعة عملاء في مكان واحد.", img: "/v2/shots/hl-office.jpg", kind: "phone" },
    ],
    journey: {
      title: "الصقر والبرّ.",
      steps: [
        { name: "القفص", text: "موظّف بمهامّ محدّدة وراتب ثابت. أمان، بس ما تختار صيدك." },
        { name: "المحميّة", text: "شركة كبيرة: مساحة أوسع وحرّيّة شكليّة، والسور نفسه." },
        { name: "البرّ", text: "مستقلّ، صيدك على مهارتك. وهنا تحتاج أدوات ما علّمتك إيّاها الوظيفة." },
      ],
    },
    features: [{
      title: "أدوات البرّ.",
      items: [
        { title: "صفحة تبيع بدالك", text: "موقع فيه من أنت ووش تقدّم وكم سعره وزرّ حجز. بدونه كلّ عميل يجيك من معارفك بس." },
        { title: "محتوى يشرح خبرتك", text: "حلقة بودكاست تتقطّع لعشرة مقاطع، من استوديو جاهز بثلاث كاميرات." },
        { title: "صورة تليق بخبرتك", text: "صور لينكدإن وهويّة بسيطة بخطّ ولون ثابتين، تعرفك الناس فيها." },
        { title: "نظام بدل المدير", text: "عروض أسعار وفواتير ومتابعة عملاء ومهامّ في مكان واحد، تعدّل عليه بـClaude." },
      ],
    }],
    screen: {
      title: "نظام الخبير.",
      text: "عروض أسعار وفواتير ومتابعة عملاء ومهامّ في مكان واحد، باسمك وشعارك. هذا نظامي أنا اللي أدير فيه شغلي، وتقدر تجرّبه الحين.",
      src: "/v2/shots/desk-office.jpg",
      url: "نَسَق — نسخة عرض",
      phone: "/v2/shots/phone-office.jpg",
      href: "/demo/nasaq/index.html",
    },
    showcase: {
      id: "identity",
      eyebrow: "هويّة",
      title: "هويّتك تشتغل معك كلّ يوم.",
      text: "دليل هويّة ومهارة داخل Claude: تقول له «سوّ لي غلاف لهالحلقة» ويطلع بهويّتك. هذي هويّة سعد السيف اللي سلّمناها، وموشن حلقاته يطلع منها.",
      imgs: ["/v2/shots/saad-quote.jpg", "/v2/shots/saad-name.jpg", "/v2/shots/saad-stat.jpg"],
      logos: [{ src: "/v2/logos/saad-alsaif-white.png", alt: "سعد السيف" }, { src: "/tools/claude.svg", alt: "Claude", label: "Claude" }],
    },
    compare: {
      models: [
        { name: "حضور", price: "٤,٩٠٠" },
        { name: "حضور Pro", price: "١٤,٩٠٠" },
        { name: "حضور+", price: "٦,٥٠٠", unit: "شهريّاً" },
      ],
      rows: [
        { label: "يوم تصوير", v: ["يوم واحد", "يوم واحد", "كلّ شهر"] },
        { label: "صور لينكدإن احترافيّة", v: [true, true, false] },
        { label: "فيديو تعريفيّ", v: [true, true, false] },
        { label: "صفحتك على الإنترنت", v: ["صفحة وبايو", "موقع بصفحة بيع وباقات", false] },
        { label: "هويّة في Claude", v: [false, true, false] },
        { label: "نظام عروض أسعار وفواتير", v: [false, true, false] },
        { label: "مقاطع قصيرة", v: [false, "٨ مقاطع", "١٦ مقطعاً كلّ شهر"] },
        { label: "خطّة محتوى", v: [false, "٩٠ يوماً", false] },
        { label: "النشر على حساباتك", v: [false, false, true] },
      ],
    },
    packages: [pkgs.hudoor, pkgs.hudoorPro, pkgs.hudoorPlus],
    addons: [pkgs.podcast, pkgs.hawiya, pkgs.publish],
    faqs: [faqs[0], faqs[2], faqs[1], faqs[3], faqs[4]],
    final: "خلّ خبرتك تشتغل لك.",
  },

  systems: {
    slug: "systems",
    href: "/systems/",
    name: "نَسَق",
    kicker: "نظام الإدارة",
    meta: {
      title: "نَسَق — نظام إدارة أعمال وجمعيّات عربيّ على المقاس | إبراهيم سعود",
      description: "نَسَق نظام إدارة عربيّ على مقاس منشأتك أو جمعيّتك: عروض أسعار وفواتير ومحاسبة ومشاريع، وللجمعيّات سندات صرف وحوكمة ومستفيدون وتطوّع. جرّبه من جوالك.",
    },
    headline: "ادفع مرّة. امتلك نظامك.",
    sub: "نظام إدارة عربيّ على مقاس منشأتك أو جمعيّتك، بدل إكسل وواتساب والاشتراكات. الكود باسمك، وأدرّبك تطوّره بنفسك مع Claude.",
    from: "يبدأ من ٥,٠٠٠ ريال",
    memoji: "proud",
    heroPhones: ["/v2/shots/demo-ruso-sys.jpg", "/v2/shots/demo-nasaq.jpg", "/v2/shots/demo-manabir-dash.jpg"],
    heroScreen: { src: "/v2/shots/desk-office.jpg", url: "نَسَق — نسخة عرض", phone: "/v2/shots/phone-office.jpg" },
    highlights: [
      { title: "المكتب.", text: "كلّ تطبيقات شغلك في شاشة وحدة: المبيعات والفوترة والعملاء والمحاسبة والتقويم.", img: "/v2/shots/hl-office.jpg", kind: "phone" },
      { title: "كلّ موظّف يشوف شغله.", text: "صلاحيّات لكلّ قسم، و«عرض كـ» تجرّب فيه النظام بعين أيّ موظّف.", img: "/v2/shots/demo-manabir.jpg", kind: "phone" },
      { title: "الموقع من نفس النظام.", text: "أخبار وبرامج وشركاء وتسجيلات، تتعدّل من لوحة التحكّم.", img: "/v2/shots/demo-ruso-site.jpg", kind: "phone", dark: true },
      { title: "جرّبه من جوالك.", text: "نسخ عرض حيّة تفتحها الحين، بدون حساب وبدون تحميل.", img: "/v2/shots/demo-manabir-dash.jpg", kind: "phone" },
      { title: "الأرقام قدّامك.", text: "طلبات تنتظرك، ومهامّ متأخّرة، وصافي حركة السنة، من أوّل شاشة.", img: "/v2/shots/demo-ruso-sys.jpg", kind: "phone" },
    ],
    demos: true,
    deliverables: {
      title: "وش تستلم.",
      items: [
        "نظام إدارة على مقاس شغلكم: العملاء، عروض الأسعار والفواتير، الماليّة، المهامّ والتقويم",
        "حسابات للفريق بصلاحيّات لكلّ قسم",
        "موقع الجهة يُدار من النظام (في نَسَق Pro)",
        "الكود في حساب GitHub باسمكم",
        "قاعدة بيانات باسمكم",
        "جلسة تدريب: كيف يطوّر المدير النظام بنفسه مع Claude",
        "٣٠ يوم دعم فنيّ بعد التسليم",
      ],
    },
    process: [
      { name: "مكالمة تعارف", text: "٢٠ دقيقة مجّانيّة: نفهم جهتكم ووش اللي يضايقكم في الشغل اليوم." },
      { name: "جلسة التشخيص", text: "نرسم خريطة النظام: الأقسام والصلاحيّات والتقارير، ونطلع بعرض سعر رسميّ بمدّة واضحة. سعرها يُخصم من المشروع." },
      { name: "البناء", text: "نصف المبلغ ونبدأ. تشوف التقدّم على نسخة تجريبيّة أوّل بأوّل، وتعدّل قبل التسليم." },
      { name: "التسليم والتدريب", text: "الكود والقاعدة باسمكم، وجلسة يتعلّم فيها المدير يطوّر النظام مع Claude." },
      { name: "بعد التسليم", text: "٣٠ يوم دعم فنيّ. وبعدها النظام نظامكم: تطوّرونه بأنفسكم، أو تطلبونني بعرض سعر." },
    ],
    ownership: {
      title: "نظامك ملكك. مو إيجار.",
      sub: "أغلب الأنظمة اشتراك شهريّ، وبياناتك عند غيرك. نَسَق تدفع عليه مرّة، ويصير ملكك.",
      items: [
        { title: "الكود باسمك", text: "في حساب GitHub تملكه الجهة. ما يضيع لو تغيّر المطوّر، ولا تحتاجني عشان تشغّله." },
        { title: "البيانات عندك", text: "قاعدة بيانات باسم الجهة، بصلاحيّات تحدّد مين يشوف وش." },
        { title: "تطوّره بنفسك", text: "مع Claude تضيف وتعدّل بكلام عاديّ، وأعلّمك الطريقة في جلسة التسليم." },
        { title: "ورق رسميّ", text: "عرض سعر وفاتورة رسميّة، والدفع على دفعتين: نصف عند البداية ونصف عند التسليم." },
      ],
    },
    quote: {
      subject: "عرض سعر لنظام نَسَق",
      fields: [
        { id: "name", label: "الاسم" },
        { id: "org", label: "اسم الجهة" },
        { id: "type", label: "نوع الجهة", type: "select", options: ["شركة أو مؤسّسة", "جمعيّة أو جهة غير ربحيّة", "جهة حكوميّة", "مدرسة أو جهة تعليميّة", "غير ذلك"] },
        { id: "size", label: "عدد الموظّفين", type: "select", options: ["١–٥", "٦–٢٠", "٢١–٥٠", "أكثر من ٥٠"] },
        { id: "need", label: "وش تبون النظام يسوي؟", type: "textarea", placeholder: "مثلاً: عروض الأسعار والفواتير، متابعة المتبرّعين، سندات الصرف..." },
      ],
    },
    features: [
      {
        title: "للمنشآت والشركات.",
        items: [
          { title: "العملاء والمبيعات", text: "مسار عملاء بمراحل ومتابعة تلقائيّة، ولوحة أرقام واضحة." },
          { title: "عروض أسعار تليق", text: "عرض سعر احترافيّ بقوالب جاهزة، بدل التصميم في وورد كلّ مرّة." },
          { title: "الفواتير والمحاسبة", text: "فواتير عاديّة أو ضريبيّة، وقيود ومحاسبة وقوائم ماليّة." },
          { title: "المشاريع والتقويم", text: "مهامّ بأسلوب Trello، وتقويم، وغرفة مشروع تشاركها مع عميلك." },
        ],
      },
      {
        title: "وللجمعيّات.",
        items: [
          { title: "سندات بدورة اعتماد", text: "طلب، ثمّ مراجعة ماليّة، ثمّ اعتماد، ثمّ صرف. وحدود اللائحة مطبّقة." },
          { title: "محاسبة غير ربحيّة", text: "دليل حسابات وقيود وقوائم ماليّة على معيار المنشآت غير الهادفة للربح." },
          { title: "المستفيدون والتطوّع", text: "تسجيل وحضور وشهادات، وساعات تطوّع معتمدة." },
          { title: "الحوكمة والموقع", text: "اجتماعات ومحاضر وقرارات، وموقع الجمعيّة يُدار من نفس النظام." },
        ],
      },
    ],
    compare: {
      models: [
        { name: "نَسَق", price: "من ٥,٠٠٠" },
        { name: "نَسَق Pro", price: "من ٧,٠٠٠" },
      ],
      rows: [
        { label: "المستخدمون", v: ["أنت وفريق صغير", "فريق بأقسام وصلاحيّات"] },
        { label: "العملاء ومسار المبيعات", v: [true, true] },
        { label: "عروض أسعار وفواتير", v: [true, true] },
        { label: "المحاسبة", v: ["قيود وقوائم ماليّة", "معيار المنشآت غير الربحيّة"] },
        { label: "المشاريع والمهامّ والتقويم", v: [true, true] },
        { label: "سندات صرف بدورة اعتماد", v: [false, true] },
        { label: "الحوكمة والاجتماعات", v: [false, true] },
        { label: "المستفيدون والتطوّع", v: [false, true] },
        { label: "الموارد البشريّة", v: [false, true] },
        { label: "موقع يُدار من النظام", v: [false, true] },
        { label: "يشتغل على الجوال", v: [true, true] },
        { label: "الكود وقاعدة البيانات باسم جهتك", v: [true, true] },
      ],
    },
    packages: [pkgs.session, pkgs.nasaq, pkgs.nasaqPro],
    faqs: [
      { q: "النظام ملكي ولا اشتراك؟", a: "ملكك بالكامل. ينبني على حساب GitHub باسم جهتك وقاعدة بيانات خاصّة بها، وأنا ما أحتفظ بالكود. وأعلّمك تربطه بـClaude وتعدّل عليه بنفسك." },
      { q: "نسخ العرض تحفظ بياناتي؟", a: "لا. نسخ العرض تحفظ كلّ شي في متصفّحك أنت بس، ولا ترسل شي لأيّ خادم. جرّب براحتك." },
      { q: "أقدر أعدّل عليه بعدين؟", a: "نعم. تتدرّب على تعديله بـClaude بكلام عاديّ، أو نعدّل لك حسب الطلب." },
      { q: "كم ياخذ وقت؟", a: "يعتمد على حجم الجهة. نحدّده في جلسة التشخيص قبل أيّ عرض سعر." },
      faqs[3],
    ],
    final: "نظامك ينتظرك.",
  },

  video: {
    slug: "video",
    href: "/video/",
    name: "الاستوديو",
    kicker: "بودكاست وأفلام",
    meta: {
      title: "الاستوديو — تصوير بودكاست وأفلام تعريفيّة وموشن في الرياض | إبراهيم سعود",
      description: "استوديو بودكاست في الرياض بثلاث كاميرات، وأفلام تعريفيّة وموشن جرافيك وحملات لشركات التقنية والجهات: فكرة واسكربت وإخراج وتصوير ومونتاج.",
    },
    headline: "خدمتك معقّدة؟ نخلّيها تنفهم.",
    sub: "حلقات بودكاست، وأفلام تعريفيّة، وموشن، وإعلانات. الفكرة والاسكربت قبل الكاميرا، والتسليم بنسخة طويلة ونسخ قصيرة.",
    from: "يبدأ من ٢,٧٥٠ ريال",
    memoji: "big_happy",
    heroImg: "/v2/shots/studio.jpg",
    highlights: [
      { title: "ثلاث كاميرات.", text: "استوديو بودكاست جاهز في الرياض، بمايكات RØDE وإضاءة مجهّزة.", img: "/v2/shots/studio.jpg", kind: "cover", dark: true },
      { title: "موشن بهويّتك.", text: "عناوين وأرقام ونقاط تتحرّك بخطّك ولونك، في كلّ حلقة.", img: "/v2/shots/saad-name.jpg", kind: "frame", dark: true },
      { title: "رقم يثبت.", text: "الأرقام المهمّة تطلع على الشاشة، واضحة ومقروءة.", img: "/v2/shots/saad-stat.jpg", kind: "frame", dark: true },
    ],
    features: [{
      title: "من الفكرة إلى التسليم.",
      items: [
        { title: "نفهم الخدمة", text: "جلسة مع فريقك نطلّع فيها الرسالة الوحدة اللي لازم توصل." },
        { title: "الفكرة والاسكربت", text: "سرد مبنيّ على جمهورك، وتعتمده قبل أيّ تصوير." },
        { title: "التصوير أو الموشن", text: "في موقعك أو في الاستوديو، أو موشن جرافيك كامل لو الخدمة رقميّة." },
        { title: "التسليم بالنسخ", text: "نسخة طويلة للموقع والعروض، ونسخ قصيرة للمنصّات." },
      ],
    }],
    showWorks: true,
    compare: {
      models: [
        { name: "حلقة بودكاست", price: "٢,٧٥٠" },
        { name: "فيلم الخدمة", price: "٣,٤٠٠" },
        { name: "إعلانات المتاجر", price: "من ٧٥٠" },
      ],
      rows: [
        { label: "التصوير", v: ["في الاستوديو بثلاث كاميرات", "في موقعك أو الاستوديو، أو موشن", "إعلان طوليّ ٩:١٦"] },
        { label: "فكرة واسكربت", v: [false, true, "هوك واسكربت"] },
        { label: "النسخة الطويلة", v: ["الحلقة كاملة ليوتيوب", "٦٠–٩٠ ثانية", false] },
        { label: "مقاطع قصيرة", v: ["١٠ مقاطع", "٣ نسخ", false] },
        { label: "تصاميم وغلاف", v: [true, false, false] },
      ],
    },
    packages: [pkgs.podcast, pkgs.film, pkgs.storeAds],
    faqs: [
      { q: "تصوّرون خارج الرياض؟", a: "نعم، حسب المشروع، وتُضاف تكاليف السفر في عرض السعر." },
      { q: "كم مدّة التسليم؟ وكيف أستلم؟", a: "الفيلم التعريفيّ عادة من أسبوعين إلى أربعة حسب الموافقات، وتستلم الملفّات كاملة على Google Drive." },
      { q: "أقدر أشوف أعمال لجهات مثلنا؟", a: "أفلام للأحوال المدنيّة (أبشر) والهيئة العامّة للنقل وريناد المجد وهيلثون. فوق في الأعمال." },
      faqs[3],
    ],
    final: "خلّ عميلك يفهمك من أوّل دقيقة.",
  },
};

// ===== الذكاء الاصطناعي (/ai): ورش وتدريب واستشارات — الخدمة الأكثر طلباً =====
export const aiPage = {
  meta: {
    title: "ورش وتدريب الذكاء الاصطناعي للشركات والجهات والمدارس | إبراهيم سعود",
    description: "ورش عمل وتدريب واستشارات في الذكاء الاصطناعي بالرياض: كيف يفكّر فريقك ويبني ويتعلّم مع الذكاء الاصطناعي، وكيف يطوّر المدير نظامه بنفسه مع Claude.",
  },
  kicker: "ورش · تدريب · استشارات",
  name: "الذكاء الاصطناعي",
  headline: "في شغلك. مو في العناوين.",
  sub: "ورش وتدريب واستشارات للشركات والجهات والمدارس: كيف يفكّر فريقك ويبني ويتعلّم مع الذكاء الاصطناعي، بأمثلة من شغلكم أنتم.",
  services: [
    { title: "ورشة لفريقك", text: "ورشة حضوريّة أو عن بعد، مبنيّة على شغل جهتكم: الأساسيّات، وكيف تكلّمه صحّ، والأدوات اللي تفرق، وتطبيق حيّ.", memoji: "big_happy" as Memoji },
    { title: "تدريب المدير على نظامه", text: "لو عندكم نظام نَسَق أو موقع: جلسة يتعلّم فيها المدير يطوّر نظامه بنفسه مع Claude، بكلام عاديّ.", memoji: "proud" as Memoji },
    { title: "استشارة: وين يدخل؟", text: "جلسة نمرّ فيها على شغلكم ونحدّد وين يوفّر الذكاء الاصطناعي وقتاً فعلاً، ووين ما يستاهل.", memoji: "head_tilt" as Memoji },
  ],
  workshop: {
    eyebrow: "آخر ورشة قدّمتها",
    title: "لا تدرسه… جرّبه.",
    text: "ورشة لطلاب المرحلة المتوسطة والثانويّة: كيف تفكّر وتبني وتتعلّم مع الذكاء الاصطناعي. فيها قصّة من شغلي: كيف دخل المصحف الشريف منصّة حروف ودروس بالهندسة العكسيّة، وكيف تكلّمه صحّ، والأدوات اللي تستاهل.",
    imgs: ["/v2/shots/workshop-cover.jpg", "/v2/shots/workshop-story.jpg", "/v2/shots/workshop-method.jpg", "/v2/shots/workshop-tools.jpg"],
  },
  steps: [
    { name: "نفهم جمهوركم", text: "مين بيحضر، ووش يعرفون، ووش تبون يطلعون فيه." },
    { name: "نبنيها على شغلكم", text: "أمثلة من واقعكم، مو أمثلة عامّة من الإنترنت." },
    { name: "تطبيق حيّ", text: "كلّ واحد يطلع وقد سوّى شي بيده، مو بس سمع." },
  ],
  quote: {
    subject: "ورشة ذكاء اصطناعي",
    fields: [
      { id: "name", label: "الاسم" },
      { id: "org", label: "الجهة" },
      { id: "audience", label: "الحضور", type: "select", options: ["موظّفون", "مدراء وقياديّون", "طلاب", "معلّمون", "جمهور عامّ"] },
      { id: "count", label: "عدد الحضور التقريبيّ" },
      { id: "mode", label: "حضوريّ أو عن بعد", type: "select", options: ["حضوريّ في الرياض", "حضوريّ خارج الرياض", "عن بعد"] },
      { id: "date", label: "الموعد المقترح", placeholder: "مثلاً: الأسبوع الجاي، مساءً" },
      { id: "notes", label: "وش تبون تركّز عليه الورشة؟", type: "textarea" },
    ] as QuoteField[],
  },
  faqs: [
    { q: "الورشة لمين تناسب؟", a: "للموظّفين والمدراء والمعلّمين والطلاب. نبنيها على مستوى الحضور ونوع شغلهم." },
    { q: "تحتاج خبرة تقنيّة؟", a: "لا. نبدأ من الأساس، وكلّ واحد يطبّق بيده خلال الورشة." },
    { q: "كم سعرها؟", a: "حسب عدد الحضور والمدّة والمكان. أرسل الطلب من النموذج وأرد عليك بعرض سعر رسميّ." },
    { q: "تقدّم ورش عن بعد؟", a: "نعم، عن بعد أو حضوريّاً في الرياض، وخارجها حسب الموعد." },
  ],
};

// ===== التنقّل (الشريط العلويّ وقوائمه المنسدلة، مثل apple.com) =====
export type NavItem = { label: string; href: string; menu?: { title: string; big?: boolean; links: { label: string; href: string }[] }[] };
export const navItems: NavItem[] = [
  {
    label: "الذكاء الاصطناعي", href: "/ai/",
    menu: [
      { title: "استكشف", big: true, links: [{ label: "الذكاء الاصطناعي", href: "/ai/" }, { label: "آخر ورشة", href: "/ai/#workshop" }, { label: "اطلب ورشة", href: "/ai/#request" }] },
      { title: "الخدمات", links: [{ label: "ورشة لفريقك", href: "/ai/#services" }, { label: "تدريب المدير على نظامه", href: "/ai/#services" }, { label: "استشارة", href: "/ai/#services" }] },
    ],
  },
  {
    label: "نَسَق", href: "/systems/",
    menu: [
      { title: "استكشف نَسَق", big: true, links: [{ label: "نَسَق", href: "/systems/" }, { label: "جرّبه من جوالك", href: "/systems/#try" }, { label: "قارن", href: "/systems/#compare" }] },
      { title: "اطلب", links: [{ label: "اطلب عرض سعر", href: "/systems/#request" }, { label: "جلسة التشخيص", href: "/systems/#buy" }, { label: "نَسَق", href: "/systems/#buy" }, { label: "نَسَق Pro", href: "/systems/#buy" }] },
    ],
  },
  {
    label: "حضور", href: "/brand/",
    menu: [
      { title: "استكشف حضور", big: true, links: [{ label: "حضور", href: "/brand/" }, { label: "قارن الباقات", href: "/brand/#compare" }, { label: "هويّة", href: "/brand/#identity" }] },
      { title: "اطلب", links: [{ label: "حضور", href: "/brand/#buy" }, { label: "حضور Pro", href: "/brand/#buy" }, { label: "حضور+", href: "/brand/#buy" }] },
      { title: "المزيد", links: [{ label: "حلقة بودكاست", href: "/video/#buy" }, { label: "حزمة النشر", href: "/store/#addons" }] },
    ],
  },
  {
    label: "الاستوديو", href: "/video/",
    menu: [
      { title: "استكشف الاستوديو", big: true, links: [{ label: "الاستوديو", href: "/video/" }, { label: "الأعمال", href: "/video/#works" }, { label: "قارن", href: "/video/#compare" }] },
      { title: "اطلب", links: [{ label: "حلقة بودكاست", href: "/video/#buy" }, { label: "فيلم الخدمة", href: "/video/#buy" }, { label: "إعلانات المتاجر", href: "/ad-packages/" }] },
    ],
  },
  { label: "الأعمال", href: "/#works" },
  { label: "الباقات", href: "/store/" },
];
