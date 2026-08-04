"use client";

// خانة صورة: لو الصورة موجودة تظهر، ولو ما رُفعت بعد يظهر مكانها
// مربّع منقّط يوضّح المسار المطلوب ومقاس الصورة — بدون ما ينكسر الشكل.

import { useState } from "react";
import { IconImage } from "./icons";

export default function SlotImage({
  src,
  alt,
  slot,
  path,
  ratio = "aspect-[4/5]",
  className = "",
  rounded = "rounded-2xl",
  fit = "cover",
}: {
  src?: string;
  alt: string;
  slot?: string; // اسم الخانة، مثال: «صورة رئيسية»
  path?: string; // المسار المقترح لرفع الصورة
  ratio?: string;
  className?: string;
  rounded?: string;
  fit?: "cover" | "contain"; // contain = تظهر القطعة كاملة بلا قص
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
          className={`size-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          loading="lazy"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
          <IconImage className="size-8 text-clay/70" />
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
