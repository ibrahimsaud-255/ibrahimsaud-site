import FaceOn from "./FaceOn";
import { bookHref, payLinks, waHref, type Pkg } from "@/lib/v2";
import { site } from "@/lib/site";

export default function PackageCards({ items, compact = false }: { items: Pkg[]; compact?: boolean }) {
  return (
    <div className={`v2-pkgs ${compact ? "compact" : ""}`}>
      {items.map((p) => (
        <div key={p.id} className={`v2-pkg ${p.featured ? "featured" : ""}`} data-rise>
          <span className="for">{p.for}</span>
          <h3>{p.name}</h3>
          <div className="price">{p.price}{!p.free && <small>ريال{p.unit ? ` ${p.unit}` : ""}</small>}</div>
          {!p.approved && <span className="draft">سعر مقترح — ينتظر الاعتماد</span>}
          {p.half && <span className="half">أو ابدأ بنصف المبلغ: {p.half} ريال</span>}
          <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
          {(() => {
            // المجّانيّة: واتساب أوّلاً، ورقم للاتصال المباشر تحته — بلا أيّ رابط دفع.
            if (p.free) return (
              <div className="act">
                <FaceOn face="wink"><a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">كلّمني واتساب</a></FaceOn>
                <a className="v2-link" href={`tel:+${site.whatsapp}`}>أو اتصل: 0{site.whatsapp.slice(3)} <span className="chev">‹</span></a>
              </div>
            );
            const pay = payLinks[p.id] || {};
            const ask = waHref(`السلام عليكم، مهتمّ بباقة «${p.name}»`);
            // رابطان: الكامل زرّ أساسيّ والنصف ثانويّ، والتواصل رابط نصّيّ تحتهما
            if (pay.full || pay.half) return (
              <div className="act">
                {pay.full && <FaceOn face="big_happy"><a className="v2-btn v2-btn-primary" href={pay.full} target="_blank" rel="noopener">{pay.half ? "ادفع المبلغ كامل" : "ادفع الآن"}</a></FaceOn>}
                {pay.half && <a className={`v2-btn ${pay.full ? "v2-btn-ghost" : "v2-btn-primary"}`} href={pay.half} target="_blank" rel="noopener">ادفع النصف وابدأ</a>}
                <a className="v2-link" href={ask} target="_blank" rel="noopener">تواصل معي <span className="chev">‹</span></a>
              </div>
            );
            return (
              <FaceOn face="wink">
                <a className="v2-btn v2-btn-primary" href={p.href || ask} {...(p.href ? {} : { target: "_blank", rel: "noopener" })}>{p.href ? "شوف الباقات" : "اطلبها"}</a>
              </FaceOn>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
