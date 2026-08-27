import type { Metadata } from "next";
import Link from "next/link";
import { IconBank, IconCheck, IconHanger, IconPackage, IconRuler, IconScissors, IconSend, IconWhatsApp } from "@/components/sarah/icons";
import { course, promises, audience, days, includes, faq } from "@/lib/sarahCourse";
import { sarah, sar, waLink } from "@/lib/sarah";

export const metadata: Metadata = {
  title: `${course.title} — ${course.city}`,
  description:
    "دورة تفصيل الملابس الأنيقة مع سارة — ٢٥ سنة خبرة. ٣ أيام حضوري في الأحساء، للمبتدئات، شهادة معتمدة، وتخرجين بقطعتك الأولى.",
};

const seatIcons = [IconHanger, IconRuler, IconScissors, IconSend, IconBank, IconPackage];

const courseWaMsg = `السلام عليكم ${sarah.name}،
أبغى أسجّل مسبقاً في دورة التفصيل — الأحساء.
الاسم:
الجوال:
مستواي في الخياطة (مبتدئة/متوسّطة):`;

export default function CoursePage() {
  return (
    <main>
      {/* ============================ الهيرو ============================ */}
      <section className="px-5 pt-14 pb-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold tracking-[0.14em] text-clay">
            دورة تدريبية · {course.city}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-[1.15] text-espresso sm:text-5xl">
            في ٣ أيام،
            <br />
            تخرجين بقطعتك الأولى — بيدك.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cocoa">
            سارة تعلّم الخياطة من ٢٥ سنة. جمعت أصول الصنعة في دورة قصيرة عملية:
            من مسك الإبرة أول مرة، إلى تفصيل جلابية ساترة أنيقة بيديك — ومعك
            شهادة تفتح لك باب المشروع الخاص.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {[
              { label: "المدّة", value: course.duration },
              { label: "الرسوم", value: `${sar(course.price)} / متدرّبة` },
              { label: "المستوى", value: course.level },
              { label: "المقاعد", value: `${course.seats} مقعد فقط` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-ecru bg-white/70 p-4">
                <p className="text-[11px] text-cocoa">{s.label}</p>
                <p className="mt-1 text-sm font-black text-espresso">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={waLink(courseWaMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3.5 text-sm font-black text-white transition hover:bg-clay-deep"
            >
              <IconSend className="size-4" />
              احجزي مقعدك مسبقاً
            </a>
            <span className="rounded-full bg-sand-deep px-4 py-2 text-xs font-bold text-cocoa">
              الحجز ١٠٠ ر.س فقط · قابل للاسترداد
            </span>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-cocoa/70">
            <span className="mt-[3px] size-1.5 shrink-0 rounded-full bg-sage" />
            الوعد: لا تنعقد الدورة حتى يكتمل الحدّ الأدنى ({course.minSeats} مسجّلات). لو
            ما اكتمل، يُردّ حجزك كاملاً.
          </p>
        </div>
      </section>

      {/* ============================ الوعد — بطاقات مربّعة ============================ */}
      <section className="bg-sand-deep/50 px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black tracking-[0.14em] text-clay">وعدنا لكِ</p>
          <h2 className="mt-2 text-3xl font-black text-espresso">
            أربعة تخرجين بها من الدورة
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p, i) => {
              const Icon = seatIcons[i] ?? IconCheck;
              return (
                <div key={p.title} className="rounded-3xl border border-ecru bg-white p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-clay/10 text-clay">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 text-base font-black text-espresso">{p.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-cocoa">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ لمن ============================ */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black tracking-[0.14em] text-clay">لمن هذه الدورة؟</p>
          <h2 className="mt-2 text-3xl font-black text-espresso">
            الدورة لكِ إذا كنتِ…
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {audience.map((a) => (
              <li key={a} className="flex items-start gap-3 rounded-2xl border border-ecru bg-white p-4">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                  <IconCheck className="size-3.5" />
                </span>
                <span className="text-sm leading-relaxed text-espresso">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================ اليوم بيوم ============================ */}
      <section className="bg-espresso px-5 py-16 text-sand">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black tracking-[0.14em] text-blush">المنهج</p>
          <h2 className="mt-2 text-3xl font-black text-sand">اليوم بيوم — ماذا نتعلّم؟</h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {days.map((d) => (
              <article key={d.n} className="rounded-3xl border border-sand/15 bg-sand/5 p-6">
                <div className="flex items-baseline gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-clay text-sm font-black text-white">
                    {d.n}
                  </span>
                  <p className="text-lg font-black text-sand">{d.title}</p>
                </div>
                <p className="mt-1 text-xs text-sand/50">{d.hours}</p>
                <ul className="mt-5 space-y-2.5">
                  {d.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-[13px] leading-relaxed text-sand/80">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-blush/70" />
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ما يشمل السعر ============================ */}
      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-black tracking-[0.14em] text-clay">الرسوم شاملة</p>
            <h2 className="mt-2 text-3xl font-black text-espresso">
              {sar(course.price)} — يشمل كل شيء
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cocoa">
              رسوم شاملة — لا مواد إضافية ولا رسوم مخفيّة. تجيبين نفسك وتخرجين
              بقطعة كاملة وشهادة معتمدة.
            </p>

            <ul className="mt-6 space-y-3">
              {includes.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <IconCheck className="mt-0.5 size-5 shrink-0 text-clay" />
                  <span className="text-sm text-espresso">{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-3xl border border-clay/30 bg-clay/5 p-8">
            <p className="text-xs font-bold text-clay">للحجز المسبق فقط</p>
            <p className="mt-2 text-4xl font-black text-espresso">١٠٠ ر.س</p>
            <p className="mt-2 text-sm text-cocoa">
              رسم رمزي لضمان مقعدك. يُخصم كاملاً من رسوم الدورة، ويُردّ إليك لو
              لم تنعقد الدورة أو أردتِ الإلغاء قبل الموعد بأسبوع.
            </p>

            <a
              href={waLink(courseWaMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-black text-white shadow-md transition hover:brightness-95"
            >
              <IconWhatsApp className="size-4 text-white" />
              احجزي عبر واتساب
            </a>

            <div className="mt-5 border-t border-clay/20 pt-4 text-xs leading-relaxed text-cocoa">
              <p>
                <strong className="text-espresso">الحالة:</strong> {course.status}
              </p>
              <p className="mt-1">
                <strong className="text-espresso">الشهادة:</strong>{" "}
                معتمدة تحت مظلة معهد أهلي مرخّص من TVTC.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ============================ الأسئلة الشائعة ============================ */}
      <section className="bg-sand-deep/50 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-espresso">أسئلة شائعة</h2>
          <div className="mt-6 space-y-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-ecru bg-white p-5 open:border-clay/40"
              >
                <summary className="cursor-pointer list-none text-sm font-black text-espresso marker:hidden">
                  <span className="ml-2 inline-block text-clay transition group-open:rotate-45">＋</span>
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
          <h2 className="text-3xl font-black text-espresso">
            ابدئي رحلتك مع الإبرة اليوم
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cocoa">
            الحجز المسبق مفتوح فقط لأوّل {course.seats} متدرّبة. سارة ترد عليكِ في
            واتساب خلال دقائق.
          </p>
          <a
            href={waLink(courseWaMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-clay px-8 py-4 text-sm font-black text-white transition hover:bg-clay-deep"
          >
            <IconWhatsApp className="size-4 text-white" />
            احجزي مقعدك الآن
          </a>
          <p className="mt-4 text-xs text-cocoa/70">
            <Link href="/sarah" className="hover:text-clay">
              ← عودة لصفحة إبرة سارة الرئيسية
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
