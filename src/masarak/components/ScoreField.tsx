"use client";

import { useId, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  /** يسمح بتركه فارغاً (للتحصيلي في المسار الأدبي) */
  optional?: boolean;
  optionalLabel?: string;
};

/**
 * مُدخل درجة مُحسَّن للجوال:
 * رقم ضخم قابل للكتابة مباشرةً + زرّا زيادة/نقصان كبيران + شريط منزلق.
 * ثلاث طرق إدخال لنفس القيمة، والطالب يختار الأسرع له.
 */
export default function ScoreField({
  label,
  hint,
  icon,
  value,
  onChange,
  min = 0,
  max = 100,
  optional = false,
  optionalLabel = "لم أختبره بعد",
}: Props) {
  const id = useId();
  const [text, setText] = useState<string>(value === null ? "" : String(value));

  const commit = (raw: string) => {
    setText(raw);
    if (raw.trim() === "") {
      onChange(optional ? null : min);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(Math.min(max, Math.max(min, n)));
  };

  const nudge = (delta: number) => {
    const next = Math.min(max, Math.max(min, (value ?? min) + delta));
    setText(String(next));
    onChange(next);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(8);
    }
  };

  const filled = ((value ?? min) - min) / (max - min);
  const off = value === null;

  return (
    <section className="mk-glass mk-sheen mk-score">
      <header className="mk-between">
        <span className="mk-score-head">
          {icon}
          {label}
        </span>
        {optional && (
          <button
            type="button"
            className="mk-chip"
            aria-pressed={off}
            data-tone={off ? "likely" : undefined}
            onClick={() => {
              if (off) {
                setText("75");
                onChange(75);
              } else {
                setText("");
                onChange(null);
              }
            }}
          >
            {off ? "أدخل الدرجة" : optionalLabel}
          </button>
        )}
      </header>

      {off ? (
        <p className="mk-faint" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          سنعرض لك الجامعات والتخصصات التي لا تشترط الاختبار التحصيلي.
        </p>
      ) : (
        <>
          <div className="mk-score-row">
            <button
              type="button"
              className="mk-step"
              onClick={() => nudge(-1)}
              aria-label={`إنقاص ${label}`}
            >
              −
            </button>

            <div className="mk-score-value">
              <input
                id={id}
                className="mk-score-input"
                type="number"
                inputMode="decimal"
                enterKeyHint="done"
                min={min}
                max={max}
                step="0.01"
                value={text}
                onChange={(e) => commit(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={() => setText(String(value ?? min))}
                aria-label={label}
              />
              <span className="mk-score-pct">٪</span>
            </div>

            <button
              type="button"
              className="mk-step"
              onClick={() => nudge(1)}
              aria-label={`زيادة ${label}`}
            >
              +
            </button>
          </div>

          <input
            className="mk-range"
            type="range"
            min={min}
            max={max}
            step={0.5}
            value={value ?? min}
            style={{ ["--mk-fill" as string]: `${filled * 100}%` }}
            onChange={(e) => commit(e.target.value)}
            aria-label={`${label} — شريط منزلق`}
          />
        </>
      )}

      {hint && (
        <p className="mk-faint" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.6 }}>
          {hint}
        </p>
      )}
    </section>
  );
}
