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
    title: "Web applications",
    icon: Globe,
    description:
      "Run production Next.js, Laravel, Django and Node APIs, in containers or straight on the server.",
  },
  {
    id: "open-source",
    title: "Open source projects",
    icon: Package,
    description:
      "Host open source stacks and CI/CD runners with full control of the kernel and no artificial limits.",
  },
  {
    id: "high-traffic",
    title: "High-traffic websites",
    icon: TrendingUp,
    description:
      "Absorb traffic spikes with a 1 Gbps port, NVMe SSD storage and CPU that can burst when you need it.",
  },
  {
    id: "game-servers",
    title: "Game servers",
    icon: Gamepad2,
    description:
      "Low-latency connectivity, dedicated CPU threads and UDP networking for Minecraft, CS:GO and other real-time multiplayer games.",
  },
];

export default function VpsUseCasesSection() {
  const [activeId, setActiveId] = useState<string>("web-apps");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="use-cases" className="py-16 sm:py-24 bg-[#FFC75D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-4">
            What people run on a Nupat VPS
          </h2>
          <p className="text-lg text-[#031033]/80 leading-relaxed">
            From a single web app to a game server, pick the workload and choose a plan that fits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div className="lg:col-span-6 space-y-3">
            {useCases.map((item) => {
              const isActive = activeId === item.id;
              const Icon = item.icon;
              const panelId = `use-case-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl overflow-hidden transition-colors ${
                    isActive ? "bg-white" : "bg-white/80 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-inset"
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-[#1787D4]" : "text-[#031033]"}`}
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-base text-[#031033]">{item.title}</span>
                    </span>
                    <span className="text-[#031033]/50">
                      {isActive ? (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={panelId}
                        initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-[#E2E8F0]">
                          <p className="text-sm text-[#5A6A85] leading-relaxed my-3.5">
                            {item.description}
                          </p>

                          <Link
                            href="#pricing"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#1787D4] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                          >
                            See VPS plans
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[540px] lg:max-w-[580px] flex items-center justify-center">
              <Image
                src="/vps-1.jpg"
                alt="Phone showing a fast-loading site hosted on Nupat Cloud VPS"
                width={580}
                height={700}
                sizes="(min-width: 1024px) 580px, (min-width: 640px) 540px, 100vw"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
