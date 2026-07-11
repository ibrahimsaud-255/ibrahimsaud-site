"use client";

// أقسام الصفحة الرئيسية — الترتيب والإظهار/الإخفاء يُداران من النظام الداخلي
// («محتوى الموقع» → «أقسام الصفحة»، مفتاح layout). الهيرو ثابت دائماً في الأعلى.

import { useContent } from "@/lib/cms";
import Brands from "./Brands";
import Podcast from "./Podcast";
import StudioTour from "./StudioTour";
import Services from "./Services";
import Works from "./Works";
import Newsletter from "./Newsletter";
import Contact from "./Contact";
import About from "./About";
import Process from "./Process";

const SECTIONS: Record<string, React.ComponentType> = {
  brands: Brands,
  podcast: Podcast,
  studio: StudioTour,
  services: Services,
  works: Works,
  newsletter: Newsletter,
  contact: Contact,
  about: About,
  process: Process,
};

// «عني» و«كيف نشتغل» مطفآن افتراضياً — فعّلهما من اللوحة متى شئت
const layoutFallback = {
  sections: [
    { id: "brands", on: true },
    { id: "podcast", on: true },
    { id: "studio", on: true },
    { id: "services", on: true },
    { id: "works", on: true },
    { id: "about", on: false },
    { id: "process", on: false },
    { id: "newsletter", on: true },
    { id: "contact", on: true },
  ],
};

export default function HomeSections() {
  const c = useContent("layout", layoutFallback);
  // أي قسم جديد غير مذكور في الإعداد المحفوظ يظهر في نهاية الصفحة
  const listed = c.sections.map((s) => s.id);
  const rest = layoutFallback.sections.filter((s) => !listed.includes(s.id));

  return (
    <>
      {[...c.sections, ...rest].map((s) => {
        const Cmp = SECTIONS[s.id] as React.ComponentType | undefined;
        return Cmp && s.on !== false ? <Cmp key={s.id} /> : null;
      })}
    </>
  );
}
