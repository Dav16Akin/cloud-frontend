import HeroSection from "@/components/home/HeroSection";
import WhyNupatSection from "@/components/home/WhyNupatSection";
import StartupProgramSection from "@/components/home/StartupProgramSection";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";
import StatsSection from "@/components/home/StatsSection";
import NetworkSection from "@/components/home/NetworkSection";
import DeveloperSection from "@/components/home/DeveloperSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTASection from "@/components/home/FinalCTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyNupatSection />
      <StartupProgramSection />
      <PricingPreviewSection />
      <StatsSection />
      {/* <NetworkSection /> */}
      <DeveloperSection />
      <TestimonialsSection />
      <FinalCTASection />
    </>
  );
}
