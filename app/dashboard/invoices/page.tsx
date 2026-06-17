"use client";

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
} from "lucide-react";
import { useGetBillingOverview } from "@/hooks/useBilling";
import type { WhmcsInvoice } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(total: string | number, currency: string) {
  const num = typeof total === "string" ? parseFloat(total) : total;
  if (isNaN(num)) return String(total);
  return `${currency ?? ""} ${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim();
}

// ── Status Badge ──────────────────────────────────────────────────────────────

type InvoiceStatus = WhmcsInvoice["status"];

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg: Record<
    InvoiceStatus,
    { icon: React.ElementType; label: string; cls: string }
  > = {
    Paid: {
      icon: CheckCircle2,
      label: "Paid",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    Unpaid: {
      icon: Clock,
      label: "Unpaid",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    Cancelled: {
      icon: XCircle,
      label: "Cancelled",
      cls: "bg-red-50 text-red-500 border-red-200",
    },
    Refunded: {
      icon: RefreshCw,
      label: "Refunded",
      cls: "bg-blue-50 text-blue-500 border-blue-200",
    },
    Collections: {
      icon: AlertCircle,
      label: "Collections",
      cls: "bg-orange-50 text-orange-600 border-orange-200",
    },
    Draft: {
      icon: FileText,
      label: "Draft",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
    },
  };

  const entry = cfg[status] ?? cfg.Unpaid;
  const Icon = entry.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${entry.cls}`}
    >
      <Icon className="w-3 h-3" />
      {entry.label}
    </span>
  );
}

// ── Invoice Row ───────────────────────────────────────────────────────────────

function InvoiceRow({
  invoice,
  currency,
}: {
  invoice: WhmcsInvoice;
  currency: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f6f9ff] transition-colors border-b border-[#e2eaff] last:border-b-0">
      {/* Icon */}
      <div className="w-8 h-8 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center shrink-0">
        <Receipt className="w-3.5 h-3.5 text-[#9ba8c0]" />
      </div>

      {/* Invoice ID + due date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#031033] truncate">
          Invoice #{invoice.id}
        </p>
        <p className="text-xs text-[#9ba8c0] truncate">
          Due: {formatDate(invoice.duedate)}
        </p>
      </div>

      {/* Amount */}
      <p className="text-sm font-extrabold text-[#031033] shrink-0 hidden sm:block">
        {formatAmount(invoice.total, currency)}
      </p>

      {/* Status */}
      <InvoiceStatusBadge status={invoice.status} />

      {/* Invoice date */}
      <p className="text-xs text-[#9ba8c0] shrink-0 hidden md:block">
        {formatDate(invoice.date)}
      </p>
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e2eaff] last:border-b-0 animate-pulse">
      <div className="w-8 h-8 bg-[#e8edf8] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-[#e8edf8] rounded mb-1.5" />
        <div className="h-3 w-40 bg-[#e8edf8] rounded" />
      </div>
      <div className="hidden sm:block h-4 w-20 bg-[#e8edf8] rounded" />
      <div className="h-5 w-14 bg-[#e8edf8] rounded" />
      <div className="hidden md:block h-3 w-20 bg-[#e8edf8] rounded" />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#e2eaff] px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-[#9ba8c0]" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-xl font-extrabold mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const { data: billing, isLoading, isError, refetch } = useGetBillingOverview();

  const invoices = billing?.invoices ?? [];
  const hasInvoices = invoices.length > 0;
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const currency = billing?.currency ?? "";
  const creditBalance = billing?.creditBalance ?? 0;

  return (
    <div className="flex flex-col gap-7 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
          Invoices
        </h1>
        <p className="text-[#5a6a85] mt-1 text-sm">
          Your billing history synced from WHMCS.
        </p>
      </div>

      {/* Stat cards — shown once data arrives */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Invoices"
            value={billing?.totalInvoices ?? invoices.length}
            icon={FileText}
            color="text-[#031033]"
          />
          <StatCard
            label="Paid"
            value={paidCount}
            icon={CheckCircle2}
            color="text-emerald-600"
          />
          <StatCard
            label="Credit Balance"
            value={
              creditBalance !== undefined && creditBalance !== null
                ? formatAmount(creditBalance, currency)
                : "—"
            }
            icon={Wallet}
            color="text-[#e8900a]"
          />
        </div>
      )}

      {/* Skeleton stat cards */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e2eaff] px-4 py-3">
              <div className="h-3 w-24 bg-[#e8edf8] rounded mb-2" />
              <div className="h-6 w-16 bg-[#e8edf8] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Invoice table */}
      <div className="bg-white border border-[#e2eaff]">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#9ba8c0]" />
            <h2 className="text-sm font-semibold text-[#031033]">
              Invoice History
            </h2>
            {hasInvoices && (
              <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                {invoices.length}
              </span>
            )}
          </div>
          {(isError || hasInvoices) && (
            <button
              onClick={() => refetch()}
              className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
              id="invoices-refresh"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          )}
        </div>

        {/* Column labels (desktop) */}
        {hasInvoices && !isLoading && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2 bg-[#f6f9ff] border-b border-[#e2eaff]">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider">
              Invoice
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-28 hidden sm:block">
              Amount
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-20">
              Status
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-24 hidden md:block">
              Date
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-300" />
            <p className="text-sm text-red-500">
              Could not load billing data. Make sure your account is linked to
              WHMCS.
            </p>
            <button
              onClick={() => refetch()}
              id="invoices-retry"
              className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && [...Array(4)].map((_, i) => <InvoiceRowSkeleton key={i} />)}

        {/* Empty */}
        {!isLoading && !isError && !hasInvoices && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-[#9ba8c0]" />
            </div>
            <p className="text-sm text-[#5a6a85] max-w-xs">
              No invoices found. Invoices will appear here once you make a
              purchase.
            </p>
          </div>
        )}

        {/* Invoice rows */}
        {hasInvoices && (
          <div className="flex flex-col">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} currency={currency} />
            ))}
          </div>
        )}
      </div>

      {/* WHMCS sync note */}
      {!isLoading && !isError && (
        <div className="bg-[#f2f5fc] border border-[#e2eaff] p-4 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-[#5a6a85]">
            <span className="font-semibold text-[#031033]">
              WHMCS Connected.
            </span>{" "}
            Invoices are synced in real time. Payments made via Paystack are
            automatically recorded here.
          </p>
        </div>
      )}
    </div>
  );
}
