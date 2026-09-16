"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Wallet,
  FileText,
  TrendingUp,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useGetBillingOverview } from "@/hooks/useBilling";
import type { WhmcsInvoice } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(total: string | number, currency: string) {
  const num = typeof total === "string" ? parseFloat(total) : total;
  if (isNaN(num)) return String(total);
  return `${currency ?? "₦"} ${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim();
}

// ── Status Badge ──────────────────────────────────────────────────────────────

type InvoiceStatus = WhmcsInvoice["status"];

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
        <CheckCircle2 className="w-3 h-3" />
        Paid
      </span>
    );
  }
  if (status === "Unpaid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef5e7] text-[#e8900a] border border-[#fde1b0]">
        <Clock className="w-3 h-3" />
        Unpaid
      </span>
    );
  }
  if (status === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef0f0] text-[#f56c6c] border border-[#fde2e2]">
        <XCircle className="w-3 h-3" />
        Cancelled
      </span>
    );
  }
  if (status === "Refunded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
        <RefreshCw className="w-3 h-3" />
        Refunded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
      <FileText className="w-3 h-3" />
      {status}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const { data: billing, isLoading, isError, refetch } = useGetBillingOverview();

  const [statusFilter, setStatusFilter] = useState<
    "All" | "Paid" | "Unpaid" | "Cancelled"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const invoices = billing?.invoices ?? [];
  const hasInvoices = invoices.length > 0;
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const currency = billing?.currency ?? "₦";
  const creditBalance = billing?.creditBalance ?? 0;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesFilter =
        statusFilter === "All" || invoice.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        invoice.id.toLowerCase().includes(q) ||
        String(invoice.total).toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

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
            Invoices
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Access and download your billing statements and payment receipts.
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e2eaff] hover:bg-[#f8fafc] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4 text-[#1787D4]" />
          View Payment Orders
        </Link>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invoices */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Total Invoices
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              billing?.totalInvoices ?? invoices.length
            )}
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Settled (Paid)
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              paidCount
            )}
          </div>
        </div>

        {/* Credit Balance */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Available Credit Balance
          </span>
          <div className="text-[28px] font-bold text-[#1787D4] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : creditBalance !== undefined && creditBalance !== null ? (
              formatAmount(creditBalance, currency)
            ) : (
              "₦ 0.00"
            )}
          </div>
        </div>
      </div>

      {/* Filter Row: Pills + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { label: "All", val: "All" },
              { label: "Paid", val: "Paid" },
              { label: "Unpaid", val: "Unpaid" },
              { label: "Cancelled", val: "Cancelled" },
            ] as const
          ).map(({ label, val }) => {
            const isActive = statusFilter === val;
            return (
              <button
                key={val}
                onClick={() => setStatusFilter(val as any)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#1787D4] text-white shadow-xs"
                    : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:bg-[#f8fafc]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice #…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Invoice Table Container */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-1">
        <div className="px-6 py-4 border-b border-[#eef2f8] bg-[#fbfcfe] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#1787D4]" />
            <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
              Billing Statements
            </h3>
            {hasInvoices && (
              <span className="text-[11px] font-bold bg-[#eff6fc] text-[#1787D4] border border-[#d6eaf8] px-2 py-0.5 rounded-full">
                {invoices.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            id="invoices-refresh"
            className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
            <p className="text-[13px] text-[#6e6e73]">Loading your invoices…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-[14px] font-semibold text-red-600">
              Could not load billing data.
            </p>
            <button
              onClick={() => refetch()}
              id="invoices-retry"
              className="mt-2 text-xs font-semibold text-[#1787D4] hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4] mb-2">
              <TrendingUp className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              No invoices found
            </p>
            <p className="text-[12.5px] text-[#6e6e73] max-w-sm mt-0.5">
              {searchQuery || statusFilter !== "All"
                ? "No invoices match your current search filters."
                : "Invoices will be automatically created and stored here whenever you purchase or renew services."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Invoice #
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Due Date
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Issue Date
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Total Amount
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f5fc]">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-[#fbfcfe] transition-colors"
                  >
                    <td className="py-4.5 px-6">
                      <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                        Invoice #{invoice.id}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-[13px] text-[#6e6e73]">
                      {formatDate(invoice.duedate)}
                    </td>
                    <td className="py-4.5 px-6 text-[13px] text-[#6e6e73]">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                        {formatAmount(invoice.total, currency)}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help / Support Strip */}
      <div className="bg-[#eff6fb] border border-[#d3e7f8] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-[14px] font-bold text-[#1d1d1f]">
            Questions about your invoices?
          </h4>
          <p className="text-[12.5px] text-[#4b5563] mt-0.5">
            Need adjustments, tax exempt receipts, or billing clarification? Our
            finance team is available 24/7.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          className="text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] whitespace-nowrap inline-flex items-center gap-1 shrink-0"
        >
          Billing Support <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
