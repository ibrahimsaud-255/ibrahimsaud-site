import { site, programs } from "@/lib/site";
import Reveal from "./Reveal";

export default function Podcast() {
  return (
    <section id="podcast" className="bg-glow border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <Reveal>
          {/* شعار بودكاست سَعي بدل العنوان النصي */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sa3y-logo.png"
            alt="بودكاست سَعي"
            className="mx-auto w-full max-w-[280px] sm:max-w-[340px]"
          />
          <p className="mx-auto mt-6 max-w-2xl text-cream/70">
            سَعي مكان تطلع منه بفائدة حقيقية — نحوّل الخبرة المتخصصة إلى كلام بسيط
            يفيدك، ونروي قصة السعي خلف كل تجربة. أنتجناه وقدّمناه في استوديو مجهّز،
            ومن نفس المكان نوفّر خدمات إنتاج لغيرنا.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={site.podcast.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-soft"
            >
              ▶ شاهد على يوتيوب
            </a>
            <a
              href={site.podcast.registerHref}
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
            >
              🎙️ كن ضيفاً في سَعي
            </a>
            <a
              href="/packages/"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
            >
              📦 باقات تسجيل البودكاست
            </a>
          </div>
        </Reveal>

        {/* البرامج من إنتاجنا */}
        <Reveal>
          <h3 className="mt-16 text-2xl font-extrabold text-cream">
            البرامج والبودكاست
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-cream/60">
            من برامج تقنية ومعرفية إلى بودكاست حواري. اضغط أي بطاقة لمشاهدتها على
            يوتيوب.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 text-right sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 80}>
              <div className="relative h-full">
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute left-3 top-3 z-10 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-cream backdrop-blur-sm transition hover:bg-gold hover:text-ink"
                >
                  GitHub ↗
                </a>
              )}
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full overflow-hidden rounded-2xl border border-line bg-ink-card transition hover:border-gold/50"
              >
                <div className="relative aspect-video overflow-hidden bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${p.ytId}/hqdefault.jpg`}
                    alt={p.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-black/30 text-4xl text-white/90 transition group-hover:bg-black/20">
                    ▶
                  </div>
                  {p.active && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <span className="size-2 animate-pulse rounded-full bg-white" />
                      قائم الآن
                    </span>
                  )}
                  {p.year && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-cream backdrop-blur-sm">
                      {p.year}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-extrabold text-cream">{p.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-cream/65">
                    {p.desc}
                  </p>
                  <p className="mt-3 text-xs font-bold text-gold">
                    {[p.year, p.meta].filter(Boolean).join(" · ")}
                    {p.year || p.meta ? " · " : ""}
                    {p.cta ?? "مشاهدة"} ↗
                  </p>
                </div>
              </a>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
