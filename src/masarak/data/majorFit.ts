import type { AnchorId, RiasecId } from "./instrument";

/**
 * بصمة كل تخصص: رمز هولاند + القيم المهنية التي يُشبعها.
 *
 * `riasec` — ثلاثة أحرف مرتّبة من الأقوى إلى الأضعف (رمز هولاند الثلاثي).
 *            مبنية على تصنيف المهن المقابلة في قاعدة O*NET.
 * `anchors` — القيم المهنية (مراسي شاين) التي يُلبّيها هذا المسار عادةً.
 *
 * تُقرأ في `lib/personality.ts` لحساب نسبة التوافق بين الطالب والتخصص.
 */
export type MajorFit = {
  riasec: [RiasecId, RiasecId, RiasecId];
  anchors: AnchorId[];
};

export const MAJOR_FIT: Record<string, MajorFit> = {
  // ═══════════ الصحي ═══════════
  med: { riasec: ["I", "S", "R"], anchors: ["meaning", "esteem", "mastery", "stability"] },
  dent: { riasec: ["I", "R", "S"], anchors: ["esteem", "control", "mastery", "comfort"] },
  pharm: { riasec: ["I", "C", "S"], anchors: ["stability", "mastery", "esteem"] },
  physio: { riasec: ["S", "I", "R"], anchors: ["meaning", "relations", "control"] },
  lab: { riasec: ["I", "R", "C"], anchors: ["mastery", "stability", "meaning"] },
  radiology: { riasec: ["R", "I", "S"], anchors: ["stability", "mastery", "comfort"] },
  optometry: { riasec: ["I", "S", "R"], anchors: ["control", "stability", "esteem"] },
  anesthesia: { riasec: ["R", "I", "S"], anchors: ["stability", "mastery", "meaning"] },
  nutrition: { riasec: ["S", "I", "E"], anchors: ["meaning", "relations", "comfort"] },
  respiratory: { riasec: ["S", "R", "I"], anchors: ["meaning", "stability", "relations"] },
  nursing: { riasec: ["S", "I", "R"], anchors: ["meaning", "relations", "stability"] },
  audiology: { riasec: ["S", "I", "A"], anchors: ["meaning", "relations", "mastery"] },
  emt: { riasec: ["R", "S", "I"], anchors: ["meaning", "relations", "stability"] },
  dentalhygiene: { riasec: ["S", "R", "C"], anchors: ["stability", "comfort", "relations"] },
  vet: { riasec: ["I", "R", "S"], anchors: ["control", "mastery", "meaning"] },
  healthinfo: { riasec: ["C", "I", "E"], anchors: ["stability", "comfort", "relations"] },
  publichealth: { riasec: ["S", "I", "E"], anchors: ["meaning", "stability", "leadership"] },

  // ═══════════ الهندسة ═══════════
  peteng: { riasec: ["R", "I", "E"], anchors: ["mastery", "stability", "esteem"] },
  compeng: { riasec: ["I", "R", "C"], anchors: ["mastery", "creativity", "stability"] },
  chemeng: { riasec: ["I", "R", "C"], anchors: ["mastery", "stability", "esteem"] },
  aero: { riasec: ["I", "R", "C"], anchors: ["mastery", "esteem", "stability"] },
  eeng: { riasec: ["I", "R", "C"], anchors: ["mastery", "stability", "control"] },
  meng: { riasec: ["R", "I", "C"], anchors: ["mastery", "stability", "control"] },
  biomed: { riasec: ["I", "R", "S"], anchors: ["mastery", "meaning", "creativity"] },
  indeng: { riasec: ["E", "I", "C"], anchors: ["leadership", "mastery", "stability"] },
  civil: { riasec: ["R", "I", "C"], anchors: ["leadership", "stability", "control"] },
  arch: { riasec: ["A", "I", "R"], anchors: ["creativity", "esteem", "control"] },
  mining: { riasec: ["R", "I", "C"], anchors: ["mastery", "stability", "comfort"] },
  survey: { riasec: ["R", "C", "I"], anchors: ["stability", "control", "comfort"] },

  // ═══════════ الحاسب ═══════════
  ai: { riasec: ["I", "C", "R"], anchors: ["mastery", "creativity", "esteem"] },
  cyber: { riasec: ["I", "C", "R"], anchors: ["mastery", "stability", "esteem"] },
  ds: { riasec: ["I", "C", "R"], anchors: ["mastery", "creativity", "comfort"] },
  cs: { riasec: ["I", "R", "C"], anchors: ["mastery", "creativity", "control"] },
  se: { riasec: ["I", "C", "R"], anchors: ["mastery", "creativity", "comfort"] },
  it: { riasec: ["R", "C", "I"], anchors: ["stability", "comfort", "relations"] },
  is: { riasec: ["C", "I", "E"], anchors: ["stability", "comfort", "leadership"] },

  // ═══════════ العلوم ═══════════
  actuarial: { riasec: ["C", "I", "E"], anchors: ["mastery", "comfort", "stability"] },
  stats: { riasec: ["I", "C", "R"], anchors: ["mastery", "stability", "comfort"] },
  math: { riasec: ["I", "C", "R"], anchors: ["mastery", "stability", "comfort"] },
  chem: { riasec: ["I", "R", "C"], anchors: ["mastery", "stability"] },
  bio: { riasec: ["I", "R", "C"], anchors: ["mastery", "meaning", "stability"] },
  phys: { riasec: ["I", "R", "C"], anchors: ["mastery", "stability"] },
  envsci: { riasec: ["I", "R", "S"], anchors: ["meaning", "mastery", "stability"] },
  geo: { riasec: ["I", "R", "E"], anchors: ["mastery", "control", "stability"] },
  foodsci: { riasec: ["I", "R", "C"], anchors: ["stability", "mastery", "comfort"] },
  agri: { riasec: ["R", "I", "E"], anchors: ["control", "comfort", "meaning"] },

  // ═══════════ الأعمال ═══════════
  fin: { riasec: ["C", "E", "I"], anchors: ["leadership", "comfort", "esteem"] },
  mis: { riasec: ["C", "I", "E"], anchors: ["leadership", "stability", "comfort"] },
  acct: { riasec: ["C", "E", "I"], anchors: ["stability", "comfort", "mastery"] },
  supply: { riasec: ["C", "E", "R"], anchors: ["leadership", "stability", "comfort"] },
  econ: { riasec: ["I", "E", "C"], anchors: ["mastery", "esteem", "stability"] },
  ecom: { riasec: ["E", "C", "I"], anchors: ["creativity", "control", "leadership"] },
  mkt: { riasec: ["E", "A", "S"], anchors: ["creativity", "relations", "leadership"] },
  islamicbank: { riasec: ["C", "E", "S"], anchors: ["stability", "meaning", "comfort"] },
  mgmt: { riasec: ["E", "S", "C"], anchors: ["leadership", "relations", "stability"] },
  hr: { riasec: ["S", "E", "C"], anchors: ["relations", "meaning", "comfort"] },
  tourism: { riasec: ["E", "S", "C"], anchors: ["relations", "creativity", "leadership"] },

  // ═══════════ القانون ═══════════
  law: { riasec: ["E", "I", "S"], anchors: ["esteem", "control", "leadership"] },
  polsci: { riasec: ["E", "S", "I"], anchors: ["esteem", "meaning", "leadership"] },

  // ═══════════ الإنسانيات ═══════════
  english: { riasec: ["A", "S", "I"], anchors: ["relations", "comfort", "mastery"] },
  translation: { riasec: ["A", "S", "I"], anchors: ["control", "mastery", "comfort"] },
  psych: { riasec: ["S", "I", "A"], anchors: ["meaning", "relations", "mastery"] },
  media: { riasec: ["A", "E", "S"], anchors: ["creativity", "esteem", "relations"] },
  pr: { riasec: ["E", "A", "S"], anchors: ["relations", "creativity", "esteem"] },
  arabic: { riasec: ["A", "S", "I"], anchors: ["mastery", "stability", "comfort"] },
  socio: { riasec: ["S", "I", "A"], anchors: ["meaning", "relations", "comfort"] },
  socialwork: { riasec: ["S", "E", "A"], anchors: ["meaning", "relations", "stability"] },
  geography: { riasec: ["I", "R", "C"], anchors: ["stability", "mastery", "comfort"] },
  history: { riasec: ["I", "S", "A"], anchors: ["mastery", "comfort", "stability"] },
  libinfo: { riasec: ["C", "S", "I"], anchors: ["comfort", "stability", "relations"] },

  // ═══════════ الشرعي ═══════════
  sharia: { riasec: ["S", "I", "E"], anchors: ["meaning", "esteem", "stability"] },
  islamicstudies: { riasec: ["S", "I", "A"], anchors: ["meaning", "stability", "esteem"] },
  quran: { riasec: ["S", "A", "I"], anchors: ["meaning", "mastery", "stability"] },
  usul: { riasec: ["I", "S", "A"], anchors: ["mastery", "meaning", "stability"] },
  dawah: { riasec: ["S", "E", "A"], anchors: ["meaning", "relations", "esteem"] },

  // ═══════════ التربية ═══════════
  specialed: { riasec: ["S", "A", "I"], anchors: ["meaning", "relations", "stability"] },
  kindergarten: { riasec: ["S", "A", "E"], anchors: ["meaning", "relations", "comfort"] },
  pe: { riasec: ["S", "R", "E"], anchors: ["relations", "comfort", "meaning"] },

  // ═══════════ التصميم ═══════════
  interior: { riasec: ["A", "I", "R"], anchors: ["creativity", "control", "esteem"] },
  gdesign: { riasec: ["A", "I", "R"], anchors: ["creativity", "control", "comfort"] },
  product: { riasec: ["A", "R", "I"], anchors: ["creativity", "mastery", "control"] },
  fashion: { riasec: ["A", "E", "R"], anchors: ["creativity", "control", "esteem"] },
};
