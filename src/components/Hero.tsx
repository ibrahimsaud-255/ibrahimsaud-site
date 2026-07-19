"use client";

// الواجهة الرئيسية — صورة واحدة تملأ أول شاشة، وسطر صغير أسفلها فقط.
// الصورة تُدار من النظام الداخلي (site_settings → hero_main) مع نسخة احتياطية محلية،
// والسطر السفلي من «محتوى الموقع» (مفتاح hero → tagline).

import { useSettings } from "@/lib/siteData";
import { useContent } from "@/lib/cms";

export default function Hero() {
  const settings = useSettings();
  const c = useContent("hero", { tagline: "تقنية أعمال · بودكاست" });
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
      {/* تدرّج أسفل الصورة ليندمج مع بقية الصفحة ويوضّح السطر */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink" />

      {/* سطر صغير أسفل الصورة */}
      <p className="absolute inset-x-0 bottom-10 text-center text-sm font-medium text-cream/75 sm:text-base">
        {c.tagline}
      </p>
    </section>
  );
}
