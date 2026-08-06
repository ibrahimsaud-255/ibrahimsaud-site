import { MODEL, THRESHOLDS } from "../config";
import { MAJORS } from "../data/majors";
import { UNIVERSITIES } from "../data/universities";
import { majorFitScore, type Profile } from "./personality";
import type {
  FormulaRule,
  Major,
  MajorMatch,
  MatchRow,
  StudentInput,
  University,
  Verdict,
  Weights,
} from "../types";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ═══════════════ المعادلة ═══════════════ */

/**
 * تختار القاعدة المطبَّقة في جامعة معيّنة على طالب معيّن لتخصص معيّن.
 * تُرجَّح أول قاعدة تنطبق شروطها كلها؛ وإن لم تنطبق أي قاعدة تُستخدم الأولى.
 */
export function pickRule(
  uni: University,
  student: Pick<StudentInput, "track" | "gender">,
  major?: Major
): FormulaRule {
  const match = uni.formulas.find((r) => {
    if (r.tracks && !r.tracks.includes(student.track)) return false;
    if (r.genders && !r.genders.includes(student.gender)) return false;
    if (r.fields && major && !r.fields.includes(major.field)) return false;
    return true;
  });
  return match ?? uni.formulas[0];
}

/** يحسب النسبة الموزونة. يُرجع null إذا كانت المعادلة تشترط تحصيلياً لم يُدخله الطالب. */
export function weightedScore(
  student: Pick<StudentInput, "hs" | "qud" | "tah">,
  w: Weights
): number | null {
  if (w.tah > 0 && (student.tah === null || Number.isNaN(student.tah))) return null;
  const total = w.hs + w.qud + w.tah;
  const raw =
    student.hs * w.hs + student.qud * w.qud + (student.tah ?? 0) * w.tah;
  return round2(raw / total);
}

/**
 * صيغة نصية للمعادلة، مثل: «30٪ ثانوية + 30٪ قدرات + 40٪ تحصيلي».
 * كل رقم يُغلَّف بعازل ثنائي الاتجاه (U+2068…U+2069) وإلا قفزت علامة ٪
 * إلى الطرف الخطأ عند التفاف السطر في سياق عربي.
 */
export function formulaText(w: Weights): string {
  const pct = (n: number) => `⁨${n}٪⁩`;
  const parts: string[] = [];
  if (w.hs) parts.push(`${pct(w.hs)} ثانوية`);
  if (w.qud) parts.push(`${pct(w.qud)} قدرات`);
  if (w.tah) parts.push(`${pct(w.tah)} تحصيلي`);
  return parts.join(" + ");
}

/** صيغة مختصرة للمساحات الضيقة: «30/30/40» بترتيب ثانوية/قدرات/تحصيلي */
export function formulaShort(w: Weights): string {
  const nums = [w.hs, w.qud];
  if (w.tah) nums.push(w.tah);
  return `⁨${nums.join("/")}⁩`;
}

/* ═══════════════ الحد التقديري للقبول ═══════════════ */

/**
 * الحد التقديري لقبول تخصص في جامعة.
 * يُفضَّل الرقم الرسمي المنشور إن وُجد؛ وإلا يُشتق من نموذج مُعاير.
 */
export function cutoffFor(
  major: Major,
  uni: University
): { value: number; source: "known" | "modeled" } {
  const known = uni.knownCutoffs?.[major.id];
  if (typeof known === "number") return { value: known, source: "known" };
  const modeled =
    MODEL.base + major.demand * MODEL.slope + uni.selectivity;
  return { value: round2(clamp(modeled, MODEL.min, MODEL.max)), source: "modeled" };
}

function verdictFor(gap: number): Verdict {
  if (gap >= THRESHOLDS.strong) return "strong";
  if (gap >= THRESHOLDS.likely) return "likely";
  if (gap >= THRESHOLDS.borderline) return "borderline";
  return "unlikely";
}

export const VERDICT_META: Record<
  Verdict,
  { label: string; tone: string; order: number }
> = {
  strong: { label: "فرصة قوية", tone: "strong", order: 0 },
  likely: { label: "مرشّح جيد", tone: "likely", order: 1 },
  borderline: { label: "حدّي", tone: "borderline", order: 2 },
  unlikely: { label: "بعيد", tone: "unlikely", order: 3 },
  blocked: { label: "غير متاح", tone: "blocked", order: 4 },
};

/* ═══════════════ المحرّك ═══════════════ */

/** سبب استبعاد الجامعة كلياً لهذا الطالب، أو null إن كانت متاحة */
function blockReason(uni: University, student: StudentInput): string | null {
  if (uni.serves === "female" && student.gender === "male")
    return "القبول للطالبات فقط";
  if (uni.serves === "male" && student.gender === "female")
    return "القبول للطلاب فقط";
  return null;
}

function buildRow(
  major: Major,
  uni: University,
  student: StudentInput
): MatchRow | null {
  const rule = pickRule(uni, student, major);
  const blocked = blockReason(uni, student);
  const { value: cutoff, source: cutoffSource } = cutoffFor(major, uni);

  if (blocked) {
    return {
      university: uni,
      weighted: 0,
      rule,
      cutoff,
      gap: 0,
      verdict: "blocked",
      cutoffSource,
      blockedReason: blocked,
    };
  }

  const weighted = weightedScore(student, rule.weights);
  if (weighted === null) {
    return {
      university: uni,
      weighted: 0,
      rule,
      cutoff,
      gap: 0,
      verdict: "blocked",
      cutoffSource,
      blockedReason: "تحتاج درجة الاختبار التحصيلي",
    };
  }

  const gap = round2(weighted - cutoff);
  return {
    university: uni,
    weighted,
    rule,
    cutoff,
    gap,
    verdict: verdictFor(gap),
    cutoffSource,
  };
}

/** طريقة ترتيب التخصصات في النتائج */
export type SortMode = "fit" | "hard";

/**
 * المحرّك الرئيسي: يحوّل درجات الطالب (وشخصيته إن توفّرت) إلى قائمة
 * تخصصات، وتحت كل تخصص الجامعات التي تدرّسه.
 *
 * الترتيب الافتراضي «الأصعب أولاً»؛ وإن أُجري اختبار الشخصية صار
 * «الأنسب لك أولاً» مع مراعاة أن التخصص في متناول درجاته.
 */
export function matchAll(
  student: StudentInput,
  profile?: Profile | null,
  sort: SortMode = profile ? "fit" : "hard"
): MajorMatch[] {
  const results: MajorMatch[] = [];

  for (const major of MAJORS) {
    // التخصص غير متاح لمسار الطالب أصلاً
    if (!major.tracks.includes(student.track)) continue;

    const offering = UNIVERSITIES.filter((u) => u.majors.includes(major.id));
    if (offering.length === 0) continue;

    const rows = offering
      .map((u) => buildRow(major, u, student))
      .filter((r): r is MatchRow => r !== null);

    const usable = rows.filter((r) => r.verdict !== "blocked");
    if (rows.length === 0) continue;

    // ترتيب الجامعات: الأقرب للقبول أولاً، ثم الأعلى حداً (الأرقى) بينها
    rows.sort((a, b) => {
      const va = VERDICT_META[a.verdict].order;
      const vb = VERDICT_META[b.verdict].order;
      if (va !== vb) return va - vb;
      if (a.verdict === "blocked") return b.cutoff - a.cutoff;
      return b.cutoff - a.cutoff;
    });

    const open = usable.filter(
      (r) => r.verdict === "strong" || r.verdict === "likely"
    );
    const cutoffs = usable.map((r) => r.cutoff);

    results.push({
      major,
      rows,
      best: open[0] ?? usable.find((r) => r.verdict === "borderline") ?? null,
      openCount: open.length,
      easiestCutoff: cutoffs.length ? Math.min(...cutoffs) : 0,
      hardestCutoff: cutoffs.length ? Math.max(...cutoffs) : 0,
      fit: profile ? majorFitScore(profile, major.id) : null,
    });
  }

  if (sort === "fit" && profile) {
    // الأنسب لشخصيته أولاً، مع تقديم ما هو في متناول درجاته عند التساوي
    results.sort((a, b) => {
      const fa = a.fit ?? 0;
      const fb = b.fit ?? 0;
      if (fb !== fa) return fb - fa;
      if ((b.openCount > 0 ? 1 : 0) !== (a.openCount > 0 ? 1 : 0))
        return (b.openCount > 0 ? 1 : 0) - (a.openCount > 0 ? 1 : 0);
      return b.hardestCutoff - a.hardestCutoff;
    });
  } else {
    // الأصعب أولاً — الطب والهندسة في الأعلى
    results.sort((a, b) => {
      if (b.hardestCutoff !== a.hardestCutoff)
        return b.hardestCutoff - a.hardestCutoff;
      return b.major.demand - a.major.demand;
    });
  }

  return results;
}

/* ═══════════════ ملخّصات ═══════════════ */

export type Summary = {
  /** أعلى نسبة موزونة يحصل عليها الطالب عبر كل الجامعات */
  bestWeighted: number;
  /** أدنى نسبة موزونة */
  worstWeighted: number;
  /** الجامعة صاحبة أعلى نسبة موزونة له */
  bestUniversity: University | null;
  /** عدد التخصصات التي له فيها فرصة قوية أو ترشيح جيد */
  openMajors: number;
  /** عدد التخصصات الحدّية */
  borderlineMajors: number;
  /** إجمالي التخصصات المعروضة */
  totalMajors: number;
  /** أصعب تخصص مفتوح له */
  topReach: MajorMatch | null;
};

export function summarize(student: StudentInput, matches: MajorMatch[]): Summary {
  let bestWeighted = 0;
  let worstWeighted = 100;
  let bestUniversity: University | null = null;

  for (const uni of UNIVERSITIES) {
    if (blockReason(uni, student)) continue;
    const rule = pickRule(uni, student);
    const w = weightedScore(student, rule.weights);
    if (w === null) continue;
    if (w > bestWeighted) {
      bestWeighted = w;
      bestUniversity = uni;
    }
    if (w < worstWeighted) worstWeighted = w;
  }

  const openMajors = matches.filter((m) => m.openCount > 0).length;
  const borderlineMajors = matches.filter(
    (m) => m.openCount === 0 && m.rows.some((r) => r.verdict === "borderline")
  ).length;
  const topReach = matches.find((m) => m.openCount > 0) ?? null;

  return {
    bestWeighted,
    worstWeighted: worstWeighted === 100 ? 0 : worstWeighted,
    bestUniversity,
    openMajors,
    borderlineMajors,
    totalMajors: matches.length,
    topReach,
  };
}

/** كل النسب الموزونة لكل جامعة — لعرض جدول «معادلتك في كل جامعة» */
export function weightedByUniversity(student: StudentInput) {
  return UNIVERSITIES.map((uni) => {
    const rule = pickRule(uni, student);
    const blocked = blockReason(uni, student);
    const value = blocked ? null : weightedScore(student, rule.weights);
    return { university: uni, rule, value, blocked };
  })
    .filter((r) => !r.blocked)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
}
