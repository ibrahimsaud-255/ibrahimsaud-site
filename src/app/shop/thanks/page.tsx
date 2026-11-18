import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import ThanksView from "@/components/v2/shop/ThanksView";

// صفحة الشكر وتفاصيل الطلب — تُفتح من عودة تلر أو من رابط الإيميل (?o=&t=).
export const metadata: Metadata = {
  title: "طلبك — المتجر | إبراهيم سعود",
  robots: { index: false, follow: false },
  referrer: "no-referrer", // الرابط يحمل رمز الطلب: لا يتسرّب لأيّ موقع آخر
};

export default function Thanks() {
  return (
    <Shell>
      <Nav />
      <main className="v2-shop-thanks-main">
        <div className="v2-wrap">
          <ThanksView />
        </div>
      </main>
      <Footer />
    </Shell>
  );
}
