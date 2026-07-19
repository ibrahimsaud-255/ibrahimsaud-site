"use client";

// الواجهة الرئيسية — صورة واحدة فقط تملأ أول شاشة، بدون أي نصوص أو أزرار.
// الصورة تُدار من النظام الداخلي (site_settings → hero_main) مع نسخة احتياطية محلية.

import { useSettings } from "@/lib/siteData";

export default function Hero() {
  const settings = useSettings();
  const override = (settings.hero_main as { url?: string } | undefined)?.url;
  const photo = override || "/identity/hero-wide.jpg";

  return (
    <section
      id="top"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        srcSet={
          override
            ? undefined
            : "/identity/hero-wide-1600.jpg 1600w, /identity/hero-wide.jpg 2560w"
        }
        sizes="100vw"
        alt="إبراهيم سعود"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover object-center"
      />
      {/* تدرّج خفيف أسفل الصورة ليندمج مع بقية الصفحة */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </section>
  );
}
