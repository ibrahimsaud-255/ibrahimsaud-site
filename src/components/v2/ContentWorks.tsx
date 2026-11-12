"use client";

// معرض «صناعة المحتوى»: أبرز الأعمال ببطاقات كبيرة، ثمّ قسم لكلّ نوع، والضغط يفتح المشغّل داخل الصفحة
// (العميل يشوف الشغل بدون ما يطلع من الموقع). الترتيب والنصوص في src/lib/content.ts.
import { useEffect, useState, type ReactNode } from "react";
import { featured, groups, workThumb, workUrl, contentWa, type ContentGroup } from "@/lib/content";
import type { Work } from "@/lib/site";

type Open = { w: Work; tall: boolean } | null;

const Play = () => (
  <span className="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg></span>
);

function embedSrc(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]{20,})/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  return null;
}

function Thumb({ w, tall }: { w: Work; tall: boolean }) {
  const [src, setSrc] = useState(workThumb(w, tall));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      // صورة الشورتس العموديّة مو متوفّرة دائماً — نرجع للأفقيّة
      onError={() => { const f = workThumb(w, false); if (f !== src) setSrc(f); }}
    />
  );
}

function Card({ w, tall, big, onOpen }: { w: Work; tall: boolean; big?: boolean; onOpen: () => void }) {
  return (
    <button type="button" className={`v2-cw ${tall ? "tall" : ""} ${big ? "big" : ""}`} onClick={onOpen} aria-label={`شغّل: ${w.title}`}>
      <span className="th"><Thumb w={w} tall={tall} /><Play /></span>
      <span className="tx">
        <span className="cl">{w.client}</span>
        <span className="t">{w.title}</span>
        {big && w.roles.length > 0 && <span className="roles">{w.roles.join(" · ")}</span>}
      </span>
    </button>
  );
}

function Player({ open, onClose }: { open: NonNullable<Open>; onClose: () => void }) {
  const { w, tall } = open;
  const url = workUrl(w);
  const src = embedSrc(url);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    document.documentElement.classList.add("v2-menu-open");
    return () => { removeEventListener("keydown", esc); document.documentElement.classList.remove("v2-menu-open"); };
  }, [onClose]);
  return (
    <div className="v2-player" role="dialog" aria-modal="true" aria-label={w.title} onClick={onClose}>
      <div className={`box ${tall ? "tall" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="إغلاق">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
        <div className="frame">
          {src
            ? <iframe src={src} title={w.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            : <a href={url} target="_blank" rel="noopener" className="v2-btn v2-btn-primary">افتح المقطع</a>}
        </div>
        <div className="info">
          <div className="cl">{w.client}</div>
          <h3>{w.title}</h3>
          {w.desc && <p>{w.desc}</p>}
          {w.roles.length > 0 && <div className="roles">{w.roles.map((r) => <span key={r}>{r}</span>)}</div>}
          <div className="acts">
            <a className="v2-btn v2-btn-primary sm" href={contentWa(w.title)} target="_blank" rel="noopener">أبي شي مثله</a>
            {url && <a className="v2-link" href={url} target="_blank" rel="noopener">افتح في نافذة <span className="chev">‹</span></a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ g, onOpen }: { g: ContentGroup; onOpen: (w: Work, tall: boolean) => void }) {
  const tall = g.shape === "tall";
  return (
    <section className="v2-cgroup" id={g.id} data-rise>
      <div className="v2-head">
        <h2>{g.title}</h2>
        <p>{g.text}</p>
      </div>
      <div className={`v2-cgrid ${tall ? "tall" : ""}`} style={tall ? undefined : ({ "--n": Math.min(g.items.length, 4) } as React.CSSProperties)}>
        {g.items.map((w) => <Card key={w.id} w={w} tall={tall} onOpen={() => onOpen(w, tall)} />)}
      </div>
    </section>
  );
}

// reels: قسم الإعلانات الطوليّة (له مشغّله الخاصّ) — يُدرج بعد القسم رقم reelsAfter
export default function ContentWorks({ reels, reelsAfter = 1 }: { reels?: ReactNode; reelsAfter?: number }) {
  const [open, setOpen] = useState<Open>(null);
  const onOpen = (w: Work, tall: boolean) => setOpen({ w, tall });
  return (
    <>
      <section className="v2-sec" id="featured">
        <div className="v2-wrap">
          <div className="v2-head" data-rise>
            <h2>أبرز الأعمال.</h2>
            <p>اضغط على أيّ عمل وشاهده هنا مباشرة.</p>
          </div>
          <div className="v2-cfeat" data-rise>
            {featured.map((w) => <Card key={w.id} w={w} tall={false} big onOpen={() => onOpen(w, false)} />)}
          </div>
        </div>
      </section>

      <div className="v2-sec alt" style={{ paddingTop: "clamp(56px, 7vw, 90px)" }}>
        <div className="v2-wrap v2-cgroups">
          {groups.map((g, i) => (
            <div key={g.id}>
              <Group g={g} onOpen={onOpen} />
              {i === reelsAfter && reels}
            </div>
          ))}
        </div>
      </div>

      {open && <Player open={open} onClose={() => setOpen(null)} />}
    </>
  );
}
