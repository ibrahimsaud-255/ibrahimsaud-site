"use client";

// معرض صور الورش أعلى صفحة الذكاء الاصطناعي: صور حقيقيّة فقط (لا شرائح عروض).
// تمرير أفقيّ بالسحب أو الأزرار، ويتقدّم وحده كلّ ٤ ثوانٍ (يتوقّف عند اللمس/المرور، ولا يتحرّك مع «تقليل الحركة»).
import { useEffect, useRef, useState } from "react";

export type AiShot = { src: string; alt: string; cap: string };

export default function AiGallery({ shots }: { shots: AiShot[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("figure") as HTMLElement | null;
    const step = (card?.offsetWidth || 300) + 16;
    // RTL: التمرير «للأمام» قيمته سالبة
    const max = el.scrollWidth - el.clientWidth;
    const atEnd = Math.abs(el.scrollLeft) >= max - 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: -dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="ai-gal" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <div className="ai-gal-track" ref={ref}>
        {shots.map((s) => (
          <figure key={s.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} />
            <figcaption>{s.cap}</figcaption>
          </figure>
        ))}
      </div>
      <div className="ai-gal-ctl">
        <button type="button" aria-label="السابق" onClick={() => go(-1)}>›</button>
        <button type="button" aria-label="التالي" onClick={() => go(1)}>‹</button>
      </div>
    </div>
  );
}
