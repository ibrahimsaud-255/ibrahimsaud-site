import type { Metadata } from "next";
import OrderForm from "@/components/sarah/OrderForm";
import { bank, sarah } from "@/lib/sarah";

export const metadata: Metadata = {
  title: "اطلبي الآن",
  description:
    "جهّزي طلبك خطوة بخطوة: القطعة، الخامة، اللون، المقاس العالمي أو التفصيل على مقاسك — ويصلنا الطلب في واتساب مع الإجمالي وبيانات الشحن.",
};

// الموقع مُصدَّر ثابتاً (output: export)، لذا لا نقرأ searchParams هنا —
// النموذج نفسه يقرأ ?product=... من العنوان في المتصفح.
export default function OrderPage() {
  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs font-black tracking-widest text-clay">نموذج الطلب</p>
          <h1 className="mt-2 text-3xl font-black text-espresso sm:text-4xl">
            جهّزي طلبك في دقيقة
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cocoa">
            اختاري القطعة والخامة والمقاس، ويظهر لك الإجمالي شامل الشحن قبل الإرسال.
            الطلب يصلنا في واتساب، ونؤكّده معك، ثم يبدأ التنفيذ بعد التحويل البنكي.
          </p>
        </header>

        <OrderForm />

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <Note title="بدون دفع إلكتروني">
            لا نطلب بيانات بطاقة أبداً. الدفع تحويل بنكي على حساب {bank.accountName} في{" "}
            {bank.bankName}، وتُرسل صورة الإيصال في واتساب.
          </Note>
          <Note title="التأكيد قبل التنفيذ">
            نراجع معك القياسات والخامة واللون في واتساب، وأي تعديل على السعر يُبلَّغ لك
            قبل التحويل.
          </Note>
          <Note title="الشحن والتتبّع">
            الشحن لجميع مناطق المملكة مع رقم تتبّع، ورسوم الشحن تظهر لك حسب منطقتك في
            الملخّص. أوقات العمل: {sarah.workHours}.
          </Note>
        </section>
      </div>
    </main>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-ecru bg-white p-5">
      <p className="text-sm font-black text-espresso">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-cocoa">{children}</p>
    </div>
  );
}
