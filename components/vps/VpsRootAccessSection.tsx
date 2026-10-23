"use client";

import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const rootFeatures = [
  {
    title: "SSH & SFTP Access",
    description:
      "Gain root privileges and direct access to programs, verify and prepare operations instantly.",
  },
  {
    title: "Custom OS Template Installs",
    description:
      "Instant deploy vanilla Debian, upstream specialized Almalinux, Nix environments, or standard Ubuntu Server builds.",
  },
  {
    title: "No-Overcommit Guarantee",
    description:
      "You get pure, physical assets — NUPAT ensures your RAM and vCPUs allocation is exclusively yours.",
  },
];

export default function VpsRootAccessSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Visual Card with vps-2.png + Floating Badge */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[360px] lg:max-w-[380px] rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white p-3 overflow-visible">
              <div className="relative rounded-2xl overflow-hidden bg-slate-50">
                <Image
                  src="/vps-2.png"
                  alt="Developer enjoying seamless VPS performance - Nupat Cloud"
                  width={380}
                  height={380}
                  className="w-full h-auto object-cover select-none"
                />
              </div>

              {/* Floating Performance Pill Badge */}
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="absolute -bottom-4 -right-3 sm:-bottom-4 sm:-right-4 bg-[#1787D4] text-white px-3.5 py-2.5 rounded-2xl shadow-lg shadow-[#1787D4]/25 border-2 border-white flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white tracking-wide leading-tight">
                    99.9% Uptime
                  </div>
                  <div className="text-[10px] text-blue-100 font-medium leading-tight">
                    Less than 20ms ping
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Copy & Checklist */}
          <div className="lg:col-span-7">
            <h2 className="type-h2 text-[#031033] mb-4">
              Full Root Access. Total <br className="hidden sm:inline" />
              Server Control.
            </h2>

            <p className="type-lead text-[#5a6a85] leading-relaxed mb-8 max-w-xl">
              Configure your environment down to the kernel packet. Standard installations
              arrive configured, but we never lock you out of the hypervisor capabilities.
            </p>

            {/* Checklist */}
            <div className="space-y-5">
              {rootFeatures.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#E8F4FC] text-[#1787D4] flex items-center justify-center shrink-0 mt-0.5 border border-[#d0e7f9]">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="type-h4 text-[#031033] mb-1">
                      {item.title}
                    </h3>
                    <p className="type-body-sm text-[#5a6a85] leading-relaxed max-w-lg">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
