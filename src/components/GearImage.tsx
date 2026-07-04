"use client";

import { useState } from "react";

// صورة المنتج مع بديل «الصورة قريباً» تلقائياً لو الملف غير موجود بعد.
// accent (اختياري): لون مميّز يصنع توهّجاً خلف الصورة الشفافة (PNG) على خلفية داكنة.
// بدونه: خلفية بيضاء (للصور غير الشفافة مثل JPG).
export default function GearImage({
  src,
  name,
  accent,
}: {
  src?: string;
  name: string;
  accent?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-center"
        style={
          accent
            ? {
                background: `radial-gradient(circle at 50% 40%, ${accent}22, #0a0a0b 70%)`,
              }
            : undefined
        }
      >
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

  // مع لون مميّز: خلفية داكنة + توهّج ملوّن يُبرز الصورة الشفافة
  if (accent) {
    return (
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${accent}33, #0b0b0d 68%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-6 h-24 rounded-full opacity-60 blur-2xl"
          style={{ background: accent }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-contain p-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        />
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
