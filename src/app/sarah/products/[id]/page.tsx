import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/sarah/Gallery";
import OrderForm from "@/components/sarah/OrderForm";
import ProductCard from "@/components/sarah/ProductCard";
import { IconCheck } from "@/components/sarah/icons";
import {
  alphaSizes,
  categories,
  fabrics,
  lengthSizes,
  products,
  productById,
  sar,
  sarah,
  waLink,
} from "@/lib/sarah";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = productById(id);
  if (!p) return { title: "القطعة غير موجودة" };
  return {
    title: `${p.name} — ${sar(p.price)}`,
    description: p.desc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = productById(id);
  if (!p) notFound();

  const cat = categories.find((c) => c.id === p.category);
  const productFabrics = fabrics.filter((f) => p.fabrics.includes(f.id));
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

  const sizingLabel =
    p.sizing === "alpha"
      ? "مقاسات عالمية (XS – 4XL)"
      : p.sizing === "length"
        ? "مقاسات الطول العالمية (٥٢ – ٦٠ بوصة)"
        : "تفصيل على مقاسك (١١ قياساً)";

  return (
    <main className="px-5 py-10">
      <div className="mx-auto max-w-6xl">
        {/* المسار */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-cocoa">
          <Link href="/sarah" className="hover:text-clay">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/sarah#products" className="hover:text-clay">
            {cat?.name ?? "المنتجات"}
          </Link>
          <span>/</span>
          <span className="text-espresso">{p.name}</span>
        </nav>

        {/* الصور + التفاصيل */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Gallery images={p.images} name={p.name} productId={p.id} />

          <div>
            <span className="rounded-full bg-sand-deep px-3 py-1 text-[11px] font-bold text-cocoa">
              {cat?.name}
            </span>
            <h1 className="mt-3 text-3xl font-black leading-tight text-espresso sm:text-4xl">
              {p.name}
            </h1>
            <p className="mt-2 text-sm text-cocoa">{p.tagline}</p>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black text-clay">{sar(p.price)}</span>
              <span className="pb-1 text-xs text-cocoa">
                السعر الأساسي — يزيد حسب الخامة والإضافات
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-cocoa">{p.desc}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoBox title="نظام المقاس" value={sizingLabel} />
              <InfoBox title="مدة التنفيذ" value={p.days} />
            </div>

            <div className="mt-6 rounded-3xl border border-ecru bg-white p-5">
              <p className="text-sm font-black text-espresso">السعر يشمل</p>
              <ul className="mt-3 space-y-2 text-sm text-cocoa">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <IconCheck className="mt-0.5 size-4 shrink-0 text-clay" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            {productFabrics.length ? (
              <div className="mt-4 rounded-3xl border border-ecru bg-white p-5">
                <p className="text-sm font-black text-espresso">الخامات المتاحة لهذه القطعة</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {productFabrics.map((f) => (
                    <span
                      key={f.id}
                      className="rounded-full bg-sand-deep px-3 py-1.5 text-[11px] font-bold text-espresso"
                    >
                      {f.name}
                      <span className="mr-1 text-clay">
                        {f.priceDelta ? `+${f.priceDelta}` : "مشمول"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* مرجع المقاسات السريع */}
            <div className="mt-4 rounded-3xl border border-ecru bg-sand-deep/60 p-5">
              <p className="text-sm font-black text-espresso">مرجع سريع للمقاس</p>
              {p.sizing === "length" ? (
                <p className="mt-2 text-xs leading-relaxed text-cocoa">
                  المقاس = الطول من الكتف حتى الطرف:{" "}
                  {lengthSizes.map((l) => `${l.size}" (${l.height[0]}–${l.height[1]} سم)`).join(" · ")}
                </p>
              ) : p.sizing === "alpha" ? (
                <p className="mt-2 text-xs leading-relaxed text-cocoa">
                  {alphaSizes
                    .slice(0, 6)
                    .map((s) => `${s.intl}: صدر ${s.bust[0]}–${s.bust[1]}`)
                    .join(" · ")}{" "}
                  — ويعادل EU {alphaSizes[0].eu}–{alphaSizes[5].eu}.
                </p>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-cocoa">
                  هذه القطعة تُفصَّل على مقاسك: نأخذ ١١ قياساً في نموذج الطلب، ونراجعها معك
                  في واتساب قبل بدء التنفيذ.
                </p>
              )}
              <Link
                href="/sarah/sizes"
                className="mt-3 inline-block text-xs font-black text-clay hover:underline"
              >
                دليل المقاسات الكامل ←
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#order" className="rounded-full bg-clay px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay-deep">
                جهّزي طلبك
              </a>
              <a
                href={waLink(`السلام عليكم ${sarah.name}،\nأستفسر عن: ${p.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ecru bg-white px-7 py-3.5 text-sm font-bold text-espresso transition hover:border-clay hover:text-clay"
              >
                استفسار سريع
              </a>
            </div>
          </div>
        </div>

        {/* نموذج الطلب */}
        <section id="order" className="mt-16 scroll-mt-20">
          <h2 className="mb-2 text-2xl font-black text-espresso">اطلبي {p.name}</h2>
          <p className="mb-6 text-sm text-cocoa">
            جهّزي التفاصيل هنا ويوصلنا الطلب كاملاً في واتساب — بدون دفع إلكتروني.
          </p>
          <OrderForm initialProduct={p.id} />
        </section>

        {/* قطع مشابهة */}
        {related.length ? (
          <section className="mt-16">
            <h2 className="mb-5 text-2xl font-black text-espresso">قطع مشابهة</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ecru bg-white p-4">
      <p className="text-[11px] text-cocoa">{title}</p>
      <p className="mt-1 text-sm font-black text-espresso">{value}</p>
    </div>
  );
}
