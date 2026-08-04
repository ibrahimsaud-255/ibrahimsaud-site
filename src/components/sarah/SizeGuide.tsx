"use client";

// دليل المقاسات العالمية: جدول التحويل (INT/EU/UK/US/FR/IT) + جدول أطوال
// العبايات + حاسبة تقترح المقاس من القياسات.

import { useState } from "react";
import { alphaSizes, lengthSizes, suggestLength, suggestSize } from "@/lib/sarah";

export function AlphaTable() {
  return (
    <div className="overflow-x-auto rounded-3xl border border-ecru bg-white">
      <table className="w-full min-w-[720px] text-center text-sm">
        <thead className="bg-sand-deep text-espresso">
          <tr>
            <th className="px-3 py-3 font-black">المقاس العالمي</th>
            <th className="px-3 py-3 font-bold">الصدر (سم)</th>
            <th className="px-3 py-3 font-bold">الخصر (سم)</th>
            <th className="px-3 py-3 font-bold">الورك (سم)</th>
            <th className="px-3 py-3 font-bold">EU</th>
            <th className="px-3 py-3 font-bold">UK / AU</th>
            <th className="px-3 py-3 font-bold">US</th>
            <th className="px-3 py-3 font-bold">FR</th>
            <th className="px-3 py-3 font-bold">IT</th>
          </tr>
        </thead>
        <tbody>
          {alphaSizes.map((s, i) => (
            <tr key={s.intl} className={i % 2 ? "bg-sand/60" : "bg-white"}>
              <td className="px-3 py-3 font-black text-clay">{s.intl}</td>
              <td className="px-3 py-3 text-cocoa">{s.bust[0]}–{s.bust[1]}</td>
              <td className="px-3 py-3 text-cocoa">{s.waist[0]}–{s.waist[1]}</td>
              <td className="px-3 py-3 text-cocoa">{s.hips[0]}–{s.hips[1]}</td>
              <td className="px-3 py-3 text-espresso">{s.eu}</td>
              <td className="px-3 py-3 text-espresso">{s.uk}</td>
              <td className="px-3 py-3 text-espresso">{s.us}</td>
              <td className="px-3 py-3 text-espresso">{s.fr}</td>
              <td className="px-3 py-3 text-espresso">{s.it}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LengthTable() {
  return (
    <div className="overflow-x-auto rounded-3xl border border-ecru bg-white">
      <table className="w-full min-w-[520px] text-center text-sm">
        <thead className="bg-sand-deep text-espresso">
          <tr>
            <th className="px-3 py-3 font-black">المقاس (بوصة)</th>
            <th className="px-3 py-3 font-bold">الطول (سم)</th>
            <th className="px-3 py-3 font-bold">طولك المناسب (سم)</th>
            <th className="px-3 py-3 font-bold">بالأقدام</th>
          </tr>
        </thead>
        <tbody>
          {lengthSizes.map((l, i) => (
            <tr key={l.size} className={i % 2 ? "bg-sand/60" : "bg-white"}>
              <td className="px-3 py-3 font-black text-clay">{l.size}&quot;</td>
              <td className="px-3 py-3 text-cocoa">{l.cm}</td>
              <td className="px-3 py-3 text-cocoa">{l.height[0]}–{l.height[1]}</td>
              <td dir="ltr" className="px-3 py-3 text-espresso">{l.heightFt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeCalculator() {
  const [v, setV] = useState({ bust: "", waist: "", hips: "", height: "" });
  const b = Number(v.bust), w = Number(v.waist), h = Number(v.hips), t = Number(v.height);
  const size = b && w && h ? suggestSize(b, w, h) : null;
  const len = t ? suggestLength(t) : null;

  return (
    <div className="rounded-3xl border border-ecru bg-white p-6">
      <p className="text-base font-black text-espresso">احسبي مقاسك في ثانية</p>
      <p className="mt-1 text-xs text-cocoa">
        قيسي بشريط قياس على الجسم مباشرة وبملابس خفيفة، والشريط موازٍ للأرض.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {([
          ["bust", "محيط الصدر"],
          ["waist", "محيط الخصر"],
          ["hips", "محيط الورك"],
          ["height", "طولك"],
        ] as const).map(([k, label]) => (
          <label key={k} className="block">
            <span className="mb-1 block text-xs font-bold text-espresso">{label} (سم)</span>
            <input
              type="number"
              inputMode="numeric"
              value={v[k]}
              onChange={(e) => setV({ ...v, [k]: e.target.value })}
              className="sarah-field"
              placeholder="0"
            />
          </label>
        ))}
      </div>

      {size || len ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {size ? (
            <div className="rounded-2xl bg-clay/10 p-4">
              <p className="text-xs text-cocoa">مقاس القطع (فساتين، جلابيات، قمصان)</p>
              <p className="mt-1 text-3xl font-black text-clay">{size.intl}</p>
              <p className="mt-1 text-xs text-cocoa">
                EU {size.eu} · UK {size.uk} · US {size.us} · FR {size.fr} · IT {size.it}
              </p>
            </div>
          ) : null}
          {len ? (
            <div className="rounded-2xl bg-sage/10 p-4">
              <p className="text-xs text-cocoa">مقاس طول العباية / الجلابية</p>
              <p className="mt-1 text-3xl font-black text-sage">{len.size}&quot;</p>
              <p className="mt-1 text-xs text-cocoa">
                {len.cm} سم من الكتف حتى الطرف السفلي
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-sand-deep/70 p-4 text-xs text-cocoa">
          اكتبي القياسات فوق ويظهر لك المقاس المقترح فوراً — ولو كنتِ بين مقاسين، ننصح بالأكبر
          أو بالتفصيل على المقاس.
        </p>
      )}
    </div>
  );
}

export function HowToMeasure() {
  const steps = [
    { t: "الصدر", d: "حول أوسع نقطة في الصدر، والذراعان مرتخيتان على الجانبين." },
    { t: "الخصر", d: "حول أضيق نقطة في الخصر، عادة أعلى السرّة بقليل." },
    { t: "الورك", d: "حول أوسع نقطة في الأرداف، والشريط موازٍ للأرض." },
    { t: "الطول الكلي", d: "واقفة بدون كعب، من أعلى الرأس حتى الأرض." },
    { t: "طول القطعة", d: "من أعلى الكتف عند الرقبة حتى المكان الذي تنتهي عنده القطعة." },
    { t: "الكم", d: "من طرف الكتف حتى المعصم والذراع مثنية قليلاً." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.t} className="rounded-2xl border border-ecru bg-white p-4">
          <p className="text-sm font-black text-espresso">
            <span className="ml-2 text-clay">{i + 1}.</span>
            {s.t}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-cocoa">{s.d}</p>
        </div>
      ))}
    </div>
  );
}
