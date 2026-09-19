"use client";

// قسم «أعمال الجهات والشركات» — فيديوهات أفقية (١٦:٩) للجهات المؤسسية.
// تُعرض كبطاقات في سلايدر أفقي يلفّ المستخدم بينها (سحب + أسهم)، بأسلوب أحادي احترافي.
// الضغط على البطاقة يفتح المشغّل مضمّناً (يوتيوب/درايف تلقائياً).

import { useMemo, useRef, useState } from "react";
import { useWorks } from "@/lib/siteData";
import { toEmbed } from "@/lib/embed";
import { type Work } from "@/lib/site";
import { workThumb } from "./Works";
import Reveal from "./Reveal";

function OfficialCard({ work, onOpen }: { work: Work; onOpen: () => void }) {
  const thumb = workThumb(work);
  return (
    <button
      type="button"
      data-card
      onClick={onOpen}
      className="group relative block aspect-video w-[86vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-cream/12 bg-ink-soft text-right transition duration-300 hover:border-cream/40 sm:w-[460px]"
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={work.title}
          loading="lazy"
          className="size-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="grid size-full place-items-center bg-ink-soft text-cream/25">
          <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 15 5-5 5 5 3-3 5 5" />
          </svg>
        </div>
      )}
      {/* تدرّج أسود من تحت */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

      {work.featured && (
        <span className="absolute top-3 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-black text-white backdrop-blur-md ltr:left-3 rtl:right-3">
          ★ مميّز
        </span>
      )}

      {/* زر تشغيل زجاجي أبيض */}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white/20">
          <svg viewBox="0 0 24 24" className="size-7 translate-x-0.5" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5">
        {work.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={work.logo} alt={work.client} className="mb-2 h-7 w-auto object-contain" loading="lazy" />
        )}
        <span className="mb-1.5 block h-px w-8 bg-white/40" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/60">{work.category}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-black leading-snug text-white">{work.title}</h3>
        <p className="mt-0.5 truncate text-sm text-white/55">{work.client}</p>
      </div>
    </button>
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
          className="absolute top-3 grid size-10 place-items-center rounded-full bg-ink-card text-cream shadow-lg transition hover:bg-cream hover:text-ink ltr:right-3 rtl:left-3"
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
  const scroller = useRef<HTMLDivElement>(null);

  const officialWorks = useMemo(
    () =>
      worksData.filter(
        (w) => w.audience === "companies" && (w.videoUrl || w.videos?.length),
      ),
    [worksData],
  );

  function slide(dir: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
    // في RTL نعكس الاتجاه ليتماشى «التالي» مع اتجاه القراءة
    el.scrollBy({ left: dir * amount * -1, behavior: "smooth" });
  }

  if (officialWorks.length === 0) return null;

  return (
    <section id="official-works" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-cream/60">
                أعمال الجهات والشركات
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                جهات حكومية وشركات مؤسسية.
              </h2>
              <p className="mt-4 max-w-2xl text-cream/70">
                الأحوال المدنية · الهيئة العامة للنقل · جامعة الملك سعود · ريناد
                المجد — أفلام رسمية وتغطيات ومحتوى مؤسسي بجودة تليق بالجهة.
              </p>
            </div>
            {/* أسهم التنقّل */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="السابق"
                onClick={() => slide(-1)}
                className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream transition hover:border-cream hover:bg-cream/10"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="التالي"
                onClick={() => slide(1)}
                className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream transition hover:border-cream hover:bg-cream/10"
              >
                ›
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* السلايدر — يمتدّ لحافة الشاشة للإحساس بالاستمرار */}
      <Reveal>
        <div
          ref={scroller}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-2 [scroll-padding-inline:1.5rem]"
        >
          {officialWorks.map((w) => (
            <OfficialCard key={w.id} work={w} onOpen={() => setActive(w)} />
          ))}
          {/* مساحة نهاية لطيفة */}
          <div aria-hidden className="w-2 shrink-0" />
        </div>
      </Reveal>

      {active && <PlayerModal work={active} onClose={() => setActive(null)} />}
    </section>
  );
}
