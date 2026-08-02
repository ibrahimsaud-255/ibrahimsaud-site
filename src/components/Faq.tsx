"use client";

// قسم الأسئلة/الاعتراضات — يزيل ما يمنع العميل من الطلب (الوقت، السكربت،
// الظهور أمام الكاميرا، مكان التصوير، التعديلات، السعر) قبل ما يسأل.
// النصوص تُدار من النظام الداخلي («محتوى الموقع» → مفتاح faq).

import { waLink } from "@/lib/site";
import { useContent } from "@/lib/cms";
import Reveal from "./Reveal";

const fallback = {
  label: "قبل ما تطلب",
  title: "أسئلة تجي في بالك — والجواب عليها هنا.",
  items: [
    {
      q: "كم ياخذ الإعلان وقت؟",
      a: "٣ أيام عمل من الاتفاق حتى تستلم الفيديو جاهزاً للنشر. لو عندك موعد إطلاق، قل لي وأرتّب الجدول عليه.",
    },
    {
      q: "لازم أجهّز فكرة أو سكربت؟",
      a: "لا. الفكرة والسكربت جزء من الخدمة — تعطيني منتجك وجمهورك، وأرجع لك بسكربت تعتمده قبل التصوير.",
    },
    {
      q: "لازم أظهر بنفسي أمام الكاميرا؟",
      a: "لا. تبي تظهر؟ نصوّرك ونخرجك بأفضل صورة. ما تبي؟ أظهر أنا، أو نصوّر المنتج بتعليق صوتي — عندي أعمال بالطريقتين.",
    },
    {
      q: "وين يصير التصوير؟",
      a: "في موقعك أو متجرك داخل الرياض، أو في استوديو مجهّز بالإضاءة والصوت — تختار الأنسب لمنتجك.",
    },
    {
      q: "وش لو ما عجبني الناتج؟",
      a: "عندك جولتا تعديل مجانية بعد التسليم. وقبلها تعتمد السكربت بنفسك، فالنتيجة ما تفاجئك.",
    },
    {
      q: "كم السعر؟",
      a: "يعتمد على عدد الإعلانات وطبيعة التصوير. أرسل لي منتجك وأرجع لك بعرض واضح ومكتوب — بلا التزام.",
    },
  ],
  ctaLabel: "سؤالك مو هنا؟ اسألني مباشرة",
  ctaMsg: "السلام عليكم إبراهيم، عندي سؤال عن خدمة الفيديو الإعلاني: ",
};

export default function Faq() {
  const c = useContent("faq", fallback);

  return (
    <section id="faq" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            {c.label}
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            {c.title}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {c.items.map((it, i) => (
            <Reveal key={it.q} delay={(i % 2) * 70}>
              <div className="h-full rounded-2xl border border-line bg-ink-card/60 p-6">
                <h3 className="text-lg font-extrabold text-cream">{it.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {it.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 text-center">
            <a
              href={waLink(c.ctaMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-gold underline-offset-4 hover:underline"
            >
              {c.ctaLabel} ←
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
