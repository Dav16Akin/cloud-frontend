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
  title: "VPS Hosting with Dedicated Resources | Nupat Cloud",
  description:
    "VPS hosting with AMD EPYC™ processors, 1 Gbps network ports, full root access and ready-to-deploy OS templates. Priced in naira.",
  openGraph: {
    title: "VPS Hosting with Dedicated Resources | Nupat Cloud",
    description:
      "Virtual servers with dedicated vCPU and RAM, full root access and room to scale.",
    url: "https://nupatcloud.com/vps",
  },
};

export default function VpsHostingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      <VpsHeroSection />
      <VpsFeaturesSection />
      <VpsUseCasesSection />
      <VpsRootAccessSection />
      <VpsOsTemplatesSection />
      <VpsTestimonialSection />
      <VpsPricingSection />
      <VpsStatsSection />
    </div>
  );
}
