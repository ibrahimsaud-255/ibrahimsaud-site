"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { site } from "@/lib/site";
import Reveal from "./Reveal";

// قسم الحجز — يضمّن تقويم Cal.com داخل الموقع.
// عند الحجز: يُنشأ حدث في Google Calendar الخاص بك مع رابط Google Meet تلقائيًا،
// ويصل الزائر دعوة تقويم (.ics) يضيفها لتقويمه (Apple/iPhone وغيره).
export default function Booking() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
        // لون علامتك الذهبي داخل التقويم
        styles: { branding: { brandColor: "#E7B24C" } },
      });
    })();
  }, []);

  return (
    <section id="booking" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            احجز موعد
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            نتكلم عن إعلانك — مكالمة على{" "}
            <span className="gold-text">Google Meet</span>.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            اختر الوقت اللي يناسبك من التقويم، ويوصلك رابط الاجتماع ودعوة تقويم
            تلقائيًا تضيفها لتقويم جوالك.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-ink-card">
            <Cal
              calLink={site.calLink}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "640px",
                overflow: "scroll",
              }}
              config={{ layout: "month_view", theme: "dark" }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
