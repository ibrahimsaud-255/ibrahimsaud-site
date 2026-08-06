/**
 * بوصلة — الأنواع الأساسية
 * وحدة مستقلة تماماً: لا تستورد أي شيء من خارج مجلد `src/bosla`.
 */

/** المسار الدراسي في الثانوية العامة */
export type Track = "sci" | "lit";

/** الجنس — يؤثر على المعادلة في بعض الجامعات وعلى إتاحة بعض التخصصات */
export type Gender = "male" | "female";

/** مجالات التخصصات */
export type FieldId =
  | "health"
  | "engineering"
  | "computing"
  | "science"
  | "business"
  | "law"
  | "humanities"
  | "sharia"
  | "education"
  | "design";

/** مناطق المملكة */
export type RegionId =
  | "riyadh"
  | "makkah"
  | "madinah"
  | "eastern"
  | "qassim"
  | "asir"
  | "tabuk"
  | "hail"
  | "northern"
  | "jazan"
  | "najran"
  | "bahah"
  | "jouf";

/** أوزان المعادلة — يجب أن يكون مجموعها ١٠٠ */
export type Weights = {
  /** وزن نسبة الثانوية العامة */
  hs: number;
  /** وزن اختبار القدرات العامة */
  qud: number;
  /** وزن الاختبار التحصيلي */
  tah: number;
};

/**
 * قاعدة معادلة واحدة داخل الجامعة.
 * تُطبَّق أول قاعدة تنطبق شروطها (بالترتيب)، وإن لم تنطبق أي قاعدة تُستخدم الأخيرة كافتراضي.
 */
export type FormulaRule = {
  /** وصف مختصر يظهر للطالب، مثل: «المسار العلمي والصحي» */
  label: string;
  /** تنطبق على هذه المسارات فقط (اتركها فارغة = كل المسارات) */
  tracks?: Track[];
  /** تنطبق على هذا الجنس فقط */
  genders?: Gender[];
  /** تنطبق على هذه المجالات فقط */
  fields?: FieldId[];
  weights: Weights;
};

/** درجة الثقة في مصدر المعادلة */
export type Confidence =
  /** منشورة في موقع الجامعة أو دليل القبول الرسمي */
  | "official"
  /** متداولة في مصادر ثانوية موثوقة، تحتاج تأكيداً سنوياً */
  | "reported";

export type UniversityType = "gov" | "private";

export type University = {
  id: string;
  name: string;
  /** اسم مختصر للعرض في المساحات الضيقة */
  short: string;
  city: string;
  region: RegionId;
  type: UniversityType;
  /** سنة التأسيس هجرياً */
  founded: number;
  site: string;
  /** لون الهوية — يُستخدم كخلفية للشعار وكلمسة بصرية */
  color: string;
  /** الجامعات المخصصة لجنس واحد */
  serves: "mixed" | "female" | "male";
  /**
   * مؤشر التنافسية النسبي للجامعة (‏-8 إلى +5).
   * يُضاف إلى الحد التقديري لكل تخصص. المرجع صفر = جامعة الإمام عبدالرحمن بن فيصل
   * (المعايرة مبنية على نسب القبول الرسمية المنشورة لها).
   */
  selectivity: number;
  formulas: FormulaRule[];
  /** رابط مصدر المعادلة */
  source: string;
  confidence: Confidence;
  /** معرّفات التخصصات المتاحة في الجامعة */
  majors: string[];
  /**
   * حدود قبول فعلية معروفة، تتجاوز النموذج التقديري.
   * المفتاح = معرّف التخصص، القيمة = أدنى نسبة موزونة قُبل بها.
   */
  knownCutoffs?: Record<string, number>;
  /** ملاحظة تظهر أسفل بطاقة الجامعة */
  note?: string;
};

export type Major = {
  id: string;
  name: string;
  field: FieldId;
  /** المسارات المؤهَّلة للتقديم */
  tracks: Track[];
  /**
   * مؤشر الطلب/التنافسية الوطني (٠–١٠٠).
   * يحدّد ترتيب التخصص في النتائج والحد التقديري للقبول.
   */
  demand: number;
  /** سنوات الدراسة (شاملة السنة التحضيرية حيث تنطبق) */
  years: number;
  /** هل يشترط الاختبار التحصيلي؟ */
  needsTahsili: boolean;
  summary: string;
  careers: string[];
};

/** مدخلات الطالب */
export type StudentInput = {
  track: Track;
  gender: Gender;
  /** نسبة الثانوية العامة ٪ */
  hs: number;
  /** درجة القدرات العامة */
  qud: number;
  /** درجة التحصيلي — اختيارية لطلاب المسار الأدبي */
  tah: number | null;
  /** المنطقة المفضّلة — للترتيب فقط، لا تحجب أي نتيجة */
  region: RegionId | null;
};

/** حالة الطالب تجاه تخصص في جامعة معيّنة */
export type Verdict = "strong" | "likely" | "borderline" | "unlikely" | "blocked";

export type MatchRow = {
  university: University;
  /** النسبة الموزونة محسوبة بمعادلة هذه الجامعة */
  weighted: number;
  /** القاعدة التي طُبِّقت */
  rule: FormulaRule;
  /** الحد التقديري (أو الفعلي) للقبول */
  cutoff: number;
  /** الفارق بين نسبة الطالب والحد */
  gap: number;
  verdict: Verdict;
  /** هل الحد رقم رسمي منشور أم تقدير من النموذج؟ */
  cutoffSource: "known" | "modeled";
  /** سبب الحجب إن كان verdict = blocked */
  blockedReason?: string;
};

export type MajorMatch = {
  major: Major;
  rows: MatchRow[];
  /** أفضل نتيجة متاحة للطالب في هذا التخصص */
  best: MatchRow | null;
  /** عدد الجامعات التي يُرجَّح قبوله فيها */
  openCount: number;
  /** الحد التقديري الأدنى على مستوى المملكة لهذا التخصص */
  easiestCutoff: number;
  /** الحد التقديري الأعلى — يُستخدم لترتيب التخصصات من الأصعب للأسهل */
  hardestCutoff: number;
  /** نسبة التوافق مع شخصية الطالب (٠–١٠٠)، أو null إن لم يُجرِ الاختبار */
  fit: number | null;
};
