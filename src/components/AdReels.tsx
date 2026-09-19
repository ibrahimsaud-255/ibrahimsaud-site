"use client";

// قسم الأعمال — إعلانات طولية (٩:١٦) فقط. كل بطاقة بصورة طولية وزر تشغيل،
// والضغط عليها يفتح المشغّل بأسلوب تيك توك على المقطع نفسه.
// المقاطع تُدار من src/lib/reels.ts — والعناوين من النظام الداخلي (مفتاح reels).

import { useRef, useState } from "react";
import { reels, reelPoster, type Reel } from "@/lib/reels";
import { waLink } from "@/lib/site";
import { useContent } from "@/lib/cms";
import Reveal from "./Reveal";
import ReelsExperience from "./ReelsExperience";

const fallback = {
  label: "الأعمال",
  title: "شوف الإعلانات قبل ما تقرّر.",
  sub: "عقار · قهوة · أقفال ذكية · زيوت سيارات · متاجر إلكترونية · تطبيقات — قطاعات ما تشبه بعض، ونفس المعيار في كلها: هوك سريع، رسالة واحدة، ودعوة واضحة في النهاية.",
  hint: "اضغط أي مقطع وشغّله",
};

const ARNUM = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦", "٠٧", "٠٨", "٠٩", "١٠", "١١", "١٢", "١٣", "١٤", "١٥", "١٦", "١٧", "١٨", "١٩", "٢٠"];

function ReelCard({
  reel,
  onOpen,
  delay,
  index,
}: {
  reel: Reel;
  onOpen: () => void;
  delay: number;
  index: number;
}) {
  const poster = reelPoster(reel);
  return (
    <Reveal delay={delay}>
      <button
        type="button"
        data-card
        onClick={onOpen}
        className="group relative block aspect-[9/16] w-[62vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-cream/12 bg-ink-soft text-right transition duration-300 hover:border-cream/40 sm:w-[300px]"
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={`${reel.client} — ${reel.category}`}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        )}

        {/* تدرّج أسود لإبراز النص */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/45" />

        {/* رقم الفهرسة — يعطي العمل ثقلاً */}
        <span className="absolute right-3 top-2.5 text-2xl font-black leading-none text-white/85 sm:text-3xl">
          {ARNUM[index] || index + 1}
        </span>

        {/* زر تشغيل زجاجي أبيض */}
        <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 pl-0.5 text-lg text-white backdrop-blur-md transition group-hover:scale-110 group-hover:bg-white/20 sm:size-14">
          ▶
        </span>

        {/* بيانات العمل */}
        <span className="absolute inset-x-0 bottom-0 block p-3.5 sm:p-4">
          <span className="mb-1.5 block h-px w-8 bg-white/40" />
          <span className="block truncate text-sm font-black text-white sm:text-base">
            {reel.client}
          </span>
          <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wider text-white/60 sm:text-xs">
            {reel.category}
          </span>
        </span>
      </button>
    </Reveal>
  );
}

export default function AdReels() {
  const c = useContent("reels", fallback);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  function slide(dir: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount * -1, behavior: "smooth" });
  }

  return (
    <section id="works" className="border-t border-line/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-cream/60">
                {c.label}
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                {c.title}
              </h2>
              <p className="mt-4 max-w-2xl text-cream/70">{c.sub}</p>
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

      {/* السلايدر — بطاقات طولية تلفّ بينها بالسحب أو الأسهم */}
      <Reveal>
        <div
          ref={scroller}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 [scroll-padding-inline:1.5rem]"
        >
          {reels.map((r, i) => (
            <ReelCard
              key={r.id}
              reel={r}
              index={i}
              delay={0}
              onOpen={() => setOpenAt(i)}
            />
          ))}
          <div aria-hidden className="w-2 shrink-0" />
        </div>
      </Reveal>

      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-xl font-extrabold text-cream sm:text-2xl">
              إعلان منتجك يقدر يكون المقطع القادم في هذي القائمة.
            </p>
            <p className="max-w-md text-sm text-cream/65">
              أرسل لي منتجك وجمهورك، وأرجع لك بفكرة الإعلان وعرض السعر — بلا
              التزام.
            </p>
            <a
              href={waLink(
                "السلام عليكم إبراهيم، شفت أعمالك وأبي إعلان لمنتجي 🎬\nالمنتج: \nجمهوري: ",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-full bg-cream px-8 py-3.5 text-sm font-black text-ink transition hover:bg-white"
            >
              ابدأ إعلانك عبر واتساب
            </a>
          </div>
        </Reveal>
      </div>

      {/* المشغّل يُركَّب من جديد مع كل فتح (key) ليبدأ من المقطع المضغوط */}
      {openAt !== null && (
        <ReelsExperience
          key={openAt}
          openAt={openAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}
