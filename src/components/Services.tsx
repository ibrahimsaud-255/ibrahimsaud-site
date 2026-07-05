"use client";

// قسم الخدمات — تصميم تبويبات أنيق (مستوحى من مواقع الاستوديوهات الاحترافية):
// شريط تبويبات أعلى، وداخل كل تبويب: عنوان كبير ووصف يمين، وصورة مربعة يسار.
// البيانات من النظام الداخلي (site_services) مع نسخة احتياطية ثابتة.

import { useState } from "react";
import { useServices } from "@/lib/siteData";
import Reveal from "./Reveal";

export default function Services() {
  const tabs = useServices();
  const [active, setActive] = useState(0);
  const cur = tabs[Math.min(active, tabs.length - 1)];
  if (!cur) return null;

  return (
    <section id="services" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">خدماتي</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            كل ما يحتاجه محتواك — من مكان واحد.
          </h2>
        </Reveal>

        {/* شريط التبويبات */}
        <Reveal delay={80}>
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-1.5 rounded-full glass-card p-1.5 sm:justify-between sm:gap-0"
            role="tablist"
            aria-label="الخدمات"
          >
            {tabs.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition sm:px-6 sm:py-3 sm:text-base ${
                  i === active
                    ? "bg-cream text-ink shadow-lg ring-2 ring-gold/70"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </Reveal>

        {/* محتوى التبويب النشط */}
        <div className="mt-10 grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* الصورة المربعة */}
          <div className="order-2 md:order-1">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-line bg-ink-card">
              {cur.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={cur.id}
                  src={cur.image}
                  alt={cur.title}
                  className="size-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              {/* بديل بصري إن لم توجد صورة */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(231,178,76,.15),transparent_65%)]">
                {!cur.image && (
                  <span
                    className="text-6xl font-black opacity-25"
                    style={{ color: cur.accent || "#e7b24c" }}
                  >
                    {cur.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* النص */}
          <div className="order-1 text-center md:order-2 md:text-start">
            <Reveal key={cur.id}>
              <h3
                className="text-4xl font-black leading-tight sm:text-5xl"
                style={{ color: cur.accent || "var(--color-gold)" }}
              >
                {cur.headline}
              </h3>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-cream/80 md:mx-0">
                {cur.description}
              </p>
            </Reveal>
          </div>
        </div>

        {/* دعوة للباقات */}
        <Reveal>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-center">
            <a
              href="/ad-packages/"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft"
            >
              باقات الإعلانات وأسعارها
            </a>
            <a
              href="/studio-rental/"
              className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
            >
              احجز الاستوديو
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
