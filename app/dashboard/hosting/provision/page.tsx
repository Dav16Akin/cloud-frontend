"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Server,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Lock,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import { useProvisionHosting } from "@/hooks/useHosting";
import { useGetOrders, useInitializePayment } from "@/hooks/useOrders";
import type { ProvisionHostingResult } from "@/lib/api";

// ── Credentials Success Modal ─────────────────────────────────────────────────

function SuccessModal({
  data,
  onClose,
}: {
  data: ProvisionHostingResult;
  onClose: () => void;
}) {
  const copyAll = () => {
    const text = [
      `Domain: ${data.domain}`,
      `cPanel URL: ${data.cpanelUrl}`,
      `Username: ${data.cpanelUsername}`,
      `Password: ${data.cpanelPassword}`,
    ].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Credentials copied to clipboard!"));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white border border-[#e2eaff] w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2
                id="success-modal-title"
                className="text-sm font-semibold text-[#031033]"
              >
                Hosting Provisioned!
              </h2>
              <p className="text-xs text-[#9ba8c0]">{data.domain}</p>
            </div>
          </div>
          <button
            id="success-modal-close"
            onClick={onClose}
            className="p-1.5 text-[#9ba8c0] hover:bg-[#f2f5fc] hover:text-[#031033] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Warning banner */}
          <div className="bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Save these credentials now.</strong> The password will
              not be shown again after you close this window. Store them in a
              secure location.
            </p>
          </div>

          {/* Credential fields */}
          {[
            { label: "cPanel URL", value: data.cpanelUrl, isLink: true },
            { label: "Username", value: data.cpanelUsername, isLink: false },
            { label: "Password", value: data.cpanelPassword, isLink: false },
          ].map(({ label, value, isLink }) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-1.5">
                {label}
              </p>
              <div className="flex items-center gap-2 bg-[#f6f9ff] border border-[#e2eaff] px-3 py-2">
                <code className="flex-1 text-sm text-[#031033] font-mono break-all select-all">
                  {value}
                </code>
                {isLink && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e8900a] hover:text-[#c97a08] shrink-0"
                    aria-label="Open cPanel URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {!isLink && (
                  <Lock className="w-3.5 h-3.5 text-[#9ba8c0] shrink-0" />
                )}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              id="success-copy-all"
              onClick={copyAll}
              className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
            >
              Copy All Credentials
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment Gate Banner ───────────────────────────────────────────────────────

function PaymentGate({
  planId,
  planName,
  price,
  billingCycle,
  isPaying,
  onPay,
}: {
  planId: string;
  planName: string;
  price: number;
  billingCycle: string;
  isPaying: boolean;
  onPay: () => void;
}) {
  return (
    <div className="bg-white border border-[#e2eaff] p-6 flex flex-col gap-5">
      {/* Gate notice */}
      <div className="flex items-start gap-3 bg-[#fff8ee] border border-amber-200 p-4">
        <ShieldCheck className="w-5 h-5 text-[#e8900a] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#031033]">
            Payment required to provision hosting
          </p>
          <p className="text-xs text-[#5a6a85] mt-1 leading-relaxed">
            You need to complete payment for the{" "}
            <strong>{planName} Hosting</strong> plan before your domain can be
            provisioned on our servers.
          </p>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-[#f6f9ff] border border-[#e2eaff] divide-y divide-[#e2eaff]">
        {[
          { label: "Plan", value: `${planName} Hosting` },
          {
            label: "Amount",
            value: `₦${price.toLocaleString("en-NG")} / ${billingCycle === "yearly" ? "year" : billingCycle}`,
          },
          { label: "Payment", value: "Secured via Paystack" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <span className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
              {label}
            </span>
            <span className="text-sm font-semibold text-[#031033]">{value}</span>
          </div>
        ))}
      </div>

      {/* Pay button */}
      <button
        id="provision-pay-now"
        onClick={onPay}
        disabled={isPaying}
        className="btn-primary text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to Paystack…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ₦{price.toLocaleString("en-NG")} &amp; Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-[#9ba8c0]">
        You'll be redirected to Paystack's secure checkout. After payment, you'll
        return here to configure your domain.
      </p>
    </div>
  );
}

// ── Provision Form ────────────────────────────────────────────────────────────

export default function ProvisionHostingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planIdParam = searchParams.get("planId") ?? "";
  const planNameParam = searchParams.get("planName") ?? "";

  const { data: plans, isLoading: loadingPlans } = usePlans();
  const { data: orders, isLoading: loadingOrders } = useGetOrders();
  const { mutate: provision, isPending } = useProvisionHosting();
  const { mutate: initPay, isPending: isPaying } = useInitializePayment();

  const [selectedPlanId, setSelectedPlanId] = useState(planIdParam);
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [credentials, setCredentials] = useState<ProvisionHostingResult | null>(
    null,
  );

  // Sync plan if URL changes
  useEffect(() => {
    if (planIdParam) setSelectedPlanId(planIdParam);
  }, [planIdParam]);

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  // Check if there's a paid, un-provisioned order for the selected plan
  const paidOrder = selectedPlanId
    ? orders?.find((o) => o.planId === selectedPlanId && o.status === "PAID")
    : null;

  const hasPaidOrder = !!paidOrder;
  const checkingOrders = loadingOrders;

  const validateDomain = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!trimmed) return "Domain is required.";
    if (!domainRegex.test(trimmed))
      return "Enter a valid domain (e.g. mysite.com).";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDomain(domain);
    if (err) {
      setDomainError(err);
      return;
    }
    if (!selectedPlanId) {
      toast.error("Please select a hosting plan.");
      return;
    }

    provision(
      { domain: domain.trim().toLowerCase(), planId: selectedPlanId },
      {
        onSuccess: (res) => {
          setCredentials(res.data);
        },
      },
    );
  };

  const handlePayNow = () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan first.");
      return;
    }
    initPay(selectedPlanId, {
      onSuccess: (res) => {
        // Redirect to Paystack checkout
        window.location.href = res.data.paymentUrl;
      },
    });
  };

  return (
    <>
      {credentials && (
        <SuccessModal
          data={credentials}
          onClose={() => {
            setCredentials(null);
            router.push("/dashboard/hosting");
          }}
        />
      )}

      <div className="flex flex-col gap-7 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/hosting"
            id="provision-back"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Hosting
          </Link>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
            Provision Hosting
          </h1>
          <p className="text-[#5a6a85] mt-1 text-sm">
            {hasPaidOrder
              ? "Your payment is confirmed. Enter your domain to complete setup."
              : "Select a plan and complete payment to provision your hosting account."}
          </p>
        </div>

        {/* Plan Selector */}
        <div className="bg-white border border-[#e2eaff] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-[#9ba8c0]" />
            <h2 className="text-sm font-semibold text-[#031033]">
              Select Plan
            </h2>
          </div>

          {loadingPlans ? (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-[#e8edf8] animate-pulse rounded"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {plans?.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <label
                    key={plan.id}
                    htmlFor={`plan-${plan.id}`}
                    className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#e8900a] bg-[#fff8ee]"
                        : "border-[#e2eaff] hover:border-[#e8900a]/50 hover:bg-[#fffdf8]"
                    }`}
                  >
                    <input
                      id={`plan-${plan.id}`}
                      type="radio"
                      name="planId"
                      value={plan.id}
                      checked={isSelected}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="accent-[#e8900a] w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#031033] flex items-center gap-2">
                        {plan.name} Hosting
                        {plan.isPopular && (
                          <span className="text-[10px] bg-[#e8900a] text-white px-1.5 py-0.5 font-bold">
                            Popular
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#9ba8c0] mt-0.5">
                        {plan.storage} · {plan.bandwidth} ·{" "}
                        {plan.billingCycle}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-[#031033] shrink-0">
                      ₦{plan.price.toLocaleString("en-NG")}
                      <span className="text-[11px] font-normal text-[#9ba8c0]">
                        /{plan.billingCycle === "yearly" ? "yr" : plan.billingCycle}
                      </span>
                    </p>
                  </label>
                );
              })}
            </div>
          )}

          {!selectedPlanId && !loadingPlans && (
            <p className="text-xs text-[#9ba8c0]">
              No plan selected. Choose one above, or{" "}
              <Link
                href="/pricing"
                className="text-[#e8900a] hover:underline underline-offset-2"
              >
                compare plans
              </Link>
              .
            </p>
          )}
        </div>

        {/* ── Payment gate OR domain form ─────────────────────────────────── */}

        {selectedPlan && (
          <>
            {/* Checking orders loader */}
            {checkingOrders && (
              <div className="flex items-center gap-3 p-4 bg-white border border-[#e2eaff]">
                <Loader2 className="w-4 h-4 animate-spin text-[#e8900a] shrink-0" />
                <p className="text-sm text-[#5a6a85]">
                  Checking your order status…
                </p>
              </div>
            )}

            {/* Payment gate — no paid order yet */}
            {!checkingOrders && !hasPaidOrder && (
              <PaymentGate
                planId={selectedPlan.id}
                planName={selectedPlan.name}
                price={selectedPlan.price}
                billingCycle={selectedPlan.billingCycle}
                isPaying={isPaying}
                onPay={handlePayNow}
              />
            )}

            {/* Paid order confirmed — show domain form */}
            {!checkingOrders && hasPaidOrder && (
              <>
                {/* Paid badge */}
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    Payment confirmed for{" "}
                    <strong>{selectedPlan.name} Hosting</strong>. Enter your
                    domain below to complete setup.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Domain Input */}
                  <div className="bg-white border border-[#e2eaff] p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-[#9ba8c0]" />
                      <h2 className="text-sm font-semibold text-[#031033]">
                        Domain Name
                      </h2>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="provision-domain"
                        className="text-xs font-semibold text-[#5a6a85]"
                      >
                        Your domain (you must own this domain)
                      </label>
                      <div
                        className={`flex items-center border transition-colors ${
                          domainError
                            ? "border-red-400 bg-red-50"
                            : "border-[#e2eaff] bg-[#f6f9ff] focus-within:border-[#e8900a]"
                        }`}
                      >
                        <span className="px-3 text-[#9ba8c0] text-sm select-none shrink-0">
                          https://
                        </span>
                        <input
                          id="provision-domain"
                          type="text"
                          value={domain}
                          onChange={(e) => {
                            setDomain(e.target.value);
                            if (domainError) setDomainError("");
                          }}
                          onBlur={() => {
                            const err = validateDomain(domain);
                            setDomainError(err);
                          }}
                          placeholder="mywebsite.com"
                          className="flex-1 py-2.5 pr-3 bg-transparent text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      {domainError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {domainError}
                        </p>
                      )}
                      <p className="text-[11px] text-[#9ba8c0]">
                        Make sure you have access to this domain's DNS settings
                        to point it to our nameservers.
                      </p>
                    </div>
                  </div>

                  {/* Summary + Submit */}
                  <div className="bg-[#031033] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {selectedPlan.name} Hosting
                        {domain && (
                          <span className="text-[#9ba8c0] font-normal">
                            {" "}— {domain.trim() || "…"}
                          </span>
                        )}
                      </p>
                      <p className="text-[#9ba8c0] text-xs mt-0.5">
                        ₦{selectedPlan.price.toLocaleString("en-NG")} /{" "}
                        {selectedPlan.billingCycle === "yearly"
                          ? "year"
                          : selectedPlan.billingCycle}
                      </p>
                    </div>
                    <button
                      id="provision-submit"
                      type="submit"
                      disabled={isPending || !selectedPlanId}
                      className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Provisioning…
                        </>
                      ) : (
                        <>
                          <Server className="w-4 h-4" />
                          Provision Hosting
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}

        {!selectedPlan && !loadingPlans && (
          <button
            id="provision-submit-disabled"
            type="button"
            disabled
            className="btn-primary text-sm py-3 px-6 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Server className="w-4 h-4" />
            Select a Plan to Continue
          </button>
        )}

        {/* Info note */}
        <div className="flex gap-2 text-xs text-[#5a6a85]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            Your hosting account will be provisioned instantly after payment.
            cPanel credentials and nameservers will be provided upon completion.
          </p>
        </div>
      </div>
    </>
  );
}
