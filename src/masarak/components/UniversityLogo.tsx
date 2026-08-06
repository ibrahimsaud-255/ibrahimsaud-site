"use client";

import { useState } from "react";
import { BRAND } from "../config";
import { LOGO_FILES } from "../data/logos";
import type { University } from "../types";

/** «جامعة الملك سعود» → «م س» — حرف أول من أول كلمتين دالّتين */
function monogram(name: string): string {
  const skip = new Set(["جامعة", "الجامعة", "بن", "بنت", "عبد", "في"]);
  const words = name
    .replace(/^جامعة\s+/, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !skip.has(w))
    .map((w) => w.replace(/^ال/, ""))
    .filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join(" ");
}

/**
 * شعار الجامعة الرسمي من `public/masarak/logos/<id>.png`.
 * إن لم يوجد الملف، يظهر حرفان بلون هوية الجامعة بدل الصورة المكسورة.
 */
export default function UniversityLogo({
  uni,
  size = "md",
}: {
  uni: University;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const cls = `mk-logo${size === "lg" ? " mk-logo-lg" : ""}`;
  const file = LOGO_FILES[uni.id];

  if (!file || failed) {
    return (
      <div className={cls} style={{ background: uni.color }}>
        <span className="mk-logo-fallback">{monogram(uni.name)}</span>
      </div>
    );
  }

  return (
    <div className={cls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BRAND.logosPath}/${file}`}
        alt={`شعار ${uni.name}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
