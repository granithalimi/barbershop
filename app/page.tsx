import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ValuePillars from "@/components/landing/ValuePillars";
import ServicesSection from "@/components/landing/ServicesSection";
import GallerySection from "@/components/landing/GallerySection";
import BarbersSection from "@/components/landing/BarbersSection";
import ShopInfoSection from "@/components/landing/ShopInfoSection";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

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
