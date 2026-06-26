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
  Business: "Growing businesses and startups",
  Agency: "Agencies and developers managing multiple clients",
};

const planCtas: Record<string, string> = {
  Starter: "Get Started",
  Business: "Choose Business",
  Agency: "Start Scaling",
};

function PlanCardSkeleton() {
  return (
    <div className="relative flex flex-col p-7 feature-card animate-pulse">
      <div className="h-5 w-28 bg-[#e8edf8] rounded mb-2" />
      <div className="h-4 w-44 bg-[#e8edf8] rounded mb-6" />
      <div className="h-10 w-24 bg-[#e8edf8] rounded mb-7 pb-7" />
      <div className="flex flex-col gap-3 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-[#e8edf8] rounded" />
        ))}
      </div>
      <div className="h-12 w-full bg-[#e8edf8] rounded" />
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
    plan.websites >= 999 ? "Unlimited Websites" : `${plan.websites} Website${plan.websites > 1 ? "s" : ""}`;
  const emailLabel =
    plan.emails >= 999 ? "Unlimited Emails" : `${plan.emails} Email Account${plan.emails > 1 ? "s" : ""}`;

  const derivedFeatures = [
    `${plan.storage} Storage`,
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
      className={`relative flex flex-col p-7 transition-all duration-300 ${
        plan.isPopular
          ? "bg-[#031033] text-white shadow-xl shadow-[#031033]/20 scale-[1.02] md:-mt-2 border border-[#031033]"
          : "feature-card"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-[#e8900a] text-white text-xs font-bold px-4 py-1 shadow-lg shadow-[#e8900a]/20">
            <Star className="w-3 h-3 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`font-bold text-xl mb-1 ${plan.isPopular ? "text-white" : "text-[#031033]"}`}>
          {plan.name}
        </h3>
        <p className={`text-sm ${plan.isPopular ? "text-gray-200" : "text-[#5a6a85]"}`}>
          {planDescriptions[plan.name] ?? "A great hosting plan for your needs."}
        </p>
      </div>

      <div className={`mb-7 pb-7 border-b ${plan.isPopular ? "border-white/20" : "border-[#dce4f7]"}`}>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold ${plan.isPopular ? "text-white" : "text-[#031033]"}`}>
            {formatPrice(price)}
          </span>
          <span className={`text-sm ${plan.isPopular ? "text-gray-200" : "text-[#5a6a85]"}`}>
            /{selectedCycle === "yearly" ? "year" : selectedCycle === "quarterly" ? "quarter" : "month"}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {derivedFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                plan.isPopular ? "bg-white/20" : "bg-[#f2f5fc] border border-[#dce4f7]"
              }`}
            >
              <Check
                className={`w-3 h-3 ${plan.isPopular ? "text-white" : "text-[#031033]"}`}
                strokeWidth={2.5}
              />
            </div>
            <span className={`text-sm ${plan.isPopular ? "text-gray-100" : "text-[#5a6a85]"}`}>{feat}</span>
          </li>
        ))}
      </ul>

      {inCart ? (
        <Link
          href="/cart"
          id={`plan-${slug}-cta`}
          className="flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
        >
          In Cart — Checkout
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          id={`plan-${slug}-cta`}
          className={`flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all ${
            plan.isPopular ? "bg-[#e8900a] text-white hover:bg-[#c97a08]" : "btn-primary"
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  return (
    <section id="pricing-preview" className="section-pad section-light relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-[#031033]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#e8900a] mb-3">Hosting Plans</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-4">
            Plans for Every{" "}
            <span className="text-[#e8900a]">Stage of Growth</span>
          </h2>
          <p className="text-[#5a6a85] text-lg max-w-2xl mx-auto mb-8">
            Flexible hosting plans for startups, growing businesses, agencies, and developers.
          </p>

          {/* Billing Cycle Selector Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center bg-[#f2f5fc] border border-[#dce4f7] p-1 rounded-xl">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    billingCycle === cycle
                      ? "bg-[#031033] text-white shadow-sm"
                      : "text-[#5a6a85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {isLoading
            ? [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
            : plans?.map((plan) => (
                <PlanCard key={plan.id} plan={plan} selectedCycle={billingCycle} />
              ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/pricing"
            id="view-all-pricing"
            className="text-[#e8900a] text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5"
          >
            View full pricing details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
