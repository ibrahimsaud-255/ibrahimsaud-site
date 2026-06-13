"use client";

import { useState } from "react";
import { works } from "@/lib/site";
import Reveal from "./Reveal";
import VideoCard from "./VideoCard";

// التصنيف يُستخدم مباشرة من بيانات العمل (w.category)
const groupOf = (cat: string) => cat;

// ترتيب ظهور التصنيفات في الفلتر — التصنيفات الفارغة تُخفى تلقائياً.
// «تغطية فعاليات» تشمل الهاكاثونات والمؤتمرات والمعارض.
const ORDER = [
  "إعلانات منتجات",
  "أعمال سينمائية",
  "مقابلات الشارع",
  "تغطية فعاليات",
];
const present = ORDER.filter((g) => works.some((w) => groupOf(w.category) === g));
const FILTERS = ["الكل", ...present];

export default function Works() {
  const [active, setActive] = useState("الكل");
  const filtered =
    active === "الكل"
      ? works
      : works.filter((w) => groupOf(w.category) === active);

  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الأعمال</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            مشاريع صنعتها — فكرة، تصوير، ومونتاج.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            كل عمل هنا قصة: العميل، التحدي، والأدوار اللي مسكتها فيه. اختر تصنيفاً
            أو اضغط على أي مقطع لمشاهدته.
          </p>
        </Reveal>

        {/* تبويبات التصنيف */}
        <Reveal delay={80}>
          <div className="mt-8 inline-flex flex-wrap gap-1.5 rounded-2xl border border-line bg-ink-card/60 p-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  active === f
                    ? "bg-gold text-ink"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          {filtered.map((w, i) => (
            <Reveal
              key={w.id}
              delay={(i % 2) * 80}
              className={w.featured ? "md:col-span-2" : ""}
            >
              <VideoCard work={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
