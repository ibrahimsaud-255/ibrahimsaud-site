import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import ShopPrice from "@/components/v2/shop/ShopPrice";
import { shopItems } from "@/lib/shop";

// المتجر الرقميّ — منتجات رقميّة فقط (حزم، ملفّات، دورات). غير معلَن: لا في القائمة ولا في خريطة الموقع.
export const metadata: Metadata = {
  title: "المتجر — إبراهيم سعود",
  description: "أدوات وحزم ودورات رقميّة جاهزة — تنزيل فوريّ بعد الدفع.",
  robots: { index: false, follow: false },
};

export default function Shop() {
  return (
    <Shell>
      <Nav />
      <main>
        <section className="v2-shop-head">
          <div className="v2-wrap">
            <h1>المتجر. <span>أدوات جاهزة تشتغل من اليوم.</span></h1>
            <p>حلول صغيرة لمشاكل حقيقيّة — تدفع مرّة، وتنزّل فوراً.</p>
          </div>
        </section>
        <section className="v2-shop-grid-sec">
          <div className="v2-wrap">
            <div className="v2-shop-grid">
              {shopItems.map((i) => (
                <a key={i.sku} href={`/shop/${i.slug}/`} className="v2-shop-card">
                  {i.iconImg ? <img className="art-img" src={i.iconImg} alt="" width={72} height={72} /> : <span className="art" aria-hidden>{i.icon}</span>}
                  <span className="kicker">{i.kicker}</span>
                  <h2>{i.name}</h2>
                  <p>{i.tagline}</p>
                  <span className="foot">
                    <b><ShopPrice sku={i.sku} fallback={i.fallbackPrice} /></b>
                    <span className="v2-link">{i.presale ? "التفاصيل" : "اشترِ"} <span className="chev">‹</span></span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
