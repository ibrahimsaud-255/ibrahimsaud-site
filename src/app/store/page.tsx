import type { Metadata } from "next";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import PackageCards from "@/components/v2/PackageCards";
import WhyCards from "@/components/v2/WhyCards";
import { bookHref, pkgs } from "@/lib/v2";

// «الباقات» — كلّ ما يُطلب في صفحة وحدة، مثل متجر آبل: صفّ المنتجات فوق، ثمّ باقات كلّ منتج.

export const metadata: Metadata = {
  title: "الباقات والأسعار — حضور ونَسَق والاستوديو | إبراهيم سعود",
  description: "كلّ الباقات بأسعار واضحة: حضور للبراند الشخصيّ، نَسَق لإدارة الشغل، حلقات بودكاست وأفلام تعريفيّة في الرياض، وهويّة في Claude.",
  alternates: { canonical: "https://ibrahimsaud.com/store/" },
};

const row = [
  { name: "حضور", href: "#hudoor", img: "/v2/memoji/hands_on_hips.png", kind: "memoji" },
  { name: "نَسَق", href: "#nasaq", img: "/v2/shots/demo-nasaq.jpg", kind: "phone" },
  { name: "الاستوديو", href: "#studio", img: "/v2/shots/studio.jpg", kind: "photo" },
  { name: "هويّة", href: "#addons", img: "/v2/shots/saad-quote.jpg", kind: "photo" },
  { name: "حزمة النشر", href: "#addons", img: "/v2/memoji/surprise.png", kind: "memoji" },
];

const groups = [
  { id: "hudoor", title: "حضور.", sub: "البراند الشخصيّ للخبراء.", more: "/brand/", items: [pkgs.hudoor, pkgs.hudoorPro, pkgs.hudoorPlus] },
  { id: "nasaq", title: "نَسَق.", sub: "نظام إدارة على مقاسك.", more: "/systems/", items: [pkgs.session, pkgs.nasaq, pkgs.nasaqPro] },
  { id: "studio", title: "الاستوديو.", sub: "بودكاست وأفلام وإعلانات.", more: "/video/", items: [pkgs.podcast, pkgs.film, pkgs.storeAds] },
  { id: "addons", title: "إضافات.", sub: "تشتغل وحدها أو مع أيّ باقة.", more: "", items: [pkgs.hawiya, pkgs.publish] },
];

export default function Store() {
  return (
    <Shell>
      <Nav />
      <main>
        <section className="v2-store-head">
          <div className="v2-wrap">
            <h1>الباقات. <span>أسهل طريقة تبدأ فيها.</span></h1>
            <a className="help" href={bookHref} target="_blank" rel="noopener">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/memoji/head_tilt.png" alt="" />
              <span><b>تحتاج مساعدة تختار؟</b>كلّمني ٢٠ دقيقة، مجّاناً ‹</span>
            </a>
          </div>
          <div className="v2-wrap">
            <nav className="v2-store-row" aria-label="المنتجات">
              {row.map((r) => (
                <a key={r.name} href={r.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className={`ic ${r.kind}`}><img src={r.img} alt="" /></span>
                  {r.name}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {groups.map((g) => (
          <section key={g.id} className="v2-sec v2-store-group" id={g.id}>
            <div className="v2-wrap">
              <div className="v2-head" data-rise>
                <h2>{g.title} <span className="gray">{g.sub}</span></h2>
                {g.more && <a className="v2-link" href={g.more}>اعرف أكثر <span className="chev">‹</span></a>}
              </div>
              <PackageCards items={g.items} compact={g.items.length < 3} />
            </div>
          </section>
        ))}

        <section className="v2-sec alt">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>ليش تشتغل معي؟</h2>
            <WhyCards />
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
