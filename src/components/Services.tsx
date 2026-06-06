import { services } from "@/lib/site";
import Reveal from "./Reveal";

export default function Services() {
  return (
    <section id="services" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الخدمات</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            كل ما يحتاجه إعلانك — من مكان واحد.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 80}>
              <div className="group h-full rounded-2xl border border-line bg-ink-card p-6 transition hover:border-gold/50 hover:bg-ink-card/80">
                <div className="flex size-12 items-center justify-center rounded-xl border border-line bg-ink-soft text-2xl">
                  {s.icon}
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-cream">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
