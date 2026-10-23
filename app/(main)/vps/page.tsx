import type { Metadata } from "next";
import VpsHeroSection from "@/components/vps/VpsHeroSection";
import VpsFeaturesSection from "@/components/vps/VpsFeaturesSection";
import VpsUseCasesSection from "@/components/vps/VpsUseCasesSection";
import VpsRootAccessSection from "@/components/vps/VpsRootAccessSection";
import VpsOsTemplatesSection from "@/components/vps/VpsOsTemplatesSection";
import VpsTestimonialSection from "@/components/vps/VpsTestimonialSection";
import VpsPricingSection from "@/components/vps/VpsPricingSection";
import VpsStatsSection from "@/components/vps/VpsStatsSection";

export const metadata: Metadata = {
  title: "VPS Hosting — High-Performance Cloud Servers | Nupat Cloud",
  description:
    "More power. More control. Built to scale. Deploy fast, reliable VPS hosting with AMD EPYC™ processors, 1 Gbps network ports, full root access, and ready-to-deploy OS templates.",
  openGraph: {
    title: "VPS Hosting — High-Performance Cloud Servers | Nupat Cloud",
    description:
      "More power. More control. Built to scale. Get powerful virtual server infrastructure with dedicated resources and instant scaling.",
    url: "https://nupatcloud.com/vps",
  },
};

export default function VpsHostingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* 1. Hero Section */}
      <VpsHeroSection />

      {/* 2. Fast, Secure, Reliable 3-card Features */}
      <VpsFeaturesSection />

      {/* 3. VPS Hosting for Every Use Case (Yellow Section with interactive tabs) */}
      <VpsUseCasesSection />

      {/* 4. Full Root Access & Total Control */}
      <VpsRootAccessSection />

      {/* 5. Ready-to-Deploy OS Templates */}
      <VpsOsTemplatesSection />

      {/* 6. Deep Purple Testimonial Section with Carousel */}
      <VpsTestimonialSection />

      {/* 7. Unbeatable Value 3-tier Pricing Section */}
      <VpsPricingSection />

      {/* 8. Proof Stats Row */}
      <VpsStatsSection />
    </div>
  );
}
