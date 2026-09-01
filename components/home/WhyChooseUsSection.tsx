"use client";

import React from "react";
import Image from "next/image";

const features = [
  {
    title: "Simple Transfer Process",
    description: "Move your domain through a straightforward, guided process.",
  },
  {
    title: "Easy Domain Management",
    description: "Manage your domains, settings, and renewals from one place.",
  },
  {
    title: "Reliable Infrastructure",
    description:
      "Keep your domain connected to dependable digital infrastructure.",
  },
  {
    title: "Secure Domain Management",
    description:
      "Built with security in mind to help keep your domain protected.",
  },
  {
    title: "Fast & Convenient",
    description:
      "Complete the transfer process without unnecessary complexity.",
  },
];

/* Green filled checkbox that matches the Figma icon */
function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="shrink-0 mt-0.5"
    >
      <rect width="22" height="22" rx="5" fill="#FFC75D" />
      <path
        d="M6 11.5L9.5 15L16 8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="w-full py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
        {/* ── Left: image as-is, no filter ── */}
        <div className="w-full lg:w-[46%] shrink-0 flex justify-center lg:justify-start">
          <Image
            src="/whyus.png"
            alt="Happy customer giving thumbs up with headphones"
            width={480}
            height={480}
            className="w-full max-w-105 lg:max-w-none h-auto object-contain"
            priority
          />
        </div>

        {/* ── Right: content ── */}
        <div className="flex-1 w-full">
          {/* Decorative dots — top */}
          <div className="relative mb-4 h-6">
            <span className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-[#1787D4] opacity-60" />
            <span className="absolute left-[38%] top-0 w-2 h-2 rounded-full bg-[#1787D4]" />
            <span className="absolute right-4 top-1 w-2.5 h-2.5 rounded-full bg-[#1787D4] opacity-40" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] tracking-tight mb-2 text-center lg:text-left">
            Why Choose Us
          </h2>
          <p className="text-[#5a6a85] text-sm sm:text-base mb-7 text-center lg:text-left">
            Everything you need for a smooth and hassle-free domain transfer.
          </p>

          {/* Feature list */}
          <ul className="flex flex-col gap-5">
            {features.map((feat) => (
              <li key={feat.title} className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <p className="text-sm font-bold text-[#031033] leading-snug">
                    {feat.title}
                  </p>
                  <p className="text-sm text-[#5a6a85] leading-relaxed mt-0.5">
                    {feat.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
