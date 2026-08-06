"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { BRAND, COPY } from "./config";
import ScoreField from "./components/ScoreField";
import Results from "./components/Results";
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
import type { Gender, StudentInput, Track } from "./types";

const STORE_KEY = "masarak.input.v1";

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

/** آخر إدخال للطالب إن وُجد — تُقرأ مرّة واحدة عند أول عرض في المتصفح */
function readStored(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw) } : null;
  } catch {
    return null; // التخزين المحلي قد يكون معطّلاً
  }
}

const noopSubscribe = () => () => {};

/**
 * هل نحن بعد الترطيب (hydration)؟
 * الصفحة مبنيّة مسبقاً وقت البناء، فلا يمكن قراءة التخزين المحلي أثناء العرض
 * على الخادم. نؤجّل عرض النموذج حتى أول عرض في المتصفح، فلا يقع تعارض ترطيب.
 */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export default function Masarak() {
  const isClient = useIsClient();
  const [draft, setDraft] = useState<Draft>(() => readStored() ?? DEFAULT_DRAFT);
  const [student, setStudent] = useState<StudentInput | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const submit = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(draft));
    } catch {
      /* لا شيء */
    }
    setStudent({ ...draft, region: null });
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
          <span className="mk-chip">
            <IconGraduationCap size={14} />
            دليل القبول الجامعي
          </span>
        </header>

        <div ref={topRef} />

        {student ? (
          <Results student={student} onEdit={() => setStudent(null)} />
        ) : (
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
                onClick={scrollToForm}
              >
                {COPY.heroCta}
                <IconArrowLeft size={19} />
              </button>
            </section>

            <section className="mk-stats mk-mt-lg">
              {[
                { icon: <IconPercent size={18} />, t: "معادلة لكل جامعة", s: "لا نستخدم معادلة واحدة للجميع" },
                { icon: <IconChart size={18} />, t: "ترتيب بالتنافسية", s: "الأصعب فوق والأسهل تحت" },
                { icon: <IconDocument size={18} />, t: "٨٠+ تخصصاً", s: "من الطب إلى التصميم" },
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
                بياناتك
              </h2>

              {!isClient && (
                <div
                  className="mk-glass mk-sheen"
                  style={{ height: 230 }}
                  aria-hidden
                />
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

                    <p className="mk-faint" style={{ fontSize: 12.5, margin: "14px 0 0", lineHeight: 1.7 }}>
                      بعض الجامعات تستخدم معادلة مختلفة للطلاب عن الطالبات، وبعضها
                      مخصّص لجنس واحد — لذلك نسألك.
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
                  onClick={submit}
                >
                  اعرض تخصصاتي
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
