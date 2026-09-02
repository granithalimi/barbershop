import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import ValuePillars from "./_components/ValuePillars";
import ServicesSection from "./_components/ServicesSection";
import GallerySection from "./_components/GallerySection";
import BarbersSection from "./_components/BarbersSection";
import ShopInfoSection from "./_components/ShopInfoSection";
import CtaBanner from "./_components/CtaBanner";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <HeroSection />
      <ValuePillars />
      <ServicesSection />
      <GallerySection />
      <BarbersSection />
      <ShopInfoSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
