"use client";

// قسم «تواصل معي» — النصوص والأزرار تُدار من النظام الداخلي («محتوى الموقع» → مفتاح contact)،
// وما بين نجمتين *كذا* في العنوان يظهر بالتدرج الذهبي.

import { site } from "@/lib/site";
import { useContent, goldParts, waHref } from "@/lib/cms";
import Reveal from "./Reveal";
import SocialIcons from "./SocialIcons";

const contactFallback = {
  title: "عندك فكرة، نظام، أو بودكاست؟ *نبدأها سوا.*",
  sub: "راسلني على واتساب واحكِ لي عن مشروعك — تقنية أعمال، بودكاست، أو إنتاج محتوى — وأرجع لك بخطة وعرض سعر.",
  cta1: {
    label: "تواصل عبر واتساب",
    waMsg: "السلام عليكم إبراهيم، شفت موقعك وأبي أتواصل معك 👋",
  },
  cta2: {
    label: "اطلب الخدمة",
    waMsg: "السلام عليكم، أبي أستفسر عن خدماتك (تقنية أعمال / بودكاست / إنتاج). التفاصيل: ",
  },
};

export default function Contact() {
  const c = useContent("contact", contactFallback);
  const info = useContent("site", {
    whatsapp: site.whatsapp as string,
    email: site.email as string,
  });

  return (
    <section id="contact" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="bg-glow relative overflow-hidden rounded-3xl border border-line bg-ink-card p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_0%,var(--color-gold),transparent_55%)]" />
            <div className="relative">
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                {goldParts(c.title).map((p, i) =>
                  p.gold ? (
                    <span key={i} className="gold-text">
                      {p.text}
                    </span>
                  ) : (
                    <span key={i}>{p.text}</span>
                  ),
                )}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">{c.sub}</p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={waHref(info.whatsapp, c.cta1.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-gold-soft"
                >
                  <span className="text-xl">📱</span>
                  {c.cta1.label}
                </a>
                <a
                  href={waHref(info.whatsapp, c.cta2.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-4 text-base font-bold text-cream transition hover:border-gold hover:text-gold"
                >
                  {c.cta2.label}
                </a>
              </div>

              <div className="mt-10">
                <SocialIcons size="lg" />
                <a
                  href={`mailto:${info.email}`}
                  className="mt-6 inline-block text-sm text-cream/60 transition hover:text-gold"
                >
                  ✉️ {info.email}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
