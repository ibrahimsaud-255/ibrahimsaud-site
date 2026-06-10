import { brands, waLink } from "@/lib/site";

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
        <div className="marquee-track flex w-max items-center gap-14">
          {items.map((b, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={b.logo}
              alt={b.name}
              loading="lazy"
              className="h-12 w-auto max-w-[150px] shrink-0 object-contain opacity-70 transition hover:opacity-100"
            />
          ))}
        </div>
      </div>

      {/* زر التواصل */}
      <div className="mt-14 text-center">
        <p className="mb-5 text-cream/70">جاهز تكون علامتك التالية؟</p>
        <a
          href={waLink("السلام عليكم، أبي أطلب فيديو إعلاني 🎬")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-gold-soft"
        >
          <span className="text-xl">📱</span>
          تواصل عبر واتساب
        </a>
      </div>
    </section>
  );
}
