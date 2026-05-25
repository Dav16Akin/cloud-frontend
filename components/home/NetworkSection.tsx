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
    <section id="network" className="section-pad section-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#e8900a] mb-3">
            Edge Backbone
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-5">
            Connecting Africa to the <span className="text-[#e8900a]">Global Cloud</span>
          </h2>
          <p className="text-[#5a6a85] text-lg max-w-2xl mx-auto leading-relaxed">
            With servers stationed across major African tech capitals, we bridge your business directly into global internet exchanges via optimized fiber routing paths.
          </p>
        </div>

        {/* World Map Container */}
        <div className="w-full border border-[#e2eaff] bg-[#f6f9ff] p-4 sm:p-8 relative">
          {/* Subtle frame accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#e8900a]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#031033]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#031033]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#e8900a]" />

          <div className="w-full relative">
            <WorldMap dots={networkDots} lineColor="#e8900a" />
          </div>
        </div>

        {/* Network Metrics Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
          <div className="p-4 border-r border-[#e2eaff] last:border-0">
            <p className="text-3xl font-extrabold text-[#031033]">12ms</p>
            <p className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wider mt-1">Lagos to Accra Latency</p>
          </div>
          <div className="p-4 border-r border-[#e2eaff] last:border-0">
            <p className="text-3xl font-extrabold text-[#031033]">34ms</p>
            <p className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wider mt-1">Nairobi to Jo'burg Latency</p>
          </div>
          <div className="p-4 border-r border-[#e2eaff] last:border-0">
            <p className="text-3xl font-extrabold text-[#031033]">10 Gbps</p>
            <p className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wider mt-1">Port Capacity</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-extrabold text-[#031033]">Anycast</p>
            <p className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wider mt-1">DNS Routing</p>
          </div>
        </div>

      </div>
    </section>
  );
}
