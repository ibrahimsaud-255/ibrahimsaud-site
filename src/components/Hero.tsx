"use client";

// الواجهة الرئيسية — صورة وجه دائرية في المنتصف فوق خلفية الهوية،
// الصورة والخلفية تُدار من النظام الداخلي (site_settings → hero_photo / hero_bg)
// مع نسخ احتياطية داخل public/identity.

import { waLink } from "@/lib/site";
import { useSettings } from "@/lib/siteData";
import Reveal from "./Reveal";

// محاور العمل — تظهر كخيارات تحت العنوان
const categories = [
  { label: "🎙️ بودكاست سَعي", href: "#podcast" },
  { label: "🎥 الاستوديو", href: "#studio" },
  { label: "⚙️ الخدمات", href: "#services" },
  { label: "🎬 الأعمال", href: "#works" },
];

export default function Hero() {
  const settings = useSettings();
  const photo =
    ((settings.hero_photo as { url?: string } | undefined)?.url as string) ||
    "/identity/profile.jpg";
  const bg =
    ((settings.hero_bg as { url?: string } | undefined)?.url as string) ||
    "/identity/hero-bg.jpg";

  return (
    <section
      id="top"
      className="bg-glow relative flex min-h-screen items-center overflow-hidden px-5 pt-28"
    >
      {/* صورة خلفية الهوية (Artboard) — تظهر خلف كل شيء بشفافية أنيقة */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {/* تظليل فوق الخلفية لوضوح النص */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,12,.35),rgba(10,10,12,.88)_75%)]" />

      {/* خطوط زخرفية */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-cream)_1px,transparent_1px),linear-gradient(90deg,var(--color-cream)_1px,transparent_1px)] [background-size:64px_64px]" />
      {/* توهج خلفي */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(231,178,76,0.14),transparent_65%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center pb-20 text-center">
        {/* الصورة الدائرية */}
        <Reveal>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-3 rounded-full bg-[conic-gradient(from_180deg,rgba(231,178,76,.55),transparent_35%,rgba(231,178,76,.25)_60%,transparent_85%,rgba(231,178,76,.55))] blur-md" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="إبراهيم سعود"
              className="relative size-36 rounded-full border-4 border-gold/80 object-cover shadow-[0_18px_60px_rgba(231,178,76,.25)] sm:size-44"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-ink-card/60 px-4 py-1.5 text-sm text-cream/80">
            <span className="size-2 rounded-full bg-gold" />
            تقنية أعمال · بودكاست · إنتاج محتوى
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl">
            تقنية <span className="gold-text">أعمال</span>، وبودكاست.
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">
            أنا إبراهيم سعود — أوظّف التقنية في تطوير أعمالك وأنظمتك، وأنتج
            البودكاست والمحتوى المرئي الذي يبني حضورك، من فكرة وتصوير ومونتاج إلى
            منتج نهائي في استوديو مجهّز بالكامل.
          </p>
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href={waLink("السلام عليكم إبراهيم، شفت موقعك وأبي أتواصل معك 👋")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-ink transition hover:bg-gold-soft"
            >
              ابدأ مشروعك معي
            </a>
            <a
              href="#works"
              className="rounded-full border border-line px-8 py-3.5 text-base font-bold text-cream transition hover:border-gold hover:text-gold"
            >
              🎬 شاهد أعمالي
            </a>
            <a
              href="#studio"
              className="rounded-full border border-line px-8 py-3.5 text-base font-bold text-cream transition hover:border-gold hover:text-gold"
            >
              🎥 جولة في الاستوديو
            </a>
          </div>
        </Reveal>

        {/* خيارات التصنيفات */}
        <Reveal delay={360}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="rounded-full border border-line bg-ink-card/50 px-5 py-2.5 text-sm font-bold text-cream/80 transition hover:border-gold/60 hover:bg-ink-card hover:text-gold"
              >
                {c.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
