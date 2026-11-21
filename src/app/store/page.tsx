// «الباقات» أُزيلت من الموقع (قرار إبراهيم ٢٠٢٦-١١-٢١). الرابط القديم يحوّل للرئيسيّة.
// (صفحات الشراء الحيّة باقية في أماكنها: /systems/charities/ و/lessons-broadcast/ و/ad-packages/ و/video/.)
import Redirect, { redirectMeta } from "@/components/v2/Redirect";

export const metadata = redirectMeta("/", "إبراهيم سعود");

export default function Page() {
  return <Redirect to="/" label="الصفحة الرئيسيّة" />;
}
