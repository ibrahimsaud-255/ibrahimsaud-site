"use client";

import { useMemo, useState } from "react";
import {
  ANCHOR_ITEMS,
  ANCHOR_SCALE,
  INTEREST_ITEMS,
  INTEREST_SCALE,
} from "../data/instrument";
import type { Answers } from "../lib/personality";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconCheckCircle,
  IconTarget,
} from "./Icons";

type Step =
  | { kind: "interest"; id: string; text: string }
  | { kind: "anchor"; id: string; text: string };

const STEPS: Step[] = [
  ...INTEREST_ITEMS.map((i) => ({ kind: "interest" as const, id: i.id, text: i.text })),
  ...ANCHOR_ITEMS.map((i) => ({ kind: "anchor" as const, id: i.id, text: i.text })),
];

const FIRST_ANCHOR = INTEREST_ITEMS.length;

/**
 * محرّك الاختبار: سؤال واحد في الشاشة، إجابة بضغطة واحدة ثم انتقال تلقائي.
 * الإجابات تُحفظ أولاً بأول فيستطيع الطالب إغلاق الصفحة والعودة.
 */
export default function Quiz({
  answers,
  onAnswer,
  onDone,
  onExit,
}: {
  answers: Answers;
  onAnswer: (id: string, value: number) => void;
  onDone: () => void;
  onExit: () => void;
}) {
  // يبدأ من أول سؤال غير مُجاب
  const [index, setIndex] = useState(() => {
    const i = STEPS.findIndex((s) => typeof answers[s.id] !== "number");
    return i === -1 ? 0 : i;
  });
  // شاشة فاصلة بين جزأي الاختبار
  const [showBreak, setShowBreak] = useState(false);

  const step = STEPS[index];
  const scale = step.kind === "interest" ? INTEREST_SCALE : ANCHOR_SCALE;
  const done = useMemo(
    () => STEPS.filter((s) => typeof answers[s.id] === "number").length,
    [answers]
  );
  const progress = Math.round((done / STEPS.length) * 100);

  function pick(value: number) {
    onAnswer(step.id, value);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(6);
    }
    // آخر سؤال ← إنهاء
    if (index >= STEPS.length - 1) {
      onDone();
      return;
    }
    // نهاية الجزء الأول ← شاشة فاصلة
    if (index + 1 === FIRST_ANCHOR) {
      setShowBreak(true);
      setIndex(index + 1);
      return;
    }
    setIndex(index + 1);
  }

  if (showBreak) {
    return (
      <Shell progress={progress} onExit={onExit}>
        <section className="mk-glass mk-sheen mk-reveal" style={{ padding: 26, textAlign: "center" }}>
          <span className="mk-major-icon" style={{ margin: "0 auto 16px" }}>
            <IconBriefcase size={24} />
          </span>
          <h2 className="mk-h2" style={{ marginBottom: 12 }}>
            انتهى الجزء الأول
          </h2>
          <p className="mk-lead" style={{ fontSize: 15.5 }}>
            عرفنا الآن ما الذي تميل إليه من أنشطة العمل. بقي جزء أقصر: ما الذي
            يهمّك في الوظيفة نفسها — الاستقلال؟ الاستقرار؟ الأثر؟
          </p>
          <p className="mk-faint" style={{ fontSize: 13.5, marginTop: 10 }}>
            {ANCHOR_ITEMS.length} عبارة قصيرة، أقل من دقيقتين.
          </p>
          <button
            type="button"
            className="mk-btn mk-btn-primary mk-btn-block"
            style={{ marginTop: 22 }}
            onClick={() => setShowBreak(false)}
          >
            أكمل
            <IconArrowLeft size={19} />
          </button>
        </section>
      </Shell>
    );
  }

  return (
    <Shell progress={progress} onExit={onExit}>
      <div className="mk-between" style={{ marginBottom: 14 }}>
        <span className="mk-chip">
          {step.kind === "interest" ? (
            <>
              <IconTarget size={14} />
              ميولك
            </>
          ) : (
            <>
              <IconBriefcase size={14} />
              قيمك في العمل
            </>
          )}
        </span>
        <span className="mk-faint mk-num" style={{ fontSize: 13, fontWeight: 700 }} dir="ltr">
          {index + 1} / {STEPS.length}
        </span>
      </div>

      <section className="mk-glass mk-sheen" style={{ padding: "26px 20px" }} key={step.id}>
        <p className="mk-faint" style={{ fontSize: 13, margin: 0 }}>
          {step.kind === "interest" ? "هل يعجبك أن…" : "إلى أي حدّ تنطبق عليك؟"}
        </p>
        <h2
          className="mk-quiz-q mk-reveal"
          style={{ margin: "10px 0 24px" }}
        >
          {step.text}
        </h2>

        <div className="mk-grid" style={{ gap: 9 }}>
          {scale.map((opt) => {
            const on = answers[step.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className="mk-choice"
                data-on={on}
                onClick={() => pick(opt.value)}
              >
                <span>{opt.label}</span>
                {on && <IconCheckCircle size={19} />}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mk-between mk-mt">
        <button
          type="button"
          className="mk-btn mk-btn-ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{ opacity: index === 0 ? 0.4 : 1 }}
        >
          <IconArrowRight size={18} />
          السابق
        </button>

        {typeof answers[step.id] === "number" && index < STEPS.length - 1 && (
          <button
            type="button"
            className="mk-btn mk-btn-ghost"
            onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
          >
            التالي
            <IconArrowLeft size={18} />
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({
  progress,
  onExit,
  children,
}: {
  progress: number;
  onExit: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mk-between" style={{ gap: 14, marginBottom: 16 }}>
        <button type="button" className="mk-btn mk-btn-ghost" onClick={onExit}>
          حفظ وخروج
        </button>
        <div style={{ flex: 1 }}>
          <div className="mk-progress">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="mk-faint mk-num" style={{ fontSize: 13, fontWeight: 700 }}>
          {progress}٪
        </span>
      </div>
      {children}
    </>
  );
}
