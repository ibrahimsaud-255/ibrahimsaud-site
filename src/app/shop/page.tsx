import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import ShopPrice from "@/components/v2/shop/ShopPrice";
import OwnedStrip from "@/components/v2/shop/OwnedStrip";
import ShopSoon from "@/components/v2/shop/ShopSoon";
import { shopItems } from "@/lib/shop";

// المتجر الرقميّ — منتجات إبراهيم: المتوفّر الآن (بطاقة ← صفحته العامّة إن وُجدت)، و«قريباً» بتسجيل اهتمام.
// noindex كما هو (الصفحات العامّة للمنتجات هي اللي تُفهرَس)، ورابطه في الفوتر و«حسابي» للمشترين.
export const metadata: Metadata = {
  title: "المتجر — إبراهيم سعود",
  description: "برامج ودورات رقميّة لنشر العلم — تنزيل فوريّ بعد الدفع، وآخر نسخة دائماً من «حسابي».",
  robots: { index: false, follow: false },
};

const live = shopItems.filter((i) => !i.hidden && !i.presale);

export default function Shop() {
  return (
    <Shell>
      <Nav />
      <main>
        <section className="v2-shop-head">
          <div className="v2-wrap">
            <h1>المتجر. <span>برامج ودورات لنشر العلم.</span></h1>
            <p>تدفع مرّة، وتنزّل فوراً — وآخر نسخة دائماً في «حسابي».</p>
            <OwnedStrip />
          </div>
        </section>
        <section className="v2-shop-grid-sec v2-shop-live" aria-labelledby="live-h">
          <div className="v2-wrap">
            <h2 id="live-h" className="v2-shop-sec-h">متوفّر الآن</h2>
            <div className="v2-shop-grid">
              {live.map((i) => (
                <a key={i.sku} href={i.publicPath || `/shop/${i.slug}/`} className="v2-shop-card">
                  {i.iconImg ? <img className="art-img" src={i.iconImg} alt="" width={72} height={72} /> : <span className="art" aria-hidden>{i.icon}</span>}
                  <span className="kicker">{i.kicker}</span>
                  <h2>{i.name}</h2>
                  <p>{i.tagline}</p>
                  <span className="foot">
                    <b><ShopPrice sku={i.sku} fallback={i.fallbackPrice} /></b>
                    <span className="v2-link">التفاصيل والشراء <span className="chev">‹</span></span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section className="v2-sec alt" id="soon" aria-labelledby="soon-h">
          <div className="v2-wrap">
            <h2 id="soon-h" className="v2-title">قريباً.</h2>
            <p className="v2-soon-lead">إذا مهتمّ سجّل إيميلك ونبلّغك أوّل ما ينزل — بدون التزام.</p>
            <ShopSoon source="shop" />
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
