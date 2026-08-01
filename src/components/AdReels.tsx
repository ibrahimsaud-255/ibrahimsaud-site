"use client";

// قسم الأعمال — إعلانات طولية (٩:١٦) فقط. كل بطاقة بصورة طولية وزر تشغيل،
// والضغط عليها يفتح المشغّل بأسلوب تيك توك على المقطع نفسه.
// المقاطع تُدار من src/lib/reels.ts — والعناوين من النظام الداخلي (مفتاح reels).

import { useState } from "react";
import { reels, reelPoster, type Reel } from "@/lib/reels";
import { waLink } from "@/lib/site";
import { useContent } from "@/lib/cms";
import Reveal from "./Reveal";
import ReelsExperience from "./ReelsExperience";

const fallback = {
  label: "الأعمال",
  title: "إعلانات طولية لعلامات مختلفة",
  sub: "عقار · أقفال ذكية · زيوت سيارات · تجارة إلكترونية · تطبيقات — قطاعات متباعدة بمعيار إنتاج واحد.",
  hint: "اضغط لمشاهدة أي مقطع",
};

function ReelCard({
  reel,
  onOpen,
  delay,
}: {
  reel: Reel;
  onOpen: () => void;
  delay: number;
}) {
  const poster = reelPoster(reel);
  return (
    <Reveal delay={delay}>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border border-line bg-ink-soft text-right transition duration-300 hover:-translate-y-1.5 hover:border-gold/50"
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={`${reel.client} — ${reel.category}`}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}

        {/* تدرّج أسود يوضّح الكلام */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/25" />

        {/* زر التشغيل */}
        <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-xl text-ink shadow-lg transition group-hover:scale-110 sm:size-16">
          ▶
        </span>

        {/* اسم العلامة والقطاع */}
        <span className="absolute inset-x-0 bottom-0 block p-4 text-center">
          <span className="block truncate text-sm font-black text-white sm:text-base">
            {reel.client}
          </span>
          <span className="mt-0.5 block text-xs font-bold text-gold sm:text-sm">
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

  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-gold">
                {c.label}
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                {c.title}
              </h2>
              <p className="mt-4 max-w-2xl text-cream/70">{c.sub}</p>
            </div>
            <p className="text-sm font-bold text-gold">{c.hint}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {reels.map((r, i) => (
            <ReelCard
              key={r.id}
              reel={r}
              delay={(i % 3) * 80}
              onOpen={() => setOpenAt(i)}
            />
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-lg font-extrabold text-cream">
              منتجك يستاهل إعلان بهذا المستوى.
            </p>
            <a
              href={waLink("السلام عليكم، شفت أعمالك وأبي فيديو إعلاني لمنتجي 🎬")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-black text-ink transition hover:bg-gold-soft"
            >
              اطلب إعلانك عبر واتساب
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
