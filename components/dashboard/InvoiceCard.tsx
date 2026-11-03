"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Loader2,
  Globe,
  Server,
  AlertTriangle,
} from "lucide-react";
import type { Invoice } from "@/lib/api";
import {
  isHostingInvoice,
  isDomainInvoice,
  extractDomainFromInvoice,
} from "@/hooks/useInvoices";

interface InvoiceCardProps {
  invoice: Invoice;
  onPay: (invoice: Invoice) => void;
  onViewInvoice: (id: string) => void;
  isPaying?: boolean;
  isRevalidating?: boolean;
  isTaken?: boolean;
  isViewing?: boolean;
}

export default function InvoiceCard({
  invoice,
  onPay,
  onViewInvoice,
  isPaying = false,
  isRevalidating = false,
  isTaken = false,
  isViewing = false,
}: InvoiceCardProps) {
  const isHosting = isHostingInvoice(invoice);
  const isDomain = isDomainInvoice(invoice);
  const domainName = extractDomainFromInvoice(invoice);

  // Format amount as Nigerian Naira
  const formattedAmount = `₦${Number(invoice.amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Format date using user's locale
  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const renderStatusBadge = () => {
    const pill =
      "inline-flex items-center gap-1.5 whitespace-nowrap text-xs";
    switch (invoice.status) {
      case "PAID":
        return <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#12A150]" />Paid</span>;
      case "PENDING":
        return <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8900A]" />Pending</span>;
      case "FAILED":
        return <span className={`${pill} text-[#C21F1F]`}><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />Failed</span>;
      case "REFUNDED":
      default:
        return <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA6B8]" />Refunded</span>;
    }
  };

  const isPendingOrFailed = invoice.status === "PENDING" || invoice.status === "FAILED";
  const isPaid = invoice.status === "PAID" || invoice.isPaid;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#D5DCE6] px-5 py-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left Column: Icon + Description + Category + Metadata */}
      <div className="flex items-start gap-3 min-w-0">
        {isDomain ? (
          <Globe className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
        ) : isHosting ? (
          <Server className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
        ) : (
          <FileText className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-[#031033] truncate">
              {invoice.description || "Nupat Cloud Invoice"}
            </h4>

            {isDomain ? (
              <span className="text-xs text-[#5A6A85] whitespace-nowrap">
                Domain
              </span>
            ) : isHosting ? (
              <span className="text-xs text-[#5A6A85] whitespace-nowrap">
                Hosting plan
              </span>
            ) : null}
          </div>

          {isTaken && (
            <p className="mt-1 text-xs font-medium text-[#C21F1F]">
              Domain already taken by another party
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-[#5A6A85]">
            <span className="tabular-nums">{formattedDate}</span>
            {domainName && isDomain && (
              <>
                <span aria-hidden>·</span>
                <span className="text-[#031033]">{domainName}</span>
              </>
            )}
            {invoice.whmcsInvoiceId && (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono">#{invoice.whmcsInvoiceId}</span>
              </>
            )}
            {invoice.paystackRef && (
              <>
                <span className="hidden sm:inline" aria-hidden>·</span>
                <span className="font-mono hidden sm:inline truncate max-w-[140px]">
                  ref: {invoice.paystackRef}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Amount, Status Badge & Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EEF2F7] flex-wrap sm:flex-nowrap">
        <div className="text-left sm:text-right shrink-0">
          <span className="text-sm font-semibold text-[#031033] tabular-nums block">
            {formattedAmount}
          </span>
          <div className="mt-1">{renderStatusBadge()}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Pay now ONLY for domain invoices when PENDING or FAILED */}
          {isPendingOrFailed && isDomain && (
            <>
              {isTaken ? (
                <span
                  className="text-xs font-medium text-[#C21F1F] px-2 py-1"
                  title="This domain is unavailable and cannot be purchased."
                >
                  Domain taken
                </span>
              ) : (
                <button
                  type="button"
                  id={`btn-pay-invoice-${invoice.id}`}
                  onClick={() => onPay(invoice)}
                  disabled={isPaying || isRevalidating}
                  className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {isRevalidating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking…</span>
                    </>
                  ) : isPaying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay now</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* For hosting plans, remove Pay now and show Manage Hosting link */}
          {isPendingOrFailed && isHosting && (
            <Link
              href="/dashboard/hosting"
              className="inline-flex h-8 items-center gap-1 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              <span>Manage hosting →</span>
            </Link>
          )}

          {/* View invoice for PAID */}
          {isPaid && (
            <button
              type="button"
              id={`btn-view-invoice-${invoice.id}`}
              onClick={() => onViewInvoice(invoice.id)}
              disabled={isViewing}
              className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg text-sm font-medium text-[#031033] bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              {isViewing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading…</span>
                </>
              ) : (
                <>
                  <span>View invoice</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5A6A85]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
