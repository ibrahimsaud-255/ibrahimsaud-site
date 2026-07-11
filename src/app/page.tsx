import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

// أقسام الصفحة (ما بعد الهيرو) تُدار من النظام الداخلي:
// الترتيب والإظهار/الإخفاء في HomeSections → مفتاح layout.
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HomeSections />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
