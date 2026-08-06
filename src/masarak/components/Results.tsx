"use client";

import { useMemo, useState } from "react";
import { COPY } from "../config";
import { REGION_NAME } from "../data/universities";
import {
  VERDICT_META,
  formulaShort,
  formulaText,
  matchAll,
  summarize,
  weightedByUniversity,
} from "../lib/calc";
import type { FieldId, MajorMatch, MatchRow, StudentInput } from "../types";
import {
  FIELD_ICON,
  FIELD_NAME,
  IconAlert,
  IconBuilding,
  IconCheckCircle,
  IconChevronDown,
  IconInfo,
  IconLock,
  IconMapPin,
  IconRefresh,
  IconTarget,
} from "./Icons";
import UniversityLogo from "./UniversityLogo";

const FIELDS = Object.keys(FIELD_NAME) as FieldId[];

const fmt = (n: number) => n.toFixed(2);

/* ─────────────── صف جامعة داخل تخصص ─────────────── */

function UniRow({ row }: { row: MatchRow }) {
  const meta = VERDICT_META[row.verdict];
  const blocked = row.verdict === "blocked";

  // موقع الطالب على مقياس ‏±٦ نقاط حول الحد
  const pos = Math.min(100, Math.max(0, ((row.gap + 6) / 12) * 100));

  return (
    <div className="mk-uni" data-tone={meta.tone}>
      <UniversityLogo uni={row.university} />

      <div style={{ minWidth: 0 }}>
        <div className="mk-uni-name">{row.university.name}</div>
        <div className="mk-uni-meta">
          <IconMapPin size={13} />
          {row.university.city}
          <span className="mk-dot">·</span>
          {REGION_NAME[row.university.region]}
        </div>

        {blocked ? (
          <div className="mk-uni-meta" style={{ marginTop: 6 }}>
            <IconLock size={13} />
            {row.blockedReason}
          </div>
        ) : (
          <>
            <div
              className="mk-gauge"
              style={{ marginTop: 8, color: `var(--mk-${toneColor(meta.tone)})` }}
            >
              <i style={{ width: `${pos}%` }} />
            </div>
            <div className="mk-uni-meta" style={{ marginTop: 6 }}>
              <span>
                الحد التقديري <bdi>{fmt(row.cutoff)}</bdi>
              </span>
              {row.cutoffSource === "known" && (
                <>
                  <span className="mk-dot">·</span>
                  <span style={{ color: "var(--mk-green)" }}>رقم رسمي</span>
                </>
              )}
              <span className="mk-dot">·</span>
              <span>
                {row.gap >= 0 ? "أعلى بـ" : "أقل بـ"}{" "}
                <bdi>{fmt(Math.abs(row.gap))}</bdi>
              </span>
            </div>
            <div className="mk-formula" title={formulaText(row.rule.weights)}>
              {formulaShort(row.rule.weights)} · {row.rule.label}
            </div>
          </>
        )}
      </div>

      <div className="mk-uni-score">
        {blocked ? (
          <span className="mk-chip" data-tone="blocked">
            {meta.label}
          </span>
        ) : (
          <>
            <b>{fmt(row.weighted)}</b>
            <span>نسبتك هنا</span>
            <div style={{ marginTop: 6 }}>
              <span className="mk-chip" data-tone={meta.tone}>
                {meta.label}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function toneColor(tone: string) {
  if (tone === "strong") return "green";
  if (tone === "likely") return "accent";
  if (tone === "borderline") return "amber";
  return "red";
}

/* ─────────────── بطاقة تخصص ─────────────── */

function MajorCard({ m, index }: { m: MajorMatch; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = FIELD_ICON[m.major.field];
  const tone =
    m.openCount > 0
      ? "strong"
      : m.rows.some((r) => r.verdict === "borderline")
        ? "borderline"
        : "unlikely";

  return (
    <article className="mk-glass mk-sheen mk-major">
      <button
        type="button"
        className="mk-major-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="mk-major-icon">
          <Icon size={23} />
        </span>

        <span style={{ minWidth: 0 }}>
          <span className="mk-major-name">{m.major.name}</span>
          <span className="mk-major-sub">
            <span className="mk-chip" data-tone={tone}>
              {m.openCount > 0
                ? `${m.openCount} جامعة تقبلك`
                : tone === "borderline"
                  ? "فرص حدّية"
                  : "خارج متناولك حالياً"}
            </span>
            <span>{FIELD_NAME[m.major.field]}</span>
            <span className="mk-dot">·</span>
            <span>{m.major.years} سنوات</span>
            <span className="mk-dot">·</span>
            <span>
              يبدأ من <bdi>{fmt(m.easiestCutoff)}</bdi>
            </span>
          </span>
        </span>

        <span
          style={{
            display: "grid",
            placeItems: "center",
            transition: "transform .25s cubic-bezier(.32,.72,0,1)",
            transform: open ? "rotate(180deg)" : "none",
            color: "var(--mk-faint)",
          }}
        >
          <IconChevronDown size={20} />
        </span>
      </button>

      {open && (
        <div className="mk-major-body">
          <p
            className="mk-dim"
            style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75 }}
          >
            {m.major.summary}
          </p>

          <div className="mk-row mk-wrap" style={{ gap: 6 }}>
            {m.major.careers.map((c) => (
              <span key={c} className="mk-chip">
                {c}
              </span>
            ))}
          </div>

          <p className="mk-faint" style={{ margin: 0, fontSize: 12 }}>
            الأرقام أسفل كل جامعة هي أوزان معادلتها بترتيب: ثانوية / قدرات / تحصيلي.
          </p>

          <div className="mk-grid">
            {m.rows.map((r) => (
              <UniRow key={r.university.id} row={r} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

/* ─────────────── النتائج ─────────────── */

export default function Results({
  student,
  onEdit,
}: {
  student: StudentInput;
  onEdit: () => void;
}) {
  const [field, setField] = useState<FieldId | "all">("all");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);

  const matches = useMemo(() => matchAll(student), [student]);
  const summary = useMemo(() => summarize(student, matches), [student, matches]);
  const perUni = useMemo(() => weightedByUniversity(student), [student]);

  const visible = useMemo(() => {
    let list = matches;
    if (field !== "all") list = list.filter((m) => m.major.field === field);
    if (onlyOpen)
      list = list.filter(
        (m) => m.openCount > 0 || m.rows.some((r) => r.verdict === "borderline")
      );
    return list;
  }, [matches, field, onlyOpen]);

  const fieldCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of matches) {
      if (onlyOpen && m.openCount === 0) continue;
      c[m.major.field] = (c[m.major.field] ?? 0) + 1;
    }
    return c;
  }, [matches, onlyOpen]);

  return (
    <div className="mk-reveal">
      {/* ملخّص */}
      <section className="mk-glass mk-sheen" style={{ padding: 22 }}>
        <div className="mk-between mk-wrap" style={{ marginBottom: 18 }}>
          <div>
            <div className="mk-label">أعلى نسبة موزونة لك</div>
            <div
              className="mk-num"
              style={{ fontSize: "clamp(44px,13vw,64px)", fontWeight: 800, lineHeight: 1.05 }}
            >
              {fmt(summary.bestWeighted)}
              <span style={{ fontSize: "0.4em", color: "var(--mk-faint)" }}>٪</span>
            </div>
            {summary.bestUniversity && (
              <div className="mk-uni-meta" style={{ marginTop: 4 }}>
                <IconBuilding size={13} />
                في {summary.bestUniversity.name}
              </div>
            )}
          </div>

          <button type="button" className="mk-btn mk-btn-ghost" onClick={onEdit}>
            <IconRefresh size={18} />
            عدّل درجاتي
          </button>
        </div>

        <div className="mk-stats">
          <div className="mk-glass-sm mk-stat">
            <b style={{ color: "var(--mk-green)" }}>{summary.openMajors}</b>
            <span>تخصص مفتوح لك</span>
          </div>
          <div className="mk-glass-sm mk-stat">
            <b style={{ color: "var(--mk-amber)" }}>{summary.borderlineMajors}</b>
            <span>تخصص حدّي</span>
          </div>
          <div className="mk-glass-sm mk-stat">
            <b>{summary.totalMajors}</b>
            <span>تخصص مطابق لمسارك</span>
          </div>
          <div className="mk-glass-sm mk-stat">
            {/* الأرقام والشرطة تُعزل باتجاه LTR وإلا قفزت الشرطة لأول السطر */}
            <b className="mk-num" dir="ltr" style={{ fontSize: "clamp(20px,5.4vw,26px)" }}>
              {fmt(summary.worstWeighted)} – {fmt(summary.bestWeighted)}
            </b>
            <span>مدى نسبتك بين الجامعات</span>
          </div>
        </div>

        {summary.topReach && (
          <div className="mk-note" style={{ marginTop: 14 }}>
            <IconTarget size={18} />
            <span>
              أعلى تخصص في متناولك الآن هو{" "}
              <b style={{ color: "var(--mk-ink)" }}>{summary.topReach.major.name}</b>
              {summary.topReach.best && (
                <>
                  {" "}في {summary.topReach.best.university.name} —{" "}
                  {summary.topReach.best.university.city}
                </>
              )}
              .
            </span>
          </div>
        )}
      </section>

      {/* الفلاتر */}
      <div className="mk-mt">
        <div className="mk-between mk-wrap" style={{ marginBottom: 10 }}>
          <h2 className="mk-h2">التخصصات</h2>
          <button
            type="button"
            className="mk-filter"
            data-on={onlyOpen}
            onClick={() => setOnlyOpen((v) => !v)}
          >
            {onlyOpen ? <IconCheckCircle size={17} /> : <IconAlert size={17} />}
            {onlyOpen ? "المتاح لي فقط" : "كل التخصصات"}
          </button>
        </div>

        <div className="mk-filters">
          <button
            type="button"
            className="mk-filter"
            data-on={field === "all"}
            onClick={() => setField("all")}
          >
            الكل
            <span className="mk-faint">{visible.length}</span>
          </button>
          {FIELDS.filter((f) => fieldCounts[f]).map((f) => {
            const Icon = FIELD_ICON[f];
            return (
              <button
                key={f}
                type="button"
                className="mk-filter"
                data-on={field === f}
                onClick={() => setField(f)}
              >
                <Icon size={17} />
                {FIELD_NAME[f]}
                <span className="mk-faint">{fieldCounts[f]}</span>
              </button>
            );
          })}
        </div>

        <p className="mk-faint" style={{ fontSize: 12.5, margin: "12px 2px 0" }}>
          مرتّبة من الأصعب قبولاً إلى الأسهل. اضغط أي تخصص لتفتح الجامعات التي تدرّسه.
        </p>
      </div>

      {/* القائمة */}
      <div className="mk-grid mk-mt">
        {visible.length === 0 ? (
          <div className="mk-glass mk-sheen" style={{ padding: 28, textAlign: "center" }}>
            <p className="mk-dim" style={{ margin: 0, lineHeight: 1.8 }}>
              لا توجد تخصصات ضمن هذا الفلتر. جرّب «كل التخصصات» أو غيّر المجال.
            </p>
          </div>
        ) : (
          visible.map((m, i) => <MajorCard key={m.major.id} m={m} index={i} />)
        )}
      </div>

      {/* المعادلات لكل جامعة */}
      <section className="mk-glass mk-sheen mk-mt-lg" style={{ overflow: "hidden" }}>
        <button
          type="button"
          className="mk-major-btn"
          onClick={() => setShowFormulas((v) => !v)}
          aria-expanded={showFormulas}
        >
          <span className="mk-major-icon">
            <IconBuilding size={22} />
          </span>
          <span>
            <span className="mk-major-name">نسبتك الموزونة في كل جامعة</span>
            <span className="mk-major-sub">
              لكل جامعة معادلتها الخاصة — لذلك تختلف نسبتك من جامعة لأخرى
            </span>
          </span>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              transform: showFormulas ? "rotate(180deg)" : "none",
              transition: "transform .25s",
              color: "var(--mk-faint)",
            }}
          >
            <IconChevronDown size={20} />
          </span>
        </button>

        {showFormulas && (
          <div className="mk-major-body">
            {perUni.map(({ university, rule, value }) => (
              <div key={university.id} className="mk-uni">
                <UniversityLogo uni={university} />
                <div style={{ minWidth: 0 }}>
                  <div className="mk-uni-name">{university.name}</div>
                  <div className="mk-uni-meta">{rule.label}</div>
                  <div className="mk-uni-meta">{formulaText(rule.weights)}</div>
                  <div className="mk-uni-meta">
                    {university.confidence === "official" ? (
                      <span style={{ color: "var(--mk-green)" }}>معادلة رسمية منشورة</span>
                    ) : (
                      <span>معادلة متداولة — راجعها في دليل القبول</span>
                    )}
                  </div>
                </div>
                <div className="mk-uni-score">
                  <b>{value === null ? "—" : fmt(value)}</b>
                  <span>الموزونة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* التنويه */}
      <div className="mk-note mk-mt">
        <IconInfo size={18} />
        <span>{COPY.disclaimerLong}</span>
      </div>
    </div>
  );
}
