"use client";

// السعر الحيّ من shop_products — يبدأ بالاحتياطيّ ثمّ يُستبدل بما يُخصم فعلاً.
import { useEffect, useState } from "react";
import { fetchLive, sar, shopCall } from "@/lib/shop";

// سعر الزائر يحدّده الخادم حسب بلده (نفس ما يُخصم فعلاً) — أو حسب البلد الذي اختاره
// (كثيرون يتصفّحون بـVPN فيظهرون من بلد آخر). بلد البطاقة يُطابَق بعد الدفع في الخادم.
type PriceRes = { price?: number; country?: string; ip?: string };
const priceCache: Record<string, Promise<PriceRes | null>> = {};
function fetchPrice(sku: string, cc: string) {
  return (priceCache[sku + "|" + cc] ??= shopCall<PriceRes>("price", { sku, ...geo(cc) }).then((r) => (r.ok ? r.data : null)));
}
/** ما يرسله المتصفّح لتحديد البلد: اختياره اليدويّ (إن وُجد) + المنطقة الزمنيّة للجهاز (لا يغيّرها الـVPN). */
export function geo(cc = chosenCountry()): { country?: string; tz?: string } {
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* متصفّح قديم */ }
  return { ...(cc ? { country: cc } : {}), ...(tz ? { tz } : {}) };
}

const CC_KEY = "shop-cc";
export function chosenCountry(): string {
  try { return localStorage.getItem(CC_KEY) || ""; } catch { return ""; }
}
export function chooseCountry(cc: string) {
  try { cc ? localStorage.setItem(CC_KEY, cc) : localStorage.removeItem(CC_KEY); } catch { /* المتصفّح يمنع التخزين — يكفي الحدث */ }
  window.dispatchEvent(new CustomEvent(CC_KEY, { detail: cc }));
}

// الدول في قائمة «غيّر الدولة» — الأسماء من المتصفّح بالعربيّة. ZZ = «دولة أخرى» (السعر الأساسيّ).
const CODES = "SA AE KW QA BH OM JO IQ PS LB SY YE EG SD LY TN DZ MA MR SO DJ KM TD SS ER NE ML SN GM GN GW SL CI GH BF BJ TG CM ET KE TZ UG MZ NG AF PK BD IN LK MM ID MY PH BN SG MV TR AZ KZ UZ KG TJ TM BA AL XK GB DE FR NL BE SE NO DK FI AT CH IT ES IE US CA AU NZ".split(" ");
export function countryName(cc: string): string {
  if (cc === "ZZ") return "دولة أخرى";
  try { return new Intl.DisplayNames(["ar"], { type: "region" }).of(cc) || cc; } catch { return cc; }
}
export function countryList(): { code: string; name: string }[] {
  return CODES.map((code) => ({ code, name: countryName(code) })).sort((a, b) => a.name.localeCompare(b.name, "ar")).concat([{ code: "ZZ", name: "دولة أخرى" }]);
}

// تقريب بعملة الزائر (للعرض فقط — الدفع بالريال).
const FX: Record<string, [number, string]> = {
  EG: [13, "جنيه"], MA: [2.5, "درهم"], DZ: [35, "دينار"], TN: [0.82, "دينار"], LY: [1.45, "دينار"],
  JO: [0.19, "دينار"], IQ: [350, "دينار"], AE: [0.98, "درهم"], KW: [0.082, "دينار"], QA: [0.97, "ريال"],
  BH: [0.1, "دينار"], OM: [0.1, "ريال"], MR: [10.6, "أوقية"],
  // عملات مربوطة باليورو/الدولار (ثابتة تقريباً)
  TD: [155, "فرنك"], NE: [155, "فرنك"], ML: [155, "فرنك"], SN: [155, "فرنك"], BF: [155, "فرنك"],
  KM: [115, "فرنك"], DJ: [47, "فرنك"],
};
export function localApprox(price: number, country: string | null): string | null {
  const fx = country && FX[country];
  if (!fx) return null;
  const v = price * fx[0];
  const step = v >= 10000 ? 500 : v >= 1000 ? 50 : v >= 100 ? 5 : 1;
  const n = Math.max(step, Math.round(v / step) * step);
  return `≈ ${n.toLocaleString("ar-SA")} ${fx[1]}`;
}

export function useLive(sku: string, fallback: number) {
  const [state, setState] = useState<{ price: number; active: boolean | null; country: string | null; ip: string | null }>({ price: fallback, active: null, country: null, ip: null });
  const [cc, setCc] = useState("");
  useEffect(() => {
    setCc(chosenCountry());
    const on = (e: Event) => setCc(String((e as CustomEvent).detail || ""));
    window.addEventListener(CC_KEY, on);
    return () => window.removeEventListener(CC_KEY, on);
  }, []);
  useEffect(() => {
    let on = true;
    // ?demo=1 يعرض نموذج الشراء للمعاينة قبل تفعيل الجدول.
    const demo = new URLSearchParams(location.search).get("demo") === "1";
    (demo ? Promise.resolve(null) : fetchLive()).then((m) => {
      if (!on) return;
      if (!m) return setState({ price: fallback, active: true, country: null, ip: null });
      const row = m[sku];
      // الجدول يعرض النشط فقط للعموم: غيابه = غير متاح للشراء الآن.
      if (!row) return setState({ price: fallback, active: false, country: null, ip: null });
      fetchPrice(sku, cc).then((p) => {
        if (!on) return;
        setState({ price: p?.price ?? row.price_sar, active: row.active, country: p?.country || null, ip: p?.ip || null });
      });
    });
    return () => { on = false; };
  }, [sku, fallback, cc]);
  return { ...state, chosen: cc };
}

export default function ShopPrice({ sku, fallback }: { sku: string; fallback: number }) {
  const { price, active } = useLive(sku, fallback);
  // ما نعرض رقماً قبل ما يوصل سعر الزائر (عشان ما يشوف سعرين).
  return <span style={{ visibility: active === null ? "hidden" : undefined }}>{sar(price)}</span>;
}
