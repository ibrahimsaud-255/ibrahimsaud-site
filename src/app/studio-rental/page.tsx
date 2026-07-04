import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Reveal from "@/components/Reveal";
import StudioTour from "@/components/StudioTour";
import PodcastGear from "@/components/PodcastGear";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "احجز الاستوديو — سجّل وامشِ | إبراهيم سعود",
  description:
    "استوديو مجهّز بالكامل: كاميرات بثّ 4K، مايكات، مكسر، وإضاءة RGB. صوّر محتواك واستلم اللقطات الخام وأكمل المونتاج بنفسك. راسلني لترتيب الحجز.",
};

export default function StudioRentalPage() {
  return (
    <>
      <Nav />
      <main className="bg-glow">
        <section className="px-5 pt-32 pb-8">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <p className="text-sm font-bold tracking-widest text-gold">
                الأستديو
              </p>
              <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                استوديو سَعي — المكان والمعدّات
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-cream/70">
                شاهد أجواء الأستديو والمعدّات الاحترافية التي نصوّر بها حلقاتك
                وإعلاناتك — كاميرات بثّ 4K، مايكات، مكسر، وإضاءة سينمائية.
              </p>
            </Reveal>
          </div>
        </section>

        {/* جولة الأستديو التفاعلية — اضغط النقاط لعرض التفاصيل */}
        <StudioTour />

        {/* استعراض المعدّات */}
        <PodcastGear />

        {/* دعوة للتواصل */}
        <section className="px-5 pb-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-3xl border border-line bg-ink-soft p-8 text-center sm:p-10">
                <h2 className="text-2xl font-black text-cream">
                  تبي وقت مخصّص أو ترتيب خاص؟
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-cream/70">
                  راسلني وأرتّب لك الحجز بالوقت والمعدّات اللي تحتاجها، أو نتفق على
                  باقة تجمع التصوير والمونتاج.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={waLink(
                      "السلام عليكم، أبي أحجز الاستوديو للتصوير 🎥",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-gold-soft"
                  >
                    احجز عبر واتساب
                  </a>
                  <a
                    href="/ad-packages/"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                  >
                    🎬 أبي تصوير ومونتاج كامل — باقات الإعلانات
                  </a>
                </div>
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
