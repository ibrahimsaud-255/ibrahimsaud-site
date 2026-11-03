"use client";

// الأعمال كشريط أفقيّ بأسلوب «تعرّف على…» في آبل.
import { useRef } from "react";
import { works } from "@/lib/site";
import { toThumb } from "@/lib/embed";

const picked = works.filter((w) => w.thumb || w.videoUrl || w.videos?.length).slice(0, 12);

export default function WorksRail() {
  const rail = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * -440, behavior: "smooth" });
  return (
    <>
      <div ref={rail} className="v2-rail">
        {picked.map((w) => {
          // صور درايف: الرابط المباشر بدل thumbnail (اللي يمرّ بتحويل ويتأخّر)
          const th = (w.thumb || toThumb(w.videoUrl || w.videos?.[0] || "") || "")
            .replace(/^https:\/\/drive\.google\.com\/thumbnail\?id=([\w-]+)&sz=(\S+)$/, "https://lh3.googleusercontent.com/d/$1=w1280");
          const href = w.videoUrl || w.videos?.[0] || w.link || "/classic/#works";
          return (
            <a key={w.id} href={href} target="_blank" rel="noopener" className="v2-work">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="th">{th && <img src={th} alt="" loading="lazy" referrerPolicy="no-referrer" />}</div>
              <div className="tx"><div className="cl">{w.client}</div><h3>{w.title}</h3></div>
            </a>
          );
        })}
      </div>
      <div className="v2-rail-ctl">
        <button type="button" aria-label="السابق" onClick={() => go(-1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <button type="button" aria-label="التالي" onClick={() => go(1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
    </>
  );
}
