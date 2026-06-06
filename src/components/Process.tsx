import { processSteps } from "@/lib/site";
import Reveal from "./Reveal";

export default function Process() {
  return (
    <section
      id="process"
      className="bg-glow border-t border-line/60 px-5 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            كيف نشتغل
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            ما أسلّمك فيديو وأمشي. أصنع لك قصة كاملة.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            تجهيزات، كواليس، نسخة طويلة ونسخ قصيرة، ومحتوى ننشره قبل وبعد الإطلاق
            — لأن الناس تتعلّق بالرحلة، مو بس بالنتيجة.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <div className="relative h-full rounded-2xl border border-line bg-ink-card/60 p-6">
                <div className="text-4xl font-black text-line">{step.n}</div>
                <h3 className="mt-3 text-lg font-extrabold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
