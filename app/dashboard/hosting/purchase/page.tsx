"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Globe,
  Server,
  Cloud,
  Shield,
  Lock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Info,
  CheckCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import {
  usePurchaseHosting,
  setRecentHostingPurchase,
} from "@/hooks/useHosting";
import { useGetMe } from "@/hooks/useUser";
import { searchDomains, type Plan, type DomainResult } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type StepId =
  | "hosting-type" // Screen 1: Choose the right hosting for your website
  | "plan" // Screen 2: Choose your hosting plan
  | "domain" // Screen 3: Set up your hosting (Domain)
  | "details" // Screen 4: Hosting details (Billing & Auto-renewal)
  | "review" // Screen 5: Review your hosting
  | "payment" // Screen 6: Complete your payment
  | "activating" // Screen 7: Activating your hosting...
  | "ready" // Screen 8: Your hosting is ready!
  | "next-steps"; // Screen 9: Your website is ready for the next step

type HostingTypeId = "web" | "vps" | "cloud" | "wordpress";

type BillingCycle = "monthly" | "quarterly" | "yearly";

interface HostingTypeOption {
  id: HostingTypeId;
  title: string;
  description: string;
  idealFor: string;
  iconBg: string;
  available?: boolean;
}

// Plan descriptions for card display (derived by plan name)
const PLAN_DESCRIPTIONS: Record<string, string> = {
  Starter: "A simple start for one focused website.",
  Business: "More power for a growing business presence.",
  Agency: "Advanced performance for demanding sites.",
  Pro: "Advanced performance for demanding sites.",
};

const HOSTING_TYPES: HostingTypeOption[] = [
  {
    id: "web",
    title: "Web Hosting",
    description:
      "Fast, dependable hosting for websites of every size, with an easy control panel and built-in security.",
    idealFor: "Blogs • portfolios • small business sites",
    iconBg: "bg-blue-50 text-[#1787D4]",
    available: true,
  },
  //,
  // {
  //   id: "vps",
  //   title: "VPS Hosting",
  //   description:
  //     "Dedicated virtual resources and flexible server control for growing applications and advanced workloads.",
  //   idealFor: "Developers • ecommerce • custom apps",
  //   iconBg: "bg-indigo-50 text-indigo-600",
  //   available: false,
  // },
  // {
  //   id: "cloud",
  //   title: "Cloud Hosting",
  //   description:
  //     "Elastic infrastructure that scales with traffic and keeps business-critical experiences available.",
  //   idealFor: "High-traffic sites • SaaS • growing teams",
  //   iconBg: "bg-sky-50 text-sky-500",
  //   available: false,
  // },
  // {
  //   id: "wordpress",
  //   title: "Managed WordPress",
  //   description:
  //     "Optimized WordPress hosting with updates, backups, performance, and security managed for you.",
  //   idealFor: "WordPress sites • agencies • publishers",
  //   iconBg: "bg-teal-50 text-teal-600",
  //   available: false,
  // },
];

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ── SVG Graphics for Next Steps ────────────────────────────────────────────────

function WebsiteBuilderIllustration() {
  return (
    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-t-xl flex items-center justify-center p-3 relative overflow-hidden border-b border-gray-100">
      <div className="w-48 bg-white rounded-lg shadow-sm border border-gray-200/80 p-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 border-b border-gray-100 pb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <div className="ml-2 w-20 h-1.5 bg-gray-100 rounded" />
        </div>
        <div className="h-9 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded flex items-center justify-center">
          <div className="w-14 h-2 bg-blue-500/30 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-6 bg-gray-50 border border-gray-100 rounded" />
          <div className="h-6 bg-gray-50 border border-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

function DomainSetupIllustration() {
  return (
    <div className="w-full h-32 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 rounded-t-xl flex items-center justify-center p-3 relative overflow-hidden border-b border-gray-100">
      <div className="w-48 bg-white rounded-lg shadow-sm border border-gray-200/80 p-2.5 flex items-center justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          <Globe className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-20 h-2 bg-gray-200 rounded" />
          <div className="w-12 h-1.5 bg-teal-500/40 rounded" />
        </div>
        <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
          ✓
        </div>
      </div>
    </div>
  );
}

function EmailSetupIllustration() {
  return (
    <div className="w-full h-32 bg-gradient-to-br from-sky-50/80 to-blue-50/80 rounded-t-xl flex items-center justify-center p-3 relative overflow-hidden border-b border-gray-100">
      <div className="w-48 bg-white rounded-lg shadow-sm border border-gray-200/80 p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
            @
          </div>
          <div className="flex-1">
            <div className="w-16 h-2 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-gray-100 rounded w-full" />
          <div className="h-2 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

// ── Horizontal Stepper (Matching Domain Registration Wizard Design) ────────────

function StepperBar({ currentStep }: { currentStep: StepId }) {
  const getActiveStepNumber = (): number => {
    switch (currentStep) {
      case "hosting-type":
        return 1;
      case "plan":
        return 2;
      case "domain":
      case "details":
        return 3;
      case "review":
        return 4;
      case "payment":
      case "activating":
        return 5;
      case "ready":
      case "next-steps":
        return 6;
      default:
        return 1;
    }
  };

  const activeNum = getActiveStepNumber();

  return (
    <div className="w-full bg-white rounded-lg border border-[#e8e8ed] px-4 sm:px-8 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: "Hosting" },
          { num: 2, label: "Plan" },
          { num: 3, label: "Configure" },
          { num: 4, label: "Review" },
          { num: 5, label: "Payment" },
          { num: 6, label: "Done" },
        ].map((s, idx, arr) => {
          const isCompleted = activeNum > s.num;
          const isActive = activeNum === s.num;

          return (
            <div
              key={s.num}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isActive
                        ? "bg-[#1787D4] text-white"
                        : "bg-[#e5e7eb] text-[#6b7280]"
                  }`}
                >
                  {isCompleted ? "✓" : s.num}
                </div>
                <span
                  className={`text-[13px] font-medium whitespace-nowrap hidden sm:inline ${
                    isActive
                      ? "text-[#1787D4] font-semibold"
                      : isCompleted
                        ? "text-[#1d1d1f]"
                        : "text-[#9ca3af]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 transition-colors ${
                    isCompleted ? "bg-[#1787D4]" : "bg-[#e5e7eb]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Hosting Flow Component ────────────────────────────────────────────────

function HostingPurchaseFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<StepId>("hosting-type");
  const [selectedHostingType, setSelectedHostingType] =
    useState<HostingTypeId>("web");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [domainOption, setDomainOption] = useState<"existing" | "new">(
    "existing",
  );
  const [domainName, setDomainName] = useState<string>("");

  // Domain search state (referenced from Domain system)
  const [domainSearchQuery, setDomainSearchQuery] = useState<string>("");
  const [isSearchingDomain, setIsSearchingDomain] = useState<boolean>(false);
  const [domainSearchResult, setDomainSearchResult] =
    useState<DomainResult | null>(null);

  // Paystack redirect state
  const [isRedirectingToPaystack, setIsRedirectingToPaystack] =
    useState<boolean>(false);
  const { mutate: purchase, isPending: isPurchasing } = usePurchaseHosting();

  // Activating sequence steps & order tracking
  const [activatingStep, setActivatingStep] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>("");

  // User profile for personalized confirmation
  const { data: meData } = useGetMe();
  const userEmail = meData?.data?.email;

  // Handle return from Paystack if reference is in query params
  const urlReference =
    searchParams?.get("reference") || searchParams?.get("trxref");
  useEffect(() => {
    if (urlReference) {
      setOrderReference(urlReference);
      setCurrentStep("ready");
    }
  }, [urlReference]);

  // Load real plans from backend (Strictly API endpoint, zero fallback)
  const {
    data: plans,
    isLoading: loadingPlans,
    isError: plansError,
    refetch: refetchPlans,
  } = usePlans();

  // Selected plan state
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    if (!selectedPlanId && plans && plans.length > 0) {
      const popular = plans.find((p) => p.isPopular);
      setSelectedPlanId(popular ? popular.id : plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan =
    plans?.find((p) => p.id === selectedPlanId) || plans?.[0];
  const selectedHostingTypeObj =
    HOSTING_TYPES.find((h) => h.id === selectedHostingType) || HOSTING_TYPES[0];

  // Pricing calculations (NO TAX! 3 Durations: Monthly, Quarterly, Yearly)
  const hostingCost = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.price
      : billingCycle === "quarterly"
        ? selectedPlan.quarterlyPrice
        : selectedPlan.monthlyPrice
    : 0;

  const cycleText =
    billingCycle === "yearly"
      ? "1 year"
      : billingCycle === "quarterly"
        ? "3 months"
        : "1 month";

  const newDomainPrice = domainSearchResult?.price?.price ?? 0;
  const domainCost = domainOption === "new" ? newDomainPrice : 0;
  const grandTotal = hostingCost + domainCost;

  // Dynamic renewal date
  const renewalDateFormatted = (() => {
    const d = new Date();
    if (billingCycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    else if (billingCycle === "quarterly") d.setMonth(d.getMonth() + 3);
    else d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Real domain search handler (strictly consuming backend endpoint with zero fallback)
  const handleDomainSearch = async () => {
    const raw = domainSearchQuery.trim().toLowerCase();
    if (!raw) {
      toast.error("Please enter a domain to search.");
      return;
    }
    setIsSearchingDomain(true);
    try {
      const res = await searchDomains(raw);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const exact = res.data.find((d) => d.domain.toLowerCase() === raw);
        const match = exact || res.data[0];
        setDomainSearchResult(match);
      } else {
        setDomainSearchResult(null);
        toast.error("No domain results found from the server. Try a different name.");
      }
    } catch (err: unknown) {
      setDomainSearchResult(null);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to query domain availability.";
      toast.error(msg);
    } finally {
      setIsSearchingDomain(false);
    }
  };

  // Paystack Direct Checkout (strictly API, zero fallback bypass)
  const handlePaystackCheckout = () => {
    const cleanDomain = domainName.trim();
    if (!cleanDomain) {
      toast.error("Please specify a primary domain.");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a hosting plan first.");
      return;
    }

    setIsRedirectingToPaystack(true);

    purchase(
      {
        planId: selectedPlan.id,
        domain: cleanDomain,
        billingCycle,
      },
      {
        onSuccess: (res) => {
          if (res?.data?.paymentUrl) {
            setOrderReference(res.data.reference || "");
            setRecentHostingPurchase({
              domain: cleanDomain,
              planName: `${selectedPlan.name} Hosting`,
              planId: selectedPlan.id,
              reference: res.data.reference,
            });
            window.location.href = res.data.paymentUrl;
          } else {
            setIsRedirectingToPaystack(false);
            toast.error(
              res?.message || "No payment URL returned from the server.",
            );
          }
        },
        onError: (err: Error) => {
          setIsRedirectingToPaystack(false);
          toast.error(
            err?.message || "Payment initialization failed. Please try again.",
          );
        },
      },
    );
  };

  // Activation sequence timer effect
  useEffect(() => {
    if (currentStep === "activating") {
      setActivatingStep(1);
      const t1 = setTimeout(() => setActivatingStep(2), 1200);
      const t2 = setTimeout(() => setActivatingStep(3), 2600);
      const t3 = setTimeout(() => setActivatingStep(4), 3800);
      const t4 = setTimeout(() => {
        if (selectedPlan) {
          setRecentHostingPurchase({
            domain: domainName,
            planName: `${selectedPlan.name} Hosting`,
            planId: selectedPlan.id,
            reference: orderReference || "HOST-ORDER",
          });
        }
        setCurrentStep("ready");
      }, 5000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [currentStep, domainName, selectedPlan, orderReference]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Common Page Header
  // ─────────────────────────────────────────────────────────────────────────────
  const renderHeader = (
    title: string,
    subtitle: string,
    backAction: () => void,
    backText: string,
  ) => (
    <div>
      <button
        type="button"
        onClick={backAction}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        {backText}
      </button>
      <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1d1f] tracking-tight">
        {title}
      </h2>
      <p className="text-[13.5px] text-[#6e6e73] mt-0.5">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 1: Choose the right hosting for your website
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "hosting-type" && (
        <>
          {renderHeader(
            "Choose the right hosting for your website",
            "Select the hosting solution that fits your website, application, or business needs.",
            () => router.push("/dashboard/hosting"),
            "Back to hosting",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {HOSTING_TYPES.map((h) => (
              <div
                key={h.id}
                className="bg-white border border-[#e8e8ed] rounded-xl p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-[#1787D4]/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${h.iconBg}`}
                      >
                        {h.id === "web" && <Globe className="w-5 h-5" />}
                        {h.id === "vps" && <Server className="w-5 h-5" />}
                        {h.id === "cloud" && <Cloud className="w-5 h-5" />}
                        {h.id === "wordpress" && (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12.002 0a12 12 0 1 0 12 12 12.013 12.013 0 0 0-12-12zm0 23.04a11.04 11.04 0 1 1 11.04-11.04 11.053 11.053 0 0 1-11.04 11.04zm7.986-12.87c.07.493.104.996.104 1.503a8.1 8.1 0 0 1-1.636 4.908l-3.32-9.617c.563-.03 1.096-.062 1.096-.062a.455.455 0 0 0 0-.91s-1.396.114-2.302.114c-.875 0-2.27-.114-2.27-.114a.455.455 0 0 0 0 .91s.503.032 1.034.062l1.53 4.218-2.148 6.438-3.568-10.656c.563-.03 1.096-.062 1.096-.062a.455.455 0 1 0 0-.91s-1.396.114-2.302.114c-.219 0-.479-.008-.75-.018A8.136 8.136 0 0 1 12 3.868a8.1 8.1 0 0 1 6.55 3.332l-1.385 4.021a6.6 6.6 0 0 1 2.823-.051z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                          {h.title}
                        </h3>
                        {!h.available && (
                          <span className="bg-gray-100 text-[#64748b] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    {h.available ? (
                      <button
                        type="button"
                        className="text-xs text-[#1787D4] font-medium hover:underline"
                      >
                        Learn more
                      </button>
                    ) : (
                      <span className="text-xs text-[#94a3b8] font-medium">
                        Soon
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-[#6e6e73] mt-4 leading-relaxed">
                    {h.description}
                  </p>

                  <div className="mt-5">
                    <span className="text-[10px] font-semibold text-[#8a9bb5] uppercase tracking-wider block">
                      IDEAL FOR
                    </span>
                    <p className="text-xs text-[#334155] mt-0.5 font-medium">
                      {h.idealFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  {h.available ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHostingType(h.id);
                        setCurrentStep("plan");
                      }}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-[#1787D4] hover:bg-[#1372b5] text-white shadow-xs cursor-pointer"
                    >
                      View Plans →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#f8fafc] border border-gray-200 text-[#94a3b8] cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 2: Choose your hosting plan
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "plan" && (
        <>
          {renderHeader(
            "Choose your hosting plan",
            "Get the resources you need to keep your website fast, reliable, and ready to grow.",
            () => setCurrentStep("hosting-type"),
            "Back to hosting types",
          )}

          <StepperBar currentStep={currentStep} />

          {/* Loading Skeleton */}
          {loadingPlans && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 sm:p-7 border border-[#e8e8ed] shadow-xs animate-pulse flex flex-col justify-between min-h-[420px]"
                >
                  <div className="space-y-4">
                    <div className="h-6 w-28 bg-gray-200 rounded" />
                    <div className="h-8 w-36 bg-gray-200 rounded" />
                    <div className="h-4 w-48 bg-gray-100 rounded" />
                    <div className="pt-4 space-y-3">
                      <div className="h-4 w-3/4 bg-gray-100 rounded" />
                      <div className="h-4 w-2/3 bg-gray-100 rounded" />
                      <div className="h-4 w-4/5 bg-gray-100 rounded" />
                      <div className="h-4 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg mt-6" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loadingPlans && (plansError || !plans || plans.length === 0) && (
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto w-full shadow-xs">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-3">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f]">
                Unable to load hosting plans
              </h3>
              <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed">
                We couldn&apos;t retrieve the current hosting plans from the server. Please check your network and try again.
              </p>
              <button
                type="button"
                onClick={() => refetchPlans()}
                className="mt-4 px-5 py-2.5 bg-[#1787D4] hover:bg-[#1372b5] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Real API Plans */}
          {!loadingPlans && plans && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch w-full">
              {plans.map((p) => {
                const isRecommended = p.isPopular;
                const subtitle =
                  PLAN_DESCRIPTIONS[p.name] ||
                  "Fast caching, custom security setup, extra storage.";

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                      isRecommended
                        ? "border-2 border-[#1787D4] shadow-md ring-4 ring-[#1787D4]/5"
                        : "border border-[#e8e8ed] shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between min-h-[24px]">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">
                          {p.name}
                        </h3>
                        {isRecommended && (
                          <span className="bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#1d1d1f]">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-xs text-[#64748b] font-normal">
                          /year
                        </span>
                      </div>

                      <p className="text-[13px] text-[#6e6e73] mt-2 pb-4 border-b border-[#f0f4fc]">
                        {subtitle}
                      </p>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-[#334155]">
                          <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 stroke-[2.5]" />
                          <span>
                            {p.websites >= 999
                              ? "Unlimited websites"
                              : `${p.websites} website${p.websites > 1 ? "s" : ""}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#334155]">
                          <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 stroke-[2.5]" />
                          <span>{p.storage} storage</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#334155]">
                          <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 stroke-[2.5]" />
                          <span>{p.bandwidth} monthly traffic</span>
                        </div>

                        {p.features?.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-[#334155]"
                          >
                            <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 stroke-[2.5]" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-7">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          setCurrentStep("domain");
                        }}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isRecommended
                            ? "bg-[#1787D4] hover:bg-[#1372b5] text-white shadow-xs"
                            : "bg-white border border-[#dce4f7] text-[#1d1d1f] hover:bg-gray-50"
                        }`}
                      >
                        Choose Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 3: Set up your hosting (Domain Selection)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "domain" && (
        <>
          {renderHeader(
            "Set up your hosting",
            "Choose how you'd like to connect your hosting to your website.",
            () => setCurrentStep("plan"),
            "Back to plans",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column (8 cols): Domain Options */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Option 1: I already have a domain */}
              <div
                onClick={() => setDomainOption("existing")}
                className={`bg-white rounded-xl p-5 sm:p-6 border cursor-pointer transition-all ${
                  domainOption === "existing"
                    ? "border-[#1787D4] shadow-xs ring-2 ring-[#1787D4]/10"
                    : "border-[#e8e8ed] hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        domainOption === "existing"
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {domainOption === "existing" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                      I already have a domain
                    </h3>
                  </div>
                  {domainOption === "existing" && (
                    <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[#6e6e73] mt-1.5 ml-6.5">
                  Connect a domain you own to this {selectedPlan?.name || "Web"} hosting
                  plan.
                </p>

                {domainOption === "existing" && (
                  <div className="mt-4 ml-6.5 space-y-3">
                    <div>
                      <label className="text-[11.5px] font-semibold text-[#1d1d1f] block mb-1.5">
                        Domain name
                      </label>
                      <input
                        type="text"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder="yourbusiness.com"
                        className="w-full bg-[#f8fafc] border border-[#dce4f7] focus:border-[#1787D4] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-[#1d1d1f] outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11.5px] text-[#64748b]">
                      <Shield className="w-3.5 h-3.5 text-[#1787D4] shrink-0" />
                      <span>
                        We'll verify ownership and guide you through nameserver
                        updates after activation.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: I need a domain */}
              <div
                onClick={() => setDomainOption("new")}
                className={`bg-white rounded-xl p-5 sm:p-6 border cursor-pointer transition-all ${
                  domainOption === "new"
                    ? "border-[#1787D4] shadow-xs ring-2 ring-[#1787D4]/10"
                    : "border-[#e8e8ed] hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      domainOption === "new"
                        ? "border-[#1787D4] bg-[#1787D4]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {domainOption === "new" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    I need a domain
                  </h3>
                </div>
                <p className="text-[13px] text-[#6e6e73] mt-1.5 ml-6.5">
                  Search Nupat Cloud and add an available domain to this order.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-[13px] text-[#6e6e73]">
                  {domainName.trim() ? (
                    <>
                      {domainOption === "new"
                        ? "New domain: "
                        : "Existing domain: "}
                      <span className="font-semibold text-[#1d1d1f]">
                        {domainName.trim()}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#8a9bb2] italic">
                      No domain entered yet
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const clean = domainName.trim();
                    if (!clean) {
                      toast.error("Please enter a domain name to continue.");
                      return;
                    }
                    if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(clean)) {
                      toast.error(
                        "Please enter a valid domain name (e.g. yourbusiness.com).",
                      );
                      return;
                    }
                    setCurrentStep("details");
                  }}
                  className="bg-[#1787D4] hover:bg-[#1372b5] text-white px-7 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Right Column (4 cols): Search Domain Card */}
            <div className="lg:col-span-4 bg-white border border-[#e8e8ed] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1787D4] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1d1d1f]">
                    Need a new domain?
                  </h3>
                  <p className="text-[11px] text-[#6e6e73]">
                    Connect it straight to this order.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1d1d1f] block mb-1">
                  Search a domain
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainSearchQuery}
                    onChange={(e) => setDomainSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleDomainSearch();
                    }}
                    placeholder="e.g. mynewbrand.com"
                    className="flex-1 bg-[#f8fafc] border border-[#dce4f7] focus:border-[#1787D4] focus:bg-white rounded-lg px-3 py-2 text-xs text-[#1d1d1f] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleDomainSearch}
                    disabled={isSearchingDomain || !domainSearchQuery.trim()}
                    className="px-3 py-2 bg-[#1787D4] hover:bg-[#1372b5] text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-60 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isSearchingDomain ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {domainSearchResult && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span className="text-xs font-bold text-[#166534]">
                        {domainSearchResult.domain}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#15803d] mt-1">
                    {domainSearchResult.available
                      ? `Available • ${formatPrice(newDomainPrice)}/yr`
                      : "Unavailable"}
                  </p>
                </div>
              )}

              {domainSearchResult && domainSearchResult.available ? (
                <button
                  type="button"
                  onClick={() => {
                    setDomainName(domainSearchResult.domain);
                    setDomainOption("new");
                    setCurrentStep("details");
                  }}
                  className="w-full py-2.5 bg-white border border-[#1787D4] hover:bg-blue-50 text-[#1787D4] font-semibold rounded-lg text-xs transition-all cursor-pointer"
                >
                  Use {domainSearchResult.domain} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDomainSearch}
                  disabled={isSearchingDomain || !domainSearchQuery.trim()}
                  className="w-full py-2.5 bg-white border border-[#dce4f7] hover:bg-gray-50 text-[#1d1d1f] rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Continue to Domain Search →
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 4: Hosting details (3 DURATIONS: Monthly, Quarterly, Yearly)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "details" && (
        <>
          {renderHeader(
            "Hosting details",
            "Confirm your plan, billing cycle, and renewal preferences.",
            () => setCurrentStep("domain"),
            "Back to domain setup",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="w-full bg-white border border-[#e8e8ed] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header: Plan & Domain */}
            <div className="flex items-center justify-between pb-5 border-b border-[#f0f4fc]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f]">
                    {selectedPlan?.name || "Web"} Hosting
                  </h3>
                  <p className="text-xs text-[#6e6e73]">
                    {selectedHostingTypeObj.title} • {domainName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep("plan")}
                className="text-xs font-semibold text-[#1787D4] hover:underline cursor-pointer"
              >
                Change plan
              </button>
            </div>

            {/* 3 Durations: Monthly, Quarterly, Yearly */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#1d1d1f]">
                  Billing cycle
                </h3>
                <span className="text-[11px] text-[#6e6e73]">
                  Choose from 3 billing durations
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Monthly */}
                <div
                  onClick={() => setBillingCycle("monthly")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    billingCycle === "monthly"
                      ? "border-[#1787D4] bg-[#eff6fb]/40 ring-2 ring-[#1787D4]/10"
                      : "border-[#e8e8ed] hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1d1d1f]">Monthly</p>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        billingCycle === "monthly"
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-gray-300"
                      }`}
                    >
                      {billingCycle === "monthly" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm font-bold text-[#1d1d1f]">
                      {selectedPlan ? formatPrice(selectedPlan.monthlyPrice) : "—"}
                    </span>
                    <span className="text-[11px] text-[#6e6e73]"> /month</span>
                    <p className="text-[10.5px] text-[#8a9bb2] mt-0.5">
                      Billed monthly
                    </p>
                  </div>
                </div>

                {/* 2. Quarterly */}
                <div
                  onClick={() => setBillingCycle("quarterly")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    billingCycle === "quarterly"
                      ? "border-[#1787D4] bg-[#eff6fb]/40 ring-2 ring-[#1787D4]/10"
                      : "border-[#e8e8ed] hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1d1d1f]">
                      Quarterly
                    </p>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        billingCycle === "quarterly"
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-gray-300"
                      }`}
                    >
                      {billingCycle === "quarterly" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm font-bold text-[#1d1d1f]">
                      {selectedPlan ? formatPrice(selectedPlan.quarterlyPrice) : "—"}
                    </span>
                    <span className="text-[11px] text-[#6e6e73]">
                      {" "}
                      /3 months
                    </span>
                    <p className="text-[10.5px] text-[#8a9bb2] mt-0.5">
                      ~
                      {selectedPlan ? formatPrice(Math.round(selectedPlan.quarterlyPrice / 3)) : "—"}
                      /mo equivalent
                    </p>
                  </div>
                </div>

                {/* 3. Yearly */}
                <div
                  onClick={() => setBillingCycle("yearly")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    billingCycle === "yearly"
                      ? "border-[#1787D4] bg-[#eff6fb]/40 ring-2 ring-[#1787D4]/10"
                      : "border-[#e8e8ed] hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#1d1d1f]">Yearly</p>
                      <span className="text-[9.5px] font-bold bg-[#e0f2fe] text-[#0284c7] px-1.5 py-0.2 rounded">
                        Best value
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        billingCycle === "yearly"
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-gray-300"
                      }`}
                    >
                      {billingCycle === "yearly" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm font-bold text-[#1d1d1f]">
                      {selectedPlan ? formatPrice(selectedPlan.price) : "—"}
                    </span>
                    <span className="text-[11px] text-[#6e6e73]"> /year</span>
                    <p className="text-[10.5px] text-[#16a34a] font-medium mt-0.5">
                      Includes 1 free SSL certificate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Renewal Section */}
            <div className="pt-4 border-t border-[#f0f4fc] flex items-center justify-between">
              <div className="flex items-start gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1d1d1f]">
                    Auto-Renewal
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73] mt-0.5 leading-relaxed">
                    Would you like to renew your hosting automatically before it
                    expires using your saved payment method?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  autoRenew ? "bg-[#1787D4]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoRenew ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Footer Bar */}
            <div className="pt-4 border-t border-[#f0f4fc] flex items-center justify-between">
              <span
                className={`text-xs font-medium ${
                  autoRenew ? "text-[#16a34a]" : "text-gray-400"
                }`}
              >
                {autoRenew ? "Auto-Renewal is on" : "Auto-Renewal is off"}
              </span>

              <button
                type="button"
                onClick={() => setCurrentStep("review")}
                className="bg-[#1787D4] hover:bg-[#1372b5] text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Continue to Review
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 5: Review your hosting (No Tax!)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "review" && (
        <>
          {renderHeader(
            "Review your hosting",
            "Check your plan, domain, and final pricing before payment.",
            () => setCurrentStep("details"),
            "Back to hosting details",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column (8 cols): Plan Details */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="bg-white border border-[#e8e8ed] rounded-xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#1d1d1f]">
                      {selectedPlan?.name || "Web"} Hosting
                    </h3>
                    <p className="text-xs text-[#6e6e73] mt-0.5">
                      {selectedHostingTypeObj.title} • {cycleText} billing
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("details")}
                    className="text-xs font-semibold text-[#1787D4] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-[#f8fafc] border border-[#e8e8ed] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                      Domain
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block truncate">
                      {domainName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                      Plan
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block">
                      {selectedPlan?.name || "Web"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                      Billing
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block capitalize">
                      {billingCycle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                      Auto-Renewal
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block">
                      {autoRenew ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#f0f4fc]">
                  <span className="text-[11px] font-bold text-[#1d1d1f] block mb-2.5">
                    Included with your plan
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#334155]">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#16a34a] stroke-[2.5]" />
                      <span>Free SSL Certificate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#16a34a] stroke-[2.5]" />
                      <span>Daily backups</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#16a34a] stroke-[2.5]" />
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary (NO TAX!) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="bg-white border border-[#e8e8ed] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                  Order summary
                </h3>

                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between items-center text-[#6e6e73]">
                    <span>
                      {selectedPlan?.name || "Web"} Hosting • {cycleText}
                    </span>
                    <span className="font-semibold text-[#1d1d1f]">
                      {formatPrice(hostingCost)}
                    </span>
                  </div>

                  {domainOption === "new" ? (
                    <div className="flex justify-between items-center text-[#6e6e73]">
                      <span>{domainName} • 1 year</span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {formatPrice(newDomainPrice)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[#6e6e73]">
                      <span>{domainName}</span>
                      <span className="text-[#16a34a] font-medium">
                        Existing
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[#6e6e73]">
                    <span>SSL Certificate</span>
                    <span className="text-[#16a34a] font-medium">Included</span>
                  </div>

                  <div className="border-t border-[#f0f4fc] pt-2 flex justify-between items-center text-[#6e6e73]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1d1d1f]">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>

                  <div className="border-t border-[#e8e8ed] pt-2.5 flex justify-between items-center text-[16px]">
                    <span className="font-bold text-[#1d1d1f]">Total</span>
                    <span className="font-bold text-[#1787D4]">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep("payment")}
                  className="w-full py-3 bg-[#1787D4] hover:bg-[#1372b5] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Proceed to Payment
                </button>
              </div>

              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 text-[11px] text-[#166534] flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span>
                  Hosting setup starts immediately after payment is confirmed.
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 6: Complete your payment (PAYSTACK ONLY)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "payment" && (
        <>
          {renderHeader(
            "Complete your payment",
            "Choose your preferred payment method to activate your hosting.",
            () => setCurrentStep("review"),
            "Back to Review",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column (8 cols): Paystack Payment Method Card */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white border border-[#e8e8ed] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                    Payment method
                  </h3>
                  <p className="text-[13px] text-[#6e6e73] mt-0.5">
                    Your payment details are encrypted and handled securely.
                  </p>

                  <div className="mt-4 p-4 sm:p-5 rounded-xl border-2 border-[#1787D4] bg-[#f8fbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-5 h-5 rounded-full border-4 border-[#1787D4] bg-white flex items-center justify-center shrink-0" />
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-auto flex items-center shrink-0">
                          <Image
                            src="/paystack-logo.png"
                            alt="Paystack"
                            width={110}
                            height={28}
                            className="h-7 w-auto object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1d1d1f]">
                            Paystack
                          </p>
                          <p className="text-xs text-[#6e6e73]">
                            Pay with debit/credit card, bank transfer, USSD, or
                            Apple Pay
                          </p>
                        </div>
                      </div>
                    </div>

                    <span className="self-start sm:self-center text-[11px] font-bold text-[#1787D4] bg-[#e6f4fc] px-2.5 py-1 rounded-full shrink-0">
                      Primary Gateway
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-start gap-3 text-xs text-[#6e6e73]">
                  <Shield className="w-5 h-5 text-[#1787D4] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">
                      Direct & Secure Paystack Checkout
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      Clicking &ldquo;Pay with Paystack&rdquo; will direct you
                      straight to Paystack&apos;s certified payment gateway to
                      complete the transaction. No card details are ever stored
                      on our servers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secured with encrypted payment processing.</span>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary (NO TAX!) */}
            <div className="lg:col-span-4 bg-white border border-[#e8e8ed] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Order summary
              </h3>

              <div className="flex items-start gap-3 pb-3 border-b border-[#f0f4fc]">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1d1d1f] truncate">
                    {selectedPlan?.name || "Web"} Hosting
                  </p>
                  <p className="text-[11px] text-[#6e6e73] truncate">
                    {domainName} • {cycleText}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-[#6e6e73]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                <div className="border-t border-[#e8e8ed] pt-2 flex justify-between items-center text-[16px]">
                  <span className="font-bold text-[#1d1d1f]">Total</span>
                  <span className="font-bold text-[#1787D4]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isRedirectingToPaystack || isPurchasing}
                onClick={handlePaystackCheckout}
                className="w-full py-3 bg-[#1787D4] hover:bg-[#1372b5] text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isRedirectingToPaystack || isPurchasing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting to Paystack…
                  </>
                ) : (
                  `Pay ${formatPrice(grandTotal)} with Paystack`
                )}
              </button>

              <p className="text-[10px] text-center text-[#94a3b8] leading-tight">
                By paying, you authorize this charge and agree to the hosting
                terms.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 7: Activating your hosting... (Provisioning state)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "activating" && (
        <div className="w-full flex flex-col gap-6 items-center">
          <div className="w-full text-left">
            {renderHeader(
              "Activating your hosting...",
              "We're setting up your hosting environment. This may take a moment.",
              () => setCurrentStep("payment"),
              "Back to Payment",
            )}
          </div>

          <StepperBar currentStep={currentStep} />

          <div className="w-full max-w-2xl bg-white border border-[#e8e8ed] rounded-xl p-8 sm:p-10 shadow-xs text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center text-[#1787D4] mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-[19px] font-bold text-[#1d1d1f]">
              Preparing {selectedPlan?.name || "Web"} Hosting
            </h3>
            <p className="text-[13px] text-[#6e6e73] max-w-md mx-auto mt-1 leading-relaxed">
              Your order is confirmed. We're securely provisioning resources and
              connecting your domain.
            </p>

            <div className="mt-8 space-y-3.5 text-left max-w-md mx-auto">
              {/* Step 1: Payment confirmed */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1d1d1f]">
                    Payment confirmed
                  </p>
                  <p className="text-[10px] text-[#64748b]">
                    {formatPrice(grandTotal)} received via Paystack
                  </p>
                </div>
              </div>

              {/* Step 2: Creating hosting account */}
              <div className="flex items-center gap-3">
                {activatingStep > 1 ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#1787D4] text-[#1787D4] flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-[#1d1d1f]">
                    Creating hosting account
                  </p>
                  <p className="text-[10px] text-[#64748b]">
                    Provisioning {selectedPlan?.name || "Web"} hosting...
                  </p>
                </div>
              </div>

              {/* Step 3: Connecting domain */}
              <div className="flex items-center gap-3">
                {activatingStep > 2 ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </div>
                ) : activatingStep === 2 ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#1787D4] text-[#1787D4] flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-[#1d1d1f]">
                    Connecting domain
                  </p>
                  <p className="text-[10px] text-[#64748b]">
                    Preparing {domainName}
                  </p>
                </div>
              </div>

              {/* Step 4: Activating services */}
              <div className="flex items-center gap-3">
                {activatingStep > 3 ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </div>
                ) : activatingStep === 3 ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#1787D4] text-[#1787D4] flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-[#1d1d1f]">
                    Activating services
                  </p>
                  <p className="text-[10px] text-[#64748b]">
                    SSL, backups, and control panel
                  </p>
                </div>
              </div>
            </div>

            {orderReference && (
              <div className="mt-8 bg-[#f8fafc] border border-[#e8e8ed] rounded-lg p-3 flex items-center justify-between text-xs max-w-md mx-auto">
                <span className="text-[#64748b]">Order reference</span>
                <span className="font-mono font-bold text-[#1d1d1f]">
                  {orderReference}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-center text-[#94a3b8]">
            This usually takes less than a minute. You can safely leave this
            page once activation is complete.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 8: Your hosting is ready! (Using official /checkmark.svg)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "ready" && (
        <div className="w-full flex flex-col gap-6 items-center">
          <div className="w-full text-left">
            {renderHeader(
              "Your hosting is ready!",
              `${selectedPlan?.name || "Web"} Hosting is active and connected to ${domainName}.`,
              () => setCurrentStep("activating"),
              "Back to activation",
            )}
          </div>

          <StepperBar currentStep={currentStep} />

          <div className="w-full max-w-3xl bg-white border border-[#e8e8ed] rounded-xl p-8 sm:p-10 shadow-xs text-center flex flex-col items-center">
            {/* The 3D checkmark SVG (matches Domain registration completed screen) */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/checkmark.svg"
                alt="Hosting Ready"
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                priority
              />
            </div>

            <h3 className="text-[20px] sm:text-[23px] font-bold text-[#1d1d1f]">
              Your hosting is ready!
            </h3>
            <p className="text-[13.5px] text-[#6e6e73] mt-1 max-w-lg leading-relaxed">
              Your website now has a secure, reliable home on Nupat Cloud.
            </p>

            <div className="w-full mt-6 bg-[#f8fafc] border border-[#e8e8ed] rounded-xl p-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1d1f]">
                      {selectedPlan?.name || "Web"} Hosting
                    </h4>
                    <p className="text-[11px] text-[#64748b]">{domainName}</p>
                  </div>
                </div>
                <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                    Domain
                  </span>
                  <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block truncate">
                    {domainName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                    Plan
                  </span>
                  <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block">
                    {selectedPlan?.name || "Web"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                    Renewal
                  </span>
                  <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block">
                    {renewalDateFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8a9bb5] block">
                    Auto-Renew
                  </span>
                  <span className="text-xs font-bold text-[#1d1d1f] mt-0.5 block">
                    {autoRenew ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 justify-center mt-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentStep("next-steps")}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1787D4] hover:bg-[#1372b5] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Manage Hosting
              </button>
              <Link
                href="/dashboard/hosting"
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#dce4f7] hover:bg-gray-50 text-[#1d1d1f] rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center"
              >
                Open Control Panel
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-all inline-flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          <div className="w-full max-w-3xl bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-3 text-xs text-[#065f46] flex items-center justify-center gap-2 text-center">
            <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>
              A hosting receipt and access details were sent to{" "}
              {userEmail || (domainName ? `admin@${domainName}` : "your registered email")}.
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 9: Your website is ready for the next step. (Onboarding)
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "next-steps" && (
        <>
          {renderHeader(
            "Your website is ready for the next step.",
            `Choose what you'd like to set up next for ${domainName}.`,
            () => router.push("/dashboard/hosting"),
            "Back to Hosting",
          )}

          <div className="bg-white border border-[#e8e8ed] rounded-xl p-4 flex items-center justify-between shadow-xs mt-2 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1d1d1f]">
                  {selectedPlan?.name || "Web"} Hosting
                </h3>
                <p className="text-[11px] text-[#6e6e73]">
                  {domainName} • activated {todayFormatted}
                </p>
              </div>
            </div>

            <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {/* Card 1: Build Your Website */}
            <div className="bg-white border border-[#e8e8ed] rounded-xl shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#1787D4]/40 transition-all">
              <WebsiteBuilderIllustration />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f]">
                    Build Your Website
                  </h3>
                  <p className="text-xs text-[#6e6e73] mt-2 leading-relaxed">
                    Choose a professionally designed template and publish your
                    first pages without writing code.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/hosting")}
                    className="w-full py-2.5 bg-[#1787D4] hover:bg-[#1372b5] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    Create Website
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Set Up Your Domain */}
            <div className="bg-white border border-[#e8e8ed] rounded-xl shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#1787D4]/40 transition-all">
              <DomainSetupIllustration />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f]">
                    Set Up Your Domain
                  </h3>
                  <p className="text-xs text-[#6e6e73] mt-2 leading-relaxed">
                    Review DNS, nameservers, redirects, and connection settings
                    for {domainName}.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/dashboard/domains"
                    className="w-full py-2.5 bg-white border border-[#dce4f7] hover:bg-gray-50 text-[#1d1d1f] rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center"
                  >
                    Manage Domain
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Set Up Email */}
            <div className="bg-white border border-[#e8e8ed] rounded-xl shadow-xs flex flex-col justify-between overflow-hidden hover:border-[#1787D4]/40 transition-all">
              <EmailSetupIllustration />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f]">
                    Set Up Email
                  </h3>
                  <p className="text-xs text-[#6e6e73] mt-2 leading-relaxed">
                    Build trust with a professional address like hello@
                    {domainName}.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/dashboard/email"
                    className="w-full py-2.5 bg-white border border-[#dce4f7] hover:bg-gray-50 text-[#1d1d1f] rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center"
                  >
                    Set Up Email
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e8e8ed] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1d1d1f]">
                Prefer to explore first?
              </h3>
              <p className="text-[11px] text-[#6e6e73]">
                You can return to these setup options anytime from your hosting
                dashboard.
              </p>
            </div>
            <Link
              href="/dashboard/hosting"
              className="text-xs font-semibold text-[#1787D4] hover:underline shrink-0"
            >
              Go to Dashboard →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ── Export Default with Suspense Wrapper ───────────────────────────────────────

export default function HostingPurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
          <Loader2 className="w-7 h-7 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5a6a85]">Loading hosting setup...</p>
        </div>
      }
    >
      <HostingPurchaseFlow />
    </Suspense>
  );
}
