import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Works from "@/components/Works";
import Services from "@/components/Services";
import PlaygroundServices from "@/components/PlaygroundServices";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import ReelsExperience from "@/components/ReelsExperience";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Works />
        <PlaygroundServices />
        <Services />
        <Process />
        <Contact />
        <Brands />
      </main>
      <Footer />
      <WhatsAppFab />
      <ReelsExperience />
    </>
  );
}
