"use client";

// قسم «الأدوات» — البرامج والأدوات التي أشتغل بها، بشعاراتها الرسمية.
// شعارات الصور في public/tools، وبعضها بطابع أيقونة الحرفين (Adobe). القائمة قابلة للتعديل.

import Reveal from "./Reveal";

type Tool = {
  name: string;
  use: string;
  img?: string; // شعار صورة في public/tools
  mark?: string; // رمز حرفين (بديل الصورة)
  bg?: string;
  fg?: string;
  svg?: React.ReactNode;
};

const TOOLS: Tool[] = [
  { name: "Final Cut Pro", use: "مونتاج وإخراج", img: "/tools/finalcut.png" },
  { name: "DaVinci Resolve", use: "تحرير الحلقات الطويلة", img: "/tools/davinci.png" },
  { name: "Photoshop", use: "تصميم", img: "/tools/photoshop.webp" },
  { name: "Higgsfield", use: "فيديو بالذكاء", img: "/tools/higgsfield.png" },
  { name: "Gemini", use: "توليد الصور", img: "/tools/gemini.png" },
  { name: "Claude", use: "مساعد ذكي", img: "/tools/claude.svg" },
  { name: "NotebookLM", use: "بحث وتلخيص", img: "/tools/notebooklm.png" },
];

function ToolTile({ tool }: { tool: Tool }) {
  return (
    <div className="group flex items-center gap-4 py-2 transition duration-300 hover:-translate-y-0.5">
      {tool.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tool.img}
          alt={tool.name}
          className="size-14 shrink-0 object-contain transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <span
          className="grid size-14 shrink-0 place-items-center text-3xl font-black tracking-tight transition duration-300 group-hover:scale-105"
          style={{ color: tool.fg }}
        >
          {tool.svg ?? tool.mark}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-base font-extrabold text-cream">
          {tool.name}
        </span>
        <span className="block truncate text-xs text-cream/55">{tool.use}</span>
      </span>
    </div>
  );
}

export default function Tools() {
  return (
    <section id="tools" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-cream/60">
              الأدوات
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              الأدوات اللي أشتغل عليها.
            </h2>
            <p className="mt-4 text-cream/70">
              من كتابة الفكرة حتى التصحيح اللوني والصوت — منظومة برامج متكاملة
              تضمن مخرجاً بجودة سينمائية، مع أحدث أدوات الذكاء الاصطناعي في الإنتاج.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <ToolTile key={t.name} tool={t} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
