"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Nupat Cloud?",
    answer:
      "Our cloud platform is an all-in-one digital business infrastructure ecosystem built specifically to solve domain, hosting, cloud scale, and operational tools friction for African enterprises.",
  },
  {
    question: "Can I register a domain with us?",
    answer:
      "Yes, we support standard global domains (.com, .net, .co) as well as localized national African extensions (.ng, .africa, .gh) with simple setup.",
  },
  {
    question: "Can I create a website without coding?",
    answer:
      "Absolutely. Our built-in conversational AI website builder handles all copywriting, imagery curation, and design layout automatically based on your simple guidelines.",
  },
  {
    question: "Can I host my existing website on our platform?",
    answer:
      "Yes. We offer free automated migration tools and 24/7 technical specialist assistance to shift your existing websites with zero downtime.",
  },
  {
    question: "Does Nupat support developers?",
    answer:
      "Yes. We have a robust, developer-first cloud platform offering Kubernetes clusters, API storage, and local Anycast CDN endpoints with flexible developer billing.",
  },
  {
    question: "Who is Nupat for?",
    answer:
      "We are designed for business owners, SaaS creators, regional agencies, and developers requiring high-performance infrastructure with localized support.",
  },
];

export default function FAQSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section
      id="faq-section"
      className="py-14 sm:py-18 bg-[#fafcff] relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1527] tracking-tight mb-3">
            Everything you need to know
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Quick answers about our platform, our products, and how you can get
            started.
          </p>
        </motion.div>

        {/* FAQ Accordions with Staggered Motion */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <motion.div
                key={faq.question}
                id={`faq-accordion-${index}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.06,
                }}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs transition-all duration-200 hover:border-blue-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                >
                  <span className="font-bold text-base sm:text-[17px] text-[#0B1527] pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#1787D4]" : "text-[#64748B]"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0">
                        <p className="text-xs sm:text-sm text-[#5a6a85] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
