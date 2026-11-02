import type { Metadata } from "next";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import AdReelsRail from "@/components/v2/AdReelsRail";
import CompareTable from "@/components/v2/CompareTable";
import PackageCards from "@/components/v2/PackageCards";
import WhyCards from "@/components/v2/WhyCards";
import { reels, reelPoster } from "@/lib/reels";
import { adCompare, adPkgs, adSteps, bookHref, faqs, waHref } from "@/lib/v2";

// إعلانات المتاجر بهندسة صفحات المنتج: واجهة، الإعلانات تتشغّل، الخطوات، قارن، اطلب.
// (الصفحة القديمة بصور الباقات الحمراء والزرقاء والصفراء تقاعدت — نوفمبر ٢٠٢٦)

export const metadata: Metadata = {
  title: "إعلانات المتاجر — فيديو إعلانيّ طوليّ بسعر واضح وتسليم خلال ٣ أيّام | إبراهيم سعود",
  description:
    "فيديوهات إعلانيّة طوليّة للمتاجر الإلكترونيّة: الفكرة والسكربت والتصوير والمونتاج والنسخ الجاهزة للنشر. من ٧٥٠ ريال، وتستلم خلال ٣ أيّام مع جولتي تعديل.",
  alternates: { canonical: "https://ibrahimsaud.com/ad-packages/" },
};

const heroReels = [0, 1, 2].map((i) => reelPoster(reels[i]).replace(/^https:\/\/drive\.google\.com\/thumbnail\?id=([\w-]+)&sz=\S+$/, "https://lh3.googleusercontent.com/d/$1=w720"));

const adFaqs = [
  { q: "هل فيه رسوم إضافيّة؟", a: "لا. السعر شامل الفكرة والسكربت والتصوير والمونتاج والنسخ الجاهزة للنشر، ومعه جولتا تعديل مجانيّة." },
  { q: "متى أستلم؟", a: "خلال ٣ أيّام من اعتماد السكربت، على Google Drive بجودة كاملة." },
  faqs[3],
];

export default function AdPackagesPage() {
  return (
    <Shell>
      <Nav sticky={false} />
      <LocalNav name="إعلانات المتاجر" links={[{ label: "نظرة عامة", href: "#top" }, { label: "الإعلانات", href: "#works" }, { label: "قارن", href: "#compare" }]} />
      <main id="top">
        <section className="v2-phero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">للمتاجر الإلكترونيّة</p>
            <h1 className="smaller">إعلانات المتاجر</h1>
            <p className="headline">سعر واضح. وتستلم خلال ٣ أيّام.</p>
            <p className="sub">السعر شامل كلّ شي: الفكرة والسكربت والتصوير والمونتاج والنسخ الجاهزة للنشر. بلا رسوم إضافيّة بعد الاتفاق، ومعه جولتا تعديل مجانيّة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#buy">اطلب</a>
              <a className="v2-btn v2-btn-ghost" href="#works">شوف الإعلانات</a>
            </div>
            <p className="from">يبدأ من ٧٥٠ ريال</p>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            <div className="phones">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {heroReels.map((s) => <img key={s} src={s} alt="" referrerPolicy="no-referrer" />)}
            </div>
          </div>
        </section>

        <section className="v2-sec alt" id="works">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>شوف الإعلانات قبل ما تقرّر.</h2>
              <p>عقار، قهوة، أقفال ذكيّة، زيوت سيّارات، متاجر وتطبيقات. قطاعات ما تشبه بعض، ونفس المعيار: هوك سريع، رسالة وحدة، ودعوة واضحة في النهاية.</p>
            </div>
            <AdReelsRail />
          </div>
        </section>

        <section className="v2-sec">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>من الفكرة للتسليم. في ٣ أيّام.</h2>
            <div className="v2-steps">
              {adSteps.map((s, i) => (
                <div key={s.name} data-rise>
                  <span className="n">{["١", "٢", "٣", "٤"][i]}</span>
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="v2-sec alt" id="compare">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أيّ باقة تناسب متجرك؟</h2></div>
            <CompareTable c={adCompare} />
          </div>
        </section>

        <section className="v2-sec" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>اطلب إعلانك.</h2>
              <p>ادفع مباشرة، أو كلّمني قبل وأقول لك أيّ باقة تناسب منتجك.</p>
            </div>
            <PackageCards items={adPkgs} />
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
              {adFaqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>إعلانك الجاي يبيع.</h2>
            <p>كلّمني وأرسل لك فكرة لمنتجك قبل ما تدفع.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
              <a className="v2-link" href={waHref("السلام عليكم، أبي إعلان لمتجري")} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
