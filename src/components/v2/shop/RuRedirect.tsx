"use client";

// زائر روسيا يُحوَّل لنسخة روسيا (/ru/lessons-broadcast/) تلقائيّاً:
// أوّلاً من المنطقة الزمنيّة للجهاز (فوريّ)، ثمّ من بلد الاتّصال الذي يحدّده الخادم.
// ‎?lang=ar يُبقيه على العربيّة (ويتذكّرها) — رابط «النسخة العربيّة» في الصفحة الروسيّة.
import { useEffect } from "react";
import { RU_TZ } from "@/lib/shopUi";
import { visitorCountry } from "./ShopPrice";

export default function RuRedirect({ sku, to }: { sku: string; to: string }) {
  useEffect(() => {
    const K = "shop-stay-ar";
    try {
      if (new URLSearchParams(location.search).get("lang") === "ar") { localStorage.setItem(K, "1"); return; }
      if (localStorage.getItem(K)) return;
    } catch { /* تخزين مقفل */ }
    const go = () => location.replace(to + location.hash);
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* متصفّح قديم */ }
    if (RU_TZ.has(tz)) return go();
    let on = true;
    visitorCountry(sku).then((c) => { if (on && c === "RU") go(); });
    return () => { on = false; };
  }, [sku, to]);
  return null;
}
