import type { Metadata } from "next";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import FaceOn from "@/components/v2/FaceOn";
import WindowLight from "@/components/v2/WindowLight";
import Manifesto from "@/components/v2/Manifesto";
import WorksRail from "@/components/v2/WorksRail";
import { brands } from "@/lib/site";
import { bookHref, hero, manifesto, products, studio, tools, waHref } from "@/lib/v2";

// الرئيسيّة بهندسة apple.com: واجهة إبراهيم، ثمّ لوحة كاملة العرض لكلّ منتج، ثمّ شبكة لوحات أصغر.
// القديمة محفوظة في /classic. المحتوى كلّه في src/lib/v2.ts.

export const metadata: Metadata = {
  title: "إبراهيم سعود — أبني لك الحضور والمحتوى والنظام",
  description:
    "إبراهيم سعود يبني للخبراء والمنشآت والجمعيّات ما يحتاجونه لينموا: حضور شخصيّ وموقع يبيع، ديوان لإدارة الشغل، واستوديو بودكاست وفيديو في الرياض.",
  alternates: { canonical: "https://ibrahimsaud.com" },
};

const { brand, systems, video } = products;

export default function Home() {
  return (
    <Shell>
      <Nav />
      <main>
        {/* ===== الواجهة ===== */}
        <section className="v2-hero">
          <WindowLight style={{ top: 20, left: "-6%", width: 980, height: 660 }} />
          <div className="v2-wrap v2-hero-grid" style={{ position: "relative" }}>
            <div>
              <div className="v2-eyebrow">{hero.eyebrow}</div>
              <h1><span>{hero.title[0]}</span><span className="blue">{hero.title[1]}</span></h1>
              <p className="sub">{hero.sub}</p>
              <div className="ctas">
                <FaceOn face="wink"><a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة ٢٠ دقيقة</a></FaceOn>
                <FaceOn face="big_happy"><a className="v2-btn v2-btn-ghost" href="/store/">شوف الباقات</a></FaceOn>
              </div>
            </div>
            <div className="v2-stage"><Memoji3D base="happy" /></div>
          </div>
        </section>

        {/* ===== لوحات المنتجات ===== */}
        <div className="v2-tiles">
          <section className="v2-tile" data-rise>
            <h2>{brand.name}</h2>
            <p className="line">{brand.headline}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href={brand.href}>اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href={`${brand.href}#buy`}>اطلب</a>
            </div>
            <div className="art memoji">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/memoji/hands_on_hips.png" alt="" loading="lazy" />
            </div>
          </section>

          <section className="v2-tile dark" data-rise>
            <WindowLight style={{ top: -40, left: "50%", width: 900, height: 560, marginLeft: -450 }} />
            <h2>{systems.name}</h2>
            <p className="line">{systems.headline}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href={systems.href}>اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href={`${systems.href}#try`}>جرّبه من جوالك</a>
            </div>
            <div className="art phones">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {systems.heroPhones!.map((s) => <img key={s} src={s} alt="" loading="lazy" />)}
            </div>
          </section>

          <section className="v2-tile photo" data-rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src="/v2/shots/studio.jpg" alt="استوديو إبراهيم سعود في الرياض" loading="lazy" />
            <h2>{video.name}</h2>
            <p className="line">{video.headline}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href={video.href}>اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href={`${video.href}#buy`}>اطلب</a>
            </div>
          </section>

          <div className="v2-tile-grid">
            <section className="v2-tile half dark" data-rise>
              <h2>هويّة</h2>
              <p className="line">هويّتك. داخل Claude.</p>
              <div className="ctas">
                <a className="v2-link" href="/brand/#identity">اعرف أكثر <span className="chev">‹</span></a>
                <a className="v2-link" href="/store/#addons">اطلب <span className="chev">‹</span></a>
              </div>
              <div className="art frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/v2/shots/saad-quote.jpg" alt="" loading="lazy" />
              </div>
            </section>

            <section className="v2-tile half" data-rise>
              <h2>حزمة النشر</h2>
              <p className="line">فكرة وحدة. كلّ المنصّات.</p>
              <div className="ctas">
                <a className="v2-link" href="/store/#addons">اعرف أكثر <span className="chev">‹</span></a>
              </div>
              <div className="art memoji">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/v2/memoji/surprise.png" alt="" loading="lazy" />
              </div>
            </section>

            <section className="v2-tile half" data-rise>
              <h2>حروف ودروس</h2>
              <p className="line">منصّة بنيتها بنفسي. على الويب وفي متجر آبل.</p>
              <div className="ctas">
                <a className="v2-link" href="https://huroofduroos.com" target="_blank" rel="noopener">زُر المنصّة <span className="chev">‹</span></a>
              </div>
              <div className="art phones two">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {["/v2/shots/huroof-home.jpg", "/v2/shots/huroof-moon3d.jpg"].map((s) => <img key={s} src={s} alt="" loading="lazy" />)}
              </div>
            </section>

            <section className="v2-tile half dark" id="studio" data-rise>
              <h2>{studio.title}</h2>
              <p className="line">استوديو بودكاست في الرياض، بالساعة أو باليوم.</p>
              <div className="ctas">
                <a className="v2-link" href={waHref("السلام عليكم، أبي أحجز الاستوديو")} target="_blank" rel="noopener">احجز الاستوديو <span className="chev">‹</span></a>
              </div>
              <div className="v2-rates">
                {studio.rates.map((r) => <div key={r.label}><b>{r.price}</b><span>{r.label} · ريال</span></div>)}
              </div>
            </section>
          </div>
        </div>

        <Manifesto text={manifesto} />

        {/* ===== الأعمال ===== */}
        <section className="v2-sec" style={{ paddingTop: 0 }} id="works">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>الأعمال.</h2>
              <p>أفلام رسميّة وحملات وبودكاست وتغطيات، من الفكرة إلى التسليم.</p>
            </div>
            <div data-rise><WorksRail /></div>
          </div>
        </section>

        <section className="v2-sec" style={{ paddingTop: 0 }}>
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><p>جهات وشركات اشتغلت معها</p></div>
            <div className="v2-logos" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
            </div>
          </div>
        </section>

        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>الأدوات اللي أشتغل بها.</h2>
              <p>من الكاميرا إلى الذكاء الاصطناعيّ إلى الثلاثيّ الأبعاد.</p>
            </div>
            <div className="v2-tools" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {tools.map((t) => <div key={t.name}><img src={t.img} alt="" loading="lazy" />{t.name}</div>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>تبي نبنيها <span style={{ color: "var(--blue)" }}>لك</span>؟</h2>
            <p>مكالمة ٢٠ دقيقة، مجّانيّة، وتطلع منها بخطّة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
              <a className="v2-link" href={waHref()} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
