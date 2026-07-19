"use client";

// قسم الأعمال — شبكة بطاقات احترافية مع فلاتر تصنيفات (تُدار من النظام الداخلي):
// كل عمل بطاقة بصورة مصغّرة وعنوان وتاجات وزر «مشاهدة» يفتح صفحة تفاصيل العمل.
// أعمال التصميم (kind = gallery) تعرض صورها، وأعمال الفيديو تعرض صورة الفيديو.

import { useMemo, useState } from "react";
import { type Work } from "@/lib/site";
import { useWorks } from "@/lib/siteData";
import Reveal from "./Reveal";

// صورة مصغّرة للعمل: المخصّصة → أول صورة معرض → صورة يوتيوب المشتقة.
export function workThumb(w: Work): string {
  if (w.thumb) return w.thumb;
  if (w.images?.length) return w.images[0];
  const u = w.videoUrl || w.videos?.[0] || "";
  const m = u.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : "";
}

function WorkCard({ work, delay }: { work: Work; delay: number }) {
  const th = workThumb(work);
  const tags = [work.category, ...(work.tags || [])].filter(Boolean);
  return (
    <Reveal delay={delay}>
      <a
        href={`/work/?id=${encodeURIComponent(work.id)}`}
        className="group relative block aspect-video overflow-hidden rounded-3xl border border-line transition hover:-translate-y-1.5 hover:border-gold/40"
      >
        {/* صورة العمل — هي البطاقة كاملة */}
        {th ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={th}
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
        {work.kind === "gallery" && (work.images?.length || 0) > 1 && (
          <span className="absolute top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm ltr:right-3 rtl:left-3">
            {work.images!.length} صور
          </span>
        )}

        {/* الكلام فوق الصورة */}
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
          <p className="text-xs font-bold text-gold">{tags[0]}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black leading-snug text-white">
            {work.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-white/60">{work.client}</p>
        </div>
      </a>
    </Reveal>
  );
}

export default function Works() {
  const worksData = useWorks();
  const [filter, setFilter] = useState<string>("");

  // التصنيفات تُشتق من الأعمال نفسها — أضف تصنيفاً من النظام يظهر هنا تلقائياً.
  const cats = useMemo(() => {
    const seen: string[] = [];
    for (const w of worksData) {
      if (w.category && !seen.includes(w.category)) seen.push(w.category);
    }
    return seen;
  }, [worksData]);

  const items = useMemo(() => {
    const list = filter
      ? worksData.filter((w) => w.category === filter)
      : worksData;
    // المميّز أولاً ضمن نفس الترتيب
    return [...list].sort(
      (a, b) => Number(b.featured || false) - Number(a.featured || false),
    );
  }, [worksData, filter]);

  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الأعمال</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            أعمال أفتخر فيها — شاهدها بنفسك.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            أفلام، تغطيات، إعلانات، وتصاميم — اختر التصنيف أو تصفّح الكل، وكل
            عمل له صفحة تفاصيل كاملة.
          </p>
        </Reveal>

        {/* فلاتر التصنيفات */}
        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("")}
              className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${
                !filter
                  ? "bg-cream text-ink shadow"
                  : "border border-line text-cream/70 hover:border-gold/50 hover:text-cream"
              }`}
            >
              الكل
            </button>
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(filter === c ? "" : c)}
                className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${
                  filter === c
                    ? "bg-cream text-ink shadow"
                    : "border border-line text-cream/70 hover:border-gold/50 hover:text-cream"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* شبكة الأعمال */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((w, i) => (
            <WorkCard key={w.id} work={w} delay={(i % 3) * 80} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-10 text-center text-cream/50">
            لا أعمال في هذا التصنيف بعد.
          </p>
        )}
      </div>
    </section>
  );
}
