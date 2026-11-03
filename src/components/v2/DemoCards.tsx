// نسخ العرض الحيّة: صورة الجوال، زرّ يفتحها، وكود QR يفتحها على جوالك من الكمبيوتر.
// clients=false: نظام إبراهيم نفسه (النظام)، clients=true: أعمال سوّاها لعملائه.
import { demos } from "@/lib/v2";

export default function DemoCards({ clients = false }: { clients?: boolean }) {
  return (
    <div className={`v2-demos ${clients ? "" : "solo"}`}>
      {demos.filter((d) => !!d.client === clients).map((d) => (
        <article key={d.id} className="v2-demo" data-rise>
          <div className="phone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.img} alt={`${d.name} على الجوال`} loading="lazy" />
          </div>
          <div className="tx">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {d.logo && <img className="logo" src={d.logo} alt={d.name} />}
            <span className="kind">{d.client && <b>عمل لعميل · </b>}{d.kind}</span>
            <h3>{d.name}</h3>
            <p>{d.text}</p>
            <div className="acts">
              <a className="v2-btn v2-btn-primary sm" href={d.href} target="_blank" rel="noopener">{d.dash ? "افتح الواجهة" : "افتح النسخة"}</a>
              {d.dash && <a className="v2-btn v2-btn-ghost sm" href={d.dash} target="_blank" rel="noopener">لوحة التحكّم</a>}
            </div>
            <div className="qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.qr} alt="" width={84} height={84} />
              <span>امسحه بكاميرا جوالك<br />وجرّبها هناك.</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
