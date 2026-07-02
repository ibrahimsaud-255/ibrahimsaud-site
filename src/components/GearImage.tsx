"use client";

import { useState } from "react";

// صورة المنتج مع بديل «الصورة قريباً» تلقائياً لو الملف غير موجود بعد
// (يظهر البديل عند فشل تحميل الصورة أو عند عدم وجود مسار).
export default function GearImage({
  src,
  name,
}: {
  src?: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-ink-soft text-center">
        <span className="grid size-12 place-items-center rounded-2xl glass-pill text-gold">
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m21 16-4.5-4.5L7 21" />
          </svg>
        </span>
        <span className="text-xs font-bold text-cream/50">الصورة قريباً</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-contain p-3"
      />
    </div>
  );
}
