"use client";

// الأسئلة الشائعة كمحادثة واتساب: السؤال يظهر كرسالة مُرسلة، ثم مؤشّر «تكتب…»،
// ثم يصل الجواب — بتسلسل يبدأ عند وصول القسم للشاشة.

import { useEffect, useRef, useState } from "react";
import { faq, sarah, waLink } from "@/lib/sarah";
import { IconCheck, IconNeedle, IconWhatsApp } from "./icons";

// كل سؤال = رسالتان (سؤال + جواب)، والأخيرة دعوة للتواصل
const TOTAL = faq.length * 2 + 1;

export default function FaqChat() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0); // كم رسالة ظهرت
  const [started, setStarted] = useState(false);

  // مؤشّر «تكتب…» مشتقّ من الحالة: كل رقم فردي يعني أن الجواب في الطريق
  const typing = started && shown % 2 === 1 && shown < faq.length * 2;

  // ابدأ التسلسل عند ظهور القسم
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        // مع تفضيل تقليل الحركة: تظهر كل الرسائل دفعة واحدة
        if (reduce) setShown(TOTAL);
        else setStarted(true);
        obs.disconnect();
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // تسلسل الرسائل: سؤال ← «تكتب…» ← جواب ← …
  useEffect(() => {
    if (!started || shown >= TOTAL) return;
    const delay = typing ? 850 : shown === 0 ? 250 : 520;
    const t = setTimeout(() => setShown((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [started, shown, typing]);

  // بناء قائمة الرسائل
  const messages: { who: "me" | "her"; text: string }[] = [];
  faq.forEach((f) => {
    messages.push({ who: "me", text: f.q });
    messages.push({ who: "her", text: f.a });
  });

  const skip = () => setShown(TOTAL);

  return (
    <section id="faq" className="scroll-mt-16 px-5 py-16">
      <div ref={ref} className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-black text-espresso">أسئلة شائعة</h2>
        <p className="mt-2 text-sm text-cocoa">
          نفس الأسئلة اللي توصلنا في الواتساب كل يوم — وهذي ردودنا عليها.
        </p>

        {/* ===== نافذة المحادثة ===== */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-ecru shadow-lg shadow-clay/5">
          {/* شريط علوي */}
          <div className="flex items-center gap-3 bg-espresso px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-clay text-white">
              <IconNeedle className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-sand">{sarah.name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-sand/60">
                <span className="size-1.5 rounded-full bg-[#25D366]" />
                {typing ? "تكتب…" : "ترد عادة خلال دقائق"}
              </p>
            </div>
            <IconWhatsApp className="size-5 text-[#25D366]" />
          </div>

          {/* الرسائل */}
          <div className="chat-bg space-y-2.5 px-4 py-5 sm:px-5">
            <p className="mx-auto w-fit rounded-full bg-espresso/10 px-3 py-1 text-[10px] font-bold text-cocoa">
              اليوم
            </p>

            {messages.map((m, i) =>
              i < shown ? (
                <Bubble key={i} who={m.who} text={m.text} />
              ) : null,
            )}

            {typing ? (
              <div className="chat-msg in flex justify-start">
                <span className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                  <i className="chat-dot size-1.5 rounded-full bg-cocoa" />
                  <i className="chat-dot size-1.5 rounded-full bg-cocoa" />
                  <i className="chat-dot size-1.5 rounded-full bg-cocoa" />
                </span>
              </div>
            ) : null}

            {shown >= faq.length * 2 ? (
              <div className="chat-msg in pt-2">
                <a
                  href={waLink(`السلام عليكم ${sarah.name}،\nعندي سؤال:`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow-md transition hover:brightness-95"
                >
                  <IconWhatsApp className="size-4 text-white" />
                  عندك سؤال ثاني؟ راسلينا
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {shown < TOTAL ? (
          <button
            onClick={skip}
            className="mx-auto mt-4 block text-xs font-bold text-cocoa/70 transition hover:text-clay"
          >
            عرض كل الأسئلة دفعة واحدة
          </button>
        ) : null}
      </div>
    </section>
  );
}

function Bubble({ who, text }: { who: "me" | "her"; text: string }) {
  const mine = who === "me";
  return (
    <div className={`chat-msg in flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm sm:text-sm ${
          mine
            ? "rounded-tr-sm bg-[#dcf8c6] text-espresso"
            : "rounded-tl-sm bg-white text-espresso"
        }`}
      >
        {text}
        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-cocoa/50">
          {mine ? (
            <>
              <IconCheck className="size-3 text-[#34b7f1]" strokeWidth={3} />
              الآن
            </>
          ) : (
            "الآن"
          )}
        </span>
      </div>
    </div>
  );
}
