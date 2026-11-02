"use client";

// غلاف الموقع الجديد: يضيف .js (فتختفي العناصر قبل ظهورها فقط إذا اشتغل الجافاسكربت)
// ويُظهر كلّ [data-rise] عند دخوله الشاشة.
import { useEffect, useRef } from "react";

export default function Shell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.classList.add("js");
    const els = [...root.querySelectorAll<HTMLElement>("[data-rise]")];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("risen"); obs.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add("risen");
      else obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="v2" dir="rtl">{children}</div>;
}
