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
  Starter: "For personal websites, blogs and small projects.",
  Business: "Faster caching, custom security setup and more storage.",
  Agency: "For agencies and developers running high-traffic websites.",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

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
      ? "Unlimited websites"
      : `${plan.websites} website${plan.websites > 1 ? "s" : ""}`;

  const derivedFeatures = [
    websiteLabel,
    `${plan.storage} storage`,
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

  const featured = plan.isPopular;
  const billedText =
    selectedCycle === "monthly"
      ? "Billed monthly"
      : `Billed ${formatPrice(cyclePrice)} ${
          selectedCycle === "yearly" ? "yearly" : "quarterly"
        }`;

  return (
    <div
      id={`plan-${slug}`}
      className={`rounded-xl p-6 sm:p-8 flex flex-col justify-between ${
        featured
          ? "bg-[#1787D4] text-white"
          : "bg-white text-[#031033] border border-[#E2E8F0]"
      }`}
    >
      <div>
        <div className="mb-5">
          <h3 className={`text-xl font-semibold ${featured ? "text-white" : "text-[#031033]"}`}>
            {plan.name}
          </h3>
          <p
            className={`text-sm mt-1.5 leading-relaxed min-h-10 ${
              featured ? "text-white/80" : "text-[#5A6A85]"
            }`}
          >
            {planDescriptions[plan.name] ??
              "A hosting package sized for your website."}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1 flex-nowrap">
            <span
              className={`text-3xl font-semibold tabular-nums shrink-0 ${
                featured ? "text-white" : "text-[#031033]"
              }`}
            >
              {formatPrice(monthlyEquivalent)}
            </span>
            <span
              className={`text-sm font-medium shrink-0 ${
                featured ? "text-white/80" : "text-[#5A6A85]"
              }`}
            >
              /month
            </span>
          </div>
          <div className={`text-xs mt-1 ${featured ? "text-white/80" : "text-[#5A6A85]"}`}>
            {billedText}
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {derivedFeatures.map((feat) => (
            <li key={feat} className="flex items-center gap-3">
              <CheckCircle2
                className={`w-5 h-5 shrink-0 ${featured ? "text-white" : "text-[#1787D4]"}`}
                aria-hidden="true"
              />
              <span className={`text-sm ${featured ? "text-white" : "text-[#031033]"}`}>
                {feat}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {inCart ? (
        <Link
          href="/cart"
          id={`plan-${slug}-cta`}
          className={`w-full flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium rounded-lg transition-colors bg-[#12A150] hover:bg-[#0E7C3A] text-white cursor-pointer ${FOCUS_RING}`}
        >
          In cart, go to checkout
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          id={`plan-${slug}-cta`}
          className={`w-full flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${FOCUS_RING} ${
            featured
              ? "bg-white hover:bg-[#F2F5FC] text-[#031033]"
              : "bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] text-[#031033]"
          }`}
        >
          Choose {plan.name}
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
  title = "Start small and upgrade when you need to",
  subtitle = "Pick the hosting plan that fits your website today and move up a plan as your traffic grows.",
  showFooterLink = true,
  className = "py-16 sm:py-24 bg-[#F2F5FC] relative overflow-hidden scroll-mt-20",
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
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] leading-tight max-w-3xl text-balance">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-[#5A6A85] max-w-2xl mx-auto mt-3">
              {subtitle}
            </p>
          )}

          {/* Billing cycle switch, mapped to the endpoint billing cycles */}
          <div className="flex flex-col items-center justify-center gap-2 mt-8">
            <div className="inline-flex items-center p-1 bg-white border border-[#E2E8F0] rounded-full">
              {DURATION_CYCLES.map((dur) => {
                const isSelected = selectedCycle === dur.id;
                return (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedCycle(dur.id)}
                    aria-pressed={isSelected}
                    className={`relative px-4 sm:px-6 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${FOCUS_RING} ${
                      isSelected
                        ? "bg-[#031033] text-white"
                        : "text-[#5A6A85] hover:text-[#031033]"
                    }`}
                  >
                    <span>{dur.label}</span>
                    <span className="text-xs opacity-70 hidden sm:inline">
                      ({dur.periodText})
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#5A6A85] mt-1">
              {selectedCycle === "monthly"
                ? "Billed every month. Cancel anytime."
                : selectedCycle === "quarterly"
                  ? "Billed every three months, at a lower monthly rate."
                  : "Billed once a year."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-8">
          {isLoading && !plans
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-8 border border-[#E2E8F0] bg-white animate-pulse h-96"
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

        {showFooterLink && (
          <div className="text-center mt-12">
            <Link
              href="/pricing"
              id="view-all-pricing"
              className="text-[#1787D4] text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
            >
              Compare every plan and feature
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
