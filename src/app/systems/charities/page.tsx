import type { Metadata } from "next";
import { share, SITE_URL } from "@/lib/share";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import "./charities.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import AppStoreBadge from "@/components/v2/AppStoreBadge";
import PackageCards from "@/components/v2/PackageCards";
import BlogLinks from "@/components/v2/BlogLinks";
import ServiceSchema from "@/components/v2/ServiceSchema";
import SoftwareSchema from "@/components/v2/SoftwareSchema";
import { charitiesPage as c } from "@/lib/charities";
import { charitySales as cs } from "@/lib/charities-sales";
import StickyCta from "@/components/v2/StickyCta";
import { guides } from "@/lib/charity-guides";
import { pkgs, waHref } from "@/lib/v2";

export const metadata: Metadata = { ...c.meta, ...share(c.meta, c.path), alternates: { canonical: `${SITE_URL}${c.path}` } };

export default function CharitiesPage() {
  return (
    <Shell>
      <SoftwareSchema />
      <ServiceSchema path={c.path} name="نظام الجمعيات الشبابية — نظام إدارة الجمعيات الأهلية" description={c.meta.description} serviceType="نظام إدارة جمعيّات شبابيّة وأهليّة" packages={[pkgs.charitySub]} faqs={c.faqs} />
      <Nav sticky={false} />
      <LocalNav name="نظام الجمعيات الشبابية" links={[{ label: "للطلاب", href: "#jawwali" }, { label: "للمشرفين", href: "#staff" }, { label: "الإدارة", href: "#admin" }, { label: "الألعاب", href: "#games" }, { label: "السعر", href: "#buy" }]} buy="ابدأ مجّاناً" />
      <main id="top">
        {/* ===== الواجهة (بأسلوب صفحة بث الدروس) ===== */}
        <section className="v2-phero v2-shop-hero yl-hero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="art-img" src={c.icon} alt="" width={112} height={112} />
            <p className="kicker">{c.kicker}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <h1 className="v2-shop-name v2-shop-logo"><img src={c.logo} alt={c.h1} width={800} height={356} /></h1>
            <p className="headline">{c.headline}</p>
            <p className="sub">{c.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={c.signup}>ابدأ ١٤ يوماً مجّاناً</a>
              <a className="v2-btn v2-btn-ghost" href="#jawwali">جرّبه بدون تسجيل</a>
            </div>
            <div className="v2-appstore-row"><AppStoreBadge app="jawwali" large /><small>«جوّالي» للطلاب والمشرفين — حمّله وجرّبه بدون حساب</small></div>
            <p className="from">{c.from}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="yl-hero-art" src={c.heroArt.src} alt={c.heroArt.alt} width={1920} height={1072} />
          </div>
        </section>

        {/* ===== شريط أرقام (القالب الموحّد) ===== */}
        <section className="v2-shop-proof" aria-label="بالأرقام">
          <div className="v2-wrap">
            {cs.proof.map((x) => <div key={x.l}><b>{x.n}</b><span>{x.l}</span></div>)}
          </div>
        </section>

        {/* ===== قبل ← بعد ===== */}
        <section className="v2-sec" id="contrast">
          <div className="v2-wrap">
            <h2 className="v2-title" style={{ textAlign: "center" }}>{cs.contrast.title}</h2>
            <div className="v2-shop-contrast">
              <div className="before"><h3>اليوم</h3><ul>{cs.contrast.before.map((t) => <li key={t}>{t}</li>)}</ul></div>
              <div className="after"><h3>مع النظام</h3><ul>{cs.contrast.after.map((t) => <li key={t}>{t}</li>)}</ul></div>
            </div>
          </div>
        </section>

        {/* ===== كلّ جزء بزرّ تجربة ===== */}
        {c.apps.map((a, i) => (
          <section key={a.id} className={`v2-sec${i % 2 === 0 ? " alt" : ""}`} id={a.id}>
            <div className={`v2-wrap yl-app${"phone" in a && a.phone ? " phone" : " wide"}`} data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.img} alt={a.alt} loading="lazy" />
              <div>
                <h2>{a.name}</h2>
                <p>{a.text}</p>
                <ul className="v2-checks yl-pts">{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <div className="yl-app-ctas">
                  <a className="v2-btn v2-btn-primary sm" href={a.href} target="_blank" rel="noopener">{a.cta}</a>
                  {(a.id === "jawwali" || a.id === "staff") && <AppStoreBadge app="jawwali" />}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ===== حقيبة الموسم: البرنامج الصيفيّ كلّه ===== */}
        <section className="v2-sec alt" id="kit">
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>{c.kit.title}</h2><p>{c.kit.sub}</p></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="yl-kit-art" src={c.kit.img} alt={c.kit.imgAlt} width={800} height={800} loading="lazy" />
            <div className="v2-needs">
              {c.kit.items.map((f) => <div key={f.title} data-rise><h3>{f.title}</h3><p>{f.text}</p></div>)}
            </div>
          </div>
        </section>

        {/* ===== برامج طوال السنة ===== */}
        <section className="v2-sec" id="programs">
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>{c.programs.title}</h2><p>{c.programs.sub}</p></div>
            <div className="v2-needs">
              {c.programs.items.map((f) => <div key={f.title} data-rise><h3>{f.title}</h3><p>{f.text}</p>{"href" in f && f.href ? <a className="v2-link" href={f.href}>اقرأ أكثر <span className="chev">‹</span></a> : null}</div>)}
            </div>
          </div>
        </section>

        {/* ===== البنك والراتب ===== */}
        <section className="v2-sec alt" id="bank">
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>{c.bank.title}</h2><p>{c.bank.sub}</p></div>
            <div className="v2-needs">
              {c.bank.items.map((f) => <div key={f.title} data-rise><h3>{f.title}</h3><p>{f.text}</p></div>)}
            </div>
          </div>
        </section>

        {/* ===== كلّ الوحدات ===== */}
        <section className="v2-sec alt" id="all">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>وش في نظام إدارة الجمعيات الشبابية؟</h2>
            <div className="v2-needs">
              {c.features.map((f) => <div key={f.title} data-rise><h3>{f.title}</h3><p>{f.text}</p>{"href" in f && f.href ? <a className="v2-link" href={f.href}>اقرأ أكثر <span className="chev">‹</span></a> : null}</div>)}
            </div>
          </div>
        </section>

        {/* ===== ليش ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap ch-why" data-rise>
            <Memoji3D base="proud" className="small" />
            <div>
              <h2>{c.why.title}</h2>
              {c.why.paras.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
          </div>
        </section>

        {/* ===== السعر ===== */}
        <section className="v2-sec" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>سعر واحد، فيه كلّ شي.</h2>
              <p>جرّبوا ١٤ يوماً بدون بطاقة، وبعدها ٧٩٩ ريال في السنة: التطبيق للطلاب والمشرفين والإدارة والموسم والألعاب والموقع.</p>
            </div>
            <div className="yl-pkg"><PackageCards items={[pkgs.charitySub]} /></div>
          </div>
        </section>

        {/* ===== أدلّة الجمعيّات (عنقود SEO: كلّ دليل صفحة تستهدف كلمتها وتعود لهنا) ===== */}
        <section className="v2-sec alt ch-guides" id="guides">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>أدلّة لجمعيّتك.</h2>
              <p>الأندية الصيفيّة، ومعيار الشفافية والإفصاح، واللائحة التنفيذيّة المعدّلة: شرح عمليّ لما يطلبه منكم كلّ واحد.</p>
            </div>
            <ul className="v2-reads" data-rise>
              {guides.map((g) => <li key={g.slug}><a href={g.path}><b>{g.crumb}</b><span>{g.sub.slice(0, 130)}…</span></a></li>)}
            </ul>
          </div>
        </section>

        <BlogLinks topic="charities" max={6} first={["youth-associations-saudi", "summer-youth-club-guide", "establish-youth-association", "charity-reports-transparency", "nonprofit-governance-digital", "volunteer-management-system"]} />

        {/* ===== أسئلة ===== */}
        <section className="v2-sec alt" id="faq">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {c.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="v2-sec v2-final">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}><Memoji3D base="wink" className="small" /></div>
            <h2>جمعيّتك، من اليوم.</h2>
            <p>سجّلوا خلال دقيقة، وجرّبوا ١٤ يوماً مجّاناً بدون بطاقة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={c.signup}>ابدأ مجّاناً</a>
              <a className="v2-link" href={waHref("السلام عليكم، عندي سؤال عن نظام الجمعيات الشبابية")} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <StickyCta price={cs.sticky.price} cta={cs.sticky.cta} href={c.signup} />
      <Footer />
    </Shell>
  );
}
