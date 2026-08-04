import Link from "next/link";
import ProductCard from "@/components/sarah/ProductCard";
import SlotImage from "@/components/sarah/SlotImage";
import {
  IconChevron,
  IconNeedle,
  IconRepeat,
  IconRuler,
  IconScissors,
  IconTruck,
} from "@/components/sarah/icons";
import { AlphaTable, LengthTable, SizeCalculator } from "@/components/sarah/SizeGuide";
import {
  categories,
  fabrics,
  faq,
  freeShippingOver,
  products,
  regions,
  sar,
  sarah,
  waLink,
} from "@/lib/sarah";

export default function SarahHome() {
  const featured = products.filter((p) => p.featured);

  return (
    <main>
      {/* ============================ الهيرو ============================ */}
      <section className="px-5 pt-12 pb-14 sm:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-clay/10 px-4 py-1.5 text-xs font-bold text-clay-deep">
              <IconNeedle className="size-4" /> خياطة وتفصيل نسائي — {sarah.city} وشحن
              لكل المملكة
            </p>
            <h1 className="mt-5 text-[2rem] font-black leading-[1.2] text-espresso sm:text-5xl sm:leading-[1.15]">
              فستانك على مقاسك أنتِ،
              <br />
              مو على مقاس أحد ثاني.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cocoa">
              اختاري القطعة والخامة واللون، وحدّدي مقاسك بالنظام العالمي المعتمد
              (XS–4XL / EU / UK / US) أو أعطينا قياساتك ونفصّلها لك بالضبط. الطلب
              يوصلك جاهزاً ومكوياً خلال {sarah.leadTime}.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/sarah/order"
                className="rounded-full bg-clay px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay-deep"
              >
                ابدئي طلبك الآن
              </Link>
              <Link
                href="#products"
                className="rounded-full border border-ecru bg-white px-7 py-3.5 text-sm font-bold text-espresso transition hover:border-clay hover:text-clay"
              >
                تصفّحي القطع
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                { Icon: IconRuler, label: "مقاسات عالمية" },
                { Icon: IconScissors, label: "تفصيل على مقاسك" },
                { Icon: IconTruck, label: "شحن لكل المملكة" },
                { Icon: IconRepeat, label: "تعديل مقاس مجاني" },
              ].map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-ecru bg-white px-3 py-4 text-center font-bold text-espresso"
                >
                  <Icon className="size-5 text-clay" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* صور الهيرو — خانات جاهزة */}
          <div className="grid grid-cols-2 gap-3">
            <SlotImage
              src="/sarah/hero-1.jpg"
              alt="عباية مفصّلة"
              ratio="aspect-[3/4]"
              slot="صورة الهيرو ١"
              path="public/sarah/hero-1.webp"
              className="translate-y-4"
            />
            <div className="space-y-3">
              <SlotImage
                src="/sarah/hero-2.jpg"
                alt="تفاصيل التطريز"
                ratio="aspect-square"
                slot="صورة الهيرو ٢"
                path="public/sarah/hero-2.webp"
              />
              <SlotImage
                src="/sarah/hero-3.jpg"
                alt="خامات"
                ratio="aspect-square"
                slot="صورة الهيرو ٣"
                path="public/sarah/hero-3.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ المنتجات ============================ */}
      <section id="products" className="scroll-mt-20 px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-espresso">القطع المتاحة</h2>
              <p className="mt-2 max-w-xl text-sm text-cocoa">
                كل قطعة تُخاط بعد طلبك — تختارين الخامة واللون والمقاس، والسعر يظهر
                لك محدَّثاً قبل الإرسال.
              </p>
            </div>
            <Link
              href="/sarah/sizes"
              className="rounded-full border border-ecru bg-white px-5 py-2.5 text-xs font-bold text-espresso transition hover:border-clay hover:text-clay"
            >
              دليل المقاسات العالمية ←
            </Link>
          </div>

          {featured.length ? (
            <>
              <p className="mb-3 text-sm font-black text-clay">الأكثر طلباً</p>
              <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </>
          ) : null}

          {categories.map((c) => {
            const list = products.filter((p) => p.category === c.id);
            if (!list.length) return null;
            return (
              <div key={c.id} className="mb-10">
                <h3 className="mb-4 border-r-4 border-clay pr-3 text-xl font-black text-espresso">
                  {c.name}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================ الخامات ============================ */}
      <section id="fabrics" className="scroll-mt-20 bg-sand-deep/50 px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-espresso">الخامات المتوفرة</h2>
          <p className="mt-2 max-w-2xl text-sm text-cocoa">
            خاماتنا مختارة من موردين معتمدين. كل خامة لها ملمس وانسدال مختلف — وفرق
            السعر يظهر لك عند الاختيار في نموذج الطلب.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fabrics.map((f) => (
              <div
                key={f.id}
                className="overflow-hidden rounded-3xl border border-ecru bg-white"
              >
                <SlotImage
                  src={f.image}
                  alt={f.name}
                  ratio="aspect-square"
                  rounded="rounded-none"
                  slot={`خامة: ${f.name}`}
                  path={`public/sarah/fabrics/${f.id}.jpg`}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-espresso">{f.name}</h3>
                    <span className="text-[10px] font-bold text-cocoa" dir="ltr">
                      {f.en}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-cocoa">{f.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {f.colors.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-sand-deep px-2 py-0.5 text-[10px] text-cocoa"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-black text-clay">
                    {f.priceDelta ? `+ ${sar(f.priceDelta)}` : "مشمول بالسعر"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ المقاسات ============================ */}
      <section id="sizes" className="scroll-mt-20 px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-espresso">المقاسات العالمية</h2>
              <p className="mt-2 max-w-2xl text-sm text-cocoa">
                نعتمد جدول المقاسات العالمي المعروف: الحروف (XS–4XL) مع مايقابلها في
                أوروبا وبريطانيا وأمريكا وفرنسا وإيطاليا — ومقاسات الطول (٥٢–٦٠) للعبايات
                والجلابيات.
              </p>
            </div>
            <Link
              href="/sarah/sizes"
              className="rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-sand transition hover:bg-clay"
            >
              الدليل الكامل وطريقة القياس ←
            </Link>
          </div>

          <SizeCalculator />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-black text-espresso">
                جدول التحويل العالمي (INT / EU / UK / US)
              </p>
              <AlphaTable />
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-espresso">
                أطوال العبايات والجلابيات (بالبوصة)
              </p>
              <LengthTable />
              <p className="mt-3 rounded-2xl bg-sand-deep/70 p-4 text-xs leading-relaxed text-cocoa">
                مقاس العباية لا يعني مقاس الجسم — هو الطول الكلي من أعلى الكتف حتى الطرف
                السفلي، ويُختار حسب طولك. أما اتساع العباية فيؤخذ من مقاس الحروف أو من
                قياساتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ كيف تطلبين ============================ */}
      <section className="bg-espresso px-5 py-16 text-sand">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-sand">كيف تطلبين؟ ٤ خطوات</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["١", "اختاري وجهّزي", "القطعة والخامة واللون والمقاس — والسعر يتحدّث معك مباشرة."],
              ["٢", "أرسلي الطلب", "بضغطة واحدة يفتح واتساب ومعه تفاصيل طلبك كاملة وجاهزة."],
              ["٣", "حوّلي بنكياً", "نؤكّد لك السعر النهائي، تحوّلين وترسلين صورة الإيصال."],
              ["٤", "استلمي", `نخيطها ونشحنها لعنوانك خلال ${sarah.leadTime} + مدة الشحن.`],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-3xl border border-sand/15 bg-sand/5 p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-clay text-sm font-black text-white">
                  {n}
                </span>
                <p className="mt-3 text-base font-black text-sand">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-sand/70">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-sand/60">
            ملاحظة: لا يوجد دفع إلكتروني في المتجر حالياً — الطلب يُعتمد بعد التحويل
            البنكي وإرسال الإيصال في واتساب.
          </p>
        </div>
      </section>

      {/* ============================ الشحن ============================ */}
      <section id="shipping" className="scroll-mt-20 px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-espresso">الشحن لجميع مناطق المملكة</h2>
          <p className="mt-2 text-sm text-cocoa">
            نشحن للمناطق الثلاث عشرة عبر شركات شحن معتمدة، مع رقم تتبّع.
            {freeShippingOver > 0 ? ` والشحن مجاني للطلبات فوق ${sar(freeShippingOver)}.` : ""}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ecru bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-espresso">{r.name}</p>
                  <p className="truncate text-[11px] text-cocoa">{r.cities}</p>
                </div>
                <div className="shrink-0 text-left">
                  <p className="text-sm font-black text-clay">{sar(r.fee)}</p>
                  <p className="text-[11px] text-cocoa">{r.days}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ الأسئلة ============================ */}
      <section className="bg-sand-deep/50 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-espresso">أسئلة شائعة</h2>
          <div className="mt-6 space-y-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-ecru bg-white p-5 open:border-clay/40"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-black text-espresso marker:hidden">
                  <IconChevron className="size-4 shrink-0 text-clay transition group-open:rotate-180" />
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cocoa">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ الدعوة الأخيرة ============================ */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-ecru bg-white p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black text-espresso">جاهزة نبدأ قطعتك؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cocoa">
            جهّزي طلبك من الموقع خطوة بخطوة، أو راسلينا مباشرة ونساعدك في اختيار
            القَصّة والخامة والمقاس المناسب.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/sarah/order"
              className="rounded-full bg-clay px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay-deep"
            >
              ابدئي طلبك
            </Link>
            <a
              href={waLink(`السلام عليكم ${sarah.name}،\nأبغى أستشيركم في:`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ecru px-7 py-3.5 text-sm font-bold text-espresso transition hover:border-clay hover:text-clay"
            >
              استشارة في واتساب
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
