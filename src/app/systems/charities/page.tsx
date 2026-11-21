import type { Metadata } from "next";
import { share, SITE_URL } from "@/lib/share";
import "@/components/v2/v2.css";
import "./charities.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Memoji3D from "@/components/v2/Memoji3D";
import WindowLight from "@/components/v2/WindowLight";
import Devices from "@/components/v2/Devices";
import PackageCards from "@/components/v2/PackageCards";
import BlogLinks from "@/components/v2/BlogLinks";
import ServiceSchema from "@/components/v2/ServiceSchema";
import SoftwareSchema from "@/components/v2/SoftwareSchema";
import { charitiesPage as c } from "@/lib/charities";
import { guides } from "@/lib/charity-guides";
import { pkgs, waHref } from "@/lib/v2";

export const metadata: Metadata = { ...c.meta, ...share(c.meta, c.path), alternates: { canonical: `${SITE_URL}${c.path}` } };

export default function CharitiesPage() {
  return (
    <Shell>
      <SoftwareSchema />
      <ServiceSchema path={c.path} name="نظام الجمعيات الشبابية — نظام إدارة الجمعيات الأهلية" description={c.meta.description} serviceType="نظام إدارة جمعيّات شبابيّة وأهليّة" packages={[pkgs.charitySub]} faqs={c.faqs} />
      <Nav sticky={false} />
      <LocalNav name="نظام الجمعيات الشبابية" links={[{ label: "جوّالي", href: "#jawwali" }, { label: "الميسّرون", href: "#staff" }, { label: "كلّ الوحدات", href: "#all" }, { label: "جرّبه", href: "#try" }, { label: "السعر", href: "#buy" }]} buy="ابدأ مجّاناً" />
      <main id="top">
        {/* ===== الواجهة ===== */}
        <section className="v2-phero ch-hero yl-hero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <h1><span className="kicker ch-kw">{c.kicker}</span>{c.h1}</h1>
            <p className="headline">{c.headline}</p>
            <p className="sub">{c.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={c.signup}>ابدأ ١٤ يوماً مجّاناً</a>
              <a className="v2-btn v2-btn-ghost" href="#try">جرّبه الحين بدون تسجيل</a>
            </div>
            <p className="from">{c.from}</p>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            <Devices s={c.hero} className="hero" />
          </div>
        </section>

        {/* ===== ثلاثة ناس ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>{c.roles.title}</h2><p>{c.roles.sub}</p></div>
            <div className="yl-roles">
              {c.roles.items.map((r) => (
                <div key={r.name} className={`yl-role${"wide" in r && r.wide ? " wide" : ""}`} data-rise>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt={r.alt} loading="lazy" />
                  <div className="tx">
                    <span className="app">{r.app}</span>
                    <h3>{r.name}</h3>
                    <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== جوّالي ===== */}
        <section className="v2-sec" id="jawwali">
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>{c.jawwali.title}</h2><p>{c.jawwali.text}</p></div>
            <div className="yl-phones" data-rise>
              {c.jawwali.shots.map((s) => (
                <figure key={s.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.alt} loading="lazy" />
                  <figcaption>{s.cap}</figcaption>
                </figure>
              ))}
            </div>
            <p className="ch-note" data-rise>{c.jawwali.note}</p>
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

        {/* ===== الميسّرون ===== */}
        <section className="v2-sec" id="staff">
          <div className="v2-wrap yl-staff" data-rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.staff.img} alt={c.staff.alt} loading="lazy" />
            <div>
              <h2>{c.staff.title}</h2>
              <p>{c.staff.text}</p>
              <a className="v2-btn v2-btn-ghost sm" href="/charity/season/?demo=1&as=staff">جرّب تطبيق الميسّر</a>
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

        {/* ===== جرّبه ===== */}
        <section className="v2-sec" id="try">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>{c.try.title}</h2><p>{c.try.text}</p></div>
            <ul className="v2-reads yl-try" data-rise>
              {c.try.links.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><b>{l.label}</b><span>{l.text}</span></a></li>)}
            </ul>
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
              <p>جرّبوا ١٤ يوماً بدون بطاقة، وبعدها ٧٩٩ ريال في السنة: النظام وجوّالي وتطبيق الميسّرين والموسم والألعاب والموقع.</p>
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
      <Footer />
    </Shell>
  );
}
