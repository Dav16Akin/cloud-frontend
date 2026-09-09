"use client";

import React from "react";
import Link from "next/link";
import { User, LifeBuoy, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

const emailDemos = [
  {
    email: "hello@yourbusiness.com",
    department: "General Inquiries",
    icon: User,
  },
  {
    email: "support@yourbusiness.com",
    department: "Customer Support",
    icon: LifeBuoy,
  },
  {
    email: "sales@yourbusiness.com",
    department: "Sales & Invoicing",
    icon: ShoppingBag,
  },
];

export default function ProfessionalVoiceSection() {
  return (
    <section
      id="business-email"
      className="py-10 sm:py-12 bg-white relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle & CTA button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <h2 className="type-h2 text-[#031033] mb-3">
              Give your business a <br className="hidden sm:inline" />
              professional voice
            </h2>
            <p className="type-lead text-[#5a6a85] leading-relaxed max-w-lg mb-6">
              Create professional email addresses using your domain to build
              trust and separate work from personal updates.
            </p>

            <div>
              <Link
                href="/hosting#email"
                id="get-business-email-btn"
                className="btn-primary !rounded-full px-6 py-2.5 text-[14px] font-medium shadow-sm cursor-pointer"
              >
                Get Business Email
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3 Styled Email Boxes in Bordered Card with Staggered Motion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="rounded-2xl border border-blue-200/80 bg-[#F4F8FC]/70 p-6 sm:p-8 backdrop-blur-xs shadow-xs">
              <div className="flex flex-col gap-4">
                {emailDemos.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.email}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.15 + idx * 0.1,
                      }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-default"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#1787D4] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Icon className="w-5 h-5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[15px] sm:text-[16px] text-[#031033] truncate">
                          {item.email}
                        </p>
                        <p className="text-[13px] text-[#5a6a85] mt-0.5">
                          {item.department}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
