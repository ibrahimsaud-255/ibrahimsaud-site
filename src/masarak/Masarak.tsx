"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BRAND, COPY } from "./config";
import Gate from "./components/Gate";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import ScoreField from "./components/ScoreField";
import {
  IconArrowLeft,
  IconChart,
  IconCompass,
  IconDocument,
  IconGraduationCap,
  IconInfo,
  IconPercent,
  IconTarget,
  IconUser,
} from "./components/Icons";
import { saveResult, savedToken, verifySaved } from "./lib/access";
import {
  buildProfile,
  isComplete,
  majorFitScore,
  type Answers,
} from "./lib/personality";
import { matchAll, summarize } from "./lib/calc";
import type { Gender, StudentInput, Track } from "./types";

const DRAFT_KEY = "masarak.input.v1";
const ANSWERS_KEY = "masarak.answers.v1";

type Draft = {
  track: Track;
  gender: Gender;
  hs: number;
  qud: number;
  tah: number | null;
};

const DEFAULT_DRAFT: Draft = {
  track: "sci",
  gender: "male",
  hs: 92,
  qud: 80,
  tah: 78,
};

/** مرحلة رحلة الطالب */
type Stage = "checking" | "locked" | "form" | "quiz" | "results";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* التخزين المحلي معطّل — نتجاهل */
  }
}

const noopSubscribe = () => () => {};

/**
 * هل نحن بعد الترطيب (hydration)؟
 * الصفحة مبنيّة وقت البناء فلا يمكن قراءة التخزين المحلي أثناء العرض على
 * الخادم؛ نؤجّل عرض ما يعتمد عليه حتى أول عرض في المتصفح.
 */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export default function Masarak() {
  const isClient = useIsClient();
  const [stage, setStage] = useState<Stage>("checking");
  const [draft, setDraft] = useState<Draft>(() => readJson(DRAFT_KEY, DEFAULT_DRAFT));
  const [answers, setAnswers] = useState<Answers>(() => readJson<Answers>(ANSWERS_KEY, {}));
  const [student, setStudent] = useState<StudentInput | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const savedOnce = useRef(false);

  const profile = useMemo(
    () => (isComplete(answers) ? buildProfile(answers) : null),
    [answers]
  );

  // فحص كود التفعيل مرّة واحدة عند الفتح
  useEffect(() => {
    let alive = true;
    verifySaved().then((r) => {
      if (alive) setStage(r.ok ? "form" : "locked");
    });
    return () => {
      alive = false;
    };
  }, []);

  // حفظ نتيجة مجهّلة للإحصاء — مرّة واحدة لكل جلسة
  useEffect(() => {
    if (stage !== "results" || !student || !profile || savedOnce.current) return;
    savedOnce.current = true;
    const matches = matchAll(student, profile, "fit");
    const s = summarize(student, matches);
    saveResult({
      track: student.track,
      gender: student.gender,
      weighted: s.bestWeighted,
      riasec: profile.riasec,
      anchors: profile.anchors,
      top_majors: matches.slice(0, 5).map((m) => ({
        id: m.major.id,
        fit: majorFitScore(profile, m.major.id),
        open: m.openCount,
      })),
    });
  }, [stage, student, profile]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => {
      const next = { ...d, [k]: v };
      writeJson(DRAFT_KEY, next);
      return next;
    });

  const answer = (id: string, value: number) =>
    setAnswers((a) => {
      const next = { ...a, [id]: value };
      writeJson(ANSWERS_KEY, next);
      return next;
    });

  const scrollTop = () =>
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );

  function submitGrades() {
    setStudent({ ...draft, region: null });
    setStage(profile ? "results" : "quiz");
    scrollTop();
  }

  function finishQuiz() {
    savedOnce.current = false;
    setStage("results");
    scrollTop();
  }

  function retakeQuiz() {
    setAnswers({});
    writeJson(ANSWERS_KEY, {});
    savedOnce.current = false;
    setStage("quiz");
    scrollTop();
  }

  if (stage === "locked") {
    return <Gate onUnlocked={() => setStage("form")} />;
  }

  return (
    <div className="masarak">
      <div className="mk-bgfx" aria-hidden>
        <span className="mk-orb a" />
        <span className="mk-orb b" />
        <span className="mk-orb c" />
        <span className="mk-grain" />
      </div>

      <div className="mk-shell">
        <header className="mk-topbar">
          <span className="mk-brand">
            <IconCompass size={24} />
            {BRAND.name}
          </span>
          {isClient && savedToken() === "demo" ? (
            <span className="mk-chip" data-tone="borderline">
              وضع التجربة
            </span>
          ) : (
            <span className="mk-chip">
              <IconGraduationCap size={14} />
              دليل القبول الجامعي
            </span>
          )}
        </header>

        <div ref={topRef} />

        {stage === "checking" && (
          <div className="mk-glass mk-sheen mk-mt" style={{ height: 220 }} aria-hidden />
        )}

        {stage === "quiz" && (
          <Quiz
            answers={answers}
            onAnswer={answer}
            onDone={finishQuiz}
            onExit={() => {
              setStage(student ? "results" : "form");
              scrollTop();
            }}
          />
        )}

        {stage === "results" && student && (
          <Results
            student={student}
            profile={profile}
            onEdit={() => {
              setStage("form");
              scrollTop();
            }}
            onTakeQuiz={retakeQuiz}
          />
        )}

        {stage === "form" && (
          <>
            {/* ── الواجهة التسويقية ── */}
            <section
              className="mk-reveal"
              style={{ padding: "28px 2px 8px", textAlign: "center" }}
            >
              <span className="mk-chip" style={{ marginBottom: 18 }}>
                <IconTarget size={14} />
                {COPY.heroSecondary}
              </span>
              <h1 className="mk-h1" style={{ marginBottom: 16 }}>
                {COPY.heroTitle}
              </h1>
              <p className="mk-lead" style={{ maxWidth: 620, margin: "0 auto" }}>
                {COPY.heroLead}
              </p>
              <button
                type="button"
                className="mk-btn mk-btn-primary"
                style={{ marginTop: 28 }}
                onClick={() =>
                  formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {COPY.heroCta}
                <IconArrowLeft size={19} />
              </button>
            </section>

            <section className="mk-stats mk-mt-lg">
              {[
                { icon: <IconPercent size={18} />, t: "معادلة لكل جامعة", s: "لا نستخدم معادلة واحدة للجميع" },
                { icon: <IconTarget size={18} />, t: "اختبار ميول علمي", s: "نموذج هولاند ومراسي شاين" },
                { icon: <IconDocument size={18} />, t: "٨٢ تخصصاً", s: "من الطب إلى التصميم" },
                { icon: <IconGraduationCap size={18} />, t: "٢٨ جامعة حكومية", s: "كل مناطق المملكة" },
              ].map((f) => (
                <div key={f.t} className="mk-glass-sm mk-stat">
                  <span style={{ color: "var(--mk-accent)" }}>{f.icon}</span>
                  <b style={{ fontSize: 16, marginTop: 8 }}>{f.t}</b>
                  <span>{f.s}</span>
                </div>
              ))}
            </section>

            {/* ── النموذج ── */}
            <div ref={formRef} className="mk-grid mk-mt-lg" style={{ gap: 14 }}>
              <h2 className="mk-h2" style={{ marginBottom: 2 }}>
                الخطوة الأولى — درجاتك
              </h2>

              {!isClient && (
                <div className="mk-glass mk-sheen" style={{ height: 230 }} aria-hidden />
              )}

              {isClient && (
                <>
                  <section className="mk-glass mk-sheen" style={{ padding: 18 }}>
                    <div className="mk-label" style={{ marginBottom: 10 }}>
                      مسارك في الثانوية
                    </div>
                    <div className="mk-seg">
                      <button
                        type="button"
                        className="mk-seg-item"
                        data-on={draft.track === "sci"}
                        onClick={() => set("track", "sci")}
                      >
                        علمي
                      </button>
                      <button
                        type="button"
                        className="mk-seg-item"
                        data-on={draft.track === "lit"}
                        onClick={() => set("track", "lit")}
                      >
                        أدبي / شرعي
                      </button>
                    </div>

                    <div className="mk-label" style={{ margin: "18px 0 10px" }}>
                      الجنس
                    </div>
                    <div className="mk-seg">
                      <button
                        type="button"
                        className="mk-seg-item"
                        data-on={draft.gender === "male"}
                        onClick={() => set("gender", "male")}
                      >
                        طالب
                      </button>
                      <button
                        type="button"
                        className="mk-seg-item"
                        data-on={draft.gender === "female"}
                        onClick={() => set("gender", "female")}
                      >
                        طالبة
                      </button>
                    </div>

                    <p
                      className="mk-faint"
                      style={{ fontSize: 12.5, margin: "14px 0 0", lineHeight: 1.7 }}
                    >
                      بعض الجامعات تستخدم معادلة مختلفة للطلاب عن الطالبات،
                      وبعضها مخصّص لجنس واحد — لذلك نسألك.
                    </p>
                  </section>

                  <ScoreField
                    label="نسبة الثانوية العامة"
                    icon={<IconGraduationCap size={19} />}
                    value={draft.hs}
                    onChange={(v) => set("hs", v ?? 0)}
                    hint="المعدل التراكمي كما يظهر في نظام نور."
                  />
                  <ScoreField
                    label="اختبار القدرات العامة"
                    icon={<IconTarget size={19} />}
                    value={draft.qud}
                    onChange={(v) => set("qud", v ?? 0)}
                    hint="أعلى درجة حصلت عليها — الجامعات تعتمد الأعلى."
                  />
                  <ScoreField
                    label="الاختبار التحصيلي"
                    icon={<IconChart size={19} />}
                    value={draft.tah}
                    onChange={(v) => set("tah", v)}
                    optional
                    optionalLabel="لم أختبره"
                    hint="مطلوب لأغلب التخصصات العلمية والصحية."
                  />
                </>
              )}

              <div className="mk-note">
                <IconInfo size={18} />
                <span>{COPY.disclaimerShort}</span>
              </div>

              <div className="mk-dock mk-glass mk-sheen">
                <button
                  type="button"
                  className="mk-btn mk-btn-primary mk-btn-block"
                  onClick={submitGrades}
                >
                  {profile ? "اعرض نتائجي" : "التالي — اختبار الميول"}
                  <IconArrowLeft size={19} />
                </button>
              </div>
            </div>
          </>
        )}

        <footer
          className="mk-center mk-faint mk-mt-lg"
          style={{ fontSize: 12.5, lineHeight: 1.9, paddingTop: 20 }}
        >
          <div className="mk-row" style={{ justifyContent: "center", marginBottom: 8 }}>
            <IconUser size={14} />
            {BRAND.name} — {BRAND.tagline}
          </div>
          <div>
            الشعارات والأسماء التجارية ملك لأصحابها، وتُعرض هنا للتعريف بالجامعات فقط.
          </div>
        </footer>
      </div>
    </div>
  );
}
