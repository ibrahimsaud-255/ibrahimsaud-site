"use client";

// البيان: جملة طويلة تتلوّن كلمة كلمة مع التمرير (أسلوب صفحات آبل).
import { useEffect, useRef, useState } from "react";

export default function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const [lit, setLit] = useState(words.length);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      setLit(Math.round(words.length * Math.min(1, p * 1.15)));
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [words.length]);

  return (
    <section ref={ref} className="v2-manifesto" aria-label="البيان">
      <div className="sticky">
        <div className="v2-wrap">
          <p>{words.map((w, i) => <span key={i} className={`w ${i < lit ? "" : "dim"}`}>{w} </span>)}</p>
        </div>
      </div>
    </section>
  );
}
