import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/me.css";
import "@/components/tahsili/tahsili.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import Demo from "@/components/tahsili/Demo";
import Library from "@/components/tahsili/Library";
import Waitlist from "@/components/tahsili/Waitlist";
import Weighted from "@/components/tahsili/Weighted";
import { HERO_WALL, STEPS, FEATURES, COMPARE, HONEST, PLANS, FAQS, SUBJECTS, LAB, count, countFloor, ar } from "@/lib/tahsili";

// «تحصيلي 3D» — نسخة المراجعة. رابط خاصّ: noindex، خارج خريطة الموقع والقوائم.
// إذا اعتمدها إبراهيم: تنتقل إلى /tahsili/ وتُرفع noindex وتدخل القائمة وsitemap.ts.
export const metadata: Metadata = {
  title: "تحصيلي 3D — لا تحفظ القانون. شوفه.",
  description: "اختبارات تحصيلي محاكية للمسار العلميّ، وكلّ سؤال تغلط فيه يفتح لك مجسّماً ثلاثيّ الأبعاد يشرح الفكرة.",
  robots: { index: false, follow: false },
};

const rowA = HERO_WALL.filter((_, i) => i % 2 === 0);
const rowB = HERO_WALL.filter((_, i) => i % 2 === 1);

function WallRow({ slugs, reverse }: { slugs: string[]; reverse?: boolean }) {
  const all = [...slugs, ...slugs]; // مكرّر للحلقة المتّصلة
  return (
    <div className={`th-wall-row${reverse ? " rev" : ""}`} aria-hidden>
      <div className="th-wall-track">
        {all.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s + i} src={`/tahsili/hero/${s}.webp`} alt="" width={720} height={450} loading={i < 6 ? "eager" : "lazy"} />
        ))}
      </div>
    </div>
  );
}

export default function TahsiliPreview() {
  const total = countFloor();
  return (
    <Shell>
      <p className="me-draft">نسخة للمراجعة · رابط خاصّ ما يظهر في القائمة ولا في جوجل · الأسعار مقترحة</p>
      <Nav sticky={false} />
      <LocalNav
        name="تحصيلي 3D"
        buy="سجّل اهتمامك"
        links={[
          { label: "نظرة عامة", href: "#top" },
          { label: "جرّبه", href: "#try" },
          { label: "المجسّمات", href: "#library" },
          { label: "السعر", href: "#price" },
        ]}
      />
      <main id="top" className="th">
        {/* ===== الواجهة ===== */}
        <section className="th-hero">
          <div className="v2-wrap">
            <p className="kicker">من حروف ودروس · للمسار العلميّ</p>
            <h1>تحصيلي <span className="d3">3D</span></h1>
            <p className="headline">لا تحفظ القانون.<br />شوفه.</p>
            <p className="sub">اختبارات تحصيلي بنفس الوقت والأسلوب. وكلّ سؤال تغلط فيه يفتح لك مجسّماً ثلاثيّ الأبعاد يشرح الفكرة، ثم سؤالاً يشبهه تتأكّد فيه إنّك فهمت.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#try">جرّب ٦ أسئلة الآن</a>
              <a className="v2-link" href="#buy">سجّل اهتمامك <span className="chev">‹</span></a>
            </div>
          </div>
          <div className="th-wall">
            <WallRow slugs={rowA} />
            <WallRow slugs={rowB} reverse />
          </div>
          <div className="v2-wrap th-stats">
            <div><b>{ar(total)}+</b><span>مجسّم ثلاثيّ الأبعاد من منهج الثانوي</span></div>
            <div><b>{ar(4)}</b><span>موادّ: رياضيات، فيزياء، كيمياء، أحياء</span></div>
            <div><b>{ar(3)}</b><span>سنوات: أوّل وثاني وثالث ثانوي</span></div>
          </div>
        </section>

        {/* ===== الفكرة ===== */}
        <section className="v2-sec th-dark">
          <div className="v2-wrap">
            <p className="th-big" data-rise>
              التحصيلي ما يسألك نفس سؤال التجميعات.
              <span> يغيّر الأرقام والصياغة. اللي حافظ الإجابة يطيح، واللي فاهم الفكرة يحلّها.</span>
            </p>
          </div>
        </section>

        {/* ===== كيف يشتغل ===== */}
        <section className="v2-sec">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>ثلاث خطوات. كلّ يوم.</h2>
              <p>ربع ساعة باليوم تكفي، لأنّك تشتغل على اللي ناقصك بس.</p>
            </div>
            <div className="th-steps">
              {STEPS.map((s, k) => (
                <article key={s.n} className="th-step" data-rise>
                  <div className="th-step-visual">
                    {k === 0 && <MiniMap />}
                    {k === 1 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/tahsili/hero/thin-lenses.webp" alt="مختبر العدسات ثلاثيّ الأبعاد" loading="lazy" width={720} height={450} />
                    )}
                    {k === 2 && <MiniSpaced />}
                  </div>
                  <p className="n">{s.n}</p>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== جرّبه ===== */}
        <section className="v2-sec alt" id="try">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>جرّب ستّ أسئلة.</h2>
              <p>من الموادّ الأربع. جاوب، وشوف الحلّ والحيلة والمجسّم اللي يشرحها.</p>
            </div>
            <Demo />
          </div>
        </section>

        {/* ===== المكتبة ===== */}
        <section className="v2-sec" id="library">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>أكثر من {ar(total)} مجسّماً. من كتابك نفسه.</h2>
              <p>كلّ مجسّم مبنيّ على درس من منهج الثانوي السعوديّ، تحرّكه بيدك وتجرّب. اضغط أيّ واحد وجرّبه.</p>
            </div>
            <Library />
            <p className="th-note">
              {SUBJECTS.map((s) => `${s.name} ${ar(count(s.id))}`).join(" · ")}. والمكتبة تكبر كلّ أسبوع.
              {" "}<a className="v2-link" href={`${LAB}kepler-orbits/`} target="_blank" rel="noopener">افتح درساً مجّانيّاً <span className="chev">‹</span></a>
            </p>
          </div>
        </section>

        {/* ===== المزايا ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>كلّ اللي تحتاجه. ولا شي زيادة.</h2></div>
            <div className="th-feats">
              {FEATURES.map((f) => (
                <div key={f.title} className="th-feat" data-rise>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== حاسبة النسبة الموزونة ===== */}
        <section className="v2-sec" id="weighted">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>التحصيلي أثقل درجة في نسبتك.</h2>
              <p>في أغلب الكلّيّات العلميّة والصحّيّة وزنه ٤٠٪، أكثر من الثانويّة والقدرات. احسب نسبتك وشوف كم ترفعها.</p>
            </div>
            <Weighted />
            <p className="th-note">الأوزان تختلف من جامعة لجامعة ومن سنة لسنة. تأكّد من دليل القبول في جامعتك.</p>
          </div>
        </section>

        {/* ===== بصراحة ===== */}
        <section className="v2-sec th-dark">
          <div className="v2-wrap th-honest" data-rise>
            <h2>{HONEST.title}</h2>
            <p>{HONEST.text}</p>
          </div>
        </section>

        {/* ===== الفرق ===== */}
        <section className="v2-sec">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>وش الفرق؟</h2></div>
            <div className="th-cmp" data-rise>
              <div className="th-cmp-row head">
                <span />
                {COMPARE.cols.map((c, i) => <b key={c} className={i === COMPARE.cols.length - 1 ? "us" : ""}>{c}</b>)}
              </div>
              {COMPARE.rows.map((r) => (
                <div key={r.label} className="th-cmp-row">
                  <span className="l">{r.label}</span>
                  {r.v.map((v, i) => <span key={i} className={`v${i === r.v.length - 1 ? " us" : ""}`}>{v ? <span className="tick" aria-label="نعم">✓</span> : <span className="no" aria-label="لا">—</span>}</span>)}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== السعر ===== */}
        <section className="v2-sec alt" id="price">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>ابدأ مجّاناً.</h2>
              <p>وإذا عجبك، باقة واحدة تكفيك لين يوم اختبارك.</p>
            </div>
            <div className="th-plans">
              {PLANS.map((p) => (
                <div key={p.id} className={`th-plan${p.featured ? " featured" : ""}`} data-rise>
                  <p className="note">{p.note}</p>
                  <h3>{p.name}</h3>
                  <p className="price"><b>{p.price}</b> {p.per && <small>{p.per}</small>}</p>
                  <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
                  <a className={`v2-btn ${p.featured ? "v2-btn-primary" : "v2-btn-ghost"} sm`} href="#buy">{p.cta}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== سجّل ===== */}
        <section className="v2-sec th-final" id="buy">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise>
              <h2>كن من أوّل الطلاب.</h2>
              <p>سجّل بريدك، ويوصلك خبر الإطلاق قبل الكلّ.</p>
            </div>
            <Waitlist />
          </div>
        </section>

        {/* ===== أسئلة ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><h2>أسئلة تتكرّر.</h2></div>
            <div className="v2-faq" data-rise>
              {FAQS.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}

// خريطة الوحدات المصغّرة (رسم توضيحيّ للخطوة الأولى — أرقام مثال لا نتيجة حقيقيّة)
function MiniMap() {
  const rows = [
    { n: "الكهرباء التيّاريّة", v: 38, c: "#FF7A00" },
    { n: "الاتزان الكيميائيّ", v: 52, c: "#00A884" },
    { n: "حساب المثلّثات", v: 71, c: "#2F66FF" },
    { n: "الوراثة", v: 86, c: "#E5484D" },
  ];
  return (
    <div className="th-mini th-mini-map" aria-label="مثال لخريطة الوحدات">
      <p className="h">خريطتك <small>مثال</small></p>
      {rows.map((r) => (
        <div key={r.n} className="th-map-row">
          <span className="n">{r.n}</span>
          <span className="bar"><i style={{ width: `${r.v}%`, background: r.c }} /></span>
          <span className="v">{ar(r.v)}٪</span>
        </div>
      ))}
    </div>
  );
}

// دفتر الأخطاء: نفس الفكرة ترجع بعد ١ ثم ٣ ثم ٧ أيّام
function MiniSpaced() {
  const steps = [
    { d: "اليوم", t: "غلطت: العدسة المحدّبة", s: "no" },
    { d: "بعد يوم", t: "سؤال يشبهه", s: "ok" },
    { d: "بعد ٣ أيّام", t: "صياغة ثانية", s: "ok" },
    { d: "بعد أسبوع", t: "ثبتت ✓", s: "done" },
  ];
  return (
    <div className="th-mini th-mini-spaced" aria-label="مثال لدفتر الأخطاء">
      <p className="h">دفتر أخطائك</p>
      <ol>
        {steps.map((x) => <li key={x.d} className={x.s}><span className="d">{x.d}</span><span className="t">{x.t}</span></li>)}
      </ol>
    </div>
  );
}
