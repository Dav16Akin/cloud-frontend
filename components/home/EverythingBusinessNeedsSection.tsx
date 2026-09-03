"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  Settings,
  BarChart3,
  Briefcase,
  ShoppingBag,
  Monitor,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

interface BusinessTool {
  id: string;
  name: string;
  desc: string;
  status: "Active" | "Coming Soon";
  icon: React.ComponentType<{ className?: string }>;
}

const businessTools: BusinessTool[] = [
  {
    id: "crm",
    name: "CRM",
    desc: "Manage customer relationships.",
    status: "Active",
    icon: Users,
  },
  {
    id: "erp",
    name: "ERP",
    desc: "Manage operational logistics.",
    status: "Coming Soon",
    icon: Settings,
  },
  {
    id: "accounting",
    name: "Accounting",
    desc: "Keep track of finances.",
    status: "Active",
    icon: BarChart3,
  },
  {
    id: "hr",
    name: "HR",
    desc: "Administer staff & payroll.",
    status: "Coming Soon",
    icon: Briefcase,
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    desc: "Launch online storefronts.",
    status: "Active",
    icon: ShoppingBag,
  },
  {
    id: "pos",
    name: "POS",
    desc: "In-store digital registry.",
    status: "Coming Soon",
    icon: Monitor,
  },
  {
    id: "payments",
    name: "Payments",
    desc: "Accept mobile money/cards.",
    status: "Active",
    icon: CreditCard,
  },
  {
    id: "ai-agents",
    name: "AI Agents",
    desc: "Automate task operations.",
    status: "Coming Soon",
    icon: Sparkles,
  },
];

export default function EverythingBusinessNeedsSection() {
  return (
    <section
      id="business-suite"
      className="py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle & 8 Tool Cards with Motion */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1527] leading-[1.18] tracking-tight mb-4">
                Everything your business needs to{" "}
                <br className="hidden sm:inline" />
                operate and grow
              </h2>

              <p className="text-[#5a6a85] text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
                We are expanding beyond infrastructure to bring essential tools
                businesses need to manage customers, teams, finances, commerce,
                and workflows - all within one ecosystem.
              </p>
            </motion.div>

            {/* 8 Cards Grid with Staggered Motion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {businessTools.map((tool, idx) => {
                const Icon = tool.icon;
                const isActive = tool.status === "Active";

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                      delay: idx * 0.06,
                    }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-4.5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-default"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive
                              ? "text-[#0058F6] bg-blue-50"
                              : "text-[#64748B] bg-slate-100"
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="font-bold text-[#0B1527] text-sm sm:text-[15px]">
                          {tool.name}
                        </span>
                      </div>

                      <span
                        className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#0058F6] text-white shadow-xs"
                            : "bg-[#E2E8F0] text-[#64748B]"
                        }`}
                      >
                        {tool.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] pl-10.5 leading-snug">
                      {tool.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hero Image with Blue backdrop & signature curved notches */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15,
            }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-120 lg:max-w-none aspect-4/5 sm:aspect-3/4 lg:aspect-4/5 bg-[#0058F6] rounded-3xl overflow-hidden shadow-2xl flex items-end justify-center">
              {/* White Semicircular Notch cutouts from Figma design */}
              <div
                className="absolute top-0 -left-6 w-14 h-14 bg-white rounded-full z-20 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 -left-6 w-14 h-14 bg-white rounded-full z-20 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />

              {/* Main Image */}
              <div className="relative w-full h-full">
                <Image
                  src="/everything-y-b-n.png"
                  alt="Young professionals collaborating seamlessly on Nupat business suite"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 550px"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
