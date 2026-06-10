import { works } from "@/lib/site";
import Reveal from "./Reveal";
import VideoCard from "./VideoCard";

export default function Works() {
  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الأعمال</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            مشاريع صنعتها — فكرة، تصوير، ومونتاج.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            كل عمل هنا قصة: العميل، التحدي، والأدوار اللي مسكتها فيه. اضغط على أي
            مقطع لمشاهدته.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          {works.map((w, i) => (
            <Reveal
              key={w.id}
              delay={(i % 2) * 80}
              className={w.featured ? "md:col-span-2" : ""}
            >
              <VideoCard work={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
