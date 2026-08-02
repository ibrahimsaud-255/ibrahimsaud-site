"use client";

// الواجهة الرئيسية — رسالة واحدة: فيديوهات إعلانية طولية تبيع.
// خلف الكلام جدار من المقاطع الطولية نفسها (متحرّك ببطء) ليكون واضحاً من أول ثانية
// أن هذه هي الخدمة. النصوص تُدار من النظام الداخلي («محتوى الموقع» → مفتاح hero).

import { reels, reelPoster } from "@/lib/reels";
import { site } from "@/lib/site";
import { useContent, goldParts, waHref } from "@/lib/cms";

const heroFallback = {
  title: "فيديو إعلاني *يبيع* — تستلمه خلال ٣ أيام.",
  sub: "أنا إبراهيم سعود. أكتب الفكرة والسكربت، وأصوّر، وأمنتج — وتستلم إعلاناً طولياً (٩:١٦) بهوك يوقف التمرير في أول ثانيتين، جاهزاً للنشر على تيك توك وسناب وريلز وشورتس.",
  cta1: {
    label: "اطلب إعلانك الآن",
    waMsg:
      "السلام عليكم إبراهيم، أبي إعلان لمنتجي 🎬\nالمنتج: \nجمهوري: \nهدفي من الإعلان: ",
  },
  cta2: { label: "شوف الإعلانات أولاً", href: "#works" },
  note: "٣ أيام تسليم · جولتا تعديل مجانية · تصوير في موقعك بالرياض أو في استوديو مجهّز",
};

// عمود من المقاطع يزحف ببطء (زينة فقط — المشاهدة من قسم الأعمال)
function WallColumn({
  items,
  reverse,
  className = "",
}: {
  items: typeof reels;
  reverse?: boolean;
  className?: string;
}) {
  const list = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex flex-col gap-3 ${reverse ? "marquee-y-rev" : "marquee-y"}`}
      >
        {list.map((r, i) => {
          const poster = reelPoster(r);
          return (
            <div
              key={`${r.id}-${i}`}
              className="relative aspect-[9/16] w-full shrink-0 overflow-hidden rounded-xl border border-line bg-ink-soft"
            >
              {poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt=""
                  aria-hidden
                  loading={i < 3 ? undefined : "lazy"}
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Hero() {
  const c = useContent("hero", heroFallback);
  const info = useContent("site", { whatsapp: site.whatsapp as string });

  const cols = [0, 1, 2].map((n) => reels.filter((_, i) => i % 3 === n));

  return (
    <section
      id="top"
      className="bg-glow relative flex min-h-screen w-full items-center overflow-hidden bg-ink px-5 pb-16 pt-28 sm:pt-32"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* الرسالة */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black leading-[1.3] sm:text-5xl lg:text-6xl">
            {goldParts(c.title).map((p, i) =>
              p.gold ? (
                <span key={i} className="gold-text">
                  {p.text}
                </span>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
            {c.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={waHref(info.whatsapp, c.cta1.waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft sm:text-base"
            >
              {c.cta1.label}
            </a>
            <a
              href={c.cta2.href}
              className="rounded-full border border-cream/25 px-8 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold sm:text-base"
            >
              {c.cta2.label}
            </a>
          </div>

          {/* شريط طمأنة — كل عنصر يزيل اعتراضاً قبل ما يسأل عنه العميل */}
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/65">
            {c.note
              .split("·")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="font-black text-gold">✓</span>
                  {t}
                </li>
              ))}
          </ul>
        </div>

        {/* جدار المقاطع الطولية */}
        <div
          aria-hidden
          className="pointer-events-none relative h-[46vh] select-none [mask-image:linear-gradient(180deg,transparent,#000_14%,#000_86%,transparent)] lg:h-[78vh]"
        >
          <div className="grid h-full grid-cols-3 gap-3">
            <WallColumn items={cols[0]} className="h-full" />
            <WallColumn items={cols[1]} className="h-full" reverse />
            <WallColumn items={cols[2]} className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
