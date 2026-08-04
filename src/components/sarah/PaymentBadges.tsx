// شعارات وسائل الدفع.
// ملاحظة: الشعارات علامات تجارية لأصحابها، وتُعرض للدلالة على وسائل الدفع.
// الملفات في public/sarah/payments — استبدليها بالشعارات الرسمية متى ما حبيتِ.

import { payments } from "@/lib/sarah";

// ارتفاع كل شعار مضبوط بصرياً (نِسب الشعارات مختلفة)
const cards = [
  { id: "mada", label: "مدى", h: "h-5", hc: "h-4" },
  { id: "visa", label: "Visa", h: "h-4", hc: "h-3" },
  { id: "mastercard", label: "Mastercard", h: "h-6", hc: "h-5" },
];

export default function PaymentBadges({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2.5">
        {cards.map((c) => (
          <span
            key={c.id}
            className={`relative flex items-center justify-center rounded-lg border border-ecru bg-white px-3 shadow-sm ${
              compact ? "h-8" : "h-10"
            } ${payments.cardsEnabled ? "" : "opacity-70 grayscale-[35%]"}`}
            title={c.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/sarah/payments/${c.id}.svg`}
              alt={c.label}
              className={`${compact ? c.hc : c.h} w-auto`}
              loading="lazy"
            />
          </span>
        ))}

        {!payments.cardsEnabled ? (
          <span className="rounded-full bg-sand-deep px-2.5 py-1 text-[10px] font-black text-cocoa">
            قريباً
          </span>
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-2 text-[11px] leading-relaxed text-cocoa/80">
          {payments.cardsEnabled
            ? "نستقبل مدى وفيزا وماستركارد، إضافة إلى التحويل البنكي."
            : "الدفع بالبطاقات قيد التفعيل — حالياً الطلب عبر واتساب والدفع بتحويل بنكي."}
        </p>
      ) : null}
    </div>
  );
}
