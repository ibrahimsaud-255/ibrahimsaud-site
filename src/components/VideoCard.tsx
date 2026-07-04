"use client";

import { useState } from "react";
import type { Work } from "@/lib/site";
import { toEmbed, toThumb } from "@/lib/embed";

const AR_DIGITS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const arNum = (n: number) => AR_DIGITS[n - 1] ?? String(n);

export default function VideoCard({
  work,
  accent,
}: {
  work: Work;
  accent?: string;
}) {
  // اجمع روابط الفيديو: المصفوفة الجديدة أو الرابط المفرد القديم
  const urls = work.videos?.length
    ? work.videos
    : work.videoUrl
      ? [work.videoUrl]
      : [];

  // قائمة المقاطع مع تسميات، وآخرها الكواليس إن وُجد
  const clips = [
    ...urls.map((url, i) => ({
      url,
      label: urls.length > 1 ? `مقطع ${arNum(i + 1)}` : "الإعلان",
      bts: false,
    })),
    ...(work.bts ? [{ url: work.bts, label: "كواليس", bts: true }] : []),
  ];

  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(0);

  const hasVideo = clips.length > 0;
  const embed = hasVideo
    ? toEmbed(clips[active].url)
    : ({ kind: "none" } as const);
  const ytThumb = hasVideo ? toThumb(clips[active].url) : null;
  // صورة مصغّرة مخصّصة للعمل (للمعاينة الرئيسية)، وإلا صورة يوتيوب
  const thumb = active === 0 && work.thumb ? work.thumb : ytThumb;

  const selectClip = (i: number) => {
    setActive(i);
    setPlaying(true);
  };

  return (
    <article
      className="group relative h-full overflow-hidden rounded-2xl border bg-ink-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
      style={{ borderColor: accent ? `${accent}66` : "var(--color-line)" }}
    >
      {/* منطقة الفيديو / المعاينة */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-ink-soft"
        style={
          accent
            ? { background: `radial-gradient(circle at 50% 40%, ${accent}26, #0d0d10 72%)` }
            : undefined
        }
      >
        {playing && embed.kind === "iframe" && (
          <iframe
            key={embed.src}
            src={embed.src + (embed.src.includes("?") ? "&" : "?") + "autoplay=1"}
            className="absolute inset-0 size-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={work.title}
          />
        )}
        {playing && embed.kind === "video" && (
          <video
            key={embed.src}
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
            {thumb ? (
              <>
                {/* الصورة المصغّرة للفيديو */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={work.title}
                  loading="lazy"
                  onError={(e) => {
                    if (ytThumb && e.currentTarget.src !== ytThumb)
                      e.currentTarget.src = ytThumb;
                  }}
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/40 transition group-hover:bg-ink/20" />
              </>
            ) : (
              <>
                {/* خلفية متدرجة سينمائية (عند عدم توفر صورة مصغّرة) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink-soft to-ink-card" />
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,var(--color-gold),transparent_45%)]" />
              </>
            )}

            {hasVideo ? (
              <span
                className="relative flex size-16 items-center justify-center rounded-full text-2xl text-ink shadow-lg transition group-hover:scale-110"
                style={{ background: accent ?? "rgba(245,166,35,0.9)" }}
              >
                ▶
              </span>
            ) : (
              <span className="relative rounded-full border border-line bg-ink/70 px-4 py-1.5 text-xs text-cream/60">
                الفيديو يُضاف قريبًا
              </span>
            )}
            <span className="relative text-xs font-medium text-cream/50">
              {hasVideo && urls.length > 1
                ? `${arNum(urls.length)} مقاطع${work.bts ? " + كواليس" : ""}`
                : work.category}
            </span>
          </button>
        )}
      </div>

      {/* أزرار اختيار المقاطع (تظهر عند وجود أكثر من مقطع) */}
      {hasVideo && clips.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-line/60 bg-ink-soft/40 px-4 py-3">
          {clips.map((c, i) => (
            <button
              key={c.url}
              onClick={() => selectClip(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                playing && active === i
                  ? "bg-gold text-ink"
                  : c.bts
                    ? "border border-gold/40 text-gold hover:bg-gold/10"
                    : "border border-line text-cream/70 hover:border-gold/50 hover:text-cream"
              }`}
            >
              {c.bts ? "🎬 كواليس" : c.label}
            </button>
          ))}
        </div>
      )}

      {/* المحتوى */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          {work.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.logo}
              alt={work.client}
              className="size-9 shrink-0 rounded-lg border border-line bg-ink object-contain p-1"
            />
          )}
          <div className="flex items-center gap-2 text-xs text-gold">
            <span className="size-1.5 rounded-full bg-gold" />
            {work.client}
          </div>
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-cream">{work.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-cream/70">{work.desc}</p>

        {work.roles.length > 0 && (
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
        )}
      </div>
    </article>
  );
}
