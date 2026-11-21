// صفحات الهبوط حول «نظام الجمعيات الشبابية»: /systems/charities/<guide>/
// المحتوى كلّه في src/lib/charity-guides.ts — هنا الشكل والبيانات المنظّمة فقط.
import type { Metadata } from "next";
import { share, SITE_URL } from "@/lib/share";
import "@/components/v2/v2.css";
import "../charities.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import WindowLight from "@/components/v2/WindowLight";
import BlogLinks from "@/components/v2/BlogLinks";
import SoftwareSchema, { APP_ID } from "@/components/v2/SoftwareSchema";
import { charityApp, guides, guideBySlug, type Guide, type GuideTable } from "@/lib/charity-guides";
import { waHref } from "@/lib/v2";

export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map((g) => ({ guide: g.slug }));
}

type Props = { params: Promise<{ guide: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).guide);
  return { ...g.meta, ...share(g.meta, g.path), alternates: { canonical: `${SITE_URL}${g.path}` } };
}

const PERSON = `${SITE_URL}/#ibrahim`;
const AR = (iso: string) => new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

function Schema({ g }: { g: Guide }) {
  const url = `${SITE_URL}${g.path}`;
  const hub = `${SITE_URL}${charityApp.path}`;
  const page =
    g.kind === "article"
      ? { "@type": "Article", headline: g.h1, author: { "@id": PERSON }, publisher: { "@id": PERSON }, datePublished: g.updated, dateModified: g.updated, image: `${SITE_URL}/og/home.jpg` }
      : { "@type": "WebPage", name: g.meta.title };
  const graph = [
    { ...page, "@id": `${url}#page`, url, description: g.meta.description, inLanguage: "ar", mainEntityOfPage: url, about: { "@id": APP_ID }, isPartOf: { "@id": `${SITE_URL}/#website` } },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "إبراهيم سعود", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: charityApp.name, item: hub },
        { "@type": "ListItem", position: 3, name: g.crumb, item: url },
      ],
    },
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />;
}

// جدول عاديّ على الشاشات الكبيرة، وبطاقات على الجوال (بلا تمرير أفقيّ) — كلّ خانة تحمل اسم عمودها.
function Table({ t }: { t: GuideTable }) {
  return (
    <table className="cg-table">
      {t.caption ? <caption>{t.caption}</caption> : null}
      <thead><tr>{t.cols.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
      <tbody>
        {t.rows.map((r, i) => (
          <tr key={i}>{r.map((v, j) => (j === 0 ? <th key={j} scope="row" data-l={t.cols[j]}>{v}</th> : <td key={j} data-l={t.cols[j]}>{v}</td>))}</tr>
        ))}
      </tbody>
    </table>
  );
}

function Product({ first }: { first: boolean }) {
  return (
    <div className="cg-product" id={first ? "buy" : undefined} data-rise>
      <div>
        <span className="cg-pk">{charityApp.name}</span>
        <p className="cg-price"><b>٧٩٩</b> ريال سنويّاً</p>
        <p className="cg-pnote">تجربة مجّانيّة ١٤ يوماً بلا بطاقة. تسجّل جمعيّتك بنفسك وتبدأ خلال دقيقة، من الجوال أو الكمبيوتر.</p>
      </div>
      <div className="cg-pctas">
        <a className="v2-btn v2-btn-primary" href={charityApp.signup}>ابدأ ١٤ يوماً مجّاناً</a>
        <a className="v2-btn v2-btn-ghost" href={charityApp.demo}>جرّبه بدون تسجيل</a>
        <a className="v2-link" href={charityApp.path}>كلّ ما في النظام <span className="chev">‹</span></a>
      </div>
    </div>
  );
}

export default async function GuidePage({ params }: Props) {
  const g = guideBySlug((await params).guide);
  const others = guides.filter((x) => x.slug !== g.slug);
  const firstProduct = g.sections.findIndex((s) => s.product);
  const nav = g.sections.filter((s) => s.id).slice(0, 3).map((s) => ({ label: s.h2.replace(/[؟?:].*$/, "").slice(0, 22), href: `#${s.id}` }));
  return (
    <Shell>
      <Schema g={g} />
      {g.kind === "product" ? <SoftwareSchema /> : null}
      <Nav sticky={false} />
      <LocalNav name={g.crumb} links={[...nav, { label: "الأسئلة", href: "#faq" }]} buy="ابدأ مجّاناً" />
      <main id="top">
        <section className="v2-phero ch-hero cg-hero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 560, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <nav className="cg-crumbs" aria-label="مسار الصفحة">
              <a href="/">إبراهيم سعود</a><span aria-hidden>‹</span><a href={charityApp.path}>{charityApp.name}</a><span aria-hidden>‹</span><span aria-current="page">{g.crumb}</span>
            </nav>
            <h1><span className="kicker ch-kw">{g.kicker}</span>{g.h1}</h1>
            <p className="sub">{g.sub}</p>
            <div className="ctas">
              {g.kind === "product" ? (
                <>
                  <a className="v2-btn v2-btn-primary" href={charityApp.signup}>ابدأ ١٤ يوماً مجّاناً</a>
                  <a className="v2-btn v2-btn-ghost" href={charityApp.demo}>جرّبه الحين بدون تسجيل</a>
                </>
              ) : (
                <>
                  <a className="v2-btn v2-btn-primary" href={`#${g.sections[1]?.id || "faq"}`}>ابدأ القراءة</a>
                  <a className="v2-btn v2-btn-ghost" href={charityApp.path}>نظام الجمعيات الشبابية</a>
                </>
              )}
            </div>
            <p className="from">{g.kind === "product" ? "١٤ يوماً مجّاناً بلا بطاقة · ثمّ ٧٩٩ ريال في السنة" : `آخر تحديث: ${AR(g.updated)}`}</p>
          </div>
        </section>

        {g.sections.map((s, i) => (
          <section key={s.h2} className={`v2-sec cg-sec${i % 2 === 0 ? " alt" : ""}`} id={s.id}>
            <div className="v2-wrap">
              <div className="cg-body" data-rise>
                <h2>{s.h2}</h2>
                {s.lead?.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
              </div>
              {s.cards ? (
                <div className="v2-needs cg-cards">
                  {s.cards.map((c) => <div key={c.h3} data-rise><h3>{c.h3}</h3><p>{c.p}</p></div>)}
                </div>
              ) : null}
              {s.table ? <div className="cg-tablewrap" data-rise><Table t={s.table} /></div> : null}
              {s.list ? <ul className="v2-checks cg-list" data-rise>{s.list.map((l) => <li key={l}>{l}</li>)}</ul> : null}
              {s.note ? <p className="cg-note" data-rise>{s.note}</p> : null}
              {s.product ? <Product first={i === firstProduct} /> : null}
            </div>
          </section>
        ))}

        <section className="v2-sec" id="guides">
          <div className="v2-wrap">
            <div className="v2-head" data-rise><h2>أدلّة أخرى لجمعيّتك.</h2></div>
            <ul className="v2-reads" data-rise>
              <li><a href={charityApp.path}><b>{charityApp.name}: نظام إدارة الجمعيات الأهلية</b><span>الموسم والامتثال والموقع والماليّة في نظام واحد، بـ٧٩٩ ريالاً سنويّاً.</span></a></li>
              {others.map((o) => <li key={o.slug}><a href={o.path}><b>{o.crumb}</b><span>{o.meta.description.slice(0, 120)}…</span></a></li>)}
            </ul>
          </div>
        </section>

        <BlogLinks topic="charities" max={4} first={g.blog} alt />

        <section className="v2-sec" id="faq">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة شائعة</h2></div>
            <div className="v2-faq" data-rise>
              {g.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
            {g.disclaimer ? <p className="cg-disclaimer" data-rise>{g.disclaimer}</p> : null}
          </div>
        </section>

        <section className="v2-sec v2-final alt">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <h2>جمعيّتك على نظام واحد، من اليوم.</h2>
            <p>سجّلوا خلال دقيقة، وجرّبوا ١٤ يوماً مجّاناً بدون بطاقة، ثمّ ٧٩٩ ريالاً في السنة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={charityApp.signup}>ابدأ مجّاناً</a>
              <a className="v2-link" href={waHref("السلام عليكم، عندي سؤال عن نظام الجمعيات الشبابية")} target="_blank" rel="noopener">أو اسألني واتساب <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
