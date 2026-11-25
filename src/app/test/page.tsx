import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/me.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import { brands } from "@/lib/site";
import { bookHref, waHref } from "@/lib/v2";
import { getPosts } from "@/lib/blog";
import { YT, faces, facesHead, meHero, show } from "@/lib/me";

// نسخة تجريبيّة من الرئيسيّة الشخصيّة — غير معلنة: noindex، خارج خريطة الموقع والقوائم.
// إذا اعتمدها إبراهيم تنتقل أقسامها إلى src/app/page.tsx.

export const metadata: Metadata = {
  title: "إبراهيم سعود — نسخة تجريبيّة",
  robots: { index: false, follow: false },
};

const ar = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

export default async function TestHome() {
  const posts = (await getPosts()).length;
  const list = faces(posts);

  return (
    <Shell>
      <p className="me-draft">نسخة تجريبيّة للمراجعة · ما تظهر في القائمة ولا في جوجل</p>
      <Nav />
      <main>
        {/* ===== من أنا ===== */}
        <section className="v2-hero me-hero">
          <WindowLight style={{ top: -80, left: "50%", width: 1100, height: 700, marginLeft: -550 }} />
          <div className="v2-wrap v2-hero-grid" style={{ position: "relative" }}>
            <div>
              <p className="v2-eyebrow">{meHero.eyebrow}</p>
              <h1>{meHero.title.map((t) => <span key={t}>{t}</span>)}</h1>
              <p className="sub">{meHero.sub}</p>
              <div className="ctas">
                <a className="v2-btn v2-btn-primary" href="/test/story/">اقرأ قصّتي</a>
                <a className="v2-link" href="#faces">وش أسوّي <span className="chev">‹</span></a>
              </div>
            </div>
            <div className="v2-stage" style={{ display: "grid", placeItems: "center" }}>
              <Memoji3D base="happy" />
            </div>
          </div>
        </section>

        {/* ===== الأوجه الستّة ===== */}
        <section className="v2-sec" id="faces">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>{facesHead.title}</h2>
              <p>{facesHead.sub}</p>
            </div>
          </div>
          <div className="v2-wrap" style={{ maxWidth: 1240 }}>
            <div className="me-faces">
              {list.map((f) => (
                <article key={f.role} className="me-face" data-rise>
                  <div className="body">
                    <h3 className="role">{f.role}</h3>
                    <p className="what">{f.what}</p>
                    <div className="num"><b>{f.n}</b><span>{f.unit}</span></div>
                    <p>{f.text}</p>
                    <div className="links">
                      <a className="v2-link" href={f.cta.href} {...(f.cta.ext ? { target: "_blank", rel: "noopener" } : {})}>
                        {f.cta.label} <span className="chev">‹</span>
                      </a>
                      {f.more && <a className="v2-link" href={f.more.href}>{f.more.label} <span className="chev">‹</span></a>}
                    </div>
                  </div>
                  <div className={`pic ${f.imgKind === "memoji" ? "memoji" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== القناة: الوعد العلنيّ ===== */}
        <div className="v2-tiles" style={{ paddingTop: 0 }}>
          <section className="me-show" data-rise id="channel">
            <WindowLight style={{ top: -40, left: "50%", width: 900, height: 560, marginLeft: -450 }} />
            <div style={{ position: "relative" }}>
              <p className="eyebrow">{show.eyebrow}</p>
              <h2>{show.title}</h2>
              <p className="sub">{show.sub}</p>
              <div className="me-promises">
                {show.promises.map((p) => <div key={p.t}><b>{p.t}</b><span>{p.d}</span></div>)}
              </div>
              <div className="me-counter">
                <div className="big" dir="ltr">{show.done}<small> / {show.total}</small></div>
                <p className="label">حلقة نزلت من أوّل {ar(show.total)}</p>
                <div className="me-bar" aria-hidden>
                  {Array.from({ length: show.total }, (_, i) => <i key={i} className={i < show.done ? "on" : ""} />)}
                </div>
                {show.slot
                  ? <p className="me-slot">{show.slot}</p>
                  : <p className="me-slot pending">الموعد الثابت: ينتظر قرارك (اليوم والساعة)</p>}
                <p className="me-first">{show.first}</p>
              </div>
              <div className="ctas">
                <a className="v2-btn v2-btn-primary" href={`${YT}?sub_confirmation=1`} target="_blank" rel="noopener">اشترك في القناة</a>
              </div>
            </div>
          </section>
        </div>

        {/* ===== تشويقة القصّة ===== */}
        <section className="v2-sec">
          <div className="v2-wrap me-story-teaser" data-rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/shots/ws-ai-2.jpg" alt="إبراهيم سعود في ورشة الذكاء الاصطناعي" loading="lazy" />
            <div>
              <p className="v2-eyebrow" style={{ color: "var(--blue)", fontWeight: 800 }}>قصّتي</p>
              <h2>من التسويق، إلى الكاميرا، إلى الكود.</h2>
              <p>طالب تسويق صار مخرج، وبنى أوّل نظام في شغله، وبعدها منصّة تعليميّة كاملة وهو مو مبرمج. ستّ محطّات، كلّ وحدة علّمتني شي.</p>
              <a className="v2-btn v2-btn-ghost" href="/test/story/">اقرأ القصّة</a>
            </div>
          </div>
        </section>

        {/* ===== الجهات ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><p>جهات وشركات اشتغلت معها</p></div>
            <div className="v2-logos" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
            </div>
          </div>
        </section>

        {/* ===== الختام ===== */}
        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>عندك فكرة <span style={{ color: "var(--blue)" }}>نبنيها سوا</span>؟</h2>
            <p>نظام لجهتك، أو ورشة لفريقك، أو فيلم يحكي قصّتكم. كلّمني ونشوف وش نقدر نسوّي.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={waHref("السلام عليكم، عندي فكرة أبي نتعاون فيها")} target="_blank" rel="noopener">كلّمني واتساب</a>
              <a className="v2-link" href={bookHref} target="_blank" rel="noopener">أو احجز مكالمة ٢٠ دقيقة <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
