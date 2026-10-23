"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// SVG Logos for OS & Runtimes
function UbuntuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#E95420" />
      <circle cx="12" cy="6.2" r="1.3" fill="#ffffff" />
      <circle cx="6.8" cy="15" r="1.3" fill="#ffffff" />
      <circle cx="17.2" cy="15" r="1.3" fill="#ffffff" />
      <path
        d="M12 8.5a3.5 3.5 0 0 0-3 1.7m6.1 0a3.5 3.5 0 0 0-1.8-1.5m-3.9 6.6a3.5 3.5 0 0 0 5.2 0"
        stroke="#ffffff"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function CentosIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#262577" />
      <path d="M12 4v16M4 12h16" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M7 7l10 10M17 7L7 17" stroke="#FFA500" strokeWidth="1.5" />
    </svg>
  );
}

function DebianIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#D70A53" />
      <path
        d="M13.5 8c-2.5 0-4.5 1.8-4.5 4.1 0 2.2 1.6 3.6 3.4 3.6 1.4 0 2.6-.9 2.6-2.1 0-1.2-.9-1.9-2-1.9-.9 0-1.5.5-1.5 1.2"
        stroke="#ffffff"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WordpressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#21759B" />
      <path
        d="M6.5 12c0 2.4 1.5 4.5 3.6 5.4L7 10.1c-.3.6-.5 1.2-.5 1.9zm8.9 4.9c.7-.6 1.2-1.5 1.2-2.7 0-1.3-.7-2.2-1.3-3.1-.6-.9-1.1-1.6-1.1-2.4 0-.9.7-1.8 1.7-1.8.1 0 .2 0 .3.1-1.2-1.1-2.7-1.7-4.4-1.7-2.4 0-4.5 1.2-5.7 3.1l4 11.5 1.4-4.2-1.2-3.8c.4 0 .8-.1.8-.1.4 0 .4-.6 0-.6 0 0-1.2.1-1.9.1-.7 0-1.9-.1-1.9-.1-.4 0-.4.6 0 .6 0 0 .5.1.8.1l2.5 7.4c.5-.1 1-.3 1.5-.6l-2-6 1.9-5.7c.4 0 .8-.1.8-.1.4 0 .4-.6 0-.6 0 0-1.2.1-1.9.1-.4 0-1-.1-1.5-.1l3.5 9.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

function DockerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#1D63ED" />
      <path
        d="M7 11h1.5v1.5H7zm2 0h1.5v1.5H9zm2 0h1.5v1.5H11zm-4-2h1.5v1.5H7zm2 0h1.5v1.5H9zm2 0h1.5v1.5H11zm2 2h1.5v1.5H13zm2 0h1.5v1.5H15zm-4-4h1.5v1.5H11z"
        fill="#ffffff"
      />
      <path
        d="M18.5 11.5c-.3-.2-1.2-.3-1.8.1-.1-.7-.6-1.3-1.3-1.6l-.4.3c.3.5.3 1.2.1 1.7H5c-.1.7.1 1.9 1 2.8 1 1 2.5 1.2 5.5 1.2 3.6 0 5.4-1.2 6.5-3.5.3 0 .7-.3.8-.6l-.3-.4z"
        fill="#ffffff"
      />
    </svg>
  );
}

function NodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#539E43" />
      <path
        d="M12 6.5l5 2.9v5.8l-5 2.9-5-2.9V9.4l5-2.9z"
        stroke="#ffffff"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M12 9.5v5M9.5 11l5 2.8M14.5 11l-5 2.8"
        stroke="#ffffff"
        strokeWidth="1"
      />
    </svg>
  );
}

const templates = [
  {
    name: "Ubuntu Server",
    version: "22.04 LTS / 24.04 LTS",
    icon: UbuntuIcon,
    tag: "Popular",
  },
  {
    name: "CentOS Linux",
    version: "Stream 9 / AlmaLinux 9",
    icon: CentosIcon,
    tag: "Enterprise",
  },
  {
    name: "Debian GNU",
    version: "Debian 12 Bookworm",
    icon: DebianIcon,
    tag: "Stable",
  },
  {
    name: "WordPress CMS",
    version: "LEMP + FastCGI Cache",
    icon: WordpressIcon,
    tag: "1-Click",
  },
  {
    name: "Docker Stack",
    version: "Engine + Compose v2",
    icon: DockerIcon,
    tag: "DevOps",
  },
  {
    name: "NodeJS Engine",
    version: "v20 / v22 LTS + PM2",
    icon: NodeIcon,
    tag: "Node Runtime",
  },
];

export default function VpsOsTemplatesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-[#f8faff] border-y border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="type-h2 text-[#031033] mb-4">
            Ready-to-Deploy OS Templates
          </h2>
          <p className="type-lead text-[#5a6a85] leading-relaxed">
            Skip standard OS setups. Select a foundation image or Docker container build and
            spin up your application instantly.
          </p>
        </div>

        {/* Templates Grid (2 rows of 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            return (
              <motion.div
                key={tpl.name}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/30 hover:shadow-md transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#031033] tracking-tight">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-[#5a6a85] mt-0.5">
                      {tpl.version}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#1787D4] bg-[#E8F4FC] px-2.5 py-0.5 rounded-full shrink-0">
                  {tpl.tag}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Explore, Deploy, and Build Faster Banner */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-10 sm:mt-12 rounded-2xl bg-[#E8F4FC]/60 border border-[#d0e7f9] p-6 sm:p-8 text-center max-w-4xl mx-auto shadow-sm"
        >
          <h3 className="text-lg sm:text-xl font-bold text-[#031033] tracking-tight mb-2">
            Explore, Deploy, and Build Faster
          </h3>
          <p className="type-body-sm text-[#415170] leading-relaxed max-w-xl mx-auto mb-5">
            Access over 120 pre-built application runtimes, database structures, and development
            frameworks. Get everything running live on the web with a simple click.
          </p>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1787D4] hover:text-[#1370B5] transition-colors"
          >
            <span>View all supported images and templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
