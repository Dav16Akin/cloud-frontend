"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "motion/react";

export default function FinalCTASection() {
  return (
    <section
      id="final-cta"
      className="py-24 sm:py-32 relative overflow-hidden bg-linear-to-b from-[#031033] via-[#051640] to-[#020b24]"
    >
      {/* Ambient background glows with pulse motion */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-blue-500 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Background Curvelines */}
      <div className="absolute -top-12 -left-20 pointer-events-none select-none z-0 hidden sm:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[480px] lg:w-[650px] h-auto opacity-15 rotate-[-15deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -right-24 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[440px] lg:w-[600px] h-auto opacity-15 rotate-[25deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            <span className="relative inline-block pb-1">
              Start Building Online with Confidence
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Get ultra-fast NVMe hosting, instant domain registrations, secure
            business emails, and African cloud infrastructure backed by 24/7
            technical support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                id="final-cta-get-started"
                className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-base py-4 px-10 rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/25 w-full sm:w-auto cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/domains"
                id="final-cta-search-domain"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-base py-4 px-10 rounded-xl border border-white/20 backdrop-blur-md transition-all duration-200 w-full sm:w-auto cursor-pointer"
              >
                <Search className="w-5 h-5" />
                Search Domains
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
