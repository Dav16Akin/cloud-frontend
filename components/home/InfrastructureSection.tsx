"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  features: string[];
  isFeatured?: boolean;
  href: string;
}

const serviceCards: ServiceCard[] = [
  {
    id: "web-hosting",
    title: "Web Hosting",
    subtitle: "Simple, highly-reliable web hosting.",
    features: [
      "Unmetered Bandwidth",
      "Free .africa Domain",
      "1-Click Installer",
      "SSL Security Certification",
    ],
    href: "/hosting",
  },
  {
    id: "vps",
    title: "VPS",
    subtitle: "More control with dedicated resources.",
    features: [
      "Dedicated CPU/RAM",
      "Full Root SSH Access",
      "SSD Cloud Storage",
      "Automated Daily Backups",
    ],
    isFeatured: true,
    href: "/hosting#vps",
  },
  {
    id: "cloud-hosting",
    title: "Cloud Hosting",
    subtitle: "Flexible infrastructure built to scale.",
    features: [
      "Isolated Environments",
      "Dynamic Scale Ready",
      "Premium Support Priority",
      "Global Anycast DNS",
    ],
    href: "/hosting#cloud",
  },
  {
    id: "managed-wordpress",
    title: "Managed WordPress",
    subtitle: "A managed, ultra-tuned environment.",
    features: [
      "Optimized Speed Cache",
      "Auto-Updates Core/Plugins",
      "Staging Environments",
      "Threat Protection",
    ],
    href: "/hosting#wordpress",
  },
];

export default function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="py-14 sm:py-18 bg-[#fafcff] relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.09, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-120 h-120 bg-blue-500 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading & Description with Motion */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 flex flex-col justify-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1527] leading-[1.18] tracking-tight mb-5">
              Infrastructure <br className="hidden lg:inline" />
              that grows with <br className="hidden lg:inline" />
              you
            </h2>
            <p className="text-[#5a6a85] text-sm sm:text-base leading-relaxed max-w-md">
              Whether you&apos;re launching a website or deploying a growing
              application, our platform gives you reliable infrastructure
              designed to scale with your needs.
            </p>
          </motion.div>

          {/* Middle Column: Server Rack Cloud Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-4 flex items-center justify-center"
          >
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[360px] lg:max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-800/10 bg-[#061129]"
            >
              <Image
                src="/infrastructure.png"
                alt="Cloud server rack infrastructure scaling seamlessly"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </motion.div>
          </motion.div>

          {/* Right Column: 4 Service Cards with Staggered Motion */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4">
            {serviceCards.map((card, index) => {
              if (card.isFeatured) {
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                      delay: index * 0.1,
                    }}
                    whileHover={{ y: -4, scale: 1.01 }}
                  >
                    <Link
                      href={card.href}
                      className="block bg-[#0077C8] text-white rounded-2xl p-5 sm:p-5.5 shadow-md shadow-[#0077C8]/25 hover:bg-[#006bb5] hover:shadow-lg transition-all duration-200"
                    >
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-white">
                          {card.title}
                        </h3>
                        <p className="text-white/85 text-xs sm:text-sm mt-0.5">
                          {card.subtitle}
                        </p>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                        {card.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-center gap-2 text-xs sm:text-[13px] text-white/95"
                          >
                            <Check
                              className="w-4 h-4 text-white shrink-0"
                              strokeWidth={2.5}
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.1,
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <Link
                    href={card.href}
                    className="block bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-5.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-[#0B1527]">
                        {card.title}
                      </h3>
                      <p className="text-[#64748B] text-xs sm:text-sm mt-0.5">
                        {card.subtitle}
                      </p>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                      {card.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-xs sm:text-[13px] text-[#334155]"
                        >
                          <Check
                            className="w-4 h-4 text-[#10B981] shrink-0"
                            strokeWidth={2.5}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
