"use client";

// خانة صورة: لو الصورة موجودة تظهر، ولو ما رُفعت بعد يظهر مكانها
// مربّع منقّط يوضّح المسار المطلوب ومقاس الصورة — بدون ما ينكسر الشكل.

import { useState } from "react";

export default function SlotImage({
  src,
  alt,
  slot,
  path,
  ratio = "aspect-[4/5]",
  className = "",
  rounded = "rounded-2xl",
}: {
  src?: string;
  alt: string;
  slot?: string; // اسم الخانة، مثال: «صورة رئيسية»
  path?: string; // المسار المقترح لرفع الصورة
  ratio?: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${ratio} ${className} ${
        show ? "bg-sand-deep" : "slot-empty"
      }`}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
          <svg viewBox="0 0 24 24" className="size-8 fill-none stroke-clay/70" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="m4 17 4.5-4.5 3 3L15 12l5 5" />
          </svg>
          <p className="text-xs font-bold text-clay-deep">{slot ?? "مكان الصورة"}</p>
          {path ? (
            <p dir="ltr" className="max-w-full truncate text-[10px] text-cocoa/70">
              {path}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
