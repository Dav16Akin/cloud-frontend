"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  Globe,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useGetSslProducts } from "@/hooks/useSsl";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetMe } from "@/hooks/useUser";
import { initializeCartPayment, type SslProduct } from "@/lib/api";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEP_LABELS = [
  "Domain",
  "Certificate",
  "Configure",
  "Review",
  "Payment",
  "Activate",
  "Done",
] as const;

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

interface SslPurchaseWizardProps {
  onBack?: () => void;
  initialDomain?: string;
  initialProductId?: number;
}

export default function SslPurchaseWizard({
  onBack,
  initialDomain = "",
  initialProductId,
}: SslPurchaseWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Queries: strictly connected to backend endpoints
  const {
    data: apiProducts,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useGetSslProducts();

  const {
    data: registeredDomains,
    isLoading: isLoadingDomains,
  } = useGetRegisteredDomains();

  const { data: me } = useGetMe();

  // Step state (1 to 7)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: Domain Selection
  const [selectedDomain, setSelectedDomain] = useState<string>(
    initialDomain || searchParams.get("domain") || ""
  );
  const [customDomainInput, setCustomDomainInput] = useState<string>("");
  const [isUsingCustomDomain, setIsUsingCustomDomain] = useState<boolean>(false);

  // Step 2: Certificate Product Selection (real API products only)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialProductId || (searchParams.get("product") ? Number(searchParams.get("product")) : null)
  );

  // Step 3: Configuration
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [approverEmail, setApproverEmail] = useState<string>("");
  const [csr, setCsr] = useState<string>("");

  // Step 4: Review Agreement
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // Step 5: Payment (Paystack)
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 6: Activation progress
  const [activationProgress, setActivationProgress] = useState<number>(15);
  const [activationSubstep, setActivationSubstep] = useState<number>(1);

  // Products from API (no hardcoded fallback products)
  const products: SslProduct[] = useMemo(() => {
    if (Array.isArray(apiProducts)) {
      return apiProducts;
    }
    return [];
  }, [apiProducts]);

  // Set default product when products arrive if none selected
  useEffect(() => {
    if (products.length > 0 && selectedProductId === null) {
      const preferred = products.find((p) => p.id === 41) || products[0];
      setSelectedProductId(preferred.id);
    }
  }, [products, selectedProductId]);

  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const activePrice = useMemo(() => {
    if (!activeProduct) return 0;
    const match = activeProduct.prices?.find((p) => p.period === selectedPeriod);
    return match ? match.price : activeProduct.price || 0;
  }, [activeProduct, selectedPeriod]);

  // Available user domains list
  const userDomains = useMemo(() => {
    if (!registeredDomains || !Array.isArray(registeredDomains)) return [];
    return registeredDomains
      .map((d) => d.domain)
      .filter((d): d is string => Boolean(d));
  }, [registeredDomains]);

  // Set initial domain selection if user has domains and none selected
  useEffect(() => {
    if (!selectedDomain && userDomains.length > 0 && !isUsingCustomDomain) {
      setSelectedDomain(userDomains[0]);
    }
  }, [userDomains, selectedDomain, isUsingCustomDomain]);

  // Step 6 simulated activation ticker (once on step 6, animate progress to 100% then go to 7)
  useEffect(() => {
    if (currentStep !== 6) return;

    setActivationProgress(25);
    setActivationSubstep(1);

    const t1 = setTimeout(() => {
      setActivationProgress(55);
      setActivationSubstep(2);
    }, 1200);

    const t2 = setTimeout(() => {
      setActivationProgress(85);
      setActivationSubstep(3);
    }, 2800);

    const t3 = setTimeout(() => {
      setActivationProgress(100);
      setActivationSubstep(4);
    }, 4200);

    const t4 = setTimeout(() => {
      setCurrentStep(7);
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentStep]);

  // Handlers for Step navigation
  const handleDomainContinue = () => {
    const finalDomain = isUsingCustomDomain
      ? customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : selectedDomain.trim();

    if (!finalDomain) {
      toast.error("Please choose or enter a domain name.");
      return;
    }
    if (!finalDomain.includes(".")) {
      toast.error("Please enter a valid domain name with an extension (e.g. acme.com).");
      return;
    }

    setSelectedDomain(finalDomain);
    setCurrentStep(2);
  };

  const handleCertificateChoose = (prodId: number) => {
    setSelectedProductId(prodId);
    setCurrentStep(3);
  };

  const handlePaystackPayment = async () => {
    if (!selectedDomain || !activeProduct) {
      toast.error("Missing domain or certificate information.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const res = await initializeCartPayment({
        items: [
          {
            type: "SSL",
            domainName: selectedDomain,
            productId: activeProduct.id,
            period: selectedPeriod,
            ...(csr.trim() ? { csr: csr.trim() } : {}),
            ...(approverEmail.trim() ? { approverEmail: approverEmail.trim() } : {}),
          },
        ],
      });

      if (res?.data?.paymentUrl) {
        if (res.data.reference) setPaymentReference(res.data.reference);
        // Official Paystack payment URL — activation continues after payment
        window.location.href = res.data.paymentUrl;
        return;
      }
      // No gateway URL means payment was not initialised: stay on this step.
      const msg = "Payment could not be started: no Paystack payment link was returned. Please try again.";
      setPaymentError(msg);
      toast.error(msg);
      setIsProcessingPayment(false);
    } catch (err: any) {
      // Initialisation failed: show the error and stay on the payment step.
      const msg = err?.message || "Failed to initialize payment. Please try again.";
      setPaymentError(msg);
      toast.error(msg);
      setIsProcessingPayment(false);
    }
  };

  // Dates for done screen
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const nextYearStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + selectedPeriod);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedPeriod]);

  // Back button text and handler per step
  const handleBack = () => {
    if (currentStep === 1) {
      if (onBack) onBack();
      else router.push("/dashboard/ssl");
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 6) {
      setCurrentStep(5);
    } else if (currentStep === 7) {
      setCurrentStep(6);
    }
  };

  const backLabel = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "Back to SSL certificates";
      case 2:
        return "Back to domain selection";
      case 3:
        return "Back to certificate selection";
      case 4:
        return "Back to configuration";
      case 5:
        return "Back to review";
      case 6:
        return "Back to payment";
      case 7:
        return "Back to certificate setup";
      default:
        return "Back";
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-16">
      {/* ── Top Back Button ──────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
      </div>

      {/* ── Heading & Subtitle ────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-2xl font-semibold text-[#031033]"
        >
          {currentStep === 1 && "Secure your website"}
          {currentStep === 2 && "Choose your SSL certificate"}
          {currentStep === 3 && "Configure your certificate"}
          {currentStep === 4 && "Review your SSL certificate"}
          {currentStep === 5 && "Complete your payment"}
          {currentStep === 6 && "Setting up your SSL certificate…"}
          {currentStep === 7 && "Your website is now protected"}
        </h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          {currentStep === 1 &&
            "Encrypt traffic to your website and show visitors a valid HTTPS padlock."}
          {currentStep === 2 &&
            "Select the certificate that matches your website's security needs."}
          {currentStep === 3 &&
            "Confirm the domain and certificate details before continuing."}
          {currentStep === 4 &&
            "Check your certificate, domain, and final pricing before payment."}
          {currentStep === 5 &&
            "Choose your preferred payment method to activate your SSL certificate."}
          {currentStep === 6 &&
            `We're processing your certificate for ${selectedDomain || "your domain"}.`}
          {currentStep === 7 &&
            `${activeProduct?.name || "SSL Certificate"} is active for ${selectedDomain || "your domain"}.`}
        </p>
      </div>

      {/* ── 7-Step Progress Stepper ───────────────────────────────────────── */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] px-5 py-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = (idx + 1) as WizardStep;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium tabular-nums transition-colors ${
                      isCompleted
                        ? "bg-[#0E7C3A] text-white"
                        : isActive
                        ? "bg-[#1787D4] text-white"
                        : "bg-[#EEF2F7] text-[#5A6A85]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#031033]"
                        : isCompleted
                        ? "text-[#031033]"
                        : "text-[#5A6A85]"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {idx < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 transition-colors ${
                      stepNum < currentStep ? "bg-[#0E7C3A]" : "bg-[#EEF2F7]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 1: Domain Selection                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Domain List / Custom Domain */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#031033]">
                  Choose a domain
                </h2>
                <p className="text-sm text-[#5A6A85] mt-0.5">
                  Select the active domain you want to protect.
                </p>
              </div>

              {isLoadingDomains ? (
                <div className="flex flex-col gap-2.5">
                  <div className="h-16 rounded-lg bg-[#EEF2F7] animate-pulse" />
                  <div className="h-16 rounded-lg bg-[#EEF2F7] animate-pulse" />
                </div>
              ) : userDomains.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {userDomains.map((dom) => {
                    const isSelected = !isUsingCustomDomain && selectedDomain === dom;
                    return (
                      <div
                        key={dom}
                        onClick={() => {
                          setIsUsingCustomDomain(false);
                          setSelectedDomain(dom);
                        }}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]/50"
                            : "border-[#E2E8F0] bg-white hover:border-[#D5DCE6]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-[#1787D4] bg-[#1787D4]"
                                : "border-[#D5DCE6] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#031033]">
                              {dom}
                            </span>
                            <span className="block text-xs text-[#5A6A85]">
                              Primary domain • DNS connected
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                          Active
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#F2F5FC] text-sm text-[#5A6A85]">
                  You have no registered domains. Enter a domain you own below.
                </div>
              )}

              {/* Option to enter external / custom domain (Not auto-filled!) */}
              <div className="pt-4 border-t border-[#EEF2F7] flex flex-col gap-3">
                <div
                  onClick={() => setIsUsingCustomDomain(true)}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    isUsingCustomDomain
                      ? "border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]/50"
                      : "border-[#E2E8F0] bg-white hover:border-[#D5DCE6]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isUsingCustomDomain
                        ? "border-[#1787D4] bg-[#1787D4]"
                        : "border-[#D5DCE6] bg-white"
                    }`}
                  >
                    {isUsingCustomDomain && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#031033]">
                    Enter another domain name or subdomain
                  </span>
                </div>

                {isUsingCustomDomain && (
                  <div className="pl-7 flex flex-col gap-1.5">
                    <input
                      type="text"
                      id="input-custom-domain"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="e.g. yourwebsite.com or shop.yourwebsite.com"
                      className="w-full h-10 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
                      autoFocus
                    />
                    <span className="text-xs text-[#5A6A85]">
                      Enter any domain you own to issue and configure an SSL certificate.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selection Summary & Register CTA */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033]">
                Your selection
              </h3>

              <div className="bg-[#F2F5FC] rounded-lg px-4 py-3">
                <span className="text-xs text-[#5A6A85] block">
                  Domain
                </span>
                <span className="text-sm font-medium text-[#031033] block mt-1 truncate">
                  {isUsingCustomDomain
                    ? customDomainInput.trim() || "Enter domain name"
                    : selectedDomain || "No domain selected"}
                </span>
              </div>

              <button
                type="button"
                id="btn-continue-domain"
                onClick={handleDomainContinue}
                disabled={
                  isUsingCustomDomain
                    ? !customDomainInput.trim()
                    : !selectedDomain
                }
                className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>

            {/* Don't have a domain CTA (matches screenshot) */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-2.5">
              <h4 className="text-sm font-semibold text-[#031033]">
                Don&apos;t have a domain yet?
              </h4>
              <p className="text-xs text-[#5A6A85]">
                Find the right name for your website and manage it in Nupat Cloud.
              </p>
              <Link
                href="/dashboard/domains?tab=register"
                className="inline-flex h-8 items-center justify-center px-3 mt-1 rounded-lg border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-sm font-medium text-[#031033] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Register a domain
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 2: Certificate Selection (Connected to API Products Only)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E2E8F0] rounded-lg p-6 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-24 h-5 rounded-full bg-[#EEF2F7]" />
                    <div className="w-3/4 h-5 rounded bg-[#EEF2F7]" />
                    <div className="w-full h-12 rounded bg-[#EEF2F7]" />
                  </div>
                  <div className="w-full h-9 rounded-lg bg-[#EEF2F7]" />
                </div>
              ))}
            </div>
          ) : isProductsError || products.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E8900A]" />
              <h3 className="text-base font-semibold text-[#031033]">
                No SSL certificates available right now
              </h3>
              <p className="text-sm text-[#5A6A85] max-w-md">
                We couldn&apos;t load the SSL catalogue. Try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => refetchProducts()}
                className="mt-2 inline-flex h-8 items-center gap-2 px-3 border border-[#D5DCE6] bg-white text-[#031033] rounded-lg text-sm font-medium hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {products.map((prod) => {
                const isSelected = activeProduct?.id === prod.id;
                const priceVal = prod.price || prod.prices?.[0]?.price || 0;
                const validationLabel =
                  prod.validationMethod === "domain"
                    ? "Domain validation"
                    : prod.validationMethod === "organization"
                    ? "Organization validation"
                    : "Extended validation";

                return (
                  <div
                    key={prod.id}
                    id={`ssl-wizard-prod-${prod.id}`}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`bg-white rounded-xl p-6 transition-colors border flex flex-col justify-between cursor-pointer relative ${
                      isSelected
                        ? "border-[#1787D4] ring-2 ring-[#1787D4]/40"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                    }`}
                  >
                    <div>
                      {/* Validation badge */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xs text-[#5A6A85] whitespace-nowrap">
                          {prod.isWildcard ? "Wildcard" : validationLabel}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-base font-semibold text-[#031033]">
                        {prod.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#5A6A85] mt-2">
                        {prod.isWildcard
                          ? "Secures your primary domain and unlimited subdomains."
                          : "A single-domain certificate for securing your website over HTTPS."}
                      </p>

                      {/* Price */}
                      <div className="mt-4 pt-4 border-t border-[#EEF2F7]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold text-[#031033] tabular-nums">
                            {formatPrice(priceVal)}
                          </span>
                          <span className="text-xs text-[#5A6A85]">
                            / year
                          </span>
                        </div>
                      </div>

                      {/* Real Feature Bullets */}
                      <div className="mt-4 flex flex-col gap-2 text-sm text-[#5A6A85]">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E7C3A] shrink-0" />
                          <span>
                            {prod.isWildcard
                              ? "Unlimited subdomains (*.domain.com)"
                              : "For one domain"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E7C3A] shrink-0" />
                          <span>{validationLabel} workflow</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E7C3A] shrink-0" />
                          <span>
                            Issuance: {prod.deliveryTime || "Fast automated delivery"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0E7C3A] shrink-0" />
                          <span>Annual validity and renewal controls</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCertificateChoose(prod.id);
                        }}
                        className={`w-full h-9 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                          isSelected
                            ? "bg-[#1787D4] text-white hover:bg-[#1370B5]"
                            : "bg-white text-[#031033] border border-[#D5DCE6] hover:bg-[#F2F5FC]"
                        }`}
                      >
                        Choose certificate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 3: Configure Certificate                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Configuration card */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-5">
              {/* Header with change certificate button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EEF2F7]">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-1" />
                  <div>
                    <h2 className="text-base font-semibold text-[#031033]">
                      {activeProduct?.name || "Standard SSL"}
                    </h2>
                    <p className="text-xs text-[#5A6A85]">
                      Certificate configuration for {selectedDomain}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] cursor-pointer"
                >
                  Change certificate
                </button>
              </div>

              {/* 3 Detail Tiles (Domain, Certificate, Validity) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F2F5FC] rounded-lg p-3.5">
                  <span className="text-xs font-medium text-[#5A6A85] block">
                    Domain
                  </span>
                  <span className="text-sm font-medium text-[#031033] mt-1 block truncate">
                    {selectedDomain}
                  </span>
                </div>

                <div className="bg-[#F2F5FC] rounded-lg p-3.5">
                  <span className="text-xs font-medium text-[#5A6A85] block">
                    Certificate
                  </span>
                  <span className="text-sm font-medium text-[#031033] mt-1 block truncate">
                    {activeProduct?.name || "SSL Certificate"}
                  </span>
                </div>

                <div className="bg-[#F2F5FC] rounded-lg p-3.5">
                  <span className="text-xs font-medium text-[#5A6A85] block">
                    Validity
                  </span>
                  <span className="text-sm font-medium text-[#031033] mt-1 block">
                    {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Duration selector if multi-year prices exist in product */}
              {activeProduct?.prices && activeProduct.prices.length > 1 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#031033]">
                    Certificate duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeProduct.prices.map((pr) => (
                      <button
                        key={pr.period}
                        type="button"
                        onClick={() => setSelectedPeriod(pr.period)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left cursor-pointer ${
                          selectedPeriod === pr.period
                            ? "border-[#1787D4] bg-[#E8F4FC] text-[#031033] ring-1 ring-[#1787D4]"
                            : "border-[#E2E8F0] bg-white text-[#031033] hover:border-[#D5DCE6]"
                        }`}
                      >
                        <div>{pr.period} year{pr.period > 1 ? "s" : ""}</div>
                        <div className="text-xs text-[#5A6A85] font-normal tabular-nums">
                          {formatPrice(pr.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-Renewal Toggle (matches screenshot) */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] bg-white">
                <div className="pr-4">
                  <span className="text-sm font-medium text-[#031033] block">
                    Auto-renewal
                  </span>
                  <span className="text-xs text-[#5A6A85] mt-0.5 block">
                    Automatically renew this certificate before it expires to help avoid interruptions in website protection.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoRenew((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    autoRenew ? "bg-[#0E7C3A]" : "bg-[#D5DCE6]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
                      autoRenew ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Optional Advanced Settings (CSR & Email) - NOT AUTO-FILLED! */}
              <details className="text-sm text-[#5A6A85]">
                <summary className="font-medium text-[#1787D4] cursor-pointer hover:text-[#1370B5]">
                  Advanced verification settings (CSR, approver email), optional
                </summary>
                <div className="mt-3 flex flex-col gap-4 p-4 rounded-lg bg-[#F2F5FC]">
                  <div>
                    <label className="block text-sm font-medium text-[#031033] mb-1.5">
                      Approver email (optional)
                    </label>
                    <input
                      type="email"
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                      placeholder="e.g. admin@yourdomain.com"
                      className="w-full h-10 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#031033] mb-1.5">
                      Custom CSR (optional)
                    </label>
                    <textarea
                      value={csr}
                      onChange={(e) => setCsr(e.target.value)}
                      placeholder="Paste your CSR if you generate your own private key"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5DCE6] bg-white font-mono text-xs text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Right Column: Ready to continue summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033]">
                Ready to continue
              </h3>

              <div className="flex flex-col text-sm divide-y divide-[#EEF2F7]">
                <div className="flex justify-between gap-4 py-2.5 first:pt-0">
                  <span className="text-[#5A6A85]">Domain</span>
                  <span className="font-medium text-[#031033] truncate max-w-[150px] text-right">
                    {selectedDomain}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2.5">
                  <span className="text-[#5A6A85]">Validity</span>
                  <span className="font-medium text-[#031033] tabular-nums">
                    {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2.5 last:pb-0">
                  <span className="text-[#5A6A85]">Auto-renewal</span>
                  <span
                    className={`font-medium ${
                      autoRenew ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                    }`}
                  >
                    {autoRenew ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-continue-configure"
                onClick={() => setCurrentStep(4)}
                className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Continue to review
              </button>

              <p className="text-xs text-[#5A6A85] text-center">
                You can manage renewal settings after activation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 4: Review SSL Certificate                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Review card */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEF2F7]">
                <div>
                  <h2 className="text-base font-semibold text-[#031033]">
                    {activeProduct?.name || "Standard SSL"}
                  </h2>
                  <p className="text-xs text-[#5A6A85]">
                    {selectedPeriod}-year certificate configuration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Main detail pill card */}
              <div className="p-4 rounded-lg bg-[#F2F5FC] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[#031033] block truncate">
                        {selectedDomain}
                      </span>
                      <span className="block text-xs text-[#5A6A85]">
                        {activeProduct?.name || "SSL Certificate"} · {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <span className="text-base font-semibold text-[#031033] tabular-nums">
                    {formatPrice(activePrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-xs text-[#5A6A85] block">
                      Domain
                    </span>
                    <span className="font-medium text-[#031033] truncate block">
                      {selectedDomain}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A6A85] block">
                      Certificate
                    </span>
                    <span className="font-medium text-[#031033] truncate block">
                      {activeProduct?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A6A85] block">
                      Validity
                    </span>
                    <span className="font-medium text-[#031033] block tabular-nums">
                      {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A6A85] block">
                      Auto-renewal
                    </span>
                    <span
                      className={`font-medium block ${
                        autoRenew ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                      }`}
                    >
                      {autoRenew ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              </div>

              {/* What happens next box (matches screenshot) */}
              <div className="p-4 rounded-lg bg-[#F2F5FC]">
                <h4 className="text-sm font-semibold text-[#031033]">
                  What happens next
                </h4>
                <p className="text-xs text-[#5A6A85] mt-1">
                  After payment, Nupat Cloud will request the certificate, validate {selectedDomain}, and activate it when validation completes.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033]">
                Order summary
              </h3>

              <dl className="flex flex-col text-sm">
                <div className="flex justify-between items-center gap-4 pb-2.5">
                  <dt className="text-[#5A6A85] truncate">
                    {activeProduct?.name} · {selectedPeriod} yr
                  </dt>
                  <dd className="font-medium text-[#031033] tabular-nums text-right">
                    {formatPrice(activePrice)}
                  </dd>
                </div>
                <div className="flex justify-between items-center gap-4 py-2.5 border-t border-[#EEF2F7]">
                  <dt className="text-[#5A6A85]">Subtotal</dt>
                  <dd className="text-[#031033] tabular-nums text-right">{formatPrice(activePrice)}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4 pt-3 mt-1 border-t border-[#E2E8F0]">
                  <dt className="font-semibold text-[#031033]">Total due today</dt>
                  <dd className="text-lg font-semibold text-[#031033] tabular-nums text-right">
                    {formatPrice(activePrice)}
                  </dd>
                </div>
              </dl>

              {/* Terms agreement checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-[#5A6A85] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded accent-[#1787D4] focus:ring-[#1787D4]"
                />
                <span>
                  I confirm these certificate details are accurate and agree to the SSL Certificate Terms.
                </span>
              </label>

              <button
                type="button"
                id="btn-proceed-to-payment"
                onClick={() => setCurrentStep(5)}
                disabled={!agreedToTerms}
                className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Proceed to payment
              </button>

              <p className="text-xs text-[#5A6A85] text-center">
                Certificate setup starts immediately after payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 5: Payment (Paystack Official Gateway)                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Payment Method Selection */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-5">
              <div>
                <h2 className="text-base font-semibold text-[#031033]">
                  Payment method
                </h2>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Your payment details are encrypted and handled securely.
                </p>
              </div>

              {/* Paystack official checkout card */}
              <div className="p-4 rounded-lg border border-[#1787D4] bg-[#E8F4FC] ring-1 ring-[#1787D4]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                    <Image
                      src="/paystack-logo.svg"
                      alt="Paystack"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#031033] block">
                      Paystack secure checkout
                    </span>
                    <span className="text-xs text-[#5A6A85] block mt-0.5">
                      Debit/credit card, bank transfer, USSD
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033] shrink-0">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                  Connected
                </span>
              </div>

              {/* Security info notice (No fake auto-filled inputs) */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[#F2F5FC] text-sm text-[#5A6A85]">
                <Lock className="w-4 h-4 text-[#0E7C3A] shrink-0 mt-0.5" />
                <span>
                  Payments are encrypted and processed by Paystack. Your card details are never stored on our servers.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment trigger */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033]">
                Order summary
              </h3>

              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#F2F5FC]">
                <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[#031033] block truncate">
                    {activeProduct?.name}
                  </span>
                  <span className="text-xs text-[#5A6A85] block truncate">
                    {selectedDomain} · {selectedPeriod} yr
                  </span>
                </div>
              </div>

              <dl className="flex flex-col text-sm">
                <div className="flex justify-between items-center gap-4 pb-2.5">
                  <dt className="text-[#5A6A85]">Subtotal</dt>
                  <dd className="text-[#031033] tabular-nums text-right">{formatPrice(activePrice)}</dd>
                </div>
                <div className="flex justify-between items-baseline gap-4 pt-3 border-t border-[#E2E8F0]">
                  <dt className="font-semibold text-[#031033]">Total</dt>
                  <dd className="text-lg font-semibold text-[#031033] tabular-nums text-right">
                    {formatPrice(activePrice)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                id="btn-pay-ssl"
                onClick={handlePaystackPayment}
                disabled={isProcessingPayment}
                className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Paystack…</span>
                  </>
                ) : (
                  <span>Pay {formatPrice(activePrice)}</span>
                )}
              </button>

              {paymentError && (
                <div
                  role="alert"
                  className="bg-[#FDECEC] border border-[#DC2626]/20 rounded-lg px-3 py-2.5 flex items-start gap-2 text-[#C21F1F] text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <p className="text-xs text-[#5A6A85] text-center">
                By clicking pay, you authorize this charge and agree to the SSL Certificate terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 6: Activating your certificate                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 sm:p-9 flex flex-col items-center text-center gap-6">
            {/* Spinning Indicator */}
            <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />

            <div>
              <h2 className="text-lg font-semibold text-[#031033]">
                Validating {selectedDomain}
              </h2>
              <p className="text-sm text-[#5A6A85] mt-1">
                Your payment is confirmed. We&apos;re validating the domain before activation.
              </p>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-[#EEF2F7] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1787D4] h-full transition-[width] duration-700 ease-out rounded-full"
                style={{ width: `${activationProgress}%` }}
              />
            </div>

            {/* Checklist items (matches screenshot) */}
            <div className="w-full flex flex-col gap-3 text-left pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                <div>
                  <span className="text-sm font-medium text-[#031033] block">
                    Payment confirmed
                  </span>
                  <span className="text-xs text-[#5A6A85] block">
                    Payment received securely
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    activationSubstep >= 2 ? "text-[#0E7C3A]" : "text-[#D5DCE6]"
                  }`}
                />
                <div>
                  <span className="text-sm font-medium text-[#031033] block">
                    Certificate requested
                  </span>
                  <span className="text-xs text-[#5A6A85] block">
                    {activeProduct?.name} request submitted
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activationSubstep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#1787D4] animate-spin shrink-0" />
                )}
                <div>
                  <span className="text-sm font-medium text-[#031033] block">
                    Validating domain
                  </span>
                  <span className="text-xs text-[#5A6A85] block">
                    Checking control of {selectedDomain}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                    activationSubstep >= 4
                      ? "border-[#0E7C3A] bg-[#0E7C3A] text-white"
                      : "border-[#D5DCE6] bg-white"
                  }`}
                >
                  {activationSubstep >= 4 && <Check className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <span className="text-sm font-medium text-[#031033] block">
                    Activating certificate
                  </span>
                  <span className="text-xs text-[#5A6A85] block">
                    {activationSubstep >= 4
                      ? "Certificate activated"
                      : "Pending domain validation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Reference Box */}
            <div className="w-full px-4 py-3 rounded-lg bg-[#F2F5FC] text-sm text-[#5A6A85] flex items-center justify-between gap-4">
              <span>Order reference</span>
              <span className={`font-mono text-sm truncate ${paymentReference ? "text-[#031033]" : "text-[#5A6A85]"}`}>
                {paymentReference || "—"}
              </span>
            </div>

            <p className="text-xs text-[#5A6A85]">
              This usually takes less than a minute. You can safely leave this screen while it completes.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN 7: Your website is now protected (Using /checkmark.svg)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {currentStep === 7 && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 sm:p-10 flex flex-col items-center text-center gap-6">
            {/* Official /checkmark.svg icon requested by user */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image
                src="/checkmark.svg"
                alt="Protected"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#031033]">
                Your website is now protected
              </h2>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-md">
                {activeProduct?.name || "Standard SSL"} has been activated and is now protecting {selectedDomain}.
              </p>
            </div>

            {/* Summary card pill */}
            <div className="w-full p-4 sm:p-5 rounded-lg bg-[#F2F5FC] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#031033] block truncate">
                      {activeProduct?.name || "Standard SSL"}
                    </span>
                    <span className="block text-xs text-[#5A6A85]">
                      {selectedDomain}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Domain
                  </span>
                  <span className="font-medium text-[#031033] truncate block">
                    {selectedDomain}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Issued
                  </span>
                  <span className="font-medium text-[#031033] block tabular-nums">
                    {todayStr}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Expires
                  </span>
                  <span className="font-medium text-[#031033] block tabular-nums">
                    {nextYearStr}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Auto-renewal
                  </span>
                  <span
                    className={`font-medium block ${
                      autoRenew ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                    }`}
                  >
                    {autoRenew ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons (matches screenshot) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={`/dashboard/ssl/${encodeURIComponent(selectedDomain)}`}
                className="w-full sm:flex-1 inline-flex h-9 items-center justify-center px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Manage certificate
              </Link>
              <Link
                href={`/dashboard/ssl/${encodeURIComponent(selectedDomain)}`}
                className="w-full sm:flex-1 inline-flex h-9 items-center justify-center px-4 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                View certificate details
              </Link>
              <Link
                href="/dashboard/ssl"
                className="w-full sm:flex-1 inline-flex h-9 items-center justify-center px-4 text-[#1787D4] hover:bg-[#E8F4FC] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Go to SSL certificates
              </Link>
            </div>

            {/* Green info alert at bottom */}
            <div className="w-full px-4 py-3 rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] text-sm text-[#0E7C3A] flex items-center gap-2 text-left">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                A certificate receipt and activation details were sent to your account email.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
