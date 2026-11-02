// «ليش تشتغل معي؟» — مثل «لماذا آبل أفضل مكان تشتري منه» تحت كلّ منتج.
import { why } from "@/lib/v2";

export default function WhyCards() {
  return (
    <div className="v2-why">
      {why.map((w) => (
        <div key={w.title} data-rise>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/v2/memoji/${w.memoji}.png`} alt="" loading="lazy" />
          <h3>{w.title}</h3>
          <p>{w.text}</p>
        </div>
      ))}
    </div>
  );
}
