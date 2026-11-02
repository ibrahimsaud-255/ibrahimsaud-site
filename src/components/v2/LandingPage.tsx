import Shell from "./Shell";
import Nav from "./Nav";
import Footer from "./Footer";
import Memoji3D from "./Memoji3D";
import FaceOn from "./FaceOn";
import WindowLight from "./WindowLight";
import WorksRail from "./WorksRail";
import PackageCards from "./PackageCards";
import { brands } from "@/lib/site";
import { bookHref, waHref, type Landing } from "@/lib/v2";

// صفحة هبوط لشخصيّة وحدة (كلّ حملة جوجل تودّي لوحدة منها).
export default function LandingPage({ d }: { d: Landing }) {
  return (
    <Shell>
      <Nav />
      <main>
        <section className="v2-hero landing">
          <WindowLight style={{ top: 20, left: "-6%", width: 980, height: 660 }} />
          <div className="v2-wrap v2-hero-grid" style={{ position: "relative" }}>
            <div>
              <div className="v2-eyebrow">{d.eyebrow}</div>
              <h1><span>{d.title[0]}</span><span className="blue">{d.title[1]}</span></h1>
              <p className="sub">{d.sub}</p>
              <div className="ctas">
                <FaceOn face="wink"><a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة ٢٠ دقيقة</a></FaceOn>
                <a className="v2-link" href="#packages">الباقات والأسعار <span className="chev">‹</span></a>
              </div>
            </div>
            <div className="v2-stage"><Memoji3D base={d.memoji} /></div>
          </div>
        </section>

        {d.heroShot && (
          <section className="v2-wrap" style={{ marginTop: -20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="v2-heroshot" src={d.heroShot} alt="" data-rise />
          </section>
        )}

        {d.journey && (
          <section className="v2-section">
            <div className="v2-wrap">
              <div className="v2-head" data-rise><h2>{d.journey.title}</h2></div>
              <div className="v2-journey">
                {d.journey.steps.map((s, i) => (
                  <div key={s.name} className={i === d.journey!.steps.length - 1 ? "on" : ""} data-rise>
                    <span className="n">{s.name}</span>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="v2-section" style={d.journey ? { paddingTop: 0 } : undefined}>
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>{d.needsTitle}</h2></div>
            <div className="v2-needs">
              {d.needs.map((n) => <div key={n.title} data-rise><h3>{n.title}</h3><p>{n.text}</p></div>)}
            </div>
            {d.needsAlt && (
              <>
                <div className="v2-head" data-rise style={{ marginTop: "clamp(60px,8vw,110px)" }}><h2>{d.needsAlt.title}</h2></div>
                <div className="v2-needs">
                  {d.needsAlt.items.map((n) => <div key={n.title} data-rise><h3>{n.title}</h3><p>{n.text}</p></div>)}
                </div>
              </>
            )}
          </div>
        </section>

        {d.showcase && (
          <section className="v2-section" style={{ paddingTop: 0 }} id={d.showcase.id}>
            <div className="v2-wrap">
              <article className="v2-build dark" data-rise>
                <WindowLight style={{ top: -60, right: -80, width: 700, height: 480 }} />
                <div style={{ position: "relative" }}>
                  <div className="role">{d.showcase.eyebrow}</div>
                  <h3>{d.showcase.title}</h3>
                  <p>{d.showcase.text}</p>
                </div>
                <div className="media">
                  {/* eslint-disable @next/next/no-img-element */}
                  {d.showcase.kind === "frames"
                    ? <div className="frames">{d.showcase.imgs.map((s) => <img key={s} src={s} alt="" loading="lazy" />)}</div>
                    : <div className="screens">{d.showcase.imgs.map((s) => <img key={s} className="screen" src={s} alt="" loading="lazy" />)}</div>}
                  {/* eslint-enable @next/next/no-img-element */}
                </div>
              </article>
            </div>
          </section>
        )}

        {d.showWorks && (
          <section className="v2-section" style={{ paddingTop: 0 }} id="works">
            <div className="v2-wrap">
              <div className="v2-head" data-rise><h2>الأعمال.</h2></div>
              <div className="v2-logos" data-rise style={{ marginBottom: 50 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
              </div>
              <div data-rise><WorksRail /></div>
            </div>
          </section>
        )}

        <section className="v2-section" style={{ paddingTop: 0 }} id="packages">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>أسعار واضحة.</h2>
              <p>والمكالمة الأولى مجّانيّة: نشوف وضعك ونختار اللي يناسبه.</p>
            </div>
            <PackageCards items={d.packages} />
          </div>
        </section>

        <section className="v2-section" style={{ paddingTop: 0 }}>
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {d.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-section v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>{d.final}</h2>
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
