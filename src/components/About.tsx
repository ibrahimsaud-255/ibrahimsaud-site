import { site } from "@/lib/site";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="border-t border-line/60 px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div>
            <p className="text-sm font-bold tracking-widest text-gold">عني</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              إبراهيم سعود
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">
              أصنع فيديوهات إعلانية تبيع — من الفكرة للنص، للتصوير، للتعليق
              الصوتي، للمونتاج النهائي.
            </p>
            <p className="mt-4 leading-relaxed text-cream/70">
              مقدّم بودكاست <span className="text-gold">سَعي</span>، وصانع محتوى
              متخصص في التسويق وإنتاج الإعلانات. اشتغلت مع جامعة الملك سعود في
              هاكاثون <span className="text-gold">هيلثون</span>، ومع علامات
              تجارية في السعودية والخليج بأكثر من ٣٠ فيديو إعلاني.
            </p>
            <p className="mt-4 leading-relaxed text-cream/70">
              فلسفتي بسيطة: الإعلان الناجح مو بس «نتيجة نظيفة» — وراه قصة،
              تجهيز، وكواليس. وهذا اللي أصنعه لك.
            </p>

            {/* مشاريع أخرى */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {site.ventures.map((v) => (
                <a
                  key={v.title}
                  href={v.href}
                  target={v.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-line bg-ink-card p-5 transition hover:border-gold/50"
                >
                  <span className="text-xs font-bold text-gold">{v.tag}</span>
                  <h4 className="mt-1 font-extrabold text-cream">
                    {v.title}
                    <span className="mr-1 inline-block transition group-hover:translate-x-[-3px]">
                      ↖
                    </span>
                  </h4>
                  <p className="mt-1 text-sm text-cream/60">{v.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-gradient-to-tr from-ink-card via-ink-soft to-ink">
              <div className="flex size-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex size-24 items-center justify-center rounded-full border border-gold/40 text-5xl">
                  🎬
                </div>
                <p className="text-sm text-cream/50">
                  ضع صورتك هنا
                  <br />
                  <span className="text-xs">
                    (public/ibrahim.jpg ثم استبدل هذا البلوك)
                  </span>
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 right-4 rounded-2xl border border-line bg-ink px-5 py-3 shadow-xl">
              <p className="text-xs text-cream/60">{site.bio}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
