"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  ShoppingCart,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Globe,
  Server,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetInvoices,
  usePayInvoice,
  useViewInvoice,
  isHostingInvoice,
  isDomainInvoice,
  extractDomainFromInvoice,
} from "@/hooks/useInvoices";
import { verifyPayment, searchDomains } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import InvoiceCard from "@/components/dashboard/InvoiceCard";
import EmptyState from "@/components/dashboard/EmptyState";
import type { Invoice } from "@/lib/api";

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const {
    data: invoices = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetInvoices();
  const { mutate: payInvoice, isPending: isPaying } = usePayInvoice();
  const { mutate: viewInvoice, isPending: isViewing } = useViewInvoice();

  const [activePayingId, setActivePayingId] = useState<string | null>(null);
  const [activeViewingId, setActiveViewingId] = useState<string | null>(null);
  const [revalidatingId, setRevalidatingId] = useState<string | null>(null);
  const [takenInvoices, setTakenInvoices] = useState<Record<string, string>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED"
  >("ALL");

  // ── Handle return from Paystack redirect ──────────────────────────────────
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) return;

    let isMounted = true;
    const verify = async () => {
      try {
        toast.info("Verifying invoice payment with Paystack…");
        const res = await verifyPayment(token, reference);
        if (!isMounted) return;

        if (res.success || res.data?.status === "PAID") {
          toast.success(
            "Payment verified! Your invoice has been marked as paid.",
          );
        } else {
          toast.info(res.message || "Payment status received from Paystack.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        toast.error(err?.message || "Failed to verify payment with Paystack.");
      } finally {
        if (isMounted) {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["hosting"] });
          queryClient.invalidateQueries({ queryKey: ["registered-domains"] });
          queryClient.invalidateQueries({ queryKey: ["expiry-warnings"] });
          router.replace("/dashboard/invoices");
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference, token, queryClient, router]);

  // ── Action Handlers ───────────────────────────────────────────────────────
  const handlePay = async (invoice: Invoice) => {
    // 1. Hosting plan invoices do not allow direct "Pay now"
    if (isHostingInvoice(invoice) || !isDomainInvoice(invoice)) {
      toast.error("Online checkout is only available for domain invoices.");
      return;
    }

    const domainName = extractDomainFromInvoice(invoice);

    // 2. If already verified as taken
    if (takenInvoices[invoice.id]) {
      toast.error(
        `The domain "${takenInvoices[invoice.id]}" has already been taken by someone else and cannot be registered.`,
      );
      return;
    }

    // 3. Revalidate domain availability before proceeding with payment
    if (domainName) {
      setRevalidatingId(invoice.id);
      try {
        toast.info(`Checking availability for ${domainName}…`);
        const res = await searchDomains(domainName);
        const results = res?.data || [];

        const target = domainName.toLowerCase();
        const match =
          results.find((r) => r.domain?.toLowerCase() === target) ||
          results.find((r) => r.domain?.toLowerCase().startsWith(target)) ||
          results[0];

        if (match && match.available === false) {
          setTakenInvoices((prev) => ({ ...prev, [invoice.id]: domainName }));
          toast.error(
            `Domain "${domainName}" is no longer available. It has already been taken by someone else.`,
            { duration: 6000 },
          );
          setRevalidatingId(null);
          return;
        }

        toast.success(
          `Domain "${domainName}" is available! Initializing payment…`,
        );
      } catch (err: any) {
        console.error("Domain revalidation error:", err);
        toast.error(
          err?.message ||
            "Failed to verify domain availability. Please try again.",
        );
        setRevalidatingId(null);
        return;
      } finally {
        setRevalidatingId(null);
      }
    }

    // 4. Trigger Paystack checkout
    setActivePayingId(invoice.id);
    payInvoice(invoice.id, {
      onSettled: () => setActivePayingId(null),
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    setActiveViewingId(invoiceId);
    viewInvoice(invoiceId, {
      onSettled: () => setActiveViewingId(null),
    });
  };

  // ── Filtering & Searching ─────────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesFilter =
        statusFilter === "ALL" || invoice.status === statusFilter;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (invoice.description &&
          invoice.description.toLowerCase().includes(q)) ||
        invoice.id.toLowerCase().includes(q) ||
        String(invoice.amount).toLowerCase().includes(q) ||
        (invoice.whmcsInvoiceId &&
          String(invoice.whmcsInvoiceId).includes(q)) ||
        (invoice.paystackRef && invoice.paystackRef.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "PAID" || i.isPaid).length;
    const pending = invoices.filter((i) => i.status === "PENDING").length;
    const failed = invoices.filter((i) => i.status === "FAILED").length;
    const totalAmount = invoices
      .filter((i) => i.status === "PAID" || i.isPaid)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return { total, paid, pending, failed, totalAmount };
  }, [invoices]);

  const renderStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="text-[12px] font-semibold text-[#1787D4]">
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="text-[12px] font-semibold text-orange-600">
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="text-[12px] font-semibold text-red-600">
            Failed
          </span>
        );
      case "REFUNDED":
      default:
        return (
          <span className="text-[12px] font-medium text-slate-500">
            Refunded
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{
              fontFamily:
                "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            Invoices
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Track billing statements, complete payments, and download official
            receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-[#031033] bg-white border border-[#e2eaff] hover:bg-[#f2f5fc] transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#1787D4] ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#8a9bb2] uppercase tracking-wider block mb-1">
            Total Invoices
          </span>
          <span className="text-2xl font-extrabold text-[#031033]">
            {stats.total}
          </span>
          <span className="text-[12px] text-[#5a6a85] block mt-1">
            Lifetime orders
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#8a9bb2] uppercase tracking-wider block mb-1">
            Paid Invoices
          </span>
          <span className="text-2xl font-extrabold text-[#031033]">
            {stats.paid}
          </span>
          <span className="text-[12px] text-[#5a6a85] block mt-1">
            Settled & active
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#8a9bb2] uppercase tracking-wider block mb-1">
            Pending Payment
          </span>
          <span className="text-2xl font-extrabold text-orange-600">
            {stats.pending}
          </span>
          <span className="text-[12px] text-[#5a6a85] block mt-1">
            Awaiting checkout
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs">
          <span className="text-[11px] font-bold text-[#8a9bb2] uppercase tracking-wider block mb-1">
            Total Settled
          </span>
          <span className="text-2xl font-extrabold text-[#031033]">
            ₦{stats.totalAmount.toLocaleString("en-NG")}
          </span>
          <span className="text-[12px] text-[#5a6a85] block mt-1">
            Processed via Paystack
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-[#e2eaff] p-2.5 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"] as const).map(
            (tab) => {
              const active = statusFilter === tab;
              const count =
                tab === "ALL"
                  ? invoices.length
                  : invoices.filter((i) => i.status === tab).length;

              return (
                <button
                  key={tab}
                  type="button"
                  id={`filter-tab-${tab.toLowerCase()}`}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-[#1787D4] text-white shadow-xs"
                      : "text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc]"
                  }`}
                >
                  <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#f2f5fc] text-[#8a9bb2]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {/* Search Box */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#8a9bb2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoices by desc, ref…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#e2eaff] bg-[#fbfcfe] text-[13px] text-[#031033] placeholder:text-[#8a9bb2] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
        </div>
      </div>

      {/* Invoices List Container */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-5 py-4 border-b border-[#eef2f8] bg-[#fbfcfe] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#1787D4]" />
            <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
              Invoices List
            </h3>
            {invoices.length > 0 && (
              <span className="text-[11px] font-bold bg-[#eff6fc] text-[#1787D4] border border-[#d6eaf8] px-2 py-0.5 rounded-full">
                {filteredInvoices.length} of {invoices.length}
              </span>
            )}
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
            <p className="text-[13px] text-[#6e6e73]">Loading invoices…</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#031033]">
              Unable to load invoices
            </h3>
            <p className="text-xs text-[#5a6a85] mt-1 mb-4 leading-relaxed">
              {error instanceof Error
                ? error.message
                : "A network error occurred while contacting the billing server."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-primary text-xs py-2 px-5 rounded-xl font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Receipt}
              title={
                invoices.length === 0
                  ? "No invoices found"
                  : "No matching invoices"
              }
              description={
                invoices.length === 0
                  ? "You haven't generated any invoices yet. When you register a domain or order cloud hosting, your billing history will appear here."
                  : "No invoices matched your selected filter or search keyword. Try clearing filters to view all records."
              }
              action={
                invoices.length === 0 ? (
                  <Link
                    href="/dashboard/hosting"
                    className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Browse Hosting</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="text-xs font-semibold text-[#1787D4] hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table List (hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider">
                      Reference / ID
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-semibold text-[#5a6a85] uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
                  {filteredInvoices.map((invoice) => {
                    const isHosting = isHostingInvoice(invoice);
                    const isDomain = isDomainInvoice(invoice);
                    const domainName = extractDomainFromInvoice(invoice);
                    const isPendingOrFailed =
                      invoice.status === "PENDING" ||
                      invoice.status === "FAILED";
                    const isPaid = invoice.status === "PAID" || invoice.isPaid;
                    const isThisPaying =
                      isPaying && activePayingId === invoice.id;
                    const isThisRevalidating = revalidatingId === invoice.id;
                    const isThisTaken = !!takenInvoices[invoice.id];
                    const isThisViewing =
                      isViewing && activeViewingId === invoice.id;

                    const formattedAmount = `₦${Number(
                      invoice.amount || 0,
                    ).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;

                    const formattedDate = invoice.createdAt
                      ? new Date(invoice.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "—";

                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-[#fbfcfe] transition-colors"
                      >
                        {/* Description */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13.5px] font-bold text-[#1d1d1f] truncate max-w-xs sm:max-w-sm">
                                  {invoice.description || "Nupat Cloud Invoice"}
                                </span>
                              </div>
                              {isThisTaken ? (
                                <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                                  ⚠️ Domain already taken by another party
                                </span>
                              ) : domainName && isDomain ? (
                                <span className="text-[11.5px] font-mono text-[#1787D4] block mt-0.5">
                                  {domainName}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Reference / ID */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            {invoice.whmcsInvoiceId ? (
                              <span className="text-[12.5px] font-mono font-medium text-[#1d1d1f]">
                                #{invoice.whmcsInvoiceId}
                              </span>
                            ) : null}
                            <span className="text-[11px] font-mono text-[#8a9bb2] truncate max-w-[140px]">
                              {invoice.paystackRef || invoice.id.slice(0, 12)}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-5">
                          <span className="text-[12.5px] text-[#5a6a85]">
                            {formattedDate}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-5">
                          <span className="text-[13.5px] font-extrabold text-[#1d1d1f]">
                            {formattedAmount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          {renderStatusBadge(invoice.status)}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-5 text-right">
                          {/* Domain invoice: Pay now ONLY for domains when PENDING or FAILED */}
                          {isPendingOrFailed && isDomain && (
                            <>
                              {isThisTaken ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap"
                                  title="This domain is unavailable and cannot be purchased."
                                >
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>Domain Taken</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  id={`table-btn-pay-${invoice.id}`}
                                  onClick={() => handlePay(invoice)}
                                  disabled={isThisPaying || isThisRevalidating}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white bg-[#1787D4] hover:bg-[#1370B5] active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 cursor-pointer whitespace-nowrap"
                                >
                                  {isThisRevalidating ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Checking…</span>
                                    </>
                                  ) : isThisPaying ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Processing…</span>
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3 h-3" />
                                      <span>Pay now</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}

                          {/* Hosting plan invoice: Remove "Pay now", provide Manage Hosting link */}
                          {isPendingOrFailed && isHosting && (
                            <Link
                              href="/dashboard/hosting"
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1787D4] hover:text-[#1370B5] hover:underline whitespace-nowrap px-2 py-1"
                            >
                              <span>Hosting plans →</span>
                            </Link>
                          )}

                          {/* Paid invoice: View invoice button */}
                          {isPaid && (
                            <button
                              type="button"
                              id={`table-btn-view-${invoice.id}`}
                              onClick={() => handleViewInvoice(invoice.id)}
                              disabled={isThisViewing}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-[#031033] bg-[#f2f5fc] hover:bg-[#e4ebf8] border border-[#dce5f5] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap"
                            >
                              {isThisViewing ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Loading…</span>
                                </>
                              ) : (
                                <>
                                  <span>View invoice</span>
                                  <ExternalLink className="w-3 h-3 text-[#5a6a85]" />
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked List (shown on smaller screens) */}
            <div className="md:hidden flex flex-col divide-y divide-[#f2f5fc] p-3 gap-2">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPay={handlePay}
                  onViewInvoice={handleViewInvoice}
                  isPaying={isPaying && activePayingId === invoice.id}
                  isRevalidating={revalidatingId === invoice.id}
                  isTaken={!!takenInvoices[invoice.id]}
                  isViewing={isViewing && activeViewingId === invoice.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
