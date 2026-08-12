import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(124, 58, 237, 0.12)", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(79, 70, 229, 0.12)", filter: "blur(120px)" }}
      />
      
      <NavBar />
      <main>
        <HeroSection />
        <IntegrationsSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
