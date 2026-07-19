"use client";

// جولة الاستوديو — صورة المشهد هي خلفية القسم كامل،
// والنقاط النابضة موزّعة عليها، والعنوان مركّب فوقها.

import { useEffect, useState } from "react";
import { studioTour, studioStage } from "@/lib/site";
import Reveal from "./Reveal";

export default function StudioTour() {
  const [cur, setCur] = useState<number>(-1);
  const active = cur >= 0;
  const item = active ? studioTour[cur] : null;

  const next = () => setCur((c) => (c + 1) % studioTour.length);
  const prev = () =>
    setCur((c) => (c - 1 + studioTour.length) % studioTour.length);

  // إغلاق بزر Escape والتنقل بالأسهم (للكيبورد على الديسكتوب)
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCur(-1);
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section
      id="studio"
      className="relative overflow-hidden border-t border-line/60 bg-ink pt-16 sm:pt-0"
    >
      {/* العنوان — فوق الصورة على الجوال، ومركّب عليها على الديسكتوب */}
      <div className="px-5 sm:pointer-events-none sm:absolute sm:inset-x-0 sm:top-0 sm:z-30 sm:px-12 sm:pt-12">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            الاستوديو
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl sm:[text-shadow:0_2px_28px_rgba(0,0,0,.85)]">
            جولة في استوديو سَعي
          </h2>
          <p className="mt-4 max-w-md text-cream/75 sm:[text-shadow:0_2px_18px_rgba(0,0,0,.9)]">
            اضغط على الدوائر النابضة لتتعرّف على كل عنصر ومواصفاته.
          </p>
        </Reveal>
      </div>

      {/* المشهد — تمرير أفقي على الجوال فقط، وكامل العرض على الديسكتوب */}
      <div className="mt-8 overflow-x-auto [scrollbar-width:none] sm:mt-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div className="relative w-[680px] max-w-none select-none sm:w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={studioStage} alt="استوديو سَعي" className="block w-full" />

          {/* تدرّجات تدمج الصورة مع الصفحة وتوضّح النص فوقها */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-2/3 bg-gradient-to-b from-ink via-ink/40 to-transparent sm:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-ink to-transparent" />

          {/* غشاوة عند التفعيل (ديسكتوب) */}
          <button
            aria-label="إغلاق"
            onClick={() => setCur(-1)}
            className={`absolute inset-0 z-10 hidden cursor-default bg-black/55 transition-opacity duration-300 sm:block ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          {/* النقاط النابضة (مساحة ضغط واسعة للجوال) */}
          {studioTour.map((it, i) => (
            <button
              key={it.title}
              onClick={(e) => {
                e.stopPropagation();
                setCur(i);
              }}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 p-2.5 transition ${
                active && cur !== i ? "sm:opacity-30" : "opacity-100"
              }`}
              aria-label={it.title}
            >
              <span className="relative grid size-7 place-items-center rounded-full bg-gold/20">
                <span className="size-3 rounded-full bg-gold shadow-[0_0_10px_rgba(231,178,76,.8)]" />
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-gold" />
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-black/85 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 sm:block">
                {it.title}
              </span>
            </button>
          ))}

          {/* بطاقة التفاصيل — الديسكتوب فقط (بجانب النقطة) */}
          {item && (
            <div
              className={`absolute top-1/2 z-30 hidden max-w-[460px] -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-ink-card shadow-2xl sm:block ${
                item.x < 50 ? "right-[4%]" : "left-[4%]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.file}
                alt={item.title}
                className="block aspect-[16/10] w-full object-cover"
              />
              <button
                onClick={() => setCur(-1)}
                className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-black/55 text-white"
                aria-label="إغلاق"
              >
                ✕
              </button>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-gold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/85">
                  {item.text}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-cream/50" dir="ltr">
                    {cur + 1} / {studioTour.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={prev}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-cream transition hover:border-gold"
                    >
                      ‹ السابق
                    </button>
                    <button
                      onClick={next}
                      className="rounded-lg bg-gold px-3 py-1.5 text-sm font-bold text-ink transition hover:bg-gold-soft"
                    >
                      التالي ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* سطر التلميح — أسفل القسم فوق الصورة */}
      <p className="absolute inset-x-0 bottom-5 z-20 px-5 text-center text-sm text-cream/60 sm:bottom-8">
        <span className="sm:hidden">
          اسحب المشهد أفقياً، واضغط أي نقطة لعرض تفاصيلها
        </span>
        <span className="hidden sm:inline">
          ◉ عشرة عناصر مخبّأة في المشهد — استكشفها كلها
        </span>
      </p>

      {/* نافذة العرض الكاملة على الجوال */}
      {item && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-sm sm:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setCur(-1)}
              className="grid size-10 place-items-center rounded-full bg-white/10 text-xl text-white"
              aria-label="إغلاق"
            >
              ✕
            </button>
            <span className="text-sm text-white/70" dir="ltr">
              {cur + 1} / {studioTour.length}
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.file}
              alt={item.title}
              className="max-h-full w-full rounded-2xl object-contain"
            />
          </div>

          <div className="p-5">
            <h3 className="text-xl font-extrabold text-gold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/85">
              {item.text}
            </p>
            <div className="mt-5 flex gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <button
                onClick={prev}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-bold text-cream transition active:border-gold"
              >
                ‹ السابق
              </button>
              <button
                onClick={next}
                className="flex-1 rounded-xl bg-gold py-3 text-sm font-bold text-ink"
              >
                التالي ›
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
