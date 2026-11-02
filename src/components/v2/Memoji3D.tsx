"use client";

// إيموجي إبراهيم بإحساس ثلاثيّ الأبعاد: يميل مع الماوس (أو التمرير على الجوال)،
// عليه لمعة تتحرّك مع الميل، ويغيّر تعبيره عند الأحداث (setMemoji).
import { useEffect, useRef, useState } from "react";
import type { Memoji } from "@/lib/v2";
import { MEMOJI_EVENT } from "./memojiBus";

const ALL: Memoji[] = ["happy", "wink", "big_happy", "one_raised_eyebrow", "surprise", "proud"];

export default function Memoji3D({ base = "happy", className = "" }: { base?: Memoji; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [face, setFace] = useState<Memoji>(base);

  useEffect(() => {
    const onFace = (e: Event) => setFace(((e as CustomEvent).detail as Memoji) || base);
    window.addEventListener(MEMOJI_EVENT, onFace);
    return () => window.removeEventListener(MEMOJI_EVENT, onFace);
  }, [base]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = tilt.current, b = box.current;
    if (!el || !b) return;
    let raf = 0;
    const apply = (rx: number, ry: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        b.style.setProperty("--gx", `${50 - ry * 2.2}%`);
        b.style.setProperty("--gy", `${30 + rx * 2.2}%`);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      apply(Math.max(-14, Math.min(14, -dy * 26)), Math.max(-18, Math.min(18, dx * 34)));
    };
    const onScroll = () => {
      if (matchMedia("(hover: hover)").matches) return;
      const r = b.getBoundingClientRect();
      const p = (r.top + r.height / 2) / innerHeight - 0.5;
      apply(p * 18, Math.sin(Date.now() / 1400) * 6);
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={box} className={`v2-memoji ${className}`}>
      <div className="shadow" />
      <div ref={tilt} className="tilt">
        {ALL.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={n} src={`/v2/memoji/${n}.png`} alt={n === base ? "إيموجي إبراهيم سعود" : ""} aria-hidden={n !== base}
            style={{ opacity: n === face ? 1 : 0 }} draggable={false} />
        ))}
      </div>
    </div>
  );
}
