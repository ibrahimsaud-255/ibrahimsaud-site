// ===================================================================
// مولّد رسومات متجر «إبرة سارة»
// يبني ملفات SVG لكل خانات الصور: المنتجات (٤ لكل منتج)، الخامات، الهيرو.
//
//   node scripts/generate-sarah-art.mjs
//
// الرسومات متجهة (SVG) وبألوان الخامات الحقيقية، ومصمّمة كطقم واحد.
// تُستبدل لاحقاً بصور فوتوغرافية بنفس المسارات دون تعديل الكود.
// ===================================================================

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "public/sarah";

// ------------------------- لوحة الهوية -------------------------
const BG = "#f1e8dc";
const BG_2 = "#e6d9c8";
const CLAY = "#b0764f";
const GOLD = "#c9a24a";
const SHADOW = "rgba(70, 48, 32, 0.16)";

const write = (path, svg) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg.replace(/\n\s+/g, "\n").trim());
};

// ===================================================================
//                     أدوات رسم مشتركة
// ===================================================================

// خلفية استوديو: تدرّج دافئ + دائرة ضوء + أرضية
function backdrop(w, h, tone = BG) {
  return `
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#fdf9f3"/>
      <stop offset="62%" stop-color="${tone}"/>
      <stop offset="100%" stop-color="${BG_2}"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(140,110,80,0.10)"/>
      <stop offset="100%" stop-color="rgba(140,110,80,0.02)"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
      <feComposite in="g2" in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bgGlow)"/>
  <rect x="0" y="${h * 0.74}" width="${w}" height="${h * 0.26}" fill="url(#floor)"/>`;
}

// ظل أرضي بيضاوي تحت القطعة
const groundShadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SHADOW}" filter="url(#soft)"/>`;

// تدرّج الخامة: لمعة جانبية + عمق
function fabricGradient(id, color, sheen = 0.16, dark = 0.3) {
  return `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.25">
    <stop offset="0%" stop-color="${shade(color, -dark * 0.7)}"/>
    <stop offset="26%" stop-color="${color}"/>
    <stop offset="48%" stop-color="${shade(color, sheen)}"/>
    <stop offset="72%" stop-color="${color}"/>
    <stop offset="100%" stop-color="${shade(color, -dark)}"/>
  </linearGradient>`;
}

// تفتيح/تغميق لون hex بنسبة (-1 .. 1)
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = amt >= 0 ? c + (255 - c) * amt : c * (1 + amt);
    return Math.max(0, Math.min(255, Math.round(v)));
  });
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// طيّات قماش: خطوط منحنية شفافة تعطي إحساس الانسدال
function folds(cx, yTop, yBot, halfW, count = 7, opacity = 0.13) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const x = cx - halfW + halfW * 2 * t;
    const sway = (i % 2 ? 1 : -1) * halfW * 0.06;
    const light = i % 2 === 0;
    out += `<path d="M ${x} ${yTop} C ${x + sway} ${yTop + (yBot - yTop) * 0.4}, ${x - sway} ${yTop + (yBot - yTop) * 0.72}, ${x + sway * 0.5} ${yBot}"
      stroke="${light ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)"}" stroke-width="${light ? 10 : 14}"
      fill="none" opacity="${opacity}" stroke-linecap="round"/>`;
  }
  return out;
}

// ===================================================================
//                     قوامات القطع (Silhouettes)
// ===================================================================

/**
 * قوام عام: كتف ← خصر ← ذيل، مع رقبة وأكمام.
 * kind: sleeve style — "wide" | "straight" | "none" | "cap"
 */
function garment({
  cx = 600,
  yShoulder = 330,
  yHem = 1300,
  shoulder = 150,
  chest = 175,
  waist = 165,
  hem = 300,
  sleeve = "straight",
  fill = "url(#g)",
  neck = 58,
  waistY = 0.42,
}) {
  const H = yHem - yShoulder;
  const yWaist = yShoulder + H * waistY;
  const body = `
  M ${cx - shoulder} ${yShoulder}
  C ${cx - chest} ${yShoulder + H * 0.13}, ${cx - waist} ${yWaist - H * 0.1}, ${cx - waist} ${yWaist}
  C ${cx - waist} ${yWaist + H * 0.18}, ${cx - hem} ${yHem - H * 0.22}, ${cx - hem} ${yHem}
  Q ${cx} ${yHem + 34}, ${cx + hem} ${yHem}
  C ${cx + hem} ${yHem - H * 0.22}, ${cx + waist} ${yWaist + H * 0.18}, ${cx + waist} ${yWaist}
  C ${cx + waist} ${yWaist - H * 0.1}, ${cx + chest} ${yShoulder + H * 0.13}, ${cx + shoulder} ${yShoulder}
  Q ${cx} ${yShoulder + neck}, ${cx - shoulder} ${yShoulder} Z`;

  let arms = "";
  if (sleeve === "wide") {
    // كم واسع (كم الملاك): ينسدل من الكتف حتى ما دون الخصر ويتّسع للأسفل
    const yEnd = yShoulder + H * 0.52;
    arms = `
    <path d="M ${cx - shoulder + 14} ${yShoulder + 10}
      C ${cx - shoulder - 70} ${yShoulder + H * 0.1}, ${cx - shoulder - 148} ${yShoulder + H * 0.32}, ${cx - shoulder - 176} ${yEnd}
      Q ${cx - shoulder - 96} ${yEnd + 26}, ${cx - shoulder - 30} ${yEnd - 10}
      C ${cx - shoulder - 4} ${yShoulder + H * 0.3}, ${cx - shoulder + 44} ${yShoulder + H * 0.12}, ${cx - shoulder + 78} ${yShoulder + 74} Z" fill="${fill}"/>
    <path d="M ${cx + shoulder - 14} ${yShoulder + 10}
      C ${cx + shoulder + 70} ${yShoulder + H * 0.1}, ${cx + shoulder + 148} ${yShoulder + H * 0.32}, ${cx + shoulder + 176} ${yEnd}
      Q ${cx + shoulder + 96} ${yEnd + 26}, ${cx + shoulder + 30} ${yEnd - 10}
      C ${cx + shoulder + 4} ${yShoulder + H * 0.3}, ${cx + shoulder - 44} ${yShoulder + H * 0.12}, ${cx + shoulder - 78} ${yShoulder + 74} Z" fill="${fill}"/>`;
  } else if (sleeve === "straight") {
    // كم مستقيم طويل حتى المعصم
    const yEnd = yShoulder + H * 0.56;
    arms = `
    <path d="M ${cx - shoulder + 12} ${yShoulder + 8}
      C ${cx - shoulder - 60} ${yShoulder + H * 0.12}, ${cx - shoulder - 82} ${yShoulder + H * 0.34}, ${cx - shoulder - 74} ${yEnd}
      L ${cx - shoulder + 6} ${yEnd + 6}
      C ${cx - shoulder + 4} ${yShoulder + H * 0.34}, ${cx - shoulder + 28} ${yShoulder + H * 0.14}, ${cx - shoulder + 72} ${yShoulder + 78} Z" fill="${fill}"/>
    <path d="M ${cx + shoulder - 12} ${yShoulder + 8}
      C ${cx + shoulder + 60} ${yShoulder + H * 0.12}, ${cx + shoulder + 82} ${yShoulder + H * 0.34}, ${cx + shoulder + 74} ${yEnd}
      L ${cx + shoulder - 6} ${yEnd + 6}
      C ${cx + shoulder - 4} ${yShoulder + H * 0.34}, ${cx + shoulder - 28} ${yShoulder + H * 0.14}, ${cx + shoulder - 72} ${yShoulder + 78} Z" fill="${fill}"/>`;
  } else if (sleeve === "cap") {
    arms = `
    <path d="M ${cx - shoulder + 6} ${yShoulder + 4} C ${cx - shoulder - 44} ${yShoulder + 60}, ${cx - shoulder - 48} ${yShoulder + 130}, ${cx - shoulder - 26} ${yShoulder + 168} L ${cx - shoulder + 54} ${yShoulder + 120} Z" fill="${fill}"/>
    <path d="M ${cx + shoulder - 6} ${yShoulder + 4} C ${cx + shoulder + 44} ${yShoulder + 60}, ${cx + shoulder + 48} ${yShoulder + 130}, ${cx + shoulder + 26} ${yShoulder + 168} L ${cx + shoulder - 54} ${yShoulder + 120} Z" fill="${fill}"/>`;
  }

  return `${arms}<path d="${body}" fill="${fill}"/>`;
}

// خط الرقبة (فتحة داكنة صغيرة)
const neckline = (cx, y, w = 62, h = 30) =>
  `<path d="M ${cx - w} ${y - 2} Q ${cx} ${y + h * 2.1}, ${cx + w} ${y - 2} Q ${cx} ${y + h * 0.5}, ${cx - w} ${y - 2} Z" fill="rgba(60,40,26,0.42)"/>`;

// نقشة تطريز ذهبية (تتكرر على الأطراف)
function embroidery(x, y, w, h, color = GOLD, count = 6) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const px = x + (w / count) * i + w / count / 2;
    out += `
    <g transform="translate(${px} ${y}) scale(${h / 40})" opacity="0.92">
      <path d="M0 -16 C 8 -8, 8 8, 0 16 C -8 8, -8 -8, 0 -16 Z" fill="${color}" opacity="0.85"/>
      <circle cx="0" cy="0" r="3.4" fill="${shade(color, 0.35)}"/>
      <path d="M-15 0 Q 0 -9, 15 0 Q 0 9, -15 0" fill="none" stroke="${color}" stroke-width="1.6" opacity="0.7"/>
    </g>`;
  }
  return out;
}

// ===================================================================
//                    خامات — سواتش ١٠٠٠×١٠٠٠
// ===================================================================
const fabricDefs = {
  nida: { color: "#1b1917", texture: "matte" },
  "japanese-crepe": { color: "#5b6349", texture: "pebble" },
  "silk-satin": { color: "#e0c69c", texture: "satin" },
  chiffon: { color: "#d3a99f", texture: "sheer" },
  linen: { color: "#d8c4a4", texture: "weave" },
  velvet: { color: "#1f5442", texture: "velvet" },
  "embroidered-lace": { color: "#f0e7da", texture: "lace" },
  "beaded-tulle": { color: "#e3cda6", texture: "beads" },
  "egyptian-cotton": { color: "#f5f1e8", texture: "cotton" },
  georgette: { color: "#232f47", texture: "crinkle" },
};

function fabricSwatch(id) {
  const { color, texture } = fabricDefs[id];
  const S = 1000;
  const c = color;

  const noise = (freq, oct, slope) => `
    <filter id="nz">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope="${slope}"/></feComponentTransfer>
      <feComposite in="g2" in2="SourceGraphic" operator="over"/>
    </filter>`;

  let tex = "";
  let filter = noise(0.8, 4, 0.14);

  if (texture === "weave") {
    tex = `<pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="${c}"/>
      <rect width="7" height="14" fill="${shade(c, -0.07)}"/>
      <rect width="14" height="7" fill="${shade(c, 0.06)}" opacity="0.55"/>
    </pattern>`;
    filter = noise(1.1, 4, 0.2);
  } else if (texture === "cotton") {
    tex = `<pattern id="p" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="${c}"/>
      <rect width="4" height="8" fill="${shade(c, -0.05)}"/>
    </pattern>`;
    filter = noise(1.4, 3, 0.12);
  } else if (texture === "pebble") {
    tex = `<pattern id="p" width="1000" height="1000" patternUnits="userSpaceOnUse"><rect width="1000" height="1000" fill="${c}"/></pattern>`;
    filter = `<filter id="nz">
      <feTurbulence type="turbulence" baseFrequency="0.55" numOctaves="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="9"/>
      <feColorMatrix type="saturate" values="1"/>
    </filter>`;
  } else if (texture === "crinkle") {
    tex = `<pattern id="p" width="1000" height="1000" patternUnits="userSpaceOnUse"><rect width="1000" height="1000" fill="${c}"/></pattern>`;
    filter = `<filter id="nz">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="26"/>
    </filter>`;
  } else if (texture === "velvet") {
    tex = `<pattern id="p" width="1000" height="1000" patternUnits="userSpaceOnUse"><rect width="1000" height="1000" fill="${c}"/></pattern>`;
    filter = noise(1.9, 5, 0.3);
  } else if (texture === "lace") {
    tex = `<pattern id="p" width="125" height="125" patternUnits="userSpaceOnUse">
      <rect width="125" height="125" fill="${c}"/>
      <g fill="none" stroke="${shade(c, -0.3)}" stroke-width="2.2" opacity="0.9">
        <circle cx="62" cy="62" r="30"/>
        <circle cx="62" cy="62" r="15"/>
        <path d="M62 32 Q 78 62, 62 92 Q 46 62, 62 32 Z"/>
        <path d="M32 62 Q 62 78, 92 62 Q 62 46, 32 62 Z"/>
        <circle cx="0" cy="0" r="7"/><circle cx="125" cy="0" r="7"/>
        <circle cx="0" cy="125" r="7"/><circle cx="125" cy="125" r="7"/>
      </g>
      <g stroke="${shade(c, -0.16)}" stroke-width="1" opacity="0.6">
        <path d="M0 62 H125 M62 0 V125"/>
      </g>
    </pattern>`;
    filter = noise(0.7, 3, 0.08);
  } else if (texture === "beads") {
    let dots = "";
    for (let row = 0; row * 44 < 1040; row++)
      for (let col = 0; col * 44 < 1040; col++) {
        const y = row * 44;
        const x = col * 44 + (row % 2 ? 22 : 0);
        const o = ((col * 7 + row * 13) % 10) / 10;
        const r = 6 + o * 6;
        dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(c, 0.5)}" opacity="${0.55 + o * 0.4}"/>
        <circle cx="${x - r * 0.32}" cy="${y - r * 0.32}" r="${r * 0.34}" fill="#fff" opacity="${0.65 + o * 0.3}"/>`;
      }
    tex = `<pattern id="p" width="1000" height="1000" patternUnits="userSpaceOnUse">
      <rect width="1000" height="1000" fill="${shade(c, -0.12)}"/>
      <g opacity="0.5"><path d="M0 0 H1000 M0 0 V1000" stroke="${shade(c, 0.2)}"/></g>
      ${dots}
    </pattern>`;
    filter = noise(0.6, 3, 0.06);
  } else if (texture === "satin" || texture === "sheer" || texture === "matte") {
    tex = `<pattern id="p" width="1000" height="1000" patternUnits="userSpaceOnUse"><rect width="1000" height="1000" fill="${c}"/></pattern>`;
    filter = noise(texture === "matte" ? 1.5 : 0.8, 4, texture === "matte" ? 0.22 : 0.1);
  }

  const sheenStrength = texture === "satin" ? 0.4 : texture === "velvet" ? 0.3 : 0.16;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    ${tex}
    ${filter}
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${shade(c, -0.28)}"/>
      <stop offset="30%" stop-color="${shade(c, sheenStrength)}" stop-opacity="0.9"/>
      <stop offset="52%" stop-color="${shade(c, -0.18)}"/>
      <stop offset="74%" stop-color="${shade(c, sheenStrength * 0.8)}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${shade(c, -0.32)}"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="42%" r="72%">
      <stop offset="8%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(30,18,8,0.3)"/>
    </radialGradient>
  </defs>
  <g filter="url(#nz)"><rect width="${S}" height="${S}" fill="url(#p)"/></g>
  <rect width="${S}" height="${S}" fill="url(#sheen)" opacity="0.55" style="mix-blend-mode:soft-light"/>
  ${folds(S / 2, -40, S + 40, S / 2, 6, 0.1)}
  <rect width="${S}" height="${S}" fill="url(#vig)"/>
  </svg>`;
}

// ===================================================================
//                    المنتجات — ٤ لقطات لكل قطعة
// ===================================================================

// تعريف كل منتج: القوام واللون والتفاصيل
const looks = {
  "abaya-classic": {
    color: "#1b1917",
    shape: { shoulder: 148, chest: 170, waist: 176, hem: 252, sleeve: "wide", yHem: 1380 },
    open: true,
  },
  "abaya-embroidered": {
    color: "#1b1917",
    shape: { shoulder: 148, chest: 170, waist: 176, hem: 258, sleeve: "wide", yHem: 1380 },
    open: true,
    trim: GOLD,
  },
  "abaya-prayer": {
    color: "#efe3d3",
    shape: { shoulder: 164, chest: 200, waist: 208, hem: 250, sleeve: "wide", yHem: 880 },
    twoPiece: true,
  },
  "evening-dress": {
    color: "#1f5442",
    shape: { shoulder: 116, chest: 128, waist: 104, hem: 300, sleeve: "cap", yHem: 1385, waistY: 0.28 },
    shine: true,
  },
  "day-dress": {
    color: "#d8c4a4",
    shape: { shoulder: 130, chest: 148, waist: 140, hem: 228, sleeve: "straight", yHem: 1230 },
  },
  jalabiya: {
    color: "#c98f86",
    shape: { shoulder: 152, chest: 188, waist: 198, hem: 282, sleeve: "wide", yHem: 1370 },
    trim: GOLD,
  },
  kaftan: {
    color: "#2f4f8f",
    shape: { shoulder: 150, chest: 184, waist: 184, hem: 292, sleeve: "wide", yHem: 1375 },
    trim: GOLD,
    belt: true,
  },
  "home-set": {
    color: "#e0c69c",
    shape: { shoulder: 138, chest: 164, waist: 162, hem: 206, sleeve: "straight", yHem: 1150 },
    shine: true,
    robe: true,
  },
  skirt: { color: "#6f7856", skirtOnly: true },
  blouse: {
    color: "#f5f2ec",
    shape: { shoulder: 138, chest: 156, waist: 148, hem: 170, sleeve: "straight", yHem: 940 },
    collar: true,
  },
  alteration: { color: "#d8c4a4", atelier: true },
};

const W = 1200;
const H = 1500;

function productFront(id) {
  const L = looks[id];
  const c = L.color;
  let art = "";

  if (L.skirtOnly) {
    // تنورة بليسيه طويلة
    const yTop = 520, yHem = 1300, cx = 600;
    let pleats = "";
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const xT = cx - 170 + 340 * t;
      const xB = cx - 320 + 640 * t;
      pleats += `<path d="M ${xT} ${yTop} L ${xB} ${yHem}" stroke="${i % 2 ? shade(c, 0.22) : shade(c, -0.24)}" stroke-width="${i % 2 ? 26 : 20}" opacity="0.5"/>`;
    }
    art = `
    ${groundShadow(600, 1345, 300, 34)}
    <path d="M ${cx - 170} ${yTop} L ${cx - 320} ${yHem} Q ${cx} ${yHem + 40}, ${cx + 320} ${yHem} L ${cx + 170} ${yTop} Q ${cx} ${yTop - 26}, ${cx - 170} ${yTop} Z" fill="url(#g)"/>
    <g clip-path="url(#clipSkirt)">${pleats}</g>
    <rect x="${cx - 172}" y="${yTop - 46}" width="344" height="56" rx="26" fill="${shade(c, -0.2)}"/>
    <defs><clipPath id="clipSkirt"><path d="M ${cx - 170} ${yTop} L ${cx - 320} ${yHem} Q ${cx} ${yHem + 40}, ${cx + 320} ${yHem} L ${cx + 170} ${yTop} Z"/></clipPath></defs>`;
  } else if (L.atelier) {
    // مشهد الورشة: مانيكان + شريط قياس + مقص
    art = `
    ${groundShadow(600, 1330, 250, 30)}
    <rect x="576" y="1080" width="48" height="250" rx="10" fill="#8a6a4c"/>
    <ellipse cx="600" cy="1330" rx="150" ry="26" fill="#8a6a4c" opacity="0.85"/>
    <path d="M 470 430 C 430 560, 442 760, 500 900 Q 600 950, 700 900 C 758 760, 770 560, 730 430 Q 600 372, 470 430 Z" fill="url(#g)"/>
    <path d="M 470 430 Q 600 500, 730 430" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="6"/>
    <path d="M 452 640 C 560 700, 640 700, 748 640" fill="none" stroke="${CLAY}" stroke-width="26" stroke-linecap="round" opacity="0.95"/>
    <path d="M 452 640 C 560 700, 640 700, 748 640" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="4" stroke-dasharray="10 14"/>
    <g transform="translate(880 980) rotate(18)">
      <path d="M0 0 L 120 -100 M0 0 L 120 100" stroke="#7d7d86" stroke-width="16" stroke-linecap="round"/>
      <circle cx="-16" cy="-34" r="34" fill="none" stroke="${CLAY}" stroke-width="16"/>
      <circle cx="-16" cy="34" r="34" fill="none" stroke="${CLAY}" stroke-width="16"/>
    </g>
    <g transform="translate(300 1000)">
      <circle r="52" fill="${shade(CLAY, 0.3)}"/>
      ${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="0" y1="0" x2="${Math.cos((a * Math.PI) / 180) * 76}" y2="${Math.sin((a * Math.PI) / 180) * 76}" stroke="#6b5748" stroke-width="4"/><circle cx="${Math.cos((a * Math.PI) / 180) * 76}" cy="${Math.sin((a * Math.PI) / 180) * 76}" r="7" fill="${GOLD}"/>`).join("")}
    </g>`;
  } else if (L.twoPiece) {
    // طقم صلاة: علوي + تنورة
    art = `
    ${groundShadow(600, 1350, 280, 32)}
    <path d="M 350 1000 L 300 1320 Q 600 1360, 900 1320 L 850 1000 Q 600 970, 350 1000 Z" fill="url(#g)"/>
    ${garment({ ...L.shape, fill: "url(#g)" })}
    ${neckline(600, 336, 66, 26)}
    ${folds(600, 420, 900, 210, 6, 0.12)}
    ${folds(600, 1010, 1320, 290, 7, 0.1)}`;
  } else {
    const sh = L.shape;
    art = `
    ${groundShadow(600, sh.yHem + 40, sh.hem * 0.95, 32)}
    ${garment({ ...sh, fill: "url(#g)" })}
    ${neckline(600, 336, 60, 26)}
    ${folds(600, 400, sh.yHem - 20, sh.hem * 0.8, 7, 0.13)}`;

    if (L.open) {
      // فتحة العباية الأمامية
      art += `<path d="M 600 342 L 600 ${sh.yHem + 14}" stroke="rgba(0,0,0,0.5)" stroke-width="7" opacity="0.5"/>
      <path d="M 612 342 L 612 ${sh.yHem + 10}" stroke="rgba(255,255,255,0.35)" stroke-width="3" opacity="0.4"/>`;
    }
    if (L.belt) {
      art += `<path d="M 414 760 Q 600 818, 786 760 L 786 846 Q 600 902, 414 846 Z" fill="${shade(L.trim ?? CLAY, -0.1)}"/>
      <path d="M 414 782 Q 600 838, 786 782" fill="none" stroke="${shade(GOLD, 0.4)}" stroke-width="5" opacity="0.8"/>`;
    }
    if (L.collar) {
      art += `<path d="M 540 336 L 600 440 L 660 336 L 626 326 L 600 390 L 574 326 Z" fill="${shade(c, -0.14)}"/>
      ${[520, 620, 720, 820].map((y) => `<circle cx="600" cy="${y}" r="9" fill="${shade(c, -0.3)}"/>`).join("")}`;
    }
    if (L.robe) {
      art += `<path d="M 600 342 L 600 1090" stroke="rgba(0,0,0,0.35)" stroke-width="6" opacity="0.45"/>
      <path d="M 430 800 Q 600 856, 770 800 L 770 856 Q 600 910, 430 856 Z" fill="${shade(c, -0.18)}"/>
      <g opacity="0.95"><path d="M 880 900 L 900 1180 Q 1000 1210, 1080 1180 L 1040 900 Q 960 872, 880 900 Z" fill="${shade(c, 0.12)}"/></g>`;
    }
    if (L.trim) {
      // تطريز على الأطراف والأكمام
      art += embroidery(600 - sh.hem * 0.72, sh.yHem - 66, sh.hem * 1.44, 42, L.trim, 7);
      art += embroidery(600 - 96, 440, 192, 34, L.trim, 3);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${backdrop(W, H)}
  <defs>${fabricGradient("g", L.color, L.shine ? 0.3 : 0.14, L.shine ? 0.34 : 0.26)}</defs>
  ${art}
  </svg>`;
}

// لقطة ٢ — تفصيلة قريبة: نسيج + شريط تطريز
function productDetail(id) {
  const L = looks[id];
  const c = L.color;
  const accent = L.trim ?? GOLD;
  const bandY = 640;
  const bandH = 300;

  // حافة مموّجة (سفيفة) أعلى الشريط وأسفله
  const scallop = (y, dir) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x < W; x += 80) d += ` q 40 ${26 * dir}, 80 0`;
    d += ` L ${W} ${y + 40 * dir} L 0 ${y + 40 * dir} Z`;
    return d;
  };

  let beads = "";
  for (let i = 0; i < 90; i++) {
    const x = ((i * 137) % 1180) + 10;
    const y = ((i * 271) % 1460) + 20;
    if (y > bandY - 40 && y < bandY + bandH + 40) continue;
    const r = 3 + (i % 4);
    beads += `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(accent, 0.4)}" opacity="0.5"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    ${fabricGradient("g", c, L.shine ? 0.32 : 0.18, 0.3)}
    ${fabricGradient("gb", shade(c, 0.06), 0.24, 0.22)}
    <filter id="nz2">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="s"/>
      <feComponentTransfer in="s" result="s2"><feFuncA type="linear" slope="0.16"/></feComponentTransfer>
      <feComposite in="s2" in2="SourceGraphic" operator="over"/>
    </filter>
    <filter id="bandShadow" x="-10%" y="-40%" width="120%" height="180%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
    <radialGradient id="vig2" cx="50%" cy="45%" r="72%">
      <stop offset="10%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(25,15,8,0.36)"/>
    </radialGradient>
  </defs>

  <g filter="url(#nz2)"><rect width="${W}" height="${H}" fill="url(#g)"/></g>
  ${folds(600, -60, H + 60, 600, 9, 0.15)}
  ${beads}

  <g filter="url(#bandShadow)">
    <rect x="0" y="${bandY}" width="${W}" height="${bandH}" fill="url(#gb)"/>
    <path d="${scallop(bandY, -1)}" fill="url(#gb)"/>
    <path d="${scallop(bandY + bandH, 1)}" fill="url(#gb)"/>
  </g>

  <g opacity="0.95">
    <path d="M 0 ${bandY + 26} H ${W} M 0 ${bandY + bandH - 26} H ${W}"
      stroke="${accent}" stroke-width="4" stroke-dasharray="16 12" opacity="0.75"/>
    ${embroidery(20, bandY + bandH / 2, W - 40, 150, accent, 5)}
  </g>

  <g opacity="0.9">
    ${embroidery(60, 300, W - 120, 74, accent, 4)}
    ${embroidery(60, 1250, W - 120, 74, accent, 4)}
  </g>

  <rect width="${W}" height="${H}" fill="url(#vig2)"/>
  </svg>`;
}

// لقطة ٣ — على العلّاقة
function productHanger(id) {
  const L = looks[id];
  const sh = L.shape ?? { shoulder: 150, chest: 180, waist: 175, hem: 280, sleeve: "wide", yHem: 1300 };
  const scale = 0.82;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${backdrop(W, H, "#efe4d6")}
  <defs>${fabricGradient("g", L.color, L.shine ? 0.28 : 0.14, 0.26)}</defs>
  <path d="M 600 120 C 600 190, 560 196, 560 232" fill="none" stroke="#9a7c5c" stroke-width="12" stroke-linecap="round"/>
  <path d="M 600 118 m -26 0 a 26 26 0 1 1 52 0" fill="none" stroke="#9a7c5c" stroke-width="12"/>
  <path d="M 600 236 L 380 300 Q 600 322, 820 300 Z" fill="#9a7c5c"/>
  <g transform="translate(600 300) scale(${scale}) translate(-600 -300)">
    ${garment({ ...sh, yShoulder: 300, yHem: (sh.yHem ?? 1300) - 40, fill: "url(#g)" })}
    ${neckline(600, 306, 58, 24)}
    ${folds(600, 360, (sh.yHem ?? 1300) - 70, (sh.hem ?? 280) * 0.78, 6, 0.13)}
    ${L.trim ? embroidery(600 - (sh.hem ?? 280) * 0.7, (sh.yHem ?? 1300) - 100, (sh.hem ?? 280) * 1.4, 38, L.trim, 6) : ""}
  </g>
  </svg>`;
}

// لقطة ٤ — مطوية (flat-lay)
function productFolded(id) {
  const L = looks[id];
  const c = L.color;
  const accent = L.trim ?? CLAY;

  // قطعة مطوية: مستطيل بحافة طيّ ناعمة وظل تحته
  const piece = (cx, cy, w, h, tone, rot, sheen) => `
  <g transform="translate(${cx} ${cy}) rotate(${rot})">
    <rect x="${-w / 2 + 6}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="16" fill="rgba(60,40,26,0.18)" filter="url(#soft2)"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16" fill="${tone}"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16" fill="url(#${sheen})" opacity="0.5" style="mix-blend-mode:soft-light"/>
    <path d="M ${-w / 2} ${-h / 2 + 22} Q ${-w / 2 + 34} ${0}, ${-w / 2} ${h / 2 - 22}"
      fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="7"/>
    <path d="M ${-w / 2 + 26} ${-h / 2 + 16} Q ${-w / 2 + 54} 0, ${-w / 2 + 26} ${h / 2 - 16}"
      fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="4"/>
    <path d="M ${w / 2 - 30} ${-h / 2 + 14} L ${w / 2 - 30} ${h / 2 - 14}"
      stroke="rgba(0,0,0,0.14)" stroke-width="5"/>
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${backdrop(W, H, "#f3ebdf")}
  <defs>
    ${fabricGradient("s1", c, 0.3, 0.24)}
    ${fabricGradient("s2", c, 0.22, 0.2)}
    <filter id="soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  ${groundShadow(600, 1170, 360, 44)}
  ${piece(600, 1040, 660, 210, shade(c, -0.26), -2.5, "s2")}
  ${piece(600, 850, 660, 210, shade(c, -0.1), 1.8, "s2")}
  ${piece(600, 660, 660, 210, c, -1, "s1")}

  <g>
    <path d="M 470 548 L 470 772 M 730 548 L 730 772" stroke="${accent}" stroke-width="26" opacity="0.9"/>
    <path d="M 470 548 L 470 772 M 730 548 L 730 772" stroke="rgba(255,255,255,0.35)" stroke-width="5"/>
    <g transform="translate(600 560)">
      <path d="M -66 0 Q -20 -34, 0 0 Q 20 -34, 66 0 Q 20 24, 0 0 Q -20 24, -66 0 Z" fill="${accent}"/>
      <circle r="13" fill="${shade(accent, 0.35)}"/>
    </g>
  </g>

  <g transform="translate(600 1320)" opacity="0.85">
    ${embroidery(-200, 0, 400, 46, GOLD, 3)}
  </g>
  </svg>`;
}

// ===================================================================
//                          الهيرو
// ===================================================================
function hero1() {
  return productFront("abaya-embroidered").replace(
    /viewBox="0 0 1200 1500" width="1200" height="1500"/,
    'viewBox="0 0 1200 1500" width="1200" height="1500"',
  );
}
function hero2() {
  return productDetail("jalabiya").replace(/viewBox="0 0 1200 1500"/, 'viewBox="150 300 900 900"');
}
function hero3() {
  // كولاج خامات
  const ids = ["silk-satin", "japanese-crepe", "velvet", "linen"];
  const tiles = ids
    .map((id, i) => {
      const { color } = fabricDefs[id];
      const x = (i % 2) * 500 + 60;
      const y = Math.floor(i / 2) * 500 + 60;
      return `<g transform="translate(${x} ${y}) rotate(${i % 2 ? 3 : -3} 220 220)">
      <rect width="440" height="440" rx="26" fill="${color}"/>
      <rect width="440" height="440" rx="26" fill="url(#sh${i})" opacity="0.6" style="mix-blend-mode:soft-light"/>
      <rect width="440" height="440" rx="26" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>
    </g>`;
    })
    .join("");
  const grads = ids
    .map(
      (id, i) => `<linearGradient id="sh${i}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${shade(fabricDefs[id].color, -0.3)}"/>
    <stop offset="45%" stop-color="${shade(fabricDefs[id].color, 0.35)}"/>
    <stop offset="100%" stop-color="${shade(fabricDefs[id].color, -0.3)}"/>
  </linearGradient>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 1120" width="1120" height="1120">
  <defs>${grads}
    <filter id="nz3"><feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="3" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="s"/>
      <feComponentTransfer in="s" result="s2"><feFuncA type="linear" slope="0.12"/></feComponentTransfer>
      <feComposite in="s2" in2="SourceGraphic" operator="over"/></filter>
  </defs>
  <rect width="1120" height="1120" fill="${BG}"/>
  <g filter="url(#nz3)">${tiles}</g>
  </svg>`;
}

// ===================================================================
//                          التشغيل
// ===================================================================
const productIds = Object.keys(looks);
let n = 0;

for (const id of Object.keys(fabricDefs)) {
  write(`${OUT}/fabrics/${id}.svg`, fabricSwatch(id));
  n++;
}

for (const id of productIds) {
  write(`${OUT}/products/${id}-1.svg`, productFront(id));
  write(`${OUT}/products/${id}-2.svg`, productDetail(id));
  write(`${OUT}/products/${id}-3.svg`, productHanger(id));
  write(`${OUT}/products/${id}-4.svg`, productFolded(id));
  n += 4;
}

write(`${OUT}/hero-1.svg`, hero1());
write(`${OUT}/hero-2.svg`, hero2());
write(`${OUT}/hero-3.svg`, hero3());
n += 3;

console.log(`✅ تم توليد ${n} صورة في ${OUT}/`);
