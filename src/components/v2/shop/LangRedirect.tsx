"use client";

// زائر الصفحة العربيّة يُحوَّل لصفحة لغته تلقائيّاً (الحملة العالميّة):
// - روسيا (المنطقة الزمنيّة) ← /ru/.
// - متصفّحه فيه العربيّة، أو من دولة عربيّة (أو تشاد) ← يبقى هنا.
// - غير ذلك: لغة متصفّحه إن كانت من لغاتنا (fr de tr id ur fa ps ckb ru)، وإلا لغة دولته، وإلا الإنجليزيّة.
// ‎?lang=ar يُبقيه على العربيّة (ويتذكّرها) — رابط «العربيّة» في مبدّل اللغة. محرّكات البحث لا تُحوَّل.
import { useEffect } from "react";
import { ARAB_CC, RU_TZ } from "@/lib/shopUi";
import { langPath } from "@/lib/shopIntl";
import { visitorCountry } from "./ShopPrice";

const SUPPORTED = new Set(["ru", "fr", "de", "tr", "id", "ur", "fa", "ps", "ckb"]);
const ALIAS: Record<string, string> = { ms: "id", prs: "fa", ku: "ckb" };
const BY_COUNTRY: Record<string, string> = {
  RU: "ru", TR: "tr", ID: "id", MY: "id", BN: "id", PK: "ur", AF: "fa", DE: "de", AT: "de",
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", SN: "fr", ML: "fr", NE: "fr", BF: "fr", CI: "fr", GN: "fr",
  CM: "fr", BJ: "fr", TG: "fr", GA: "fr", CG: "fr", CD: "fr", CF: "fr", MG: "fr", HT: "fr",
};

export default function LangRedirect({ sku }: { sku: string }) {
  useEffect(() => {
    if (/bot|crawl|spider|slurp|mediapartners|lighthouse|headless/i.test(navigator.userAgent)) return;
    const K = "shop-stay-ar";
    try {
      if (new URLSearchParams(location.search).get("lang") === "ar") { localStorage.setItem(K, "1"); return; }
      if (localStorage.getItem(K)) return;
    } catch { /* تخزين مقفل */ }
    const go = (code: string) => location.replace(langPath(code) + location.hash);
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* متصفّح قديم */ }
    if (RU_TZ.has(tz)) return go("ru");
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language || ""]).map((l) => l.toLowerCase());
    if (langs.some((l) => l.startsWith("ar"))) return;
    const pref = langs.map((l) => { const b = l.split("-")[0]; return ALIAS[b] || b; }).find((b) => SUPPORTED.has(b));
    let on = true;
    visitorCountry(sku).then((c) => {
      if (!on) return;
      if (c && (ARAB_CC.has(c) || c === "TD")) return;
      if (pref) return go(pref);
      if (c) go(BY_COUNTRY[c] || "en");
    });
    return () => { on = false; };
  }, [sku]);
  return null;
}
