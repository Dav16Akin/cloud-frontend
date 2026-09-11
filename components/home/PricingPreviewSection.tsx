"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import type { Plan } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

function formatPrice(price: number) {
  return "₦" + price.toLocaleString("en-NG");
}

type BillingCycle = "monthly" | "quarterly" | "yearly";

const DURATION_CYCLES: {
  id: BillingCycle;
  label: string;
  periodText: string;
  months: number;
}[] = [
  {
    id: "monthly",
    label: "Monthly",
    periodText: "1 Month",
    months: 1,
  },
  {
    id: "quarterly",
    label: "Quarterly",
    periodText: "3 Months",
    months: 3,
  },
  {
    id: "yearly",
    label: "Yearly",
    periodText: "12 Months",
    months: 12,
  },
];

// Fallback plans strictly matching the endpoint /plans response
const FALLBACK_PLANS: Plan[] = [
  {
    id: "cmqm5fvx20000r5ru44e7b4il",
    name: "Starter",
    price: 30000,
    monthlyPrice: 3000,
    quarterlyPrice: 8000,
    billingCycle: "yearly",
    storage: "2GB SSD",
    bandwidth: "10GB",
    websites: 1,
    emails: 2,
    features: [
      "Free SSL Certificate",
      "Daily Backups",
      "cPanel Access",
      "24/7 Monitoring",
    ],
    isPopular: false,
    isActive: true,
    createdAt: "2026-06-20T09:22:26.006Z",
    updatedAt: "2026-09-04T10:12:11.439Z",
  },
  {
    id: "cmqm5fvx40001r5ruk7esbeys",
    name: "Business",
    price: 100000,
    monthlyPrice: 10000,
    quarterlyPrice: 28000,
    billingCycle: "yearly",
    storage: "10GB SSD",
    bandwidth: "50GB",
    websites: 5,
    emails: 10,
    features: [
      "Free SSL Certificate",
      "Daily Backups",
      "Priority Support",
      "Enhanced Performance",
    ],
    isPopular: true,
    isActive: true,
    createdAt: "2026-06-20T09:22:26.006Z",
    updatedAt: "2026-07-20T12:52:50.864Z",
  },
  {
    id: "cmqm5fvx40002r5rurekio07y",
    name: "Agency",
    price: 250000,
    monthlyPrice: 24000,
    quarterlyPrice: 68000,
    billingCycle: "yearly",
    storage: "50GB SSD",
    bandwidth: "Unlimited",
    websites: 999,
    emails: 999,
    features: [
      "White-label Support",
      "Dedicated Resources",
      "Advanced Security",
      "Priority Infrastructure",
    ],
    isPopular: false,
    isActive: true,
    createdAt: "2026-06-20T09:22:26.006Z",
    updatedAt: "2026-07-20T12:52:51.158Z",
  },
];

const planDescriptions: Record<string, string> = {
  Starter: "Ideal for personal websites, blogs, and small projects.",
  Business: "Fast caching, custom security setup, extra storage.",
  Agency: "Agencies and developers managing high-traffic websites.",
};

function PlanCard({
  plan,
  selectedCycle,
}: {
  plan: Plan;
  selectedCycle: BillingCycle;
}) {
  const { addHostingItem, hasItem, openDrawer } = useCartStore();
  const slug = plan.name.toLowerCase();

  // Price calculation strictly according to endpoint fields:
  // - monthlyPrice
  // - quarterlyPrice
  // - price (yearly)
  const cyclePrice =
    selectedCycle === "monthly"
      ? plan.monthlyPrice
      : selectedCycle === "quarterly"
        ? plan.quarterlyPrice
        : plan.price;

  // Monthly equivalent breakdown for the "/month" rate
  const monthlyEquivalent =
    selectedCycle === "monthly"
      ? plan.monthlyPrice
      : selectedCycle === "quarterly"
        ? Math.round(plan.quarterlyPrice / 3)
        : Math.round(plan.price / 12);

  const inCart = hasItem(`hosting:${plan.id}:${selectedCycle}`);

  const websiteLabel =
    plan.websites >= 999
      ? "Unlimited Websites"
      : `${plan.websites} Website${plan.websites > 1 ? "s" : ""}`;

  const emailLabel =
    plan.emails >= 999
      ? "Unlimited Email"
      : `${plan.emails} Email Account${plan.emails > 1 ? "s" : ""}`;

  const derivedFeatures = [
    websiteLabel,
    `${plan.storage} Storage`,
    emailLabel,
    ...plan.features,
  ];

  const handleAddToCart = () => {
    addHostingItem({
      type: "HOSTING",
      planId: plan.id,
      planName: plan.name,
      price: cyclePrice,
      billingCycle: selectedCycle,
    });
    openDrawer();
  };

  if (plan.isPopular) {
    // Featured Business Card using official Brand Blue (#1787D4)
    return (
      <div
        id={`plan-${slug}`}
        className="bg-[#1787D4] text-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between shadow-2xl shadow-[#1787D4]/20 md:scale-[1.02] md:-translate-y-1 relative transition-all duration-300"
      >
        <div>
          {/* Header */}
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {plan.name}
            </h3>
            <p className="text-blue-100 text-[13.5px] mt-1.5 leading-relaxed min-h-[40px]">
              {planDescriptions[plan.name] ??
                "Fast caching, custom security setup, extra storage."}
            </p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1 flex-nowrap">
              <span className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight shrink-0">
                {formatPrice(monthlyEquivalent)}
              </span>
              <span className="text-sm font-semibold text-blue-100 shrink-0">
                /month
              </span>
            </div>
            <div className="text-[12px] text-blue-100/80 mt-1">
              {selectedCycle === "monthly"
                ? "Billed monthly"
                : `Billed ${formatPrice(cyclePrice)} ${
                    selectedCycle === "yearly" ? "yearly" : "quarterly"
                  }`}
            </div>
          </div>

          {/* Features List */}
          <ul className="space-y-3.5 mb-8">
            {derivedFeatures.map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0 stroke-[2.2]" />
                <span className="text-white text-[14.5px] font-medium">
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        {inCart ? (
          <Link
            href="/cart"
            id={`plan-${slug}-cta`}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer active:scale-[0.98]"
          >
            In Cart — Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            id={`plan-${slug}-cta`}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-white hover:bg-blue-50 text-[#1787D4] shadow-sm cursor-pointer active:scale-[0.98]"
          >
            Get Started
          </button>
        )}
      </div>
    );
  }

  // Standard White Card (Starter & Agency)
  return (
    <div
      id={`plan-${slug}`}
      className="bg-white text-[#031033] border border-slate-100 rounded-[28px] p-7 sm:p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300"
    >
      <div>
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-2xl font-bold text-[#031033] tracking-tight">
            {plan.name}
          </h3>
          <p className="text-[#5a6a85] text-[13.5px] mt-1.5 leading-relaxed min-h-[40px]">
            {planDescriptions[plan.name] ??
              "A reliable hosting package tailored to your needs."}
          </p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1 flex-nowrap">
            <span className="text-3xl sm:text-[34px] font-extrabold text-[#031033] tracking-tight shrink-0">
              {formatPrice(monthlyEquivalent)}
            </span>
            <span className="text-sm font-semibold text-[#5a6a85] shrink-0">
              /month
            </span>
          </div>
          <div className="text-[12px] text-slate-400 mt-1">
            {selectedCycle === "monthly"
              ? "Billed monthly"
              : `Billed ${formatPrice(cyclePrice)} ${
                  selectedCycle === "yearly" ? "yearly" : "quarterly"
                }`}
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-3.5 mb-8">
          {derivedFeatures.map((feat) => (
            <li key={feat} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1787D4] shrink-0 stroke-[2.2]" />
              <span className="text-slate-700 text-[14.5px] font-medium">
                {feat}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      {inCart ? (
        <Link
          href="/cart"
          id={`plan-${slug}-cta`}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer active:scale-[0.98]"
        >
          In Cart — Checkout
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          id={`plan-${slug}-cta`}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#031033] cursor-pointer active:scale-[0.98]"
        >
          Get Started
        </button>
      )}
    </div>
  );
}

export interface PricingPreviewSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  showFooterLink?: boolean;
  className?: string;
}

export default function PricingPreviewSection({
  id = "pricing-preview",
  title = "Start with what you need. Scale when you're ready.",
  subtitle = "Choose the hosting plan that fits your website today and scale as your traffic grows.",
  showFooterLink = true,
  className = "py-16 sm:py-20 lg:py-24 bg-[#f8faff] relative overflow-hidden scroll-mt-20",
}: PricingPreviewSectionProps = {}) {
  const { data: apiPlans, isLoading } = usePlans();
  const [selectedCycle, setSelectedCycle] =
    useState<BillingCycle>("yearly");

  // Use live API endpoint data (with endpoint fallback)
  const plans = apiPlans && apiPlans.length > 0 ? apiPlans : FALLBACK_PLANS;

  return (
    <section
      id={id}
      className={className}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight text-[#031033] leading-tight max-w-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-[#5a6a85] max-w-2xl mx-auto mt-3">
              {subtitle}
            </p>
          )}

          {/* Duration Options Segmented Bar directly mapping to endpoint billing cycles */}
          <div className="flex flex-col items-center justify-center gap-2 mt-8">
            <div className="inline-flex items-center p-1 bg-white border border-slate-200/90 rounded-full shadow-xs">
              {DURATION_CYCLES.map((dur) => {
                const isSelected = selectedCycle === dur.id;
                return (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedCycle(dur.id)}
                    className={`relative px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#031033] text-white shadow-xs"
                        : "text-[#5a6a85] hover:text-[#031033]"
                    }`}
                  >
                    <span>{dur.label}</span>
                    <span className="text-[11px] opacity-70">
                      ({dur.periodText})
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedCycle === "monthly"
                ? "Flexible monthly billing. Cancel anytime."
                : selectedCycle === "quarterly"
                  ? "Billed quarterly. Enjoy lower effective monthly pricing."
                  : "Annual plan billed once a year."}
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-8">
          {isLoading && !plans
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] p-8 border border-slate-100 bg-white animate-pulse h-96"
                />
              ))
            : plans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selectedCycle={selectedCycle}
                />
              ))}
        </div>

        {/* Footer Link */}
        {showFooterLink && (
          <div className="text-center mt-12">
            <Link
              href="/pricing"
              id="view-all-pricing"
              className="text-[#1787D4] text-sm font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
            >
              View full feature comparison & pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
