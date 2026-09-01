"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#1787D4] h-screen flex items-center"
    >
      {/* ── White circle backdrop — sits behind the person, upper-right area ── */}
      <div
        className="absolute rounded-full bg-white hidden lg:block"
        style={{
          width: "38vw",
          height: "38vw",
          maxWidth: "560px",
          maxHeight: "560px",
          top: "70%",
          right: "8%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      />

      {/* ── Top-right wavy squiggle ── */}
      <div
        className="absolute z-20 pointer-events-none hidden lg:block"
        style={{ top: "30%", right: "0%" }}
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
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center h-full">
        <div className="max-w-lg lg:max-w-[46%]">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.12] tracking-tight text-white mb-5">
            One <span className="text-[#FFC75D]">Platform</span> to Build,
            <br />
            Launch, and Run Your
            <br />
            <span className="text-[#FFC75D]">Digital Business.</span>
          </h1>

          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-sm mb-8">
            We bring domains, hosting, AI website creation, cloud
            infrastructure, email, payments, and business tools together giving
            you everything you need to grow online.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/domains"
              id="hero-get-started"
              className="inline-flex items-center justify-center border-2 border-white bg-white hover:bg-gray-100 text-[#1787D4] font-bold text-sm py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </Link>
            <Link
              href="/products"
              id="hero-explore-products"
              className="inline-flex items-center justify-center border-2 border-white hover:bg-white/10 text-white font-bold text-sm py-3 px-7 rounded-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Products
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
