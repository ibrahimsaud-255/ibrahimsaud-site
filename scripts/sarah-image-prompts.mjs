// ===================================================================
// مولّد أوامر صور متجر «إبرة سارة»
// يبني ملفين:
//   أوامر-صور-إبرة-سارة.md        ← أوامر جاهزة للّصق في جيمناي
//   scripts/sarah-image-prompts.json ← نفس الأوامر بصيغة JSON للتوليد الآلي
//
//   node scripts/sarah-image-prompts.mjs
// ===================================================================

import { writeFileSync } from "node:fs";

// النمط الثابت — يُضاف لكل أمر ليخرج الطقم متناسقاً
const STYLE =
  "Professional e-commerce product photography, pure seamless white background, " +
  "soft even studio lighting from the front-left with a subtle soft shadow on the floor, " +
  "photorealistic, ultra sharp fabric texture, true-to-life colors, high resolution, " +
  "no people, no face, no text, no logo, no watermark, no props";

const RATIO_TALL = "vertical 4:5 aspect ratio, full garment inside the frame with even margins";
const RATIO_TALL_MACRO = "vertical 4:5 aspect ratio";
const RATIO_SQ = "square 1:1 aspect ratio, fills the entire frame";

// ------------------------- القطع -------------------------
// garment: وصف القطعة بالإنجليزي | focus: التفصيلة المقرّبة للّقطة الثانية
const products = [
  {
    id: "abaya-classic",
    ar: "عباية تفصيل كلاسيك",
    garment:
      "an elegant deep black open-front abaya, straight classic cut falling to the floor, wide flowing angel sleeves, matte heavy crepe fabric with a soft luxurious drape, no embellishment",
    focus:
      "the clean finished hem and sleeve edge of a matte black crepe abaya, showing the fine invisible stitching line",
    fabric: "matte black crepe",
  },
  {
    id: "abaya-embroidered",
    ar: "عباية مطرّزة",
    garment:
      "a black open-front abaya with delicate antique-gold hand embroidery running along the sleeve cuffs and the front hem, floor length, wide angel sleeves, luxurious crepe fabric",
    focus:
      "antique-gold hand embroidery stitched on black crepe fabric, individual metallic threads and tiny beads visible, shallow depth of field",
    fabric: "black crepe with gold embroidery",
  },
  {
    id: "abaya-prayer",
    ar: "عباية صلاة",
    garment:
      "a soft cream two-piece prayer set for women (a loose long top and a matching wide skirt), lightweight breathable cotton, simple and modest, displayed together",
    focus:
      "the soft cream cotton weave of a prayer garment with a rolled hem, gentle natural folds",
    fabric: "cream lightweight cotton",
  },
  {
    id: "evening-dress",
    ar: "فستان سهرة تفصيل",
    garment:
      "a floor-length emerald green velvet evening gown, fitted sculpted bodice, long dramatic flared skirt, short cap sleeves, rich deep pile velvet with light-catching sheen",
    focus:
      "emerald green velvet fabric close-up, dense short pile catching the light, deep color shifts, luxurious texture",
    fabric: "emerald velvet",
  },
  {
    id: "day-dress",
    ar: "فستان يومي",
    garment:
      "a sand-beige linen midi day dress, relaxed A-line cut, long straight sleeves, modest high neckline, natural soft folds",
    focus:
      "natural sand-beige linen weave close-up, visible slub threads and a stitched side seam",
    fabric: "sand beige linen",
  },
  {
    id: "jalabiya",
    ar: "جلابية مطرّزة",
    garment:
      "a flowing dusty-rose jalabiya (loose Gulf kaftan dress), wide angel sleeves, floor length, intricate gold embroidery around the neckline and sleeve edges, soft satin-finish fabric",
    focus:
      "gold embroidery around the neckline of a dusty-rose jalabiya, raised metallic thread work on soft satin",
    fabric: "dusty rose satin",
  },
  {
    id: "kaftan",
    ar: "قفطان مغربي",
    garment:
      "a royal blue Moroccan kaftan with hand-woven gold trim (sfifa) down the center front and a matching fabric belt at the waist, floor length, wide sleeves, rich satin fabric",
    focus:
      "hand-woven gold sfifa trim and a knotted button on royal blue satin, traditional Moroccan detailing",
    fabric: "royal blue satin",
  },
  {
    id: "home-set",
    ar: "طقم منزلي (روب + قميص)",
    garment:
      "a two-piece champagne silk satin loungewear set — a long belted robe and a matching slip — displayed side by side, glossy liquid sheen, elegant drape",
    focus:
      "champagne silk satin close-up with a glossy sheen, a delicate piping seam and a soft fold",
    fabric: "champagne silk satin",
  },
  {
    id: "skirt",
    ar: "تنورة تفصيل",
    garment:
      "a long olive green pleated skirt, crisp accordion pleats falling from a fitted waistband to the ankle, matte crepe fabric",
    focus:
      "crisp accordion pleats of an olive green crepe skirt, sharp folds with light and shadow between them",
    fabric: "olive crepe",
  },
  {
    id: "blouse",
    ar: "بلوزة / قميص تفصيل",
    garment:
      "a crisp white cotton blouse with long sleeves, classic collar, hidden button placket, tailored clean lines",
    focus:
      "the collar and hidden button placket of a crisp white cotton shirt, fine stitching, mother-of-pearl button",
    fabric: "white cotton",
  },
  {
    id: "alteration",
    ar: "تعديل وتضييق",
    garment:
      "a tailor's dress form draped with a garment being fitted, measuring tape around it, pins marking an adjustment, tailoring scissors resting nearby",
    focus:
      "close-up of pins and a measuring tape marking an alteration on fabric, tailoring workmanship",
    fabric: "assorted",
  },
];

// ------------------------- الخامات -------------------------
const fabrics = [
  { id: "nida", ar: "نيدا فرنسي", en: "matte black French Nida fabric, heavy opaque crepe weave, completely non-reflective, soft even folds" },
  { id: "japanese-crepe", ar: "كريب ياباني", en: "deep olive green Japanese crepe fabric, fine pebbled surface texture, heavy luxurious drape" },
  { id: "silk-satin", ar: "ساتان حرير", en: "champagne gold silk satin, glossy liquid sheen, smooth flowing folds with bright highlights" },
  { id: "chiffon", ar: "شيفون حرير", en: "dusty rose silk chiffon, sheer airy translucent layers, delicate floating folds, backlit" },
  { id: "linen", ar: "كتان مخلوط", en: "natural sand-beige linen blend, clearly visible woven slub texture, relaxed matte folds" },
  { id: "velvet", ar: "مخمل", en: "emerald green velvet, dense short pile catching light, deep rich color with sheen variation" },
  { id: "embroidered-lace", ar: "دانتيل مطرّز", en: "off-white embroidered floral lace on fine tulle net, raised thread embroidery, scalloped edge" },
  { id: "beaded-tulle", ar: "تُل مطرّز بالخرز", en: "champagne beaded tulle, hand-sewn crystals and pearls sparkling on a sheer net base" },
  { id: "egyptian-cotton", ar: "قطن مصري", en: "white Egyptian cotton, fine smooth long-staple weave, crisp clean folds" },
  { id: "georgette", ar: "جورجيت", en: "navy blue georgette, lightweight crinkled surface, fluid rippling drape" },
];

// ------------------------- بناء الأوامر -------------------------
const shot = {
  1: (p) =>
    `Full-length front view of ${p.garment}, displayed on an invisible ghost mannequin (hollow inside, no body visible), garment centered and perfectly symmetrical. ${RATIO_TALL}. ${STYLE}.`,
  2: (p) =>
    `Extreme close-up macro photograph of ${p.focus}. Fabric fills the frame, shallow depth of field, every fiber visible. ${RATIO_TALL_MACRO}. ${STYLE}.`,
  3: (p) =>
    `${cap(p.garment)}, hanging on a slim matte wooden hanger against a plain white wall, front view, natural relaxed drape, full garment visible. ${RATIO_TALL}. ${STYLE}.`,
  4: (p) =>
    `${cap(p.garment)}, neatly folded into a tidy rectangle, top-down flat-lay view on a white surface, crisp clean folds, one folded edge facing the camera. ${RATIO_TALL}. ${STYLE}.`,
};

const shotAr = {
  1: "الصورة الرئيسية — على مانيكان شفاف",
  2: "تفصيلة مقرّبة — نسيج/تطريز",
  3: "على العلّاقة",
  4: "مطوية (flat-lay)",
};

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const items = [];

for (const p of products) {
  for (const i of [1, 2, 3, 4]) {
    items.push({
      file: `public/sarah/products/${p.id}-${i}.webp`,
      configPath: `/sarah/products/${p.id}-${i}.webp`,
      group: "منتج",
      title: `${p.ar} — ${shotAr[i]}`,
      size: "1200×1500",
      prompt: shot[i](p),
    });
  }
}

for (const f of fabrics) {
  items.push({
    file: `public/sarah/fabrics/${f.id}.webp`,
    configPath: `/sarah/fabrics/${f.id}.webp`,
    group: "خامة",
    title: `خامة: ${f.ar}`,
    size: "1000×1000",
    prompt: `Macro studio photograph of ${f.en}. The fabric is laid flat and fills the entire frame, photographed straight from above, showing true texture and color. ${RATIO_SQ}. ${STYLE}.`,
  });
}

const heroes = [
  {
    file: "public/sarah/hero-1.webp",
    configPath: "/sarah/hero-1.webp",
    title: "الهيرو ١ — العباية المطرّزة (طولية)",
    size: "1200×1600",
    prompt: `Full-length front view of a black open-front abaya with fine antique-gold hand embroidery on the sleeves and hem, displayed on an invisible ghost mannequin, elegant floor-length drape. Vertical 3:4 aspect ratio. ${STYLE}.`,
  },
  {
    file: "public/sarah/hero-2.webp",
    configPath: "/sarah/hero-2.webp",
    title: "الهيرو ٢ — تفصيلة تطريز (مربّعة)",
    size: "1200×1200",
    prompt: `Extreme close-up macro photograph of delicate gold hand embroidery on dusty-rose satin fabric, raised metallic threads and tiny beads, shallow depth of field. ${RATIO_SQ}. ${STYLE}.`,
  },
  {
    file: "public/sarah/hero-3.webp",
    configPath: "/sarah/hero-3.webp",
    title: "الهيرو ٣ — مجموعة خامات (مربّعة)",
    size: "1200×1200",
    prompt: `Top-down photograph of four folded fabric swatches arranged in a neat two-by-two grid on a white surface — champagne silk satin, olive green crepe, emerald velvet, and sand-beige linen — each swatch clearly showing its own texture. ${RATIO_SQ}. ${STYLE}.`,
  },
];
for (const h of heroes) items.push({ ...h, group: "هيرو" });

// ------------------------- الإخراج -------------------------
writeFileSync("scripts/sarah-image-prompts.json", JSON.stringify(items, null, 2));

let md = `# أوامر توليد صور متجر «إبرة سارة»

${items.length} صورة — أوامر جاهزة للّصق في **Gemini** (أو أي مولّد صور).
كل الأوامر تطلب **خلفية بيضاء نظيفة** وإضاءة استوديو واحدة، عشان تطلع الصور كطقم
واحد متناسق.

## طريقة العمل

1. افتحي [Google AI Studio](https://aistudio.google.com/) أو تطبيق Gemini، واختاري توليد الصور.
2. الصقي الأمر كما هو (بالإنجليزي — النتائج أدق).
3. نزّلي الصورة، وسمّيها بالاسم المكتوب فوق كل أمر بالضبط.
4. حطّيها في المجلد المذكور، ثم عدّلي المسار في \`src/lib/sarah.ts\`
   (استبدلي \`.svg\` بـ \`.webp\` في مصفوفة \`images\` للمنتج أو حقل \`image\` للخامة).
5. لو الصورة نزلت PNG، حوّليها لـ webp:

\`\`\`bash
cwebp -q 82 abaya-classic-1.png -o abaya-classic-1.webp
\`\`\`

### نصائح تخرّج نتيجة أفضل

- لو طلع الموديل بوجه أو جسم، أضيفي في آخر الأمر: \`invisible ghost mannequin only, no human body\`.
- لو الخلفية طلعت رمادية: \`pure white background #FFFFFF, blown-out white, no gradient\`.
- لو تبين نفس القطعة بأكثر من لقطة، ولّدي اللقطة الأولى ثم ارفعيها في نفس المحادثة
  واكتبي: \`same exact garment, now shown folded flat-lay on white\` — يحافظ على التطابق.
- المقاسات المقترحة: المنتجات 1200×1500 (4:5)، الخامات 1000×1000 (1:1).

---
`;

let lastGroup = "";
for (const it of items) {
  if (it.group !== lastGroup) {
    md += `\n## ${it.group === "منتج" ? "أولاً: صور المنتجات" : it.group === "خامة" ? "ثانياً: سواتش الخامات" : "ثالثاً: صور الواجهة (الهيرو)"}\n`;
    lastGroup = it.group;
  }
  md += `\n### ${it.title}\n\n`;
  md += `**احفظيها باسم:** \`${it.file}\`  ·  **المقاس:** ${it.size}\n\n`;
  md += "```text\n" + it.prompt + "\n```\n";
}

md += `\n---

## التوليد الآلي (اختياري)

لو عندك مفتاح Gemini API، تقدرين تولّدين الـ${items.length} صورة بأمر واحد:

\`\`\`bash
GEMINI_API_KEY=... node scripts/gemini-images.mjs
\`\`\`

السكربت يقرأ \`scripts/sarah-image-prompts.json\` ويحفظ كل صورة في مسارها مباشرة.
`;

writeFileSync("أوامر-صور-إبرة-سارة.md", md);
console.log(`✅ ${items.length} أمر — أوامر-صور-إبرة-سارة.md + scripts/sarah-image-prompts.json`);
