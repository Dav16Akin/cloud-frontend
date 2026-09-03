"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Rocket, Users, Globe, Sparkles } from "lucide-react";
import { AnimatedBadge } from "@/components/ui/animated-badge";

const perks = [
  {
    icon: Rocket,
    title: "Accelerated Launch",
    desc: "Deploy your company website and store in days, not months.",
  },
  {
    icon: Users,
    title: "Dedicated Local Mentorship",
    desc: "1-on-1 technical advisory tailored for African growth markets.",
  },
  {
    icon: Globe,
    title: "Global Cloud Scale",
    desc: "High-performance infrastructure ready to support millions of queries.",
  },
];

export default function StartupProgramSection() {
  return (
    <section id="startup" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-linear-to-br from-[#031033] via-[#061845] to-[#031033] p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl overflow-hidden relative">
          {/* Radial ambient glow */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Curvelines on dark gradient */}
          <div className="absolute -top-10 -right-20 pointer-events-none select-none z-0 hidden sm:block">
            <Image
              src="/curveline.png"
              alt=""
              width={500}
              height={200}
              className="w-112.5 lg:w-150 h-auto opacity-15 rotate-[-18deg]"
              aria-hidden
            />
          </div>
          <div className="absolute -bottom-16 -left-20 pointer-events-none select-none z-0">
            <Image
              src="/curveline.png"
              alt=""
              width={500}
              height={200}
              className="w-100 lg:w-130 h-auto opacity-12 rotate-25"
              aria-hidden
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            {/* Left */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                <span className="relative inline-block pb-1">
                  Empowering African Startups to Scale Globally
                </span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
                Through the Nupat Startup Program, qualifying high-potential
                startups access free cloud credits, high-speed hosting
                infrastructure, and specialized technical guidance.
              </p>

              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                We believe ambitious African founders deserve world-class
                digital infrastructure without prohibitive entry costs.
              </p>

              <Link
                href="https://nupat.africa/startup-program"
                id="startup-apply-cta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1787D4] hover:bg-blue-600 text-white font-semibold text-base py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-[#1787D4]/25 hover:-translate-y-0.5 cursor-pointer"
              >
                Apply for Startup Program
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right */}
            <div className="grid grid-cols-1 gap-4">
              {perks.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[#1787D4] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base mb-1">
                      {title}
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
