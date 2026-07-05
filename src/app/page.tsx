import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Works from "@/components/Works";
import Services from "@/components/Services";
import Newsletter from "@/components/Newsletter";
import Podcast from "@/components/Podcast";
import StudioTour from "@/components/StudioTour";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Brands />
        <Podcast />
        <StudioTour />
        <Services />
        <Works />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
