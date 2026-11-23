"use client";

// لوحة الشراء: الاسم والبريد والجوال ← الدالّة «shop» تنشئ الطلب بسعر الجدول ← صفحة دفع تلر.
// النصوص من shopUi حسب لغة المنتج (عربيّ افتراضيّاً، روسيّ لنسخة روسيا).
import { useState } from "react";
import { shopCall, type ShopItem } from "@/lib/shop";
import { money, shopT, usdApprox } from "@/lib/shopUi";
import { waHref } from "@/lib/v2";
import { geo, localApprox, useLive } from "./ShopPrice";

export default function BuyPanel({ item }: { item: ShopItem }) {
  const T = shopT(item.lang);
  const foreign = !!item.lang && item.lang !== "ar";
  const fmt = (n: number) => money(n, item.lang);
  const { price, active, country } = useLive(item.sku, item.fallbackPrice);
  const approx = foreign ? usdApprox(price) : localApprox(price, country);
  const saleOn = !!item.sale && Date.now() < Date.parse(item.sale.until);
  const was = saleOn ? item.sale!.was[price] : undefined;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function check(): boolean {
    setErr(null);
    if (name.trim().length < 2) { setErr(T.errName); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr(T.errEmail); return false; }
    return true;
  }

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !check()) return;
    setBusy(true);
    // صفحة الشكر (عودة تلر) تعرض لغة المشتري قبل ما يوصل الطلب
    try { if (foreign) localStorage.setItem("shop-lang", item.lang!); else localStorage.removeItem("shop-lang"); } catch { /* تخزين مقفل */ }
    const r = await shopCall<{ url?: string }>("checkout", { sku: item.sku, lang: item.lang || "ar", name: name.trim(), email: email.trim(), phone: phone.trim(), ...geo() });
    if (r.ok && r.data.url) {
      window.location.assign(r.data.url);
      return;
    }
    // رسائل الخادم عربيّة — في النسخ الأخرى نعرض رسالة عامّة بلغتها
    setErr((!foreign && r.data.error) || T.errStart);
    setBusy(false);
  }

  const soon = active === false;

  return (
    <div className="v2-shop-buy" id="buy">
      <div className="head">
        <h2>{item.name}</h2>
        <p className="fmt">{item.format}</p>
        {item.buyNote && <p className="ios-note">{item.buyNote}</p>}
        <div style={{ visibility: active === null ? "hidden" : undefined }}>
          {was && was > price && <p className="sale"><span>{item.sale!.label}</span><s>{fmt(was)}</s></p>}
          <p className="price" aria-live="polite">{fmt(price)}</p>
          {was && was > price && <p className="vat">{T.saleEnds(fmt(was))}</p>}
        </div>
        {approx && <p className="vat" dir={T.dir}>{approx} {T.approxTail}</p>}
        <p className="vat">{T.oneTime}</p>
      </div>

      {soon ? (
        <div className="soon">
          <p>{item.presale ? T.soonSeats : T.soonNA}{T.soonTail}</p>
          <a className="v2-btn v2-btn-primary" href={waHref(T.soonWa(item.name))} target="_blank" rel="noopener">{T.soonBtn}</a>
        </div>
      ) : (
        <form onSubmit={buy} noValidate>
          <label>
            <span>{T.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={80} />
          </label>
          <label>
            <span>{T.email} <small>{T.emailNote}</small></span>
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required maxLength={120} />
          </label>
          <label>
            <span>{T.phone} <small>{T.optional}</small></span>
            <input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder={T.phonePh} maxLength={16} />
          </label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="v2-btn v2-btn-primary" type="submit" disabled={busy || active === null}>
            {busy ? T.paying : T.pay(fmt(price))}
          </button>
          <ul className="trust">
            {T.trust.map((t) => <li key={t}>{t}</li>)}
          </ul>
          {item.sku === "lessons-broadcast" && <p className="kit-link">مو جاهز تشتري الحين؟ <a className="v2-link" href="/lessons-broadcast/kit/" style={{ fontSize: 14 }}>خذ قائمة تجهيز المسجد للبث مجّاناً</a></p>}
          {!foreign && <p className="owned">اشتريته قبل؟ <a className="v2-link" href="/account/" style={{ fontSize: 14 }}>نزّل آخر إصدار من حسابي</a></p>}
        </form>
      )}
    </div>
  );
}
