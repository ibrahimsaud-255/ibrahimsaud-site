// شريط أتموسفير الأتيليه — يعرض ٤ صور صادقة من ورشة سارة على الرئيسية
// بجانب فقرة تعريفية. الهدف: يعطي المستخدمة إحساس أن خلف الموقع أتيليه حقيقي.

import Link from "next/link";
import { sarah } from "@/lib/sarah";

export default function AtelierStrip() {
  const shots = [
    { src: "/sarah/site/about.jpg", alt: "سارة أثناء العمل", cls: "col-span-2 aspect-[16/9]" },
    { src: "/sarah/site/sewing-machine.jpg", alt: "ماكينة الخياطة", cls: "aspect-[3/4]" },
    { src: "/sarah/site/tags-detail.jpg", alt: "تاق إبرة سارة اليدوي", cls: "aspect-square" },
    { src: "/sarah/site/sketchbook.jpg", alt: "دفتر تصاميم سارة", cls: "aspect-square" },
    { src: "/sarah/site/packaging.jpg", alt: "تجهيز الطلبات", cls: "aspect-square" },
    { src: "/sarah/site/fabric-market.jpg", alt: "اختيار الأقمشة من السوق", cls: "col-span-2 aspect-[16/9]" },
  ];

  return (
    <section className="border-y border-ecru bg-white/60 px-5 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-clay">من الأتيليه</p>
          <h2 className="mt-2 text-3xl font-black text-espresso sm:text-4xl">
            خلف كل قطعة —
            <br />
            ٢٥ سنة إبرة
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cocoa sm:text-base">
            سارة تخيط منذ ٢٥ سنة — للعائلة أولاً، ثم للجيران والصديقات. اليوم
            كل قطعة تُخاط في أتيليه {sarah.city}، بأقمشة تختارها بنفسها من سوق
            القيصرية، وتُغلَّف بيديها قبل أن تُشحن إليكِ.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sarah/course"
              className="rounded-full bg-clay px-6 py-3 text-xs font-black text-white transition hover:bg-clay-deep"
            >
              تعلّمي معها في الدورة ←
            </Link>
            <Link
              href="/sarah#products"
              className="rounded-full border border-ecru bg-white px-6 py-3 text-xs font-bold text-espresso transition hover:border-clay hover:text-clay"
            >
              تصفّحي القطع
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {shots.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={i} className={`overflow-hidden rounded-2xl bg-sand-deep ${s.cls}`}>
              <img
                src={s.src}
                alt={s.alt}
                className="size-full object-cover transition duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
