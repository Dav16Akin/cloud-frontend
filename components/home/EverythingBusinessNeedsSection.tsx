import React from "react";
import Image from "next/image";
import {
  Users,
  Settings,
  BarChart3,
  Briefcase,
  ShoppingBag,
  Monitor,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface BusinessTool {
  id: string;
  name: string;
  desc: string;
  status: "Active" | "Coming Soon";
  icon: React.ComponentType<{ className?: string }>;
}

const businessTools: BusinessTool[] = [
  {
    id: "crm",
    name: "CRM",
    desc: "Keep track of customers and conversations.",
    status: "Active",
    icon: Users,
  },
  {
    id: "erp",
    name: "ERP",
    desc: "Run operations and logistics.",
    status: "Coming Soon",
    icon: Settings,
  },
  {
    id: "accounting",
    name: "Accounting",
    desc: "Keep track of your finances.",
    status: "Active",
    icon: BarChart3,
  },
  {
    id: "hr",
    name: "HR",
    desc: "Manage staff and payroll.",
    status: "Coming Soon",
    icon: Briefcase,
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    desc: "Open an online store.",
    status: "Active",
    icon: ShoppingBag,
  },
  {
    id: "pos",
    name: "POS",
    desc: "Take payments in your shop.",
    status: "Coming Soon",
    icon: Monitor,
  },
  {
    id: "payments",
    name: "Payments",
    desc: "Accept card and mobile money payments.",
    status: "Active",
    icon: CreditCard,
  },
  {
    id: "ai-agents",
    name: "AI agents",
    desc: "Automate routine tasks.",
    status: "Coming Soon",
    icon: Sparkles,
  },
];

export default function EverythingBusinessNeedsSection() {
  return (
    <section
      id="business-suite"
      className="py-16 sm:py-24 bg-[#F2F5FC] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left column: heading, subtitle and tool cards */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="type-h2 text-[#031033] mb-3 text-balance">
              Everything your business needs to operate and grow
            </h2>

            <p className="type-lead text-[#5A6A85] leading-relaxed mb-8 max-w-2xl">
              We are adding the tools businesses use to manage customers,
              staff, money and sales, in the same account you use for your
              website and hosting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {businessTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = tool.status === "Active";

                return (
                  <div
                    key={tool.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            isActive ? "text-[#1787D4]" : "text-[#5A6A85]"
                          }`}
                        />
                        <h3 className="font-semibold text-[#031033] text-base">
                          {tool.name}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                          isActive ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-[#12A150]" : "bg-[#D5DCE6]"
                          }`}
                          aria-hidden="true"
                        />
                        {isActive ? "Available" : "Coming soon"}
                      </span>
                    </div>

                    <p className="text-sm text-[#5A6A85] pl-7.5 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: image on a blue panel with the curved notches */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-120 lg:max-w-none aspect-4/5 sm:aspect-3/4 lg:aspect-4/5 bg-[#1787D4] rounded-xl overflow-hidden flex items-end justify-center">
              {/* Semicircular notch cutouts from the Figma design (match the section ground) */}
              <div
                className="absolute top-0 -left-6 w-14 h-14 bg-[#F2F5FC] rounded-full z-20 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 -left-6 w-14 h-14 bg-[#F2F5FC] rounded-full z-20 pointer-events-none hidden lg:block"
                aria-hidden="true"
              />

              <div className="relative w-full h-full">
                <Image
                  src="/everything-y-b-n.png"
                  alt="Young professionals working together on laptops"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 480px, 460px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
