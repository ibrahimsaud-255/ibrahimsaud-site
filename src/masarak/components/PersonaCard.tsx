"use client";

import { ANCHOR_BY_ID, ONET_ATTRIBUTION, RIASEC_BY_ID } from "../data/instrument";
import { rankedAnchors, rankedInterests, type Profile } from "../lib/personality";
import {
  IconBriefcase,
  IconCheckCircle,
  IconInfo,
  IconRefresh,
  IconTarget,
} from "./Icons";

/** بطاقة نتيجة اختبار الشخصية: النمط، الميول الستة، والقيم المهنية. */
export default function PersonaCard({
  profile,
  onRetake,
  compact = false,
}: {
  profile: Profile;
  onRetake?: () => void;
  compact?: boolean;
}) {
  const interests = rankedInterests(profile);
  const anchors = rankedAnchors(profile);
  const top = profile.code.map((c) => RIASEC_BY_ID[c]);

  return (
    <section className="mk-glass mk-sheen mk-reveal" style={{ padding: 22 }}>
      <div className="mk-between mk-wrap" style={{ marginBottom: 16 }}>
        <div>
          <div className="mk-label">شخصيتك المهنية</div>
          <h2 className="mk-h2" style={{ margin: "6px 0 8px" }}>
            {profile.persona}
          </h2>
          <div className="mk-row mk-wrap" style={{ gap: 6 }}>
            <span className="mk-chip" data-tone="likely" dir="ltr">
              {profile.code.join("")}
            </span>
            {top.map((t) => (
              <span key={t.id} className="mk-chip">
                {t.name}
              </span>
            ))}
          </div>
        </div>
        {onRetake && (
          <button type="button" className="mk-btn mk-btn-ghost" onClick={onRetake}>
            <IconRefresh size={18} />
            أعد الاختبار
          </button>
        )}
      </div>

      <p className="mk-dim" style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.85 }}>
        {top[0].summary}
      </p>

      {!compact && (
        <>
          <div className="mk-row" style={{ marginBottom: 10 }}>
            <IconTarget size={17} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>ميولك المهنية</span>
          </div>
          <div className="mk-grid" style={{ gap: 8, marginBottom: 22 }}>
            {interests.map(({ type, score }, i) => (
              <div className="mk-bar" key={type.id} data-top={i < 3}>
                <span>{type.name}</span>
                <div className="mk-bar-track">
                  <i style={{ width: `${score}%` }} />
                </div>
                <b dir="ltr">{Math.round(score)}٪</b>
              </div>
            ))}
          </div>

          <div className="mk-row" style={{ marginBottom: 10 }}>
            <IconBriefcase size={17} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              ما الذي يهمّك في الوظيفة
            </span>
          </div>
          <div className="mk-grid" style={{ gap: 8 }}>
            {anchors.map(({ anchor, score }, i) => (
              <div className="mk-bar" key={anchor.id} data-top={i < 3}>
                <span>{anchor.name}</span>
                <div className="mk-bar-track">
                  <i style={{ width: `${score}%` }} />
                </div>
                <b dir="ltr">{Math.round(score)}٪</b>
              </div>
            ))}
          </div>

          <div className="mk-grid mk-mt" style={{ gap: 10 }}>
            {profile.topAnchors.map((id) => {
              const a = ANCHOR_BY_ID[id];
              return (
                <div key={id} className="mk-glass-sm" style={{ padding: 15 }}>
                  <div className="mk-row" style={{ alignItems: "flex-start" }}>
                    <span style={{ color: "var(--mk-green)", marginTop: 2 }}>
                      <IconCheckCircle size={17} />
                    </span>
                    <span>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                      <div
                        className="mk-dim"
                        style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.75 }}
                      >
                        {a.summary}
                      </div>
                      <div className="mk-row mk-wrap" style={{ gap: 5, marginTop: 8 }}>
                        {a.environments.map((e) => (
                          <span key={e} className="mk-chip" style={{ fontSize: 12 }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mk-note mk-mt">
            <IconInfo size={18} />
            <span>
              المقياس مبني على نموذج <b style={{ color: "var(--mk-ink)" }}>هولاند
              للأنماط المهنية الستة</b> (على نسق أداة O*NET Interest Profiler
              الصادرة عن وزارة العمل الأمريكية)، ونموذج{" "}
              <b style={{ color: "var(--mk-ink)" }}>إدغار شاين للمراسي المهنية</b>{" "}
              في قياس القيم. {ONET_ATTRIBUTION}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
