"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

/* ── Authentic Client & Partner Logos from Nupat Africa ── */
const CLIENT_LOGOS = [
  {
    name: "DC Datalab",
    src: "/logo-dcdatalab.svg",
    width: 150,
    height: 32,
    className: "h-6 sm:h-7 md:h-8 w-auto object-contain",
  },
  {
    name: "Nupat",
    src: "/logo-nupat-dark.png",
    width: 130,
    height: 38,
    className: "h-7 sm:h-8 md:h-9 w-auto object-contain",
  },
  {
    name: "Ulego",
    src: "/logos/ulego-logo-removebg-preview.png",
    width: 200,
    height: 38,
    className: "h-7 sm:h-8 md:h-9 w-auto object-contain",
  },

  {
    name: "Nestopia",
    src: "/logos/nestopia-removebg-preview.png",
    width: 65,
    height: 44,
    className: "h-9 sm:h-10 md:h-11 w-auto object-contain",
  },
  {
    name: "Nidanet",
    src: "/logos/NIDANET_LOGO-removebg-preview.png",
    width: 95,
    height: 40,
    className: "h-8 sm:h-9 md:h-10 w-auto object-contain",
  },
  {
    name: "The Afrobeat",
    src: "/logos/THE-AFROBEAT-logo-removebg-preview.png",
    width: 130,
    height: 38,
    className: "h-6 sm:h-7 md:h-8 w-auto object-contain",
  },
];

/* ── Distinctive Blue Double Quotation Mark ── */
function BlueQuoteIcon() {
  return (
    <svg
      width="26"
      height="22"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
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
    id: "nnamdi-ugwu",
    quote:
      "“Nupat Cloud has been instrumental in our online success. Their hosting is fast, reliable, and support is exceptional.”",
    name: "Nnamdi Patrick Ugwu",
    title: "CEO, Nupat",
    company: "Nupat",
    companyLogo: "/logo-nupat-dark.png",
    image: "/testimonials/sola-adesina.jpg",
  },
  {
    id: "frank-ugwu",
    quote:
      "“Our application latency dropped significantly after deploying on our platform's local cloud infrastructure.”",
    name: "Frank Ugwu",
    title: "CEO, DC Datalab",
    company: "DC Datalab",
    companyLogo: "/logo-dcdatalab.svg",
    image: "/testimonials/michael-bamidele.jpg",
  },
  {
    id: "aisha-hassan",
    quote:
      "“This platform has saved us thousands in hosting fees and reduced our website setup friction to nearly zero. The infrastructure is solid.”",
    name: "Aisha Hassan",
    title: "Engineer, Ulego",
    company: "Ulego",
    companyLogo: "/logos/ulego-logo-removebg-preview.png",
    image: "/testimonials/aisha-hassan.jpg",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-12 sm:py-16 bg-white relative overflow-hidden"
    >
      {/* Background Curvelines */}
      <div className="absolute top-12 -left-28 pointer-events-none select-none z-0 hidden md:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-155 lg:w-155 h-auto brightness-0 opacity-[0.04] rotate-[-18deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-12 -right-24 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-105 lg:w-145 h-auto brightness-0 opacity-[0.04] rotate-32"
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
          className="text-center mb-8 sm:mb-10 flex flex-col items-center"
        >
          <h2 className="type-h2 text-[#031033] mb-3 inline-block text-center">
            <span className="relative inline-block pb-1">
              Helping businesses build what&apos;s next
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="type-lead text-[#5a6a85] max-w-2xl mx-auto leading-relaxed">
            We are creating the infrastructure that helps businesses move from
            idea to online and beyond.
          </p>
        </motion.div>

        {/* ── Trusted by Growing Brands & Corporations ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-14 sm:mb-16 text-center"
        >
          <p className="type-overline text-[#5a6a85] mb-8 sm:mb-10 tracking-widest uppercase text-xs font-semibold">
            TRUSTED BY GROWING BRANDS &amp; CORPORATIONS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-10 md:gap-12 lg:gap-14">
            {CLIENT_LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center transition-all duration-200 select-none hover:scale-105"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className={logo.className}
                />
              </div>
            ))}
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
                {/* Header with Quote Icon + Real Company Logo */}
                <div className="flex items-center justify-between mb-6 min-h-[40px]">
                  <BlueQuoteIcon />
                  <div className="relative h-8 sm:h-9 max-w-[150px] flex items-center justify-end">
                    <Image
                      src={t.companyLogo}
                      alt={t.company}
                      width={150}
                      height={40}
                      className="h-7 sm:h-8 w-auto object-contain hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                <p className="text-[#1d1d1f] text-[15px] leading-relaxed mb-8 font-normal">
                  {t.quote}
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
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
                  <h4 className="text-[#031033] font-semibold text-[15px] leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-[#5a6a85] text-[13px] mt-0.5">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
