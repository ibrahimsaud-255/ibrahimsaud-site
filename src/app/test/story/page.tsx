import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/me.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import WindowLight from "@/components/v2/WindowLight";
import { YT, chapters, storyHead, storyNext } from "@/lib/me";

// «قصّتي» التجريبيّة — noindex حتى يعتمدها إبراهيم. حقائق علنيّة فقط (لا شي من ملفّات التحليل الخاصّة).

export const metadata: Metadata = {
  title: "قصّتي — إبراهيم سعود (نسخة تجريبيّة)",
  robots: { index: false, follow: false },
};

export default function Story() {
  return (
    <Shell>
      <p className="me-draft">نسخة تجريبيّة للمراجعة · ما تظهر في القائمة ولا في جوجل</p>
      <Nav />
      <main>
        <section className="v2-hero" style={{ textAlign: "center", paddingBottom: 40 }}>
          <WindowLight style={{ top: -80, left: "50%", width: 1000, height: 600, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="v2-eyebrow" style={{ color: "var(--blue)", fontWeight: 800 }}>{storyHead.eyebrow}</p>
            <h1 style={{ fontSize: "clamp(42px, 6.6vw, 80px)" }}>{storyHead.title}</h1>
            <p className="sub" style={{ marginInline: "auto" }}>{storyHead.sub}</p>
          </div>
        </section>

        <section className="v2-sec" style={{ paddingTop: 40 }}>
          <div className="v2-wrap">
            <div className="me-tl">
              {chapters.map((c) => (
                <article key={c.title} className="me-ch" data-rise>
                  <p className="meta">{c.tag}{c.when && <span> · {c.when}</span>}</p>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  {c.link && <a className="v2-link" href={c.link.href}>{c.link.label} <span className="chev">‹</span></a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec alt v2-final">
          <div className="v2-wrap">
            <h2>{storyNext.title}</h2>
            <p>{storyNext.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={`${YT}?sub_confirmation=1`} target="_blank" rel="noopener">اشترك في القناة</a>
              <a className="v2-link" href="/test/">ارجع للرئيسيّة <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
