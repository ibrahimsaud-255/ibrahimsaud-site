import Reveal from "@/components/Reveal";
import { studioRental, studioRentalNote, waLink } from "@/lib/site";

const arPrice = (n: number) => n.toLocaleString("ar-EG");

export default function StudioRental() {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-gold">
              احجز الاستوديو
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              سجّل وامشِ — والمونتاج عليك
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream/70">
              {studioRentalNote}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {studioRental.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <div
                className={`flex h-full flex-col rounded-3xl border bg-ink-card p-7 transition hover:-translate-y-1 ${
                  p.badge ? "border-gold/60" : "border-line hover:border-gold/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-cream">{p.name}</h3>
                  {p.badge && (
                    <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-cream/60">{p.tagline}</p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gold">
                    {arPrice(p.price)}
                  </span>
                  <span className="text-sm font-bold text-cream/70">
                    ريال {p.unit}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {p.includes.map((f) => (
                    <li
                      key={f}
                      className="flex gap-2.5 text-sm leading-relaxed text-cream/80"
                    >
                      <span className="mt-1 text-gold">●</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={waLink(
                    `السلام عليكم، أبي أحجز الاستوديو — «${p.name}» (${p.price} ريال ${p.unit}) 🎥`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-soft"
                  style={{ marginTop: "auto" }}
                >
                  احجز عبر واتساب
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-cream/50">
            تحتاج مونتاج أيضاً؟ شاهد باقات الفيديوهات الإعلانية أو راسلنا لباقة
            مخصّصة تجمع التصوير والمونتاج.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
