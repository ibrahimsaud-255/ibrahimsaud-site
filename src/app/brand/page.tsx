// «حضور» أُزيلت من الموقع (قرار إبراهيم ٢٠٢٦-١١-٢١): صفحة «صناعة المحتوى» تكفي لمن يبحث عن الأعمال الإعلاميّة.
// بياناتها باقية في products.brand وpkgs.hudoor* داخل src/lib/v2.ts لو احتجتها.
import Redirect, { redirectMeta } from "@/components/v2/Redirect";

export const metadata = redirectMeta("/content/", "صناعة المحتوى");

export default function Page() {
  return <Redirect to="/content/" label="صناعة المحتوى" />;
}
