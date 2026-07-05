import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import WorkDetail from "@/components/WorkDetail";

export const metadata = {
  title: "تفاصيل العمل — إبراهيم سعود",
};

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-5 pb-24 pt-32">
        <Suspense
          fallback={
            <p className="mx-auto max-w-5xl text-cream/60">…جارٍ التحميل</p>
          }
        >
          <WorkDetail />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
