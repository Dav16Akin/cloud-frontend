"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const testimonials = [
  {
    quote:
      "The control panel is easy to find my way around and setting up the terminal took minutes. My servers run without trouble, and everything I need is a click away.",
    author: "Chukwuka Obi",
    role: "Lead Infrastructure Architect at PaySync",
  },
  {
    quote:
      "Moving our workloads to Nupat VPS cut our latency in half across West Africa. The dedicated AMD EPYC cores give us consistent speed.",
    author: "Fatima Al-Hassan",
    role: "Head of Engineering at DevScale",
  },
  {
    quote:
      "Full root access, snapshot backups and no throttling on our 1 Gbps port. Nupat gave us the dependable cloud foundation we needed.",
    author: "Tunde Adebayo",
    role: "Founder and CTO at Apex Cloud Labs",
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

  const arrowClass =
    "w-9 h-9 rounded-full bg-[#1787D4] hover:bg-[#1370B5] text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

  return (
    <section className="py-16 sm:py-24 bg-[#031033] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div className="lg:col-span-6 flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[360px] lg:max-w-[400px] flex items-center justify-center">
              <Image
                src="/vps-3.png"
                alt="Developer celebrating a successful deployment"
                width={400}
                height={548}
                sizes="(min-width: 1024px) 400px, 360px"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center lg:justify-start order-1 lg:order-2">
            <figure className="bg-white text-[#031033] rounded-xl p-8 sm:p-10 relative w-full max-w-[480px]">
              <Quote className="w-6 h-6 text-[#1787D4] mb-5" aria-hidden="true" />

              <div className="min-h-[120px] flex flex-col justify-between" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <blockquote className="text-lg text-[#031033] leading-relaxed mb-5">
                      &ldquo;{current.quote}&rdquo;
                    </blockquote>

                    <figcaption>
                      <div className="font-semibold text-base text-[#031033]">
                        {current.author}
                      </div>
                      <div className="text-sm text-[#5A6A85] mt-0.5">{current.role}</div>
                    </figcaption>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2.5 mt-7 pt-5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className={arrowClass}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className={arrowClass}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#5A6A85] ml-2 font-medium tabular-nums">
                  {currentIndex + 1} of {testimonials.length}
                </span>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
