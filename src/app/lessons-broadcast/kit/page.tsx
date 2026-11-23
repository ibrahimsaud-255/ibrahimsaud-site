import type { Metadata } from "next";
import "@/components/v2/v2.css";
import "@/components/v2/shop.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import KitView from "@/components/v2/shop/KitView";
import { SITE_URL } from "@/lib/share";

// الهديّة المجّانيّة لقمع «بث الدروس»: قائمة تجهيز المسجد للبث (للطباعة) مقابل الاسم والبريد.
const TITLE = "قائمة تجهيز المسجد لبث الدروس — مجانية للطباعة";
const DESC = "معدات بث الدروس في المسجد بثلاثة مستويات، وقائمة فحص قبل الدرس، وورقة تشغيل للصقها في غرفة الإعلام. مجانية.";
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/lessons-broadcast/kit/` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/lessons-broadcast/kit/`, siteName: "إبراهيم سعود", locale: "ar_SA", type: "website", images: [{ url: `${SITE_URL}/shop/lessons-broadcast/shot-speaker.jpg` }] },
};

export default function Kit() {
  return (
    <Shell>
      <div className="no-print"><Nav /></div>
      <main className="v2-shop-thanks-main">
        <div className="v2-wrap">
          <KitView />
        </div>
      </main>
      <div className="no-print"><Footer /></div>
    </Shell>
  );
}
