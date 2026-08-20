import Link from "next/link";
import Reveal from "@/components/Reveal";
import { NamaLogo, Icon } from "@/components/nama/NamaIcons";
import PhoneMock from "@/components/nama/PhoneMock";
import LiveDemo from "@/components/nama/LiveDemo";
import { nama, areas, features, values, buildStatus } from "@/lib/nama";
import { waLink } from "@/lib/site";

const wa = waLink(nama.whatsappMsg);

export default function NamaPage() {
  return (
    <main>
      {/* ============ شريط علوي ============ */}
      <header className="sticky top-0 z-40 border-b border-nline/70 bg-ncream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <NamaLogo className="text-xl" />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-xs font-bold text-nmuted transition hover:text-nforest sm:block"
            >
              بواسطة إبراهيم سعود ↗
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-nforest px-5 py-2 text-xs font-bold text-ncream transition hover:bg-nforest/90"
            >
              تواصل
            </a>
          </div>
        </div>
      </header>

      {/* ============ الهيرو ============ */}
      <section className="px-5 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-nforest/25 bg-white/60 px-4 py-1.5 text-xs font-bold text-nforest">
              🌱 مخطّط شخصي عربي — للنمو والإنجاز
            </span>
            <h1 className="mt-6 text-[2.4rem] font-black leading-[1.15] text-nink sm:text-6xl">
              خطّط.
              <span className="text-nforest"> انمُ. </span>
              أنجز.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-nmuted sm:text-lg">
              {nama.pitch}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-nforest px-7 py-3.5 text-sm font-bold text-ncream shadow-lg shadow-nforest/20 transition hover:bg-nforest/90"
              >
                تواصل عبر واتساب
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-nforest/30 px-7 py-3.5 text-sm font-bold text-nforest transition hover:bg-white"
              >
                ▶ جرّب النموذج المباشر
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold text-nmuted">
              <span>✦ ستة مجالات للحياة</span>
              <span>✦ Android · iOS · ويب</span>
              <span>✦ عربي RTL أولًا</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <PhoneMock />
          </Reveal>
        </div>
      </section>

      {/* ============ الفكرة ============ */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="text-sm font-bold tracking-widest text-nleaf">
              الفكرة باختصار
            </p>
            <p className="mt-5 font-serif-display text-2xl font-black leading-[1.6] text-nink sm:text-[2rem]">
              أغلب تطبيقات المهام تجعلك «مشغولًا» — و«نُما» تجعلك{" "}
              <span className="text-nforest">تنمو</span>. تبدأ من رؤيتك السنوية،
              ثم تنزل بها إلى عادة اليوم، وتحفظ توازنك بين الدين والعلم والمهارة
              والصحة والعلاقات والمال.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ التجربة الحية ============ */}
      <section id="demo" className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-nsuccess/12 px-4 py-1.5 text-xs font-bold text-nsuccess">
                ● تجربة حيّة — التطبيق الحقيقي يعمل الآن
              </span>
              <h2 className="mt-4 text-3xl font-black text-nink sm:text-4xl">
                جرّب «نُما» بنفسك
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-nmuted">
                هذه ليست صورة — إنها نسخة الويب الفعلية من التطبيق تعمل داخل المتصفح.
                اضغط زر التشغيل وتنقّل بين الأقسام.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <LiveDemo />
          </Reveal>
        </div>
      </section>

      {/* ============ المجالات الستة ============ */}
      <section id="areas" className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-black text-nink sm:text-4xl">
                المجالات الستة
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-nmuted">
                حياة متوازنة تبدأ من هنا — كل مجال بأهدافه وعاداته ومؤشّرات تقدّمه.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a, i) => (
              <Reveal key={a.key} delay={i * 60}>
                <div className="group h-full rounded-3xl border border-nline bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-nink/5">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ background: a.color }}
                  >
                    <Icon name={a.icon} size={24} />
                  </div>
                  <h3
                    className="mt-4 text-xl font-black"
                    style={{ color: a.color }}
                  >
                    {a.title}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {a.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-center gap-2 text-sm text-nmuted"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: a.color }}
                        />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ الأقسام الرئيسية ============ */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-bold tracking-widest text-nleaf">
                داخل التطبيق
              </p>
              <h2 className="mt-3 text-3xl font-black text-nink sm:text-4xl">
                خمسة أقسام تقودك من الحلم إلى الإنجاز
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full rounded-3xl border border-nline bg-white/70 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nforest/10 text-nforest">
                    <Icon name={f.icon} size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-nink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-nmuted">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ لماذا نما ============ */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2.5rem] bg-nforest px-6 py-12 text-ncream sm:px-12">
            <Reveal>
              <h2 className="text-center text-3xl font-black text-ncream sm:text-4xl">
                لماذا «نُما» بالذات؟
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 70}>
                  <div className="flex gap-4 rounded-2xl bg-white/5 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ncream/15 text-ncream">
                      <Icon name={v.icon} size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-ncream">
                        {v.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ncream/75">
                        {v.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ حالة الإنجاز (للعميل) ============ */}
      <section className="px-5 py-14">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-3xl border border-nline bg-white p-8 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-nink">
                  أين وصل المشروع؟
                </h2>
                <span className="rounded-full bg-nsuccess/12 px-4 py-1.5 text-xs font-bold text-nsuccess">
                  نموذج تشغيلي جاهز للعرض
                </span>
              </div>
              <p className="mt-3 text-sm text-nmuted">
                التطبيق مبنيّ بـ Flutter — كود واحد يعمل على أندرويد وآيفون والويب.
                هذه صورة صريحة لما اكتمل وما تبقّى:
              </p>
              <ul className="mt-6 space-y-3">
                {buildStatus.map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        s.done
                          ? "bg-nsuccess text-white"
                          : "border border-namber/40 bg-namber/10 text-namber"
                      }`}
                    >
                      {s.done ? "✓" : "…"}
                    </span>
                    <span
                      className={`text-sm ${
                        s.done ? "text-nink" : "text-nmuted"
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ دعوة أخيرة ============ */}
      <section className="px-5 pb-20 pt-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-[2.5rem] border border-nforest/15 bg-white p-10 text-center shadow-xl shadow-nforest/5 sm:p-14">
              <NamaLogo className="mx-auto text-3xl" />
              <p className="mt-6 font-serif-display text-2xl font-black text-nink">
                جاهز نطلق «نُما» للناس؟
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-nmuted">
                نكمل ربط الحسابات والمزامنة والإشعارات، ونجهّزه للنشر على المتجرين —
                ونتفق على الهوية وخطة الإطلاق. كلّمني ونبدأ.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-nforest px-8 py-3.5 text-sm font-bold text-ncream transition hover:bg-nforest/90"
                >
                  ابدأ النقاش عبر واتساب
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-nforest/25 px-8 py-3.5 text-sm font-bold text-nforest transition hover:bg-ncream"
                >
                  موقع إبراهيم سعود
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ تذييل ============ */}
      <footer className="border-t border-nline px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-nmuted sm:flex-row">
          <NamaLogo className="text-base" />
          <p>{nama.tagline}</p>
          <p>© ٢٠٢٦ — من تطوير إبراهيم سعود</p>
        </div>
      </footer>
    </main>
  );
}
