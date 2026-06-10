import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Works from "@/components/Works";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Works />
        <Services />
        <Process />
        <Contact />
        <Brands />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
