// «النظام» العامّ للمنشآت أُزيل من الموقع (قرار ٢٠٢٦-١١-٢١): المنتج الوحيد للأنظمة = نظام الجمعيات الشبابية.
// (بيانات الصفحة القديمة باقية في products.systems داخل src/lib/v2.ts لو احتجتها.)
import Redirect, { redirectMeta } from "@/components/v2/Redirect";

export const metadata = redirectMeta("/systems/charities/", "نظام الجمعيات الشبابية");

export default function Page() {
  return <Redirect to="/systems/charities/" label="نظام الجمعيات الشبابية" />;
}
