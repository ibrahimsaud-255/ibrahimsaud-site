import { site, programs } from "@/lib/site";
import Reveal from "./Reveal";

export default function Podcast() {
  return (
    <section
      id="podcast"
      className="bg-glow overflow-hidden border-t border-line/60 py-24"
    >
      <div className="mx-auto max-w-6xl px-5 text-center">
        <Reveal>
          {/* شعار بودكاست سَعي بدل العنوان النصي */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sa3y-logo.png"
            alt="بودكاست سَعي"
            className="mx-auto w-full max-w-[190px] sm:max-w-[230px]"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
            من برامج تقنية ومعرفية إلى بودكاست حواري. اضغط أي بطاقة لمشاهدتها
            على يوتيوب.
          </p>
        </Reveal>
      </div>

      {/* شبكة البرامج — ثابتة بدون حركة */}
      <div className="mx-auto mt-8 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p, i) => (
          <Reveal key={p.title} delay={(i % 3) * 80}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-video overflow-hidden rounded-2xl text-right"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${p.ytId}/hqdefault.jpg`}
                alt={p.title}
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />

              {/* تدرّج بسيط من تحت ليظهر الكلام فوق الصورة */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <h4 className="truncate text-lg font-extrabold text-white">
                  {p.title}
                </h4>
                <p className="truncate text-xs text-white/65">
                  {[p.active ? "قائم الآن" : null, p.year, p.meta]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
