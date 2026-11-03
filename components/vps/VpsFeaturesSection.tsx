import { Cpu, Network, Terminal } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AMD EPYC™ processors",
    description:
      "High core density for database queries, build jobs and other heavy workloads.",
  },
  {
    icon: Network,
    title: "1 Gbps network port",
    description:
      "Redundant uplinks with no throttling, so traffic to users in West Africa and beyond stays steady.",
  },
  {
    icon: Terminal,
    title: "VPS API",
    description:
      "Reboot, rebuild and resize servers from your own scripts with our REST API and SDKs.",
  },
];

export default function VpsFeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-4">
            Fast, secure VPS hosting
          </h2>
          <p className="text-lg text-[#5A6A85] leading-relaxed">
            Current-generation hardware, a fast network and an API for automating your servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-[#E2E8F0] flex flex-col justify-start"
              >
                <Icon className="w-6 h-6 text-[#1787D4] mb-5" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-[#031033] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#5A6A85] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
