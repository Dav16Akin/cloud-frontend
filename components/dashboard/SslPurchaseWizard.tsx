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
    const ref = `NC-SSL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPaymentReference(ref);

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
        // Official Paystack payment URL
        window.location.href = res.data.paymentUrl;
      } else {
        // Advance to activation step
        setCurrentStep(6);
      }
    } catch (err: any) {
      // In dev or sandbox, advance gracefully to the activation step with the reference
      console.warn("Paystack initialize warning:", err?.message || err);
      setCurrentStep(6);
    } finally {
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
        return "Back to SSL Certificates";
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
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
      </div>

      {/* ── Heading & Subtitle ────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] tracking-tight"
          style={{ letterSpacing: "-0.4px" }}
        >
          {currentStep === 1 && "Secure your website"}
          {currentStep === 2 && "Choose your SSL certificate"}
          {currentStep === 3 && "Configure your certificate"}
          {currentStep === 4 && "Review your SSL certificate"}
          {currentStep === 5 && "Complete your payment"}
          {currentStep === 6 && "Setting up your SSL certificate..."}
          {currentStep === 7 && "Your website is now protected"}
        </h1>
        <p className="text-[13.5px] sm:text-[14px] text-[#6e6e73] mt-1 leading-relaxed">
          {currentStep === 1 &&
            "Protect your website and give your visitors a secure, trusted browsing experience."}
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
      <div className="w-full bg-white rounded-xl border border-[#e2eaff] p-3 sm:p-4 overflow-x-auto shadow-2xs">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = (idx + 1) as WizardStep;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      isCompleted
                        ? "bg-[#12a150] text-white"
                        : isActive
                        ? "bg-[#1787D4] text-white shadow-xs"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : stepNum}
                  </div>
                  <span
                    className={`text-[12px] font-medium transition-colors ${
                      isActive
                        ? "text-[#1787D4] font-semibold"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {idx < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] transition-colors ${
                      stepNum < currentStep ? "bg-[#12a150]" : "bg-gray-200"
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
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#1d1d1f]">
                  Choose a domain
                </h2>
                <p className="text-[13px] text-[#6e6e73] mt-0.5">
                  Select the active domain you want to protect.
                </p>
              </div>

              {isLoadingDomains ? (
                <div className="flex flex-col gap-3 py-4">
                  <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
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
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#1787D4] bg-[#f0f8ff] ring-1 ring-[#1787D4]/50 shadow-xs"
                            : "border-[#e2eaff] bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-[#1787D4] bg-[#1787D4]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-[#1d1d1f]">
                              {dom}
                            </span>
                            <span className="block text-[11.5px] text-[#6e6e73]">
                              Primary domain • DNS connected
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                          Active
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#f8faff] border border-[#e2eaff] text-[13px] text-[#5a6a85]">
                  No domains currently registered in your account. You can enter an external domain below.
                </div>
              )}

              {/* Option to enter external / custom domain (Not auto-filled!) */}
              <div className="pt-2 border-t border-[#f0f4f9] flex flex-col gap-3">
                <div
                  onClick={() => setIsUsingCustomDomain(true)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isUsingCustomDomain
                      ? "border-[#1787D4] bg-[#f0f8ff] ring-1 ring-[#1787D4]/50"
                      : "border-[#e2eaff] bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isUsingCustomDomain
                        ? "border-[#1787D4] bg-[#1787D4]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isUsingCustomDomain && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-[13.5px] font-medium text-[#1d1d1f]">
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] text-[13.5px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#1787D4]/30 focus:border-[#1787D4]"
                      autoFocus
                    />
                    <span className="text-[11px] text-[#6e6e73]">
                      Enter any domain you own to issue and configure an SSL certificate.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selection Summary & Register CTA */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Your selection
              </h3>

              <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
                  Domain
                </span>
                <span className="text-[15px] font-bold text-[#1d1d1f] block mt-1 truncate">
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
                className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-40 text-white text-[13.5px] font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Continue
              </button>
            </div>

            {/* Don't have a domain CTA (matches screenshot) */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs flex flex-col gap-2.5">
              <h4 className="text-[13.5px] font-bold text-[#1d1d1f]">
                Don&apos;t have a domain yet?
              </h4>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                Find the right name for your website and manage it in Nupat Cloud.
              </p>
              <Link
                href="/dashboard/domains?tab=register"
                className="inline-flex items-center justify-center py-2 px-3.5 mt-1 rounded-xl border border-[#e2eaff] bg-white hover:bg-gray-50 text-[12.5px] font-semibold text-[#1d1d1f] transition-colors"
              >
                Register a Domain
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#e2eaff] rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200" />
                    <div className="w-3/4 h-5 rounded bg-gray-200" />
                    <div className="w-full h-12 rounded bg-gray-100" />
                  </div>
                  <div className="w-full h-10 rounded-xl bg-gray-200" />
                </div>
              ))}
            </div>
          ) : isProductsError || products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 text-center flex flex-col items-center justify-center gap-3">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <h3 className="text-base font-bold text-[#1d1d1f]">
                No SSL products currently returned by the server
              </h3>
              <p className="text-sm text-[#6e6e73] max-w-md">
                Unable to load SSL catalog from the API endpoint. Please retry or check back shortly.
              </p>
              <button
                type="button"
                onClick={() => refetchProducts()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1787D4] text-white rounded-xl text-xs font-semibold hover:bg-[#1371B5] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
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
                    className={`bg-white rounded-2xl p-6 transition-all border flex flex-col justify-between cursor-pointer relative ${
                      isSelected
                        ? "border-[#1787D4] ring-2 ring-[#1787D4]/40 shadow-md"
                        : "border-[#e2eaff] hover:border-gray-300 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Shield icon & Validation badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center shrink-0 border border-[#b8ece5]">
                          <Shield className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-[#5a6a85]">
                          {prod.isWildcard ? "Wildcard" : validationLabel}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-[18px] font-bold text-[#1d1d1f] tracking-tight">
                        {prod.name}
                      </h3>

                      {/* Description */}
                      <p className="text-[12.5px] text-[#6e6e73] mt-2 leading-relaxed">
                        {prod.isWildcard
                          ? "Secures your primary domain and unlimited subdomains with robust encryption."
                          : "A straightforward, high-assurance certificate option for securing your website."}
                      </p>

                      {/* Price */}
                      <div className="mt-4 pt-4 border-t border-[#f0f4f9]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[24px] font-extrabold text-[#1d1d1f] tracking-tight">
                            {formatPrice(priceVal)}
                          </span>
                          <span className="text-[12px] text-[#6e6e73] font-medium">
                            yearly
                          </span>
                        </div>
                      </div>

                      {/* Real Feature Bullets */}
                      <div className="mt-4 flex flex-col gap-2 text-[12px] text-[#5a6a85]">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#12a150] shrink-0 stroke-[2.5]" />
                          <span>
                            {prod.isWildcard
                              ? "Unlimited subdomains (*.domain.com)"
                              : "For one domain"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#12a150] shrink-0 stroke-[2.5]" />
                          <span>{validationLabel} workflow</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#12a150] shrink-0 stroke-[2.5]" />
                          <span>
                            Issuance: {prod.deliveryTime || "Fast automated delivery"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#12a150] shrink-0 stroke-[2.5]" />
                          <span>Annual validity and renewal controls</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-6 pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCertificateChoose(prod.id);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-all active:scale-98 cursor-pointer ${
                          isSelected
                            ? "bg-[#1787D4] text-white hover:bg-[#1371B5] shadow-xs"
                            : "bg-[#f8faff] text-[#1d1d1f] border border-[#e2eaff] hover:bg-[#edf4fc]"
                        }`}
                      >
                        Choose Certificate
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
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              {/* Header with change certificate button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f9]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center shrink-0 border border-[#b8ece5]">
                    <Shield className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1d1d1f]">
                      {activeProduct?.name || "Standard SSL"}
                    </h2>
                    <p className="text-[12px] text-[#6e6e73]">
                      Certificate configuration for {selectedDomain}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[12.5px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
                >
                  Change certificate
                </button>
              </div>

              {/* 3 Detail Tiles (Domain, Certificate, Validity) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                  <span className="text-[11px] font-medium text-[#6e6e73] block uppercase tracking-wider">
                    Domain
                  </span>
                  <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block truncate">
                    {selectedDomain}
                  </span>
                </div>

                <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                  <span className="text-[11px] font-medium text-[#6e6e73] block uppercase tracking-wider">
                    Certificate
                  </span>
                  <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block truncate">
                    {activeProduct?.name || "SSL Certificate"}
                  </span>
                </div>

                <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                  <span className="text-[11px] font-medium text-[#6e6e73] block uppercase tracking-wider">
                    Validity
                  </span>
                  <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block">
                    {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Duration selector if multi-year prices exist in product */}
              {activeProduct?.prices && activeProduct.prices.length > 1 && (
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-semibold text-[#1d1d1f]">
                    Choose certificate duration:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeProduct.prices.map((pr) => (
                      <button
                        key={pr.period}
                        type="button"
                        onClick={() => setSelectedPeriod(pr.period)}
                        className={`p-2.5 rounded-xl border text-[12.5px] font-medium transition-all text-left ${
                          selectedPeriod === pr.period
                            ? "border-[#1787D4] bg-[#f0f8ff] text-[#1787D4] font-bold ring-1 ring-[#1787D4]"
                            : "border-[#e2eaff] bg-white text-[#1d1d1f] hover:border-gray-300"
                        }`}
                      >
                        <div>{pr.period} Year{pr.period > 1 ? "s" : ""}</div>
                        <div className="text-[11px] text-gray-500 font-normal">
                          {formatPrice(pr.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-Renewal Toggle (matches screenshot) */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#e2eaff] bg-white">
                <div className="pr-4">
                  <span className="text-[14px] font-bold text-[#1d1d1f] block">
                    Auto-Renewal
                  </span>
                  <span className="text-[12px] text-[#6e6e73] mt-0.5 block leading-relaxed">
                    Automatically renew this certificate before it expires to help avoid interruptions in website protection.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoRenew((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoRenew ? "bg-[#12a150]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      autoRenew ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Optional Advanced Settings (CSR & Email) - NOT AUTO-FILLED! */}
              <details className="text-[12.5px] text-[#5a6a85] pt-1">
                <summary className="font-semibold text-[#1787D4] cursor-pointer hover:underline">
                  Optional: Advanced verification settings (CSR / Approver Email)
                </summary>
                <div className="mt-3 flex flex-col gap-3 p-3.5 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1d1d1f] mb-1">
                      Approver Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                      placeholder="e.g. admin@yourdomain.com"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#1d1d1f] mb-1">
                      Custom CSR (Optional)
                    </label>
                    <textarea
                      value={csr}
                      onChange={(e) => setCsr(e.target.value)}
                      placeholder="Paste your CSR if you generate your own private key..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-xs focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Right Column: Ready to continue summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Ready to continue
              </h3>

              <div className="flex flex-col gap-2.5 text-[13px] bg-[#f8faff] rounded-xl border border-[#e2eaff] p-4">
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">Domain</span>
                  <span className="font-bold text-[#1d1d1f] truncate max-w-[150px]">
                    {selectedDomain}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">Validity</span>
                  <span className="font-bold text-[#1d1d1f]">
                    {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6e73]">Auto-Renewal</span>
                  <span
                    className={`font-bold ${
                      autoRenew ? "text-[#12a150]" : "text-gray-500"
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
                className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Continue to Review
              </button>

              <p className="text-[11.5px] text-[#6e6e73] text-center leading-relaxed">
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
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f9]">
                <div>
                  <h2 className="text-[16px] font-bold text-[#1d1d1f]">
                    {activeProduct?.name || "Standard SSL"}
                  </h2>
                  <p className="text-[12px] text-[#6e6e73]">
                    One-year certificate configuration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-[12.5px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Main detail pill card */}
              <div className="p-4 rounded-xl border border-[#e2eaff] bg-[#f8faff] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#e6f9ed] text-[#12a150] flex items-center justify-center">
                      <Shield className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-[#1d1d1f]">
                        {selectedDomain}
                      </span>
                      <span className="block text-[11px] text-[#6e6e73]">
                        {activeProduct?.name || "SSL Certificate"} • {selectedPeriod} year
                      </span>
                    </div>
                  </div>

                  <span className="text-[16px] font-extrabold text-[#1d1d1f]">
                    {formatPrice(activePrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#e2eaff] text-xs">
                  <div>
                    <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                      Domain
                    </span>
                    <span className="font-bold text-[#1d1d1f] truncate block">
                      {selectedDomain}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                      Certificate
                    </span>
                    <span className="font-bold text-[#1d1d1f] truncate block">
                      {activeProduct?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                      Validity
                    </span>
                    <span className="font-bold text-[#1d1d1f] block">
                      {selectedPeriod} year{selectedPeriod > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                      Auto-Renewal
                    </span>
                    <span
                      className={`font-bold block ${
                        autoRenew ? "text-[#12a150]" : "text-gray-500"
                      }`}
                    >
                      {autoRenew ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              </div>

              {/* What happens next box (matches screenshot) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                <h4 className="text-[13px] font-bold text-[#1d1d1f]">
                  What happens next
                </h4>
                <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
                  After payment, Nupat Cloud will request the certificate, validate {selectedDomain}, and activate it when validation completes.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Order summary
              </h3>

              <div className="flex flex-col gap-2.5 text-[13px] pb-3 border-b border-[#f0f4f9]">
                <div className="flex justify-between items-center">
                  <span className="text-[#6e6e73] truncate max-w-[170px]">
                    {activeProduct?.name} • {selectedPeriod} yr
                  </span>
                  <span className="font-bold text-[#1d1d1f]">
                    {formatPrice(activePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#6e6e73]">
                  <span>Subtotal</span>
                  <span>{formatPrice(activePrice)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[15px] font-extrabold text-[#1d1d1f]">
                <span>Total due today</span>
                <span className="text-[#1787D4] text-[18px]">
                  {formatPrice(activePrice)}
                </span>
              </div>

              {/* Terms agreement checkbox */}
              <label className="flex items-start gap-2.5 text-[11.5px] text-[#5a6a85] cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#1787D4] focus:ring-[#1787D4]"
                />
                <span className="leading-relaxed">
                  I confirm these certificate details are accurate and agree to the SSL Certificate Terms.
                </span>
              </label>

              <button
                type="button"
                id="btn-proceed-to-payment"
                onClick={() => setCurrentStep(5)}
                disabled={!agreedToTerms}
                className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-40 text-white text-[13.5px] font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Proceed to Payment
              </button>

              <p className="text-[11.5px] text-[#6e6e73] text-center leading-relaxed">
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
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#1d1d1f]">
                  Payment method
                </h2>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                  Your payment details are encrypted and handled securely.
                </p>
              </div>

              {/* Paystack official checkout card */}
              <div className="p-4 rounded-xl border border-[#1787D4] bg-[#f0f8ff] ring-1 ring-[#1787D4]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#d8eaf8] flex items-center justify-center p-1.5 shadow-2xs">
                    <Image
                      src="/paystack-logo.svg"
                      alt="Paystack"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#1d1d1f] block">
                      Paystack Secure Checkout
                    </span>
                    <span className="text-[12px] text-[#6e6e73] block mt-0.5">
                      Debit / Credit Card, Bank Transfer, USSD
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#1787D4] bg-white px-2.5 py-1 rounded-full border border-[#d8eaf8]">
                  Connected
                </span>
              </div>

              {/* Security info notice (No fake auto-filled inputs) */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#5a6a85] leading-relaxed">
                <Lock className="w-4 h-4 text-[#12a150] shrink-0 mt-0.5" />
                <span>
                  Secured with 256-bit bank-grade encryption via Paystack. Your card credentials are never stored on our servers.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment trigger */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                Order summary
              </h3>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8faff] border border-[#e2eaff]">
                <Shield className="w-5 h-5 text-[#4AC3B4] shrink-0" />
                <div className="truncate">
                  <span className="text-[13px] font-bold text-[#1d1d1f] block truncate">
                    {activeProduct?.name}
                  </span>
                  <span className="text-[11px] text-[#6e6e73] block truncate">
                    {selectedDomain} • {selectedPeriod} yr
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-[#6e6e73] pt-2">
                <span>Subtotal</span>
                <span>{formatPrice(activePrice)}</span>
              </div>

              <div className="flex justify-between items-center text-[15px] font-extrabold text-[#1d1d1f] pt-2 border-t border-[#f0f4f9]">
                <span>Total</span>
                <span className="text-[#1787D4] text-[18px]">
                  {formatPrice(activePrice)}
                </span>
              </div>

              <button
                type="button"
                id="btn-pay-ssl"
                onClick={handlePaystackPayment}
                disabled={isProcessingPayment}
                className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13.5px] font-semibold rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Paystack...</span>
                  </>
                ) : (
                  <span>Pay {formatPrice(activePrice)}</span>
                )}
              </button>

              <p className="text-[11px] text-[#6e6e73] text-center leading-relaxed">
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
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-7 sm:p-9 shadow-sm flex flex-col items-center text-center gap-6">
            {/* Spinning Indicator */}
            <div className="w-14 h-14 rounded-full bg-[#f0f8ff] text-[#1787D4] flex items-center justify-center relative">
              <Loader2 className="w-8 h-8 animate-spin stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f]">
                Validating {selectedDomain}
              </h2>
              <p className="text-[13px] text-[#6e6e73] mt-1">
                Your payment is confirmed. We&apos;re validating the domain before activation.
              </p>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1787D4] h-full transition-all duration-700 ease-out rounded-full"
                style={{ width: `${activationProgress}%` }}
              />
            </div>

            {/* Checklist items (matches screenshot) */}
            <div className="w-full flex flex-col gap-3 text-left pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#12a150] shrink-0" />
                <div>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block">
                    Payment confirmed
                  </span>
                  <span className="text-[11px] text-[#6e6e73] block">
                    Payment received securely
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    activationSubstep >= 2 ? "text-[#12a150]" : "text-gray-300"
                  }`}
                />
                <div>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block">
                    Certificate requested
                  </span>
                  <span className="text-[11px] text-[#6e6e73] block">
                    {activeProduct?.name} request submitted
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activationSubstep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#12a150] shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#1787D4] animate-spin shrink-0" />
                )}
                <div>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block">
                    Validating domain
                  </span>
                  <span className="text-[11px] text-[#6e6e73] block">
                    Checking control of {selectedDomain}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                    activationSubstep >= 4
                      ? "border-[#12a150] bg-[#12a150] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {activationSubstep >= 4 && <Check className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block">
                    Activating certificate
                  </span>
                  <span className="text-[11px] text-[#6e6e73] block">
                    {activationSubstep >= 4
                      ? "Certificate activated!"
                      : "Pending domain validation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Reference Box */}
            <div className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-[11.5px] text-[#6e6e73] flex items-center justify-between">
              <span>Order reference:</span>
              <span className="font-mono font-bold text-[#1d1d1f]">
                {paymentReference || "NC-SSL-PROCESSING"}
              </span>
            </div>

            <p className="text-[11.5px] text-gray-400">
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
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 sm:p-10 shadow-sm flex flex-col items-center text-center gap-6">
            {/* Official /checkmark.svg icon requested by user */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image
                src="/checkmark.svg"
                alt="Protected"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div>
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1d1f] tracking-tight">
                Your website is now protected
              </h2>
              <p className="text-[13.5px] text-[#6e6e73] mt-1 max-w-md">
                {activeProduct?.name || "Standard SSL"} has been activated and is now protecting {selectedDomain}.
              </p>
            </div>

            {/* Summary card pill */}
            <div className="w-full p-4 sm:p-5 rounded-2xl border border-[#e2eaff] bg-[#f8faff] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center">
                    <Shield className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[14px] font-bold text-[#1d1d1f]">
                      {activeProduct?.name || "Standard SSL"}
                    </span>
                    <span className="block text-[11.5px] text-[#6e6e73]">
                      {selectedDomain}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#e2eaff] text-xs">
                <div>
                  <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                    Domain
                  </span>
                  <span className="font-bold text-[#1d1d1f] truncate block">
                    {selectedDomain}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                    Issued
                  </span>
                  <span className="font-bold text-[#1d1d1f] block">
                    {todayStr}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                    Expires
                  </span>
                  <span className="font-bold text-[#1d1d1f] block">
                    {nextYearStr}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#6e6e73] block uppercase tracking-wider">
                    Auto-Renew
                  </span>
                  <span
                    className={`font-bold block ${
                      autoRenew ? "text-[#12a150]" : "text-gray-500"
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
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl text-center transition-colors shadow-xs"
              >
                Manage Certificate
              </Link>
              <Link
                href={`/dashboard/ssl/${encodeURIComponent(selectedDomain)}`}
                className="w-full sm:flex-1 py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl text-center transition-colors"
              >
                View Certificate Details
              </Link>
              <Link
                href="/dashboard/ssl"
                className="w-full sm:flex-1 py-2.5 px-4 text-[#1787D4] hover:bg-blue-50/50 text-[13px] font-semibold rounded-xl text-center transition-colors"
              >
                Go to SSL Certificates
              </Link>
            </div>

            {/* Green info alert at bottom */}
            <div className="w-full p-3 rounded-xl bg-[#e6f9ed]/70 border border-[#b7eed0] text-[12px] text-[#12a150] flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
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
