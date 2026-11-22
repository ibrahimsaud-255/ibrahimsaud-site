import type { Metadata } from "next";
import { share } from "@/lib/share";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import Manifesto from "@/components/v2/Manifesto";
import { brands } from "@/lib/site";
import { aiPage, bookHref, manifesto, tools, waHref } from "@/lib/v2";
import { featured, workThumb } from "@/lib/content";

// الرئيسيّة بهندسة apple.com: واجهة إبراهيم، ثمّ لوحة كاملة العرض لكلّ منتج، ثمّ شبكة لوحات أصغر.
// القديمة محفوظة في /classic. المحتوى كلّه في src/lib/v2.ts.

const homeTitle = "إبراهيم سعود — حلول تعليميّة وعلميّة: بث الدروس، حروف ودروس، نظام الجمعيات الشبابية";
const homeDesc =
  "إبراهيم سعود، مبرمج وصانع محتوى: برنامج بث الدروس العلمية، ومنصّة حروف ودروس التعليميّة، ونظام الجمعيات الشبابية، وورش الذكاء الاصطناعي، للجمعيّات والدروس العلميّة والتعليم.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDesc,
  alternates: { canonical: "https://ibrahimsaud.com" },
  ...share({ title: homeTitle, description: homeDesc }, "/")
};

export default function Home() {
  return (
    <Shell>
      <Nav />
      <main>
        <h1 className="v2-sr">إبراهيم سعود — أبني حلولاً تعليميّة وعلميّة للجمعيّات والدروس العلميّة والتعليم، وأصنع المحتوى</h1>
        {/* ===== بانر المنتج الجديد (فترة الإطلاق) ===== */}
        <div className="v2-tiles v2-launch-wrap">
          <section className="v2-tile v2-launch">
            <WindowLight style={{ top: -60, left: "50%", width: 1000, height: 600, marginLeft: -500 }} />
            <p className="new">جديد</p>
            <h2 className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shop/lessons-broadcast/logo-black.png" alt="برنامج بث الدروس العلمية" width={900} height={418} />
            </h2>
            <p className="line">درسك على الهواء باحتراف. بضغطة زر.</p>
            <p className="plats">ويندوز · ماك · أندرويد · آيفون</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href="/lessons-broadcast/">اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href="/lessons-broadcast/#buy">اشترِ</a>
            </div>
            <a className="art frame wide" href="/lessons-broadcast/" aria-label="برنامج بث الدروس العلمية">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shop/lessons-broadcast/shot-book.jpg" alt="بثّ درس علميّ: الشيخ والكتاب في الشاشة" />
            </a>
          </section>
        </div>

        {/* ===== منتجاتي — لقطاع واحد: الجمعيّات والدروس العلميّة والتعليم ===== */}
        <div className="v2-tiles">
          <section className="v2-tile dark v2-launch hm-prod" data-rise>
            <WindowLight style={{ top: -40, left: "50%", width: 900, height: 560, marginLeft: -450 }} />
            <h2 className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hm-sq" src="/v2/logos/huroof-white.png" alt="حروف ودروس" width={600} height={600} />
            </h2>
            <p className="line">منصّة تعليميّة بنيتها بنفسي. على الويب وفي متجر آبل.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href="https://huroofduroos.com" target="_blank" rel="noopener">زُر المنصّة</a>
            </div>
            <div className="art phones two">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {["/v2/shots/huroof-home.jpg", "/v2/shots/huroof-moon3d.jpg"].map((s) => <img key={s} src={s} alt="" loading="lazy" />)}
            </div>
          </section>

          <section className="v2-tile dark v2-launch hm-prod hm-black" data-rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hm-icon" src="/charity/season/icons/icon-512.png" alt="" width={96} height={96} />
            <h2 className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/charity/assets/logo-white.png" alt="نظام الجمعيات الشبابية" width={800} height={356} />
            </h2>
            <p className="line">جمعيّتك كلّها، في جوالك.</p>
            <p className="plats">تطبيق للطلاب · تطبيق للمشرفين · نظام للإدارة</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href="/systems/charities/">اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href="/charity/?demo=1">جرّبه</a>
            </div>
            <div className="art phones two">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {["/v2/shots/youth-stu-home.jpg", "/v2/shots/youth-staff.jpg"].map((s) => <img key={s} src={s} alt="" loading="lazy" />)}
            </div>
          </section>

          <section className="v2-tile" data-rise>
            <h2>{aiPage.name}</h2>
            <p className="line">ورش عمليّة للجهات والمدارس والجمعيّات.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href="/ai/">اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href="/ai/#contact">اطلب ورشة</a>
            </div>
            <a className="art hm-photos" href="/ai/" aria-label="صور ورش الذكاء الاصطناعي">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {aiPage.gallery.map((g) => <img key={g.src} src={g.src} alt={g.alt} loading="lazy" />)}
            </a>
          </section>
        </div>

        <Manifesto text={manifesto} />

        {/* ===== صناعة المحتوى (آخر شيء) ===== */}
        <div className="v2-tiles">
          <section className="v2-tile" data-rise id="works">
            <h2>صناعة المحتوى</h2>
            <p className="line">أفلام. إعلانات. تغطيات. بودكاست.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary sm" href="/content/">شاهد الأعمال</a>
              <a className="v2-btn v2-btn-ghost sm" href="/content/#buy">اطلب</a>
            </div>
            <a className="art mosaic" href="/content/" aria-label="شاهد أعمال صناعة المحتوى">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {featured.slice(0, 3).map((w) => <img key={w.id} src={workThumb(w)} alt="" loading="lazy" referrerPolicy="no-referrer" />)}
            </a>
          </section>
        </div>

        <section className="v2-sec" style={{ paddingTop: 0 }}>
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><p>جهات وشركات اشتغلت معها</p></div>
            <div className="v2-logos" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
            </div>
          </div>
        </section>

        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>الأدوات اللي أشتغل بها.</h2>
              <p>من الكاميرا إلى الذكاء الاصطناعيّ إلى الثلاثيّ الأبعاد.</p>
            </div>
            <div className="v2-tools" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {tools.map((t) => <div key={t.name}><img src={t.img} alt="" loading="lazy" />{t.name}</div>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>عندك فكرة <span style={{ color: "var(--blue)" }}>نبنيها سوا</span>؟</h2>
            <p>تطبيق لجمعيّتك، أو حلّ ذكاء اصطناعي لدرسك أو مدرستك، أو تعاون في فكرة تخدم الناس. كلّمني ونشوف وش نقدر نسوّي.</p>
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
