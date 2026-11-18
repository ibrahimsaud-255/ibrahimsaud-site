"use client";

// لوحة الشراء: الاسم والبريد والجوال ← الدالّة «shop» تنشئ الطلب بسعر الجدول ← صفحة دفع تلر.
import { useState } from "react";
import { sar, shopCall, type ShopItem } from "@/lib/shop";
import { waHref } from "@/lib/v2";
import { geo, localApprox, useLive } from "./ShopPrice";

export default function BuyPanel({ item }: { item: ShopItem }) {
  const { price, active, country } = useLive(item.sku, item.fallbackPrice);
  const approx = localApprox(price, country);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function check(): boolean {
    setErr(null);
    if (name.trim().length < 2) { setErr("اكتب اسمك"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr("البريد غير صحيح — عليه توصلك الملفّات"); return false; }
    return true;
  }

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !check()) return;
    setBusy(true);
    const r = await shopCall<{ url?: string }>("checkout", { sku: item.sku, name: name.trim(), email: email.trim(), phone: phone.trim(), ...geo() });
    if (r.ok && r.data.url) {
      window.location.assign(r.data.url);
      return;
    }
    setErr(r.data.error || "تعذّر بدء الدفع، جرّب مرّة ثانية");
    setBusy(false);
  }

  const soon = active === false;

  return (
    <div className="v2-shop-buy" id="buy">
      <div className="head">
        <h2>{item.name}</h2>
        <p className="fmt">{item.format}</p>
        <p className="price" aria-live="polite" style={{ visibility: active === null ? "hidden" : undefined }}>{sar(price)}</p>
        {approx && <p className="vat" dir="rtl">{approx} تقريباً — يُخصم بالريال من بطاقتك</p>}
        <p className="vat">السعر نهائيّ — دفعة واحدة، بلا اشتراك.</p>
      </div>

      {soon ? (
        <div className="soon">
          <p>{item.presale ? "المقاعد تُفتح قريباً." : "غير متاح للشراء الآن."} سجّل اهتمامك وأبلغك أوّل ما يفتح.</p>
          <a className="v2-btn v2-btn-primary" href={waHref(`السلام عليكم، أبي أحجز في «${item.name}» أوّل ما يفتح`)} target="_blank" rel="noopener">بلّغني على واتساب</a>
        </div>
      ) : (
        <form onSubmit={buy} noValidate>
          <label>
            <span>الاسم</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={80} />
          </label>
          <label>
            <span>البريد الإلكترونيّ <small>— توصلك عليه الملفّات</small></span>
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required maxLength={120} />
          </label>
          <label>
            <span>الجوال <small>(اختياريّ)</small></span>
            <input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="05xxxxxxxx" maxLength={16} />
          </label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="v2-btn v2-btn-primary" type="submit" disabled={busy || active === null}>
            {busy ? "ننقلك للدفع…" : `ادفع ${sar(price)}`}
          </button>
          <ul className="trust">
            <li>دفع آمن عبر Telr — مدى، فيزا، ماستركارد، Apple Pay</li>
            <li>تنزيل فوريّ بعد الدفع، ورابط طلبك يوصلك على بريدك</li>
            <li>الرابط خاصّ بك ويعمل على أجهزتك فقط</li>
          </ul>
        </form>
      )}
    </div>
  );
}
