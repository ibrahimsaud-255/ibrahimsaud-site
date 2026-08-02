"use client";

// قسم الباقات في الصفحة الرئيسية — الأسعار نفسها المعروضة في /ad-packages/
// (تُدار من النظام الداخلي: «الأسعار والباقات» → مفتاح prices.ads).

import { useContent } from "@/lib/cms";
import AdPackages from "./AdPackages";
import Reveal from "./Reveal";

const fallback = {
  label: "الأسعار",
  title: "سعر واضح — بلا مفاجآت.",
  sub: "كل باقة تشمل الفكرة والسكربت والتصوير والمونتاج، وتسليماً خلال ٣ أيام مع جولتَي تعديل مجانية.",
};

export default function PackagesSection() {
  const c = useContent("packages", fallback);

  return (
    <section id="packages" className="border-t border-line/60 px-5 pt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">{c.label}</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            {c.title}
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">{c.sub}</p>
        </Reveal>
      </div>

      <div className="mt-10">
        <AdPackages />
      </div>

      <div className="mx-auto max-w-6xl pb-8 text-center">
        <a
          href="/ad-packages/"
          className="text-sm font-bold text-gold underline-offset-4 hover:underline"
        >
          تفاصيل الباقات كاملة ←
        </a>
      </div>
    </section>
  );
}
