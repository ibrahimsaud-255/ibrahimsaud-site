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

// أيقونات المنتجات بنمط أيقونات «المكتب» في النظام: مربّع زجاجيّ بتدرّج من أزرق الهويّة ورمز أبيض.
const row: { name: string; href: string; bg: string; glyph: React.ReactNode }[] = [
  { name: "حضور", href: "#hudoor", bg: "linear-gradient(160deg,#6E97FF,#2F66FF)", glyph: <><circle cx="12" cy="8" r="4.5" /><path d="M20 21a8 8 0 0 0-16 0" /></> },
  { name: "نَسَق", href: "#nasaq", bg: "linear-gradient(160deg,#3D74FF,#1636B8)", glyph: <><rect width="7" height="7" x="3" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="3" rx="1.5" /><rect width="7" height="7" x="14" y="14" rx="1.5" /><rect width="7" height="7" x="3" y="14" rx="1.5" /></> },
  { name: "الاستوديو", href: "#studio", bg: "linear-gradient(160deg,#3A3F52,#0B0E17)", glyph: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /></> },
  { name: "هويّة", href: "#addons", bg: "linear-gradient(160deg,#9DB8FF,#4F7BFF)", glyph: <><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2Z" /><circle cx="13.5" cy="6.5" r=".8" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".8" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".8" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".8" fill="currentColor" /></> },
  { name: "حزمة النشر", href: "#addons", bg: "linear-gradient(160deg,#5E7BFF,#3B3FD8)", glyph: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></> },
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
                  <span className="app" style={{ background: r.bg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.glyph}</svg>
                  </span>
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
