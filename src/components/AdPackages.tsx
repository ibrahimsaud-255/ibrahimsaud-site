"use client";

// باقات الإعلانات — الأسماء والأسعار والشارات تُدار من النظام الداخلي
// («محتوى الموقع» → «الأسعار والباقات»، مفتاح prices.ads بمعرّف الباقة).

import Reveal from "@/components/Reveal";
import { adPackages, waLink } from "@/lib/site";
import { useContent } from "@/lib/cms";

const COLORS: Record<string, string> = {
  red: "#e11d48",
  blue: "#2563eb",
  yellow: "#eab308",
};

const arPrice = (n: number) => n.toLocaleString("ar-EG");

type Override = { name?: string; price?: number; tagline?: string; badge?: string };

export default function AdPackages() {
  const c = useContent("prices", { ads: {} as Record<string, Override> });
  const list = adPackages.map((p) => ({ ...p, ...(c.ads[p.id] || {}) }));
  return (
    <section className="px-5 pb-8">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {list.map((p, i) => {
          const c = COLORS[p.color];
          return (
            <Reveal key={p.id} delay={i * 90}>
              <div
                className="flex h-full flex-col overflow-hidden rounded-3xl border bg-ink-card transition hover:-translate-y-1"
                style={{ borderColor: `${c}55`, borderTopWidth: 4, borderTopColor: c }}
              >
                {/* صورة الباقة المربّعة */}
                <div className="relative aspect-square w-full bg-ink-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {p.badge && (
                    <span
                      className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black text-white shadow"
                      style={{ backgroundColor: c }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-black text-cream">{p.name}</h3>
                  <p className="mt-1 text-sm text-cream/60">{p.tagline}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className="text-4xl font-black"
                      style={{ color: c }}
                    >
                      {arPrice(p.price)}
                    </span>
                    <span className="text-sm font-bold text-cream/70">ريال</span>
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2.5 text-sm leading-relaxed text-cream/80"
                      >
                        <span className="mt-0.5 font-black" style={{ color: c }}>
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={waLink(
                      `السلام عليكم، أبي أطلب «${p.name}» (${p.price} ريال) 🎬`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white transition hover:opacity-90"
                    style={{ backgroundColor: c, marginTop: "auto" }}
                  >
                    اطلب هذه الباقة عبر واتساب
                  </a>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
