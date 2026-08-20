import type { Metadata } from "next";

export const metadata: Metadata = {
  // نموذج خاص يُعرض على عميل — غير مُفهرس في محركات البحث حتى الإطلاق الرسمي.
  robots: { index: false, follow: false, nocache: true },
  title: "نُما — مخطّط النمو والإنجاز الشخصي",
  description:
    "نُما تطبيق عربي يضع رؤيتك السنوية في المركز ويترجمها إلى أهداف وعادات وخطط ومراجعات في ستة مجالات للحياة. نموذج تعريفي.",
  openGraph: {
    title: "نُما — مخطّط النمو والإنجاز الشخصي",
    description:
      "خطّط • انمُ • أنجز — تطبيق عربي للنمو المتوازن في ستة مجالات للحياة.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function NamaLayout({ children }: { children: React.ReactNode }) {
  return <div className="nama-scope">{children}</div>;
}
