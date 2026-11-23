"use client";

// شريط سعر ثابت أسفل الجوّال: يظهر بعد ما ينزل الزائر عن الواجهة، ويختفي إذا وصل لوحة الشراء.
import { useEffect, useState } from "react";
import type { ShopItem } from "@/lib/shop";
import ShopPrice from "./ShopPrice";

export default function StickyBuy({ item, label }: { item: ShopItem; label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const buy = document.getElementById("buy");
    let buyVisible = false;
    const io = buy ? new IntersectionObserver(([e]) => { buyVisible = e.isIntersecting; update(); }, { threshold: 0.1 }) : null;
    if (buy && io) io.observe(buy);
    function update() { setShow(window.scrollY > 700 && !buyVisible); }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", update); io?.disconnect(); };
  }, []);
  return (
    <div className="v2-shop-sticky" data-show={show ? "1" : "0"} aria-hidden={!show}>
      <span className="p"><ShopPrice sku={item.sku} fallback={item.fallbackPrice} lang={item.lang} /></span>
      <a className="v2-btn v2-btn-primary sm" href="#buy" tabIndex={show ? 0 : -1}>{label}</a>
    </div>
  );
}
