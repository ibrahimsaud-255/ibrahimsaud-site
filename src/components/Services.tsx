"use client";

// قسم الخدمات — صورة الخدمة النشطة هي خلفية القسم كامل، مع حركة Ken Burns
// بطيئة وتلاشٍ ناعم بين الخدمات. الكلام المهم فقط فوق الصورة.
// البيانات من النظام الداخلي (site_services) مع نسخة احتياطية ثابتة.

import { useEffect, useState } from "react";
import { useServices } from "@/lib/siteData";

const ROTATE_MS = 7000;

export default function Services() {
  const tabs = useServices();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  // تنقّل تلقائي بين الخدمات — يتوقّف نهائياً بمجرّد أن يختار الزائر بنفسه
  useEffect(() => {
    if (!auto || tabs.length < 2) return;
    const t = setInterval(
      () => setActive((i) => (i + 1) % tabs.length),
      ROTATE_MS,
    );
    return () => clearInterval(t);
  }, [auto, tabs.length]);

  const cur = tabs[Math.min(active, tabs.length - 1)];
  if (!cur) return null;

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section
      id="services"
      className="relative flex min-h-[92vh] items-end overflow-hidden border-t border-line/60 bg-ink"
    >
      {/* الصور — تتبادل بتلاشٍ ناعم، والنشطة تزحف ببطء */}
      {tabs.map((t, i) =>
        t.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t.id}
            src={t.image}
            alt=""
            aria-hidden
            loading={i === 0 ? undefined : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-out ${
              i === active ? "ken-burns opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}

      {/* تظليل يجعل النص مقروءاً ويحافظ على فخامة الصورة */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink/70 via-transparent to-transparent" />

      {/* الكلام — فوق الصورة، بسيط */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-40 sm:pb-20 sm:pt-56">
        <p className="text-sm font-bold tracking-widest text-gold">خدماتي</p>
        <p className="mt-2 text-cream/60">
          كل ما يحتاجه محتواك — من مكان واحد.
        </p>

        {/* عنوان ووصف الخدمة النشطة */}
        <div key={cur.id} className="reveal in mt-6 max-w-2xl">
          <h2
            className="text-4xl font-black leading-tight [text-shadow:0_2px_30px_rgba(0,0,0,.9)] sm:text-6xl"
            style={{ color: cur.accent || "var(--color-gold)" }}
          >
            {cur.headline}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/85 [text-shadow:0_1px_18px_rgba(0,0,0,.9)]">
            {cur.description}
          </p>
        </div>

        {/* اختيار الخدمة — أسماء فقط، بلا صناديق */}
        <div
          className="mt-9 flex flex-wrap gap-x-6 gap-y-3"
          role="tablist"
          aria-label="الخدمات"
        >
          {tabs.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => pick(i)}
              className={`border-b-2 pb-1 text-sm font-extrabold transition sm:text-base ${
                i === active
                  ? "border-gold text-cream"
                  : "border-transparent text-cream/50 hover:text-cream/90"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* دعوة للباقات */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="/ad-packages/"
            className="rounded-full bg-gold px-7 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft"
          >
            باقات الإعلانات وأسعارها
          </a>
          <a
            href="/studio-rental/"
            className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold"
          >
            احجز الاستوديو
          </a>
        </div>
      </div>
    </section>
  );
}
