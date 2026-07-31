"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Server,
  Globe,
  ArrowLeft,
  CreditCard,
  Loader2,
  AlertCircle,
  Check,
  Star,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { usePlans } from "@/hooks/usePlans";
import { usePurchaseHosting } from "@/hooks/useHosting";
import type { Plan } from "@/lib/api";

function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function HostingPurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: plans, isLoading: loadingPlans, isError: plansError } = usePlans();
  const { mutate: purchase, isPending: isPurchasing } = usePurchaseHosting();

  // Query params pre-selection
  const initialPlanId = searchParams.get("planId") ?? "";
  const initialCycle = (searchParams.get("billingCycle") as "monthly" | "quarterly" | "yearly") || "monthly";

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">(initialCycle);
  const [domain, setDomain] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Select initial plan once loaded if not set
  useEffect(() => {
    if (plans && plans.length > 0) {
      if (!selectedPlanId || !plans.some((p) => p.id === selectedPlanId)) {
        const popular = plans.find((p) => p.isPopular);
        setSelectedPlanId(popular?.id || plans[0].id);
      }
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) || plans?.[0];

  const getPrice = (plan: Plan) => {
    if (billingCycle === "monthly") return plan.monthlyPrice;
    if (billingCycle === "quarterly") return plan.quarterlyPrice;
    return plan.price;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setErrorMsg("Please select a hosting plan.");
      return;
    }
    const trimmed = domain.trim();
    if (!trimmed) {
      setErrorMsg("Primary domain name is required.");
      return;
    }
    if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(trimmed)) {
      setErrorMsg("Please enter a valid domain name (e.g. example.com).");
      return;
    }

    setErrorMsg("");
    purchase(
      {
        planId: selectedPlan.id,
        domain: trimmed,
        billingCycle,
      },
      {
        onSuccess: (res) => {
          if (res.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            setErrorMsg("No payment URL returned from server.");
          }
        },
        onError: (err) => {
          setErrorMsg(err.message || "Failed to initialize hosting purchase.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-7 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/hosting"
          id="purchase-back"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hosting Dashboard
        </Link>
        <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
          Purchase Web Hosting
        </h1>
        <p className="text-[#5a6a85] mt-1 text-sm">
          Select your hosting plan and primary domain to proceed to instant Paystack checkout.
        </p>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column: Plan Selection + Domain */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Step 1: Billing Cycle & Plan Selection */}
          <div className="bg-white border border-[#e2eaff]">
            <div className="px-5 py-4 border-b border-[#e2eaff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f6f9ff]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#031033] text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-sm font-bold text-[#031033]">Choose Plan &amp; Billing Cycle</h2>
              </div>
              
              {/* Billing Cycle Tabs */}
              <div className="inline-flex items-center bg-white border border-[#e2eaff] p-0.5 rounded-lg shrink-0">
                {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
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

            <div className="p-5 flex flex-col gap-3">
              {plansError && (
                <p className="text-xs text-red-500">Could not load plans. Please refresh.</p>
              )}
              {loadingPlans ? (
                <div className="flex flex-col gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#e8edf8] animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                plans?.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const price = getPrice(plan);

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#e8900a] bg-[#fff8ee] shadow-sm"
                          : "border-[#e2eaff] hover:border-[#dce4f7] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-center shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-[#e8900a] bg-[#e8900a]" : "border-[#c5cedf]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-3" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#031033]">{plan.name} Hosting</p>
                          {plan.isPopular && (
                            <span className="text-[10px] bg-[#e8900a] text-white font-extrabold px-1.5 py-0.5">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5a6a85] mt-0.5">
                          {plan.storage} Storage · {plan.bandwidth} Bandwidth · {plan.websites >= 999 ? "Unlimited" : plan.websites} Website{plan.websites > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-[#031033]">
                          {formatNGN(price)}
                        </p>
                        <span className="text-[10px] text-[#9ba8c0]">
                          /{billingCycle === "yearly" ? "yr" : billingCycle === "quarterly" ? "qtr" : "mo"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Primary Domain */}
          <div className="bg-white border border-[#e2eaff]">
            <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center gap-2 bg-[#f6f9ff]">
              <div className="w-6 h-6 bg-[#031033] text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm font-bold text-[#031033]">Enter Primary Domain</h2>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <p className="text-xs text-[#5a6a85] leading-relaxed">
                Specify the domain name to link with this hosting account. The backend will automatically provision cPanel for this domain upon payment completion.
              </p>

              <div className="flex flex-col gap-1.5 mt-1">
                <label
                  htmlFor="purchase-domain"
                  className="text-[11px] font-bold text-[#031033] uppercase tracking-wide"
                >
                  Domain Name
                </label>
                <div className="flex items-center bg-white border border-[#dce4f7] focus-within:border-[#e8900a] transition-all overflow-hidden">
                  <div className="pl-3.5 shrink-0">
                    <Globe className="w-4 h-4 text-[#9ba8c0]" />
                  </div>
                  <input
                    id="purchase-domain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#031033] placeholder-[#9ba8c0] outline-none"
                    disabled={isPurchasing}
                  />
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 p-3.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="bg-white border border-[#e2eaff]">
            <div className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff]">
              <h2 className="text-sm font-bold text-[#031033]">Order Summary</h2>
            </div>

            {selectedPlan && (
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <p className="font-bold text-[#031033]">{selectedPlan.name} Hosting</p>
                    <p className="text-[#9ba8c0] capitalize mt-0.5">{billingCycle} Billing</p>
                  </div>
                  <span className="font-semibold text-[#031033]">
                    {formatNGN(getPrice(selectedPlan))}
                  </span>
                </div>

                {domain.trim() && (
                  <div className="flex justify-between items-center text-xs border-t border-[#f0f4fc] pt-3">
                    <span className="text-[#5a6a85]">Domain</span>
                    <span className="font-mono text-[#031033]">{domain.trim()}</span>
                  </div>
                )}

                <div className="border-t border-[#e2eaff] pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#031033]">Total</span>
                  <span className="text-xl font-extrabold text-[#031033]">
                    {formatNGN(getPrice(selectedPlan))}
                  </span>
                </div>

                <button
                  id="hosting-purchase-pay-btn"
                  onClick={handlePay}
                  disabled={isPurchasing || !selectedPlan}
                  className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing Payment…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {formatNGN(getPrice(selectedPlan))}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#9ba8c0] flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secured via Paystack
                </p>
              </div>
            )}
          </div>

          {/* Value Props */}
          <div className="bg-[#f6f9ff] border border-[#e2eaff] p-4 flex flex-col gap-2.5">
            {[
              { icon: Zap, text: "Instant auto-provisioning via webhook" },
              { icon: ShieldCheck, text: "Free SSL certificate & daily backups" },
              { icon: Server, text: "99.9% Uptime Guarantee" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-[#5a6a85]">
                <Icon className="w-3.5 h-3.5 text-[#e8900a] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HostingPurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
          <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
          <p className="text-sm text-[#5a6a85]">Loading purchase page...</p>
        </div>
      }
    >
      <HostingPurchaseContent />
    </Suspense>
  );
}
