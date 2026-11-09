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
import { searchDomains, type DomainResult } from "@/lib/api";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";
import {
  GATEWAY_NAME,
  connectingLabel,
  payLabel,
  redirectToPayment,
} from "@/lib/payments";

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
    idealFor: "Blogs, portfolios, small business sites",
    iconBg: "text-[#5A6A85]",
    available: true,
  },
  {
    id: "vps",
    title: "VPS Hosting",
    description:
      "Dedicated virtual resources and flexible server control for growing applications and advanced workloads.",
    idealFor: "Developers, ecommerce, custom apps",
    iconBg: "text-[#5A6A85]",
    available: false,
  },
  {
    id: "cloud",
    title: "Cloud Hosting",
    description:
      "Elastic infrastructure that scales with traffic and keeps business-critical experiences available.",
    idealFor: "High-traffic sites, SaaS, growing teams",
    iconBg: "text-[#5A6A85]",
    available: false,
  },
  {
    id: "wordpress",
    title: "Managed WordPress",
    description:
      "Optimized WordPress hosting with updates, backups, performance, and security managed for you.",
    idealFor: "WordPress sites, agencies, publishers",
    iconBg: "text-[#5A6A85]",
    available: false,
  },
];

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ── SVG Graphics for Next Steps ────────────────────────────────────────────────

function WebsiteBuilderIllustration() {
  return (
    <div className="w-full h-32 bg-[#F2F5FC] flex items-center justify-center p-3 relative overflow-hidden border-b border-[#EEF2F7]">
      <div className="w-48 bg-white rounded-lg border border-[#E2E8F0] p-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 border-b border-[#EEF2F7] pb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D5DCE6]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D5DCE6]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D5DCE6]" />
          <div className="ml-2 w-20 h-1.5 bg-[#F2F5FC] rounded" />
        </div>
        <div className="h-9 bg-[#E8F4FC] rounded flex items-center justify-center">
          <div className="w-14 h-2 bg-[#1787D4]/30 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-6 bg-[#F2F5FC] border border-[#EEF2F7] rounded" />
          <div className="h-6 bg-[#F2F5FC] border border-[#EEF2F7] rounded" />
        </div>
      </div>
    </div>
  );
}

function DomainSetupIllustration() {
  return (
    <div className="w-full h-32 bg-[#F2F5FC] flex items-center justify-center p-3 relative overflow-hidden border-b border-[#EEF2F7]">
      <div className="w-48 bg-white rounded-lg border border-[#E2E8F0] p-2.5 flex items-center justify-between gap-2">
        <Globe className="w-4 h-4 text-[#5A6A85] shrink-0" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-20 h-2 bg-[#EEF2F7] rounded" />
          <div className="w-12 h-1.5 bg-[#1787D4]/30 rounded" />
        </div>
        <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0" />
      </div>
    </div>
  );
}

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
    <div className="w-full bg-white rounded-xl border border-[#E2E8F0] px-4 sm:px-6 py-3.5">
      <ol className="flex items-center justify-between overflow-x-auto gap-2">
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
            <li
              key={s.num}
              className="flex items-center flex-1 last:flex-none"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 tabular-nums transition-colors ${
                    isCompleted
                      ? "bg-[#E8F4FC] text-[#1787D4]"
                      : isActive
                        ? "bg-[#1787D4] text-white"
                        : "bg-[#EEF2F7] text-[#5A6A85]"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : s.num}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap hidden sm:inline ${
                    isActive || isCompleted ? "text-[#031033]" : "text-[#5A6A85]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-colors ${
                    isCompleted ? "bg-[#1787D4]" : "bg-[#E2E8F0]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
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

  // Payment gateway redirect state
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const { mutate: purchase, isPending: isPurchasing } = usePurchaseHosting();
  const payment = usePaymentMethod();

  // Activating sequence steps & order tracking
  const [activatingStep, setActivatingStep] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>("");

  // User profile for personalized confirmation
  const { data: meData } = useGetMe();
  const userEmail = meData?.data?.email;

  // Handle return from the payment page if reference is in query params
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
        toast.error(
          "No domain results found from the server. Try a different name.",
        );
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

  const handleCheckout = () => {
    const cleanDomain = domainName.trim();
    if (!cleanDomain) {
      toast.error("Please specify a primary domain.");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a hosting plan first.");
      return;
    }

    setIsRedirecting(true);

    purchase(
      {
        planId: selectedPlan.id,
        domain: cleanDomain,
        billingCycle,
        provider: payment.method,
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
            redirectToPayment(res.data);
          } else {
            setIsRedirecting(false);
            toast.error(
              res?.message || "No payment URL returned from the server.",
            );
          }
        },
        onError: (err: Error) => {
          setIsRedirecting(false);
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
        if (selectedPlan && orderReference) {
          setRecentHostingPurchase({
            domain: domainName,
            planName: `${selectedPlan.name} Hosting`,
            planId: selectedPlan.id,
            reference: orderReference,
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer mb-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
      >
        <ArrowLeft className="w-4 h-4" />
        {backText}
      </button>
      <h1 className="text-2xl font-semibold text-[#031033]">
        {title}
      </h1>
      <p className="text-sm text-[#5A6A85] mt-1">{subtitle}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {HOSTING_TYPES.map((h) => (
              <div
                key={h.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between transition-colors hover:border-[#D5DCE6]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`shrink-0 ${h.iconBg}`}>
                        {h.id === "web" && <Globe className="w-5 h-5" />}
                        {h.id === "vps" && <Server className="w-5 h-5" />}
                        {h.id === "cloud" && <Cloud className="w-5 h-5" />}
                        {h.id === "wordpress" && (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12.002 0a12 12 0 1 0 12 12 12.013 12.013 0 0 0-12-12zm0 23.04a11.04 11.04 0 1 1 11.04-11.04 11.053 11.053 0 0 1-11.04 11.04zm7.986-12.87c.07.493.104.996.104 1.503a8.1 8.1 0 0 1-1.636 4.908l-3.32-9.617c.563-.03 1.096-.062 1.096-.062a.455.455 0 0 0 0-.91s-1.396.114-2.302.114c-.875 0-2.27-.114-2.27-.114a.455.455 0 0 0 0 .91s.503.032 1.034.062l1.53 4.218-2.148 6.438-3.568-10.656c.563-.03 1.096-.062 1.096-.062a.455.455 0 1 0 0-.91s-1.396.114-2.302.114c-.219 0-.479-.008-.75-.018A8.136 8.136 0 0 1 12 3.868a8.1 8.1 0 0 1 6.55 3.332l-1.385 4.021a6.6 6.6 0 0 1 2.823-.051z" />
                          </svg>
                        )}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-[#031033]">
                          {h.title}
                        </h3>
                        {!h.available && (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#5A6A85]">
                            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA6B8]" />
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>
                    {h.available && (
                      <Link
                        href="/hosting"
                        className="text-sm text-[#1787D4] font-medium hover:underline shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                      >
                        Learn more
                      </Link>
                    )}
                  </div>

                  <p className="text-sm text-[#5A6A85] mt-3 leading-relaxed">
                    {h.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-xs text-[#5A6A85] block">
                      Ideal for
                    </span>
                    <p className="text-sm text-[#031033] mt-0.5">
                      {h.idealFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  {h.available ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHostingType(h.id);
                        setCurrentStep("plan");
                      }}
                      className="w-full h-9 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors bg-[#1787D4] hover:bg-[#1370B5] text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                    >
                      View plans →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full h-9 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-[#F2F5FC] border border-[#E2E8F0] text-[#5A6A85] cursor-not-allowed"
                    >
                      Coming soon
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-[#E2E8F0] animate-pulse flex flex-col justify-between min-h-[420px]"
                >
                  <div className="space-y-4">
                    <div className="h-5 w-28 bg-[#EEF2F7] rounded" />
                    <div className="h-7 w-36 bg-[#EEF2F7] rounded" />
                    <div className="h-4 w-48 bg-[#EEF2F7] rounded" />
                    <div className="pt-4 space-y-3">
                      <div className="h-4 w-3/4 bg-[#EEF2F7] rounded" />
                      <div className="h-4 w-2/3 bg-[#EEF2F7] rounded" />
                      <div className="h-4 w-4/5 bg-[#EEF2F7] rounded" />
                      <div className="h-4 w-1/2 bg-[#EEF2F7] rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-full bg-[#EEF2F7] rounded-lg mt-6" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loadingPlans && (plansError || !plans || plans.length === 0) && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-lg mx-auto w-full">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Unable to load hosting plans
                  </h3>
                  <p className="text-sm text-[#5A6A85] mt-1 leading-relaxed">
                    We couldn&apos;t retrieve the current hosting plans from the
                    server. Please check your network and try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchPlans()}
                    className="mt-4 h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real API Plans */}
          {!loadingPlans && plans && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch w-full">
              {plans.map((p) => {
                const isRecommended = p.isPopular;
                const subtitle =
                  PLAN_DESCRIPTIONS[p.name] ||
                  "Fast caching, custom security setup, extra storage.";

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-xl p-6 flex flex-col justify-between relative border ${
                      isRecommended
                        ? "border-[#1787D4] ring-1 ring-[#1787D4]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between min-h-6">
                        <h3 className="text-base font-semibold text-[#031033]">
                          {p.name}
                        </h3>
                        {isRecommended && (
                          <span className="text-xs font-medium text-[#1370B5] whitespace-nowrap">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-sm text-[#5A6A85]">
                          /year
                        </span>
                      </div>

                      <p className="text-sm text-[#5A6A85] mt-2 pb-4 border-b border-[#EEF2F7]">
                        {subtitle}
                      </p>

                      <ul className="mt-4 space-y-2.5">
                        <li className="flex items-center gap-2 text-sm text-[#031033]">
                          <Check className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                          <span>
                            {p.websites >= 999
                              ? "Unlimited websites"
                              : `${p.websites} website${p.websites > 1 ? "s" : ""}`}
                          </span>
                        </li>

                        <li className="flex items-center gap-2 text-sm text-[#031033]">
                          <Check className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                          <span>{p.storage} storage</span>
                        </li>

                        <li className="flex items-center gap-2 text-sm text-[#031033]">
                          <Check className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                          <span>{p.bandwidth} monthly traffic</span>
                        </li>

                        {p.features?.map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-[#031033]"
                          >
                            <Check className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          setCurrentStep("domain");
                        }}
                        className={`w-full h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                          isRecommended
                            ? "bg-[#1787D4] hover:bg-[#1370B5] text-white"
                            : "bg-white border border-[#D5DCE6] text-[#031033] hover:bg-[#F2F5FC]"
                        }`}
                      >
                        Choose plan
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
                className={`bg-white rounded-xl p-5 border cursor-pointer transition-colors ${
                  domainOption === "existing"
                    ? "border-[#1787D4] ring-1 ring-[#1787D4]"
                    : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      domainOption === "existing"
                        ? "border-[#1787D4] bg-[#1787D4]"
                        : "border-[#D5DCE6] bg-white"
                    }`}
                  >
                    {domainOption === "existing" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    I already have a domain
                  </h3>
                </div>

                <p className="text-sm text-[#5A6A85] mt-1.5 ml-6.5">
                  Connect a domain you own to this {selectedPlan?.name || "Web"}{" "}
                  hosting plan.
                </p>

                {domainOption === "existing" && (
                  <div className="mt-4 ml-6.5 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-[#031033] block mb-1.5">
                        Domain name
                      </label>
                      <input
                        type="text"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder="yourbusiness.com"
                        className="w-full h-10 bg-white border border-[#D5DCE6] focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 rounded-lg px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
                      <Shield className="w-3.5 h-3.5 text-[#5A6A85] shrink-0" />
                      <span>
                        We&apos;ll verify ownership and guide you through nameserver
                        updates after activation.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: I need a domain */}
              <div
                onClick={() => setDomainOption("new")}
                className={`bg-white rounded-xl p-5 border cursor-pointer transition-colors ${
                  domainOption === "new"
                    ? "border-[#1787D4] ring-1 ring-[#1787D4]"
                    : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      domainOption === "new"
                        ? "border-[#1787D4] bg-[#1787D4]"
                        : "border-[#D5DCE6] bg-white"
                    }`}
                  >
                    {domainOption === "new" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    I need a domain
                  </h3>
                </div>
                <p className="text-sm text-[#5A6A85] mt-1.5 ml-6.5">
                  Search Nupat Cloud and add an available domain to this order.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-sm text-[#5A6A85] min-w-0 truncate">
                  {domainName.trim() ? (
                    <>
                      {domainOption === "new"
                        ? "New domain: "
                        : "Existing domain: "}
                      <span className="font-medium text-[#031033]">
                        {domainName.trim()}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#5A6A85]">
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
                  className="bg-[#1787D4] hover:bg-[#1370B5] text-white h-9 px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Right Column (4 cols): Search Domain Card */}
            <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Need a new domain?
                </h3>
                <p className="text-sm text-[#5A6A85] mt-0.5">
                  Connect it straight to this order.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
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
                    className="flex-1 min-w-0 h-10 bg-white border border-[#D5DCE6] focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 rounded-lg px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleDomainSearch}
                    disabled={isSearchingDomain || !domainSearchQuery.trim()}
                    aria-label="Search domain"
                    className="w-10 h-10 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {isSearchingDomain ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {domainSearchResult && (
                <div
                  className={`rounded-lg border px-4 py-3 ${
                    domainSearchResult.available
                      ? "bg-[#E7F6EC] border-[#0E7C3A]/20"
                      : "bg-[#FDECEC] border-[#DC2626]/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {domainSearchResult.available ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#DC2626] shrink-0" />
                    )}
                    <span className="text-sm font-medium text-[#031033] truncate">
                      {domainSearchResult.domain}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 tabular-nums ${
                      domainSearchResult.available ? "text-[#0E7C3A]" : "text-[#C21F1F]"
                    }`}
                  >
                    {domainSearchResult.available
                      ? `Available · ${formatPrice(newDomainPrice)}/yr`
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
                  className="w-full h-9 text-[#1787D4] hover:bg-[#E8F4FC] font-medium rounded-lg text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Use {domainSearchResult.domain} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDomainSearch}
                  disabled={isSearchingDomain || !domainSearchQuery.trim()}
                  className="w-full h-9 bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] text-[#031033] rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Continue to domain search →
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

          <div className="w-full bg-white border border-[#E2E8F0] rounded-xl">
            {/* Header: Plan & Domain */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
              <div className="flex items-center gap-2.5 min-w-0">
                <Server className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#031033]">
                    {selectedPlan?.name || "Web"} Hosting
                  </h3>
                  <p className="text-sm text-[#5A6A85] truncate">
                    {selectedHostingTypeObj.title} · {domainName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep("plan")}
                className="text-sm font-medium text-[#1787D4] hover:underline cursor-pointer shrink-0"
              >
                Change plan
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* 3 Durations: Monthly, Quarterly, Yearly */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="text-sm font-medium text-[#031033]">
                    Billing cycle
                  </h3>
                  <span className="text-xs text-[#5A6A85]">
                    Choose from 3 billing durations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Monthly */}
                  <div
                    onClick={() => setBillingCycle("monthly")}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between ${
                      billingCycle === "monthly"
                        ? "border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#031033]">Monthly</p>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          billingCycle === "monthly"
                            ? "border-[#1787D4] bg-[#1787D4]"
                            : "border-[#D5DCE6] bg-white"
                        }`}
                      >
                        {billingCycle === "monthly" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-base font-semibold text-[#031033] tabular-nums">
                        {selectedPlan
                          ? formatPrice(selectedPlan.monthlyPrice)
                          : "—"}
                      </span>
                      <span className="text-xs text-[#5A6A85]"> /month</span>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        Billed monthly
                      </p>
                    </div>
                  </div>

                  {/* 2. Quarterly */}
                  <div
                    onClick={() => setBillingCycle("quarterly")}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between ${
                      billingCycle === "quarterly"
                        ? "border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#031033]">
                        Quarterly
                      </p>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          billingCycle === "quarterly"
                            ? "border-[#1787D4] bg-[#1787D4]"
                            : "border-[#D5DCE6] bg-white"
                        }`}
                      >
                        {billingCycle === "quarterly" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-base font-semibold text-[#031033] tabular-nums">
                        {selectedPlan
                          ? formatPrice(selectedPlan.quarterlyPrice)
                          : "—"}
                      </span>
                      <span className="text-xs text-[#5A6A85]">
                        {" "}
                        /3 months
                      </span>
                      <p className="text-xs text-[#5A6A85] mt-0.5 tabular-nums">
                        ~
                        {selectedPlan
                          ? formatPrice(
                              Math.round(selectedPlan.quarterlyPrice / 3),
                            )
                          : "—"}
                        /mo equivalent
                      </p>
                    </div>
                  </div>

                  {/* 3. Yearly */}
                  <div
                    onClick={() => setBillingCycle("yearly")}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between ${
                      billingCycle === "yearly"
                        ? "border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[#031033]">Yearly</p>
                        <span className="text-xs font-medium text-[#1370B5] whitespace-nowrap">
                          Best value
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          billingCycle === "yearly"
                            ? "border-[#1787D4] bg-[#1787D4]"
                            : "border-[#D5DCE6] bg-white"
                        }`}
                      >
                        {billingCycle === "yearly" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-base font-semibold text-[#031033] tabular-nums">
                        {selectedPlan ? formatPrice(selectedPlan.price) : "—"}
                      </span>
                      <span className="text-xs text-[#5A6A85]"> /year</span>
                      <p className="text-xs text-[#0E7C3A] mt-0.5">
                        Includes 1 free SSL certificate
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Renewal Section */}
              <div className="pt-5 border-t border-[#EEF2F7] flex items-center justify-between gap-6">
                <div className="flex items-start gap-2.5 max-w-xl">
                  <RefreshCw className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-[#031033]">
                      Auto-renewal
                    </h3>
                    <p className="text-sm text-[#5A6A85] mt-0.5 leading-relaxed">
                      Renew your hosting automatically before it expires, using your
                      saved payment method.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoRenew}
                  aria-label="Auto-renewal"
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`w-9 h-5 shrink-0 flex items-center rounded-full p-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    autoRenew ? "bg-[#1787D4]" : "bg-[#D5DCE6]"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      autoRenew ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="px-5 py-4 border-t border-[#EEF2F7] flex items-center justify-between gap-4">
              <span className="text-sm text-[#5A6A85]">
                {autoRenew ? "Auto-renew on" : "Auto-renew off"}
              </span>

              <button
                type="button"
                onClick={() => setCurrentStep("review")}
                className="bg-[#1787D4] hover:bg-[#1370B5] text-white h-9 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Continue to review
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
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl">
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
                  <div>
                    <h3 className="text-base font-semibold text-[#031033]">
                      {selectedPlan?.name || "Web"} Hosting
                    </h3>
                    <p className="text-sm text-[#5A6A85] mt-0.5">
                      {selectedHostingTypeObj.title} · {cycleText} billing
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("details")}
                    className="text-sm font-medium text-[#1787D4] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-5">
                  <dl className="rounded-lg border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 divide-[#EEF2F7] sm:divide-x">
                    <div className="px-4 py-3 min-w-0">
                      <dt className="text-xs text-[#5A6A85]">Domain</dt>
                      <dd className="text-sm font-medium text-[#031033] mt-0.5 truncate">
                        {domainName}
                      </dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-xs text-[#5A6A85]">Plan</dt>
                      <dd className="text-sm font-medium text-[#031033] mt-0.5">
                        {selectedPlan?.name || "Web"}
                      </dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-xs text-[#5A6A85]">Billing</dt>
                      <dd className="text-sm font-medium text-[#031033] mt-0.5 capitalize">
                        {billingCycle}
                      </dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-xs text-[#5A6A85]">Auto-renewal</dt>
                      <dd className="text-sm font-medium text-[#031033] mt-0.5">
                        {autoRenew ? "On" : "Off"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <span className="text-sm font-medium text-[#031033] block mb-2.5">
                      Included with your plan
                    </span>
                    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#031033]">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0E7C3A]" />
                        <span>Free SSL certificate</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0E7C3A]" />
                        <span>Daily backups</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-[#0E7C3A]" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary (NO TAX!) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="bg-white border border-[#E2E8F0] rounded-xl">
                <h3 className="text-base font-semibold text-[#031033] px-5 py-4 border-b border-[#EEF2F7]">
                  Order summary
                </h3>

                <div className="p-5 space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center gap-4 text-[#5A6A85]">
                      <span>
                        {selectedPlan?.name || "Web"} Hosting · {cycleText}
                      </span>
                      <span className="font-medium text-[#031033] tabular-nums">
                        {formatPrice(hostingCost)}
                      </span>
                    </div>

                    {domainOption === "new" ? (
                      <div className="flex justify-between items-center gap-4 text-[#5A6A85]">
                        <span className="truncate">{domainName} · 1 year</span>
                        <span className="font-medium text-[#031033] tabular-nums">
                          {formatPrice(newDomainPrice)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center gap-4 text-[#5A6A85]">
                        <span className="truncate">{domainName}</span>
                        <span className="text-[#5A6A85]">
                          Existing
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center gap-4 text-[#5A6A85]">
                      <span>SSL certificate</span>
                      <span className="text-[#0E7C3A]">Included</span>
                    </div>

                    <div className="border-t border-[#EEF2F7] pt-2.5 flex justify-between items-center gap-4 text-[#5A6A85]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#031033] tabular-nums">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-baseline gap-4">
                      <span className="text-sm font-medium text-[#031033]">Total</span>
                      <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep("payment")}
                    className="w-full h-10 bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Proceed to payment
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033] flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
                <span>
                  Hosting setup starts immediately after payment is confirmed.
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SCREEN 6: Complete your payment
      ───────────────────────────────────────────────────────────────────────── */}
      {currentStep === "payment" && (
        <>
          {renderHeader(
            "Complete your payment",
            "Choose your preferred payment method to activate your hosting.",
            () => setCurrentStep("review"),
            "Back to review",
          )}

          <StepperBar currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column (8 cols): Payment Method Card */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl">
                <div className="px-5 py-4 border-b border-[#EEF2F7]">
                  <h3 className="text-base font-semibold text-[#031033]">
                    Payment method
                  </h3>
                  <p className="text-sm text-[#5A6A85] mt-0.5">
                    Your payment details are encrypted and handled securely.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <PaymentMethodSelector
                    {...payment}
                    disabled={isRedirecting || isPurchasing}
                  />

                  <div className="px-4 py-3 rounded-lg bg-[#F2F5FC] border border-[#E2E8F0] flex items-start gap-3 text-sm text-[#5A6A85]">
                    <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      You&apos;ll complete the payment on{" "}
                      {GATEWAY_NAME[payment.method]}&apos;s own page. Card,
                      bank, and wallet details are never stored on our servers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
                    <Lock className="w-3.5 h-3.5 text-[#5A6A85] shrink-0" />
                    <span>Secured with encrypted payment processing.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary (NO TAX!) */}
            <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl">
              <h3 className="text-base font-semibold text-[#031033] px-5 py-4 border-b border-[#EEF2F7]">
                Order summary
              </h3>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-2.5 pb-4 border-b border-[#EEF2F7]">
                  <Server className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#031033] truncate">
                      {selectedPlan?.name || "Web"} Hosting
                    </p>
                    <p className="text-xs text-[#5A6A85] truncate">
                      {domainName} · {cycleText}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-[#5A6A85]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#031033] tabular-nums">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-medium text-[#031033]">Total</span>
                    <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isRedirecting || isPurchasing}
                  onClick={handleCheckout}
                  className="w-full h-10 bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 tabular-nums"
                >
                  {isRedirecting || isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {connectingLabel(payment.method)}
                    </>
                  ) : (
                    payLabel(payment.method, formatPrice(grandTotal))
                  )}
                </button>

                <p className="text-xs text-center text-[#5A6A85] leading-snug">
                  By paying, you authorize this charge and agree to the hosting
                  terms.
                </p>
              </div>
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
              "Activating your hosting",
              "We're setting up your hosting environment. This may take a moment.",
              () => setCurrentStep("payment"),
              "Back to payment",
            )}
          </div>

          <StepperBar currentStep={currentStep} />

          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1787D4] mx-auto mb-4" />

            <h3 className="text-lg font-semibold text-[#031033]">
              Preparing {selectedPlan?.name || "Web"} Hosting
            </h3>
            <p className="text-sm text-[#5A6A85] max-w-md mx-auto mt-1 leading-relaxed">
              Your order is confirmed. We&apos;re provisioning resources and
              connecting your domain.
            </p>

            <ol className="mt-8 space-y-4 text-left max-w-md mx-auto">
              {/* Step 1: Payment confirmed */}
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#031033]">
                    Payment confirmed
                  </p>
                  <p className="text-xs text-[#5A6A85] tabular-nums">
                    {formatPrice(grandTotal)} received
                  </p>
                </div>
              </li>

              {/* Step 2: Creating hosting account */}
              <li className="flex items-center gap-3">
                {activatingStep > 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1787D4] shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-[#031033]">
                    Creating hosting account
                  </p>
                  <p className="text-xs text-[#5A6A85]">
                    Provisioning {selectedPlan?.name || "Web"} hosting…
                  </p>
                </div>
              </li>

              {/* Step 3: Connecting domain */}
              <li className="flex items-center gap-3">
                {activatingStep > 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0" />
                ) : activatingStep === 2 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1787D4] shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#D5DCE6] shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      activatingStep >= 2 ? "text-[#031033]" : "text-[#5A6A85]"
                    }`}
                  >
                    Connecting domain
                  </p>
                  <p className="text-xs text-[#5A6A85]">
                    Preparing {domainName}
                  </p>
                </div>
              </li>

              {/* Step 4: Activating services */}
              <li className="flex items-center gap-3">
                {activatingStep > 3 ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0" />
                ) : activatingStep === 3 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1787D4] shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#D5DCE6] shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      activatingStep >= 3 ? "text-[#031033]" : "text-[#5A6A85]"
                    }`}
                  >
                    Activating services
                  </p>
                  <p className="text-xs text-[#5A6A85]">
                    SSL, backups, and control panel
                  </p>
                </div>
              </li>
            </ol>

            {orderReference && (
              <div className="mt-8 bg-[#F2F5FC] border border-[#E2E8F0] rounded-lg px-4 py-3 flex items-center justify-between gap-4 text-sm max-w-md mx-auto">
                <span className="text-[#5A6A85]">Order reference</span>
                <span className="font-mono text-[#031033] truncate">
                  {orderReference}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-[#5A6A85]">
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
              "Payment complete",
              `We're setting up your hosting${domainName ? ` for ${domainName}` : ""}. It shows as active in your hosting list once setup finishes.`,
              () => router.push("/dashboard/hosting"),
              "Back to hosting",
            )}
          </div>

          <StepperBar currentStep={currentStep} />

          <div className="w-full max-w-3xl bg-white border border-[#E2E8F0] rounded-xl p-8 text-center flex flex-col items-center">
            {/* The 3D checkmark SVG (matches Domain registration completed screen) */}
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/checkmark.svg"
                alt="Hosting ready"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
                priority
              />
            </div>

            <h2 className="text-lg font-semibold text-[#031033]">
              Your hosting is ready
            </h2>
            <p className="text-sm text-[#5A6A85] mt-1 max-w-lg leading-relaxed">
              Your website now has a secure, reliable home on Nupat Cloud.
            </p>

            <div className="w-full mt-6 border border-[#E2E8F0] rounded-lg text-left">
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[#EEF2F7]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Server className="w-4 h-4 text-[#5A6A85] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-[#031033]">
                      {selectedPlan?.name || "Web"} Hosting
                    </h4>
                    <p className="text-xs text-[#5A6A85] truncate">{domainName}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033] shrink-0">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                  Active
                </span>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-3">
                <div className="min-w-0">
                  <dt className="text-xs text-[#5A6A85]">Domain</dt>
                  <dd className="text-sm font-medium text-[#031033] mt-0.5 truncate">
                    {domainName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5A6A85]">Plan</dt>
                  <dd className="text-sm font-medium text-[#031033] mt-0.5">
                    {selectedPlan?.name || "Web"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5A6A85]">Renews</dt>
                  <dd className="text-sm font-medium text-[#031033] mt-0.5 tabular-nums">
                    {renewalDateFormatted}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5A6A85]">Auto-renew</dt>
                  <dd className="text-sm font-medium text-[#031033] mt-0.5">
                    {autoRenew ? "On" : "Off"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center mt-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentStep("next-steps")}
                className="w-full sm:w-auto h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Manage hosting
              </button>
              <Link
                href="/dashboard/hosting"
                className="w-full sm:w-auto h-9 px-4 bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] text-[#031033] rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Open control panel
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-9 px-4 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Go to dashboard
              </Link>
            </div>
          </div>

          <div className="w-full max-w-3xl rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033] flex items-center justify-center gap-2 text-center">
            <CheckCircle className="w-4 h-4 text-[#1787D4] shrink-0" />
            <span>
              A hosting receipt and access details were sent to{" "}
              {userEmail || "your registered email"}
              .
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
            "Your website is ready for the next step",
            `Choose what you'd like to set up next for ${domainName}.`,
            () => router.push("/dashboard/hosting"),
            "Back to hosting",
          )}

          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <Server className="w-4 h-4 text-[#5A6A85] shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[#031033]">
                  {selectedPlan?.name || "Web"} Hosting
                </h3>
                <p className="text-xs text-[#5A6A85] truncate">
                  {domainName} · activated {todayFormatted}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033] shrink-0">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Card 1: Build Your Website */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col justify-between overflow-hidden">
              <WebsiteBuilderIllustration />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Build your website
                  </h3>
                  <p className="text-sm text-[#5A6A85] mt-1.5 leading-relaxed">
                    Choose a professionally designed template and publish your
                    first pages without writing code.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/hosting")}
                    className="w-full h-9 bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {/* The purchase response has no hosting id to deep-link to. */}
                    Go to hosting
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Set Up Your Domain */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col justify-between overflow-hidden">
              <DomainSetupIllustration />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Set up your domain
                  </h3>
                  <p className="text-sm text-[#5A6A85] mt-1.5 leading-relaxed">
                    Review DNS, nameservers, redirects, and connection settings
                    for {domainName}.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/dashboard/domains"
                    className="w-full h-9 bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] text-[#031033] rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Manage domain
                  </Link>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
            <div>
              <h3 className="text-sm font-medium text-[#031033]">
                Prefer to explore first?
              </h3>
              <p className="text-sm text-[#5A6A85]">
                You can return to these setup options anytime from your hosting
                dashboard.
              </p>
            </div>
            <Link
              href="/dashboard/hosting"
              className="text-sm font-medium text-[#1787D4] hover:underline shrink-0"
            >
              Go to dashboard →
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
          <p className="text-sm text-[#5A6A85]">Loading hosting setup...</p>
        </div>
      }
    >
      <HostingPurchaseFlow />
    </Suspense>
  );
}
