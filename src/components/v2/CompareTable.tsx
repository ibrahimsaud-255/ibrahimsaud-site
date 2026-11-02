// «أيّ واحد يناسبك؟» — مقارنة الفئات عموداً عموداً مثل صفحة المقارنة في آبل:
// كلّ خليّة فيها القيمة وتحتها اسم الميزة، فتنقرأ على الجوال بدون تمرير أفقيّ.
import type { Compare } from "@/lib/v2";

export default function CompareTable({ c }: { c: Compare }) {
  return (
    <div className="v2-cmp" style={{ ["--cols" as string]: c.models.length }}>
      {c.models.map((m, i) => (
        <div key={m.name} className="col" data-rise>
          <h3>{m.name}</h3>
          <div className="price">{m.price} <small>ريال{m.unit ? ` ${m.unit}` : ""}</small></div>
          <a className="v2-btn v2-btn-primary sm" href="#buy">اطلب</a>
          <ul>
            {c.rows.map((r) => {
              const v = r.v[i];
              return (
                <li key={r.label} className={v === false ? "off" : ""}>
                  <span className="v">{v === true ? <span className="tick" aria-label="متوفّر">✓</span> : v === false ? "—" : v}</span>
                  <span className="l">{r.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
