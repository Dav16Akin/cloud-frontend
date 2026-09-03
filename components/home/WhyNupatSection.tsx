"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Server,
  Sparkles,
  Cpu,
  Mail,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

const products = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Domains",
    badge: "Instant DNS",
    description:
      "Register and manage your digital identity across local African and international extensions.",
    href: "/domains",
    glowColor: "rgba(23, 135, 212, 0.15)",
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: "Hosting",
    badge: "Ultra Fast",
    description:
      "Reliable, lightning-fast web infrastructure configured for local traffic speeds.",
    href: "/hosting",
    glowColor: "rgba(23, 135, 212, 0.15)",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Website Builder",
    badge: "AI Powered",
    description:
      "Create a stunning, fully-responsive professional website with simple AI prompts.",
    href: "/hosting",
    glowColor: "rgba(255, 199, 93, 0.25)",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "Cloud",
    badge: "Low Latency",
    description:
      "Deploy applications globally or closer to home with low-latency African nodes.",
    href: "/hosting",
    glowColor: "rgba(23, 135, 212, 0.15)",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email",
    badge: "Custom Domain",
    description:
      "Build immediate trust with professional domain-branded communication tools.",
    href: "/hosting#email",
    glowColor: "rgba(23, 135, 212, 0.15)",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: "Business Tools",
    badge: "All-in-One",
    description:
      "Manage operational workflows, customers, and billing with unified tooling.",
    href: "/dashboard",
    glowColor: "rgba(255, 199, 93, 0.25)",
  },
];

export default function WhyNupatSection() {
  return (
    <section
      id="products-ecosystem"
      className="py-14 sm:py-16 bg-[#f8faff] relative overflow-hidden"
    >
      {/* Background ambient radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-175 h-112.5 bg-[#1787D4]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFC75D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Background Curvelines */}
      <div className="absolute top-10 -right-24 pointer-events-none select-none z-0 hidden md:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[480px] lg:w-[640px] h-auto brightness-0 opacity-[0.04] rotate-[26deg]"
          aria-hidden
        />
      </div>
      <div className="absolute bottom-6 -left-28 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[440px] lg:w-[580px] h-auto brightness-0 opacity-[0.04] -rotate-[32deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-12 flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] tracking-tight mb-4 max-w-3xl">
            <span className="relative inline-block pb-1">
              Your digital business, connected
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="text-[#5a6a85] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop piecing together different platforms for your website,
            infrastructure, communication, and business operations.
          </p>
        </motion.div>

        {/* 6 Products Grid with Staggered Motion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {products.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.08,
              }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Link
                href={item.href}
                className="group relative flex flex-col justify-between h-full rounded-2xl border border-[#E5E7EB] bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div>
                  {/* Header: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1787D4] border border-blue-100 group-hover:bg-[#1787D4] group-hover:text-white group-hover:border-[#1787D4] transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 border border-slate-200/80 group-hover:border-blue-200 group-hover:text-[#1787D4] transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-[#0B1527] tracking-tight group-hover:text-[#1787D4] transition-colors mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5a6a85] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom arrow link */}
                <div className="relative z-10 mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#1787D4] group-hover:text-[#0052FF] transition-all">
                  <span>Explore {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <Link
            href="/hosting"
            id="explore-all-products-btn"
            className="inline-flex items-center justify-center gap-2 bg-[#1787D4] hover:bg-[#1370B5] text-white font-bold text-sm sm:text-base py-3.5 px-8 rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(23,135,212,0.35)] hover:shadow-[0_6px_20px_rgba(23,135,212,0.45)] hover:-translate-y-0.5 cursor-pointer"
          >
            Explore All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
