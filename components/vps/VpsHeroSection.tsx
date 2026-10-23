"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function VpsHeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 text-left"
          >
            {/* Display Headline — Apple SF Pro unified type-display */}
            <h1 className="type-display text-[#031033] mb-5">
              More power. More <br className="hidden sm:inline" />
              control. Built to scale.
            </h1>

            {/* Subtitle — Apple SF Pro unified type-lead */}
            <p className="type-lead text-[#5a6a85] leading-relaxed mb-8 max-w-lg">
              Get powerful virtual server infrastructure with dedicated resources
              and the flexibility to configure your environment for websites,
              applications, and demanding workloads.
            </p>

            {/* CTA Buttons — Standard Apple pill buttons with brand blue #1787D4 */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="#pricing"
                id="hero-choose-plan-cta"
                className="btn-primary !rounded-full px-7 py-3 text-[14px] sm:text-[15px] font-semibold"
              >
                <span>Choose a Plan</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="#use-cases"
                className="btn-outline !rounded-full px-7 py-3 text-[14px] sm:text-[15px] font-semibold"
              >
                Explore Use Cases
              </Link>
            </div>
          </motion.div>

          {/* Right Image Visual */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
              <Image
                src="/vps-hero.png"
                alt="Scalable VPS Hosting - Nupat Cloud"
                width={460}
                height={610}
                priority
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
