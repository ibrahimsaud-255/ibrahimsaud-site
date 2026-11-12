import type { Metadata } from "next";
import { share } from "@/lib/share";
import "@/components/v2/v2.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import LocalNav from "@/components/v2/LocalNav";
import Footer from "@/components/v2/Footer";
import WindowLight from "@/components/v2/WindowLight";
import ContentWorks from "@/components/v2/ContentWorks";
import AdReelsRail from "@/components/v2/AdReelsRail";
import { brands } from "@/lib/site";
import { reels } from "@/lib/reels";
import { contentSteps, contentWa, featured, groups, groupedCount, photos, studioShots, workThumb } from "@/lib/content";

// «صناعة المحتوى»: معرض الأعمال (فيديو وتغطيات وإعلانات وبودكاست) — الصفحة اللي تُرسل للعميل المحتمل.
// الترتيب والنصوص في src/lib/content.ts.

const title = "صناعة المحتوى — أفلام وإعلانات وتغطيات وبودكاست | إبراهيم سعود";
const description =
  "أعمال إبراهيم سعود في صناعة المحتوى: أفلام رسميّة لجهات حكوميّة وشركات، وتغطية فعاليّات، وإعلانات طوليّة، وحملات، وبودكاست. فكرة واسكربت وإخراج وتصوير ومونتاج، في الرياض وأيّ مدينة بالمملكة.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://ibrahimsaud.com/content/" },
  ...share({ title, description }, "/content/"),
};

const ar = (n: number) => n.toLocaleString("ar-SA");

// صور الواجهة: أوّل عمل كبير والباقي حوله (الأفقيّة فقط)
const mosaic = [...featured, ...groups.filter((g) => g.shape === "wide").flatMap((g) => g.items)]
  .filter((w, i, a) => a.findIndex((x) => x.id === w.id) === i)
  .slice(0, 5);

const links = [
  { label: "الأبرز", href: "#featured" },
  { label: "الأفلام", href: "#official" },
  { label: "الفعاليّات", href: "#events" },
  { label: "الطوليّة", href: "#reels" },
  { label: "الحملات", href: "#campaigns" },
  { label: "البودكاست", href: "#podcast" },
];

export default function Page() {
  return (
    <Shell>
      <Nav sticky={false} />
      <LocalNav name="صناعة المحتوى" links={links} />
      <main id="top">
        {/* ===== الواجهة ===== */}
        <section className="v2-phero">
          <WindowLight style={{ top: 40, left: "50%", width: 1000, height: 640, marginLeft: -500 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <p className="kicker">أفلام · إعلانات · تغطيات · بودكاست</p>
            <h1 className="smaller">صناعة المحتوى</h1>
            <p className="headline">من الفكرة إلى آخر لقطة.</p>
            <p className="sub">أكتب الفكرة والاسكربت، وأخرج وأصوّر وأمنتج. لجهات حكوميّة وشركات ومتاجر، في الرياض، وأسافر للمشروع في أيّ مدينة بالمملكة.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href="#featured">شاهد الأعمال</a>
              <a className="v2-btn v2-btn-ghost" href={contentWa()} target="_blank" rel="noopener">كلّمني عن مشروعك</a>
            </div>
          </div>
          <div className="v2-wrap media" style={{ position: "relative" }}>
            <a className="v2-cmosaic" href="#featured" aria-label="شاهد الأعمال">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {mosaic.map((w) => <img key={w.id} src={workThumb(w)} alt="" referrerPolicy="no-referrer" />)}
            </a>
          </div>
          <div className="v2-wrap">
            <div className="v2-cstats" data-rise>
              <div><b>{ar(groupedCount + reels.length)}</b><span>عملاً تشاهده هنا</span></div>
              <div><b>{ar(brands.length)}</b><span>جهة وشركة اشتغلت معها</span></div>
              <div><b>كامل</b><span>من الفكرة إلى التسليم</span></div>
            </div>
          </div>
        </section>

        <ContentWorks
          reelsAfter={1}
          reels={
            <section className="v2-cgroup" id="reels" data-rise>
              <div className="v2-head">
                <h2>إعلانات طوليّة.</h2>
                <p>إعلانات ٩:١٦ لتيك توك وسناب وريلز: هوك يوقف التمرير، ورسالة وحدة، وتسليم خلال ٣ أيّام.</p>
              </div>
              <AdReelsRail />
              <p style={{ marginTop: 8 }}><a className="v2-link" href="/ad-packages/">باقات إعلانات المتاجر <span className="chev">‹</span></a></p>
            </section>
          }
        />

        {/* ===== التصوير الفوتوغرافيّ (يظهر لمّا تنضاف صور في content.ts) ===== */}
        {photos.length > 0 && (
          <section className="v2-sec" id="photos">
            <div className="v2-wrap">
              <div className="v2-head" data-rise>
                <h2>التصوير الفوتوغرافيّ.</h2>
                <p>صور فعاليّات ومنتجات وبورتريه.</p>
              </div>
              <div className="v2-cphotos" data-rise>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photos.map((p) => <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />)}
              </div>
            </div>
          </section>
        )}

        {/* ===== الجهات ===== */}
        <section className="v2-sec">
          <div className="v2-wrap">
            <div className="v2-head center" data-rise><p>جهات وشركات اشتغلت معها</p></div>
            <div className="v2-logos" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brands.map((b) => <img key={b.name} src={b.logo} alt={b.name} title={b.name} loading="lazy" />)}
            </div>
          </div>
        </section>

        {/* ===== كيف نشتغل ===== */}
        <section className="v2-sec alt">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>كيف نشتغل.</h2>
              <p>ما نصوّر شي قبل ما تعتمد الفكرة والاسكربت. ولا رسوم إضافيّة بعد الاتفاق.</p>
            </div>
            <div className="v2-steps" data-rise>
              {contentSteps.map((s, i) => (
                <div key={s.name}><span className="n">{ar(i + 1)}</span><h3>{s.name}</h3><p>{s.text}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== الاستوديو ===== */}
        <section className="v2-sec" id="studio">
          <div className="v2-wrap">
            <div className="v2-head" data-rise>
              <h2>والاستوديو جاهز.</h2>
              <p>استوديو بودكاست في الرياض بثلاث كاميرات وإضاءة ومايكات RØDE. تصوّر حلقتك وتطلع منها بعشرة مقاطع.</p>
              <p><a className="v2-link" href="/video/">الاستوديو والباقات <span className="chev">‹</span></a></p>
            </div>
            <div className="v2-cphotos four" data-rise>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {studioShots.map((s) => <img key={s} src={s} alt="استوديو إبراهيم سعود في الرياض" loading="lazy" />)}
            </div>
          </div>
        </section>

        {/* ===== الختام ===== */}
        <section className="v2-sec v2-final" id="buy">
          <WindowLight style={{ top: 0, left: "50%", width: 900, height: 600, marginLeft: -450 }} />
          <div className="v2-wrap" style={{ position: "relative" }}>
            <h2>عندك مشروع؟ <span style={{ color: "var(--blue)" }}>نصوّره.</span></h2>
            <p>فيلم، أو تغطية فعاليّة، أو محتوى لفترة. قلّي وش تبي ووين، وأرسل لك عرض سعر.</p>
            <div className="ctas">
              <a className="v2-btn v2-btn-primary" href={contentWa()} target="_blank" rel="noopener">كلّمني واتساب</a>
              <a className="v2-link" href="/video/#buy">شوف الباقات <span className="chev">‹</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
