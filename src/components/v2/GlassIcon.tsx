// أيقونات المنتجات على نمط أيقونات آبل الحديثة (Liquid Glass بالوضع الفاتح):
// مربّع أبيض بانحناء آبل المتّصل، ورمز بطبقتين: طبقة زرقاء من الهويّة وفوقها طبقة زجاجيّة شفّافة.
const SQUIRCLE = "M100.00 50.00 L99.92 68.84 L99.69 74.82 L99.31 79.12 L98.77 82.55 L98.07 85.43 L97.20 87.89 L96.17 90.03 L94.94 91.90 L93.53 93.53 L91.90 94.94 L90.03 96.17 L87.89 97.20 L85.43 98.07 L82.55 98.77 L79.12 99.31 L74.82 99.69 L68.84 99.92 L50.00 100.00 L31.16 99.92 L25.18 99.69 L20.88 99.31 L17.45 98.77 L14.57 98.07 L12.11 97.20 L9.97 96.17 L8.10 94.94 L6.47 93.53 L5.06 91.90 L3.83 90.03 L2.80 87.89 L1.93 85.43 L1.23 82.55 L0.69 79.12 L0.31 74.82 L0.08 68.84 L0.00 50.00 L0.08 31.16 L0.31 25.18 L0.69 20.88 L1.23 17.45 L1.93 14.57 L2.80 12.11 L3.83 9.97 L5.06 8.10 L6.47 6.47 L8.10 5.06 L9.97 3.83 L12.11 2.80 L14.57 1.93 L17.45 1.23 L20.88 0.69 L25.18 0.31 L31.16 0.08 L50.00 0.00 L68.84 0.08 L74.82 0.31 L79.12 0.69 L82.55 1.23 L85.43 1.93 L87.89 2.80 L90.03 3.83 L91.90 5.06 L93.53 6.47 L94.94 8.10 L96.17 9.97 L97.20 12.11 L98.07 14.57 L98.77 17.45 L99.31 20.88 L99.69 25.18 L99.92 31.16Z";

type Kind = "hudoor" | "nasaq" | "studio" | "hawiya" | "publish";

export default function GlassIcon({ kind, size = 76 }: { kind: Kind; size?: number }) {
  const id = `gi-${kind}`;
  const blue = `url(#${id}-b)`, glass = `url(#${id}-g)`, sh = `url(#${id}-s)`;
  const gl = { fill: glass, stroke: "rgba(255,255,255,.95)", strokeWidth: 1.2, filter: sh };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="v2-glass-icon">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#ECEFF5" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FA2FF" /><stop offset="1" stopColor="#2F66FF" />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9D8FF" /><stop offset="1" stopColor="#8FB0FF" />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F7FF" stopOpacity=".78" /><stop offset="1" stopColor="#B9CCFF" stopOpacity=".55" />
        </linearGradient>
        <filter id={`${id}-s`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1E2D5A" floodOpacity=".22" />
        </filter>
      </defs>
      {/* انحناء آبل المتّصل: قطع زائد فائق (|x|⁵ + |y|⁵ = 1) */}
      <path d={SQUIRCLE} fill={`url(#${id}-bg)`} stroke="rgba(0,0,0,.08)" strokeWidth="1" />

      {kind === "hudoor" && (<>
        <circle cx="50" cy="40" r="15" fill={blue} />
        <path d="M23 82c0-17 12-26 27-26s27 9 27 26Z" {...gl} />
      </>)}

      {kind === "nasaq" && (<>
        <rect x="53" y="22" width="25" height="25" rx="7.5" fill={blue} />
        <rect x="22" y="53" width="25" height="25" rx="7.5" fill={blue} />
        <rect x="22" y="22" width="25" height="25" rx="7.5" fill={`url(#${id}-l)`} />
        <rect x="45" y="45" width="33" height="33" rx="9.5" {...gl} />
      </>)}

      {kind === "studio" && (<>
        <rect x="38" y="16" width="24" height="42" rx="12" fill={blue} />
        <path d="M28 46a22 22 0 0 0 44 0" fill="none" stroke="#9AA6C2" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M50 68v12M38 82h24" stroke="#9AA6C2" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="33" y="33" width="34" height="14" rx="7" {...gl} />
      </>)}

      {kind === "hawiya" && (<>
        <circle cx="39" cy="40" r="18" fill={blue} />
        <circle cx="61" cy="40" r="18" fill={`url(#${id}-l)`} />
        <circle cx="50" cy="60" r="18" {...gl} />
      </>)}

      {kind === "publish" && (<>
        <path d="M18 47 82 20 60 82 47 57Z" fill={blue} strokeLinejoin="round" />
        <path d="M47 57 82 20 38 49Z" {...gl} strokeLinejoin="round" />
      </>)}
    </svg>
  );
}
