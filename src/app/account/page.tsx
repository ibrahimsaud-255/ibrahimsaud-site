import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import AccountView from "@/components/v2/shop/AccountView";

// «حسابي»: مشتريات المتجر وآخر إصدار من ملفّاتها — دخول برمز على البريد (دالّة shop-account).
export const metadata: Metadata = {
  title: "حسابي — مشترياتك | إبراهيم سعود",
  description: "ادخل ببريدك وحمّل آخر إصدار من البرامج والملفّات اللي اشتريتها.",
  robots: { index: false, follow: false },
};

export default function Account() {
  return (
    <Shell>
      <Nav />
      <main className="v2-shop-thanks-main">
        <div className="v2-wrap">
          <AccountView />
        </div>
      </main>
      <Footer />
    </Shell>
  );
}
