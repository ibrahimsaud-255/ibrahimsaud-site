import type { Metadata } from "next";
import Dashboard from "@/masarak/admin/Dashboard";

export const metadata: Metadata = {
  // لوحة داخلية — لا تُفهرس أبداً
  robots: { index: false, follow: false, nocache: true },
  title: "مسارك — لوحة التحكم",
};

export default function MasarakAdminPage() {
  return <Dashboard />;
}
