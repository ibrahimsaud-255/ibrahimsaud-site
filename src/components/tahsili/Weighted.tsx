"use client";

// حاسبة النسبة الموزونة — أداة مجّانيّة تجذب الطلاب من البحث، وتوضّح لهم وزن التحصيلي في قبولهم.
// الأوزان الافتراضيّة ٣٠/٣٠/٤٠ (الشائعة في الكلّيّات العلميّة والصحّيّة)، ويقدر الطالب يغيّرها حسب جامعته.
import { useState } from "react";
import { ar } from "@/lib/tahsili";

const PRESETS = [
  { label: "٣٠ / ٣٠ / ٤٠", w: [30, 30, 40], note: "الأشيع في الكلّيّات العلميّة والصحّيّة" },
  { label: "٤٠ / ٣٠ / ٣٠", w: [40, 30, 30], note: "بعض الجامعات والتخصّصات" },
  { label: "٣٠ / ٣٠ / ٣٠", w: [30, 30, 30], note: "ومعها ١٠٪ لاختبار STEP في بعض الجامعات" },
];

const clamp = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);

export default function Weighted() {
  const [hs, setHs] = useState(95);
  const [qd, setQd] = useState(80);
  const [th, setTh] = useState(75);
  const [p, setP] = useState(0);
  const w = PRESETS[p].w;
  const total = (clamp(hs) * w[0] + clamp(qd) * w[1] + clamp(th) * w[2]) / 100;
  const perFive = (5 * w[2]) / 100; // كم ترفع خمس درجات في التحصيلي نسبتك

  const field = (label: string, v: number, set: (n: number) => void, weight: number) => (
    <label className="th-wfield">
      <span className="l">{label} <small>{ar(weight)}٪</small></span>
      <input type="number" inputMode="decimal" min={0} max={100} step={0.5} value={v} onChange={(e) => set(Number(e.target.value))} dir="ltr" />
    </label>
  );

  return (
    <div className="th-weighted">
      <div className="th-wpresets" role="radiogroup" aria-label="أوزان جامعتك">
        {PRESETS.map((x, i) => (
          <button key={x.label} role="radio" aria-checked={i === p} className={i === p ? "on" : ""} onClick={() => setP(i)}>
            <b>{x.label}</b><span>{x.note}</span>
          </button>
        ))}
      </div>
      <div className="th-wgrid">
        {field("الثانويّة", hs, setHs, w[0])}
        {field("القدرات", qd, setQd, w[1])}
        {field("التحصيلي", th, setTh, w[2])}
      </div>
      <div className="th-wresult" aria-live="polite">
        <p className="k">نسبتك الموزونة</p>
        <p className="v">{ar(Math.round(total * 100) / 100)}{w[0] + w[1] + w[2] < 100 ? <small> من {ar(w[0] + w[1] + w[2])}</small> : "٪"}</p>
        <p className="hint">كلّ ٥ درجات تزيدها في التحصيلي ترفع نسبتك <b>{ar(perFive)}</b> نقطة.</p>
      </div>
    </div>
  );
}
