"use client";

import { useState } from "react";
import type { Work } from "@/lib/site";
import { toEmbed } from "@/lib/embed";

export default function VideoCard({ work }: { work: Work }) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbed(work.videoUrl);
  const hasVideo = embed.kind !== "none";

  return (
    <article
      className="group relative h-full overflow-hidden rounded-2xl border border-line bg-ink-card transition hover:border-gold/50"
    >
      {/* منطقة الفيديو / المعاينة */}
      <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
        {playing && embed.kind === "iframe" && (
          <iframe
            src={embed.src + (embed.src.includes("?") ? "&" : "?") + "autoplay=1"}
            className="absolute inset-0 size-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={work.title}
          />
        )}
        {playing && embed.kind === "video" && (
          <video
            src={embed.src}
            className="absolute inset-0 size-full object-cover"
            controls
            autoPlay
            playsInline
          />
        )}

        {!playing && (
          <button
            onClick={() => hasVideo && setPlaying(true)}
            disabled={!hasVideo}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            {/* خلفية متدرجة سينمائية */}
            <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink-soft to-ink-card" />
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,var(--color-gold),transparent_45%)]" />

            {hasVideo ? (
              <span className="relative flex size-16 items-center justify-center rounded-full bg-gold/90 text-2xl text-ink shadow-lg transition group-hover:scale-110">
                ▶
              </span>
            ) : (
              <span className="relative rounded-full border border-line bg-ink/70 px-4 py-1.5 text-xs text-cream/60">
                الفيديو يُضاف قريبًا
              </span>
            )}
            <span className="relative text-xs font-medium text-cream/50">
              {work.category}
            </span>
          </button>
        )}
      </div>

      {/* المحتوى */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-gold">
          <span className="size-1.5 rounded-full bg-gold" />
          {work.client}
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-cream">{work.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-cream/70">{work.desc}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {work.roles.map((r) => (
            <span
              key={r}
              className="rounded-full border border-line bg-ink-soft px-3 py-1 text-[11px] text-cream/60"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
