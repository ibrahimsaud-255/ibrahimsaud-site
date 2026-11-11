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
import QuoteForm from "@/components/v2/QuoteForm";
import ServiceSchema from "@/components/v2/ServiceSchema";
import { charitiesPage as c } from "@/lib/charities";
import { bookHref, demos, pkgs, products, waHref } from "@/lib/v2";

export const metadata: Metadata = { ...c.meta, ...share(c.meta, c.path), alternates: { canonical: `${SITE_URL}${c.path}` } };

const NUM = ["١", "٢", "٣", "٤", "٥", "٦"];

export default function CharitiesPage() {
  const others = demos.filter((d) => d.id === "manabir" || d.id === "nasaq");
  const quote = products.systems.quote!;
  return (
    <Shell>
      <ServiceSchema path={c.path} name="نظام إدارة الجمعيّات الخيريّة والأهليّة" description={c.meta.description} serviceType="نظام إدارة جمعيّات خيريّة وأهليّة (ERP)" packages={[pkgs.session, pkgs.nasaqPro]} faqs={c.faqs} />
      <Nav sticky={false} />
      <LocalNav name="نظام الجمعيّات" links={[{ label: "شوفه", href: "#see" }, { label: "تملك أو تستأجر", href: "#own" }, { label: "التسليم", href: "#handover" }, { label: "السعر", href: "#buy" }]} />
      <main id="top">
        {/* ===== الواجهة ===== */}
        <section className="v2-phero ch-hero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">{c.kicker}</p>
            <h1>{c.h1}</h1>
            <p className="sub">{c.sub}</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#see">شوف نظام جمعيّة حقيقيّ</a>
              <a className="v2-btn v2-btn-ghost" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
            </div>
            <p className="from">{c.from}</p>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            <Devices s={{ src: c.ruso.system.src, url: c.ruso.system.url, phone: c.ruso.site.phone }} className="hero" />
          </div>
        </section>

        {/* ===== شوفه قبل لا تدفع ===== */}
        <section className="v2-sec alt" id="see">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>{c.open.title}</h2>
              <p>{c.open.text}</p>
            </div>
            <div className="ch-client" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/logos/ruso.svg" alt={c.ruso.name} />
              <div><b>{c.ruso.name}</b><span>{c.ruso.kind}</span></div>
            </div>
            {[c.ruso.site, c.ruso.system].map((s) => (
              <div key={s.href} className="ch-show" data-rise>
                <div className="tx">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <a className="v2-btn v2-btn-primary sm" href={s.href} target="_blank" rel="noopener">افتحه الحين</a>
                </div>
                <a href={s.href} target="_blank" rel="noopener" aria-label={`افتح ${s.title}`}><Devices s={{ src: s.src, url: s.url, phone: s.phone }} /></a>
              </div>
            ))}
            <p className="ch-note" data-rise>{c.open.note}</p>

            <h3 className="v2-subtitle" data-rise>ونماذج ثانية تفتحها الحين.</h3>
            <div className="ch-others">
              {others.map((d) => (
                <a key={d.id} className="ch-other" href={d.dash || d.href} target="_blank" rel="noopener" data-rise>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.img} alt={`${d.name} على الجوال`} loading="lazy" />
                  <div>
                    <span className="kind">{d.client ? "عمل لعميل · " : ""}{d.kind}</span>
                    <h4>{d.name}</h4>
                    <p>{d.text}</p>
                    <span className="v2-link">افتح النسخة <span className="chev">‹</span></span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== وش فيه ===== */}
        <section className="v2-sec">
          <div className="v2-wrap">
            <h2 className="v2-title" data-rise>كلّ شغل الجمعيّة، في مكان واحد.</h2>
            <div className="v2-needs">
              {c.features.map((f) => <div key={f.title} data-rise><h3>{f.title}</h3><p>{f.text}</p></div>)}
            </div>
          </div>
        </section>

        {/* ===== تملك أو تستأجر ===== */}
        <section className="v2-sec alt" id="own">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>{c.compare.title}</h2><p>{c.compare.sub}</p></div>
            <div className="ch-vs" data-rise role="table" aria-label={c.compare.title}>
              <div className="row head" role="row"><span role="columnheader" /><span role="columnheader">{c.compare.cols[0]}</span><span role="columnheader" className="us">{c.compare.cols[1]}</span></div>
              {c.compare.rows.map((r) => (
                <div key={r.label} className="row" role="row">
                  <span role="rowheader" className="l">{r.label}</span>
                  <span role="cell" className="them">{r.v[0]}</span>
                  <span role="cell" className="us">{r.v[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== التسليم ===== */}
        <section className="v2-sec" id="handover">
          <div className="v2-wrap">
            <div className="v2-own dark" data-rise>
              <WindowLight style={{ top: -60, left: -80, width: 760, height: 500 }} />
              <div className="hd"><h2>{c.handover.title}</h2><p>{c.handover.sub}</p></div>
              <ol className="ch-steps">
                {c.handover.steps.map((s, i) => <li key={s.name}><span className="n">{NUM[i]}</span><h3>{s.name}</h3><p>{s.text}</p></li>)}
              </ol>
            </div>
          </div>
        </section>

        {/* ===== ليش ===== */}
        <section className="v2-sec">
          <div className="v2-wrap ch-why" data-rise>
            <Memoji3D base="proud" className="small" />
            <div>
              <h2>{c.why.title}</h2>
              {c.why.paras.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
          </div>
        </section>

        {/* ===== السعر ===== */}
        <section className="v2-sec alt" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>سعر واضح، من أوّل يوم.</h2>
              <p>جلسة التشخيص تحدّد السعر النهائيّ، وسعرها يُخصم من المشروع.</p>
            </div>
            <PackageCards items={[pkgs.session, pkgs.nasaqPro]} />
            <div className="ch-costs" data-rise>
              <h3>{c.costs.title}</h3>
              <ul className="v2-checks">{c.costs.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* ===== عرض سعر ===== */}
        <section className="v2-sec" id="request">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>اطلب عرض سعر لجمعيّتك.</h2>
              <p>خمس خانات، وأرد عليكم بعرض سعر رسميّ ترفعونه لمجلس الإدارة.</p>
            </div>
            <div data-rise><QuoteForm subject="عرض سعر لنظام جمعيّة" fields={quote.fields} cta="اطلب عرض السعر" /></div>
          </div>
        </section>

        {/* ===== أسئلة ===== */}
        <section className="v2-sec alt">
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
            <h2>نظام جمعيّتك، باسمها.</h2>
            <p>مكالمة ٢٠ دقيقة، مجّانيّة، وتطلعون منها بخطّة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
              <a className="v2-link" href={waHref("السلام عليكم، أبي نظام لجمعيّتنا")} target="_blank" rel="noopener">أو كلّمني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
