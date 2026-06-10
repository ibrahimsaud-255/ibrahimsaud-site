import { waLink } from "@/lib/site";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      className="bg-glow relative min-h-screen overflow-hidden px-5 pt-28"
    >
      {/* خطوط زخرفية */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-cream)_1px,transparent_1px),linear-gradient(90deg,var(--color-cream)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        {/* النص */}
        <div className="relative z-10 order-2 lg:order-1">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-card/60 px-4 py-1.5 text-sm text-cream/80">
              <span className="size-2 rounded-full bg-gold" />
              خبير إنتاج فيديوهات إعلانية
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl">
              أصنع <span className="gold-text">إعلانات</span> تبيع.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
              من الفكرة والنص، للتصوير، للتعليق الصوتي، للمونتاج النهائي — أحوّل
              منتجك إلى فيديو إعلاني يوقف له الناس ويبيع. خدمة إنتاج إعلانات
              متكاملة لعلامتك التجارية.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={waLink("السلام عليكم، أبي أطلب فيديو إعلاني 🎬")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-ink transition hover:bg-gold-soft"
              >
                اطلب إعلانك الآن
              </a>
              <a
                href="#works"
                className="rounded-full border border-line px-8 py-3.5 text-base font-bold text-cream transition hover:border-gold hover:text-gold"
              >
                شاهد الأعمال
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line/60 pt-6 text-sm">
              <Stat n="+100" label="فيديو إعلاني" />
              <Stat n="+9000" label="متابع" />
              <Stat n="السعودية + الخليج" label="نطاق التعامل" />
            </div>
          </Reveal>
        </div>

        {/* الصورة */}
        <Reveal delay={120} className="order-1 lg:order-2">
          <div className="relative flex items-end justify-center">
            <div className="pointer-events-none absolute bottom-0 left-1/2 size-[85%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(231,178,76,0.22),transparent_65%)] blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/my_photo.jpg"
              alt="إبراهيم سعود"
              className="relative max-h-[560px] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold gold-text">{n}</div>
      <div className="text-cream/60">{label}</div>
    </div>
  );
}
