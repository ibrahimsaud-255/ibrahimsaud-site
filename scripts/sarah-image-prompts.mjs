// ===================================================================
// مولّد أوامر صور متجر «إبرة سارة»
//
//   node scripts/sarah-image-prompts.mjs
//
// يبني:
//   أوامر-صور-إبرة-سارة.md        ← أوامر جاهزة للّصق في Gemini
//   scripts/sarah-image-prompts.json ← JSON للتوليد الآلي
//
// الفلسفة: كل أمر مكتوب بلغة مصوّر محترف حقيقي — كاميرا، عدسة، إضاءة،
// عيوب طبيعية، وحظر صريح لتلميحات الذكاء الاصطناعي.
// ===================================================================

import { writeFileSync } from "node:fs";

// ------------------------- الأنماط الأساسية -------------------------

// نمط المنتجات (Studio Product): كاتالوج فاخر، خلفية بيضاء نقيّة
const STUDIO = [
  "Shot on Hasselblad H6D-100c medium format camera with 80mm f/2.8 lens at f/8, ISO 100.",
  "Professional e-commerce lookbook photograph in the aesthetic of high-end Riyadh fashion houses like Toby's Estate and Nafisa.",
  "Pure seamless white paper backdrop (#FFFFFF, blown-out to true white with no gradient).",
  "Single soft key light from front-left through a large 1.8m octabox, plus a subtle silver bounce on the right; a gentle natural cast shadow on the ground.",
  "Extreme fabric realism: visible individual threads, natural asymmetric folds, one tiny natural imperfection (a stray thread, a subtle crease from real fabric drape).",
  "Slight warm tone from a 1/4 CTO gel on the key.",
  "Absolutely photorealistic — indistinguishable from a real photograph shot in a real studio.",
  "Strict anti-AI: NO computer-generated plastic look, NO over-smoothed surfaces, NO artificial symmetry, NO oversaturation, NO stock-photo perfection, NO AI-render tell-tales.",
  "No people, no faces, no visible mannequin head or neck, no text, no logo, no watermark, no props.",
].join(" ");

// نمط الماكرو (تفصيلة قماش أو تطريز)
const MACRO = [
  "Extreme macro photograph shot on Canon EOS R5 with Canon RF 100mm f/2.8L Macro IS lens at f/4.5, 1/200s, ISO 400.",
  "Fabric fills the entire frame; every fiber, weave and thread clearly visible; shallow depth of field with only 2mm in focus, the rest gently falling to soft creamy bokeh.",
  "Natural raking side light from a single window at 45°, revealing surface texture.",
  "One tiny real-life imperfection (a stray thread, a dust mote, a subtle color variation).",
  "Photorealistic, absolutely NO CG, NO over-smoothing, NO artificial cleanliness, NO stock-photo aesthetic, NO AI-render feel.",
].join(" ");

// نمط اللايف/الأتموسفير للدورة والموقع (Kinfolk-style editorial)
const EDITORIAL = [
  "Editorial lifestyle photograph shot on Fujifilm Pro 400H film with a Contax G2 rangefinder and 35mm f/2 lens.",
  "Soft natural window light from a north-facing window during golden hour, creamy shallow depth of field.",
  "Warm, calm, contemplative mood in the tradition of Kinfolk magazine and modern Middle Eastern craft editorials (compare to the work of Tessa Chrisp and Rasha Aljundi).",
  "Natural imperfections deliberately included: a stray thread on the table, folded fabric slightly askew, a warm wooden surface with genuine everyday wear, a coffee cup ring.",
  "Absolutely photorealistic film grain aesthetic — indistinguishable from a real photograph.",
  "Strict anti-AI: NO plastic sheen, NO artificial cleanliness, NO CG rendering, NO oversaturated colors, NO stock-photo perfection.",
  "No faces visible unless specified; no text, no logo, no watermark.",
].join(" ");

const RATIO_TALL_FULL = "Vertical 4:5 aspect ratio, full garment inside the frame with even 8% margin on all sides.";
const RATIO_TALL_MACRO = "Vertical 4:5 aspect ratio.";
const RATIO_SQ = "Perfect square 1:1 aspect ratio, fabric fills the entire frame edge to edge.";
const RATIO_HERO_TALL = "Vertical 3:4 aspect ratio.";
const RATIO_HERO_SQ = "Perfect square 1:1 aspect ratio.";
const RATIO_WIDE = "Wide 16:9 aspect ratio.";

// -------------------- منتجات المتجر --------------------
const products = [
  {
    id: "abaya-classic",
    ar: "عباية تفصيل كلاسيك",
    garment:
      "an elegant deep matte black open-front abaya, straight classic cut falling to the floor, wide flowing angel sleeves, heavy premium French Nida crepe fabric with a soft luxurious matte drape, no embellishment or trim, made in Riyadh atelier style",
    focus:
      "the clean hand-finished hem edge of a matte black French Nida crepe abaya — a single perfect topstitch line, fine invisible slip-stitch, one tiny natural thread strand",
    color: "matte black",
  },
  {
    id: "abaya-embroidered",
    ar: "عباية مطرّزة",
    garment:
      "a black open-front abaya with delicate antique-gold hand embroidery running along the wide angel sleeve cuffs and the front hem, floor length, luxurious heavy crepe fabric, the embroidery clearly hand-done (slight irregularity, dimensional threadwork, not machine-perfect)",
    focus:
      "antique-gold hand embroidery on black crepe, individual metallic threads clearly visible, a few tiny gold beads sewn in, one thread of the embroidery loop hanging naturally",
    color: "black with antique gold",
  },
  {
    id: "abaya-prayer",
    ar: "عباية صلاة",
    garment:
      "a soft cream two-piece prayer set for women — a loose long over-top with wide sleeves and a matching wide gathered skirt — lightweight breathable Egyptian cotton, simple and modest, displayed side by side with the skirt slightly overlapping the top",
    focus:
      "the soft cream Egyptian cotton weave of a prayer garment, a rolled and hand-hemmed edge, one gentle natural fold, a hint of the soft raw-cotton texture",
    color: "soft cream",
  },
  {
    id: "evening-dress",
    ar: "فستان سهرة تفصيل",
    garment:
      "a floor-length emerald green silk-velvet evening gown, sculpted fitted bodice with princess seams, long dramatic flared skirt with a subtle train, short cap sleeves, rich deep pile velvet with directional light-catching sheen",
    focus:
      "emerald green silk velvet fabric close-up, dense short pile catching the light with directional sheen shift, one tiny lint fiber, luxurious depth of color",
    color: "emerald velvet",
  },
  {
    id: "day-dress",
    ar: "فستان يومي",
    garment:
      "a sand-beige lightweight linen midi day dress with a relaxed A-line silhouette, long straight sleeves with a subtle roll-cuff, modest high round neckline, natural soft asymmetric folds from real linen drape (linen wrinkles slightly — keep that natural)",
    focus:
      "natural sand-beige linen weave close-up showing slub threads and a French-seamed side, one tiny stray linen fiber, honest matte texture with no synthetic sheen",
    color: "sand beige linen",
  },
  {
    id: "jalabiya",
    ar: "جلابية مطرّزة",
    garment:
      "a flowing dusty-rose jalabiya (loose Gulf-style kaftan dress) with wide angel sleeves, floor length, intricate hand-done gold embroidery around the neckline and sleeve edges (goldwork clearly artisanal, not mechanically uniform), soft satin-back crepe fabric with a subtle matte-to-sheen finish",
    focus:
      "intricate gold hand embroidery around the neckline of a dusty-rose jalabiya, raised metallic threadwork with tiny seed beads, shallow depth of field revealing every couched thread",
    color: "dusty rose",
  },
  {
    id: "kaftan",
    ar: "قفطان مغربي",
    garment:
      "a royal blue Moroccan kaftan (caftan) with authentic hand-woven gold sfifa trim down the center front and a matching gold-tasseled belt at the waist, floor length, wide bell sleeves, rich medium-weight satin, worn look of a real garment (not brand-new plastic-perfect)",
    focus:
      "hand-woven gold sfifa trim and a traditional knotted button on royal blue satin — the trim clearly artisanal, one tiny loose thread, traditional Moroccan Fes-style detailing",
    color: "royal blue",
  },
  {
    id: "home-set",
    ar: "طقم منزلي (روب + قميص)",
    garment:
      "a two-piece champagne silk satin loungewear set — a long belted robe and a matching slip nightdress — displayed side by side with the robe belt casually knotted, glossy liquid sheen with realistic silk drape",
    focus:
      "champagne silk satin close-up showing the glossy liquid sheen, a delicate French-piping seam, one natural silk fold, subtle color shifts from real silk",
    color: "champagne silk",
  },
  {
    id: "skirt",
    ar: "تنورة تفصيل",
    garment:
      "a long olive green pleated skirt with crisp accordion pleats falling from a fitted flat waistband to the ankle, matte medium-weight crepe fabric, one pleat slightly out of line (real fabric behavior, not CG perfect)",
    focus:
      "crisp accordion pleats of an olive green crepe skirt close-up, sharp light-and-shadow contrast between each pleat, one pleat naturally slightly softer than the others",
    color: "olive crepe",
  },
  {
    id: "blouse",
    ar: "بلوزة / قميص تفصيل",
    garment:
      "a crisp white cotton blouse with long sleeves rolled to three-quarter, classic pointed collar, hidden button placket, tailored clean lines with authentic bench-tailoring feel (not fast-fashion perfect)",
    focus:
      "the collar and hidden button placket of a crisp white cotton shirt, fine even stitching, one real mother-of-pearl button with natural iridescence, tiny fabric weave visible",
    color: "crisp white",
  },
  {
    id: "alteration",
    ar: "تعديل وتضييق",
    garment:
      "a wooden tailor's dress form draped with a garment mid-fitting, a soft measuring tape hanging from the shoulder, dressmaker pins marking an alteration line on the waist, brass tailoring scissors resting on the surface nearby",
    focus:
      "close-up of dressmaker pins and a soft measuring tape marking an alteration on wool fabric on a dress form — the pins glinting, the tape draped naturally, one pin slightly askew",
    color: "atelier",
  },
];

// -------------------- خامات المورد --------------------
const fabrics = [
  { id: "nida", ar: "نيدا فرنسي", en: "matte deep black French Nida crepe fabric, heavy opaque weave, completely non-reflective matte surface, soft even folds with one asymmetric natural crease" },
  { id: "japanese-crepe", ar: "كريب ياباني", en: "deep olive green Japanese crepe fabric, fine pebbled surface texture, heavy luxurious drape, subtle matte sheen catching the raking light" },
  { id: "silk-satin", ar: "ساتان حرير", en: "champagne gold pure silk satin, glossy liquid sheen with real silk color-shift, smooth flowing folds catching bright highlights, one thread of stray silk lint" },
  { id: "chiffon", ar: "شيفون حرير", en: "dusty rose real silk chiffon, sheer airy translucent layers, delicate floating folds backlit through a window, one tiny snag typical of real chiffon" },
  { id: "linen", ar: "كتان مخلوط", en: "natural sand-beige heavyweight linen blend, clearly visible woven slub texture with irregular thread thickness, relaxed matte folds with natural linen wrinkles" },
  { id: "velvet", ar: "مخمل", en: "emerald green silk velvet, dense short pile catching directional light with real color-shift sheen, deep rich color, one tiny fiber standing up naturally" },
  { id: "embroidered-lace", ar: "دانتيل مطرّز", en: "off-white embroidered floral lace on fine tulle net, raised hand-couched thread embroidery, scalloped selvedge edge, one loose thread from real hand work" },
  { id: "beaded-tulle", ar: "تُل مطرّز بالخرز", en: "champagne beaded tulle, hand-sewn Swarovski crystals and freshwater pearls sparkling on a sheer net base, one thread visible from the couching" },
  { id: "egyptian-cotton", ar: "قطن مصري", en: "pure white Egyptian long-staple cotton, fine smooth weave with visible thread structure, crisp clean folds with one natural wrinkle" },
  { id: "georgette", ar: "جورجيت", en: "deep navy blue silk georgette, lightweight crinkled surface with visible crimp, fluid rippling drape, one gentle asymmetric fold" },
];

// -------------------- قوالب اللقطات --------------------
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const shot = {
  1: (p) =>
    `${cap(p.garment)}, displayed on a professional invisible ghost mannequin (the neck opening and shoulders should be completely hollow — DO NOT render a face, head, neck stump, or any body part; the garment appears to hold its own shape as if worn by an invisible person), photographed straight-on, garment centered and naturally symmetric with subtle asymmetric fabric drape. ${RATIO_TALL_FULL} ${STUDIO}`,
  2: (p) =>
    `${cap(p.focus)}, filling the entire frame. ${RATIO_TALL_MACRO} ${MACRO}`,
  3: (p) =>
    `${cap(p.garment)}, hanging on a slim natural-oak wooden hanger against a plain warm-white wall in an atelier, front view, natural relaxed drape with one sleeve slightly turned, full garment visible. ${RATIO_TALL_FULL} ${STUDIO}`,
  4: (p) =>
    `${cap(p.garment)}, neatly folded into a crisp rectangle, top-down flat-lay view on a smooth white cotton surface with one visible fabric weave, one folded edge facing the camera. ${RATIO_TALL_FULL} ${STUDIO}`,
};

const shotAr = {
  1: "اللقطة الأمامية — على مانيكان شفاف",
  2: "تفصيلة مقرّبة — نسيج/تطريز",
  3: "على العلّاقة",
  4: "مطوية (Flat-lay)",
};

// -------------------- صور الدورة والموقع --------------------
const courseAndSite = [
  // --- صور الدورة (Course) ---
  {
    file: "public/sarah/course/hero.jpg",
    title: "الدورة — الصورة الرئيسية للهيرو",
    size: "1600×2000 (4:5)",
    group: "الدورة",
    prompt:
      `Warm intimate editorial photograph of a Saudi woman's hands (no face, no head, only hands from mid-forearm down) sewing a beige linen garment on a vintage cream-colored Singer sewing machine in a sunlit Al-Ahsa home atelier. Her hands wear a simple wedding ring. The machine sits on a warm walnut wood table. Golden morning sunlight streams through a window behind creating rim light on the fabric. A small brass thimble and a spool of ivory thread sit beside the machine. Depth of field: hands and machine sharp, background softly out of focus revealing a hint of embroidered wall hanging. ${RATIO_TALL_FULL} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/atelier.jpg",
    title: "الدورة — ركن الأتيليه (الأتموسفير)",
    size: "1600×1200 (4:3)",
    group: "الدورة",
    prompt:
      `Wide editorial photograph of a calm sunlit sewing atelier corner in an Al-Ahsa home. A warm walnut wood work table holds a vintage sewing machine, folded stacks of linen and crepe in earth tones (sand, olive, dusty rose), wooden thread spools, a pair of brass tailoring scissors, a soft measuring tape draped over the edge. Above the table, a small handmade wall organizer holds pattern rulers. Warm afternoon sunlight from a shuttered window paints diagonal light bars across the scene. Tone: honest, worked-in, real — not perfectly styled. ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/classroom.jpg",
    title: "الدورة — قاعة التدريب فارغة",
    size: "1600×1067 (16:9)",
    group: "الدورة",
    prompt:
      `Interior photograph of a modest but elegant women's training classroom in Al-Ahsa, Saudi Arabia. Four warm-oak worktables arranged in a horseshoe, each with a cream Singer sewing machine and a soft desk lamp. A large window on the right lets in soft natural morning light. A large chalkboard at the front shows the words «إبرة سارة» handwritten in Arabic calligraphy. Warm earth-tone rug on the floor. Empty room prepared before students arrive. ${RATIO_WIDE} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/materials-flatlay.jpg",
    title: "الدورة — المواد المرتّبة (Flat-lay)",
    size: "1400×1400 (1:1)",
    group: "الدورة",
    prompt:
      `Top-down knolling flat-lay photograph on a warm off-white linen tablecloth: three folded fabric swatches (beige linen, olive crepe, dusty rose satin) stacked at the top-right; four wooden thread spools in ivory, sand, black and gold; a brass thimble; a pair of vintage brass tailoring scissors; a folded soft measuring tape; five different sewing needles arranged in a fan; three dressmaker pins; a small cream notebook with a leather cover and a wooden pencil. Everything spaced with generous negative space in the Kinfolk-magazine style. Soft even overhead natural light. ${RATIO_HERO_SQ} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/certificate.jpg",
    title: "الدورة — الشهادة على مكتب خشبي",
    size: "1400×1400 (1:1)",
    group: "الدورة",
    prompt:
      `Top-down photograph of a beige printed training certificate on a warm walnut wood desk — the certificate blank of any specific text and logo (write only the words «شهادة إتمام» in elegant Arabic calligraphy at the top, and a decorative Middle Eastern arabesque border in antique gold). Beside the certificate: a wooden Cross fountain pen, a small brass wax-seal stamp, one dry olive branch, and a single spool of gold thread. Soft afternoon window light from the top-left. ${RATIO_HERO_SQ} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/hands-cutting.jpg",
    title: "الدورة — يدان تقصّان قماشاً",
    size: "1200×1500 (4:5)",
    group: "الدورة",
    prompt:
      `Close-up over-the-shoulder photograph of a Saudi woman's hands (no face visible — only hands and forearms in a modest cream sleeve) cutting a piece of dusty rose satin with vintage brass tailoring scissors. A paper pattern is pinned to the fabric with dressmaker pins. The wooden work surface is worn and warm. Depth of field: hands sharp, background soft. One paper pattern edge slightly lifted. ${RATIO_TALL_FULL} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/finished-piece.jpg",
    title: "الدورة — قطعة الخرّيجة النهائية",
    size: "1200×1500 (4:5)",
    group: "الدورة",
    prompt:
      `Editorial photograph of a finished simple sand-beige linen A-line skirt hanging on a slim natural oak wooden hanger against a soft warm-white linen curtain. A small handwritten paper tag hangs from the hanger by a jute string, reading only «إبرة سارة» in Arabic calligraphy. Soft warm afternoon window light from the left. Full garment visible with natural drape. ${RATIO_TALL_FULL} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/course/thread-spools.jpg",
    title: "الدورة — بكرات الخيوط (تفصيلة)",
    size: "1400×1400 (1:1)",
    group: "الدورة",
    prompt:
      `Macro photograph of a wooden crate holding twenty vintage-style thread spools in the color palette of the site: sand beige, cream, ivory, warm gray, dusty rose, olive green, deep navy, matte black, antique gold, emerald. The wooden crate sits on a warm walnut surface. Soft raking window light from the left. Shallow depth of field with only the front row of spools in perfect focus. ${RATIO_HERO_SQ} ${EDITORIAL}`,
  },
  // --- صور الموقع (About/Site atmosphere) ---
  {
    file: "public/sarah/site/about.jpg",
    title: "الموقع — من نحن (يدان تحيكان)",
    size: "1600×1067 (16:9)",
    group: "الموقع",
    prompt:
      `Editorial wide photograph of a mature Saudi woman's hands (no face visible — only hands, both wearing a simple gold wedding ring) hand-embroidering delicate gold thread onto dusty rose satin. She sits at a warm walnut work table in a sunlit atelier in Al-Ahsa. A small brass embroidery hoop holds the fabric taut. Warm afternoon sunlight streams from a window on the right, creating a soft rim light on the fabric. Depth of field: hands and hoop sharp, background gently blurred showing a hint of the atelier. ${RATIO_WIDE} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/site/packaging.jpg",
    title: "الموقع — تجهيز الطلب للشحن",
    size: "1400×1400 (1:1)",
    group: "الموقع",
    prompt:
      `Top-down photograph of a folded finished dusty-rose satin garment neatly placed inside an open kraft-brown gift box lined with cream tissue paper. Beside the box: a natural jute string, a small handwritten paper tag reading only «إبرة سارة» in Arabic calligraphy, a sprig of dried lavender, a small wax seal stamp with a needle-and-thread motif in ivory wax. Warm walnut wood table surface. Soft even overhead natural light. ${RATIO_HERO_SQ} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/site/sewing-machine.jpg",
    title: "الموقع — ماكينة الخياطة الفينتاج (تفصيلة)",
    size: "1200×1500 (4:5)",
    group: "الموقع",
    prompt:
      `Macro editorial photograph of the head of a cream vintage Singer 401A sewing machine with a spool of ivory thread mounted on top, and the presser foot pressing down on a piece of sand-beige linen. The machine's chrome details and etched Singer script logo are visible. Warm afternoon side-light. Depth of field: needle plate and presser foot sharp, machine body softly out of focus. ${RATIO_TALL_FULL} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/site/fabric-market.jpg",
    title: "الموقع — سوق الأقمشة",
    size: "1600×1067 (16:9)",
    group: "الموقع",
    prompt:
      `Wide editorial photograph inside a traditional Arabian fabric souq (Al-Qaisariya in Al-Hofuf, Saudi Arabia) — tall stacked bolts of fabric in every color arranged floor to ceiling, warm incandescent light overhead, one lone dusty ray of sunlight breaking through from a high window. The frame captures the endless columns of folded fabrics receding into shallow depth of field. Muted colors overall with punctuation of one bright emerald green fabric roll in mid-frame. No people visible. ${RATIO_WIDE} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/site/sketchbook.jpg",
    title: "الموقع — دفتر رسم التصاميم",
    size: "1400×1400 (1:1)",
    group: "الموقع",
    prompt:
      `Top-down photograph of an open cream sketchbook on a warm walnut wood table. The left page shows a delicate pencil sketch of an abaya design with fabric swatches (dusty rose satin, sand-beige linen, matte black crepe) pinned beside it. The right page shows handwritten notes in Arabic calligraphy (only decorative — no readable words needed). Beside the sketchbook: a wooden Cross pencil, a cup of Arabic coffee in a small brass cup, a single dried rose. Warm morning window light from the top-left. ${RATIO_HERO_SQ} ${EDITORIAL}`,
  },
  {
    file: "public/sarah/site/tags-detail.jpg",
    title: "الموقع — تفصيلة الوسم (Branding)",
    size: "1400×1400 (1:1)",
    group: "الموقع",
    prompt:
      `Extreme close-up macro photograph of a small cream cotton tag hand-stitched to the inside neckline of a black crepe abaya. The tag reads only the words «إبرة سارة» in Arabic calligraphy embroidered in antique-gold thread. Extremely shallow depth of field with only the tag's stitching in focus, the abaya fabric behind falling to soft dark blur. ${RATIO_HERO_SQ} ${MACRO}`,
  },
];

// -------------------- تجميع الأوامر --------------------
const items = [];

for (const p of products) {
  for (const i of [1, 2, 3, 4]) {
    items.push({
      file: `public/sarah/products/${p.id}-${i}.jpg`,
      configPath: `/sarah/products/${p.id}-${i}.jpg`,
      group: "منتج",
      title: `${p.ar} — ${shotAr[i]}`,
      size: "1200×1500 (4:5)",
      prompt: shot[i](p),
    });
  }
}

for (const f of fabrics) {
  items.push({
    file: `public/sarah/fabrics/${f.id}.jpg`,
    configPath: `/sarah/fabrics/${f.id}.jpg`,
    group: "خامة",
    title: `خامة: ${f.ar}`,
    size: "1000×1000 (1:1)",
    prompt:
      `Macro studio photograph of ${f.en}. Fabric laid flat filling the entire frame, photographed straight from directly above, showing true texture and color under soft even overhead studio light. ${RATIO_SQ} ${MACRO}`,
  });
}

// إعادة صور الهيرو الموجودة + الدورة والموقع
const heroes = [
  {
    file: "public/sarah/hero-1.jpg",
    configPath: "/sarah/hero-1.jpg",
    title: "الهيرو ١ — عباية مطرّزة كاملة (طولية)",
    size: "1200×1600 (3:4)",
    group: "الواجهة",
    prompt: `Full-length front view of a black open-front abaya with fine antique-gold hand embroidery on the wide angel sleeves and the front hem, displayed on an invisible ghost mannequin (completely hollow — no face, no head, no neck stump), elegant floor-length natural drape. ${RATIO_HERO_TALL} ${STUDIO}`,
  },
  {
    file: "public/sarah/hero-2.jpg",
    configPath: "/sarah/hero-2.jpg",
    title: "الهيرو ٢ — تفصيلة تطريز ذهبي (مربّعة)",
    size: "1200×1200 (1:1)",
    group: "الواجهة",
    prompt: `Extreme close-up macro photograph of delicate hand-done gold embroidery on dusty-rose satin fabric, raised metallic threads couched by hand, tiny seed beads, one thread hanging naturally, shallow depth of field. ${RATIO_HERO_SQ} ${MACRO}`,
  },
  {
    file: "public/sarah/hero-3.jpg",
    configPath: "/sarah/hero-3.jpg",
    title: "الهيرو ٣ — تشكيلة خامات (مربّعة)",
    size: "1200×1200 (1:1)",
    group: "الواجهة",
    prompt: `Top-down knolling photograph of four folded fabric swatches arranged in a neat two-by-two grid on a warm off-white linen surface, with generous negative space around each swatch — champagne silk satin (top-left), deep olive crepe (top-right), emerald green velvet (bottom-left), sand-beige linen (bottom-right). Each swatch clearly shows its distinct texture. Soft even overhead studio light. ${RATIO_HERO_SQ} ${STUDIO}`,
  },
];
for (const h of heroes) items.push(h);

for (const it of courseAndSite) items.push({ ...it, configPath: "/" + it.file.replace("public/", "") });

// -------------------- الإخراج --------------------
writeFileSync("scripts/sarah-image-prompts.json", JSON.stringify(items, null, 2));

let md = `# أوامر توليد صور «إبرة سارة» بالذكاء الاصطناعي

**${items.length} أمر** — للمتجر (${items.filter(i=>i.group==='منتج').length}) والخامات (${items.filter(i=>i.group==='خامة').length}) والواجهة (${items.filter(i=>i.group==='الواجهة').length}) والدورة (${items.filter(i=>i.group==='الدورة').length}) وأتموسفير الموقع (${items.filter(i=>i.group==='الموقع').length}).

كل أمر مصمَّم بلغة مصوّر محترف حقيقي — كاميرا، عدسة، إضاءة، وعيوب طبيعية — عشان الصورة تطلع كأنها من أتيليه حقيقي، مو من AI.

---

## القواعد الذهبية عشان الصورة ما تبان "مصنوعة بالذكاء"

### ١. الكاميرا والعدسة تفرق
كل أمر يذكر كاميرا محدّدة (Hasselblad للاستوديو، Fujifilm للأتموسفير، Canon Macro للتفاصيل). AI درّبت على ملايين الصور المصنّفة بأسماء الكاميرات، وذكرها يوجّه الأسلوب للواقعية.

### ٢. اطلب العيوب صراحة
- «one stray thread hanging naturally»
- «one tiny lint fiber»
- «one pleat slightly softer than the others»
- «a subtle asymmetric fold»
- «one paper edge slightly lifted»

الكمال المتناهي = تلميح AI. العيب الصغير الطبيعي = واقعية.

### ٣. الحظر الصريح المستمر
كل الأوامر تنتهي بحظر واضح: «NO CG plastic look, NO over-smoothing, NO artificial symmetry, NO stock-photo aesthetic, NO AI-render tell-tales.»

### ٤. مانيكان شفاف (Ghost Mannequin)
مشكلة معروفة في AI — كثيراً ما يرسم رأساً أو رقبة أو وجهاً. الأمر يقول صراحة:
> «invisible ghost mannequin — completely hollow, DO NOT render a face, head, neck stump, or any body part»

لو طلع شي غلط، أضيف: \`hollow neck opening, no anatomy visible, headless mannequin form\`.

### ٥. الاتساق بين لقطات المنتج الواحد
في Gemini/Google AI Studio:
1. ولّد اللقطة ١ (الأمامية)
2. في نفس المحادثة ارفعها مع اللقطة ٢ واكتب: \`Same exact garment as the previous image — same fabric color, same cut, same details. Now shown [close-up macro of the hem stitching / folded flat-lay on white / etc]\`

### ٦. لو الخلفية طلعت رمادية أو ملوّنة
أضف في الأمر: \`pure white background #FFFFFF, blown out to full white, no ambient tint, no gradient, no shadow across the background\`.

### ٧. لو الألوان طلعت مبالغ فيها
أضف: \`natural muted color palette, avoid oversaturation, colors should look like reality not like a filter\`.

### ٨. لو طلعت "أنيقة جداً / بلاستيكية"
أضف: \`shot on Fujifilm Pro 400H film with visible film grain, realistic wear on all surfaces, imperfect real-world composition\`.

---

## طريقة الاستخدام العملية

### الخيار الأول: Gemini يدوياً (الأسهل)
1. افتحي [Google AI Studio](https://aistudio.google.com/) أو [gemini.google.com](https://gemini.google.com)
2. الصقي الأمر كما هو (بالإنجليزي — النتائج أدق بمراحل)
3. ولّدي ٤ خيارات، اختاري الأفضل
4. نزّليها، سمّيها بالاسم المكتوب فوق الأمر بالضبط، حطّيها في المسار المذكور

### الخيار الثاني: التوليد الآلي (لو عندك مفتاح Gemini API)
\`\`\`bash
GEMINI_API_KEY=... node scripts/gemini-images.mjs
\`\`\`

يقرأ من \`scripts/sarah-image-prompts.json\` ويحفظ الـ${items.length} صورة في مساراتها.

### تحويل PNG إلى WebP (اختياري لتخفيف الحجم)
\`\`\`bash
brew install webp     # مرة واحدة
for f in *.png; do cwebp -q 82 "$f" -o "\${f%.png}.webp"; done
\`\`\`

### تحديث المسارات في الموقع
كل الصور مربوطة تلقائياً بالمسارات المذكورة أعلاه. لو غيّرت الامتداد من \`.jpg\` إلى \`.webp\`:
- المنتجات: عدّلي مصفوفة \`images\` في \`src/lib/sarah.ts\`
- الخامات: عدّلي حقل \`image\`
- الهيرو والدورة/الموقع: مسارات ثابتة في الصفحات (ابحثي عن اسم الصورة بالكود)

---

`;

let lastGroup = "";
const titles = {
  "منتج": "أولاً: صور المنتجات (٤٤ صورة — ٤ لقطات لكل منتج)",
  "خامة": "ثانياً: سواتش الخامات (١٠ صور)",
  "الواجهة": "ثالثاً: صور الواجهة الرئيسية (٣ صور)",
  "الدورة": "رابعاً: صور صفحة الدورة (٨ صور) — أسلوب Kinfolk، أدفأ وأكثر إنسانية",
  "الموقع": "خامساً: أتموسفير الموقع (٦ صور) — لكل الصفحات",
};

for (const it of items) {
  if (it.group !== lastGroup) {
    md += `\n## ${titles[it.group]}\n`;
    lastGroup = it.group;
  }
  md += `\n### ${it.title}\n\n`;
  md += `**احفظيها باسم:** \`${it.file}\` · **المقاس المقترح:** ${it.size}\n\n`;
  md += "```text\n" + it.prompt + "\n```\n";
}

md += `\n---

## نصائح متقدّمة عند التوليد

### للمنتجات: احتفظي بالخامة والقصّة عبر اللقطات الأربع
- ولّدي اللقطة الأمامية أولاً واحفظيها
- ارفعيها في نفس المحادثة مع اللقطة الثانية واكتبي: \`Same exact garment fabric and color as the reference image I just uploaded.\`
- كرّري للقطات ٣ و٤

### للدورة والموقع: لا تحاولي إظهار وجه سارة الحقيقي
كل الأوامر تطلب «no face visible» عمداً — لأن AI لا يقدر يعيد إنتاج وجه شخص محدّد بدقّة، وأي محاولة تعطي نتيجة مصطنعة تفضح الصورة. الأيدي وحدها كافية لخلق حميمية.

### للأتموسفير: التصوير الفيلمي أصدق من الرقمي
الأنماط تذكر \`Fujifilm Pro 400H\` أو \`Kodak Portra 400\` — الفيلم يعطي حبيبات طبيعية وتدرّج لوني دافئ يخفي الأصل الرقمي للصورة.

### تجنّبي الوجوه العربية الظاهرة
AI يواجه صعوبة كبيرة في رسم ملامح سعودية أصيلة — يميل للأشكال العامة "شرق أوسطي" غير الدقيقة. الحل في كل أوامرنا: يدان فقط، أو مانيكان، أو مشاهد بلا أشخاص.

---

## المراجع الفنية (للإلهام)

- **مجلة Kinfolk** — لأتموسفير الأتيليه: [kinfolk.com](https://kinfolk.com)
- **Toteme، The Row، Khaite** — لأسلوب تصوير المنتج المينيماليست
- **مصوّر السعودية Rasha Aljundi** — للحرفة الشرق أوسطية المعاصرة
- **Yasin Osman** — للتوثيق الحميمي في السياق الإسلامي
`;

writeFileSync("أوامر-صور-إبرة-سارة.md", md);
console.log(`✅ ${items.length} أمر جاهز`);
console.log(`   ${items.filter(i=>i.group==='منتج').length} منتج + ${items.filter(i=>i.group==='خامة').length} خامة + ${items.filter(i=>i.group==='الواجهة').length} واجهة + ${items.filter(i=>i.group==='الدورة').length} دورة + ${items.filter(i=>i.group==='الموقع').length} موقع`);
console.log("   → أوامر-صور-إبرة-سارة.md");
console.log("   → scripts/sarah-image-prompts.json");
