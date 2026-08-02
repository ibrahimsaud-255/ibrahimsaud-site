"use client";

// أقسام الصفحة الرئيسية — الموقع كله يعرض خدمة واحدة: الفيديو الإعلاني الطولي.
// الترتيب ثابت (مصمَّم ليقود الزائر: أعمال ← ثقة ← طريقة عمل ← سعر ← طلب)،
// والإظهار/الإخفاء يُداران من النظام الداخلي («محتوى الموقع» → «أقسام الصفحة»).
//
// أقسام البودكاست والاستوديو والخدمات المتعدّدة أُخرجت من الموقع عمداً؛ ملفاتها
// وبياناتها محفوظة في المشروع (Podcast/StudioTour/StudioRental/Services وsite.ts)
// وتقدر ترجّعها بإضافتها لخريطة SECTIONS متى احتجتها.

import { useContent } from "@/lib/cms";
import AdReels from "./AdReels";
import Brands from "./Brands";
import Process from "./Process";
import PackagesSection from "./PackagesSection";
import Newsletter from "./Newsletter";
import Contact from "./Contact";

const SECTIONS: Record<string, React.ComponentType> = {
  works: AdReels,
  brands: Brands,
  process: Process,
  packages: PackagesSection,
  newsletter: Newsletter,
  contact: Contact,
};

// الترتيب المعتمد للصفحة + الحالة الافتراضية لكل قسم
// «الباقات» مطفأ: الأسعار لا تظهر في الصفحة الرئيسية (تبقى في /ad-packages/
// لمن يُرسل له الرابط) — فعّله من اللوحة متى أردت إظهارها.
const ORDER = [
  { id: "works", on: true },
  { id: "brands", on: true },
  { id: "process", on: true },
  { id: "packages", on: false },
  { id: "newsletter", on: false },
  { id: "contact", on: true },
];

const layoutFallback = { sections: ORDER };

export default function HomeSections() {
  const c = useContent("layout", layoutFallback);
  // الإعداد المحفوظ يتحكّم بالإظهار فقط — الترتيب يبقى كما صُمّم أعلاه.
  const saved = new Map(c.sections.map((s) => [s.id, s.on !== false]));

  return (
    <>
      {ORDER.map((s) => {
        const Cmp = SECTIONS[s.id];
        const on = saved.has(s.id) ? saved.get(s.id) : s.on;
        return Cmp && on ? <Cmp key={s.id} /> : null;
      })}
    </>
  );
}
