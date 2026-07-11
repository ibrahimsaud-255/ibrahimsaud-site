"use client";

// قسم «عني» — النصوص والمشاريع تُدار من النظام الداخلي («محتوى الموقع» → مفتاح about).
// النصوص هنا نسخة احتياطية، وما بين نجمتين *كذا* يظهر باللون الذهبي.

import { site } from "@/lib/site";
import { useContent, goldParts } from "@/lib/cms";
import Reveal from "./Reveal";

const aboutFallback = {
  label: "عني",
  title: "إبراهيم سعود",
  paragraphs: [
    "تقنية أعمال وبودكاست — أوظّف التقنية في تطوير الأعمال والأنظمة، وأنتج البودكاست والمحتوى المرئي الذي يبني الحضور.",
    "مقدّم ومنتج بودكاست *سَعي*، وأبني أنظمة وأدوات تقنية تخدم الأعمال (منها منصة *حروف ودروس*). اشتغلت مع جامعة الملك سعود في هاكاثون *هيلثون*، ومع علامات تجارية في السعودية والخليج بأكثر من ٣٠ عملاً مرئياً.",
    "فلسفتي بسيطة: التقنية والمحتوى الناجح وراهما قصة وتجهيز ونظام — وهذا ما أصنعه لك.",
  ],
  photo: "/profile.jpg",
  ventures: site.ventures.map((v) => ({ ...v })) as {
    title: string;
    desc: string;
    href: string;
    tag: string;
  }[],
};

function Golden({ text }: { text: string }) {
  return (
    <>
      {goldParts(text).map((p, i) =>
        p.gold ? (
          <span key={i} className="text-gold">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export default function About() {
  const c = useContent("about", aboutFallback);
  const info = useContent("site", { bio: site.bio as string });

  return (
    <section id="about" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div>
            <p className="text-sm font-bold tracking-widest text-gold">
              {c.label}
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              {c.title}
            </h2>
            {c.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "mt-6 text-lg leading-relaxed text-cream/80"
                    : "mt-4 leading-relaxed text-cream/70"
                }
              >
                <Golden text={p} />
              </p>
            ))}

            {/* مشاريع أخرى */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {c.ventures.map((v) => (
                <a
                  key={v.title}
                  href={v.href}
                  target={v.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-line bg-ink-card p-5 transition hover:border-gold/50"
                >
                  <span className="text-xs font-bold text-gold">{v.tag}</span>
                  <h4 className="mt-1 font-extrabold text-cream">
                    {v.title}
                    <span className="mr-1 inline-block transition group-hover:translate-x-[-3px]">
                      ↖
                    </span>
                  </h4>
                  <p className="mt-1 text-sm text-cream/60">{v.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-ink-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.photo}
                alt="إبراهيم سعود"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 right-4 rounded-2xl border border-line bg-ink px-5 py-3 shadow-xl">
              <p className="text-xs text-cream/60">{info.bio}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
