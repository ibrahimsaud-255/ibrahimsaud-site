"use client";

// الواجهة الرئيسية — تقديم إبراهيم سعود كمحترف إبداعي (مخرج · منتج · مدير إبداعي)
// أسلوب: أسود + أبيض/خطوط بيضاء، بسيط وأنيق، مع بورتريه مقصوص يندمج في الخلفية.
// النصوص (العنوان/الوصف/الدور) تُدار من النظام الداخلي («محتوى الموقع» → مفتاح hero).

import { site } from "@/lib/site";
import { useContent, goldParts, waHref } from "@/lib/cms";

const heroFallback = {
  role: "مخرج · منتج · مدير إبداعي",
  title: "أصنع محتوى مرئياً *يبيع ويبقى* — من الفكرة حتى التسليم.",
  sub: "أنا إبراهيم سعود. أكتب الفكرة والسكربت، وأخرج وأصوّر وأمنتج — أفلام إعلانية وبودكاست وتغطيات لعلامات في السعودية والخليج، بأكثر من ٣٠ عملاً مرئياً.",
  cta1: {
    label: "ابدأ مشروعك",
    waMsg: "السلام عليكم إبراهيم، عندي مشروع أبي أنفّذه 🎬\nالفكرة: \nالهدف: ",
  },
  cta2: { label: "شاهد أعمالي", href: "#works" },
  note: "من الفكرة إلى التسليم · تصوير وإخراج احترافي · الرياض والخليج",
};

export default function Hero() {
  const c = useContent("hero", heroFallback);
  const info = useContent("site", { whatsapp: site.whatsapp as string });
  const role = (c as typeof heroFallback).role || heroFallback.role;

  return (
    <section
      id="top"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-ink px-5 pb-16 pt-28 sm:pt-32"
    >
      {/* شبكة خطوط بيضاء خفيفة في الخلفية */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "68px 68px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-cream/25 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.9fr] lg:gap-14">
        {/* النص (يمين على سطح المكتب) */}
        <div className="relative z-10 order-2 lg:order-1">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-cream/50" />
            <span className="text-xs font-bold tracking-[0.34em] text-cream/75">
              {role}
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[1.25] sm:text-5xl lg:text-6xl">
            {goldParts(c.title).map((p, i) =>
              p.gold ? (
                <span
                  key={i}
                  className="relative whitespace-nowrap text-white"
                >
                  {p.text}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-[3px] rounded bg-cream/70"
                  />
                </span>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">
            {c.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={waHref(info.whatsapp, c.cta1.waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-cream px-8 py-3.5 text-sm font-black text-ink transition hover:bg-white sm:text-base"
            >
              {c.cta1.label}
            </a>
            <a
              href={c.cta2.href}
              className="rounded-full border border-cream/30 px-8 py-3.5 text-sm font-bold text-cream transition hover:border-cream sm:text-base"
            >
              {c.cta2.label}
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/55">
            {c.note
              .split("·")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-cream/50" />
                  {t}
                </li>
              ))}
          </ul>
        </div>

        {/* البورتريه المقصوص — يندمج في الخلفية بلا مربّع */}
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-md">
            {/* هالة ضوء خلف الرأس */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[22%] h-80 w-80 -translate-x-1/2 rounded-full bg-cream/[0.09] blur-3xl"
            />
            {/* دائرة خط رفيع كعنصر تكوين */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[46%] h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/10"
            />
            <div className="relative aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ibrahim-cutout.png"
                alt="إبراهيم سعود — مخرج ومنتج ومدير إبداعي"
                className="size-full object-contain object-bottom drop-shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
              />
              {/* تلاشٍ سفلي يُذيب الكتف في الخلفية */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent"
              />
            </div>
            {/* الاسم أسفل الصورة — بلا صندوق */}
            <div className="relative z-10 -mt-2 text-center">
              <p className="text-lg font-black text-cream">إبراهيم سعود</p>
              <p className="mt-1 flex items-center justify-center gap-2 text-xs tracking-wide text-cream/60">
                <span className="h-px w-6 bg-cream/40" />
                مدير إبداعي · مخرج ومنتج
                <span className="h-px w-6 bg-cream/40" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
