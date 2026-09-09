"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "motion/react";

export default function FinalCTASection() {
  return (
    <section
      id="final-cta"
      className="py-12 sm:py-16 relative overflow-hidden bg-linear-to-b from-[#031033] via-[#051640] to-[#020b24]"
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
          className="w-120 lg:w-162.5 h-auto opacity-15 rotate-[-15deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -right-24 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-105 lg:w-145 h-auto opacity-12 rotate-30"
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
          <h2 className="type-h2 text-white mb-3">
            <span className="relative inline-block pb-1">
              Start Building Online with Confidence
            </span>
          </h2>

          <p className="type-lead text-slate-300 leading-relaxed mb-6 max-w-2xl mx-auto">
            Get ultra-fast NVMe hosting, instant domain registrations, secure
            business emails, and African cloud infrastructure backed by 24/7
            technical support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                id="final-cta-get-started"
                className="btn-primary !rounded-full py-2.5 px-6 text-[14px] font-medium text-white shadow-md w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/domains"
                id="final-cta-search-domain"
                className="btn-outline-white !rounded-full py-2.5 px-6 text-[14px] font-medium text-white backdrop-blur-md transition-all duration-200 w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search Domains
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
