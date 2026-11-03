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
      "Nupat Cloud is a platform for African businesses to register domains, host websites, run cloud servers and use business tools from one account.",
  },
  {
    question: "Can I register a domain with you?",
    answer:
      "Yes. We support global domains such as .com, .net and .co, and African extensions such as .ng, .africa and .gh.",
  },
  {
    question: "Can I create a website without coding?",
    answer:
      "Yes. Our AI website builder writes the copy, picks images and lays out the pages from a short description of your business.",
  },
  {
    question: "Can I move my existing website to Nupat?",
    answer:
      "Yes. We offer free migration tools and 24/7 technical support to move your existing websites with zero downtime.",
  },
  {
    question: "Does Nupat support developers?",
    answer:
      "Yes. Developers get Kubernetes clusters, API storage, local anycast CDN endpoints and flexible billing.",
  },
  {
    question: "Who is Nupat for?",
    answer:
      "Business owners, SaaS founders, agencies and developers who need dependable infrastructure and support close to home.",
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
      className="py-16 sm:py-24 bg-[#F2F5FC] relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="type-h2 text-[#031033] mb-3">
            Frequently asked questions
          </h2>
          <p className="type-lead text-[#5A6A85] max-w-xl mx-auto">
            Quick answers about the platform, our products and how to get
            started.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={faq.question}
                id={`faq-accordion-${index}`}
                className="bg-white rounded-xl border border-[#E2E8F0] transition-colors hover:border-[#D5DCE6] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4] rounded-xl"
                >
                  <span className="font-semibold text-lg text-[#031033] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#1787D4]" : "text-[#5A6A85]"
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`faq-panel-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0">
                        <p className="text-base text-[#5A6A85] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
