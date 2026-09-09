"use client";
import dynamic from "next/dynamic";

// Import WorldMap dynamically to avoid SSR mismatches with SVG generation
const WorldMap = dynamic(
  () => import("@/components/ui/world-map").then((m) => m.WorldMap),
  { ssr: false }
);

const networkDots = [
  {
    start: { lat: 6.5244, lng: 3.3792, label: "Lagos" }, // Lagos, Nigeria
    end: { lat: 51.5074, lng: -0.1278, label: "London" }, // London, UK
  },
  {
    start: { lat: 6.5244, lng: 3.3792, label: "Lagos" },
    end: { lat: -1.2921, lng: 36.8219, label: "Nairobi" }, // Nairobi, Kenya
  },
  {
    start: { lat: -26.2041, lng: 28.0473, label: "Johannesburg" }, // Johannesburg, SA
    end: { lat: -1.2921, lng: 36.8219, label: "Nairobi" },
  },
  {
    start: { lat: -26.2041, lng: 28.0473, label: "Johannesburg" },
    end: { lat: 52.3676, lng: 4.9041, label: "Amsterdam" }, // Amsterdam, NL
  },
  {
    start: { lat: -1.2921, lng: 36.8219, label: "Nairobi" },
    end: { lat: 50.1109, lng: 8.6821, label: "Frankfurt" }, // Frankfurt, Germany
  },
  {
    start: { lat: 6.5244, lng: 3.3792, label: "Lagos" },
    end: { lat: -26.2041, lng: 28.0473, label: "Johannesburg" },
  }
];

export default function NetworkSection() {
  return (
    <section id="network" className="section-pad bg-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="type-caption text-[#1787D4] mb-2.5 block">
            Edge Backbone
          </span>
          <h2 className="type-h2 text-[#031033] mb-3">
            Connecting Africa to the <span className="text-[#1787D4]">Global Cloud</span>
          </h2>
          <p className="type-lead max-w-2xl mx-auto">
            With servers stationed across major African tech capitals, we bridge your business directly into global internet exchanges via optimized fiber routing paths.
          </p>
        </div>

        {/* World Map Container — Apple Rounded Surface */}
        <div className="w-full rounded-2xl border border-[#e2eaff] bg-[#f8faff] p-3 sm:p-6 relative shadow-xs overflow-hidden">
          <div className="w-full relative">
            <WorldMap dots={networkDots} lineColor="#1787D4" />
          </div>
        </div>

        {/* Network Metrics Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center">
          <div className="p-4 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
            <p className="text-2xl sm:text-[26px] font-semibold text-[#031033]">12ms</p>
            <p className="text-[11px] font-medium text-[#5a6a85] uppercase tracking-wider mt-1">Lagos to Accra</p>
          </div>
          <div className="p-4 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
            <p className="text-2xl sm:text-[26px] font-semibold text-[#031033]">34ms</p>
            <p className="text-[11px] font-medium text-[#5a6a85] uppercase tracking-wider mt-1">Nairobi to Jo&apos;burg</p>
          </div>
          <div className="p-4 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
            <p className="text-2xl sm:text-[26px] font-semibold text-[#031033]">10 Gbps</p>
            <p className="text-[11px] font-medium text-[#5a6a85] uppercase tracking-wider mt-1">Port Capacity</p>
          </div>
          <div className="p-4 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
            <p className="text-2xl sm:text-[26px] font-semibold text-[#031033]">Anycast</p>
            <p className="text-[11px] font-medium text-[#5a6a85] uppercase tracking-wider mt-1">DNS Routing</p>
          </div>
        </div>

      </div>
    </section>
  );
}
