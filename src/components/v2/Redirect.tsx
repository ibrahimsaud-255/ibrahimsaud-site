// تحويل صفحة أُزيلت إلى بديلها — الموقع تصدير ثابت (لا تحويل من الخادم)، فالتحويل من المتصفّح
// والصفحة noindex مع canonical للبديل (يُصدَّر من الصفحة نفسها عبر redirectMeta).
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/share";

export const redirectMeta = (to: string, title: string): Metadata => ({ title, robots: { index: false, follow: true }, alternates: { canonical: `${SITE_URL}${to}` } });

export default function Redirect({ to, label }: { to: string; label: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(to)})` }} />
      <p style={{ padding: 40, textAlign: "center", fontFamily: "system-ui" }}>
        انتقلت الصفحة إلى <a href={to}>{label}</a>.
      </p>
    </>
  );
}
