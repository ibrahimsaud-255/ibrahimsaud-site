// «كيف تطلبين؟» — رسم تدفّق بأربع محطات يربطها خيط خياطة مغروز،
// وفي طرفه إبرة. أفقي على الشاشات الكبيرة، رأسي على الجوال.

import { IconBank, IconHanger, IconPackage, IconSend } from "./icons";
import { sarah } from "@/lib/sarah";

const steps = [
  {
    n: "١",
    Icon: IconHanger,
    title: "اختاري وجهّزي",
    desc: "القطعة والخامة واللون والمقاس — والسعر يتحدّث معك مباشرة.",
  },
  {
    n: "٢",
    Icon: IconSend,
    title: "أرسلي الطلب",
    desc: "بضغطة واحدة يفتح واتساب ومعه تفاصيل طلبك كاملة وجاهزة.",
  },
  {
    n: "٣",
    Icon: IconBank,
    title: "حوّلي بنكياً",
    desc: "نؤكّد لك السعر النهائي، تحوّلين وترسلين صورة الإيصال.",
  },
  {
    n: "٤",
    Icon: IconPackage,
    title: "استلمي",
    desc: `نخيطها ونشحنها لعنوانك خلال ${sarah.leadTime} + مدة الشحن.`,
  },
];

export default function HowToOrder() {
  return (
    <section id="how" className="scroll-mt-16 bg-espresso px-5 py-16 text-sand">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-black text-sand">كيف تطلبين؟ أربع خطوات</h2>
        <p className="mt-2 max-w-xl text-sm text-sand/60">
          من اختيار القطعة حتى تصلك مكوية ومغلّفة — الطريق كله واضح من البداية.
        </p>

        {/* ===== الخيط الرابط + المحطات ===== */}
        <div className="relative mt-12">
          {/* الخيط الأفقي (شاشات كبيرة) */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-9 hidden h-8 w-full lg:block"
            viewBox="0 0 1000 32"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M60 16 C 260 2, 420 30, 620 16 S 900 4, 940 16"
              fill="none"
              stroke="#c9a24a"
              strokeWidth="2"
              strokeDasharray="9 8"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>

          {/* الإبرة عند بداية الخيط (يمين، اتجاه القراءة) */}
          <svg
            className="pointer-events-none absolute -top-1 right-2 hidden size-9 text-blush lg:block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 20 19 5" />
            <path d="M19 5l1.6-1.6" />
            <path d="M17.6 3.9c.9.5 1.5 1.4 1.5 2.5" />
          </svg>

          <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map(({ n, Icon, title, desc }, i) => (
              <li key={n} className="relative flex gap-4 lg:block lg:text-center">
                {/* الخيط الرأسي بين المحطات (جوال/تابلت) */}
                {i < steps.length - 1 ? (
                  <span
                    className="absolute right-[27px] top-16 h-[calc(100%+2rem)] w-px border-r-2 border-dashed border-blush/30 lg:hidden"
                    aria-hidden
                  />
                ) : null}

                <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border border-blush/25 bg-espresso text-blush shadow-[0_0_0_6px_rgba(47,37,30,1)] lg:mx-auto">
                  <Icon className="size-6" />
                  <span className="absolute -bottom-1.5 -left-1.5 flex size-6 items-center justify-center rounded-full bg-clay text-[11px] font-black text-white">
                    {n}
                  </span>
                </span>

                <div className="pt-1 lg:pt-0">
                  <p className="text-base font-black text-sand lg:mt-4">{title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-sand/65 lg:mx-auto lg:max-w-[15rem]">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-12 flex items-start gap-2 border-t border-sand/10 pt-5 text-xs leading-relaxed text-sand/50">
          <span className="mt-[3px] size-1.5 shrink-0 rounded-full bg-clay" />
          لا يوجد دفع إلكتروني في المتجر حالياً — الطلب يُعتمد بعد التحويل البنكي
          وإرسال صورة الإيصال في واتساب.
        </p>
      </div>
    </section>
  );
}
