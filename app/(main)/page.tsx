import HeroSection from "@/components/home/HeroSection";
import DomainSearchSection from "@/components/home/DomainSearchSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import WhyNupatSection from "@/components/home/WhyNupatSection";
import StartupProgramSection from "@/components/home/StartupProgramSection";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";
import InfrastructureSection from "@/components/home/InfrastructureSection";
import EverythingBusinessNeedsSection from "@/components/home/EverythingBusinessNeedsSection";
import FAQSection from "@/components/home/FAQSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

// ProfessionalVoiceSection (business email) is not rendered while email is off the site.
// FinalCTASection was already disabled; both component files are kept.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DomainSearchSection />
      <WhyChooseUsSection />
      <WhyNupatSection />
      <StartupProgramSection />
      <PricingPreviewSection />
      <InfrastructureSection />
      <EverythingBusinessNeedsSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}
