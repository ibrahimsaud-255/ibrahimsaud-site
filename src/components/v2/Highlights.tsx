"use client";

// «أبرز المزايا» — بطاقات طويلة تتمرّر أفقيّاً، مثل معرض الصفحات في آبل.
import { useRef } from "react";
import type { Highlight } from "@/lib/v2";

export default function Highlights({ items }: { items: Highlight[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * -420, behavior: "smooth" });
  return (
    <>
      <div ref={rail} className="v2-hl">
        {items.map((h) => (
          <figure key={h.title} className={`v2-hl-card ${h.kind} ${h.dark ? "dark" : ""}`}>
            <figcaption><b>{h.title}</b> {h.text}</figcaption>
            <div className="art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.img} alt="" loading="lazy" />
            </div>
          </figure>
        ))}
      </div>
      <div className="v2-rail-ctl">
        <button type="button" aria-label="السابق" onClick={() => go(-1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <button type="button" aria-label="التالي" onClick={() => go(1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
    </>
  );
}
