"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useVpsPlans } from "@/hooks/useVps";
import { useAuthStore } from "@/store/authStore";
import type { VpsPlan } from "@/lib/api";

function formatPrice(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function planFeatures(plan: VpsPlan) {
  return [
    `${plan.cpu} vCPU ${plan.cpu === 1 ? "Core" : "Cores"}`,
    `${plan.ramGb} GB RAM`,
    `${plan.diskGb} GB NVMe Storage`,
    "Full root access",
    "Dedicated IPv4 & IPv6",
  ];
}

export default function VpsPricingSection() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const token = useAuthStore((s) => s.token);
  const plansQuery = useVpsPlans();

  const plans = plansQuery.data ?? [];
  // Plans are ordered by price; highlight the middle tier. A single plan is
  // highlighted so the section still has a clear primary action.
  const popularIndex = plans.length === 1 ? 0 : 1;

  const handleDeploy = (plan: VpsPlan) => {
    const target = `/dashboard/vps/purchase?plan=${encodeURIComponent(plan.id)}`;
    router.push(
      token ? target : `/login?redirect=${encodeURIComponent(target)}`,
    );
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
            software suite. Prices update live from our catalogue.
          </p>
        </div>

        {plansQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-100 bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse min-h-[430px]"
              >
                <div className="h-6 w-32 rounded bg-slate-100" />
                <div className="mt-4 h-9 w-40 rounded bg-slate-100" />
                <div className="mt-8 space-y-3">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-4 w-36 rounded bg-slate-100" />
                  <div className="h-4 w-44 rounded bg-slate-100" />
                  <div className="h-4 w-32 rounded bg-slate-100" />
                </div>
                <div className="mt-10 h-11 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : plansQuery.isError ? (
          <div className="max-w-xl mx-auto text-center rounded-3xl border border-red-100 bg-white px-6 py-14 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <AlertCircle className="w-9 h-9 text-red-400 mx-auto" />
            <h3 className="mt-3 text-lg font-bold text-[#031033]">
              We could not load the latest prices
            </h3>
            <p className="mt-1.5 text-sm text-[#5a6a85]">
              Please retry. If this keeps happening, contact support and we will
              help you choose a plan.
            </p>
            <button
              type="button"
              onClick={() => plansQuery.refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1787D4] hover:bg-[#1371B5] px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="max-w-xl mx-auto text-center rounded-3xl border border-slate-100 bg-white px-6 py-14 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-bold text-[#031033]">
              Plans are being updated
            </h3>
            <p className="mt-1.5 text-sm text-[#5a6a85]">
              Our VPS catalogue is temporarily unavailable. Please check back
              shortly or contact support.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 lg:gap-8 items-stretch mx-auto ${
              plans.length === 1
                ? "max-w-md"
                : plans.length === 2
                  ? "max-w-3xl md:grid-cols-2"
                  : "max-w-5xl md:grid-cols-3"
            }`}
          >
            {plans.map((plan, idx) => {
              const isPopular = idx === popularIndex;
              const features = planFeatures(plan);

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
                  {isPopular && (
                    <div className="absolute top-6 right-6 inline-flex items-center px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase border border-white/30">
                      <span>POPULAR</span>
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-xl font-bold tracking-tight mb-2 ${
                        isPopular ? "text-white" : "text-[#031033]"
                      }`}
                    >
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-7">
                      <span
                        className={`text-3xl sm:text-[32px] font-extrabold tracking-tight ${
                          isPopular ? "text-white" : "text-[#031033]"
                        }`}
                      >
                        {formatPrice(plan.priceNgnMonthly)}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isPopular ? "text-blue-100" : "text-[#5a6a85]"
                        }`}
                      >
                        /mo
                      </span>
                    </div>

                    <div className="space-y-3 mb-9">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5">
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
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleDeploy(plan)}
                      className={`w-full py-3 px-4 rounded-full font-semibold text-[14px] inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                        isPopular
                          ? "btn-white !w-full !rounded-full !py-3 !text-[14px]"
                          : "bg-slate-100 hover:bg-slate-200 text-[#031033]"
                      }`}
                    >
                      Deploy Server
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p
                      className={`mt-2 text-center text-[10.5px] ${
                        isPopular ? "text-blue-100" : "text-[#8a9bb2]"
                      }`}
                    >
                      Choose your OS, region and SSH key next
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
