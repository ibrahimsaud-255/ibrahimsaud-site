// أيقونات نما (SVG خطّي) + الشعار — بلا اعتماد على أي مكتبة خارجية.

export function NamaLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className="flex items-center gap-1">
        <span
          className="font-serif-display font-black text-nforest"
          style={{ fontSize: "1em" }}
        >
          نُما
        </span>
        <svg
          viewBox="0 0 24 24"
          width="0.42em"
          height="0.42em"
          fill="none"
          aria-hidden
          style={{ marginBottom: "0.35em" }}
        >
          <path
            d="M12 22C12 14 6 10 3 9c0 8 5 12 9 13Zm0 0c0-9 5-14 9-16-1 9-5 14-9 16Z"
            fill="var(--color-nleaf)"
          />
        </svg>
      </span>
      <span
        className="mt-1 tracking-[0.42em] text-nmuted"
        style={{ fontSize: "0.24em", fontWeight: 700 }}
      >
        NAMA
      </span>
    </span>
  );
}

const paths: Record<string, React.ReactNode> = {
  mosque: (
    <>
      <path d="M12 2c2 2 3 3 3 5H9c0-2 1-3 3-5Z" />
      <path d="M4 21v-7a8 8 0 0 1 16 0v7" />
      <path d="M4 21h16M9 21v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  book: (
    <>
      <path d="M12 5.5C10.5 4 7.5 3.5 4 4v14c3.5-.5 6.5 0 8 1.5 1.5-1.5 4.5-2 8-1.5V4c-3.5-.5-6.5 0-8 1.5Z" />
      <path d="M12 5.5V20" />
    </>
  ),
  tools: (
    <>
      <path d="M14 7a3 3 0 1 0 3 3l4 4-2 2-4-4a3 3 0 0 1-4-4l3-1Z" />
      <path d="M6 20l6-6" />
    </>
  ),
  heart: <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M15.5 20c0-2 .6-3.4 2-4 2.3 0 3.5 1.6 3.5 4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 14h2" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M4 9h16M8 3v4M16 3v4M8 14h3" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 20v-7" />
      <path d="M12 13c0-3-2-5-6-5 0 4 3 5 6 5Z" />
      <path d="M12 13c0-3 2-5 6-5 0 4-3 5-6 5Z" />
    </>
  ),
  review: (
    <>
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 15l3-4 3 2 4-6" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
    </>
  ),
  rtl: (
    <>
      <path d="M20 6H9a4 4 0 0 0 0 8h2" />
      <path d="M11 4v16M15 4v16" />
      <path d="M7 18l-3-3 3-3" />
    </>
  ),
  balance: (
    <>
      <path d="M12 3v18M5 21h14" />
      <path d="M12 6l-6 2 3 5a3 3 0 0 1-6 0l3-5" />
      <path d="M12 6l6 2-3 5a3 3 0 0 0 6 0l-3-5" />
    </>
  ),
  measure: (
    <>
      <path d="M3 8l5-5 13 13-5 5L3 8Z" />
      <path d="M8 8l1.5 1.5M11 11l1.5 1.5M14 6l1.5 1.5" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4 4 0 0 1-.5-8A5 5 0 0 1 16 9a3.5 3.5 0 0 1 1 6.9" />
      <path d="M7 18h9" />
    </>
  ),
};

export function Icon({
  name,
  className = "",
  size = 24,
  style,
}: {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {paths[name] ?? null}
    </svg>
  );
}
