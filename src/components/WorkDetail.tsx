"use client";

// صفحة تفاصيل العمل — تقرأ ?id= من الرابط وتعرض العمل كاملاً:
// فيديوهات مضمّنة لأعمال الفيديو، ومعرض صور مع عارض (لايت بوكس) لأعمال التصميم.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { waLink, type Work } from "@/lib/site";
import { useWorks } from "@/lib/siteData";
import { workThumb } from "./Works";
import { toEmbed } from "@/lib/embed";

const AR_DIGITS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const arNum = (n: number) => AR_DIGITS[n - 1] ?? String(n);

/* عارض الصور (لايت بوكس) */
function Lightbox({
  images,
  start,
  onClose,
}: {
  images: string[];
  start: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(start);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowRight")
        setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt=""
          className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute -top-3 rtl:left-0 ltr:right-0 grid size-10 place-items-center rounded-full bg-ink-card text-cream shadow-lg transition hover:bg-gold hover:text-ink"
        >
          ✕
        </button>
        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="grid size-11 place-items-center rounded-full border border-line text-cream transition hover:border-gold hover:text-gold"
              aria-label="السابق"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-cream/70">
              {arNum(idx + 1)} / {arNum(images.length)}
            </span>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="grid size-11 place-items-center rounded-full border border-line text-cream transition hover:border-gold hover:text-gold"
              aria-label="التالي"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* مشغّل فيديو مضمّن */
function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embed = toEmbed(url);
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-line bg-black">
      {embed.kind === "iframe" && (
        <iframe
          src={embed.src}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title={title}
          loading="lazy"
        />
      )}
      {embed.kind === "video" && (
        <video src={embed.src} className="absolute inset-0 size-full" controls playsInline />
      )}
    </div>
  );
}

export default function WorkDetail() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const worksData = useWorks();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const work: Work | undefined = useMemo(
    () => worksData.find((w) => w.id === id),
    [worksData, id],
  );

  if (!work) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-black">العمل غير موجود</h1>
        <p className="mt-4 text-cream/60">
          ربما حُذف أو تغيّر رابطه — تصفّح كل الأعمال من الصفحة الرئيسية.
        </p>
        <a
          href="/#works"
          className="mt-8 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-black text-ink"
        >
          كل الأعمال
        </a>
      </div>
    );
  }

  const videos = work.videos?.length
    ? work.videos
    : work.videoUrl
      ? [work.videoUrl]
      : [];
  const images = work.images || [];
  const isGallery = work.kind === "gallery" || (!videos.length && images.length > 0);
  const related = worksData
    .filter((w) => w.id !== work.id && w.category === work.category)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl">
      {/* رجوع */}
      <a
        href="/#works"
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-cream/75 transition hover:border-gold/40 hover:text-cream"
      >
        <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        كل الأعمال
      </a>

      {/* الرأس */}
      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full glass-pill px-3 py-1 text-xs font-bold text-gold">
              {work.category}
            </span>
            {(work.tags || []).map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1 text-xs font-bold text-cream/60">
                {t}
              </span>
            ))}
            {work.featured && (
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">★ مميّز</span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            {work.title}
          </h1>
          <p className="mt-3 text-lg text-cream/65">{work.client}</p>
        </div>
        {work.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={work.logo} alt={work.client} className="h-16 rounded-xl bg-white/95 p-2 shadow-lg" />
        )}
      </div>

      {/* الوصف والأدوار */}
      {work.desc && (
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-cream/80">
          {work.desc}
        </p>
      )}
      {work.roles?.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-cream/50">أدواري في العمل:</span>
          {work.roles.map((r) => (
            <span key={r} className="rounded-full glass-card px-3.5 py-1.5 text-xs font-bold text-cream/85">
              {r}
            </span>
          ))}
        </div>
      )}

      {/* المحتوى: معرض صور أو فيديوهات */}
      {isGallery && images.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-ink-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${work.title} — ${i + 1}`}
                loading="lazy"
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                <span className="grid size-11 place-items-center rounded-full bg-cream text-ink shadow-xl">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3M8 11h6M11 8v6" />
                  </svg>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {!isGallery && videos.length > 0 && (
        <div className="mt-10 space-y-8">
          {videos.map((v, i) => (
            <div key={v}>
              {videos.length > 1 && (
                <h3 className="mb-3 text-lg font-black text-cream/85">
                  مقطع {arNum(i + 1)}
                </h3>
              )}
              <VideoEmbed url={v} title={`${work.title} — ${i + 1}`} />
            </div>
          ))}
          {work.bts && (
            <div>
              <h3 className="mb-3 text-lg font-black text-cream/85">كواليس العمل</h3>
              <VideoEmbed url={work.bts} title={`${work.title} — كواليس`} />
            </div>
          )}
        </div>
      )}

      {/* لا محتوى مرئي بعد */}
      {!videos.length && !images.length && (
        <div className="mt-10 grid aspect-video place-items-center rounded-3xl border border-dashed border-line text-cream/40">
          {workThumb(work) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={workThumb(work)} alt={work.title} className="size-full rounded-3xl object-cover" />
          ) : (
            "المحتوى قريباً"
          )}
        </div>
      )}

      {/* رابط خارجي + CTA */}
      <div className="mt-12 flex flex-wrap items-center gap-3">
        {work.link && (
          <a
            href={work.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
          >
            زيارة رابط العمل ↗
          </a>
        )}
        <a
          href={waLink(`السلام عليكم إبراهيم، شفت عمل «${work.title}» وأبي عمل مشابه 🎬`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft"
        >
          أبي عمل مثل هذا
        </a>
      </div>

      {/* أعمال مشابهة */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black">أعمال مشابهة</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((w) => {
              const th = workThumb(w);
              return (
                <a
                  key={w.id}
                  href={`/work/?id=${encodeURIComponent(w.id)}`}
                  className="group overflow-hidden rounded-2xl glass-card transition hover:-translate-y-1 hover:border-gold/40"
                >
                  <div className="relative aspect-video overflow-hidden bg-ink-soft">
                    {th && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={th} alt={w.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="truncate text-sm font-black text-cream">{w.title}</div>
                    <div className="mt-0.5 truncate text-xs text-cream/55">{w.client}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {lightbox !== null && (
        <Lightbox images={images} start={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
