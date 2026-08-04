import Link from "next/link";
import SlotImage from "./SlotImage";
import { sar, type Product } from "@/lib/sarah";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-ecru bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-clay/10">
      <Link href={`/sarah/products/${p.id}`} className="block">
        <SlotImage
          src={p.images[0]}
          alt={p.name}
          ratio="aspect-[4/5]"
          rounded="rounded-none"
          slot="الصورة الرئيسية"
          path={`public/sarah/products/${p.id}-1.webp`}
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/sarah/products/${p.id}`}>
            <h3 className="text-base font-black text-espresso transition group-hover:text-clay">
              {p.name}
            </h3>
          </Link>
          <span className="shrink-0 rounded-full bg-sand-deep px-2.5 py-1 text-[10px] font-bold text-cocoa">
            {p.days}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-cocoa">{p.tagline}</p>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-ecru pt-3">
          <div>
            <span className="block text-[10px] text-cocoa">يبدأ من</span>
            <span className="text-lg font-black text-clay">{sar(p.price)}</span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/sarah/products/${p.id}`}
              className="rounded-full border border-ecru px-3 py-2 text-[11px] font-bold text-cocoa transition hover:border-clay hover:text-clay"
            >
              التفاصيل
            </Link>
            <Link
              href={`/sarah/order?product=${p.id}`}
              className="rounded-full bg-clay px-4 py-2 text-[11px] font-black text-white transition hover:bg-clay-deep"
            >
              اطلبيه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
