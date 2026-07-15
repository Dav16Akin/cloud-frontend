"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  ShoppingCart,
  Eye,
  EyeOff,
  Globe,
  Clock,
  ShieldAlert,
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
  const { data: transfers, isLoading: loadingTransfers, refetch: refetchTransfers } = useGetTransfers();
  const { addDomainTransferItem, removeItem, hasItem, openDrawer } = useCartStore();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim() || !authCode.trim()) {
      toast.error("Please fill in both the domain name and the authorization code.");
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
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#031033] flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-[#e8900a]" />
          Domain Transfer
        </h1>
        <p className="text-[#5a6a85] text-sm mt-1">
          Transfer your existing domain names to Nupat Cloud easily and consolidate your management in one place.
        </p>
      </div>

      {/* Grid: Form & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Transfer Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informational Banner */}
          <div className="bg-[#fffbf2] border border-[#f5d99e] p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e8900a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#031033]">Domain Transfer Cost &amp; Benefits</p>
              <p className="text-xs text-[#5a6a85] mt-1 leading-relaxed">
                Transferring your domain starts from <span className="font-bold text-[#031033]">₦26,000</span> (depending on the domain extension), which includes 1 year of renewal. Your domain expiry will be extended by 1 year from today.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e2eaff] p-6 shadow-sm relative overflow-hidden">
            <h2 className="text-base font-bold text-[#031033] mb-4">
              Initiate Domain Transfer (In)
            </h2>
            <form onSubmit={handleCheck} className="space-y-4" autoComplete="off">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="transfer-domain-input"
                  className="text-xs font-bold text-[#9ba8c0] uppercase tracking-wide"
                >
                  Domain Name
                </label>
                <div className="flex items-center border border-[#dce4f7] focus-within:border-[#e8900a] transition-all bg-white px-3">
                  <Globe className="w-4 h-4 text-[#9ba8c0] shrink-0" />
                  <input
                    id="transfer-domain-input"
                    name="transfer-domain-input"
                    autoComplete="off"
                    type="text"
                    required
                    placeholder="mycompany.com"
                    value={domainName}
                    onChange={(e) => {
                      setDomainName(e.target.value);
                      if (eligibilityResult) setEligibilityResult(null);
                    }}
                    className="w-full py-3 px-3 text-sm text-[#031033] placeholder-[#9ba8c0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="transfer-auth-code-input"
                  className="text-xs font-bold text-[#9ba8c0] uppercase tracking-wide"
                >
                  Authorization Code (EPP Code)
                </label>
                <div className="flex items-center border border-[#dce4f7] focus-within:border-[#e8900a] transition-all bg-white px-3">
                  <input
                    id="transfer-auth-code-input"
                    name="transfer-auth-code-input"
                    autoComplete="new-password"
                    type={showAuthCode ? "text" : "password"}
                    required
                    placeholder="Enter EPP transfer code"
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      if (eligibilityResult) setEligibilityResult(null);
                    }}
                    className="w-full py-3 px-1 text-sm text-[#031033] placeholder-[#9ba8c0] outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthCode(!showAuthCode)}
                    className="text-[#9ba8c0] hover:text-[#031033] p-1.5 transition-colors"
                  >
                    {showAuthCode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkEligibilityMutation.isPending}
                className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkEligibilityMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Eligibility...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Check Transfer Eligibility
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Eligibility Result Container */}
          {eligibilityResult && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#031033]">
                    Eligible for Transfer
                  </h3>
                  <p className="text-xs text-[#5a6a85] mt-0.5">
                    Domain: <span className="font-mono font-semibold text-[#031033]">{eligibilityResult.domainName}</span>
                  </p>
                  <p className="text-lg font-extrabold text-emerald-600 mt-2">
                    {formatNGN(eligibilityResult.price)}
                    <span className="text-xs font-normal text-[#9ba8c0]"> / 1 year</span>
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {isAlreadyInCart() ? (
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-full sm:w-auto py-2 px-4 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Remove from Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto btn-primary py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart &amp; Checkout
                  </button>
                )}
              </div>
            </div>
          )}

          {checkEligibilityMutation.isError && (
            <div className="bg-red-50 border border-red-100 p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-red-700">Check Eligibility Failed</p>
                <p className="text-red-600 mt-0.5">{checkEligibilityMutation.error.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Steps & Instructions */}
        <div className="space-y-6">
          <div className="bg-[#f6f9ff] border border-[#dce4f7] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#031033] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#e8900a]" />
              Transfer Instructions
            </h3>
            <ol className="space-y-4 text-xs text-[#5a6a85] list-decimal pl-4">
              <li>
                <strong className="text-[#031033]">Unlock Domain:</strong> Log into your current domain registrar and ensure the domain registration is unlocked (disabled lock status).
              </li>
              <li>
                <strong className="text-[#031033]">Get Auth / EPP Code:</strong> Request the EPP transfer code or authorization code from your current provider.
              </li>
              <li>
                <strong className="text-[#031033]">Check &amp; Add:</strong> Input the domain name and code on this page, click verify, and add to the cart.
              </li>
              <li>
                <strong className="text-[#031033]">Complete Checkout:</strong> Complete checkout and make payment. The transfer request will then be submitted to the registry automatically.
              </li>
              <li>
                <strong className="text-[#031033]">Confirm Email:</strong> Depending on the domain extension, you may receive a verification email. Click the confirmation link to authorize the move.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Domain Transfer Progress / History */}
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-6 py-4 border-b border-[#e2eaff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#e8900a]" />
            <h2 className="text-sm font-semibold text-[#031033]">Domain Transfer History</h2>
          </div>
          <button
            onClick={() => refetchTransfers()}
            disabled={loadingTransfers}
            className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${loadingTransfers ? "animate-spin" : ""}`} />
            Refresh List
          </button>
        </div>

        {loadingTransfers ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="w-6 h-6 text-[#e8900a] animate-spin" />
            <p className="text-xs text-[#5a6a85]">Loading transfer records...</p>
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-xs text-[#5a6a85] max-w-xs mb-1">
              No domain transfers found.
            </p>
            <p className="text-[11px] text-[#9ba8c0] max-w-xs">
              When you transfer a domain to Nupat Cloud, it will be listed here to track its progression.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f9ff] border-b border-[#e2eaff]">
                  <th className="px-6 py-3 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                    Domain Name
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                    Initiation Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4fc]">
                {transfers.map((transfer) => {
                  const isProcessing = transfer.status === "PROCESSING" || transfer.status === "PENDING";
                  const statusColors: Record<string, string> = {
                    PENDING: "bg-amber-50 border-amber-100 text-amber-600",
                    PROCESSING: "bg-blue-50 border-blue-100 text-blue-600",
                    COMPLETED: "bg-emerald-50 border-emerald-100 text-emerald-600",
                    FAILED: "bg-red-50 border-red-100 text-red-500",
                    CANCELLED: "bg-gray-50 border-gray-200 text-gray-500",
                  };

                  return (
                    <tr key={transfer.id} className="hover:bg-[#fafbff] transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-[#031033] text-sm">{transfer.domainName}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs text-[#5a6a85] font-semibold flex items-center gap-1">
                          {transfer.direction === "IN" ? (
                            <span className="text-emerald-600 font-bold">Transfer In</span>
                          ) : (
                            <span className="text-blue-600 font-bold">Transfer Out</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#5a6a85] text-xs">
                        {formatDate(transfer.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border ${
                            statusColors[transfer.status] ?? "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          {isProcessing && <Loader2 className="w-2.5 h-2.5 animate-spin mr-0.5" />}
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {transfer.direction === "IN" && isProcessing && (
                          <button
                            onClick={() => handleRefreshStatus(transfer.id)}
                            disabled={refreshStatusMutation.isPending}
                            title="Fetch Live Status Update"
                            className="inline-flex items-center gap-1.5 text-xs text-[#e8900a] hover:underline underline-offset-2 font-semibold disabled:opacity-60"
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
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function DomainTransferPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#e8900a]" />
      </div>
    }>
      <DomainTransferPageContent />
    </Suspense>
  );
}
