import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Reveal from "@/components/Reveal";
import AdPackages from "@/components/AdPackages";
import VideoCard from "@/components/VideoCard";
import type { Work } from "@/lib/site";
import { adPackages, adSampleVideos, waLink } from "@/lib/site";

const PKG_HEX: Record<string, string> = {
  red: "#e11d48",
  blue: "#2563eb",
  yellow: "#eab308",
};

export const metadata: Metadata = {
  title: "باقات الفيديوهات الإعلانية — أسعار واضحة | إبراهيم سعود",
  description:
    "باقات فيديو إعلاني بأسعار واضحة: الإعلان الواحد، المراجعة الكاملة، وباقة الـ٣ إعلانات. من الفكرة والسكربت حتى التصوير والمونتاج والتسليم جاهزاً للنشر.",
};

// فيديو شرح لكل باقة (ليست نماذج أعمال) — كل بطاقة بلون باقتها.
const explainers: { work: Work; accent?: string }[] = adSampleVideos.map(
  (url, i) => {
    const pkg = adPackages[i];
    return {
      accent: pkg ? PKG_HEX[pkg.color] : undefined,
      work: {
        id: `ad-explainer-${i}`,
        client: "شرح الباقة",
        title: pkg ? pkg.name : `الباقة ${i + 1}`,
        category: "فيديو شرح",
        roles: [],
        desc: pkg
          ? `${pkg.tagline} — شاهد شرح ما تشمله الباقة ومتى تناسبك.`
          : "شرح تفصيلي لمحتوى الباقة وما تشمله.",
        videoUrl: url,
      },
    };
  },
);

export default function AdPackagesPage() {
  return (
    <>
      <Nav />
      <main className="bg-glow">
        <section className="px-5 pt-32 pb-12">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <p className="text-sm font-bold tracking-widest text-gold">
                الفيديوهات الإعلانية
              </p>
              <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                باقات إعلانية بأسعار واضحة
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-cream/70">
                اختر الباقة المناسبة لمنتجك — من الفكرة والسكربت حتى التصوير
                والمونتاج والتسليم جاهزاً للنشر. الأسعار شاملة الإنتاج الكامل.
              </p>
            </Reveal>
          </div>
        </section>

        {/* البطاقات الثلاث */}
        <AdPackages />

        {/* معرض نماذج من الأعمال */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="text-center">
                <p className="text-sm font-bold tracking-widest text-gold">
                  شاهد قبل ما تطلب
                </p>
                <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  شرح كل باقة بالفيديو
                </h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {explainers.map(({ work, accent }, i) => (
                <Reveal key={work.id} delay={i * 90}>
                  <VideoCard work={work} accent={accent} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* دعوة للتواصل */}
        <section className="px-5 pb-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-3xl border border-line bg-ink-soft p-8 text-center sm:p-10">
                <h2 className="text-2xl font-black text-cream">
                  عندك منتج وتبي إعلان يبيع؟
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-cream/70">
                  راسلني وأرتب لك الباقة المناسبة، أو نتفق على باقة مخصّصة تناسب
                  حملتك وميزانيتك.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={waLink(
                      "السلام عليكم، أبي أستفسر عن باقات الفيديوهات الإعلانية 🎬",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-gold-soft"
                  >
                    تواصل عبر واتساب
                  </a>
                  <a
                    href="/studio-rental/"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                  >
                    🎥 أبي أصوّر بنفسي — احجز الاستوديو
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
