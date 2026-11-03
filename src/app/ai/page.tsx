import type { Metadata } from "next";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import QuoteForm from "@/components/v2/QuoteForm";
import WhyCards from "@/components/v2/WhyCards";
import PackageCards from "@/components/v2/PackageCards";
import { aiPage as a, bookHref, pkgs, waHref } from "@/lib/v2";

// الذكاء الاصطناعي: ورش وتدريب واستشارات — الخدمة الأكثر طلباً، وأوّل باب في الموقع.
// «اطلب» هنا يودّي لنموذج طلب الورشة (#buy في الشريط اللاصق).

export const metadata: Metadata = { ...a.meta, alternates: { canonical: "https://ibrahimsaud.com/ai/" } };

export default function AiPage() {
  return (
    <Shell>
      <Nav sticky={false} />
      <LocalNav name={a.name} links={[{ label: "نظرة عامة", href: "#top" }, { label: "الخدمات", href: "#services" }, { label: "الورش", href: "#workshop" }, { label: "ورش قدّمتها", href: "#past" }]} />
      <main id="top">
        <section className="v2-phero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">{a.kicker}</p>
            <h1 className="smaller">{a.name}</h1>
            <p className="headline">{a.headline}</p>
            <p className="sub">{a.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#request">اطلب ورشة لفريقك</a>
              <a className="v2-btn v2-btn-ghost" href="#past">شوف ورش قدّمتها</a>
            </div>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wide" src={a.workshop.imgs[0]} alt="غلاف ورشة «لا تدرسه… جرّبه»" />
          </div>
        </section>

        <section className="v2-sec alt" id="services">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>وش أقدّم.</h2>
            <div className="v2-why three">
              {a.services.map((s) => (
                <div key={s.title} data-rise>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/v2/memoji/${s.memoji}.png`} alt="" loading="lazy" />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec" id="workshop">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <span className="v2-eyebrow">{a.workshop.eyebrow}</span>
              <h2>{a.workshop.title}</h2>
              <p>{a.workshop.text}</p>
            </div>
            <div className="v2-slides" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.workshop.imgs.slice(1).map((s) => <img key={s} src={s} alt="" loading="lazy" />)}
            </div>
          </div>
        </section>

        <section className="v2-sec alt" id="past">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>ورش قدّمتها.</h2>
            {a.past.map((w) => (
              <div key={w.title} className="v2-past" data-rise>
                <div className="photos">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {w.imgs.map((src, i) => <img key={src} src={src} alt={i === 0 ? w.title : ""} loading="lazy" />)}
                </div>
                <div className="body">
                  <span className="v2-eyebrow">{w.host}</span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                  {w.stats.length > 0 && <ul className="stats">{w.stats.map((s) => <li key={s.label}><b>{s.n}</b>{s.label}</li>)}</ul>}
                </div>
              </div>
            ))}

            <h2 className="v2-title" data-rise style={{ marginTop: 72 }}>وشغل مع الجهات.</h2>
            <div className={`v2-works${a.works.length === 1 ? " single" : ""}`}>
              {a.works.map((w) => (
                <div key={w.title} className="item" data-rise>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.img} alt={w.title} loading="lazy" />
                  <div className="body">
                    <span className="v2-eyebrow">{w.host}</span>
                    <h3>{w.title}</h3>
                    <p>{w.text}</p>
                    {w.stats.length > 0 && <ul className="stats">{w.stats.map((s) => <li key={s.label}><b>{s.n}</b>{s.label}</li>)}</ul>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>كيف تكون الورشة.</h2>
            <ol className="v2-process three">
              {a.steps.map((st, i) => <li key={st.name} data-rise><span className="n">{["١", "٢", "٣"][i]}</span><h3>{st.name}</h3><p>{st.text}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="v2-sec alt" id="request">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>اطلب ورشة لفريقك.</h2>
              <p>عبّي الطلب، وأرد عليك بعرض سعر رسميّ حسب عدد الحضور والمدّة والمكان.</p>
            </div>
            <div data-rise><QuoteForm subject={a.quote.subject} fields={a.quote.fields} cta="أرسل طلب الورشة" /></div>
          </div>
        </section>

        <section className="v2-sec" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>تبي تبدأ بجلسة؟</h2>
              <p>جلسة نمرّ فيها على شغلكم ونحدّد وين يدخل الذكاء الاصطناعي، وسعرها يُخصم من أيّ مشروع بعدها.</p>
            </div>
            <PackageCards items={[pkgs.session]} compact />
          </div>
        </section>

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
              {a.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>فريقك يقدر. خلّه يجرّب.</h2>
            <p>مكالمة ٢٠ دقيقة، مجّانيّة، ونرتّب الورشة على مقاس جهتكم.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
              <a className="v2-link" href={waHref("السلام عليكم، أبي ورشة ذكاء اصطناعي لفريقنا")} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
