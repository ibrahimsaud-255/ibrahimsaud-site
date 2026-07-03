"use client";

import { useBrands } from "@/lib/siteData";

export default function Brands() {
  const brands = useBrands();
  if (!brands.length) return null;
  // نكرّر القائمة مرتين عشان الحركة تكون مستمرة بدون فجوة
  const items = [...brands, ...brands];

  return (
    <section className="border-y border-line/60 py-12">
      <div className="mx-auto mb-8 max-w-6xl px-5 text-center">
        <p className="text-sm font-bold tracking-widest text-gold">موثوق من</p>
        <h2 className="mt-2 text-xl font-black text-cream/90 sm:text-2xl">
          شركات وجهات تعاملت معها
        </h2>
      </div>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-16">
          {items.map((b, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={b.logo}
              alt={b.name}
              loading="lazy"
              className="h-16 w-auto max-w-[180px] shrink-0 object-contain opacity-75 grayscale transition duration-300 hover:scale-110 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
