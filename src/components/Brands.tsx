import { brands } from "@/lib/site";

export default function Brands() {
  if (!brands.length) return null;
  // نكرّر القائمة مرتين عشان الحركة تكون مستمرة بدون فجوة
  const items = [...brands, ...brands];

  return (
    <section className="border-t border-line/60 py-16">
      <div className="mx-auto mb-8 max-w-6xl px-5 text-center">
        <p className="text-sm font-bold tracking-widest text-gold">
          علامات تجارية
        </p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          شركات وعلامات تعاملت معها
        </h2>
      </div>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-6">
          {items.map((b, i) => (
            <div
              key={i}
              className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border border-line bg-ink-card px-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                className="max-h-12 max-w-full object-contain opacity-80 transition hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
