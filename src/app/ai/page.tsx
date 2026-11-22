import type { Metadata } from "next";
import { share } from "@/lib/share";
import "@/components/v2/v2.css";
import "./ai.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import BlogLinks from "@/components/v2/BlogLinks";
import ServiceSchema from "@/components/v2/ServiceSchema";
import { aiPage as a, waHref } from "@/lib/v2";
import { site } from "@/lib/site";

// الذكاء الاصطناعي (قرار إبراهيم ٢٠٢٦-١١-٢١): صور حقيقيّة من الورش أوّل الصفحة، ثمّ الأخبار، ثمّ التواصل.
// بلا خدمات مشروحة ولا شرائح عروض ولا نماذج طويلة — الزائر يتصفّح بسرعة ويأخذ معلومة وحدة: خبير ذكاء اصطناعي.

export const metadata: Metadata = { ...a.meta, ...share(a.meta, "/ai/"), alternates: { canonical: "https://ibrahimsaud.com/ai/" } };

const phone = `+${site.whatsapp}`;
// أيقونات بسيطة بخطّ واحد (لون الزرّ نفسه)
const WA = "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.6 12.6c-.2.5-1.1 1-1.6 1.1-.4 0-.9.1-2.8-.6-2.4-1-3.9-3.4-4-3.6-.1-.2-1-1.3-1-2.4s.6-1.7.8-1.9c.2-.2.5-.3.6-.3h.5c.1 0 .3 0 .5.4l.7 1.7c.1.1.1.3 0 .5l-.3.4-.4.4c-.1.1-.2.3-.1.5.2.3.7 1.1 1.4 1.8.9.8 1.7 1.1 2 1.2.2.1.4.1.5 0l.6-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1Z";
const TEL = "M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z";
const MAIL = "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm8 7.5L4.8 7.2v.1L12 13l7.2-5.7v-.1L12 12.5Z";
function Icon({ d }: { d: string }) {
  return <svg className="ai-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
}

export default function AiPage() {
  return (
    <Shell>
      <ServiceSchema path="/ai/" name="ورش وتدريب الذكاء الاصطناعي" description={a.meta.description} serviceType="تدريب الذكاء الاصطناعي للشركات والجهات والمدارس" />
      <Nav sticky={false} />
      <main id="top">
        <section className="ai-top">
          <div className="v2-wrap">
            <p className="ai-kicker">إبراهيم سعود · مدرّب ذكاء اصطناعي</p>
            <h1>الذكاء الاصطناعي</h1>
          </div>
          <div className="ai-gal">
            {a.gallery.map((g) => (
              <figure key={g.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.alt} />
              </figure>
            ))}
          </div>
          <p className="ai-gal-cap">{a.gallery[0].cap}</p>
        </section>

        <section className="v2-sec ai-news" id="news">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>أخبار الورش.</h2>
            <div className="ai-news-list">
              {a.news.map((n) => (
                <article key={n.title} data-rise>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.img} alt={n.title} loading="lazy" />
                  <div>
                    <span className="v2-eyebrow">{n.host}</span>
                    <h3>{n.href ? <a href={n.href} target="_blank" rel="noopener">{n.title}</a> : n.title}</h3>
                    <p>{n.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec alt ai-contact" id="contact">
          <div className="v2-wrap" data-rise>
            <h2>اطلب ورشة لفريقك.</h2>
            <div className="ai-contact-btns">
              <a className="v2-btn v2-btn-primary" href={waHref("السلام عليكم، أبي ورشة ذكاء اصطناعي")} target="_blank" rel="noopener"><Icon d={WA} />واتساب</a>
              <a className="v2-btn v2-btn-ghost" href={`tel:${phone}`}><Icon d={TEL} />اتّصال</a>
              <a className="v2-btn v2-btn-ghost" href={`mailto:${site.email}`}><Icon d={MAIL} />البريد</a>
            </div>
          </div>
        </section>

        <BlogLinks topic="ai" max={3} first={["ai-workshop-for-companies", "ai-workshop-for-schools-students", "ai-use-cases-small-business"]} />
      </main>
      <Footer />
    </Shell>
  );
}
