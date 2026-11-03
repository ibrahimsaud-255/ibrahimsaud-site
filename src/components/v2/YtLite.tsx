"use client";

// مقطع يوتيوب خفيف: صورة المقطع وزرّ تشغيل، ويحمّل المشغّل بس لمّا يضغط الزائر.
import { useState } from "react";

export default function YtLite({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="v2-yt">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`شغّل: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" />
          <span className="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
        </button>
      )}
    </div>
  );
}
