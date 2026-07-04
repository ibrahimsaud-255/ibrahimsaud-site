import Reveal from "@/components/Reveal";
import { podcastGear } from "@/lib/site";
import GearImage from "@/components/GearImage";

const arabicNum = (n: number) => n.toLocaleString("ar-EG");

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
              مكسر، إضاءة RGB، وتيليبرومبتر.
            </p>
          </div>
        </Reveal>

        {/* أجواء الأستديو — صور المكان */}
        <Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["studio-1", "studio-2", "studio-3", "studio-4", "studio-5", "studio-6"].map(
              (s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s}
                  src={`/studio/${s}.jpg`}
                  alt="من داخل الأستديو"
                  loading="lazy"
                  className="aspect-video w-full rounded-2xl border border-line object-cover transition hover:border-gold/40"
                />
              ),
            )}
          </div>
        </Reveal>

        {/* الكاميرا الأساسية — بطاقة بارزة */}
        {hero && (
          <Reveal>
            <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-ink-card transition hover:border-gold/50 md:grid md:grid-cols-2">
              <div className="relative bg-white">
                <GearImage src={hero.image} name={hero.name} />
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
                <div className="mt-5 flex flex-wrap gap-3">
                  {hero.amazonUrl && (
                    <a
                      href={hero.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ff9900] px-5 py-2.5 text-sm font-black text-ink transition hover:brightness-110"
                    >
                      🛒 اشترِ من أمازون
                    </a>
                  )}
                  {hero.link && (
                    <a
                      href={hero.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                    >
                      المواصفات الكاملة من المصنّع ↗
                    </a>
                  )}
                </div>
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
                  <GearImage src={g.image} name={g.name} accent={g.accent} />
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
                  <div className="mt-auto flex flex-col gap-2.5 pt-5">
                    {g.amazonUrl && (
                      <a
                        href={g.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff9900] px-5 py-3 text-sm font-black text-ink transition hover:brightness-110"
                      >
                        🛒 اشترِ من أمازون
                      </a>
                    )}
                    {g.link && (
                      <a
                        href={g.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-gold transition hover:text-gold-soft"
                      >
                        المواصفات الكاملة ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
