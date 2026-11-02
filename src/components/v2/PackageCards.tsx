import FaceOn from "./FaceOn";
import { waHref, type Pkg } from "@/lib/v2";

export default function PackageCards({ items }: { items: Pkg[] }) {
  return (
    <div className="v2-pkgs">
      {items.map((p) => (
        <div key={p.name} className={`v2-pkg ${p.featured ? "featured" : ""}`} data-rise>
          <span className="for">{p.for}</span>
          <h3>{p.name}</h3>
          <div className="price">{p.price}<small>ريال{p.unit ? ` ${p.unit}` : ""}</small></div>
          {!p.approved && <span className="draft">سعر مقترح — ينتظر الاعتماد</span>}
          <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
          <FaceOn face="wink">
            <a className="v2-btn v2-btn-primary" href={p.href || waHref(`السلام عليكم، مهتمّ بباقة «${p.name}»`)}
              {...(p.href ? {} : { target: "_blank", rel: "noopener" })}>{p.href ? "شوف الباقات" : "اطلبها"}</a>
          </FaceOn>
        </div>
      ))}
    </div>
  );
}
