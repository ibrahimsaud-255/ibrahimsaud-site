"use client";

// «جرّب ٦ أسئلة» — كلّ سؤال تجيب عليه يكشف الحلّ وحيلة الحلّ السريع، ويعرض المجسّم اللي يشرح الفكرة.
// في المنتج: الغلطة تفتح المجسّم ثم سؤالاً يشبهه، وتدخل دفتر الأخطاء.
import { useState } from "react";
import { DEMO, LAB, SUBJECTS, GRADES, lessonTitle, ar } from "@/lib/tahsili";

const LETTERS = ["أ", "ب", "ج", "د"];

// المعادلات بين ⟨ ⟩ تُعرض يساراً‑إلى‑يمين داخل الجملة العربيّة، فلا ينقلب ترتيبها.
function rich(s: string) {
  return s.split(/⟨|⟩/).map((part, k) => (k % 2 ? <bdi key={k} dir="ltr" className="th-eq">{part}</bdi> : part));
}

export default function Demo() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => DEMO.map(() => null));
  const done = i >= DEMO.length;

  if (done) {
    const right = picked.filter((p, k) => p === DEMO[k].correct).length;
    const bySubject = SUBJECTS.map((s) => {
      const qs = DEMO.map((q, k) => ({ q, k })).filter(({ q }) => q.subject === s.id);
      return { ...s, total: qs.length, right: qs.filter(({ q, k }) => picked[k] === q.correct).length };
    }).filter((s) => s.total);
    return (
      <div className="th-demo th-demo-end">
        <p className="th-demo-score">{ar(right)} من {ar(DEMO.length)}</p>
        <p className="th-demo-endnote">هذي ستّ أسئلة بس. الاختبار التشخيصيّ يطلع لك نفس الخريطة لكلّ وحدة في المنهج.</p>
        <div className="th-map">
          {bySubject.map((s) => (
            <div key={s.id} className="th-map-row">
              <span className="n">{s.name}</span>
              <span className="bar"><i style={{ width: `${(s.right / s.total) * 100}%`, background: s.color }} /></span>
              <span className="v">{ar(s.right)} من {ar(s.total)}</span>
            </div>
          ))}
        </div>
        <div className="th-demo-actions">
          <a className="v2-btn v2-btn-primary" href="#buy">سجّل اهتمامك</a>
          <button className="v2-link th-plain" onClick={() => { setPicked(DEMO.map(() => null)); setI(0); }}>أعد التجربة <span className="chev">‹</span></button>
        </div>
      </div>
    );
  }

  const q = DEMO[i];
  const p = picked[i];
  const answered = p !== null;
  const subject = SUBJECTS.find((s) => s.id === q.subject)!;
  const ok = p === q.correct;

  return (
    <div className="th-demo" style={{ ["--subj" as string]: subject.color }}>
      <div className="th-demo-top">
        <span className="th-demo-subj">{subject.name} · {GRADES[q.grade]}</span>
        <span className="th-demo-count">{ar(i + 1)} / {ar(DEMO.length)}</span>
      </div>
      <div className="th-demo-progress"><i style={{ width: `${((i + (answered ? 1 : 0)) / DEMO.length) * 100}%` }} /></div>
      <p className="th-demo-q">{rich(q.q)}</p>
      <div className="th-demo-opts" role="group" aria-label="الخيارات">
        {q.options.map((o, k) => {
          const state = !answered ? "" : k === q.correct ? "right" : k === p ? "wrong" : "dim";
          return (
            <button
              key={o}
              className={`th-opt ${state}`}
              disabled={answered}
              onClick={() => setPicked((a) => a.map((x, n) => (n === i ? k : x)))}
            >
              <span className="l">{LETTERS[k]}</span>
              <span className="t" dir="auto">{o}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="th-demo-answer" aria-live="polite">
          <p className={`th-verdict ${ok ? "ok" : "no"}`}>{ok ? "صح." : "قريب. شوف ليش:"}</p>
          <p className="th-why">{rich(q.why)}</p>
          <p className="th-tip"><b>الحلّ السريع</b> {rich(q.tip)}</p>
          <a className="th-lesson" href={`${LAB}${q.lesson.href}`} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/tahsili/3d/${q.lesson.slug}.webp`} alt="" loading="lazy" width={480} height={300} />
            <span className="txt">
              <span className="k">{ok ? "ثبّتها بالمجسّم" : "شوفها تتحرّك"}{q.lesson.free ? " · مجّانيّ" : ""}</span>
              <span className="n">{lessonTitle(q.lesson.slug)}</span>
            </span>
            <span className="go" aria-hidden>‹</span>
          </a>
          <button className="v2-btn v2-btn-primary th-next" onClick={() => setI(i + 1)}>
            {i + 1 < DEMO.length ? "السؤال التالي" : "شوف نتيجتك"}
          </button>
        </div>
      )}
    </div>
  );
}
