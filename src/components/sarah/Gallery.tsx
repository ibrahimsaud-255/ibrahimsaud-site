"use client";

// معرض صور المنتج — ٤ خانات: صورة كبيرة + ٣ مصغّرات.
// كل خانة تعرض مسار الصورة المطلوب حتى تُرفع.

import { useState } from "react";
import SlotImage from "./SlotImage";

export default function Gallery({
  images,
  name,
  productId,
}: {
  images: string[];
  name: string;
  productId: string;
}) {
  const slots = [0, 1, 2, 3];
  const [active, setActive] = useState(0);

  return (
    <div>
      <SlotImage
        src={images[active]}
        alt={name}
        ratio="aspect-[4/5]"
        slot={`صورة المنتج ${active + 1}`}
        path={`public/sarah/products/${productId}-${active + 1}.webp`}
      />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {slots.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`overflow-hidden rounded-xl transition ${
              active === i ? "ring-2 ring-clay" : "opacity-75 hover:opacity-100"
            }`}
          >
            <SlotImage
              src={images[i]}
              alt={`${name} ${i + 1}`}
              ratio="aspect-square"
              rounded="rounded-xl"
              slot={`${i + 1}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
