import FaceOn from "./FaceOn";
import { payLinks, waHref, type Pkg } from "@/lib/v2";

export default function PackageCards({ items, compact = false }: { items: Pkg[]; compact?: boolean }) {
  return (
    <div className={`v2-pkgs ${compact ? "compact" : ""}`}>
      {items.map((p) => (
        <div key={p.id} className={`v2-pkg ${p.featured ? "featured" : ""}`} data-rise>
          <span className="for">{p.for}</span>
          <h3>{p.name}</h3>
          <div className="price">{p.price}<small>ريال{p.unit ? ` ${p.unit}` : ""}</small></div>
          {!p.approved && <span className="draft">سعر مقترح — ينتظر الاعتماد</span>}
          <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
          {(() => {
            const pay = p.pay || payLinks[p.id];
            const ask = waHref(`السلام عليكم، مهتمّ بباقة «${p.name}»`);
            if (pay) return (
              <div className="act">
                <FaceOn face="big_happy"><a className="v2-btn v2-btn-primary" href={pay.href} target="_blank" rel="noopener">{pay.label || "ادفع الآن"}</a></FaceOn>
                <a className="v2-link" href={ask} target="_blank" rel="noopener">عندك سؤال قبل الدفع؟</a>
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
