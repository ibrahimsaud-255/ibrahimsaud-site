"use client";

// قسم منصة حروف ودروس — منتج مؤسسة حروف ودروس التعليمي.
// يظهر ضمن أقسام الرئيسية (مفتاح layout → huroof) ويمكن إخفاؤه من النظام الداخلي.

import Reveal from "./Reveal";

const FREE_UNTIL = "2026-09-15T00:00:00+03:00";
const daysLeft = Math.max(
  0,
  Math.ceil((new Date(FREE_UNTIL).getTime() - Date.now()) / 86400000),
);

const bullets = [
  "ألعاب تنافسية تشعل حماس الفصل الدراسي",
  "بنك أسئلة ضخم مرتبط بالمنهج السعودي (1-12)",
  "أوراق عمل واختبارات جاهزة للطباعة في ثوانٍ",
  "أوراق نافس لتدريب الطلاب على الاختبارات الوطنية",
];

export default function HuroofPromo() {
  return (
    <section id="huroof" className="relative overflow-hidden px-5 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(231,178,76,0.10),transparent_65%)] blur-3xl" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="rounded-3xl border border-line bg-ink-card/60 p-8 sm:p-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
                  🎓 من منتجاتنا — مؤسسة حروف ودروس
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                  منصة <span className="gold-text">حروف ودروس</span> التعليمية
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/75">
                  منصة المعلم السعودي: حوّل المراجعة إلى تحدٍّ ممتع، واطبع أوراق
                  عمل واختبارات مرتبطة بالمنهج بضغطة زر.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <ul className="mt-6 space-y-2.5">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-cream/80">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="https://huroofduroos.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-ink transition hover:bg-gold-soft"
                  >
                    جرّب المنصة مجاناً
                  </a>
                  <span className="text-sm font-bold text-emerald-300">
                    مجانية بالكامل الآن — باقي {daysLeft} يوماً على نهاية العرض
                  </span>
                </div>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <div className="mx-auto hidden text-center md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://huroofduroos.com/images/app-icon-200.webp"
                  alt="حروف ودروس"
                  className="mx-auto size-36 rounded-[22%] shadow-[0_18px_60px_rgba(231,178,76,.25)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <p className="mt-4 text-sm text-cream/60">
                  تعمل من المتصفح
                  <br />
                  على أي جهاز — بدون تحميل
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
