import type { Metadata } from "next";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import QuoteForm from "@/components/v2/QuoteForm";
import BlogLinks from "@/components/v2/BlogLinks";
import YtLite from "@/components/v2/YtLite";
import PackageCards from "@/components/v2/PackageCards";
import ServiceSchema from "@/components/v2/ServiceSchema";
import { buildPage as b, bookHref, pkgs, waHref } from "@/lib/v2";
import { share } from "@/lib/share";

// «ابنِ نظامك بنفسك»: لمن يبي يتعلّم ويبني منصّته بيده. يطلع بالدومين وGitHub وقاعدة البيانات باسمه.

export const metadata: Metadata = { ...b.meta, ...share(b.meta, "/build/"), alternates: { canonical: "https://ibrahimsaud.com/build/" } };

export default function BuildPage() {
  return (
    <Shell>
      <ServiceSchema path="/build/" name={b.name} description={b.meta.description} serviceType="تدريب عمليّ على بناء نظام بالذكاء الاصطناعي" packages={[pkgs.build]} faqs={b.faqs} />
      <Nav sticky={false} />
      <LocalNav name={b.name} links={[{ label: "نظرة عامة", href: "#top" }, { label: "وش تطلع فيه", href: "#outcomes" }, { label: "الجلسات", href: "#journey" }, { label: "السعر", href: "#buy" }]} />
      <main id="top">
        <section className="v2-phero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">{b.kicker}</p>
            <h1 className="smaller">{b.name}</h1>
            <p className="headline">{b.headline}</p>
            <p className="sub">{b.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#buy">احجز مكانك</a>
              <a className="v2-btn v2-btn-ghost" href="#journey">شوف الجلسات</a>
            </div>
          </div>
          <div className="v2-wrap media" style={{ position: "relative", maxWidth: 900 }}>
            <YtLite id={b.video.id} title={b.video.title} />
          </div>
        </section>

        <section className="v2-sec alt" id="outcomes">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>وش تطلع فيه.</h2>
            <ul className="v2-checks" data-rise>{b.outcomes.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
        </section>

        <section className="v2-sec" id="journey">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>ثلاث جلسات، وتنطلق.</h2>
            <ol className="v2-process">
              {b.steps.map((st, i) => <li key={st.name} data-rise><span className="n">{["١", "٢", "٣", "٤", "٥"][i]}</span><h3>{st.name}</h3><p>{st.text}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="v2-sec alt" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>احجز مكانك.</h2>
              <p>ادفع المبلغ كامل، أو ادفع النصف الحين والنصف الثاني بعد الجلسة الأخيرة.</p>
            </div>
            <PackageCards items={[pkgs.build]} compact />
          </div>
        </section>

        <section className="v2-sec">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>أبنيه لك، ولا تبنيه معي؟</h2>
            <div className="v2-pick" data-rise>
              {b.compare.map((c) => (
                <div key={c.title} className={c.on ? "on" : ""}>
                  <span className="tag">{c.tag}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <a className={`v2-btn ${c.on ? "v2-btn-primary" : "v2-btn-ghost"}`} href={c.href}>{c.cta}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec alt" id="request">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>تبي تسأل قبل؟</h2>
              <p>اكتب فكرتك، وأرد عليك وأقولك هل الجلسات الثلاث تكفيها.</p>
            </div>
            <div data-rise><QuoteForm subject={b.quote.subject} fields={b.quote.fields} cta="أرسل الطلب" /></div>
          </div>
        </section>

        <BlogLinks topic="ai" first={["build-with-ai-without-coding", "prompt-writing-guide-arabic", "claude-vs-chatgpt-vs-gemini"]} max={3} />

        <section className="v2-sec">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {b.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="proud" className="small" /></div>
            <h2>فكرتك تستاهل تشوفها شغّالة.</h2>
            <p>مكالمة ٢٠ دقيقة، مجّانيّة، ونشوف من وين تبدأ.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
              <a className="v2-link" href={waHref("السلام عليكم، أبي أتعلّم أبني نظامي بنفسي")} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
