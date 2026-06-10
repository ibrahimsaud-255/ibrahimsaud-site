"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reels, reelPoster, type Reel } from "@/lib/reels";
import { waLink } from "@/lib/site";

// مشغّل يوتيوب (بديل مؤقت): رابط تضمين مع تشغيل تلقائي مكتوم وحلقة، مع JS API للصوت.
function embedSrc(ytId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: ytId,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    enablejsapi: "1",
  });
  return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
}

function ytCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: unknown[] = [],
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*",
  );
}

export default function ReelsExperience() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const total = reels.length;

  // فتح/إغلاق عبر هاش الرابط (#reels)
  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#reels");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // قفل تمرير الخلفية + انتقال الدخول
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setActive(0);
    setMuted(true);
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const close = useCallback(() => {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("works")?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  // إغلاق بزر Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // اكتشاف السلايد النشط
  useEffect(() => {
    if (!open) return;
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { root, threshold: [0.6] },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [open]);

  // تشغيل المقطع النشط فقط + تطبيق حالة الصوت (فيديو native ويوتيوب)
  useEffect(() => {
    if (!open) return;
    reels.forEach((_, i) => {
      const v = videoRefs.current[i];
      if (!v) return;
      v.muted = muted;
      if (i === active) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
    const ifr = iframeRefs.current[active];
    if (ifr) {
      if (muted) {
        ytCommand(ifr, "mute");
      } else {
        ytCommand(ifr, "unMute");
        ytCommand(ifr, "setVolume", [100]);
        ytCommand(ifr, "playVideo");
      }
    }
  }, [open, active, muted]);

  const goTo = (i: number) =>
    slideRefs.current[i]?.scrollIntoView({ behavior: "smooth" });

  if (!open || total === 0) return null;

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-[100] bg-black transition-all duration-500 ${
        shown ? "scale-100 opacity-100" : "scale-105 opacity-0"
      }`}
    >
      {/* شريط علوي */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          onClick={close}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20"
          aria-label="إغلاق"
        >
          ✕
        </button>
        <span className="text-sm font-bold tracking-wide text-white/80">
          أعمالي · مقاطع
        </span>
        <button
          onClick={() => setMuted((m) => !m)}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur transition hover:bg-white/20"
          aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* الحاوية القابلة للتمرير العمودي */}
      <div
        ref={scrollerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        style={{ scrollbarWidth: "none" }}
      >
        {reels.map((r, i) => {
          const near = Math.abs(i - active) <= 1; // نحمّل النشط وجاره فقط
          const poster = reelPoster(r);
          return (
            <section
              key={r.id}
              data-index={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="relative flex h-full w-full snap-start snap-always items-center justify-center"
            >
              {/* خلفية ضبابية */}
              {poster && (
                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-2xl"
                  style={{ backgroundImage: `url(${poster})` }}
                />
              )}
              <div className="absolute inset-0 bg-black/40" />

              {/* إطار الفيديو العمودي 9:16 */}
              <div className="relative z-10 h-full max-h-[92vh] w-full max-w-[min(100vw,52vh)] overflow-hidden bg-black sm:rounded-2xl">
                {!near ? (
                  poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster}
                      alt={r.title}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : null
                ) : r.src ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={r.src}
                    poster={r.poster}
                    className="absolute inset-0 size-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : r.ytId ? (
                  <iframe
                    key={r.ytId}
                    ref={(el) => {
                      iframeRefs.current[i] = el;
                    }}
                    src={embedSrc(r.ytId)}
                    className="absolute inset-0 size-full"
                    style={{ border: 0 }}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    title={r.title}
                  />
                ) : null}
              </div>

              <SlideOverlay reel={r} />
            </section>
          );
        })}

        {/* شاشة النهاية */}
        <section className="relative flex h-full w-full snap-start flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink-soft to-ink" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-2xl font-black text-white sm:text-3xl">
              شفت شغلي؟ <span className="gold-text">خلنا نسوي إعلانك.</span>
            </p>
            <a
              href={waLink("السلام عليكم، شفت أعمالك وأبي أطلب فيديو إعلاني 🎬")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-ink transition hover:bg-gold-soft"
            >
              اطلب إعلانك الآن
            </a>
            <button
              onClick={close}
              className="text-sm text-white/60 underline-offset-4 transition hover:text-white hover:underline"
            >
              العودة للموقع ↑
            </button>
          </div>
        </section>
      </div>

      {/* مؤشّر التقدّم الجانبي */}
      <div className="pointer-events-none absolute left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        {reels.map((r, i) => (
          <button
            key={r.id}
            onClick={() => goTo(i)}
            className={`pointer-events-auto rounded-full transition-all ${
              active === i ? "h-6 w-1.5 bg-gold" : "h-1.5 w-1.5 bg-white/40"
            }`}
            aria-label={`المقطع ${i + 1}`}
          />
        ))}
      </div>

      {/* تلميح السحب */}
      {active === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex animate-bounce flex-col items-center text-white/70">
          <span className="text-xs">اسحب للأعلى</span>
          <span className="text-lg">↑</span>
        </div>
      )}
    </div>
  );
}

// طبقة المعلومات والأزرار على كل مقطع
function SlideOverlay({ reel }: { reel: Reel }) {
  return (
    <>
      {/* أزرار جانبية */}
      <div className="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-5 sm:right-[max(1rem,calc(50vw-26vh-3.5rem))]">
        <a
          href={waLink(`السلام عليكم، أعجبني «${reel.title}» وأبي إعلان مثله 🎬`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-2xl backdrop-blur transition hover:bg-gold hover:text-ink">
            ❤️
          </span>
          <span className="text-[10px] font-medium">اطلب مثله</span>
        </a>
        <a
          href={waLink(`شف هذا العمل من إبراهيم سعود: «${reel.title}»`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur transition hover:bg-white/25">
            ↗
          </span>
          <span className="text-[10px] font-medium">مشاركة</span>
        </a>
      </div>

      {/* معلومات العمل */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-24 pt-16 sm:px-[max(1rem,calc(50vw-26vh))]">
        <div className="flex items-center gap-2">
          {reel.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reel.logo}
              alt={reel.client}
              className="size-9 shrink-0 rounded-lg border border-white/20 bg-ink object-contain p-1"
            />
          )}
          <span className="text-sm font-bold text-gold">{reel.client}</span>
        </div>
        <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">
          {reel.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {reel.roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] text-white/80"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
