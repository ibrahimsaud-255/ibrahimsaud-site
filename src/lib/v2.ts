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
  title: ["خلّ خبرتك", "تشتغل لك."],
  sub: "أبني لك الحضور والمحتوى والنظام: موقع يبيع، استوديو يصوّر، ونظام يدير شغلك. وطبّقته على نفسي أوّل.",
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
  href?: string; // رابط بدل واتساب
  // رابط دفع (Paylink من لوحة تلر). لو موجود يصير الزرّ الأساسيّ «ادفع الآن» وواتساب ثانويّ.
  pay?: { href: string; label?: string };
};

// ===== روابط الدفع =====
// أنشئ رابط دفع لكلّ باقة من لوحة تلر (Paylinks) والصقه هنا بمعرّف الباقة (id).
// الدفع عندنا ٥٠٪ مقدّم: لو الرابط للعربون اكتب label: "ادفع العربون ٥٠٪".
// الباقة اللي لها رابط يصير لها زرّان: «ادفع الآن» و«تواصل معي». بدون رابط: زرّ واتساب وحده.
// المعرّفات: session · hudoor · hudoor-pro · hudoor-plus · hawiya · publish · podcast · film · store-ads · nasaq · nasaq-pro
export const payLinks: Record<string, { href: string; label?: string }> = {
  // "podcast": { href: "https://secure.telr.com/..." },
};

export const pkgs = {
  session: { id: "session", name: "جلسة التشخيص", for: "قبل أيّ باقة", price: "٣٠٠", approved: true, items: ["ساعة في الاستوديو أو أونلاين", "خطّة مكتوبة لوضعك", "تُخصم من أيّ باقة"] },
  hudoor: { id: "hudoor", name: "حضور", for: "تبدأ حضورك", price: "٤,٩٠٠", approved: true, items: ["يوم تصوير", "صور لينكدإن احترافيّة", "فيديو تعريفيّ", "صفحة شخصيّة وبايو"] },
  hudoorPro: { id: "hudoor-pro", name: "حضور Pro", for: "كلّ شي من الصفر", price: "١٤,٩٠٠", approved: true, featured: true, items: ["جلسة تشخيص وخطّة", "هويّة في Claude", "موقع بصفحة بيع وباقات", "نظام عروض أسعار وفواتير", "يوم استوديو: فيديو وصور و٨ مقاطع", "خطّة محتوى ٩٠ يوماً"] },
  hudoorPlus: { id: "hudoor-plus", name: "حضور+", for: "محتوى كلّ شهر", price: "٦,٥٠٠", unit: "شهريّاً", approved: true, items: ["يوم تصوير شهريّ", "١٦ مقطعاً", "النشر على حساباتك"] },
  hawiya: { id: "hawiya", name: "هويّة", for: "هويّتك داخل Claude", price: "١,٤٩٠", approved: true, items: ["مهارة Claude بهويّتك: أغلفة ومنشورات وموشن", "دليل هويّة PDF تعرضه وتشاركه", "الخطّ واللون والشعار", "تشارك المهارة مع فريقك في Claude"] },
  publish: { id: "publish", name: "حزمة النشر", for: "فكرة وحدة، كلّ المنصّات", price: "٣,٩٠٠", approved: true, items: ["دفتر NotebookLM بمعادلة الانتشار وهويّتك", "برومت حزمة النشر", "أستوديو نشر مربوط بحساباتك"] },
  podcast: { id: "podcast", name: "حلقة بودكاست", for: "تبدأ بها محتواك", price: "٢,٧٥٠", approved: true, items: ["تصوير في الاستوديو بثلاث كاميرات", "الحلقة كاملة جاهزة ليوتيوب", "١٠ مقاطع قصيرة", "تصاميم الحلقة والغلاف"] },
  film: { id: "film", name: "فيلم الخدمة", for: "فيلم تعريفيّ واحد", price: "٣,٤٠٠", approved: true, featured: true, items: ["فكرة واسكربت", "تصوير أو موشن", "نسخة ٦٠–٩٠ ثانية", "٣ نسخ قصيرة"] },
  storeAds: { id: "store-ads", name: "إعلانات المتاجر", for: "للمتاجر الإلكترونيّة", price: "من ٧٥٠", approved: true, href: "/ad-packages/", items: ["إعلان طوليّ ٩:١٦", "هوك واسكربت", "تسليم خلال ٣ أيّام"] },
  nasaq: { id: "nasaq", name: "نَسَق", for: "للمنشآت وشركات الشخص الواحد", price: "من ٥,٠٠٠", approved: true, items: ["نظام على مقاسك", "عروض أسعار وفواتير ومحاسبة", "العملاء والمشاريع والتقويم", "تدريب التعديل بـClaude"] },
  nasaqPro: { id: "nasaq-pro", name: "نَسَق Pro", for: "للجمعيّات والجهات بفِرق", price: "من ٧,٠٠٠", approved: true, featured: true, items: ["كلّ ما في نَسَق", "فريق وصلاحيّات لكلّ قسم", "ماليّة بدورة اعتماد، وحوكمة", "المستفيدون والتطوّع والموارد البشريّة", "موقع الجهة يُدار من النظام"] },
} satisfies Record<string, Pkg>;


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
export type Demo = { id: string; name: string; kind: string; text: string; img: string; href: string; dash?: string; qr: string };
export const demos: Demo[] = [
  { id: "nasaq", name: "نَسَق", kind: "نظام إدارة · نسخة عرض", text: "ادخل كمدير، وبدّل «عرض كـ» تشوف النظام بعين أيّ موظّف: المالية والمهامّ والوارد.", img: "/v2/shots/demo-nasaq.jpg", href: "/demo/nasaq/index.html", qr: "/v2/qr/nasaq.svg" },
  { id: "ruso", name: "جمعيّة رسو", kind: "موقع + نظام داخليّ", text: "موقع الجمعيّة ولوحة تحكّمها: سندات صرف، وحوكمة، ومستفيدون، وتطوّع.", img: "/v2/shots/demo-ruso-site.jpg", href: "/demo/ruso/website/index.html", dash: "/demo/ruso/system/index.html", qr: "/v2/qr/ruso.svg" },
  { id: "manabir", name: "منابر", kind: "منصّة بخمس صلاحيّات", text: "تنظيم الأنشطة الدعويّة في المساجد: ادخل كمدير النظام، أو ممثّل الوزارة، أو مشرف المسجد.", img: "/v2/shots/demo-manabir.jpg", href: "/demo/manabir/index.html?login=1", dash: "/demo/manabir/index.html?dash=1", qr: "/v2/qr/manabir.svg" },
  { id: "takamul", name: "التكامل المتّحدة", kind: "موقع شركة + لوحة محتوى", text: "موقع شركة استشارات بالعربيّ والإنجليزيّ، ومحتواه كلّه يتعدّل من لوحة تحكّم.", img: "/v2/shots/demo-takamul.jpg", href: "/demo/takamul/index.html", dash: "/demo/takamul/dashboard/index.html", qr: "/v2/qr/takamul.svg" },
];

// ===== المنتجات (صفحة لكلّ منتج، وكلّ حملة جوجل تودّي لوحدة) =====
export type Highlight = { title: string; text: string; img: string; kind: "phone" | "cover" | "memoji" | "frame"; dark?: boolean };
export type Compare = { models: { name: string; price: string; unit?: string }[]; rows: { label: string; v: (string | boolean)[] }[] };

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
  showcase?: { id?: string; eyebrow: string; title: string; text: string; imgs: string[] };
  demos?: boolean;
  showWorks?: boolean;
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
      url: "ibrahimsaud.com/app",
      phone: "/v2/shots/phone-office.jpg",
      href: "/demo/nasaq/index.html",
    },
    showcase: {
      id: "identity",
      eyebrow: "هويّة",
      title: "هويّتك تشتغل معك كلّ يوم.",
      text: "دليل هويّة ومهارة داخل Claude: تقول له «سوّ لي غلاف لهالحلقة» ويطلع بهويّتك. هذي هويّة سعد السيف اللي سلّمناها، وموشن حلقاته يطلع منها.",
      imgs: ["/v2/shots/saad-quote.jpg", "/v2/shots/saad-name.jpg", "/v2/shots/saad-stat.jpg"],
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
    headline: "شغلك كلّه. في مكان واحد.",
    sub: "نظام إدارة عربيّ على مقاسك، بدل إكسل وواتساب وبرنامج فواتير. ملكك أنت، وتعدّل عليه بالذكاء الاصطناعيّ بكلام عاديّ.",
    from: "يبدأ من ٥,٠٠٠ ريال",
    memoji: "proud",
    heroPhones: ["/v2/shots/demo-ruso-sys.jpg", "/v2/shots/demo-nasaq.jpg", "/v2/shots/demo-manabir-dash.jpg"],
    heroScreen: { src: "/v2/shots/desk-office.jpg", url: "ibrahimsaud.com/app", phone: "/v2/shots/phone-office.jpg" },
    highlights: [
      { title: "المكتب.", text: "كلّ تطبيقات شغلك في شاشة وحدة: المبيعات والفوترة والعملاء والمحاسبة والتقويم.", img: "/v2/shots/hl-office.jpg", kind: "phone" },
      { title: "كلّ موظّف يشوف شغله.", text: "صلاحيّات لكلّ قسم، و«عرض كـ» تجرّب فيه النظام بعين أيّ موظّف.", img: "/v2/shots/demo-manabir.jpg", kind: "phone" },
      { title: "الموقع من نفس النظام.", text: "أخبار وبرامج وشركاء وتسجيلات، تتعدّل من لوحة التحكّم.", img: "/v2/shots/demo-ruso-site.jpg", kind: "phone", dark: true },
      { title: "جرّبه من جوالك.", text: "نسخ عرض حيّة تفتحها الحين، بدون حساب وبدون تحميل.", img: "/v2/shots/demo-manabir-dash.jpg", kind: "phone" },
      { title: "الأرقام قدّامك.", text: "طلبات تنتظرك، ومهامّ متأخّرة، وصافي حركة السنة، من أوّل شاشة.", img: "/v2/shots/demo-ruso-sys.jpg", kind: "phone" },
    ],
    demos: true,
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

// ===== التنقّل (الشريط العلويّ وقوائمه المنسدلة، مثل apple.com) =====
export type NavItem = { label: string; href: string; menu?: { title: string; big?: boolean; links: { label: string; href: string }[] }[] };
export const navItems: NavItem[] = [
  {
    label: "حضور", href: "/brand/",
    menu: [
      { title: "استكشف حضور", big: true, links: [{ label: "حضور", href: "/brand/" }, { label: "قارن الباقات", href: "/brand/#compare" }, { label: "هويّة", href: "/brand/#identity" }] },
      { title: "اطلب", links: [{ label: "حضور", href: "/brand/#buy" }, { label: "حضور Pro", href: "/brand/#buy" }, { label: "حضور+", href: "/brand/#buy" }] },
      { title: "المزيد", links: [{ label: "حلقة بودكاست", href: "/video/#buy" }, { label: "حزمة النشر", href: "/store/#addons" }] },
    ],
  },
  {
    label: "نَسَق", href: "/systems/",
    menu: [
      { title: "استكشف نَسَق", big: true, links: [{ label: "نَسَق", href: "/systems/" }, { label: "جرّبه من جوالك", href: "/systems/#try" }, { label: "قارن", href: "/systems/#compare" }] },
      { title: "نسخ العرض", links: demos.map((d) => ({ label: d.name, href: d.href })) },
      { title: "اطلب", links: [{ label: "جلسة التشخيص", href: "/systems/#buy" }, { label: "نَسَق", href: "/systems/#buy" }, { label: "نَسَق Pro", href: "/systems/#buy" }] },
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
