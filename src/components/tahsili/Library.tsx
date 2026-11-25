"use client";

// مكتبة المجسّمات: تبويب لكلّ مادّة، وتحته صفّ أفقيّ لكلّ سنة (أوّل/ثاني/ثالث ثانوي).
// كلّ بطاقة تفتح الدرس الحقيقيّ في مختبر حروف ودروس (المجّانيّ كامل، والباقي معاينة).
import { useState } from "react";
import { LESSONS, SUBJECTS, GRADES, LAB, count, ar, type Subject } from "@/lib/tahsili";

export default function Library() {
  const [s, setS] = useState<Subject>("physics");
  const subject = SUBJECTS.find((x) => x.id === s)!;
  const grades = [10, 11, 12].map((g) => ({ g, items: LESSONS.filter((l) => l.subject === s && l.grade === g) })).filter((x) => x.items.length);

  return (
    <div className="th-lib">
      <div className="th-tabs" role="tablist" aria-label="المادّة">
        {SUBJECTS.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === s} className={x.id === s ? "on" : ""} onClick={() => setS(x.id)} style={{ ["--c" as string]: x.color }}>
            {x.name} <span className="c">{ar(count(x.id))}</span>
          </button>
        ))}
      </div>
      {grades.map(({ g, items }) => (
        <div key={g} className="th-rail-wrap">
          <h3 className="th-rail-h">{GRADES[g]} <span>{ar(items.length)} درساً</span></h3>
          <div className="th-rail" style={{ ["--c" as string]: subject.color }}>
            {items.map((l) => (
              <a key={l.slug} className="th-card" href={`${LAB}${l.href}`} target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/tahsili/3d/${l.slug}.webp`} alt="" loading="lazy" width={480} height={300} />
                <span className="u">{l.unit}</span>
                <span className="t">{l.title}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
