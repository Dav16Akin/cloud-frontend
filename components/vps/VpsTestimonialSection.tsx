"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const testimonials = [
  {
    quote:
      "The interface is incredibly intuitive, and the terminal setup is effortless. My servers run flawlessly, and everything I need is just a click away.",
    author: "Chukwuka Obi",
    role: "Lead Infrastructure Architect at PaySync",
  },
  {
    quote:
      "Transitioning our workloads to Nupat VPS cut our latency in half across West Africa. The dedicated AMD EPYC cores deliver raw, uncompromised speed.",
    author: "Fatima Al-Hassan",
    role: "Head of Engineering at DevScale",
  },
  {
    quote:
      "Full root privileges, instant snapshot backups, and zero throttling on our 1 Gbps port. Nupat provides the dependable cloud foundation we needed.",
    author: "Tunde Adebayo",
    role: "Founder & CTO at Apex Cloud Labs",
  },
];

export default function VpsTestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#1C0B37] via-[#381F61] to-[#5A338E] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          
          {/* Left Column: vps-3.png (Man jumping in yellow tracksuit) */}
          <div className="lg:col-span-6 flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[360px] lg:max-w-[400px] flex items-center justify-center">
              <Image
                src="/vps-3.png"
                alt="Developer celebrating reliable cloud infrastructure - Nupat Cloud"
                width={400}
                height={550}
                className="w-full h-auto object-contain select-none drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Column: Quote Card */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-start order-1 lg:order-2">
            <div className="bg-white text-[#031033] rounded-3xl p-8 sm:p-10 shadow-2xl relative w-full max-w-[480px]">
              
              {/* Quote Badge */}
              <div className="w-10 h-10 rounded-full bg-[#E8F4FC] text-[#1787D4] flex items-center justify-center mb-5">
                <Quote className="w-5 h-5 fill-[#1787D4]/20 text-[#1787D4]" />
              </div>

              {/* Quote Text */}
              <div className="min-h-[120px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-base sm:text-[17px] font-normal text-[#031033] leading-relaxed tracking-tight mb-5">
                      &ldquo;{current.quote}&rdquo;
                    </p>

                    <div>
                      <div className="font-semibold text-base text-[#031033]">
                        {current.author}
                      </div>
                      <div className="text-xs sm:text-sm text-[#5a6a85] mt-0.5">
                        {current.role}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2.5 mt-7 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="w-9 h-9 rounded-full bg-[#1787D4] hover:bg-[#1370B5] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="w-9 h-9 rounded-full bg-[#1787D4] hover:bg-[#1370B5] text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#5a6a85] ml-2 font-medium">
                  {currentIndex + 1} / {testimonials.length}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
