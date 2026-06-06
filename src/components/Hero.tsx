import { site, waLink } from "@/lib/site";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      className="bg-glow relative flex min-h-screen items-center overflow-hidden px-5 pt-24"
    >
      {/* خطوط زخرفية */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-cream)_1px,transparent_1px),linear-gradient(90deg,var(--color-cream)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-card/60 px-4 py-1.5 text-sm text-cream/80">
            <span className="size-2 rounded-full bg-gold" />
            متاح لمشاريع جديدة
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl">
            أصنع <span className="gold-text">إعلانات</span> تبيع.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">
            من الفكرة والنص، للتصوير، للتعليق الصوتي، للمونتاج النهائي — أحوّل
            منتجك إلى فيديو إعلاني يوقف له الناس. شغل مع جامعة الملك سعود وعلامات
            تجارية في السعودية والخليج.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={waLink("السلام عليكم، أبي أطلب فيديو إعلاني 🎬")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-ink transition hover:bg-gold-soft"
            >
              اطلب خدمتك الآن
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
          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-line/60 pt-8 text-sm">
            <Stat n="+30" label="فيديو إعلاني" />
            <Stat n="+9K" label="متابع" />
            <Stat n="جامعة الملك سعود" label="هاكاثون هيلثون" />
          </div>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-cream/40">
        {site.bio}
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
