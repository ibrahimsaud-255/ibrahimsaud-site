"use client";

// قسم «تواصل معي» — صورة تملأ خلفية القسم كامل، والكلام فوقها على اليمين
// (نفس أسلوب قسم الخدمات، بلا صناديق). النصوص تُدار من النظام الداخلي (مفتاح contact).

import { site } from "@/lib/site";
import { useContent, goldParts, waHref } from "@/lib/cms";
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
    waMsg:
      "السلام عليكم، أبي أستفسر عن خدماتك (تقنية أعمال / بودكاست / إنتاج). التفاصيل: ",
  },
};

export default function Contact() {
  const c = useContent("contact", contactFallback);
  const info = useContent("site", {
    whatsapp: site.whatsapp as string,
    email: site.email as string,
  });

  return (
    <section
      id="contact"
      className="relative flex min-h-[85vh] items-end overflow-hidden border-t border-line/60 bg-ink sm:items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/identity/contact-v1.jpg"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-[25%_50%] sm:object-center"
      />

      {/* تظليل — يعتّم جهة النص ويترك الصورة ظاهرة */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink via-ink/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent sm:h-1/3 sm:via-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-40 sm:pb-16 sm:pt-16">
        <div className="sm:max-w-lg">
          <h2 className="text-4xl font-black leading-tight [text-shadow:0_2px_30px_rgba(0,0,0,.9)] sm:text-5xl">
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

          <p className="mt-4 max-w-md text-cream/80 [text-shadow:0_1px_18px_rgba(0,0,0,.9)]">
            {c.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={waHref(info.whatsapp, c.cta1.waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft"
            >
              {c.cta1.label}
            </a>
            <a
              href={waHref(info.whatsapp, c.cta2.waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-bold text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold"
            >
              {c.cta2.label}
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <SocialIcons />
            <a
              href={`mailto:${info.email}`}
              className="text-sm text-cream/60 transition hover:text-gold"
            >
              {info.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
