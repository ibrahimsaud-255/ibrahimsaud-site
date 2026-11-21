import type { Metadata } from "next";
import { share } from "@/lib/share";
import "@/components/v2/v2.css";
import "./ai.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import BlogLinks from "@/components/v2/BlogLinks";
import AiGallery from "@/components/v2/AiGallery";
import ServiceSchema from "@/components/v2/ServiceSchema";
import { aiPage as a, waHref } from "@/lib/v2";
import { site } from "@/lib/site";

// الذكاء الاصطناعي (قرار إبراهيم ٢٠٢٦-١١-٢١): صور حقيقيّة من الورش أوّل الصفحة، ثمّ الأخبار، ثمّ التواصل.
// بلا خدمات مشروحة ولا شرائح عروض ولا نماذج طويلة — الزائر يتصفّح بسرعة ويأخذ معلومة وحدة: خبير ذكاء اصطناعي.

export const metadata: Metadata = { ...a.meta, ...share(a.meta, "/ai/"), alternates: { canonical: "https://ibrahimsaud.com/ai/" } };

const phone = `+${site.whatsapp}`;
const phoneLabel = `0${site.whatsapp.slice(3, 5)} ${site.whatsapp.slice(5, 8)} ${site.whatsapp.slice(8)}`;

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
          <AiGallery shots={a.gallery} />
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
              <a className="v2-btn v2-btn-primary" href={waHref("السلام عليكم، أبي ورشة ذكاء اصطناعي")} target="_blank" rel="noopener">واتساب</a>
              <a className="v2-btn v2-btn-ghost" href={`tel:${phone}`}>اتّصال</a>
              <a className="v2-btn v2-btn-ghost" href={`mailto:${site.email}`}>البريد</a>
            </div>
            <p className="ai-phone" dir="ltr">{phoneLabel}</p>
          </div>
        </section>

        <BlogLinks topic="ai" max={3} first={["ai-workshop-for-companies", "ai-workshop-for-schools-students", "ai-use-cases-small-business"]} />
      </main>
      <Footer />
    </Shell>
  );
}
