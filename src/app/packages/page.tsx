import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Reveal from "@/components/Reveal";
import PodcastGear from "@/components/PodcastGear";
import GearImage from "@/components/GearImage";
import {
  site,
  waLink,
  podcastRecordingPrice,
  packageDeliverables,
} from "@/lib/site";

const arPrice = (n: number) => n.toLocaleString("ar-EG");

export const metadata: Metadata = {
  title: "تسجيل حلقات البودكاست — استوديو سَعي | إبراهيم سعود",
  description:
    "سجّل حلقة بودكاست كاملة في استوديو مجهّز بسعر ثابت واضح. تشمل التصوير متعدد الكاميرات وكل المخرجات الجاهزة للنشر: الفيديو الكامل، ١٠ مقاطع قصيرة، وتصاميم الحلقة.",
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
                سجّل حلقة بودكاست كاملة
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-cream/70">
                استوديو مجهّز بالكامل وتصوير متعدّد الكاميرات، وتستلم حلقتك مع كل
                مخرجاتها جاهزة للنشر — بسعر ثابت وواضح.
              </p>
            </Reveal>
          </div>
        </section>

        {/* السعر الثابت */}
        <section className="px-5 pb-4">
          <div className="mx-auto max-w-md">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-gold/50 bg-ink-card p-8 text-center">
                <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_50%_0%,var(--color-gold),transparent_55%)]" />
                <div className="relative">
                  <p className="text-sm font-bold text-cream/70">
                    تسجيل الحلقة الكاملة
                  </p>
                  <div className="mt-2 flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-gold">
                      {arPrice(podcastRecordingPrice)}
                    </span>
                    <span className="text-lg font-bold text-cream/70">ريال</span>
                  </div>
                  <p className="mt-3 text-sm text-cream/60">
                    سعر ثابت شامل الاستوديو والتصوير وكل المخرجات أدناه.
                  </p>
                  <a
                    href={waLink(
                      "السلام عليكم، أبي أحجز تسجيل حلقة بودكاست كاملة 🎙️",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-gold-soft"
                  >
                    احجز حلقتك عبر واتساب
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* استعراض الأستديو والمعدّات */}
        <PodcastGear />

        {/* المخرجات المشتركة */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="text-center">
                <p className="text-sm font-bold tracking-widest text-gold">
                  المخرجات
                </p>
                <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  وش تستلم بعد التصوير
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-cream/60">
                  تستلم حلقتك كاملة مع كل ما تحتاجه للنشر — كله ضمن السعر الثابت.
                </p>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {packageDeliverables.map((d, i) => (
                  <Reveal key={d.title} delay={i * 90}>
                    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink-card transition hover:-translate-y-1 hover:border-gold/50">
                      <GearImage src={d.image} name={d.title} accent="#f5a623" />
                      <div className="flex flex-1 flex-col p-6">
                        <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold">
                          ✓
                        </span>
                        <h3 className="mt-3 text-lg font-black text-cream">
                          {d.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-cream/70">
                          {d.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
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
