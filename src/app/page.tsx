import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Works from "@/components/Works";
import PlaygroundServices from "@/components/PlaygroundServices";
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
        <Works />
        <PlaygroundServices />
        <Podcast />
        <StudioTour />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
