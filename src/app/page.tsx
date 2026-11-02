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
import PackageCards from "@/components/v2/PackageCards";
import { brands } from "@/lib/site";
import { bookHref, builds, doors, faqs, hero, manifesto, packages, studio, tools, waHref } from "@/lib/v2";

// الرئيسيّة الجديدة (نوفمبر ٢٠٢٦): صفحة بيع بأسلوب آبل بثلاث أبواب.
// القديمة محفوظة في /classic. المحتوى كلّه في src/lib/v2.ts.

export const metadata: Metadata = {
  title: "إبراهيم سعود — أبني لك الحضور والمحتوى والنظام",
  description:
    "إبراهيم سعود يبني للخبراء والمنشآت والجمعيّات ما يحتاجونه لينموا: براند شخصيّ وموقع يبيع، نظام إدارة على المقاس، واستوديو بودكاست وفيديو في الرياض.",
  alternates: { canonical: "https://ibrahimsaud.com" },
};

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
              <FaceOn face="big_happy"><a className="v2-link" href="#works">شوف أعمالي <span className="chev">‹</span></a></FaceOn>
            </div>
            </div>
            <div className="v2-stage"><Memoji3D base="happy" /></div>
          </div>
        </section>

        <Manifesto text={manifesto} />

        {/* ===== الأبواب الثلاثة ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="services">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>وش تحتاج؟</h2>
              <p>ثلاث طرق نشتغل فيها مع بعض. اختر الأقرب لك، والباقي نرتّبه في المكالمة.</p>
            </div>
            <div className="v2-doors">
              {doors.map((d) => (
                <a key={d.href} href={d.href} className={`v2-door ${d.tone === "dark" ? "dark" : ""}`} data-rise>
                  <span className="eb">{d.eyebrow}</span>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                  <span className="v2-link">اعرف أكثر <span className="chev">‹</span></span>
                  <div className="art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={d.imgKind === "memoji" ? "memoji" : "shot"} src={d.img} alt="" loading="lazy" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== أشياء بنيتها ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="builds">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>أشياء بنيتها.</h2>
              <p>ما أبيع شي ما جرّبته. هذي منتجات حقيقيّة تشتغل اليوم.</p>
            </div>
            {builds.map((b, i) => (
              <article key={b.name} className={`v2-build ${i === 1 ? "dark" : ""}`} data-rise>
                {i === 1 && <WindowLight style={{ top: -60, right: -80, width: 700, height: 480 }} />}
                <div style={{ position: "relative" }}>
                  <div className="role">{b.role}</div>
                  <h3>{b.name}</h3>
                  <p>{b.line}</p>
                  <a className="v2-link" href={b.href} {...(b.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>{b.cta} <span className="chev">‹</span></a>
                </div>
                <div className="media">
                  {/* eslint-disable @next/next/no-img-element */}
                  {b.kind === "phones" && b.imgs.map((src) => <img key={src} className="phone" src={src} alt="" loading="lazy" />)}
                  {b.kind === "screens" && <div className="screens">{b.imgs.map((src) => <img key={src} className="screen" src={src} alt="" loading="lazy" />)}</div>}
                  {b.kind === "frames" && <div className="frames">{b.imgs.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}</div>}
                  {/* eslint-enable @next/next/no-img-element */}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== العملاء ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }}>
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><p>جهات وشركات اشتغلت معها</p></div>
            <div className="v2-logos" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
            </div>
          </div>
        </section>

        {/* ===== الأعمال ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="works">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>الأعمال.</h2>
              <p>أفلام رسميّة وحملات وبودكاست وتغطيات، من الفكرة إلى التسليم.</p>
            </div>
            <div data-rise><WorksRail /></div>
          </div>
        </section>

        {/* ===== الباقات ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="packages">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>أسعار واضحة.</h2>
              <p>والمكالمة الأولى مجّانيّة: نشوف وضعك ونختار اللي يناسبه، حتى لو أقلّ من باقة.</p>
            </div>
            <PackageCards items={packages} />
          </div>
        </section>

        {/* ===== الاستوديو ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="studio">
          <div className="v2-wrap">
            <div className="v2-studio" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/shots/studio.jpg" alt="استوديو إبراهيم سعود في الرياض" loading="lazy" />
              <div className="in">
                <div>
                  <h2>{studio.title}</h2>
                  <p>{studio.sub}</p>
                </div>
                <div className="v2-rates">
                  {studio.rates.map((r) => <div key={r.label}><b>{r.price}</b><span>{r.label} · ريال</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== الأدوات ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }}>
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2 style={{ fontSize: "clamp(30px,4vw,44px)" }}>الأدوات اللي أشتغل بها</h2></div>
            <div className="v2-tools" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {tools.map((t) => <div key={t.name}><img src={t.img} alt="" loading="lazy" />{t.name}</div>)}
            </div>
          </div>
        </section>

        {/* ===== الأسئلة ===== */}
        <section className="v2-section" style={{ paddingTop: 0 }} id="faq">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        {/* ===== الختام ===== */}
        <section className="v2-section v2-final">
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
