"use client";

import { useEffect, useRef, useState } from "react";
import type { Body } from "matter-js";
import Reveal from "./Reveal";

// حبوب الخدمات الحقيقية — لكل حبة لون من لوحة زاهية على خلفية قاتمة.
const PILLS = [
  { label: "كتابة النص", color: "#E7B24C" },
  { label: "تصوير احترافي", color: "#4ADE80" },
  { label: "تصوير درون", color: "#38BDF8" },
  { label: "تعليق صوتي", color: "#F472B6" },
  { label: "مونتاج", color: "#A78BFA" },
  { label: "إخراج", color: "#FB923C" },
  { label: "موشن جرافيك", color: "#22D3EE" },
  { label: "فكرة إعلانية", color: "#FACC15" },
  { label: "B-Roll سينمائي", color: "#F87171" },
  { label: "محتوى الحملة", color: "#A3E635" },
];

export default function PlaygroundServices() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shakeRef = useRef<(() => void) | null>(null);
  // الوضع: فيزياء افتراضيًا، أو ثابت لمن يفضّل تقليل الحركة
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
    }
  }, []);

  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let cleanup = () => {};

    (async () => {
      // تحميل Matter.js ديناميكيًا (على العميل فقط)
      const Matter = (await import("matter-js")).default;
      const {
        Engine,
        Runner,
        Composite,
        Bodies,
        Body,
        Mouse,
        MouseConstraint,
      } = Matter;

      const scene = sceneRef.current;
      if (!scene || stopped) return;

      let width = scene.clientWidth;
      let height = scene.clientHeight;

      // 1) المحرّك والجاذبية
      const engine = Engine.create();
      engine.gravity.y = 1;

      // 2) الجدران (أرضية + يمين + يسار) — السقف مفتوح لتسقط الحبوب من فوق
      const t = 120; // سُمك الجدار
      const buildWalls = () => [
        Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, {
          isStatic: true,
        }),
        Bodies.rectangle(-t / 2, height / 2, t, height * 4, { isStatic: true }),
        Bodies.rectangle(width + t / 2, height / 2, t, height * 4, {
          isStatic: true,
        }),
      ];
      let walls = buildWalls();
      Composite.add(engine.world, walls);

      // 3) جسم لكل حبة بقياس عنصر الـ DOM الفعلي، يبدأ فوق الحاوية ويسقط
      const bodies: (Body | null)[] = pillRefs.current.map((el, i) => {
        if (!el) return null;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const x = Math.random() * Math.max(1, width - w) + w / 2;
        const y = -120 - i * 70 - Math.random() * 120; // تتالي من الأعلى
        return Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: h / 2 }, // حواف مستديرة مثل الحبوب
          restitution: 0.5, // ارتداد
          friction: 0.4,
          frictionAir: 0.012,
        });
      });
      const pillBodies = bodies.filter((b): b is Body => b !== null);
      Composite.add(engine.world, pillBodies);

      // 4) الماوس/اللمس: إمساك، سحب، ورمي
      const mouse = Mouse.create(scene);
      const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      Composite.add(engine.world, mc);

      // اسمح بتمرير الصفحة على الجوال (لا نحبس السكرول) عبر مستمعات passive
      const m = mouse as unknown as {
        mousewheel: (e: Event) => void;
        mousedown: (e: Event) => void;
        mousemove: (e: Event) => void;
        mouseup: (e: Event) => void;
      };
      scene.removeEventListener("wheel", m.mousewheel);
      scene.removeEventListener("touchstart", m.mousedown);
      scene.removeEventListener("touchmove", m.mousemove);
      scene.removeEventListener("touchend", m.mouseup);
      scene.addEventListener("touchstart", m.mousedown, { passive: true });
      scene.addEventListener(
        "touchmove",
        (e) => {
          if (mc.body) m.mousemove(e);
        },
        { passive: true },
      );
      scene.addEventListener("touchend", m.mouseup, { passive: true });

      // 5) التشغيل + مزامنة عناصر DOM مع أجسام الفيزياء عبر transform
      const runner = Runner.create();
      Runner.run(runner, engine);

      let first = true;
      const sync = () => {
        if (stopped) return;
        for (let i = 0; i < pillBodies.length; i++) {
          const b = pillBodies[i];
          const el = pillRefs.current[i];
          if (!el) continue;
          el.style.transform = `translate(${b.position.x}px, ${b.position.y}px) translate(-50%, -50%) rotate(${b.angle}rad)`;
          if (first) el.style.opacity = "1";
        }
        first = false;
        requestAnimationFrame(sync);
      };
      requestAnimationFrame(sync);

      // 6) زر «هزّ» — يرمي الحبوب لأعلى من جديد
      shakeRef.current = () => {
        for (const b of pillBodies) {
          Body.setVelocity(b, {
            x: (Math.random() - 0.5) * 18,
            y: -12 - Math.random() * 10,
          });
          Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.4);
        }
      };

      // 7) الاستجابة لتغيّر الحجم — أعد بناء الجدران
      const ro = new ResizeObserver(() => {
        width = scene.clientWidth;
        height = scene.clientHeight;
        Composite.remove(engine.world, walls);
        walls = buildWalls();
        Composite.add(engine.world, walls);
      });
      ro.observe(scene);

      cleanup = () => {
        stopped = true;
        ro.disconnect();
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        shakeRef.current = null;
      };
    })();

    return () => cleanup();
  }, [reduced]);

  return (
    <section id="playground" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            وش أقدّم لك
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              خدماتي — العبها بنفسك.
            </h2>
            {!reduced && (
              <button
                onClick={() => shakeRef.current?.()}
                className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
              >
                🎈 هزّها
              </button>
            )}
          </div>
          <p className="mt-4 max-w-2xl text-cream/70">
            {reduced
              ? "كل خدمة مما أقدّمه في إنتاج إعلانك."
              : "اسحب أي خدمة وارمها — كلها مما أقدّمه في إنتاج إعلانك."}
          </p>
        </Reveal>

        {/* الساحة */}
        <div
          ref={sceneRef}
          className={`relative mt-10 overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-ink-card to-ink-soft ${
            reduced
              ? "flex flex-wrap content-center gap-3 p-8"
              : "h-[60vh] min-h-[420px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          }`}
          style={
            reduced ? undefined : { touchAction: "pan-y" }
          }
        >
          {/* شبكة زخرفية خفيفة */}
          {!reduced && (
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-cream)_1px,transparent_1px),linear-gradient(90deg,var(--color-cream)_1px,transparent_1px)] [background-size:48px_48px]" />
          )}

          {PILLS.map((p, i) => (
            <div
              key={p.label}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-extrabold shadow-lg sm:text-base ${
                reduced ? "relative" : "absolute left-0 top-0 will-change-transform"
              }`}
              style={{
                backgroundColor: p.color,
                color: "#101012",
                opacity: reduced ? 1 : 0,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
