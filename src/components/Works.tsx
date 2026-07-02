"use client";

import { useCallback, useEffect, useState } from "react";
import {
  works,
  audiences,
  adPackages,
  waLink,
  type Audience,
  type Work,
} from "@/lib/site";
import Reveal from "./Reveal";
import { toEmbed } from "@/lib/embed";

const PKG_COLORS: Record<string, string> = {
  red: "#e11d48",
  blue: "#2563eb",
  yellow: "#eab308",
};

const arPrice = (n: number) => n.toLocaleString("ar-EG");
const AR_DIGITS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const arNum = (n: number) => AR_DIGITS[n - 1] ?? String(n);

// ترتيب عرض تصنيفات الفيديو داخل كل قسم.
const ORDER = [
  "أعمال سينمائية",
  "تغطية فعاليات",
  "إعلانات منتجات",
  "مقابلات الشارع",
];

// باقات أسعار المتاجر — تظهر فقط داخل قسم «المتاجر الإلكترونية».
function StorePricing() {
  return (
    <div className="mt-14">
      <Reveal>
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-black text-cream sm:text-2xl">
            باقات المتاجر وأسعارها
          </h4>
          <div className="h-px flex-1 bg-line/60" />
        </div>
        <p className="mt-3 max-w-2xl text-sm text-cream/70">
          أسعار مخصّصة للمتاجر الإلكترونية — اختر باقتك وابدأ فوراً.
        </p>
      </Reveal>

      <div className="mt-6 grid gap-5 sm:gap-6 md:grid-cols-3">
        {adPackages.map((p, i) => {
          const c = PKG_COLORS[p.color];
          return (
            <Reveal key={p.id} delay={(i % 3) * 80}>
              <div
                className="flex h-full flex-col rounded-3xl border bg-ink-card p-6 transition hover:-translate-y-1"
                style={{
                  borderColor: `${c}55`,
                  borderTopWidth: 4,
                  borderTopColor: c,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h5 className="text-lg font-black text-cream">{p.name}</h5>
                  {p.badge && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black text-white"
                      style={{ backgroundColor: c }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-cream/60">{p.tagline}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black" style={{ color: c }}>
                    {arPrice(p.price)}
                  </span>
                  <span className="text-sm font-bold text-cream/70">ريال</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-2.5 text-sm leading-relaxed text-cream/80"
                    >
                      <span className="mt-0.5 font-black" style={{ color: c }}>
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(
                    `السلام عليكم، عندي متجر وأبي «${p.name}» (${p.price} ريال) 🛒`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white transition hover:opacity-90"
                  style={{ backgroundColor: c, marginTop: "auto" }}
                >
                  اطلب هذه الباقة
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

// أيقونة القسم (شركات/متاجر) — رسمة خطية ذهبية بسيطة.
function SegmentIcon({
  kind,
  size = "size-12",
  icon = "size-6",
}: {
  kind: "building" | "store";
  size?: string;
  icon?: string;
}) {
  return (
    <span
      className={`grid ${size} place-items-center rounded-2xl glass-pill text-gold`}
    >
      <svg
        viewBox="0 0 24 24"
        className={icon}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {kind === "building" ? (
          <>
            <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
            <path d="M15 21V9h4a1 1 0 0 1 1 1v11" />
            <path d="M3 21h18" />
            <path d="M7 8h2M7 12h2M7 16h2" />
          </>
        ) : (
          <>
            <path d="M4 9h16l-1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L4 9Z" />
            <path d="M4 9 6 4h12l2 5" />
            <path d="M9 13a3 3 0 0 0 6 0" />
          </>
        )}
      </svg>
    </span>
  );
}

/* ============================================================
   البوابة الرئيسية: خياران — شركات وجهات / متاجر إلكترونية
   ============================================================ */
function Gateway({ onPick }: { onPick: (a: Audience) => void }) {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      {audiences.map((seg, i) => {
        const count = works.filter((w) => w.audience === seg.id).length;
        return (
          <Reveal key={seg.id} delay={i * 100}>
            <button
              type="button"
              onClick={() => onPick(seg.id)}
              className="group relative block w-full overflow-hidden rounded-3xl glass-card p-8 text-start transition hover:-translate-y-1.5 hover:border-gold/40 sm:p-10"
            >
              <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/20" />
              <SegmentIcon kind={seg.icon} size="size-16" icon="size-8" />
              <h3 className="mt-6 text-2xl font-black text-cream sm:text-3xl">
                {seg.label}
              </h3>
              <p className="mt-3 max-w-md text-cream/70">{seg.tagline}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full glass-pill px-3 py-1 text-xs font-bold text-gold">
                  {seg.priceNote}
                </span>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-cream/60">
                  {count} عمل
                </span>
              </div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition group-hover:gap-3.5">
                تصفّح الأعمال
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ============================================================
   بطاقة الشعار: مستطيل بمقاس الفيديو، شعار العميل في الوسط،
   والضغط يشغّل الفيديو مباشرة.
   ============================================================ */
function LogoTile({ work, onPlay }: { work: Work; onPlay: (w: Work) => void }) {
  const hasVideo = Boolean(work.videos?.length || work.videoUrl);
  return (
    <button
      type="button"
      disabled={!hasVideo}
      onClick={() => hasVideo && onPlay(work)}
      className="group relative block w-full overflow-hidden rounded-2xl glass-card text-start transition enabled:hover:-translate-y-1 enabled:hover:border-gold/40 disabled:cursor-default"
    >
      {/* منطقة الشعار — بنسبة الفيديو 16:9 */}
      <div className="relative grid aspect-video place-items-center overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_180px_at_50%_0%,rgba(231,178,76,.09),transparent_70%)]" />
        {work.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.logo}
            alt={work.client}
            className="max-h-24 w-auto max-w-[70%] object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,.45)] transition group-enabled:group-hover:scale-105 sm:max-h-28"
            loading="lazy"
          />
        ) : (
          <span className="px-4 text-center text-xl font-black leading-snug text-cream/90 sm:text-2xl">
            {work.client}
          </span>
        )}

        {/* زر تشغيل يظهر عند المرور */}
        {hasVideo && (
          <span className="absolute inset-0 grid place-items-center bg-ink/0 transition group-hover:bg-ink/45">
            <span className="grid size-14 scale-75 place-items-center rounded-full bg-gold text-ink opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
              <svg
                viewBox="0 0 24 24"
                className="size-6 ltr:ml-0.5 rtl:mr-0.5"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
          </span>
        )}
      </div>

      {/* شريط المعلومات */}
      <div className="border-t border-line/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-cream">
            {work.title}
          </span>
          {!hasVideo && (
            <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-bold text-cream/50">
              قريباً
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-xs text-cream/55">
          {work.client} · {work.category}
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   مشغّل الفيديو (نافذة فوقية)
   ============================================================ */
function Player({ work, onClose }: { work: Work; onClose: () => void }) {
  const urls = work.videos?.length
    ? work.videos
    : work.videoUrl
      ? [work.videoUrl]
      : [];
  const [idx, setIdx] = useState(0);
  const embed = toEmbed(urls[idx] ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink/85 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-ink-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-3.5">
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-cream">
              {work.title}
            </div>
            <div className="truncate text-xs text-cream/55">{work.client}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-cream/70 transition hover:bg-white/10 hover:text-cream"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {embed.kind === "iframe" && (
            <iframe
              key={embed.src}
              src={`${embed.src}${embed.src.includes("?") ? "&" : "?"}autoplay=1`}
              className="absolute inset-0 size-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              title={work.title}
            />
          )}
          {embed.kind === "video" && (
            <video
              key={embed.src}
              src={embed.src}
              className="absolute inset-0 size-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>

        {urls.length > 1 && (
          <div className="flex flex-wrap gap-2 border-t border-line/60 px-5 py-3">
            {urls.map((u, i) => (
              <button
                key={u}
                type="button"
                onClick={() => setIdx(i)}
                className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
                  i === idx
                    ? "bg-gold text-ink"
                    : "border border-line text-cream/70 hover:bg-white/10"
                }`}
              >
                مقطع {arNum(i + 1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   عرض القسم: رأس القسم + شبكات الشعارات حسب نوع الفيديو
   ============================================================ */
function Segment({
  id,
  onBack,
  onPlay,
}: {
  id: Audience;
  onBack: () => void;
  onPlay: (w: Work) => void;
}) {
  const seg = audiences.find((a) => a.id === id);
  if (!seg) return null;

  const items = works.filter((w) => w.audience === id);
  const groups = ORDER.map((cat) => ({
    cat,
    items: items.filter((w) => w.category === cat),
  })).filter((g) => g.items.length);

  return (
    <div className="mt-10">
      {/* رجوع + رأس القسم */}
      <Reveal>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-cream/75 transition hover:border-gold/40 hover:text-cream"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 rtl:-scale-x-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          كل الأقسام
        </button>

        <div className="mt-5 glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <SegmentIcon kind={seg.icon} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-2xl font-black text-cream sm:text-3xl">
                  {seg.label}
                </h3>
                <span className="rounded-full glass-pill px-3 py-1 text-xs font-bold text-gold">
                  {seg.priceNote}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-cream/75">{seg.tagline}</p>
              <p className="mt-1 text-sm text-cream/55">{seg.size}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* شبكات الشعارات حسب نوع الفيديو */}
      {groups.map((g) => (
        <div key={g.cat} className="mt-12">
          <Reveal>
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-black text-cream sm:text-2xl">
                {g.cat}
              </h4>
              <span className="rounded-full border border-line px-3 py-0.5 text-xs font-bold text-cream/55">
                {g.items.length}
              </span>
              <div className="h-px flex-1 bg-line/60" />
            </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {g.items.map((w, i) => (
              <Reveal key={w.id} delay={(i % 3) * 80}>
                <LogoTile work={w} onPlay={onPlay} />
              </Reveal>
            ))}
          </div>
        </div>
      ))}

      {/* أسعار الباقات — للمتاجر فقط */}
      {id === "stores" && <StorePricing />}
    </div>
  );
}

export default function Works() {
  const [seg, setSeg] = useState<Audience | null>(null);
  const [playing, setPlaying] = useState<Work | null>(null);

  const goTop = useCallback(() => {
    document
      .getElementById("works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const pick = useCallback(
    (a: Audience) => {
      setSeg(a);
      goTop();
    },
    [goTop],
  );
  const back = useCallback(() => {
    setSeg(null);
    goTop();
  }, [goTop]);

  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الأعمال</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            {seg === null
              ? "من أنت؟ اختر قسمك وشاهد أعماله."
              : "اضغط أي شعار — يشتغل الفيديو."}
          </h2>
          {seg === null && (
            <p className="mt-4 max-w-2xl text-cream/70">
              كل قسم له طابعه وأسعاره ونوع مقاطعه: الشركات والجهات لها الأفلام
              والبرومو والتغطيات، والمتاجر الإلكترونية لها إعلانات المنتجات
              المباشرة.
            </p>
          )}
        </Reveal>

        {seg === null ? (
          <Gateway onPick={pick} />
        ) : (
          <Segment id={seg} onBack={back} onPlay={setPlaying} />
        )}
      </div>

      {playing && <Player work={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}
