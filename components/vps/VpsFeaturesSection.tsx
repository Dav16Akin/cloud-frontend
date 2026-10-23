"use client";

import { Cpu, Network, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const features = [
  {
    icon: Cpu,
    title: "AMD EPYC™ Processors",
    description:
      "Next-gen hardware unites density and industry-leading performance. Perfect for processing high-scale database queries and heavy workloads.",
    iconBg: "bg-[#E8F4FC]",
    iconColor: "text-[#1787D4]",
    borderColor: "hover:border-[#1787D4]/30",
  },
  {
    icon: Network,
    title: "1 Gbps Network Port",
    description:
      "Redundantly high-speed backlink architecture. Zero throttling, maximum bandwidth peering ensuring uptime across West Africa and beyond.",
    iconBg: "bg-[#F2F5FC]",
    iconColor: "text-[#1787D4]",
    borderColor: "hover:border-[#1787D4]/30",
  },
  {
    icon: Terminal,
    title: "Developer VPS API",
    description:
      "Manage your infrastructure programmatically. Reboot, rebuild, and scale automatically with our comprehensive REST API and SDKs.",
    iconBg: "bg-[#ECFDF5]",
    iconColor: "text-[#059669]",
    borderColor: "hover:border-[#059669]/30",
  },
];

export default function VpsFeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="type-h2 text-[#031033] mb-4">
            Secure, Fast, Reliable VPS Hosting
          </h2>
          <p className="type-lead text-[#5a6a85] leading-relaxed">
            Designed from the ground up for extreme speeds, modular developer controls, and
            automated stability.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`bg-white rounded-2xl p-7 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${feature.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-start`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-11 h-11 rounded-xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-6 shrink-0`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Title */}
                <h3 className="type-h3 text-[#031033] mb-2.5">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="type-body-sm text-[#5a6a85] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
