"use client";

// شريط ثابت أسفل الجوّال (سعر + زرّ): يظهر بعد ما ينزل الزائر عن الواجهة، ويختفي إذا وصل قسم السعر.
// نسخة عامّة من StickyBuy لصفحات بلا سعر حيّ (مثل نظام الجمعيات).
import { useEffect, useState } from "react";

export default function StickyCta({ price, cta, href, hideId = "buy" }: { price: string; cta: string; href: string; hideId?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById(hideId);
    let visible = false;
    const io = target ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }, { threshold: 0.1 }) : null;
    if (target && io) io.observe(target);
    function update() { setShow(window.scrollY > 700 && !visible); }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", update); io?.disconnect(); };
  }, [hideId]);
  return (
    <div className="v2-shop-sticky" data-show={show ? "1" : "0"} aria-hidden={!show}>
      <span className="p">{price}</span>
      <a className="v2-btn v2-btn-primary sm" href={href} tabIndex={show ? 0 : -1}>{cta}</a>
    </div>
  );
}
