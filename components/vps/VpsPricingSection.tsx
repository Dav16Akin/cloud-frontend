"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";
import { useVpsPlans } from "@/hooks/useVps";
import { useAuthStore } from "@/store/authStore";
import type { VpsPlan } from "@/lib/api";

function formatPrice(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function planFeatures(plan: VpsPlan) {
  return [
    `${plan.cpu} vCPU ${plan.cpu === 1 ? "core" : "cores"}`,
    `${plan.ramGb} GB RAM`,
    `${plan.diskGb} GB NVMe storage`,
    "Full root access",
    "Dedicated IPv4 and IPv6",
  ];
}

export default function VpsPricingSection() {
  const router = useRouter();
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
    <section id="pricing" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-4">
            VPS plans and pricing
          </h2>
          <p className="text-lg text-[#5A6A85] leading-relaxed">
            Pick the CPU, memory and storage your software needs, and upgrade later as it grows.
            Prices come live from our catalogue.
          </p>
        </div>

        {plansQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 animate-pulse min-h-[430px]"
              >
                <div className="h-6 w-32 rounded bg-[#F2F5FC]" />
                <div className="mt-4 h-9 w-40 rounded bg-[#F2F5FC]" />
                <div className="mt-8 space-y-3">
                  <div className="h-4 w-40 rounded bg-[#F2F5FC]" />
                  <div className="h-4 w-36 rounded bg-[#F2F5FC]" />
                  <div className="h-4 w-44 rounded bg-[#F2F5FC]" />
                  <div className="h-4 w-32 rounded bg-[#F2F5FC]" />
                </div>
                <div className="mt-10 h-11 w-full rounded-lg bg-[#F2F5FC]" />
              </div>
            ))}
          </div>
        ) : plansQuery.isError ? (
          <div className="max-w-xl mx-auto text-center rounded-xl border border-[#E2E8F0] bg-white px-6 py-14">
            <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold text-[#031033]">
              We could not load the latest prices
            </h3>
            <p className="mt-1.5 text-sm text-[#5A6A85]">
              Please retry. If this keeps happening, contact support and we will
              help you choose a plan.
            </p>
            <button
              type="button"
              onClick={() => plansQuery.refetch()}
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] px-4 text-sm font-medium text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="max-w-xl mx-auto text-center rounded-xl border border-[#E2E8F0] bg-white px-6 py-14">
            <h3 className="text-lg font-semibold text-[#031033]">
              Plans are being updated
            </h3>
            <p className="mt-1.5 text-sm text-[#5A6A85]">
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
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-6 sm:p-8 flex flex-col justify-between ${
                    isPopular
                      ? "bg-[#1787D4] text-white"
                      : "bg-white text-[#031033] border border-[#E2E8F0]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-6 right-6 inline-flex items-center px-3 py-0.5 rounded-full bg-white text-[#1787D4] text-xs font-medium">
                      Most popular
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isPopular ? "text-white" : "text-[#031033]"
                      }`}
                    >
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-7">
                      <span
                        className={`text-3xl font-semibold tabular-nums ${
                          isPopular ? "text-white" : "text-[#031033]"
                        }`}
                      >
                        {formatPrice(plan.priceNgnMonthly)}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isPopular ? "text-white/70" : "text-[#5A6A85]"
                        }`}
                      >
                        /mo
                      </span>
                    </div>

                    <ul className="space-y-3 mb-9">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5">
                          <Check
                            className={`w-4 h-4 shrink-0 ${
                              isPopular ? "text-white" : "text-[#1787D4]"
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={`text-sm font-medium leading-tight ${
                              isPopular ? "text-white" : "text-[#031033]"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleDeploy(plan)}
                      className={`w-full h-11 px-5 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        isPopular
                          ? "bg-white text-[#031033] hover:bg-[#F2F5FC] focus-visible:ring-white focus-visible:ring-offset-[#1787D4]"
                          : "border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] focus-visible:ring-[#1787D4]"
                      }`}
                    >
                      Deploy server
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <p
                      className={`mt-2 text-center text-xs ${
                        isPopular ? "text-white/70" : "text-[#5A6A85]"
                      }`}
                    >
                      Choose your OS, region and SSH key next
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
