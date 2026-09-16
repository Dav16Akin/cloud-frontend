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
            toast.success("Domain is eligible for transfer!");
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

    toast.success(`${eligibilityResult.domainName} transfer added to cart!`);
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            Domain Transfer
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Transfer your domains to Nupat Cloud with seamless renewal extension.
          </p>
        </div>

        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e2eaff] hover:bg-[#f8fafc] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Globe className="w-4 h-4 text-[#1787D4]" />
          View My Domains
        </Link>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Transfers */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Total Transfers
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {loadingTransfers ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              totalTransfers
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Completed
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {loadingTransfers ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              completedTransfers
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            In Progress
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {loadingTransfers ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              inProgressTransfers
            )}
          </div>
        </div>
      </div>

      {/* Main Form & Instructions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Initiation Card */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-5">
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#1787D4] bg-[#eff6fc] px-2.5 py-1 rounded-full">
                Transfer In
              </span>
              <h3 className="text-[17px] font-bold text-[#1d1d1f] mt-2.5">
                Initiate a Domain Transfer
              </h3>
              <p className="text-[13px] text-[#6e6e73] mt-0.5">
                Enter your domain and the authorization EPP code provided by your
                current registrar.
              </p>
            </div>

            <form onSubmit={handleCheck} className="flex flex-col gap-4">
              <div>
                <label className="text-[12.5px] font-semibold text-[#1d1d1f] block mb-1.5">
                  Domain Name *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="mybusiness.com"
                    value={domainName}
                    onChange={(e) => {
                      setDomainName(e.target.value);
                      if (eligibilityResult) setEligibilityResult(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12.5px] font-semibold text-[#1d1d1f]">
                    Authorization Code (EPP Code) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAuthCode(!showAuthCode)}
                    className="text-[12px] font-medium text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1 cursor-pointer"
                  >
                    {showAuthCode ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Code
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Reveal Code
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAuthCode ? "text" : "password"}
                    required
                    placeholder="e.g. EP-x899-auth-code"
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      if (eligibilityResult) setEligibilityResult(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-xs font-mono"
                  />
                </div>
                <p className="text-[11.5px] text-[#6e6e73] mt-1.5">
                  The EPP code is obtained directly from your domain management
                  portal at your current provider.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={checkEligibilityMutation.isPending}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
                >
                  {checkEligibilityMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Eligibility…
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Check Transfer Eligibility
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Eligibility Result Box */}
            {eligibilityResult && (
              <div className="bg-[#effaf2] border border-[#a3e5b9] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d5f5e0] flex items-center justify-center text-[#12a150] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14.5px] font-bold text-[#1d1d1f]">
                      Eligible for Transfer!
                    </h4>
                    <p className="text-[12.5px] text-[#4b5563] mt-0.5">
                      Domain:{" "}
                      <span className="font-semibold text-[#1d1d1f]">
                        {eligibilityResult.domainName}
                      </span>
                    </p>
                    <p className="text-[18px] font-extrabold text-[#12a150] mt-1.5 flex items-baseline gap-1.5">
                      {formatNGN(eligibilityResult.price)}
                      <span className="text-[12px] font-normal text-[#6e6e73]">
                        (includes 1-year registration renewal)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {isAlreadyInCart() ? (
                    <button
                      type="button"
                      onClick={handleRemoveFromCart}
                      className="w-full sm:w-auto px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Remove from Cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart &amp; Checkout
                    </button>
                  )}
                </div>
              </div>
            )}

            {checkEligibilityMutation.isError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mt-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-[13px]">
                  <p className="font-bold text-red-700">
                    Verification Unsuccessful
                  </p>
                  <p className="text-red-600 mt-0.5">
                    {checkEligibilityMutation.error.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Checklist / Guide Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1787D4]" />
              Transfer Requirements
            </h3>

            <div className="flex flex-col gap-3.5 text-[12.5px] text-[#6e6e73]">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#eff6fb] text-[#1787D4] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#1d1d1f] block font-semibold">
                    Unlock Domain
                  </strong>
                  Ensure registrar lock is turned OFF at your current provider.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#eff6fb] text-[#1787D4] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#1d1d1f] block font-semibold">
                    Obtain EPP Code
                  </strong>
                  Request the authorization secret code from your registrar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#eff6fb] text-[#1787D4] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#1d1d1f] block font-semibold">
                    60-Day Minimum
                  </strong>
                  Domains must be at least 60 days old since initial
                  registration.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#eff6fb] text-[#1787D4] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-[#1d1d1f] block font-semibold">
                    1-Year Extension
                  </strong>
                  Your expiration date extends by a full year automatically upon
                  completion.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#eff6fb] border border-[#d3e7f8] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#1787D4] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Need assistance?
            </span>
            <p className="text-[12px] text-[#4b5563] leading-relaxed">
              Our team can handle migrations and transfers for you. Reach out
              via Support Tickets for concierge onboarding.
            </p>
            <Link
              href="/dashboard/tickets"
              className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] inline-flex items-center gap-1 mt-1"
            >
              Open a Ticket <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transfers Progress & History Table */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-2">
        <div className="px-6 py-4 border-b border-[#eef2f8] bg-[#fbfcfe] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#1787D4]" />
            <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
              Transfer Records &amp; Progress
            </h3>
          </div>
          <button
            type="button"
            onClick={() => refetchTransfers()}
            disabled={loadingTransfers}
            className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingTransfers ? "animate-spin" : ""}`}
            />
            Refresh List
          </button>
        </div>

        {loadingTransfers ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
            <p className="text-[13px] text-[#6e6e73]">
              Loading transfer records…
            </p>
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4] mb-2">
              <ArrowRightLeft className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              No domain transfers found
            </p>
            <p className="text-[12.5px] text-[#6e6e73] max-w-sm mt-0.5">
              Initiate your first transfer above and you can monitor real-time
              registry progress here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Domain Name
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Direction
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Initiation Date
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f5fc]">
                {transfers.map((transfer) => {
                  const isProcessing =
                    transfer.status === "PROCESSING" ||
                    transfer.status === "PENDING";

                  return (
                    <tr
                      key={transfer.id}
                      className="hover:bg-[#fbfcfe] transition-colors"
                    >
                      <td className="py-5 px-6">
                        <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                          {transfer.domainName}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#eef6fc] text-[#1787D4] border border-[#d6eaf8]">
                          {transfer.direction === "IN"
                            ? "Transfer In"
                            : "Transfer Out"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-[13px] text-[#6e6e73]">
                        {formatDate(transfer.createdAt)}
                      </td>
                      <td className="py-5 px-6">
                        {transfer.status === "COMPLETED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                            Completed
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef5e7] text-[#e8900a] border border-[#fde1b0]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {transfer.status}
                          </span>
                        )}
                        {transfer.status === "FAILED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef0f0] text-[#f56c6c] border border-[#fde2e2]">
                            Failed
                          </span>
                        )}
                        {transfer.status === "CANCELLED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        {transfer.direction === "IN" && isProcessing && (
                          <button
                            type="button"
                            onClick={() => handleRefreshStatus(transfer.id)}
                            disabled={refreshStatusMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e2eaff] hover:bg-[#f8fafc] text-[#1787D4] text-[12px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                          >
                            {refreshStatusMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Check Status
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DomainTransferPageContent />
    </Suspense>
  );
}
