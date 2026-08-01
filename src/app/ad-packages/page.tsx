import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Reveal from "@/components/Reveal";
import AdPackages from "@/components/AdPackages";
import AdReels from "@/components/AdReels";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "باقات الفيديوهات الإعلانية — أسعار واضحة | إبراهيم سعود",
  description:
    "باقات فيديو إعلاني بأسعار واضحة: الإعلان الواحد، المراجعة الكاملة، وباقة الـ٣ إعلانات. من الفكرة والسكربت حتى التصوير والمونتاج والتسليم جاهزاً للنشر.",
};

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

        {/* نماذج من الإعلانات الطولية */}
        <AdReels />

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
                  <Link
                    href="/#works"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
                  >
                    🎬 شاهد أعمالي أولاً
                  </Link>
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
