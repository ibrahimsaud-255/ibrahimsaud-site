import Reveal from "@/components/Reveal";
import { podcastGear } from "@/lib/site";
import GearImage from "@/components/GearImage";

// معدّات الاستوديو — كل بطاقة صورة واحدة، وتدرّج أسود من تحت، والكلام فوقه.
// بسيط ومختصر: الماركة، الاسم، النوع، وسطر وصف واحد، ثم الأزرار.

const arabicNum = (n: number) => n.toLocaleString("ar-EG");

type Gear = (typeof podcastGear)[number];

function GearCard({ g, hero = false }: { g: Gear; hero?: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-line transition hover:border-gold/50 ${
        hero ? "md:[&>div:first-child]:aspect-[16/9]" : ""
      }`}
    >
      <GearImage src={g.image} name={g.name} accent={g.accent} />

      {/* تدرّج أسود من تحت ليظهر الكلام فوق الصورة */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {g.qty > 1 && (
        <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-gold backdrop-blur-sm">
          ×{arabicNum(g.qty)}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span className="text-xs font-bold tracking-widest text-gold">
          {g.brand}
        </span>
        <h3
          className={`mt-1 font-black text-white ${hero ? "text-2xl sm:text-3xl" : "text-xl"}`}
        >
          {g.name}
        </h3>
        <p className="mt-0.5 text-sm font-bold text-white/60">{g.type}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">
          {g.desc}
        </p>

        {g.note && (
          <p className="mt-2 text-xs font-bold text-gold/90">ℹ️ {g.note}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {g.amazonUrl && (
            <a
              href={g.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#ff9900] px-5 py-2.5 text-sm font-black text-ink transition hover:brightness-110"
            >
              🛒 اشترِ من أمازون
            </a>
          )}
          {g.link && (
            <a
              href={g.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white/70 transition hover:text-gold"
            >
              المواصفات ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PodcastGear() {
  const hero = podcastGear.find((g) => g.hero);
  const rest = podcastGear.filter((g) => !g.hero);

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-gold">
              معدّات الاستوديو
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              معدّات احترافية تصنع الفرق
            </h2>
          </div>
        </Reveal>

        {hero && (
          <Reveal>
            <div className="mt-10">
              <GearCard g={hero} hero />
            </div>
          </Reveal>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((g, i) => (
            <Reveal key={g.id} delay={i * 80}>
              <GearCard g={g} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
