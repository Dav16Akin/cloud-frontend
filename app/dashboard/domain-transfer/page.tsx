"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShoppingCart,
  Eye,
  EyeOff,
  Globe,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCheckTransferEligibility,
  useGetTransfers,
  useGetTransferStatus,
} from "@/hooks/useDomains";
import { useCartStore } from "@/store/cartStore";

function DomainTransferPageContent() {
  const searchParams = useSearchParams();
  const queryDomain = searchParams.get("domain") ?? "";
  const [domainName, setDomainName] = useState(queryDomain);
  const [authCode, setAuthCode] = useState("");
  const [showAuthCode, setShowAuthCode] = useState(false);

  // Auto-mask sensitive authorization code after 30 seconds
  useEffect(() => {
    if (!showAuthCode) return;
    const timer = setTimeout(() => {
      setShowAuthCode(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, [showAuthCode]);

  const [eligibilityResult, setEligibilityResult] = useState<{
    domainName: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    if (queryDomain) {
      setDomainName(queryDomain);
    }
  }, [queryDomain]);

  const checkEligibilityMutation = useCheckTransferEligibility();
  const refreshStatusMutation = useGetTransferStatus();
  const {
    data: transfers,
    isLoading: loadingTransfers,
    refetch: refetchTransfers,
  } = useGetTransfers();
  const { addDomainTransferItem, removeItem, hasItem, openDrawer } =
    useCartStore();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim() || !authCode.trim()) {
      toast.error(
        "Please fill in both the domain name and the authorization code."
      );
      return;
    }

    setEligibilityResult(null);

    checkEligibilityMutation.mutate(
      { domainName: domainName.trim(), authCode: authCode.trim() },
      {
        onSuccess: (res) => {
          if (res?.data?.transferable) {
            setEligibilityResult({
              domainName: res.data.domainName,
              price: res.data.price,
            });
            toast.success("Domain is eligible for transfer.");
          } else {
            toast.error(res?.message || "Domain is not eligible for transfer.");
          }
        },
      }
    );
  };

  const handleAddToCart = () => {
    if (!eligibilityResult) return;

    const fullDomain = eligibilityResult.domainName.toLowerCase();
    const dotIdx = fullDomain.indexOf(".");
    const name = dotIdx !== -1 ? fullDomain.slice(0, dotIdx) : fullDomain;
    const ext = dotIdx !== -1 ? fullDomain.slice(dotIdx + 1) : "";

    addDomainTransferItem({
      type: "DOMAIN_TRANSFER",
      domainName: name,
      extension: ext,
      price: eligibilityResult.price,
      authCode: authCode.trim(),
    });

    toast.success(`${eligibilityResult.domainName} transfer added to cart.`);
    openDrawer();
  };

  const handleRemoveFromCart = () => {
    if (!eligibilityResult) return;
    const fullDomain = eligibilityResult.domainName.toLowerCase();
    const dotIdx = fullDomain.indexOf(".");
    const name = dotIdx !== -1 ? fullDomain.slice(0, dotIdx) : fullDomain;
    const ext = dotIdx !== -1 ? fullDomain.slice(dotIdx + 1) : "";

    removeItem(`domain-transfer:${name}.${ext}`);
    toast.info(`${eligibilityResult.domainName} removed from cart.`);
  };

  const isAlreadyInCart = () => {
    if (!eligibilityResult) return false;
    const fullDomain = eligibilityResult.domainName.toLowerCase();
    const dotIdx = fullDomain.indexOf(".");
    const name = dotIdx !== -1 ? fullDomain.slice(0, dotIdx) : fullDomain;
    const ext = dotIdx !== -1 ? fullDomain.slice(dotIdx + 1) : "";
    return hasItem(`domain-transfer:${name}.${ext}`);
  };

  const handleRefreshStatus = (transferId: string) => {
    refreshStatusMutation.mutate(transferId, {
      onSuccess: () => {
        refetchTransfers();
      },
    });
  };

  const formatNGN = (n: number) => {
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Metrics
  const totalTransfers = transfers?.length || 0;
  const completedTransfers =
    transfers?.filter((t) => t.status === "COMPLETED").length || 0;
  const inProgressTransfers =
    transfers?.filter(
      (t) => t.status === "PENDING" || t.status === "PROCESSING"
    ).length || 0;

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";
  const btnPrimary = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;
  const btnSecondary = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;
  const inputCls =
    "w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15";
  const pillBase =
    "inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]";
  const dotBase = "h-2 w-2 shrink-0 rounded-full";
  const sentenceCase = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

  const stats = [
    { label: "Total transfers", value: totalTransfers },
    { label: "Completed", value: completedTransfers },
    { label: "In progress", value: inProgressTransfers },
  ];

  const requirements = [
    {
      title: "Unlock the domain",
      body: "Turn the registrar lock off at your current provider.",
    },
    {
      title: "Get the EPP code",
      body: "Request the authorization code from your current registrar.",
    },
    {
      title: "60 days since registration",
      body: "The domain must be at least 60 days old.",
    },
    {
      title: "One year added",
      body: "The expiry date moves out by a year when the transfer completes.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">
            Domain transfer
          </h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Move your domains to Nupat Cloud. Each transfer adds a year to the
            registration.
          </p>
        </div>

        <Link
          href="/dashboard/domains"
          className={`${btnSecondary} self-start`}
        >
          <Globe className="w-4 h-4 text-[#5A6A85]" />
          View my domains
        </Link>
      </div>

      {/* Stats: one container split by hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#EEF2F7]">
        {stats.map((s) => (
          <div key={s.label} className="p-5 flex flex-col gap-1">
            <span className="text-xs text-[#5A6A85]">{s.label}</span>
            {loadingTransfers ? (
              <div className="h-8 w-10 rounded bg-[#EEF2F7] animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums text-[#031033]">
                {s.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main form & instructions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (8 cols): initiation card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-[#031033]">
                Start a domain transfer
              </h2>
              <p className="text-sm text-[#5A6A85] mt-1">
                Enter the domain and the EPP authorization code from your
                current registrar.
              </p>
            </div>

            <form onSubmit={handleCheck} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="transfer-domain-name"
                  className="text-sm font-medium text-[#031033] block mb-1.5"
                >
                  Domain name <span className="text-[#C21F1F]">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="transfer-domain-name"
                    type="text"
                    required
                    placeholder="mybusiness.com"
                    value={domainName}
                    onChange={(e) => {
                      setDomainName(e.target.value);
                      if (eligibilityResult) setEligibilityResult(null);
                    }}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="transfer-auth-code"
                    className="text-sm font-medium text-[#031033]"
                  >
                    Authorization code (EPP){" "}
                    <span className="text-[#C21F1F]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAuthCode(!showAuthCode)}
                    className={`inline-flex items-center gap-1 rounded-md text-xs font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors ${focusRing}`}
                  >
                    {showAuthCode ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide code
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show code
                      </>
                    )}
                  </button>
                </div>
                <input
                  id="transfer-auth-code"
                  type={showAuthCode ? "text" : "password"}
                  required
                  placeholder="e.g. EP-x899-auth-code"
                  value={authCode}
                  onChange={(e) => {
                    setAuthCode(e.target.value);
                    if (eligibilityResult) setEligibilityResult(null);
                  }}
                  className={`${inputCls} font-mono`}
                />
                <p className="text-xs text-[#5A6A85] mt-1.5">
                  You can find the EPP code in your current provider&apos;s
                  domain management portal.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={checkEligibilityMutation.isPending}
                  className={`${eligibilityResult ? btnSecondary : btnPrimary} w-full sm:w-auto`}
                >
                  {checkEligibilityMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking eligibility…
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Check transfer eligibility
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Eligibility result */}
            {eligibilityResult && (
              <div className="rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0E7C3A] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#0E7C3A]">
                      Eligible for transfer
                    </h3>
                    <p className="text-sm text-[#031033] mt-0.5 break-all">
                      {eligibilityResult.domainName}
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-2xl font-semibold tabular-nums text-[#031033]">
                        {formatNGN(eligibilityResult.price)}
                      </span>
                      <span className="text-xs text-[#5A6A85]">
                        includes a 1-year renewal
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {isAlreadyInCart() ? (
                    <button
                      type="button"
                      onClick={handleRemoveFromCart}
                      className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-[#F3C7C7] bg-white text-[#C21F1F] hover:bg-[#FDECEC] transition-colors w-full sm:w-auto ${focusRing}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Remove from cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`${btnPrimary} w-full sm:w-auto`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to cart and check out
                    </button>
                  )}
                </div>
              </div>
            )}

            {checkEligibilityMutation.isError && (
              <div className="rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#C21F1F]">
                    Verification failed
                  </p>
                  <p className="text-[#C21F1F] mt-0.5">
                    {checkEligibilityMutation.error.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column (4 cols): requirements */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-xl border border-[#E2E8F0] bg-white">
            <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5A6A85]" />
              <h2 className="text-base font-semibold text-[#031033]">
                Transfer requirements
              </h2>
            </div>

            <ol className="p-5 flex flex-col gap-4 text-sm">
              {requirements.map((r, i) => (
                <li key={r.title} className="flex items-start gap-3">
                  <span className="w-4 shrink-0 text-sm font-medium tabular-nums text-[#5A6A85]">
                    {i + 1}.
                  </span>
                  <div>
                    <p className="font-medium text-[#031033]">{r.title}</p>
                    <p className="text-[#5A6A85] mt-0.5">{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#031033] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#1787D4]" /> Need help?
            </span>
            <p className="text-sm text-[#5A6A85] leading-relaxed">
              Our team can run the transfer or migration for you. Open a
              support ticket to get started.
            </p>
            <Link
              href="/dashboard/tickets"
              className={`self-start inline-flex items-center gap-1 rounded-md text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors mt-1 ${focusRing}`}
            >
              Open a ticket <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transfer records table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#5A6A85]" />
            <h2 className="text-base font-semibold text-[#031033]">
              Transfer history
            </h2>
          </div>
          <button
            type="button"
            onClick={() => refetchTransfers()}
            disabled={loadingTransfers}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingTransfers ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {loadingTransfers ? (
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-6 px-5 py-3 border-b border-[#EEF2F7] last:border-0"
              >
                <div className="h-4 w-40 rounded bg-[#EEF2F7]" />
                <div className="h-5 w-20 rounded-full bg-[#EEF2F7]" />
                <div className="h-4 w-24 rounded bg-[#EEF2F7] ml-auto" />
                <div className="h-5 w-20 rounded-full bg-[#EEF2F7]" />
              </div>
            ))}
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <p className="text-sm font-medium text-[#031033]">
              No domain transfers yet
            </p>
            <p className="text-sm text-[#5A6A85] max-w-sm mt-1">
              Start a transfer above and follow its registry progress here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-5 py-3 text-xs font-medium text-[#5A6A85]">
                    Domain
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#5A6A85]">
                    Direction
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#5A6A85] text-right">
                    Started
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#5A6A85]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#5A6A85] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => {
                  const isProcessing =
                    transfer.status === "PROCESSING" ||
                    transfer.status === "PENDING";

                  return (
                    <tr
                      key={transfer.id}
                      className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-[#031033]">
                        {transfer.domainName}
                      </td>
                      <td className="px-5 py-3 text-[#5A6A85] whitespace-nowrap">
                        {transfer.direction === "IN"
                          ? "Transfer in"
                          : "Transfer out"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-[#5A6A85] whitespace-nowrap">
                        {formatDate(transfer.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        {transfer.status === "COMPLETED" && (
                          <span className={pillBase}>
                            <span aria-hidden className={`${dotBase} bg-[#12A150]`} />
                            Completed
                          </span>
                        )}
                        {isProcessing && (
                          <span className={pillBase}>
                            <span
                              aria-hidden
                              className={`${dotBase} ${
                                transfer.status === "PENDING"
                                  ? "bg-[#E8900A]"
                                  : "bg-[#1787D4]"
                              }`}
                            />
                            {sentenceCase(transfer.status)}
                          </span>
                        )}
                        {transfer.status === "FAILED" && (
                          <span className={`${pillBase} text-[#C21F1F]`}>
                            <span aria-hidden className={`${dotBase} bg-[#DC2626]`} />
                            Failed
                          </span>
                        )}
                        {transfer.status === "CANCELLED" && (
                          <span className={pillBase}>
                            <span aria-hidden className={`${dotBase} bg-[#DC2626]`} />
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {transfer.direction === "IN" && isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleRefreshStatus(transfer.id)}
                            disabled={refreshStatusMutation.isPending}
                            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
                          >
                            {refreshStatusMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5 text-[#5A6A85]" />
                            )}
                            Check status
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DomainTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DomainTransferPageContent />
    </Suspense>
  );
}
