import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "المفكرة الذكية — خطّط · أنجز · راجع · نمِ",
  description:
    "نموذج تفاعلي للمفكرة الذكية: مساعد شخصي للتخطيط والحياة اليومية — بسيط جداً، ٩٠٪ لمس واختيار، وتوزيع ذكي للأهداف.",
};

export default function MufakkiraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="nama-scope">{children}</div>;
}
