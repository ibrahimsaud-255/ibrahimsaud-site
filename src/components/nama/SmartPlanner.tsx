"use client";

import { useEffect, useMemo, useState } from "react";

/* ============================================================
   المفكرة الذكية — نموذج تفاعلي (v1)
   خطّط · أنجز · راجع · نمِ  —  ٩٠٪ لمس واختيار
   البيانات تُحفظ محلياً في المتصفح (localStorage).
   ============================================================ */

// ---------- المجالات وأمثلتها الجاهزة ----------
type Domain = {
  key: string;
  label: string;
  emoji: string;
  color: string;
  examples: { title: string; unit?: string; target?: number }[];
};

const DOMAINS: Domain[] = [
  {
    key: "faith",
    label: "إيماني",
    emoji: "❤️",
    color: "var(--color-nforest)",
    examples: [
      { title: "ختم القرآن", unit: "جزء", target: 30 },
      { title: "المحافظة على الأذكار" },
      { title: "قيام الليل", unit: "ليلة", target: 30 },
      { title: "حفظ سور جديدة", unit: "سورة", target: 5 },
    ],
  },
  {
    key: "health",
    label: "صحي",
    emoji: "💪",
    color: "var(--color-nsuccess)",
    examples: [
      { title: "ممارسة الرياضة", unit: "مرة", target: 100 },
      { title: "خسارة الوزن", unit: "كجم", target: 8 },
      { title: "تحسين النوم" },
      { title: "شرب الماء يومياً" },
    ],
  },
  {
    key: "learning",
    label: "علمي",
    emoji: "📚",
    color: "var(--color-nblue)",
    examples: [
      { title: "قراءة كتب", unit: "كتاب", target: 20 },
      { title: "تعلّم لغة" },
      { title: "أخذ دورة", unit: "دورة", target: 4 },
      { title: "تطوير مهارة" },
    ],
  },
  {
    key: "finance",
    label: "مالي",
    emoji: "💰",
    color: "var(--color-ngold)",
    examples: [
      { title: "ادخار مبلغ", unit: "ريال", target: 24000 },
      { title: "سداد دين", unit: "ريال", target: 12000 },
      { title: "زيادة الدخل" },
      { title: "ضبط المصروف" },
    ],
  },
  {
    key: "skills",
    label: "مهاري",
    emoji: "🧠",
    color: "var(--color-namber)",
    examples: [
      { title: "تعلّم التصميم" },
      { title: "إتقان مهارة العرض" },
      { title: "مشروع تطبيقي", unit: "مشروع", target: 3 },
      { title: "ساعات ممارسة", unit: "ساعة", target: 100 },
    ],
  },
  {
    key: "social",
    label: "اجتماعي",
    emoji: "👨‍👩‍👧",
    color: "var(--color-nrose)",
    examples: [
      { title: "زيارة الأهل", unit: "مرة", target: 24 },
      { title: "لقاء الأصدقاء" },
      { title: "صلة الرحم" },
      { title: "خدمة المجتمع" },
    ],
  },
];

const HABIT_PRESETS = [
  "الصلاة في وقتها",
  "ورد القرآن",
  "القراءة",
  "الرياضة",
  "شرب الماء",
  "النوم المبكر",
  "الاستيقاظ المبكر",
  "المشي",
  "التعلّم",
  "الادخار",
];

const TASK_PRESETS = [
  "قراءة ٢٠ صفحة",
  "المشي ٣٠ دقيقة",
  "مراجعة المهام",
  "الاتصال بالعائلة",
  "شرب ٨ أكواب ماء",
  "مذاكرة ساعة",
];

const REFLECTIONS = [
  "ما الشيء الذي أنجزته اليوم وتشعر بالفخر تجاهه؟",
  "ما أجمل شيء حدث لك اليوم؟",
  "ما الشيء الذي تريد أن تتركه خلفك هذا الأسبوع؟",
  "ماذا تتمنى أن تحقق قبل نهاية الشهر؟",
  "لمن تريد أن تدعو اليوم؟",
];

const TRACKING = [
  { key: "yearly", label: "سنوي", div: 1 },
  { key: "monthly", label: "شهري", div: 12 },
  { key: "weekly", label: "أسبوعي", div: 52 },
  { key: "daily", label: "يومي", div: 365 },
  { key: "none", label: "بدون تقسيم", div: 1 },
];

const DAYS = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

// ---------- الأنواع ----------
type Task = { id: string; title: string; time?: string; area?: string; done: boolean };
type Goal = {
  id: string;
  title: string;
  domain: string;
  target: number;
  unit: string;
  current: number;
  tracking: string;
  per: number;
};
type Habit = { id: string; title: string; days: boolean[] };
type Store = {
  name: string;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  reflections: { q: string; a: string }[];
};

const KEY = "mufakkira_v1";
const uid = () => Math.random().toString(36).slice(2, 9);

const seed = (): Store => ({
  name: "عيسى",
  tasks: [
    { id: uid(), title: "قراءة ٢٠ صفحة", time: "٨:٠٠ ص", area: "learning", done: false },
    { id: uid(), title: "المشي ٣٠ دقيقة", time: "٦:٠٠ م", area: "health", done: false },
    { id: uid(), title: "إنهاء التقرير", area: "skills", done: true },
    { id: uid(), title: "الاتصال بالعائلة", area: "social", done: false },
  ],
  goals: [
    {
      id: uid(),
      title: "ادخار مبلغ",
      domain: "finance",
      target: 24000,
      unit: "ريال",
      current: 8000,
      tracking: "monthly",
      per: 2000,
    },
    {
      id: uid(),
      title: "قراءة كتب",
      domain: "learning",
      target: 20,
      unit: "كتاب",
      current: 6,
      tracking: "monthly",
      per: 2,
    },
  ],
  habits: [
    { id: uid(), title: "ورد القرآن", days: [true, true, true, false, true, false, false] },
    { id: uid(), title: "الرياضة", days: [true, false, true, false, false, false, false] },
  ],
  reflections: [],
});

const ar = (n: number) => n.toLocaleString("ar-EG");

export default function SmartPlanner() {
  const [store, setStore] = useState<Store | null>(null);
  const [tab, setTab] = useState("home");
  const [addOpen, setAddOpen] = useState(false);
  const [goalWizard, setGoalWizard] = useState(false);
  const [habitWizard, setHabitWizard] = useState(false);
  const [taskSheet, setTaskSheet] = useState(false);

  // تحميل / حفظ
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setStore(raw ? JSON.parse(raw) : seed());
    } catch {
      setStore(seed());
    }
  }, []);
  useEffect(() => {
    if (store) localStorage.setItem(KEY, JSON.stringify(store));
  }, [store]);

  const patch = (p: Partial<Store>) => setStore((s) => (s ? { ...s, ...p } : s));

  if (!store) return null;

  const domainOf = (k?: string) => DOMAINS.find((d) => d.key === k);
  const doneCount = store.tasks.filter((t) => t.done).length;
  const pct = store.tasks.length ? Math.round((doneCount / store.tasks.length) * 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 17) return "مساء الخير";
    return "مساء الخير";
  })();

  const motiv = (() => {
    if (store.tasks.length === 0) return "ابدأ يومك بإضافة أول مهمة 🌿";
    if (pct === 100) return "🎉 أنجزت كل مهام اليوم — يوم يستحق الفخر.";
    if (pct >= 90) return "🔥 بقي القليل جداً… أنهِ الباقي.";
    if (pct >= 50) return "👏 بدأت بشكل ممتاز، كمّل.";
    if (pct > 0) return "🌱 خطوة بخطوة، أنت في الطريق.";
    return "جاهز تبدأ يومك؟";
  })();

  // ---------- عناصر مشتركة ----------
  const Ring = ({ value, size = 76 }: { value: number; size?: number }) => {
    const r = 42;
    const c = 2 * Math.PI * r;
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="-rotate-90" style={{ width: size, height: size }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-nsand)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--color-nforest)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * value) / 100}
            style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-nforest">
          {ar(value)}%
        </span>
      </div>
    );
  };

  // ============================================================
  //  الشاشات
  // ============================================================
  const Home = () => (
    <div className="space-y-4">
      {/* ترحيب */}
      <div>
        <p className="text-sm text-nmuted">{greeting} يا {store.name} 🌿</p>
        <h2 className="font-serif-display text-2xl font-black text-nink">جاهز تكمل يومك؟</h2>
      </div>

      {/* إنجاز اليوم */}
      <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
        <Ring value={pct} />
        <div>
          <p className="text-xs text-nmuted">إنجاز اليوم</p>
          <p className="text-lg font-black text-nink">
            {ar(doneCount)} / {ar(store.tasks.length)} مهام
          </p>
          <p className="mt-1 text-xs text-nforest">{motiv}</p>
        </div>
      </div>

      {/* مهام اليوم */}
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-black text-nink">مهام اليوم</p>
          <button
            onClick={() => setTaskSheet(true)}
            className="text-xs font-bold text-nforest"
          >
            ＋ مهمة
          </button>
        </div>
        {store.tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-nmuted">لا مهام بعد — أضِف واحدة ✨</p>
        )}
        <div className="space-y-1">
          {store.tasks.map((t) => {
            const d = domainOf(t.area);
            return (
              <button
                key={t.id}
                onClick={() =>
                  patch({
                    tasks: store.tasks.map((x) =>
                      x.id === t.id ? { ...x, done: !x.done } : x,
                    ),
                  })
                }
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-right transition hover:bg-ncream"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs ${
                    t.done ? "border-nforest bg-nforest text-white" : "border-nline"
                  }`}
                >
                  {t.done ? "✓" : ""}
                </span>
                <span className="flex-1">
                  <span className={`text-sm ${t.done ? "text-nmuted line-through" : "text-nink"}`}>
                    {t.title}
                  </span>
                  {(t.time || d) && (
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-nmuted">
                      {t.time && <span>🕐 {t.time}</span>}
                      {d && (
                        <span style={{ color: d.color }}>
                          {d.emoji} {d.label}
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    patch({ tasks: store.tasks.filter((x) => x.id !== t.id) });
                  }}
                  className="px-1 text-nmuted/50 hover:text-nrose"
                >
                  ✕
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* وقفة اليوم */}
      <ReflectionCard />
    </div>
  );

  const ReflectionCard = () => {
    const [i] = useState(() => Math.floor(Math.random() * REFLECTIONS.length));
    const [ans, setAns] = useState("");
    const [saved, setSaved] = useState(false);
    if (saved)
      return (
        <div className="rounded-3xl bg-nforest/8 p-4 text-center text-sm text-nforest">
          🌿 حُفظت في ذاكرتك — شكراً لوقفتك.
        </div>
      );
    return (
      <div className="rounded-3xl border border-nforest/15 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold text-nleaf">💭 وقفة اليوم</p>
        <p className="mt-2 text-sm font-bold text-nink">{REFLECTIONS[i]}</p>
        <textarea
          value={ans}
          onChange={(e) => setAns(e.target.value)}
          rows={2}
          placeholder="اكتب إجابتك… (اختياري)"
          className="mt-3 w-full resize-none rounded-2xl border border-nline bg-ncream/50 p-3 text-sm outline-none focus:border-nforest"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              patch({ reflections: [...store.reflections, { q: REFLECTIONS[i], a: ans }] });
              setSaved(true);
            }}
            className="rounded-full bg-nforest px-4 py-2 text-xs font-bold text-ncream"
          >
            حفظ
          </button>
          <button onClick={() => setSaved(true)} className="rounded-full px-4 py-2 text-xs font-bold text-nmuted">
            تخطّي
          </button>
        </div>
      </div>
    );
  };

  const Vision = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif-display text-2xl font-black text-nink">أهدافي</h2>
        <button
          onClick={() => setGoalWizard(true)}
          className="rounded-full bg-nforest px-4 py-2 text-xs font-bold text-ncream"
        >
          ＋ هدف جديد
        </button>
      </div>
      {store.goals.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center text-sm text-nmuted shadow-sm">
          ابدأ بهدف واحد فقط — واختر من الأمثلة الجاهزة 🎯
        </div>
      )}
      {store.goals.map((g) => {
        const d = domainOf(g.domain);
        const p = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
        const remain = Math.max(0, g.target - g.current);
        const tr = TRACKING.find((t) => t.key === g.tracking);
        return (
          <div key={g.id} className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                  style={{ background: `${d?.color}1a` }}
                >
                  {d?.emoji}
                </span>
                <div>
                  <p className="font-black text-nink">{g.title}</p>
                  <p className="text-[11px] text-nmuted">
                    {d?.label} · متابعة {tr?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => patch({ goals: store.goals.filter((x) => x.id !== g.id) })}
                className="text-nmuted/40 hover:text-nrose"
              >
                ✕
              </button>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-bold text-nforest">
                  {ar(g.current)} / {ar(g.target)} {g.unit}
                </span>
                <span className="text-nmuted">{ar(p)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-nsand">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p}%`, background: d?.color, transition: "width .5s" }}
                />
              </div>
            </div>

            {g.tracking !== "none" && tr && tr.div > 1 && (
              <p className="mt-2 rounded-xl bg-ncream px-3 py-2 text-[11px] text-nmuted">
                ✨ التوزيع الذكي:{" "}
                <b className="text-nink">
                  {ar(Math.round(g.target / tr.div))} {g.unit}
                </b>{" "}
                {tr.label === "شهري" ? "كل شهر" : tr.label === "أسبوعي" ? "كل أسبوع" : "كل يوم"} ·
                المتبقّي {ar(remain)} {g.unit}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  patch({
                    goals: store.goals.map((x) =>
                      x.id === g.id
                        ? { ...x, current: Math.min(x.target, x.current + Math.max(1, Math.round(x.target / 20))) }
                        : x,
                    ),
                  })
                }
                className="flex-1 rounded-full border border-nforest/30 py-2 text-xs font-bold text-nforest"
              >
                ＋ سجّل تقدّم
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const Planner = () => {
    const [range, setRange] = useState("week");
    const ranges = [
      { k: "year", l: "السنة" },
      { k: "month", l: "الشهر" },
      { k: "week", l: "الأسبوع" },
      { k: "day", l: "اليوم" },
    ];
    return (
      <div className="space-y-4">
        <h2 className="font-serif-display text-2xl font-black text-nink">المخطّط</h2>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r.k}
              onClick={() => setRange(r.k)}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                range === r.k ? "bg-nforest text-ncream" : "text-nmuted"
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-bold text-nmuted">
            {range === "day" ? "مهام اليوم" : "أهدافك النشطة"}
          </p>
          {range === "day"
            ? store.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1.5 text-sm">
                  <span className={t.done ? "text-nforest" : "text-nline"}>●</span>
                  <span className={t.done ? "text-nmuted line-through" : "text-nink"}>{t.title}</span>
                </div>
              ))
            : store.goals.map((g) => {
                const d = domainOf(g.domain);
                const tr = TRACKING.find((t) => t.key === g.tracking);
                const per =
                  range === "month" && tr
                    ? Math.round(g.target / 12)
                    : range === "week"
                      ? Math.round(g.target / 52)
                      : g.target;
                return (
                  <div key={g.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span>{d?.emoji}</span>
                      <span className="text-nink">{g.title}</span>
                    </span>
                    <span className="text-xs font-bold" style={{ color: d?.color }}>
                      {ar(per)} {g.unit}
                    </span>
                  </div>
                );
              })}
        </div>

        {/* روزنامة مصغّرة */}
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold text-nmuted">📅 هذا الأسبوع</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.map((d, i) => {
              const today = i === new Date().getDay();
              return (
                <div key={d} className="text-[10px] text-nmuted">
                  <div>{d.slice(0, 3)}</div>
                  <div
                    className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                      today ? "bg-nforest font-black text-ncream" : "bg-ncream text-nink"
                    }`}
                  >
                    {ar(new Date().getDate() - new Date().getDay() + i)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const Review = () => {
    const qs = [
      "ماذا أنجزت هذا الأسبوع؟",
      "ما الذي لم تنجزه؟",
      "ما الذي أعاقك؟",
      "ما أهم شيء للأسبوع القادم؟",
    ];
    const [ans, setAns] = useState<string[]>(["", "", "", ""]);
    const [done, setDone] = useState(false);
    return (
      <div className="space-y-4">
        <h2 className="font-serif-display text-2xl font-black text-nink">أراجع</h2>
        <div className="flex gap-1 rounded-full bg-white p-1 text-center text-[11px] font-bold shadow-sm">
          {["يومية", "أسبوعية", "شهرية", "سنوية"].map((x, i) => (
            <span
              key={x}
              className={`flex-1 rounded-full py-2 ${i === 1 ? "bg-nforest text-ncream" : "text-nmuted"}`}
            >
              {x}
            </span>
          ))}
        </div>

        {done ? (
          <div className="rounded-3xl bg-nforest/8 p-8 text-center">
            <p className="text-3xl">🌿</p>
            <p className="mt-2 font-black text-nforest">تمّت مراجعة الأسبوع</p>
            <p className="mt-1 text-sm text-nmuted">وضوح صغير كل أسبوع = تطوّر كبير مع الوقت.</p>
            <button onClick={() => setDone(false)} className="mt-4 text-xs font-bold text-nforest">
              مراجعة جديدة
            </button>
          </div>
        ) : (
          <>
            {qs.map((q, i) => (
              <div key={q} className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-nink">{q}</p>
                <textarea
                  rows={2}
                  value={ans[i]}
                  onChange={(e) => setAns(ans.map((a, j) => (j === i ? e.target.value : a)))}
                  placeholder="اكتب أو اترك فراغاً…"
                  className="mt-2 w-full resize-none rounded-2xl border border-nline bg-ncream/50 p-3 text-sm outline-none focus:border-nforest"
                />
              </div>
            ))}
            <button
              onClick={() => setDone(true)}
              className="w-full rounded-full bg-nforest py-3 text-sm font-bold text-ncream"
            >
              إنهاء المراجعة
            </button>
          </>
        )}
      </div>
    );
  };

  const Grow = () => {
    const goalsDone = store.goals.filter((g) => g.current >= g.target).length;
    const habitTotal = store.habits.reduce((a, h) => a + h.days.filter(Boolean).length, 0);
    const suggestion = (() => {
      const weak = store.habits.find((h) => h.days.filter(Boolean).length < 3);
      if (weak) return `🌱 يبدو أن «${weak.title}» تراجعت هذا الأسبوع. جرّب ٣ أيام فقط للأسبوع القادم؟`;
      if (pct >= 85) return "⭐ ممتاز — حققت أهدافك هذا الأسبوع بنسبة عالية.";
      return "🌿 استمرارك أهم من كماله — خطوة اليوم تكفي.";
    })();
    const stats = [
      { n: store.goals.length, l: "أهداف نشطة", e: "🎯" },
      { n: goalsDone, l: "أهداف مكتملة", e: "✅" },
      { n: store.habits.length, l: "عادات", e: "🔄" },
      { n: habitTotal, l: "إنجازات العادات", e: "🔥" },
    ];
    return (
      <div className="space-y-4">
        <h2 className="font-serif-display text-2xl font-black text-nink">أنمو</h2>

        <div className="rounded-3xl border border-nforest/15 bg-white p-4 text-sm text-nink shadow-sm">
          {suggestion}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.l} className="rounded-3xl bg-white p-4 text-center shadow-sm">
              <p className="text-2xl">{s.e}</p>
              <p className="mt-1 text-2xl font-black text-nforest">{ar(s.n)}</p>
              <p className="text-[11px] text-nmuted">{s.l}</p>
            </div>
          ))}
        </div>

        {/* حصاد */}
        <div className="rounded-3xl bg-nforest p-5 text-ncream shadow-sm">
          <p className="font-serif-display text-lg font-black">🌾 حصاد سنتي</p>
          <p className="mt-1 text-xs text-ncream/70">لمحة عن رحلتك حتى الآن</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { n: store.goals.length, l: "أهداف" },
              { n: store.reflections.length, l: "وقفات" },
              { n: habitTotal, l: "عادات" },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/10 py-3">
                <p className="text-xl font-black">{ar(x.n)}</p>
                <p className="text-[11px] text-ncream/70">{x.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* العادات */}
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-black text-nink">عاداتي</p>
            <button onClick={() => setHabitWizard(true)} className="text-xs font-bold text-nforest">
              ＋ عادة
            </button>
          </div>
          {store.habits.map((h) => (
            <div key={h.id} className="border-t border-nline py-3 first:border-0">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-nink">{h.title}</span>
                <span className="text-[11px] text-nsuccess">
                  {ar(h.days.filter(Boolean).length)} / ٧ 🔥
                </span>
              </div>
              <div className="flex justify-between">
                {h.days.map((on, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      patch({
                        habits: store.habits.map((x) =>
                          x.id === h.id
                            ? { ...x, days: x.days.map((v, j) => (j === i ? !v : v)) }
                            : x,
                        ),
                      })
                    }
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition ${
                      on ? "bg-nforest text-ncream" : "bg-nsand text-nmuted"
                    }`}
                  >
                    {DAYS[i].slice(0, 1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TABS = [
    { k: "home", l: "الرئيسية", e: "🏠", node: <Home /> },
    { k: "vision", l: "أهدافي", e: "🎯", node: <Vision /> },
    { k: "planner", l: "المخطط", e: "📅", node: <Planner /> },
    { k: "review", l: "أراجع", e: "🔄", node: <Review /> },
    { k: "grow", l: "أنمو", e: "🌱", node: <Grow /> },
  ];

  return (
    <div className="relative mx-auto flex min-h-[640px] max-w-md flex-col overflow-hidden rounded-[2rem] border border-nline bg-ncream shadow-xl">
      {/* المحتوى */}
      <div className="flex-1 overflow-y-auto p-5 pb-24">{TABS.find((t) => t.k === tab)?.node}</div>

      {/* زر الإضافة السريع */}
      <button
        onClick={() => setAddOpen(true)}
        className="absolute bottom-20 left-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-nforest text-2xl text-ncream shadow-lg shadow-nforest/30 transition hover:scale-105"
        aria-label="إضافة"
      >
        ＋
      </button>

      {/* شريط التنقّل */}
      <nav className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-nline bg-white/95 px-1 py-2 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1 text-[10px] font-bold transition ${
              tab === t.k ? "text-nforest" : "text-nmuted"
            }`}
          >
            <span className={`text-lg ${tab === t.k ? "scale-110" : "opacity-70"} transition`}>{t.e}</span>
            {t.l}
          </button>
        ))}
      </nav>

      {/* ورقة الإضافة السريعة */}
      {addOpen && (
        <Sheet onClose={() => setAddOpen(false)} title="ماذا تريد أن تضيف؟">
          <div className="grid grid-cols-2 gap-3">
            {[
              { e: "➕", l: "مهمة", a: () => { setAddOpen(false); setTaskSheet(true); } },
              { e: "🎯", l: "هدف", a: () => { setAddOpen(false); setGoalWizard(true); } },
              { e: "🔄", l: "عادة", a: () => { setAddOpen(false); setHabitWizard(true); } },
              { e: "🔔", l: "تذكير", a: () => { setAddOpen(false); setTaskSheet(true); } },
              { e: "📅", l: "موعد", a: () => { setAddOpen(false); setTab("planner"); } },
              { e: "📝", l: "نوتة", a: () => { setAddOpen(false); setTaskSheet(true); } },
            ].map((o) => (
              <button
                key={o.l}
                onClick={o.a}
                className="flex flex-col items-center gap-1 rounded-2xl border border-nline bg-white py-5 transition hover:border-nforest hover:bg-ncream"
              >
                <span className="text-2xl">{o.e}</span>
                <span className="text-sm font-bold text-nink">{o.l}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {/* إضافة مهمة سريعة */}
      {taskSheet && (
        <Sheet onClose={() => setTaskSheet(false)} title="اختر مهمة أو اكتب واحدة">
          <div className="flex flex-wrap gap-2">
            {TASK_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  patch({ tasks: [...store.tasks, { id: uid(), title: t, done: false }] });
                  setTaskSheet(false);
                  setTab("home");
                }}
                className="rounded-full border border-nline bg-white px-4 py-2 text-sm text-nink transition hover:border-nforest"
              >
                {t}
              </button>
            ))}
          </div>
          <FreeAdd
            placeholder="أو اكتب مهمة جديدة…"
            onAdd={(v) => {
              patch({ tasks: [...store.tasks, { id: uid(), title: v, done: false }] });
              setTaskSheet(false);
              setTab("home");
            }}
          />
        </Sheet>
      )}

      {/* معالج الهدف */}
      {goalWizard && (
        <GoalWizard
          onClose={() => setGoalWizard(false)}
          onSave={(g) => {
            patch({ goals: [...store.goals, g] });
            setGoalWizard(false);
            setTab("vision");
          }}
        />
      )}

      {/* معالج العادة */}
      {habitWizard && (
        <Sheet onClose={() => setHabitWizard(false)} title="اختر عادة">
          <div className="flex flex-wrap gap-2">
            {HABIT_PRESETS.map((h) => (
              <button
                key={h}
                onClick={() => {
                  patch({
                    habits: [...store.habits, { id: uid(), title: h, days: [false, false, false, false, false, false, false] }],
                  });
                  setHabitWizard(false);
                  setTab("grow");
                }}
                className="rounded-full border border-nline bg-white px-4 py-2 text-sm text-nink transition hover:border-nforest"
              >
                {h}
              </button>
            ))}
          </div>
          <FreeAdd
            placeholder="أو اكتب عادة خاصة…"
            onAdd={(v) => {
              patch({ habits: [...store.habits, { id: uid(), title: v, days: [false, false, false, false, false, false, false] }] });
              setHabitWizard(false);
              setTab("grow");
            }}
          />
        </Sheet>
      )}
    </div>
  );
}

// ---------- ورقة سفلية ----------
function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-nink/30 backdrop-blur-[2px]" />
      <div
        className="relative w-full rounded-t-[2rem] bg-ncream p-5 pb-7 shadow-2xl"
        style={{ animation: "chat-pop .3s cubic-bezier(.22,1,.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-nline" />
        <p className="mb-4 text-center font-black text-nink">{title}</p>
        {children}
      </div>
    </div>
  );
}

function FreeAdd({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="mt-4 flex gap-2">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && v.trim() && onAdd(v.trim())}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-nline bg-white px-4 py-2.5 text-sm outline-none focus:border-nforest"
      />
      <button
        onClick={() => v.trim() && onAdd(v.trim())}
        className="rounded-full bg-nforest px-5 py-2.5 text-sm font-bold text-ncream"
      >
        إضافة
      </button>
    </div>
  );
}

// ---------- معالج الهدف (التوزيع الذكي) ----------
function GoalWizard({ onClose, onSave }: { onClose: () => void; onSave: (g: Goal) => void }) {
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(0);
  const [unit, setUnit] = useState("");
  const [tracking, setTracking] = useState("monthly");

  const titles: Record<number, string> = {
    0: "ماذا تريد أن تطوّر؟",
    1: "اختر هدفاً أو اكتبه",
    2: "كم الرقم المستهدف؟",
    3: "كيف تريد متابعة الهدف؟",
  };

  const tr = TRACKING.find((t) => t.key === tracking);
  const per = tr && tr.div > 1 ? Math.round(target / tr.div) : target;

  return (
    <Sheet onClose={onClose} title={titles[step]}>
      {/* 0 — المجال */}
      {step === 0 && (
        <div className="grid grid-cols-3 gap-3">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setDomain(d);
                setStep(1);
              }}
              className="flex flex-col items-center gap-1 rounded-2xl border border-nline bg-white py-4 transition hover:border-nforest"
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="text-xs font-bold text-nink">{d.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 1 — المثال */}
      {step === 1 && domain && (
        <>
          <div className="flex flex-wrap gap-2">
            {domain.examples.map((ex) => (
              <button
                key={ex.title}
                onClick={() => {
                  setTitle(ex.title);
                  setUnit(ex.unit || "");
                  setTarget(ex.target || 0);
                  setStep(2);
                }}
                className="rounded-full border border-nline bg-white px-4 py-2 text-sm text-nink transition hover:border-nforest"
              >
                {ex.title}
              </button>
            ))}
          </div>
          <FreeAdd
            placeholder="أو اكتب هدفاً خاصاً…"
            onAdd={(v) => {
              setTitle(v);
              setStep(2);
            }}
          />
        </>
      )}

      {/* 2 — الرقم */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={target || ""}
              onChange={(e) => setTarget(+e.target.value)}
              placeholder="مثلاً 24000"
              className="w-full rounded-2xl border border-nline bg-white px-4 py-3 text-center text-lg font-black text-nink outline-none focus:border-nforest"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="الوحدة"
              className="w-28 rounded-2xl border border-nline bg-white px-3 py-3 text-center text-sm outline-none focus:border-nforest"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["كتاب", "ريال", "مرة", "كجم", "ساعة", "جزء"].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  unit === u ? "bg-nforest text-ncream" : "bg-white text-nmuted border border-nline"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          <button
            onClick={() => target > 0 && setStep(3)}
            disabled={target <= 0}
            className="w-full rounded-full bg-nforest py-3 text-sm font-bold text-ncream disabled:opacity-40"
          >
            متابعة
          </button>
        </div>
      )}

      {/* 3 — المتابعة + التوزيع الذكي */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {TRACKING.map((t) => (
              <button
                key={t.key}
                onClick={() => setTracking(t.key)}
                className={`rounded-2xl border py-3 text-sm font-bold transition ${
                  tracking === t.key
                    ? "border-nforest bg-nforest text-ncream"
                    : "border-nline bg-white text-nink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tr && tr.div > 1 && (
            <div className="rounded-2xl bg-nforest/8 p-4 text-center">
              <p className="text-xs text-nmuted">✨ التوزيع الذكي</p>
              <p className="mt-1 text-lg font-black text-nforest">
                {ar(per)} {unit} {tr.label === "شهري" ? "شهرياً" : tr.label === "أسبوعي" ? "أسبوعياً" : "يومياً"}
              </p>
              <p className="mt-1 text-[11px] text-nmuted">
                {ar(target)} {unit} ÷ {ar(tr.div)} {tr.label === "شهري" ? "شهر" : tr.label === "أسبوعي" ? "أسبوع" : "يوم"}
              </p>
            </div>
          )}

          <button
            onClick={() =>
              onSave({
                id: uid(),
                title,
                domain: domain?.key || "skills",
                target,
                unit: unit || "",
                current: 0,
                tracking,
                per,
              })
            }
            className="w-full rounded-full bg-nforest py-3 text-sm font-bold text-ncream"
          >
            حفظ الهدف 🎯
          </button>
        </div>
      )}
    </Sheet>
  );
}
