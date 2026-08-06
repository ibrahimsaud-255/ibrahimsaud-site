import {
  ANCHORS,
  ANCHOR_ITEMS,
  ANCHOR_SCALE,
  INTEREST_ITEMS,
  INTEREST_SCALE,
  RIASEC_BY_ID,
  RIASEC_TYPES,
  type AnchorId,
  type RiasecId,
} from "../data/instrument";
import { MAJOR_FIT } from "../data/majorFit";

export type Answers = Record<string, number>;

export type RiasecScores = Record<RiasecId, number>;
export type AnchorScores = Record<AnchorId, number>;

export type Profile = {
  riasec: RiasecScores;
  anchors: AnchorScores;
  /** رمز هولاند الثلاثي — الأنماط الثلاثة الأقوى مرتّبةً */
  code: [RiasecId, RiasecId, RiasecId];
  /** اسم الشخصية، مثل «الباحث الصانع» */
  persona: string;
  /** القيم المهنية الثلاث الأعلى */
  topAnchors: AnchorId[];
};

const MAX_INTEREST = INTEREST_SCALE[INTEREST_SCALE.length - 1].value;
const MAX_ANCHOR = ANCHOR_SCALE[ANCHOR_SCALE.length - 1].value;

const round1 = (n: number) => Math.round(n * 10) / 10;

/* ═══════════════ التصحيح ═══════════════ */

/** درجات الميول الست، كل واحدة من ٠ إلى ١٠٠ */
export function scoreInterests(answers: Answers): RiasecScores {
  const sum = {} as Record<RiasecId, number>;
  const count = {} as Record<RiasecId, number>;
  for (const t of RIASEC_TYPES) {
    sum[t.id] = 0;
    count[t.id] = 0;
  }
  for (const item of INTEREST_ITEMS) {
    const a = answers[item.id];
    if (typeof a !== "number") continue;
    sum[item.type] += a;
    count[item.type] += 1;
  }
  const out = {} as RiasecScores;
  for (const t of RIASEC_TYPES) {
    out[t.id] = count[t.id]
      ? round1((sum[t.id] / (count[t.id] * MAX_INTEREST)) * 100)
      : 0;
  }
  return out;
}

/** درجات القيم المهنية التسع، كل واحدة من ٠ إلى ١٠٠ */
export function scoreAnchors(answers: Answers): AnchorScores {
  const sum = {} as Record<AnchorId, number>;
  const count = {} as Record<AnchorId, number>;
  for (const a of ANCHORS) {
    sum[a.id] = 0;
    count[a.id] = 0;
  }
  for (const item of ANCHOR_ITEMS) {
    const a = answers[item.id];
    if (typeof a !== "number") continue;
    sum[item.anchor] += a;
    count[item.anchor] += 1;
  }
  const out = {} as AnchorScores;
  for (const a of ANCHORS) {
    out[a.id] = count[a.id]
      ? round1((sum[a.id] / (count[a.id] * MAX_ANCHOR)) * 100)
      : 0;
  }
  return out;
}

/** يبني ملف الشخصية الكامل من إجابات الاختبارين */
export function buildProfile(answers: Answers): Profile {
  const riasec = scoreInterests(answers);
  const anchors = scoreAnchors(answers);

  const order = [...RIASEC_TYPES]
    .sort((a, b) => riasec[b.id] - riasec[a.id])
    .map((t) => t.id);
  const code: [RiasecId, RiasecId, RiasecId] = [order[0], order[1], order[2]];

  const topAnchors = [...ANCHORS]
    .sort((a, b) => anchors[b.id] - anchors[a.id])
    .slice(0, 3)
    .map((a) => a.id);

  return {
    riasec,
    anchors,
    code,
    persona: `${RIASEC_BY_ID[code[0]].persona} ${RIASEC_BY_ID[code[1]].persona}`,
    topAnchors,
  };
}

/* ═══════════════ التوافق مع التخصص ═══════════════ */

/** جيب تمام الزاوية بين متجهين — يقيس تشابه «شكل» الملفَّين لا حجمهما */
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const RIASEC_ORDER: RiasecId[] = ["R", "I", "A", "S", "E", "C"];
const ANCHOR_ORDER: AnchorId[] = ANCHORS.map((a) => a.id);

/** أوزان أحرف رمز هولاند: الأول ٣، الثاني ٢، الثالث ١ */
const CODE_WEIGHTS = [3, 2, 1];
/** أوزان القيم التي يخدمها التخصص، بالترتيب */
const ANCHOR_WEIGHTS = [1, 0.8, 0.6, 0.4];

/**
 * نسبة توافق الطالب مع تخصص (٠–١٠٠).
 * ٦٥٪ ميول (هولاند) + ٣٥٪ قيم مهنية (شاين).
 * تُحسب بجيب التمام حتى يُقاس تشابه نمط الاهتمام لا شدّته،
 * فلا يُظلم طالب أجاب بتحفّظ على كل البنود.
 */
export function majorFitScore(profile: Profile, majorId: string): number | null {
  const fit = MAJOR_FIT[majorId];
  if (!fit) return null;

  const studentR = RIASEC_ORDER.map((t) => profile.riasec[t]);
  const majorR = RIASEC_ORDER.map((t) => {
    const idx = fit.riasec.indexOf(t);
    return idx === -1 ? 0 : CODE_WEIGHTS[idx];
  });

  const studentA = ANCHOR_ORDER.map((a) => profile.anchors[a]);
  const majorA = ANCHOR_ORDER.map((a) => {
    const idx = fit.anchors.indexOf(a);
    return idx === -1 ? 0 : (ANCHOR_WEIGHTS[idx] ?? 0.3);
  });

  const r = cosine(studentR, majorR);
  const v = cosine(studentA, majorA);
  return Math.round((r * 0.65 + v * 0.35) * 100);
}

/** وصف نصّي لدرجة التوافق */
export function fitLabel(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: "توافق ممتاز", tone: "strong" };
  if (score >= 68) return { label: "توافق جيد", tone: "likely" };
  if (score >= 55) return { label: "توافق متوسط", tone: "borderline" };
  return { label: "توافق ضعيف", tone: "unlikely" };
}

/* ═══════════════ التقدّم في الاختبار ═══════════════ */

export const TOTAL_ITEMS = INTEREST_ITEMS.length + ANCHOR_ITEMS.length;

export function answeredCount(answers: Answers): number {
  let n = 0;
  for (const it of INTEREST_ITEMS) if (typeof answers[it.id] === "number") n++;
  for (const it of ANCHOR_ITEMS) if (typeof answers[it.id] === "number") n++;
  return n;
}

export function isComplete(answers: Answers): boolean {
  return answeredCount(answers) === TOTAL_ITEMS;
}

/** ترتيب الأنماط تنازلياً مع درجاتها — لعرض الرسم البياني */
export function rankedInterests(p: Profile) {
  return [...RIASEC_TYPES]
    .map((t) => ({ type: t, score: p.riasec[t.id] }))
    .sort((a, b) => b.score - a.score);
}

export function rankedAnchors(p: Profile) {
  return [...ANCHORS]
    .map((a) => ({ anchor: a, score: p.anchors[a.id] }))
    .sort((a, b) => b.score - a.score);
}
