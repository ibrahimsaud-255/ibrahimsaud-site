"use client";

// السعر الحيّ من shop_products — يبدأ بالاحتياطيّ ثمّ يُستبدل بما يُخصم فعلاً.
import { useEffect, useState } from "react";
import { fetchLive, sar } from "@/lib/shop";

export function useLive(sku: string, fallback: number) {
  const [state, setState] = useState<{ price: number; active: boolean | null }>({ price: fallback, active: null });
  useEffect(() => {
    let on = true;
    // ?demo=1 يعرض نموذج الشراء للمعاينة قبل تفعيل الجدول.
    const demo = new URLSearchParams(location.search).get("demo") === "1";
    (demo ? Promise.resolve(null) : fetchLive()).then((m) => {
      if (!on) return;
      if (!m) return setState({ price: fallback, active: true });
      const row = m[sku];
      // الجدول يعرض النشط فقط للعموم: غيابه = غير متاح للشراء الآن.
      setState(row ? { price: row.price_sar, active: row.active } : { price: fallback, active: false });
    });
    return () => { on = false; };
  }, [sku, fallback]);
  return state;
}

export default function ShopPrice({ sku, fallback }: { sku: string; fallback: number }) {
  const { price } = useLive(sku, fallback);
  return <>{sar(price)}</>;
}
