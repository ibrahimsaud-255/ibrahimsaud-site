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
  // لو وصلت صور فعلية، نعرض المتوفّر فقط؛ ولو ما فيه ولا صورة نعرض ٤ خانات فارغة
  const filled = [0, 1, 2, 3].filter((i) => images[i]);
  const slots = filled.length ? filled : [0, 1, 2, 3];
  const [active, setActive] = useState(slots[0]);

  return (
    <div>
      <SlotImage
        src={images[active]}
        alt={name}
        ratio="aspect-[4/5]"
        slot={`صورة المنتج ${active + 1}`}
        path={`public/sarah/products/${productId}-${active + 1}.webp`}
      />
      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(slots.length, 4)}, minmax(0, 1fr))` }}
      >
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
