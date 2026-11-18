"use client";

// السعر الحيّ من shop_products — يبدأ بالاحتياطيّ ثمّ يُستبدل بما يُخصم فعلاً.
import { useEffect, useState } from "react";
import { fetchLive, sar, shopCall } from "@/lib/shop";

// سعر الزائر يحدّده الخادم تلقائيّاً حسب بلده (نفس ما يُخصم فعلاً) — بلا أيّ إشارة في الصفحة.
// البلد من المنطقة الزمنيّة للجهاز (لا يغيّرها الـVPN) ثمّ الـIP. بلد البطاقة يُطابَق بعد الدفع في الخادم.
type PriceRes = { price?: number; country?: string };
const priceCache: Record<string, Promise<PriceRes | null>> = {};
function fetchPrice(sku: string) {
  return (priceCache[sku] ??= shopCall<PriceRes>("price", { sku, ...geo() }).then((r) => (r.ok ? r.data : null)));
}
export function geo(): { tz?: string } {
  try { localStorage.removeItem("shop-cc"); } catch { /* اختيار قديم من نسخة سابقة */ }
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* متصفّح قديم */ }
  return tz ? { tz } : {};
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
  const [state, setState] = useState<{ price: number; active: boolean | null; country: string | null }>({ price: fallback, active: null, country: null });
  useEffect(() => {
    let on = true;
    // ?demo=1 يعرض نموذج الشراء للمعاينة قبل تفعيل الجدول.
    const demo = new URLSearchParams(location.search).get("demo") === "1";
    (demo ? Promise.resolve(null) : fetchLive()).then((m) => {
      if (!on) return;
      if (!m) return setState({ price: fallback, active: true, country: null });
      const row = m[sku];
      // الجدول يعرض النشط فقط للعموم: غيابه = غير متاح للشراء الآن.
      if (!row) return setState({ price: fallback, active: false, country: null });
      fetchPrice(sku).then((p) => {
        if (!on) return;
        setState({ price: p?.price ?? row.price_sar, active: row.active, country: p?.country || null });
      });
    });
    return () => { on = false; };
  }, [sku, fallback]);
  return state;
}

export default function ShopPrice({ sku, fallback }: { sku: string; fallback: number }) {
  const { price, active } = useLive(sku, fallback);
  // ما نعرض رقماً قبل ما يوصل سعر الزائر (عشان ما يشوف سعرين).
  return <span style={{ visibility: active === null ? "hidden" : undefined }}>{sar(price)}</span>;
}
