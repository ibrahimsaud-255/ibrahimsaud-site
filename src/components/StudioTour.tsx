"use client";

import { useEffect, useState } from "react";
import { studioTour, studioStage } from "@/lib/site";
import Reveal from "./Reveal";

export default function StudioTour() {
  const [cur, setCur] = useState<number>(-1);
  const active = cur >= 0;
  const item = active ? studioTour[cur] : null;

  // إغلاق بزر Escape والتنقل بالأسهم
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCur(-1);
      if (e.key === "ArrowLeft") setCur((c) => (c + 1) % studioTour.length);
      if (e.key === "ArrowRight")
        setCur((c) => (c - 1 + studioTour.length) % studioTour.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="studio" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            الاستوديو
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            جولة في استوديو سَعي
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            مساحة مصمّمة للحوار والإنتاج. اضغط على الدوائر النابضة لتتعرّف على كل
            عنصر، مواصفاته، وكيف نستخدمه في التصوير.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative mx-auto mt-8 select-none overflow-hidden rounded-3xl border border-line shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={studioStage} alt="استوديو سَعي" className="block w-full" />

            {/* غشاوة عند التفعيل */}
            <button
              aria-label="إغلاق"
              onClick={() => setCur(-1)}
              className={`absolute inset-0 z-10 cursor-default bg-black/55 transition-opacity duration-300 ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            {/* النقاط النابضة */}
            {studioTour.map((it, i) => (
              <button
                key={it.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setCur(i);
                }}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 transition ${
                  active && cur !== i ? "opacity-30" : "opacity-100"
                }`}
                aria-label={it.title}
              >
                <span className="relative grid size-7 place-items-center rounded-full bg-gold/20">
                  <span className="size-3 rounded-full bg-gold shadow-[0_0_10px_rgba(231,178,76,.8)]" />
                  <span className="absolute inset-0 animate-ping rounded-full border-2 border-gold" />
                </span>
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-black/85 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                  {it.title}
                </span>
              </button>
            ))}

            {/* بطاقة التفاصيل */}
            {item && (
              <div
                className={`absolute bottom-[3%] left-[3%] right-[3%] z-30 overflow-hidden rounded-2xl border border-line bg-ink-card shadow-2xl sm:bottom-auto sm:right-auto sm:top-1/2 sm:max-w-[460px] sm:-translate-y-1/2 ${
                  item.x < 50 ? "sm:right-[4%] sm:left-auto" : "sm:left-[4%]"
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
                        onClick={() =>
                          setCur(
                            (cur - 1 + studioTour.length) % studioTour.length,
                          )
                        }
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-cream transition hover:border-gold"
                      >
                        ‹ السابق
                      </button>
                      <button
                        onClick={() => setCur((cur + 1) % studioTour.length)}
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
          <p className="mt-4 text-center text-sm text-cream/50">
            ◉ عشرة عناصر مخبّأة في المشهد — استكشفها كلها
          </p>
        </Reveal>
      </div>
    </section>
  );
}
