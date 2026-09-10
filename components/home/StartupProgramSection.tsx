"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function StartupProgramSection() {
  const WHATSAPP_NUMBER = "2349076646154";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I would like smart AI guidance on deploying and choosing the right hosting infrastructure with Nupat Cloud."
  )}`;

  return (
    <section
      id="ai-help"
      className="py-10 sm:py-14 bg-white relative overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-[linear-gradient(105deg,#031033_0%,#051D4D_32%,#0E509E_68%,#1787D4_100%)] border border-blue-900/40 shadow-2xl overflow-hidden relative">
          {/* Subtle dark circular accent in bottom-left */}
          <div
            className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-[#020B1D]/50 pointer-events-none"
            aria-hidden="true"
          />

          {/* Luminous brand blue circular disc behind the man on the right */}
          <div
            className="absolute right-[-30px] sm:right-[10px] lg:right-[40px] xl:right-[70px] top-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] lg:w-[480px] xl:w-[510px] h-[340px] sm:h-[440px] lg:h-[480px] xl:h-[510px] rounded-full bg-[#1787D4] pointer-events-none"
            aria-hidden="true"
          />

          {/* Ambient top-right brand blue blur */}
          <div
            className="absolute top-0 right-0 w-80 h-80 bg-[#1787D4]/25 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[460px] lg:min-h-[500px] xl:min-h-[520px] relative z-10">
            {/* Left Column: Heading, Description & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 p-7 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center relative z-20"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-white leading-[1.14] tracking-tight mb-4 sm:mb-5">
                Deploy, launch, and <br className="hidden sm:inline" />
                grow with smart AI <br className="hidden sm:inline" />
                help
              </h2>

              <p className="text-slate-200/90 text-sm sm:text-[15px] lg:text-[15.5px] leading-relaxed max-w-[420px] mb-7 sm:mb-8 font-normal">
                Start a conversation, get instant help, and let our AI guide you
                through choosing the right products, setting up your
                infrastructure, and growing your business.
              </p>

              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="smart-ai-chat-btn"
                  className="inline-flex items-center justify-center bg-[#1787D4] hover:bg-[#1370B5] active:scale-[0.98] text-white font-medium text-[15px] px-7 py-3 rounded-xl shadow-lg shadow-[#1787D4]/35 transition-all duration-200 cursor-pointer"
                >
                  Chat with AI
                </a>
              </div>
            </motion.div>

            {/* Right Column: Chat Widget Card + Person in Armchair */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="lg:col-span-7 relative h-full flex flex-col lg:flex-row items-center justify-center lg:justify-end px-6 sm:px-10 lg:px-0 lg:pr-8 xl:pr-12 pt-4 lg:pt-0"
            >
              {/* White Chat Widget Card */}
              <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(3,16,51,0.35)] border border-slate-100/70 relative z-20 mb-6 lg:mb-0 lg:mr-[-60px] xl:mr-[-70px]">
                {/* Online Badge */}
                <div className="mb-3.5">
                  <span className="inline-block bg-[#1787D4] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wide">
                    Online
                  </span>
                </div>

                {/* AI Greeting Message Bubble */}
                <div className="bg-[#1787D4] text-white text-[14px] sm:text-[15px] font-normal leading-snug p-3.5 sm:p-4 rounded-2xl rounded-tl-xs mb-3.5 shadow-xs">
                  Hello! How can I help you today?
                </div>

                {/* Interactive Action Options */}
                <div className="space-y-2.5">
                  <a
                    href="#domain-search"
                    className="w-full bg-[#031033] hover:bg-[#071D57] active:bg-[#020B24] text-white text-[13px] sm:text-[14px] font-normal px-4 py-3 sm:py-3.5 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer group text-left shadow-xs"
                  >
                    <span>I want to register a domain</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href="#pricing-preview"
                    className="w-full bg-[#031033] hover:bg-[#071D57] active:bg-[#020B24] text-white text-[13px] sm:text-[14px] font-normal px-4 py-3 sm:py-3.5 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer group text-left shadow-xs"
                  >
                    <span>I want to create a website</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <a
                    href="#pricing-preview"
                    className="w-full bg-[#031033] hover:bg-[#071D57] active:bg-[#020B24] text-white text-[13px] sm:text-[14px] font-normal px-4 py-3 sm:py-3.5 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer group text-left shadow-xs"
                  >
                    <span>Help me choose a hosting plan</span>
                    <ChevronRight className="w-4 h-4 text-[#1787D4] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Person Image (Sitting in Armchair with Laptop) */}
              <div className="relative z-10 w-[290px] sm:w-[370px] lg:w-[410px] xl:w-[450px] shrink-0 flex items-end justify-center pointer-events-none select-none lg:self-end">
                <Image
                  src="/deploy.png"
                  alt="Deploy, launch, and grow with smart AI help"
                  width={450}
                  height={520}
                  priority
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Named alias export
export { StartupProgramSection as SmartAiHelpSection };
