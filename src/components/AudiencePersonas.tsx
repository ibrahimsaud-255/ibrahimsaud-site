import { audiences, waLink, type Persona } from "@/lib/site";
import Reveal from "./Reveal";

// رسمة كرتونية بسيطة لكل شخصية (خطوط ذهبية على دائرة زجاجية).
// لكل مسمّى إكسسوار يميّزه: مدير تسويق (سماعة)، تنفيذي (ربطة)،
// رائد أعمال (فكرة/لمبة)، تاجر (كيس تسوّق).
function PersonaAvatar({ kind }: { kind: Persona["avatar"] }) {
  return (
    <span className="relative grid size-20 shrink-0 place-items-center rounded-full glass-pill">
      <svg
        viewBox="0 0 48 48"
        className="size-12 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {/* رأس وأكتاف مشتركة */}
        <circle cx="24" cy="17" r="6.5" />
        <path d="M11 39c0-6.6 5.8-11 13-11s13 4.4 13 11" />

        {kind === "executive" && (
          // ربطة عنق — طابع رسمي
          <path d="M24 28.5l-2.2 2.2L24 36l2.2-5.3-2.2-2.2Z" fill="currentColor" />
        )}
        {kind === "marketer" && (
          // سماعة رأس — تسويق وتواصل
          <>
            <path d="M14.5 17a9.5 9.5 0 0 1 19 0" />
            <rect x="12.5" y="16.5" width="3" height="6" rx="1.2" />
            <rect x="32.5" y="16.5" width="3" height="6" rx="1.2" />
          </>
        )}
        {kind === "founder" && (
          // لمبة فكرة فوق الرأس — ريادة
          <>
            <circle cx="24" cy="5.5" r="2.6" />
            <path d="M22.8 8.4h2.4" />
          </>
        )}
        {kind === "merchant" && (
          // كيس تسوّق — تاجر متاجر
          <path d="M19.5 30.5h9l-.8 6.5h-7.4l-.8-6.5Zm1.7 0v-1.4a2.8 2.8 0 0 1 5.6 0v1.4" />
        )}
      </svg>
    </span>
  );
}

function PersonaCard({ persona, cta }: { persona: Persona; cta: string }) {
  return (
    <div className="glass-card flex h-full flex-col rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <PersonaAvatar kind={persona.avatar} />
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest text-gold">
            {persona.role}
          </p>
          <h4 className="mt-1 text-xl font-black text-cream">{persona.name}</h4>
          <p className="mt-0.5 text-xs text-cream/55">{persona.age}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-cream/60">{persona.org}</p>

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <p className="font-bold text-cream/90">وش يحتاج</p>
          <p className="mt-1 leading-relaxed text-cream/70">{persona.needs}</p>
        </div>
        <div>
          <p className="font-bold text-cream/90">ليش يحتاجني</p>
          <p className="mt-1 leading-relaxed text-cream/70">{persona.why}</p>
        </div>
      </div>

      <a
        href={waLink(cta)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition hover:border-gold hover:text-gold"
      >
        أنا قريب من هذي الشخصية — كلّمني
      </a>
    </div>
  );
}

export default function AudiencePersonas() {
  return (
    <section
      id="audiences"
      className="bg-glow border-t border-line/60 px-5 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-bold tracking-widest text-gold">
            مَن أخدمهم
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            فئتان أعرف لغتهما — لكل واحدة طابعها وأسعارها.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            قبل أي كاميرا، أعرف أنا أكلّم مين. هذي البرسونا لأصحاب القرار اللي
            أشتغل معهم — احتياجهم، وليش يحتاجوني، وطابع المقاطع اللي تناسبهم.
          </p>
        </Reveal>

        {audiences.map((seg) => (
          <div key={seg.id} className="mt-16 first:mt-12">
            {/* لوحة الفئة: احتياجها، ليش تحتاجني، طابع المقاطع */}
            <Reveal>
              <div className="grid gap-6 rounded-3xl border border-line/70 bg-ink-card/40 p-6 sm:p-8 md:grid-cols-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-cream">
                      {seg.label}
                    </h3>
                    <span className="rounded-full glass-pill px-3 py-1 text-xs font-bold text-gold">
                      {seg.priceNote}
                    </span>
                  </div>
                  <p className="mt-3 leading-relaxed text-cream/75">
                    {seg.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-cream/55">
                    {seg.size}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-cream/55">
                    <span className="font-bold text-cream/80">الميزانية:</span>{" "}
                    {seg.budget}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold tracking-widest text-gold">
                    ايش تحتاج
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-cream/75">
                    {seg.needs.map((n) => (
                      <li key={n} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                        <span className="leading-relaxed">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-bold tracking-widest text-gold">
                    ليش تحتاجني
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-cream/75">
                    {seg.why.map((w) => (
                      <li key={w} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-2xl border border-line/70 bg-ink-soft/60 p-3 text-xs leading-relaxed text-cream/70">
                    <span className="font-bold text-cream/90">
                      طابع المقاطع:
                    </span>{" "}
                    {seg.adStyle}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* برسونا أصحاب القرار داخل الفئة */}
            <div className="mt-7 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              {seg.personas.map((p, i) => (
                <Reveal key={p.name} delay={(i % 2) * 80}>
                  <PersonaCard persona={p} cta={seg.cta} />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
