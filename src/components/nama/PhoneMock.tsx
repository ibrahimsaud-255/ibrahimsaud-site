import { Icon } from "./NamaIcons";
import { areas } from "@/lib/nama";

// نموذج مرئي لشاشة نما الرئيسية داخل إطار جوال — ثابت (يمثّل التطبيق الحقيقي).
export default function PhoneMock() {
  const habits = [
    { d: "س", on: true },
    { d: "ح", on: true },
    { d: "ن", on: true },
    { d: "ث", on: false },
    { d: "ر", on: true },
    { d: "خ", on: false },
    { d: "ج", on: false },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* توهّج خلفي */}
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-nleaf/20 blur-2xl" />
      {/* إطار الجوال */}
      <div className="rounded-[2.6rem] border-[10px] border-nink/90 bg-nink/90 shadow-[0_30px_60px_-15px_rgba(36,51,43,0.5)]">
        <div className="nama-dotgrid overflow-hidden rounded-[2rem] bg-ncream">
          {/* النوتش */}
          <div className="flex justify-center pt-2">
            <div className="h-1.5 w-16 rounded-full bg-nink/20" />
          </div>

          <div className="space-y-3 p-4">
            {/* ترحيب */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-nmuted">مساء الخير 🌿</p>
                <p className="font-serif-display text-base font-black text-nink">
                  إبراهيم
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nforest text-ncream text-xs font-black">
                إ
              </div>
            </div>

            {/* تقدّم السنة */}
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--color-nsand)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--color-nforest)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset="87"
                    className="nama-ring-anim"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-nforest">
                  67%
                </span>
              </div>
              <div className="text-[11px] leading-relaxed text-nmuted">
                <p className="font-bold text-nink">تقدّم سنة ٢٠٢٦</p>
                <p>مضى ٢٤٤ يومًا — أنت في المسار الصحيح 👏</p>
              </div>
            </div>

            {/* عادات اليوم */}
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-nink">عادات اليوم</p>
                <p className="text-[10px] text-nsuccess">٤ / ٧ 🔥</p>
              </div>
              <div className="flex justify-between">
                {habits.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                        h.on
                          ? "bg-nforest text-ncream"
                          : "bg-nsand text-nmuted"
                      }`}
                    >
                      {h.on ? "✓" : ""}
                    </div>
                    <span className="text-[9px] text-nmuted">{h.d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* مهام اليوم */}
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="mb-2 text-[11px] font-bold text-nink">مهام اليوم</p>
              {[
                { t: "قراءة ٢٠ صفحة", done: true },
                { t: "تمرين ٣٠ دقيقة", done: true },
                { t: "مراجعة ميزانية الشهر", done: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-[6px] border text-[9px] ${
                      m.done
                        ? "border-nforest bg-nforest text-white"
                        : "border-nline"
                    }`}
                  >
                    {m.done ? "✓" : ""}
                  </span>
                  <span
                    className={`text-[11px] ${
                      m.done ? "text-nmuted line-through" : "text-nink"
                    }`}
                  >
                    {m.t}
                  </span>
                </div>
              ))}
            </div>

            {/* توازن المجالات */}
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="mb-2 text-[11px] font-bold text-nink">
                توازن المجالات
              </p>
              <div className="flex items-end justify-between gap-1">
                {areas.map((a, i) => {
                  const h = [70, 52, 40, 84, 60, 33][i];
                  return (
                    <div key={a.key} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md"
                        style={{ height: h * 0.5, background: a.color }}
                      />
                      <Icon name={a.icon} size={11} style={{ color: a.color }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* شريط التنقّل */}
          <div className="flex items-center justify-around border-t border-nline bg-white/80 px-2 py-2.5">
            {[
              { i: "home", on: true },
              { i: "calendar", on: false },
              { i: "sprout", on: false },
              { i: "review", on: false },
              { i: "chart", on: false },
            ].map((n, idx) => (
              <Icon
                key={idx}
                name={n.i}
                size={19}
                className={n.on ? "text-nforest" : "text-nmuted"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
