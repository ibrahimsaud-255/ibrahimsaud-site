// نافذة متصفّح مرسومة بالكود، وجوال يتقدّمها على الطرف — لعرض لقطات الأنظمة الحقيقيّة.
// (إطارات آبل الرسميّة Product Bezels ترخيصها لتطبيقات أجهزة آبل فقط، ما يغطّي أنظمة ويب ولا محتوى المواقع.)
export type Screen = { src: string; url: string; phone?: string };

export default function Devices({ s, className = "" }: { s: Screen; className?: string }) {
  return (
    <div className={`v2-devices ${s.phone ? "with-phone" : ""} ${className}`}>
      <div className="v2-browser">
        <div className="bar" aria-hidden="true">
          <span className="dots"><i /><i /><i /></span>
          <span className="url">{s.url}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.src} alt="" loading="lazy" />
      </div>
      {s.phone && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="v2-phone" src={s.phone} alt="" loading="lazy" />
      )}
    </div>
  );
}
