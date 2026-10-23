"use client";

import { motion, useReducedMotion } from "motion/react";

const stats = [
  {
    value: "99.99%",
    label: "Uptime SLA Guarantee",
  },
  {
    value: "8+",
    label: "Global Data Center Locations",
  },
  {
    value: "500K+",
    label: "Virtual Servers Deployed",
  },
  {
    value: "24/7",
    label: "Expert Engineer Support",
  },
];

export default function VpsStatsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-16 sm:py-20 bg-[#F2F5FC]/40 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.35,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center justify-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1787D4] tracking-tight leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-[13px] text-[#5a6a85] font-medium max-w-[150px] sm:max-w-none">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
