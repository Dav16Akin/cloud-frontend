"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, ArrowRight } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import type { Plan } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

function formatPrice(price: number) {
  return "₦" + price.toLocaleString("en-NG");
}

const planDescriptions: Record<string, string> = {
  Starter: "Small businesses and personal websites",
  Business: "Growing businesses, e-commerce & startups",
  Agency: "Agencies and developers managing multiple clients",
};

const planCtas: Record<string, string> = {
  Starter: "Get Started",
  Business: "Choose Business",
  Agency: "Start Scaling",
};

function PlanCardSkeleton() {
  return (
    <div className="relative flex flex-col p-8 rounded-2xl border border-[#e2eaff] bg-white animate-pulse">
      <div className="h-5 w-28 bg-[#e8edf8] rounded mb-2" />
      <div className="h-4 w-44 bg-[#e8edf8] rounded mb-6" />
      <div className="h-10 w-24 bg-[#e8edf8] rounded mb-7 pb-7" />
      <div className="flex flex-col gap-3 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-[#e8edf8] rounded" />
        ))}
      </div>
      <div className="h-12 w-full bg-[#e8edf8] rounded-xl" />
    </div>
  );
}

function PlanCard({
  plan,
  selectedCycle,
}: {
  plan: Plan;
  selectedCycle: "monthly" | "quarterly" | "yearly";
}) {
  const { addHostingItem, hasItem, openDrawer } = useCartStore();
  const slug = plan.name.toLowerCase();

  const priceMap = {
    monthly: plan.monthlyPrice,
    quarterly: plan.quarterlyPrice,
    yearly: plan.price,
  };
  const price = priceMap[selectedCycle];
  const inCart = hasItem(`hosting:${plan.id}:${selectedCycle}`);

  const websiteLabel =
    plan.websites >= 999
      ? "Unlimited Websites"
      : `${plan.websites} Website${plan.websites > 1 ? "s" : ""}`;
  const emailLabel =
    plan.emails >= 999
      ? "Unlimited Emails"
      : `${plan.emails} Email Account${plan.emails > 1 ? "s" : ""}`;

  const derivedFeatures = [
    `${plan.storage} NVMe Storage`,
    websiteLabel,
    emailLabel,
    ...plan.features.slice(0, 4),
  ];

  const handleAddToCart = () => {
    addHostingItem({
      type: "HOSTING",
      planId: plan.id,
      planName: plan.name,
      price: price,
      billingCycle: selectedCycle,
    });
    openDrawer();
  };

  return (
    <div
      id={`plan-${slug}`}
      className={`relative flex flex-col p-7 sm:p-8 rounded-lg transition-all duration-300 ${
        plan.isPopular
          ? "bg-[#031033] text-white shadow-2xl shadow-blue-900/20 scale-[1.03] md:-mt-2 border-2 border-[#1787D4]"
          : "bg-white border border-[#e2eaff] text-[#031033] shadow-sm hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="inline-flex items-center gap-1.5 bg-[#1787D4] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            <Star className="w-3 h-3 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3
          className={`font-bold text-xl mb-1 ${
            plan.isPopular ? "text-white" : "text-[#031033]"
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-xs sm:text-sm ${
            plan.isPopular ? "text-slate-300" : "text-[#5a6a85]"
          }`}
        >
          {planDescriptions[plan.name] ??
            "A great hosting plan for your needs."}
        </p>
      </div>

      <div
        className={`mb-6 pb-6 border-b ${
          plan.isPopular ? "border-slate-800" : "border-[#e2eaff]"
        }`}
      >
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl sm:text-4xl font-extrabold ${
              plan.isPopular ? "text-white" : "text-[#031033]"
            }`}
          >
            {formatPrice(price)}
          </span>
          <span
            className={`text-xs sm:text-sm ${
              plan.isPopular ? "text-slate-300" : "text-[#5a6a85]"
            }`}
          >
            /
            {selectedCycle === "yearly"
              ? "year"
              : selectedCycle === "quarterly"
                ? "quarter"
                : "month"}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {derivedFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                plan.isPopular
                  ? "bg-blue-500/20 text-[#1787D4]"
                  : "bg-blue-50 text-[#1787D4]"
              }`}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            <span
              className={`text-xs sm:text-sm ${
                plan.isPopular ? "text-slate-200" : "text-[#5a6a85]"
              }`}
            >
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {inCart ? (
        <Link
          href="/cart"
          id={`plan-${slug}-cta`}
          className="flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-xl transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer"
        >
          In Cart — Checkout
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          id={`plan-${slug}-cta`}
          className={`flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-lg transition-all cursor-pointer shadow-sm ${
            plan.isPopular
              ? "bg-[#1787D4] hover:bg-blue-600 text-white shadow-blue-500/20"
              : "bg-[#031033] hover:bg-[#061c52] text-white"
          }`}
        >
          {planCtas[plan.name] ?? "Get Started"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function PricingPreviewSection() {
  const { data: plans, isLoading } = usePlans();
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");

  return (
    <section
      id="pricing-preview"
      className="py-14 sm:py-16 bg-[#f8faff] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] tracking-tight mb-4">
            Plans for Every{" "}
            <span className="text-[#1787D4]">Stage of Growth</span>
          </h2>
          <p className="text-[#5a6a85] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Flexible, high-speed hosting plans for startups, enterprises,
            agencies, and independent creators.
          </p>

          {/* Billing Cycle Selector Tabs */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center bg-white border border-[#e2eaff] p-1 rounded-lg shadow-xs">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    billingCycle === cycle
                      ? "bg-[#031033] text-white shadow-xs"
                      : "text-[#5a6a85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly"
                    ? "Monthly"
                    : cycle === "quarterly"
                      ? "Quarterly (5% off)"
                      : "Yearly (15% off)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {isLoading
            ? [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
            : plans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selectedCycle={billingCycle}
                />
              ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/pricing"
            id="view-all-pricing"
            className="text-[#1787D4] text-sm font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
          >
            View full feature comparison & pricing
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
