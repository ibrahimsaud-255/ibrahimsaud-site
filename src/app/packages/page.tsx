import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Reveal from "@/components/Reveal";
import {
  site,
  waLink,
  podcastPackages,
  packageDeliverables,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "باقات تسجيل البودكاست — استوديو سَعي | إبراهيم سعود",
  description:
    "باقات واضحة لتسجيل حلقات البودكاست في استوديو مجهّز: حلقة بمقدّم وضيف، أو حلقة بأربعة أشخاص. تشمل التصوير متعدد الكاميرات والمخرجات الجاهزة للنشر.",
};

export default function PackagesPage() {
  return (
    <>
      <Nav />
      <main className="bg-glow">
        <section className="px-5 pt-32 pb-16">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <p className="text-sm font-bold tracking-widest text-gold">
                استوديو سَعي للبودكاست
              </p>
              <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                باقات تسجيل حلقات البودكاست
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-cream/70">
                طريقة واضحة وسهلة لتسجيل حلقتك: اختر عدد الأشخاص، ونتكفّل بالمكان
                والمعدّات والتصوير والمخرجات الجاهزة للنشر.
              </p>
            </Reveal>
          </div>
        </section>

        {/* الباقتان */}
        <section className="px-5 pb-8">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {podcastPackages.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <div className="flex h-full flex-col rounded-3xl border border-line bg-ink-card p-7 transition hover:border-gold/50">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-black text-cream">{p.name}</h2>
                    {p.badge && (
                      <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-cream/60">{p.tagline}</p>
                  <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-bold text-gold">
                    👥 {p.persons}
                  </p>

                  <h3 className="mt-6 text-sm font-bold tracking-wide text-cream/80">
                    المكان والمعدّات
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {p.setup.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2.5 text-sm leading-relaxed text-cream/75"
                      >
                        <span className="mt-1 text-gold">●</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={waLink(
                      `السلام عليكم، أبي أحجز باقة «${p.name}» لتسجيل حلقة بودكاست 🎙️`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-soft"
                  >
                    احجز هذه الباقة عبر واتساب
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* المخرجات المشتركة */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-3xl border border-line bg-ink-soft p-7 sm:p-9">
                <h2 className="text-2xl font-black text-cream">
                  المخرجات — تشمل كل باقة
                </h2>
                <p className="mt-2 text-sm text-cream/60">
                  بعد التصوير، تستلم حلقتك كاملة مع كل ما تحتاجه للنشر.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {packageDeliverables.map((d) => (
                    <div
                      key={d}
                      className="rounded-2xl border border-line bg-ink-card p-5 text-sm leading-relaxed text-cream/80"
                    >
                      <span className="text-2xl text-gold">✓</span>
                      <p className="mt-2">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-center">
                <a
                  href={waLink("السلام عليكم، أبي أستفسر عن باقات البودكاست 🎙️")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-gold-soft"
                >
                  تواصل لحجز حلقتك
                </a>
                <a
                  href={site.podcast.registerHref}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                >
                  🎙️ كن ضيفاً في سَعي
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
