import Reveal from "@/components/Reveal";
import { podcastGear } from "@/lib/site";

const arabicNum = (n: number) => n.toLocaleString("ar-EG");

function GearMedia({
  sketchfab,
  image,
  name,
}: {
  sketchfab?: string;
  image?: string;
  name: string;
}) {
  if (sketchfab) {
    return (
      <div className="relative aspect-[4/3] w-full bg-ink-soft">
        <iframe
          title={name}
          src={`https://sketchfab.com/models/${sketchfab}/embed?autospin=0.5&autostart=1&preload=1&transparent=1&ui_hint=0&ui_infos=0&ui_controls=1&ui_stop=0`}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-gold backdrop-blur">
          ✋ اسحب للتدوير
        </span>
      </div>
    );
  }
  if (image) {
    return (
      <div className="relative aspect-[4/3] w-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-ink-soft text-center">
      <span className="text-5xl">🎛️</span>
      <span className="text-xs font-bold text-cream/50">
        معاينة قريباً
      </span>
    </div>
  );
}

export default function PodcastGear() {
  const hero = podcastGear.find((g) => g.hero);
  const rest = podcastGear.filter((g) => !g.hero);

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-gold">
              معدّات الاستوديو
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              معدّات احترافية تصنع الفرق
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream/70">
              الأجهزة التي نصوّر بها حلقاتك وإعلاناتك — كاميرات بثّ 4K، مايكات بثّ،
              مكسر، إضاءة RGB، وتيليبرومبتر. استعرض بعضها ثلاثي الأبعاد.
            </p>
          </div>
        </Reveal>

        {/* الكاميرا الأساسية — بطاقة بارزة */}
        {hero && (
          <Reveal>
            <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-ink-card transition hover:border-gold/50 md:grid md:grid-cols-2">
              <div className="relative bg-white">
                <GearMedia image={hero.image} name={hero.name} />
                {hero.qty > 1 && (
                  <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-bold text-gold backdrop-blur">
                    ×{arabicNum(hero.qty)}
                  </span>
                )}
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <span className="text-xs font-bold tracking-widest text-gold">
                  {hero.brand} · الكاميرا الأساسية
                </span>
                <h3 className="mt-1 text-2xl font-black text-cream">
                  {hero.name}
                </h3>
                <p className="mt-0.5 text-sm font-bold text-cream/60">
                  {hero.type}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-cream/75">
                  {hero.desc}
                </p>
                {hero.specs && (
                  <ul className="mt-4 grid gap-2">
                    {hero.specs.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2 text-sm leading-relaxed text-cream/80"
                      >
                        <span className="mt-0.5 text-gold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {hero.note && (
                  <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold">
                    ℹ️ {hero.note}
                  </p>
                )}
                {hero.link && (
                  <a
                    href={hero.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                  >
                    المواصفات الكاملة من المصنّع ↗
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        )}

        {/* بقية المعدّات */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((g, i) => (
            <Reveal key={g.id} delay={i * 80}>
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink-card transition hover:border-gold/50">
                <div className="relative">
                  <GearMedia
                    sketchfab={g.sketchfab}
                    image={g.image}
                    name={g.name}
                  />
                  {g.qty > 1 && (
                    <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-line bg-ink/80 px-3 py-1 text-xs font-bold text-cream/80 backdrop-blur">
                      ×{arabicNum(g.qty)}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-bold tracking-widest text-gold">
                    {g.brand}
                  </span>
                  <h3 className="mt-1 text-xl font-black text-cream">{g.name}</h3>
                  <p className="mt-0.5 text-sm font-bold text-cream/60">
                    {g.type}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-cream/75">
                    {g.desc}
                  </p>
                  {g.specs && (
                    <ul className="mt-4 grid gap-2">
                      {g.specs.map((s) => (
                        <li
                          key={s}
                          className="flex gap-2 text-sm leading-relaxed text-cream/80"
                        >
                          <span className="mt-0.5 text-gold">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {g.note && (
                    <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold">
                      ℹ️ {g.note}
                    </p>
                  )}
                  {g.link && (
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-gold transition hover:text-gold-soft"
                    >
                      المواصفات الكاملة ↗
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
