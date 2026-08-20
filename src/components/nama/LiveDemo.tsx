"use client";

import { useState } from "react";

// التجربة الحية: تُحمّل نسخة الويب من تطبيق نما داخل إطار جوال عند الطلب فقط.
export default function LiveDemo() {
  const [on, setOn] = useState(false);

  return (
    <div className="mx-auto max-w-sm">
      <div className="relative mx-auto w-full">
        <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-nleaf/20 blur-2xl" />
        <div className="rounded-[2.6rem] border-[10px] border-nink/90 bg-nink/90 shadow-[0_30px_60px_-15px_rgba(36,51,43,0.5)]">
          <div className="relative overflow-hidden rounded-[2rem] bg-ncream">
            {/* النوتش */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
              <div className="h-1.5 w-16 rounded-full bg-nink/15" />
            </div>

            {on ? (
              <iframe
                src="/nama-demo/index.html"
                title="تجربة تطبيق نُما الحيّة"
                className="h-[620px] w-full border-0"
                allow="fullscreen"
              />
            ) : (
              <button
                onClick={() => setOn(true)}
                className="nama-dotgrid flex h-[620px] w-full flex-col items-center justify-center gap-4 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-nforest text-ncream shadow-lg shadow-nforest/25 transition group-hover:scale-105">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-lg font-black text-nink">
                  شغّل التطبيق الحقيقي
                </span>
                <span className="max-w-[15rem] text-xs leading-relaxed text-nmuted">
                  نسخة ويب تفاعلية كاملة — تصفّح الأقسام وجرّب بنفسك.
                  <br />
                  (تحميل أولي بسيط)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <a
          href="/nama-demo/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-nforest underline decoration-nforest/30 underline-offset-4 transition hover:decoration-nforest"
        >
          افتح التجربة بملء الشاشة ↗
        </a>
      </div>
    </div>
  );
}
