"use client";

// زائر الصفحة العربيّة يُحوَّل لنسخته تلقائيّاً:
// - روسيا ← /ru/… (المنطقة الزمنيّة للجهاز فوراً، ثمّ بلد الاتّصال من الخادم).
// - خارج الدول العربيّة ومتصفّحه بلا عربيّة ← /en/… (العربيّ في أيّ بلد يبقى هنا).
// ‎?lang=ar يُبقيه على العربيّة (ويتذكّرها) — رابط «النسخة العربيّة» في الصفحتين.
import { useEffect } from "react";
import { ARAB_CC, RU_TZ } from "@/lib/shopUi";
import { visitorCountry } from "./ShopPrice";

export default function LangRedirect({ sku, ru, en }: { sku: string; ru: string; en: string }) {
  useEffect(() => {
    const K = "shop-stay-ar";
    try {
      if (new URLSearchParams(location.search).get("lang") === "ar") { localStorage.setItem(K, "1"); return; }
      if (localStorage.getItem(K)) return;
    } catch { /* تخزين مقفل */ }
    const go = (to: string) => location.replace(to + location.hash);
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* متصفّح قديم */ }
    if (RU_TZ.has(tz)) return go(ru);
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language || ""]).map((l) => l.toLowerCase());
    const arabic = langs.some((l) => l.startsWith("ar"));
    let on = true;
    visitorCountry(sku).then((c) => {
      if (!on || !c) return;
      if (c === "RU") go(ru);
      else if (!arabic && !ARAB_CC.has(c)) go(en);
    });
    return () => { on = false; };
  }, [sku, ru, en]);
  return null;
}
