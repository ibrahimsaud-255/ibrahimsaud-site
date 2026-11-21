// «تعمل في جمعيّة؟» — جسر من صفحات المنتجات (أوّلها بث الدروس) إلى نظام الجمعيات الشبابية.
// جمهور بث الدروس أغلبه يعمل في جمعيّات، فهم الفئة نفسها (قرار إبراهيم ٢٠٢٦-١١-٢١).
export default function CharityPromo() {
  return (
    <section className="v2-sec">
      <div className="v2-wrap">
        <div className="v2-demo" data-rise style={{ alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/shots/youth-stu-home.jpg" alt="تطبيق جوّالي للطالب في نظام الجمعيات الشبابية" loading="lazy" style={{ width: "100%", maxWidth: 260, aspectRatio: "9 / 19.5", objectFit: "cover", objectPosition: "top", borderRadius: 30, border: "5px solid #1d1d1f", justifySelf: "center" }} />
          <div>
            <span className="kind" style={{ color: "var(--blue)", fontWeight: 800 }}>تعمل في جمعيّة؟</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "6px 0 12px" }}>نظام الجمعيات الشبابية.</h2>
            <p>تطبيق للطالب ببطاقته وبنكه وفريقه، وتطبيق للميسّرين، وموسم الأندية الصيفيّة، والماليّة والرواتب، وموقع الجمعيّة والإفصاح. نظام واحد تديره من جوالك، بـ٧٩٩ ريالاً في السنة.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <a className="v2-btn v2-btn-primary sm" href="/systems/charities/">اعرف أكثر</a>
              <a className="v2-btn v2-btn-ghost sm" href="/charity/?signup=1">جرّبه ١٤ يوماً مجّاناً</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
