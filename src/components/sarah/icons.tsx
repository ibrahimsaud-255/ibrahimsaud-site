// أيقونات المتجر — SVG خطّية بنمط Lucide (٢٤×٢٤، حدّ ١.٧، أطراف دائرية).
// كلها ترث لون النص (currentColor) وتتحجّم بـ className.

type P = { className?: string; strokeWidth?: number };

const base = (className = "size-6", strokeWidth = 1.7) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

/** مسطرة — المقاسات */
export const IconRuler = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0l-2.6-2.6a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4Z" />
    <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />
  </svg>
);

/** مقص — التفصيل */
export const IconScissors = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <circle cx="6" cy="6" r="2.6" />
    <circle cx="6" cy="18" r="2.6" />
    <path d="M20 4 8.5 15.5M14.6 14.6 20 20M8.5 8.5 12 12" />
  </svg>
);

/** شاحنة — الشحن */
export const IconTruck = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M2 4.8h12a.8.8 0 0 1 .8.8V16H2.8a.8.8 0 0 1-.8-.8Z" />
    <path d="M14.8 8.6H18l3 3.2V16h-6.2Z" />
    <circle cx="6.5" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
    <path d="M8.5 18h7" />
  </svg>
);

/** تدوير — تعديل المقاس مجاناً */
export const IconRepeat = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="m17 2 3.5 3.5L17 9" />
    <path d="M3.5 11.5v-2a4 4 0 0 1 4-4h13" />
    <path d="m7 22-3.5-3.5L7 15" />
    <path d="M20.5 12.5v2a4 4 0 0 1-4 4h-13" />
  </svg>
);

/** إبرة وخيط — شعار المتجر */
export const IconNeedle = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M20.5 3.5 9.8 14.2" />
    <path d="m8.4 15.6-2.1 2.1a1.5 1.5 0 0 0 0 2.1 1.5 1.5 0 0 0 2.1 0l2.1-2.1" />
    <path d="M20.5 3.5 18 6" />
    <path d="M17.4 5.1c.7.4 1.1 1.1 1.1 1.9" />
    <path d="M6.2 19.8c-1.6.6-3 .2-3.6-1-.7-1.4.2-2.9 1.8-3.4 1.4-.5 2.5.1 2.6 1.1.1.9-.7 1.5-1.5 1.3" />
  </svg>
);

/** علّاقة ملابس — اختيار القطعة */
export const IconHanger = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M12 8.5V11" />
    <path d="M12 8.5a2.2 2.2 0 1 1 2.2-2.2" />
    <path d="M12 11 3.6 16.2a1.4 1.4 0 0 0 .8 2.6h15.2a1.4 1.4 0 0 0 .8-2.6L12 11Z" />
  </svg>
);

/** إرسال — الطلب في واتساب */
export const IconSend = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
  </svg>
);

/** مصرف — التحويل البنكي */
export const IconBank = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M3 9.5 12 4l9 5.5" />
    <path d="M5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8" />
    <path d="M3 20.5h18" />
  </svg>
);

/** طرد — الاستلام */
export const IconPackage = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <path d="M20.5 7.8v8.4a1.6 1.6 0 0 1-.9 1.4l-6.8 3.6a1.6 1.6 0 0 1-1.6 0l-6.8-3.6a1.6 1.6 0 0 1-.9-1.4V7.8" />
    <path d="m3.5 7.5 8.5 4.4 8.5-4.4L12.8 3.2a1.6 1.6 0 0 0-1.6 0L3.5 7.5Z" />
    <path d="M12 11.9V21" />
  </svg>
);

/** صح — قوائم المزايا */
export const IconCheck = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2.4)}>
    <path d="m20 6.5-11 11L4 12.5" />
  </svg>
);

/** إغلاق */
export const IconClose = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** سهم لأسفل — الأسئلة الشائعة */
export const IconChevron = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2.2)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** قائمة (برجر) */
export const IconMenu = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

/** زائد / ناقص — الكمية */
export const IconPlus = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2.2)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth ?? 2.2)}>
    <path d="M5 12h14" />
  </svg>
);

/** صورة — خانة صورة فارغة */
export const IconImage = ({ className, strokeWidth }: P) => (
  <svg {...base(className, strokeWidth)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.4" />
    <path d="m4 17 4.5-4.5 3 3L15 12l5 5" />
  </svg>
);

/** واتساب — شعار مصمَت */
export const IconWhatsApp = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
    <path d="M16.004 0h-.008C7.174 0 .004 7.17.004 16c0 3.49 1.12 6.73 3.03 9.36L1.05 31.5l6.31-2.02A15.9 15.9 0 0 0 16.004 32C24.83 32 32 24.83 32 16S24.83 0 16.004 0zm9.32 22.6c-.39 1.1-1.94 2.01-3.17 2.28-.84.18-1.94.32-5.64-1.21-4.73-1.96-7.78-6.77-8.02-7.08-.23-.31-1.92-2.56-1.92-4.88s1.22-3.46 1.65-3.93c.36-.39.94-.57 1.5-.57.18 0 .35.01.5.02.43.02.65.04.94.73.36.85 1.23 2.96 1.34 3.18.11.22.18.48.04.79-.13.31-.2.5-.4.77-.2.27-.42.6-.6.8-.2.22-.4.46-.18.86.23.39 1.02 1.68 2.19 2.72 1.51 1.34 2.78 1.76 3.22 1.94.33.14.72.11.96-.15.31-.33.69-.88 1.08-1.42.27-.39.62-.44.99-.31.38.13 2.4 1.13 2.81 1.34.41.2.69.31.79.48.1.18.1 1.02-.29 2.12z" />
  </svg>
);

/** ماسة صغيرة — فاصل زخرفي */
export const IconDiamond = ({ className = "size-3" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2c2.2 4.4 5.4 7.6 9.8 10-4.4 2.4-7.6 5.6-9.8 10-2.2-4.4-5.4-7.6-9.8-10C6.6 9.6 9.8 6.4 12 2Z" />
  </svg>
);
