"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Package,
  TrendingUp,
  Gamepad2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface UseCase {
  id: string;
  title: string;
  icon: typeof Globe;
  description: string;
}

const useCases: UseCase[] = [
  {
    id: "web-apps",
    title: "Web Applications",
    icon: Globe,
    description:
      "Fast and reliable container-ready high-grade computational assets everywhere you build anything. Perfect for Next.js, Laravel, Django, and production Node APIs.",
  },
  {
    id: "open-source",
    title: "Open Source Projects",
    icon: Package,
    description:
      "Full kernel freedom to build, deploy CI/CD runners, and host open-source software stacks with zero hypervisor lock-in or artificial constraints.",
  },
  {
    id: "high-traffic",
    title: "High-Traffic Websites",
    icon: TrendingUp,
    description:
      "Handle viral traffic surges effortlessly with high-bandwidth 1 Gbps ports, blazing NVMe SSD storage, and burstable computational power.",
  },
  {
    id: "game-servers",
    title: "Game Servers",
    icon: Gamepad2,
    description:
      "Ultra-low latency connectivity, dedicated CPU threads, and raw UDP networking tailored for Minecraft, CS:GO, and real-time multiplayer instances.",
  },
];

export default function VpsUseCasesSection() {
  const [activeId, setActiveId] = useState<string>("web-apps");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="use-cases"
      className="py-20 sm:py-24 lg:py-28 bg-[#fac220] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="type-h2 text-[#031033] mb-4">
            VPS Hosting for Every Use Case
          </h2>
          <p className="type-lead text-[#031033]/85 leading-relaxed font-normal">
            Fast and scalable container-ready high-grade computational assets
            everywhere you build anything.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Accordion / Interactive Tabs */}
          <div className="lg:col-span-6 space-y-3.5">
            {useCases.map((item) => {
              const isActive = activeId === item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "bg-white shadow-lg shadow-black/5 border border-white"
                      : "bg-white/80 hover:bg-white border border-white/60 cursor-pointer"
                  }`}
                  onClick={() => setActiveId(item.id)}
                >
                  {/* Collapsed Header / Toggle */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-[#1787D4] text-white"
                            : "bg-[#031033]/5 text-[#031033]"
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="font-semibold text-[15px] sm:text-base text-[#031033]">
                        {item.title}
                      </span>
                    </div>

                    <div className="text-[#031033]/50">
                      {isActive ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={
                          shouldReduceMotion ? false : { height: 0, opacity: 0 }
                        }
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100">
                          <p className="type-body-sm text-[#5a6a85] leading-relaxed my-3.5">
                            {item.description}
                          </p>

                          <Link
                            href="#pricing"
                            className="btn-primary !rounded-full px-5 py-2 text-[13px] font-semibold"
                          >
                            <span>Get Started</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column: Tall & Larger Smartphone Visual */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[540px] lg:max-w-[580px] flex items-center justify-center">
              <Image
                src="/vps-1.jpg"
                alt="Scalable VPS speed - Nupat Cloud"
                width={580}
                height={700}
                priority
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
