import { works } from "@/lib/site";
import Reveal from "./Reveal";
import VideoCard from "./VideoCard";

// ترتيب عرض التصنيفات — الأعمال تُجمَّع تحت كل تصنيف بعنوان واضح.
// «تغطية فعاليات» تشمل الهاكاثونات والمؤتمرات والمعارض.
const ORDER = [
  "إعلانات منتجات",
  "أعمال سينمائية",
  "مقابلات الشارع",
  "تغطية فعاليات",
];

export default function Works() {
  const groups = ORDER.map((cat) => ({
    cat,
    items: works.filter((w) => w.category === cat),
  })).filter((g) => g.items.length);

  return (
    <section id="works" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">الأعمال</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            مشاريع صنعتها — فكرة، تصوير، ومونتاج.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            كل عمل هنا قصة: العميل، التحدي، والأدوار اللي مسكتها فيه. تصفّحها
            مرتّبة حسب التصنيف، واضغط أي مقطع لمشاهدته.
          </p>
        </Reveal>

        {groups.map((g) => (
          <div key={g.cat} className="mt-16 first:mt-12">
            <Reveal>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-cream sm:text-3xl">
                  {g.cat}
                </h3>
                <span className="rounded-full border border-line px-3 py-0.5 text-xs font-bold text-cream/55">
                  {g.items.length}
                </span>
                <div className="h-px flex-1 bg-line/60" />
              </div>
            </Reveal>

            <div className="mt-7 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              {g.items.map((w, i) => (
                <Reveal key={w.id} delay={(i % 2) * 80}>
                  <VideoCard work={w} />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
