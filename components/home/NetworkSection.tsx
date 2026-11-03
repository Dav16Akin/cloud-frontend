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
  },
];

// These figures came with the original section and have not been verified.
const metrics = [
  { value: "12ms", label: "Lagos to Accra" },
  { value: "34ms", label: "Nairobi to Jo’burg" },
  { value: "10 Gbps", label: "Port capacity" },
  { value: "Anycast", label: "DNS routing" },
];

export default function NetworkSection() {
  return (
    <section id="network" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="type-h2 text-[#031033] mb-3">
            Connecting Africa to the global cloud
          </h2>
          <p className="type-lead text-[#5A6A85] max-w-2xl mx-auto">
            Our servers sit in major African tech hubs and connect your
            business to international internet exchanges.
          </p>
        </div>

        <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F2F5FC] p-3 sm:p-6 relative overflow-hidden">
          <WorldMap dots={networkDots} lineColor="#1787D4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center">
          {metrics.map((m) => (
            <div key={m.label} className="p-5 rounded-xl bg-[#F2F5FC]">
              <p className="text-2xl font-semibold text-[#031033] tabular-nums">{m.value}</p>
              <p className="text-sm text-[#5A6A85] mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
