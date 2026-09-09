"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { FluidOrb } from "@/components/ui/fluid-orb";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#1787D4] min-h-[580px] lg:min-h-[640px] pt-32 pb-16 lg:pt-36 lg:pb-20 flex items-center"
    >
      {/* ── FluidOrb backdrop — matching the navbar logged-in orb, sits behind the person ── */}
      <div
        className="absolute rounded-full hidden lg:flex items-center justify-center pointer-events-none"
        style={{
          width: "38vw",
          height: "38vw",
          maxWidth: "520px",
          maxHeight: "520px",
          top: "65%",
          right: "8%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        <FluidOrb
          size={520}
          color="#1787D4"
          topColor="#FD9F09"
          style={{ width: "100%", height: "100%" }}
          className="w-full h-full shadow-[0_0_90px_rgba(253,159,9,0.35)] ring-4 ring-white/25"
        />
      </div>

      {/* ── Top-right wavy squiggle ── */}
      <div
        className="absolute z-20 pointer-events-none hidden lg:block"
        style={{ top: "30%", right: "0%", zIndex: 2 }}
      >
        <Image
          src="/curveline.png"
          alt=""
          width={120}
          height={120}
          className="w-56 h-auto"
          aria-hidden
        />
      </div>

      {/* ── Bottom-center wavy squiggle ── */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ bottom: "10%", left: "22%" }}
      >
        <Image
          src="/curveline.png"
          alt=""
          width={140}
          height={58}
          className="w-64 h-auto"
          aria-hidden
        />
      </div>

      {/* ── Main content: left text column ── */}
      <div className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full">
        <div className="max-w-lg lg:max-w-[46%]">
          <h1 className="type-display text-white mb-5">
            One <span className="text-[#FFC75D]">Platform</span> to Build,
            <br />
            Launch, and Run Your
            <br />
            <span className="text-[#FFC75D]">Digital Business.</span>
          </h1>

          <p className="text-white/90 text-[15px] sm:text-[16px] leading-relaxed max-w-md mb-8">
            We bring domains, hosting, AI website creation, cloud
            infrastructure, email, payments, and business tools together giving
            you everything you need to grow online.
          </p>

          {/* Apple Pill CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/domains"
              id="hero-get-started"
              className="btn-white !rounded-full px-7 py-3 text-[14px] sm:text-[15px] font-semibold cursor-pointer"
            >
              Get Started
            </Link>
            <Link
              href="/hosting"
              id="hero-explore-products"
              className="btn-outline-white !rounded-full px-7 py-3 text-[14px] sm:text-[15px] font-semibold cursor-pointer"
            >
              Explore Hosting
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero image — full height, anchored to bottom-right ── */}
      <div
        className="absolute -top-10 right-0 hidden lg:block"
        style={{ height: "130%", zIndex: 10 }}
      >
        <Image
          src="/hero.png"
          alt="Person holding laptop celebrating digital business success"
          width={2354}
          height={2354}
          className="h-full w-auto object-contain object-bottom"
          priority
        />
      </div>

      {/* ── Mobile: faint background image ── */}
      <div
        className="absolute bottom-0 right-0 lg:hidden opacity-20"
        style={{ zIndex: 1 }}
      >
        <Image
          src="/hero.png"
          alt=""
          width={300}
          height={300}
          className="w-60 h-auto object-contain object-bottom"
          priority
        />
      </div>
    </section>
  );
}
