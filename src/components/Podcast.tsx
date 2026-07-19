import { site, programs } from "@/lib/site";
import Reveal from "./Reveal";

export default function Podcast() {
  return (
    <section
      id="podcast"
      className="bg-glow border-t border-line/60 px-5 py-24"
    >
      <div className="mx-auto max-w-6xl text-center">
        <Reveal>
          {/* شعار بودكاست سَعي بدل العنوان النصي */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sa3y-logo.png"
            alt="بودكاست سَعي"
            className="mx-auto w-full max-w-[190px] sm:max-w-[230px]"
          />
          <p className="mx-auto mt-6 max-w-2xl text-cream/70">
            سَعي مكان تطلع منه بفائدة حقيقية — نحوّل الخبرة المتخصصة إلى كلام
            بسيط يفيدك، ونروي قصة السعي خلف كل تجربة. أنتجناه وقدّمناه في
            استوديو مجهّز، ومن نفس المكان نوفّر خدمات إنتاج لغيرنا.
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
            من برامج تقنية ومعرفية إلى بودكاست حواري. اضغط أي بطاقة لمشاهدتها
            على يوتيوب.
          </p>
        </Reveal>

        {/* شريط متحرك بالبرامج — يتوقف عند المرور بالفأرة */}
        <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]">
          <div className="marquee-track flex w-max [animation-duration:50s]">
            {[...programs, ...programs].map((p, i) => (
              <a
                key={`${p.title}-${i}`}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={i >= programs.length}
                tabIndex={i >= programs.length ? -1 : undefined}
                className="group me-5 block w-[300px] shrink-0 overflow-hidden rounded-2xl border border-line bg-ink-card text-right transition hover:border-gold/60 sm:w-[360px]"
              >
                <div className="relative aspect-video overflow-hidden bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${p.ytId}/hqdefault.jpg`}
                    alt={p.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/10">
                    <span className="grid size-14 place-items-center rounded-full bg-red-600 text-xl text-white shadow-lg transition group-hover:scale-110">
                      ▶
                    </span>
                  </span>
                  {p.active && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <span className="size-2 animate-pulse rounded-full bg-white" />
                      قائم الآن
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4">
                  {p.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logo}
                      alt=""
                      className="size-11 shrink-0 rounded-full border border-line bg-ink object-contain p-1"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="truncate font-extrabold text-cream">
                      {p.title}
                    </h4>
                    <p className="truncate text-xs text-cream/55">
                      {[p.year, p.meta].filter(Boolean).join(" · ") || "مشاهدة"}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
