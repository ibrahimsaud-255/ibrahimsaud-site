/**
 * أيقونات «مسارك» — مرسومة يدوياً على نسق SF Symbols:
 * شبكة ٢٤×٢٤، حدود بسماكة ١٫٧، أطراف ونهايات دائرية، بلا أي إيموجي.
 * كل الأيقونات ترث لون النص (currentColor) وحجمها من الخاصية `size`.
 */

type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number, sw: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
  focusable: false as const,
});

const I = (path: React.ReactNode) =>
  function Icon({ size = 24, className, strokeWidth = 1.7 }: P) {
    return <svg {...base(size, strokeWidth, className)}>{path}</svg>;
  };

/* ── الهوية والتنقّل ── */

/** بوصلة — شعار المنصة */
export const IconCompass = I(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.4 8.6 13.7 13.7 8.6 15.4 10.3 10.3z" />
  </>
);

export const IconChevronDown = I(<path d="m6 9.5 6 6 6-6" />);
export const IconChevronLeft = I(<path d="m14.5 6-6 6 6 6" />);
export const IconChevronRight = I(<path d="m9.5 6 6 6-6 6" />);
export const IconArrowRight = I(
  <>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </>
);
export const IconArrowLeft = I(
  <>
    <path d="M20 12H4" />
    <path d="m10 6-6 6 6 6" />
  </>
);
export const IconXmark = I(<path d="M6 6 18 18M18 6 6 18" />);
export const IconRefresh = I(
  <>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </>
);
export const IconShare = I(
  <>
    <path d="M12 15V4" />
    <path d="m8.5 7.5 3.5-3.5 3.5 3.5" />
    <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </>
);
export const IconSliders = I(
  <>
    <path d="M5 7h14M5 12h14M5 17h14" />
    <circle cx="9" cy="7" r="2" />
    <circle cx="15" cy="12" r="2" />
    <circle cx="8" cy="17" r="2" />
  </>
);

/* ── الحالة ── */

export const IconCheckCircle = I(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
  </>
);
export const IconCheck = I(<path d="m5 12.5 4.5 4.5L19 7" />);
export const IconMinusCircle = I(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12h7" />
  </>
);
export const IconAlert = I(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.2" />
    <path d="M12 16.3h.01" />
  </>
);
export const IconLock = I(
  <>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </>
);
export const IconInfo = I(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <path d="M12 7.8h.01" />
  </>
);

/* ── التعليم والمكان ── */

export const IconGraduationCap = I(
  <>
    <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />
    <path d="M6.5 11.2V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.8" />
    <path d="M21.5 9v5" />
  </>
);
export const IconBuilding = I(
  <>
    <path d="M4 20h16" />
    <path d="M6 20V6.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 6.5V20" />
    <path d="M9.5 8.5h1M13.5 8.5h1M9.5 12h1M13.5 12h1" />
    <path d="M10.5 20v-3.5h3V20" />
  </>
);
export const IconMapPin = I(
  <>
    <path d="M12 21c4-4.2 6-7.3 6-10a6 6 0 1 0-12 0c0 2.7 2 5.8 6 10z" />
    <circle cx="12" cy="11" r="2.3" />
  </>
);
export const IconCalendar = I(
  <>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </>
);
export const IconUser = I(
  <>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </>
);
export const IconPercent = I(
  <>
    <path d="m6 18 12-12" />
    <circle cx="7.5" cy="7.5" r="2.2" />
    <circle cx="16.5" cy="16.5" r="2.2" />
  </>
);
export const IconChart = I(
  <>
    <path d="M4 20h16" />
    <path d="M7 20v-6M12 20V6M17 20v-9" />
  </>
);
export const IconTarget = I(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </>
);
export const IconSearch = I(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </>
);
export const IconDocument = I(
  <>
    <path d="M6 3.5h7.5L18.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" />
    <path d="M13.5 3.5v5h5" />
    <path d="M8 13h7M8 16.5h5" />
  </>
);

/* ── أيقونات المجالات ── */

/** صحي — سمّاعة الطبيب */
export const IconStethoscope = I(
  <>
    <path d="M6 3.5v5a4 4 0 0 0 8 0v-5" />
    <path d="M4.5 3.5h3M12.5 3.5h3" />
    <path d="M10 16.5v-4" />
    <path d="M10 16.5a4.5 4.5 0 0 0 9 0v-1.2" />
    <circle cx="19" cy="13" r="2.2" />
  </>
);

/** هندسة — ترس */
export const IconGear = I(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
  </>
);

/** حاسب — رقاقة معالج */
export const IconChip = I(
  <>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10.5 3.5v3.5M13.5 3.5v3.5M10.5 17v3.5M13.5 17v3.5M3.5 10.5H7M3.5 13.5H7M17 10.5h3.5M17 13.5h3.5" />
  </>
);

/** علوم — دورق تجارب */
export const IconFlask = I(
  <>
    <path d="M9.5 3.5h5" />
    <path d="M10.5 3.5v5.2L5.8 17.4A2 2 0 0 0 7.6 20.5h8.8a2 2 0 0 0 1.8-3.1L13.5 8.7V3.5" />
    <path d="M8.3 14h7.4" />
  </>
);

/** أعمال — حقيبة */
export const IconBriefcase = I(
  <>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
    <path d="M3.5 12.5h17" />
  </>
);

/** قانون — ميزان */
export const IconScale = I(
  <>
    <path d="M12 4v16M7 20h10" />
    <path d="M5 8h14" />
    <path d="M5 8 2.5 14h5zM19 8l-2.5 6h5z" />
  </>
);

/** إنسانيات — كتاب مفتوح */
export const IconBookOpen = I(
  <>
    <path d="M12 6.5C10.5 5 8.5 4.5 4 4.8v13c4.5-.3 6.5.2 8 1.7 1.5-1.5 3.5-2 8-1.7v-13c-4.5-.3-6.5.2-8 1.7z" />
    <path d="M12 6.5v13" />
  </>
);

/** شرعي — هلال ومحراب */
export const IconCrescent = I(
  <>
    <path d="M17.5 15.8A7 7 0 0 1 8.6 6.2a7.5 7.5 0 1 0 8.9 9.6z" />
    <path d="M17.5 4.5v3.2M15.9 6.1h3.2" />
  </>
);

/** تربية — شخص وكتاب */
export const IconTeach = I(
  <>
    <circle cx="8" cy="7" r="2.8" />
    <path d="M3.5 19c.5-3 2.3-4.8 4.5-4.8" />
    <path d="M12 19.5V9.5c1.5-1 3-1.2 5-.8v10c-2-.4-3.5-.2-5 .8z" />
    <path d="M17 8.7c1-.2 2-.2 3 0v10c-1-.2-2-.2-3 0" />
  </>
);

/** تصميم — فرشاة */
export const IconBrush = I(
  <>
    <path d="M14.8 4.9 19.1 9.2 10.4 17.9a3 3 0 0 1-4.3-4.3z" />
    <path d="m13.2 6.5 4.3 4.3" />
    <path d="M6 17.5c-1 1-1.3 2.4-3 2.5.7-1.6.4-2.7 1.4-3.7" />
  </>
);

/* ── ربط المجالات بأيقوناتها ── */

export const FIELD_ICON = {
  health: IconStethoscope,
  engineering: IconGear,
  computing: IconChip,
  science: IconFlask,
  business: IconBriefcase,
  law: IconScale,
  humanities: IconBookOpen,
  sharia: IconCrescent,
  education: IconTeach,
  design: IconBrush,
} as const;

export const FIELD_NAME = {
  health: "صحي",
  engineering: "هندسة",
  computing: "حاسب وتقنية",
  science: "علوم",
  business: "إدارة وأعمال",
  law: "قانون وسياسة",
  humanities: "إنسانيات ولغات",
  sharia: "شرعي",
  education: "تربية",
  design: "تصميم وفنون",
} as const;
