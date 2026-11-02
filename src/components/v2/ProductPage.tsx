// صفحة منتج بهندسة صفحات آبل: شريط لاصق، واجهة، أبرز المزايا، التفاصيل، جرّبه، قارن، اطلب، لماذا، أسئلة.
// كلّ حملة جوجل تودّي لوحدة منها. المحتوى في products داخل src/lib/v2.ts.
import Shell from "./Shell";
import Nav from "./Nav";
import LocalNav from "./LocalNav";
import Footer from "./Footer";
import Memoji3D from "./Memoji3D";
import FaceOn from "./FaceOn";
import WindowLight from "./WindowLight";
import Highlights from "./Highlights";
import DemoCards from "./DemoCards";
import CompareTable from "./CompareTable";
import WorksRail from "./WorksRail";
import PackageCards from "./PackageCards";
import WhyCards from "./WhyCards";
import Devices from "./Devices";
import { brands } from "@/lib/site";
import { bookHref, waHref, type Product } from "@/lib/v2";

export default function ProductPage({ p }: { p: Product }) {
  const links = [
    { label: "نظرة عامة", href: "#top" },
    ...(p.demos ? [{ label: "جرّبه", href: "#try" }] : []),
    ...(p.showWorks ? [{ label: "الأعمال", href: "#works" }] : []),
    { label: "قارن", href: "#compare" },
  ];
  return (
    <Shell>
      <Nav sticky={false} />
      <LocalNav name={p.name} links={links} />
      <main id="top">
        {/* ===== الواجهة ===== */}
        <section className="v2-phero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">{p.kicker}</p>
            <h1>{p.name}</h1>
            <p className="headline">{p.headline}</p>
            <p className="sub">{p.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#buy">اطلب</a>
              {p.demos
                ? <a className="v2-btn v2-btn-ghost" href="#try">جرّبه من جوالك</a>
                : <FaceOn face="wink"><a className="v2-btn v2-btn-ghost" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a></FaceOn>}
            </div>
            <p className="from">{p.from}</p>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            {p.heroScreen ? (
              <Devices s={p.heroScreen} className="hero" />
            ) : p.heroPhones ? (
              <div className="phones">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.heroPhones.map((s) => <img key={s} src={s} alt="" />)}
              </div>
            ) : p.heroImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="wide" src={p.heroImg} alt="" />
            ) : (
              <div className="v2-stage"><Memoji3D base={p.memoji} /></div>
            )}
          </div>
        </section>

        {/* ===== أبرز المزايا ===== */}
        <section className="v2-sec alt" id="highlights">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>أبرز المزايا.</h2>
            <Highlights items={p.highlights} />
          </div>
        </section>

        {p.journey && (
          <section className="v2-sec">
            <div className="v2-wrap">
              <h2 className="v2-title" data-rise>{p.journey.title}</h2>
              <div className="v2-journey">
                {p.journey.steps.map((s, i) => (
                  <div key={s.name} className={i === p.journey!.steps.length - 1 ? "on" : ""} data-rise>
                    <span className="n">{s.name}</span>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== التفاصيل ===== */}
        {p.features.map((f, i) => (
          <section key={f.title} className="v2-sec" style={i > 0 || p.journey ? { paddingTop: 0 } : undefined}>
            <div className="v2-wrap">
              <h2 className="v2-title" data-rise>{f.title}</h2>
              <div className="v2-needs">
                {f.items.map((n) => <div key={n.title} data-rise><h3>{n.title}</h3><p>{n.text}</p></div>)}
              </div>
            </div>
          </section>
        ))}

        {/* ===== النظام على الكمبيوتر ===== */}
        {p.screen && (
          <section className="v2-sec v2-screen" style={{ paddingTop: 0 }}>
            <div className="v2-wrap">
              <div className="v2-head center" data-rise>
                <h2>{p.screen.title}</h2>
                <p>{p.screen.text}</p>
                {p.screen.href && <a className="v2-link" href={p.screen.href} target="_blank" rel="noopener">جرّبه الحين <span className="chev">‹</span></a>}
              </div>
              <div data-rise><Devices s={p.screen} /></div>
            </div>
          </section>
        )}

        {/* ===== جرّبه (نسخ العرض الحيّة) ===== */}
        {p.demos && (
          <section className="v2-sec alt" id="try">
            <div className="v2-wrap">
              <div className="v2-head" data-rise>
                <h2>جرّبه بنفسك.</h2>
                <p>نسخة عرض من نظامي اللي أدير فيه شغلي، ببيانات تجريبيّة. افتحها من جوالك وتنقّل بين تطبيقاتها.</p>
              </div>
              <DemoCards />
              <div className="v2-head" data-rise style={{ marginTop: "clamp(64px, 8vw, 100px)" }}>
                <h2>أعمال لعملائي.</h2>
                <p>أنظمة ومواقع بنيتها لجهات اشتغلت معها. هذي نسخ عرض ببيانات تجريبيّة، مو بياناتهم الحقيقيّة: ادخل بأكثر من صلاحيّة وشوف لوحة التحكّم من جوّا.</p>
              </div>
              <DemoCards clients />
            </div>
          </section>
        )}

        {p.showcase && (
          <section className="v2-sec" id={p.showcase.id}>
            <div className="v2-wrap">
              <article className="v2-build dark" data-rise>
                <WindowLight style={{ top: -60, right: -80, width: 700, height: 480 }} />
                <div style={{ position: "relative" }}>
                  <div className="role">{p.showcase.eyebrow}</div>
                  <h3>{p.showcase.title}</h3>
                  <p>{p.showcase.text}</p>
                </div>
                <div className="media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="frames">{p.showcase.imgs.map((s) => <img key={s} src={s} alt="" loading="lazy" />)}</div>
                </div>
              </article>
            </div>
          </section>
        )}

        {p.showWorks && (
          <section className="v2-sec" id="works">
            <div className="v2-wrap">
              <h2 className="v2-title" data-rise>الأعمال.</h2>
              <div className="v2-logos" data-rise style={{ marginBottom: 50 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
              </div>
              <div data-rise><WorksRail /></div>
            </div>
          </section>
        )}

        {/* ===== قارن ===== */}
        <section className="v2-sec alt" id="compare">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أيّ {p.name} يناسبك؟</h2></div>
            <CompareTable c={p.compare} />
          </div>
        </section>

        {/* ===== اطلب ===== */}
        <section className="v2-sec" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>اطلب {p.name}.</h2>
              <p>والمكالمة الأولى مجّانيّة: نشوف وضعك ونختار اللي يناسبه، حتى لو أقلّ من باقة.</p>
            </div>
            <PackageCards items={p.packages} />
            {p.addons && (
              <>
                <h3 className="v2-subtitle" data-rise>وأضف لها.</h3>
                <PackageCards items={p.addons} compact />
              </>
            )}
          </div>
        </section>

        {/* ===== لماذا ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>ليش تشتغل معي؟</h2>
            <WhyCards />
          </div>
        </section>

        <section className="v2-sec">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {p.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>{p.final}</h2>
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
