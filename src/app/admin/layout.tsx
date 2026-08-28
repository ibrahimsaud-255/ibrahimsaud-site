import type { Metadata } from "next";

/**
 * تخطيط الإدارة — يمنع فهرسة كلّ ما تحت `/admin` في محرّكات البحث.
 * لوحاتٌ داخلية لإبراهيم وحده، لا موضعَ لها في نتائج البحث.
 */
export const metadata: Metadata = {
  title: "نظام إبراهيم سعود — الإدارة",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
