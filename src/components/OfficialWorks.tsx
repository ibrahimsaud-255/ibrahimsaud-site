"use client";

// قسم «أعمال رسمية» — أعمال الجهات الحكومية وشبه الحكومية والشركات المؤسسية.
// يعرض الفيديوهات الأفقية (١٦:٩) من مصفوفة works ذات audience === "companies".
// الضغط على البطاقة يفتح المشغّل مضمّناً (Modal) — يدعم يوتيوب وقوقل درايف تلقائياً.

import { useMemo, useState } from "react";
import { useWorks } from "@/lib/siteData";
import { toEmbed } from "@/lib/embed";
import { type Work } from "@/lib/site";
import { workThumb } from "./Works";
import Reveal from "./Reveal";

function OfficialCard({
  work,
  onOpen,
  delay,
}: {
  work: Work;
  onOpen: () => void;
  delay: number;
}) {
  const thumb = workThumb(work);
  return (
    <Reveal delay={delay}>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink-soft text-right transition duration-300 hover:-translate-y-1.5 hover:border-gold/50"
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={work.title}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-ink-soft text-cream/25">
            <svg
              viewBox="0 0 24 24"
              className="size-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 15 5-5 5 5 3-3 5 5" />
            </svg>
          </div>
        )}
        {/* تدرّج أسود من تحت ليظهر الكلام فوق الصورة */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {work.featured && (
          <span className="absolute top-3 rounded-full bg-gold px-3 py-1 text-xs font-black text-ink shadow-lg ltr:left-3 rtl:right-3">
            ★ مميّز
          </span>
        )}

        {/* زر تشغيل مرئي في المنتصف */}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-gold/95 text-ink shadow-2xl transition duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="size-7 translate-x-0.5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5">
          {work.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.logo}
              alt={work.client}
              className="mb-2 h-7 w-auto object-contain"
              loading="lazy"
            />
          )}
          <p className="text-xs font-bold text-gold">{work.category}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black leading-snug text-white">
            {work.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-white/60">{work.client}</p>
        </div>
      </button>
    </Reveal>
  );
}

function PlayerModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const url = work.videoUrl || work.videos?.[0] || "";
  const embed = toEmbed(url);
  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {embed.kind === "iframe" && (
          <iframe
            src={embed.src}
            className="absolute inset-0 size-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={work.title}
          />
        )}
        {embed.kind === "video" && (
          <video src={embed.src} className="absolute inset-0 size-full" controls autoPlay playsInline />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 rtl:left-3 ltr:right-3 grid size-10 place-items-center rounded-full bg-ink-card text-cream shadow-lg transition hover:bg-gold hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function OfficialWorks() {
  const worksData = useWorks();
  const [active, setActive] = useState<Work | null>(null);

  // نعرض فقط أعمال الشركات والجهات، ونستبعد التي بلا فيديو
  const officialWorks = useMemo(
    () =>
      worksData.filter(
        (w) => w.audience === "companies" && (w.videoUrl || w.videos?.length),
      ),
    [worksData],
  );

  if (officialWorks.length === 0) return null;

  return (
    <section id="official-works" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-gold">أعمال رسمية</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                جهات حكومية وشركات مؤسسية.
              </h2>
              <p className="mt-4 max-w-2xl text-cream/70">
                الأحوال المدنية · الهيئة العامة للنقل · جامعة الملك سعود ·
                ريناد المجد — أفلام رسمية وتغطيات ومحتوى مؤسسي بجودة تليق بالجهة.
              </p>
            </div>
            <p className="text-sm font-bold text-gold">اضغط أي مقطع وشغّله</p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {officialWorks.map((w, i) => (
            <OfficialCard
              key={w.id}
              work={w}
              delay={i * 60}
              onOpen={() => setActive(w)}
            />
          ))}
        </div>
      </div>

      {active && <PlayerModal work={active} onClose={() => setActive(null)} />}
    </section>
  );
}
