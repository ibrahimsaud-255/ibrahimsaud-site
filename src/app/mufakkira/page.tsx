import Link from "next/link";
import { NamaLogo } from "@/components/nama/NamaIcons";
import SmartPlanner from "@/components/nama/SmartPlanner";
import { waLink } from "@/lib/site";

const wa = waLink("السلام عليكم إبراهيم، جرّبت نموذج «المفكرة الذكية» وحاب أستفسر ✨");

export default function MufakkiraPage() {
  return (
    <main>
      {/* شريط علوي */}
      <header className="sticky top-0 z-40 border-b border-nline/70 bg-ncream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <NamaLogo className="text-lg" />
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-nforest px-5 py-2 text-xs font-bold text-ncream transition hover:bg-nforest/90"
          >
            تواصل
          </a>
        </div>
      </header>

      <section className="px-5 pt-12 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* التعريف */}
            <div className="text-center lg:text-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-nforest/25 bg-white/60 px-4 py-1.5 text-xs font-bold text-nforest">
                ✨ نموذج تفاعلي — جرّبه بنفسك الآن
              </span>
              <h1 className="mt-5 font-serif-display text-4xl font-black leading-[1.15] text-nink sm:text-5xl">
                المفكرة الذكية
              </h1>
              <p className="mt-3 text-lg font-bold text-nforest">خطّط · أنجز · راجع · نمِ</p>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-nmuted lg:mx-0">
                ليست قائمة مهام، ولا نسخة إلكترونية من المفكرة الورقية — بل مساعد
                شخصي للحياة اليومية. الذكاء في الخلفية، والبساطة في الواجهة:{" "}
                <b className="text-nink">٩٠٪ لمس واختيار</b>.
              </p>

              <ul className="mx-auto mt-6 max-w-md space-y-2.5 text-right text-sm text-nink">
                {[
                  ["🎯", "أهداف جاهزة تختار منها وتعدّلها — بلا صفحات فارغة"],
                  ["✨", "توزيع ذكي: ٢٤٬٠٠٠ ÷ ١٢ = ٢٬٠٠٠ شهرياً تلقائياً"],
                  ["🧩", "كل شيء مرن واختياري — التطبيق يتكيّف معك"],
                  ["🌱", "لمسات إنسانية: تحفيز، وقفات، واحتفاء بالإنجاز"],
                ].map(([e, t]) => (
                  <li key={t} className="flex items-start gap-2">
                    <span>{e}</span>
                    <span className="text-nmuted">{t}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs text-nmuted">
                👈 جرّب: أنجز مهمة بضغطة · أضِف هدفاً وشاهد التوزيع الذكي · فعّل عادة.
              </p>
            </div>

            {/* التطبيق التفاعلي */}
            <div>
              <SmartPlanner />
            </div>
          </div>
        </div>
      </section>

      {/* دعوة */}
      <section className="px-5 pb-16 pt-4">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-nforest/15 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="font-serif-display text-2xl font-black text-nink">
            هذا نموذج مبدئي للقلب النابض — والباقي يُبنى قسماً قسماً
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-nmuted">
            المصحف، الدورات، الروزنامة، التذكيرات، المناسبات، الذاكرة الشخصية،
            «حصاد سنتي»… كلها في الخطة. خلّنا نتفق على الأولويات ونبدأ.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-nforest px-8 py-3.5 text-sm font-bold text-ncream transition hover:bg-nforest/90"
            >
              ناقشني عبر واتساب
            </a>
            <Link
              href="/nama"
              className="rounded-full border border-nforest/25 px-8 py-3.5 text-sm font-bold text-nforest transition hover:bg-ncream"
            >
              شاهد تطبيق نُما
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-nline px-5 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-nmuted sm:flex-row">
          <NamaLogo className="text-base" />
          <p>المفكرة الذكية — نموذج تفاعلي</p>
          <p>© ٢٠٢٦ — من تطوير إبراهيم سعود</p>
        </div>
      </footer>
    </main>
  );
}
