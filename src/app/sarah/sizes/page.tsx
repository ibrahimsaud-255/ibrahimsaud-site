import type { Metadata } from "next";
import Link from "next/link";
import {
  AlphaTable,
  HowToMeasure,
  LengthTable,
  SizeCalculator,
} from "@/components/sarah/SizeGuide";
import { customMeasures } from "@/lib/sarah";

export const metadata: Metadata = {
  title: "دليل المقاسات العالمية",
  description:
    "جدول المقاسات العالمي المعتمد: XS إلى 4XL مع مايقابلها في EU وUK وUS وFR وIT، وأطوال العبايات من ٥٢ إلى ٦٠ بوصة، وطريقة القياس الصحيحة، وحاسبة تقترح مقاسك.",
};

export default function SizesPage() {
  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-xs font-black tracking-widest text-clay">المقاسات</p>
          <h1 className="mt-2 text-3xl font-black text-espresso sm:text-4xl">
            دليل المقاسات العالمية
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cocoa">
            نعتمد نظام المقاسات العالمي المتعارف عليه، وقاعدته بسيطة:
            <span className="mx-1 rounded bg-sand-deep px-2 py-0.5 font-bold text-espresso" dir="ltr">
              US = EU − 32
            </span>
            و
            <span className="mx-1 rounded bg-sand-deep px-2 py-0.5 font-bold text-espresso" dir="ltr">
              UK = US + 4
            </span>
            (والمقاس الأسترالي يساوي البريطاني). القياسات في الجداول هي قياسات الجسم
            بالسنتيمتر — وليست قياسات القطعة.
          </p>
        </header>

        {/* الحاسبة */}
        <section className="mt-8">
          <SizeCalculator />
        </section>

        {/* جدول الحروف */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-espresso">١. المقاسات بالحروف وتحويلها عالمياً</h2>
          <p className="mt-2 text-sm text-cocoa">
            تُستخدم للفساتين والجلابيات والقمصان والتنانير والأطقم.
          </p>
          <div className="mt-5">
            <AlphaTable />
          </div>
          <p className="mt-3 text-xs text-cocoa">
            لو كان قياسك بين مقاسين، اختاري الأكبر لو تحبين الراحة، أو اطلبي التفصيل على
            المقاس ليكون مضبوطاً تماماً.
          </p>
        </section>

        {/* جدول الأطوال */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-espresso">٢. مقاسات الطول للعبايات والجلابيات</h2>
          <p className="mt-2 text-sm text-cocoa">
            النظام العالمي للعبايات يعتمد على الطول بالبوصة (٥٢ إلى ٦٠)، ويُقاس من أعلى
            الكتف عند الرقبة حتى الطرف السفلي — ويُختار حسب طول الجسم لا حسب مقاس الملابس.
          </p>
          <div className="mt-5">
            <LengthTable />
          </div>
        </section>

        {/* التفصيل على المقاس */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-espresso">٣. التفصيل على مقاسك</h2>
          <p className="mt-2 text-sm text-cocoa">
            للقطع المفصّلة نأخذ نقاط القياس المعتمدة عالمياً في التفصيل (معيار ISO 8559
            لقياسات الجسم). هذه هي الحقول التي ستطلب منك في نموذج الطلب:
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {customMeasures.map((m) => (
              <div key={m.key} className="rounded-2xl border border-ecru bg-white p-4">
                <p className="text-sm font-black text-espresso">
                  {m.label}
                  {m.required ? <span className="mr-1 text-clay">*</span> : null}
                </p>
                <p className="mt-1 text-xs text-cocoa">{m.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* طريقة القياس */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-espresso">٤. طريقة القياس الصحيحة</h2>
          <p className="mt-2 text-sm text-cocoa">
            استعيني بشخص آخر إن أمكن، ولا تشدّي الشريط — يكفي أن يلامس الجسم.
          </p>
          <div className="mt-5">
            <HowToMeasure />
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-ecru bg-white p-8 text-center">
          <h2 className="text-2xl font-black text-espresso">عرفتِ مقاسك؟</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-cocoa">
            ابدئي طلبك الآن، ولو ترددتِ بين مقاسين نراجعها معك في واتساب قبل التنفيذ.
          </p>
          <Link
            href="/sarah/order"
            className="mt-6 inline-block rounded-full bg-clay px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay-deep"
          >
            ابدئي طلبك
          </Link>
        </section>
      </div>
    </main>
  );
}
