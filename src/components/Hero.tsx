import { waLink } from "@/lib/site";
import Reveal from "./Reveal";

// تصنيفات الأعمال — تظهر كخيارات تحت العنوان
const categories = [
  { label: "إعلانات المنتجات", href: "#works" },
  { label: "الأعمال السينمائية", href: "#works" },
  { label: "مقابلات الشارع", href: "#works" },
  { label: "تغطية فعاليات", href: "#works" },
  { label: "بودكاست سَعي", href: "#podcast" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="bg-glow relative flex min-h-screen items-center overflow-hidden px-5 pt-28"
    >
      {/* خطوط زخرفية */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-cream)_1px,transparent_1px),linear-gradient(90deg,var(--color-cream)_1px,transparent_1px)] [background-size:64px_64px]" />
      {/* توهج خلفي */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(231,178,76,0.14),transparent_65%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center pb-20 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-card/60 px-4 py-1.5 text-sm text-cream/80">
            <span className="size-2 rounded-full bg-gold" />
            إنتاج إعلامي وإعلاني متكامل
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl">
            أصنع <span className="gold-text">إعلانات</span> تبيع.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">
            من الفكرة والسيناريو، إلى التصوير والتعليق الصوتي والمونتاج — أُنتج
            فيديوهات إعلانية وأعمالاً سينمائية وبودكاست بمستوى احترافي يخدم علامتك
            التجارية ويحقّق هدفها.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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
              🎬 شاهد أعمالي
            </a>
          </div>
        </Reveal>

        {/* خيارات التصنيفات */}
        <Reveal delay={320}>
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
