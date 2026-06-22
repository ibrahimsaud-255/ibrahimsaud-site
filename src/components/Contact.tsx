import { site, waLink } from "@/lib/site";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="bg-glow relative overflow-hidden rounded-3xl border border-line bg-ink-card p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_0%,var(--color-gold),transparent_55%)]" />
            <div className="relative">
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                عندك فكرة، نظام، أو بودكاست؟{" "}
                <span className="gold-text">نبدأها سوا.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                راسلني على واتساب واحكِ لي عن مشروعك — تقنية أعمال، بودكاست، أو
                إنتاج محتوى — وأرجع لك بخطة وعرض سعر.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={waLink(
                    "السلام عليكم إبراهيم، شفت موقعك وأبي أتواصل معك 👋",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-gold-soft"
                >
                  <span className="text-xl">📱</span>
                  تواصل عبر واتساب
                </a>
                <a
                  href={waLink(
                    "السلام عليكم، أبي أستفسر عن خدماتك (تقنية أعمال / بودكاست / إنتاج). التفاصيل: ",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-4 text-base font-bold text-cream transition hover:border-gold hover:text-gold"
                >
                  اطلب الخدمة
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cream/60">
                <a
                  href={`mailto:${site.email}`}
                  className="transition hover:text-gold"
                >
                  ✉️ {site.email}
                </a>
                {site.social.tiktok && (
                  <a
                    href={site.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-gold"
                  >
                    🎵 تيك توك
                  </a>
                )}
                {site.social.youtube && (
                  <a
                    href={site.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-gold"
                  >
                    ▶ يوتيوب سَعي
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
