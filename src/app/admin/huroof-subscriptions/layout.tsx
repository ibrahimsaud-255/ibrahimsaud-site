import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اشتراكات حروف ودروس — لوحة الإدارة",
  description: "تفعيل يدويّ للاشتراكات وتشخيص إشكاليّات Telr.",
  robots: { index: false, follow: false, nocache: true },
};

export default function HuroofSubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
