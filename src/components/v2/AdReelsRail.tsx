"use client";

// الإعلانات الطوليّة (٩:١٦) كبطاقات جوال تتمرّر أفقيّاً؛ الضغط يفتح المشغّل بأسلوب تيك توك.
// المقاطع من src/lib/reels.ts.
import { useRef, useState } from "react";
import { reels, reelPoster } from "@/lib/reels";
import ReelsExperience from "@/components/ReelsExperience";

// صور درايف: الرابط المباشر بدل thumbnail (اللي يمرّ بتحويل ويتأخّر)
const poster = (i: number) =>
  reelPoster(reels[i]).replace(/^https:\/\/drive\.google\.com\/thumbnail\?id=([\w-]+)&sz=\S+$/, "https://lh3.googleusercontent.com/d/$1=w720");

export default function AdReelsRail() {
  const rail = useRef<HTMLDivElement>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const go = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * -300, behavior: "smooth" });
  return (
    <>
      <div ref={rail} className="v2-reels">
        {reels.map((r, i) => (
          <button key={r.id} type="button" className="v2-reel" onClick={() => setOpenAt(i)} aria-label={`شغّل إعلان ${r.client}`}>
            <span className="ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster(i)} alt="" loading="lazy" referrerPolicy="no-referrer" />
              <span className="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
            </span>
            <span className="cat">{r.category}</span>
            <span className="cl">{r.client}</span>
          </button>
        ))}
      </div>
      <div className="v2-rail-ctl">
        <button type="button" aria-label="السابق" onClick={() => go(-1)}>›</button>
        <button type="button" aria-label="التالي" onClick={() => go(1)}>‹</button>
      </div>
      {openAt !== null && <ReelsExperience key={openAt} openAt={openAt} onClose={() => setOpenAt(null)} />}
    </>
  );
}
