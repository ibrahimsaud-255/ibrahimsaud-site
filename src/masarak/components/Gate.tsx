"use client";

import { useEffect, useState } from "react";
import { BRAND, COPY } from "../config";
import { FAILURE_TEXT, formatCode, loadBackend, redeem, startDemo } from "../lib/access";
import {
  IconArrowLeft,
  IconChart,
  IconCheckCircle,
  IconCompass,
  IconGraduationCap,
  IconInfo,
  IconLock,
  IconTarget,
} from "./Icons";

/**
 * شاشة كود التفعيل — أول ما يراه الطالب.
 * الكود يُشترى من المتجر، ويُربط بجهاز واحد عند أول تفعيل.
 */
export default function Gate({ onUnlocked }: { onUnlocked: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  /** null = ما زلنا نتحقّق، false = بلا خادم (وضع تجربة) */
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    loadBackend().then((b) => {
      if (alive) setLinked(b !== null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const ready = code.replace(/[^A-Z0-9]/g, "").length >= 8;

  async function activate() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    const r = await redeem(code);
    setBusy(false);
    if (r.ok) {
      setDone(true);
      setTimeout(onUnlocked, 700);
    } else {
      setError(FAILURE_TEXT[r.reason]);
    }
  }

  return (
    <div className="masarak">
      <div className="mk-bgfx" aria-hidden>
        <span className="mk-orb a" />
        <span className="mk-orb b" />
        <span className="mk-orb c" />
        <span className="mk-grain" />
      </div>

      <div className="mk-shell" style={{ maxWidth: 560 }}>
        <header className="mk-topbar">
          <span className="mk-brand">
            <IconCompass size={24} />
            {BRAND.name}
          </span>
        </header>

        <section
          className="mk-reveal"
          style={{ padding: "26px 2px 8px", textAlign: "center" }}
        >
          <h1 className="mk-h1" style={{ marginBottom: 14 }}>
            {COPY.heroTitle}
          </h1>
          <p className="mk-lead" style={{ margin: "0 auto", maxWidth: 460 }}>
            اختبار ميول علمي + معادلة القبول في ٢٨ جامعة، في منصّة واحدة.
            أدخل كود التفعيل لتبدأ.
          </p>
        </section>

        <section className="mk-glass mk-sheen mk-mt" style={{ padding: 22 }}>
          <div className="mk-row" style={{ marginBottom: 14 }}>
            <span className="mk-major-icon" style={{ width: 40, height: 40 }}>
              <IconLock size={19} />
            </span>
            <span>
              <div style={{ fontWeight: 700, fontSize: 16 }}>كود التفعيل</div>
              <div className="mk-faint" style={{ fontSize: 12.5 }}>
                وصلك في رسالة الشراء
              </div>
            </span>
          </div>

          <input
            className="mk-code-input"
            value={code}
            onChange={(e) => {
              setCode(formatCode(e.target.value));
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && activate()}
            placeholder="MSRK-••••-••••"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            aria-label="كود التفعيل"
            disabled={busy || done}
          />

          {error && (
            <div className="mk-note" style={{ marginTop: 12, borderColor: "rgba(255,95,109,.35)" }}>
              <IconInfo size={18} />
              <span style={{ color: "#ffa8ae" }}>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="mk-btn mk-btn-primary mk-btn-block"
            style={{ marginTop: 16 }}
            onClick={activate}
            disabled={!ready || busy || done}
          >
            {done ? (
              <>
                <IconCheckCircle size={19} />
                تم التفعيل
              </>
            ) : busy ? (
              "جارٍ التحقّق…"
            ) : (
              <>
                ابدأ رحلتك
                <IconArrowLeft size={19} />
              </>
            )}
          </button>

          <p className="mk-faint" style={{ fontSize: 12.5, margin: "14px 0 0", lineHeight: 1.8 }}>
            الكود يُفعَّل مرّة واحدة ويرتبط بهذا الجهاز، وتبقى نتيجتك متاحة
            لك عليه.
          </p>
        </section>

        <div className="mk-grid mk-mt" style={{ gap: 10 }}>
          {[
            {
              icon: <IconTarget size={18} />,
              t: "اختبار ميول مبني على نموذج هولاند",
              s: "٧٥ سؤالاً تكشف نمطك المهني وقيمك في العمل",
            },
            {
              icon: <IconChart size={18} />,
              t: "معادلة كل جامعة على حدة",
              s: "نسبتك الموزونة تختلف من جامعة لأخرى — ونحسبها كلها",
            },
            {
              icon: <IconGraduationCap size={18} />,
              t: "تخصصات تناسبك أنت",
              s: "ترتيب يجمع بين ما تحبّه وما تسمح به درجاتك",
            },
          ].map((f) => (
            <div key={f.t} className="mk-glass-sm" style={{ padding: 16 }}>
              <div className="mk-row" style={{ alignItems: "flex-start" }}>
                <span style={{ color: "var(--mk-accent)", marginTop: 2 }}>{f.icon}</span>
                <span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{f.t}</div>
                  <div className="mk-faint" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.7 }}>
                    {f.s}
                  </div>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mk-center mk-mt mk-row mk-wrap" style={{ justifyContent: "center" }}>
          <a
            className="mk-btn mk-btn-ghost"
            href={BRAND.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ما عندك كود؟ احصل عليه
          </a>

          {linked === false && (
            <button
              type="button"
              className="mk-btn mk-btn-ghost"
              onClick={() => {
                startDemo();
                onUnlocked();
              }}
            >
              جرّب المنصّة بلا كود
            </button>
          )}
        </div>

        {linked === false && (
          <div className="mk-note mk-mt">
            <IconInfo size={18} />
            <span>
              <b style={{ color: "var(--mk-ink)" }}>وضع التجربة.</b> لم تُربط
              قاعدة الأكواد بعد، فالمنصّة تعمل الآن محلياً بلا تفعيل. لتشغيل
              البيع: أنشئ مشروع Supabase، شغّل{" "}
              <code style={{ fontSize: 12 }}>supabase/masarak.sql</code>، ثم ضع
              الرابط والمفتاح في{" "}
              <code style={{ fontSize: 12 }}>public/masarak/backend.json</code>.
            </span>
          </div>
        )}

        <footer
          className="mk-center mk-faint mk-mt-lg"
          style={{ fontSize: 12.5, lineHeight: 1.9, paddingTop: 16 }}
        >
          {BRAND.name} — {BRAND.tagline}
        </footer>
      </div>
    </div>
  );
}
