"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";

interface VpsPlan {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
}

const vpsPlans: VpsPlan[] = [
  {
    id: "vps-starter",
    name: "VPS Starter",
    price: 3200,
    features: [
      "1 vCPU Core",
      "1 GB RAM",
      "20 GB NVMe Storage",
      "1 TB Bandwidth",
      "Weekly Backups",
    ],
  },
  {
    id: "vps-business",
    name: "VPS Business",
    price: 7500,
    popular: true,
    features: [
      "2 vCPU Cores",
      "4 GB RAM",
      "50 GB NVMe Storage",
      "3 TB Bandwidth",
      "Daily Backups",
      "Dedicated IPv4",
    ],
  },
  {
    id: "vps-enterprise",
    name: "VPS Enterprise",
    price: 15000,
    features: [
      "4 vCPU Cores",
      "8 GB RAM",
      "100 GB NVMe Storage",
      "6 TB Bandwidth",
      "Daily Backups",
      "Dedicated IPv4 + IPv6",
    ],
  },
];

function formatPrice(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

export default function VpsPricingSection() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { items, addHostingItem } = useCartStore();

  const handleDeploy = (plan: VpsPlan) => {
    addHostingItem({
      type: "HOSTING",
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      billingCycle: "monthly",
    });

    toast.success(`${plan.name} added to your cart!`, {
      description: "Ready to configure your virtual private server.",
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <section id="pricing" className="py-20 sm:py-24 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="type-h2 text-[#031033] mb-4">
            Unbeatable Value. High Performance.
          </h2>
          <p className="type-lead text-[#5a6a85] leading-relaxed">
            Scale your resources effortlessly. Choose the right specifications for your
            software suite.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {vpsPlans.map((plan, idx) => {
            const isPopular = plan.popular;
            const inCart = items.some(
              (item) => item.type === "HOSTING" && item.planId === plan.id
            );

            return (
              <motion.div
                key={plan.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-[#1787D4] text-white shadow-2xl shadow-[#1787D4]/20 md:scale-[1.03] md:-translate-y-1.5 z-10"
                    : "bg-white text-[#031033] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {/* Popular Pill Badge */}
                {isPopular && (
                  <div className="absolute top-6 right-6 inline-flex items-center px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase border border-white/30">
                    <span>POPULAR</span>
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <h3
                    className={`text-xl font-bold tracking-tight mb-2 ${
                      isPopular ? "text-white" : "text-[#031033]"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-7">
                    <span
                      className={`text-3xl sm:text-[32px] font-extrabold tracking-tight ${
                        isPopular ? "text-white" : "text-[#031033]"
                      }`}
                    >
                      {formatPrice(plan.price)}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isPopular ? "text-blue-100" : "text-[#5a6a85]"
                      }`}
                    >
                      /mo
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-9">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <div
                          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                            isPopular
                              ? "bg-white/20 text-white"
                              : "bg-[#E8F4FC] text-[#1787D4]"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span
                          className={`text-[14px] font-medium leading-tight ${
                            isPopular ? "text-white" : "text-[#031033]"
                          }`}
                        >
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deploy Button */}
                <div>
                  {inCart ? (
                    <Link
                      href="/cart"
                      className={`w-full py-3 px-4 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] ${
                        isPopular
                          ? "bg-white text-[#1787D4] hover:bg-slate-50 shadow-sm"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      }`}
                    >
                      <span>In Cart — Checkout</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeploy(plan)}
                      className={`w-full py-3 px-4 rounded-full font-semibold text-[14px] transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                        isPopular
                          ? "btn-white !w-full !rounded-full !py-3 !text-[14px]"
                          : "bg-slate-100 hover:bg-slate-200 text-[#031033]"
                      }`}
                    >
                      Deploy Server
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
