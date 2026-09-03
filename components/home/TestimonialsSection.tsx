"use client";

import React from "react";
import Image from "next/image";

/* ── Brand Logos for Trusted By Section ── */
function KoraLogo() {
  return (
    <div className="flex items-center hover:opacity-100 transition-opacity">
      <span className="font-extrabold text-2xl sm:text-[28px] tracking-tight text-[#0B63E5] font-sans select-none">
        kora
      </span>
    </div>
  );
}

function FlutterwaveLogo() {
  return (
    <div className="flex items-center gap-2 hover:opacity-100 transition-opacity">
      {/* Flutterwave colorful ribbon loops */}
      <svg
        viewBox="0 0 36 28"
        className="h-7 w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 5C5 5 1.5 9 1.5 14C1.5 19 5 23 10 23C13.5 23 16.5 21 18 18"
          stroke="#F5A623"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M26 5C31 5 34.5 9 34.5 14C34.5 19 31 23 26 23C22.5 23 19.5 21 18 18"
          stroke="#7ED321"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M11 9C15 9 18 11.5 18 14C18 16.5 15 19 11 19"
          stroke="#FF5A5F"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M25 9C21 9 18 11.5 18 14C18 16.5 21 19 25 19"
          stroke="#00C2CB"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-bold text-lg sm:text-[20px] tracking-tight text-[#1E293B] lowercase select-none">
        flutterwave
      </span>
    </div>
  );
}

function PaystackLogo() {
  return (
    <div className="flex items-center gap-2.5 hover:opacity-100 transition-opacity">
      <div className="flex flex-col gap-1 justify-center shrink-0">
        <div className="w-5 h-1 bg-[#00C3F8] rounded-full" />
        <div className="w-3.5 h-1 bg-[#00C3F8] rounded-full" />
        <div className="w-2 h-1 bg-[#00C3F8] rounded-full" />
      </div>
      <span className="font-extrabold text-xl sm:text-[22px] tracking-tight text-[#0A2540] select-none">
        paystack
      </span>
    </div>
  );
}

function KudaLogo() {
  return (
    <div className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 4.5V19.5M6 12L15.5 4.5M8.5 10.5L16.5 19.5"
          stroke="#40196D"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-bold text-xl sm:text-[22px] tracking-tight text-[#40196D] select-none">
        kuda<span className="text-[#40196D]">.</span>
      </span>
    </div>
  );
}

function MoniepointLogo() {
  return (
    <div className="flex items-center gap-2 hover:opacity-100 transition-opacity">
      <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 bg-[#0052FF] rounded-lg flex items-center justify-center shadow-xs shrink-0">
        <span className="text-white font-extrabold text-sm sm:text-base tracking-tighter">
          M
        </span>
      </div>
      <div className="flex flex-col -space-y-0.5 text-left">
        <span className="font-extrabold text-base sm:text-[18px] tracking-tight text-[#0052FF] leading-tight select-none">
          Moniepoint
        </span>
        <span className="text-[7.5px] font-bold tracking-wider text-[#0052FF]/70 uppercase select-none">
          MICROFINANCE BANK
        </span>
      </div>
    </div>
  );
}

/* ── Distinctive Blue Double Quotation Mark ── */
function BlueQuoteIcon() {
  return (
    <svg
      width="26"
      height="22"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 mb-4"
      aria-hidden="true"
    >
      <path
        d="M7.8 21.5C4.2 21.5 1.5 18.8 1.5 14.8C1.5 8.6 5.8 3.5 12.2 0.8L13.4 3.2C9 5.5 6.4 8.7 6.2 12.1C7.1 11.5 8.2 11.2 9.4 11.2C12.5 11.2 14.8 13.5 14.8 16.5C14.8 19.6 12.1 21.5 7.8 21.5ZM21.6 21.5C18 21.5 15.3 18.8 15.3 14.8C15.3 8.6 19.6 3.5 26 0.8L27.2 3.2C22.8 5.5 20.2 8.7 20 12.1C20.9 11.5 22 11.2 23.2 11.2C26.3 11.2 28.6 13.5 28.6 16.5C28.6 19.6 25.9 21.5 21.6 21.5Z"
        fill="#1787D4"
      />
    </svg>
  );
}

const testimonials = [
  {
    id: "sola-adesina",
    quote:
      "“ Nupat Cloud has been instrumental in our online success, their hosting is fast, reliable, and support is exceptional.",
    name: "Sola Adesina",
    title: "CEO, AgriCorp Nigeria",
    image: "/testimonials/sola-adesina.jpg",
  },
  {
    id: "michael-bamidele",
    quote:
      "“Our application latency dropped significantly after deploying on our platform's local cloud infrastructure.”",
    name: "Michael Bamidele",
    title: "CTO, Inovate Nigeria",
    image: "/testimonials/michael-bamidele.jpg",
  },
  {
    id: "aisha-hassan",
    quote:
      "“this platform has saved us thousands in hosting fees and reduced our website setup friction to nearly zero. The AI builder is incredibly intuitive.”",
    name: "Aisha Hassan",
    title: "Founder, Beauty Store",
    image: "/testimonials/aisha-hassan.jpg",
  },
];

import { motion } from "motion/react";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-14 sm:py-16 bg-white relative overflow-hidden"
    >
      {/* Background Curvelines */}
      <div className="absolute top-12 -left-28 pointer-events-none select-none z-0 hidden md:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[460px] lg:w-[620px] h-auto brightness-0 opacity-[0.04] -rotate-[18deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-12 -right-24 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[420px] lg:w-[580px] h-auto brightness-0 opacity-[0.04] rotate-[32deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Main Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 sm:mb-16 flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0B1527] tracking-tight mb-4 inline-block text-center">
            <span className="relative inline-block pb-1">
              Helping businesses build what&apos;s next
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base md:text-[17px] max-w-2xl mx-auto leading-relaxed mt-2">
            We are creating the infrastructure that helps businesses move from
            idea to online and beyond.
          </p>
        </motion.div>

        {/* ── Trusted by leaders in Tech & Finance ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-14 sm:mb-16 text-center"
        >
          <p className="text-xs sm:text-sm font-bold tracking-[0.16em] text-[#64748B] uppercase mb-8 sm:mb-10">
            TRUSTED BY LEADERS IN TECH &amp; FINANCE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 lg:gap-18">
            <KoraLogo />
            <FlutterwaveLogo />
            <PaystackLogo />
            <KudaLogo />
            <MoniepointLogo />
          </div>
        </motion.div>

        {/* ── Testimonials Grid with Staggered Motion ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              id={`testimonial-${t.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: idx * 0.1,
              }}
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300"
            >
              <div>
                <BlueQuoteIcon />
                <p className="text-[#374151] text-sm sm:text-[15px] leading-relaxed mb-8 font-normal">
                  {t.quote}
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3.5 pt-2">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200/80 shadow-xs">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="object-cover object-center"
                    sizes="44px"
                  />
                </div>
                <div>
                  <h4 className="text-[#0B1527] font-bold text-sm leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-[#64748B] text-xs font-medium mt-1">
                    {t.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
