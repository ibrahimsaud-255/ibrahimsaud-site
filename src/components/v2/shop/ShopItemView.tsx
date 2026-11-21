import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import WindowLight from "@/components/v2/WindowLight";
import ShopPrice from "@/components/v2/shop/ShopPrice";
import BuyPanel from "@/components/v2/shop/BuyPanel";
import { PlatformCards } from "@/components/v2/shop/Platforms";
import type { ShopItem } from "@/lib/shop";
import { shopT } from "@/lib/shopUi";
import { LANG_NAMES, langPath } from "@/lib/shopIntl";

// صفحة المنتج كاملة — تُستخدم في /shop/<slug>/ وفي الصفحة العامّة /lessons-broadcast/.
// أيقونات المتطلّبات بأسلوب آبل: خطّ رفيع بسيط لكل بند
const SPEC_ICONS: [RegExp, string][] = [
  [/النظام|Система|System/, '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'],
  [/المعالج|Процессор|Processor/, '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'],
  [/الذاكرة|Память|Memory/, '<rect x="2.5" y="7" width="19" height="10" rx="1.5"/><path d="M6 10.5v3M9.5 10.5v3M13 10.5v3M16.5 10.5v3M5 17v2.5M19 17v2.5"/>'],
  [/الإنترنت|Интернет|Internet/, '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/>'],
  [/المساحة|Место|Storage/, '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 14h18"/><circle cx="17" cy="16.5" r=".9" fill="currentColor"/>'],
  [/الكاميرا|Камера|Camera/, '<rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/>'],
  [/نصيحة|Совет|Tip/, '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'],
];
function SpecIcon({ label }: { label: string }) {
  const d = (SPEC_ICONS.find(([r]) => r.test(label)) || SPEC_ICONS[0])[1];
  return <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: d }} />;
}
// promo: قسم اختياريّ قبل الأسئلة (مثل «تعمل في جمعيّة؟» في صفحة بث الدروس العربيّة).
export default function ShopItemView({ item: i, promo }: { item: ShopItem; promo?: React.ReactNode }) {
  const T = shopT(i.lang);
  const foreign = !!i.lang && i.lang !== "ar";
  return (
    <Shell dir={T.dir} lang={i.lang}>
      {!foreign && <Nav sticky={false} />}
      <LocalNav name={i.name} buy={T.navBuy} links={[{ label: T.navOverview, href: "#top" }, { label: T.navInside, href: "#inside" }, ...(i.specs ? [{ label: T.navSpecs, href: "#specs" }] : []), { label: T.navFaq, href: "#faq" }]} />
      <main id="top">
        <section className="v2-phero v2-shop-hero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            {i.iconImg ? <img className="art-img" src={i.iconImg} alt="" width={112} height={112} /> : <span className="art" aria-hidden>{i.icon}</span>}
            <p className="kicker">{i.kicker}</p>
            {i.logo
              ? <h1 className="v2-shop-name v2-shop-logo"><img src={i.logo} alt={i.name} width={900} height={418} /></h1>
              : <h1 className="v2-shop-name">{i.name}</h1>}
            <p className="headline">{i.tagline}</p>
            <p className="sub">{i.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#buy">{i.presale ? T.reserve : T.buyNow}</a>
              <a className="v2-btn v2-btn-ghost" href="#inside">{T.whatsInside}</a>
            </div>
            <p className="from"><ShopPrice sku={i.sku} fallback={i.fallbackPrice} lang={i.lang} /> · {i.format}</p>
          </div>
          {i.shots && (
            <div className="v2-wrap v2-shop-shots">
              {i.shots.map((x) => <img key={x.src} src={x.src} alt={x.alt} loading="lazy" />)}
            </div>
          )}
        </section>

        {i.promo && (
          <section className="v2-sec alt" id="promo">
            <div className="v2-wrap v2-shop-promo">
              <div className="phone"><video src={i.promo.src} poster={i.promo.poster} controls playsInline preload="none" /></div>
              <div className="tx">
                <h2 className="v2-title">{i.promo.title}</h2>
                <p>{i.promo.text}</p>
              </div>
            </div>
          </section>
        )}

        {i.platforms && (
          <section className="v2-sec" id="platforms">
            <div className="v2-wrap">
              <h2 className="v2-title" style={{ textAlign: "center" }}>{T.onDevices}</h2>
              <PlatformCards item={i} />
            </div>
          </section>
        )}

        <section className="v2-sec alt" id="inside">
          <div className="v2-wrap">
            <h2 className="v2-title">{T.inside}</h2>
            <div className="v2-shop-inside">
              {i.inside.map((x) => (
                <div key={x.title}>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec">
          <div className="v2-wrap v2-shop-two">
            <div>
              <h2 className="v2-subtitle">{T.forWho}</h2>
              <ul className="v2-shop-list">{i.forWho.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
            <div>
              <h2 className="v2-subtitle">{T.after}</h2>
              <ol className="v2-shop-steps">{i.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
          </div>
        </section>

        {i.specs && (
          <section className="v2-sec" id="specs">
            <div className="v2-wrap">
              <h2 className="v2-title" style={{ textAlign: "center" }}>{T.specs}</h2>
              <div className="v2-shop-specs">
                {i.specs.map((g) => (
                  <div key={g.title}>
                    <h3>{g.title}</h3>
                    <dl>{g.rows.map(([k, v]) => <div key={k}><SpecIcon label={k} /><span><dt>{k}</dt><dd>{v}</dd></span></div>)}</dl>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {i.seo && (
          <section className="v2-sec" id="about">
            <div className="v2-wrap v2-shop-seo">
              <h2 className="v2-title">{i.seo.title}</h2>
              {i.seo.paras.map((t) => <p key={t}>{t}</p>)}
            </div>
          </section>
        )}

        <section className="v2-sec alt">
          <div className="v2-wrap">
            <BuyPanel item={i} />
          </div>
        </section>

        {promo}

        <section className="v2-sec" id="faq">
          <div className="v2-wrap">
            <h2 className="v2-title" style={{ textAlign: "center" }}>{T.faq}</h2>
            <div className="v2-faq">
              {i.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <p className="v2-shop-terms">
              {T.terms}
              {i.platforms && T.obs}
            </p>
          </div>
        </section>
      </main>
      {foreign ? (
        <footer className="v2-shop-ru-foot">
          <div className="v2-wrap">
            <span>© Ibrahim Saud · ibrahimsaud.com</span>
            {/* مبدّل اللغة: كل لغات الصفحة بأسمائها */}
            <nav className="langs" aria-label="Languages">
              {Object.entries(LANG_NAMES).map(([code, label]) => (
                <a key={code} href={langPath(code)} lang={code} aria-current={code === i.lang ? "page" : undefined}>{label}</a>
              ))}
            </nav>
          </div>
        </footer>
      ) : <Footer />}
    </Shell>
  );
}
