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

  // Status badge styling per requirement:
  // - PAID: green
  // - PENDING: amber
  // - FAILED: red
  // - REFUNDED: neutral
  const renderStatusBadge = () => {
    switch (invoice.status) {
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
          <span className="text-[12px] font-semibold text-slate-500">
            Refunded
          </span>
        );
    }
  };

  const isPendingOrFailed = invoice.status === "PENDING" || invoice.status === "FAILED";
  const isPaid = invoice.status === "PAID" || invoice.isPaid;

  return (
    <div className="bg-white rounded-2xl border border-[#e2eaff] hover:border-[#b8d4fa] p-4 sm:px-5 sm:py-4 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      {/* Left Column: Icon + Description + Category + Metadata */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-[#eff6fc] border-[#d6eaf8] text-[#1787D4]">
          {isDomain ? (
            <Globe className="w-5 h-5" />
          ) : isHosting ? (
            <Server className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[14.5px] font-bold text-[#031033] leading-snug truncate">
              {invoice.description || "Nupat Cloud Invoice"}
            </h4>

            {isDomain ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#eff6fc] text-[#1787D4]">
                Domain
              </span>
            ) : isHosting ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#eff6fc] text-[#1787D4]">
                Hosting Plan
              </span>
            ) : null}
          </div>

          {isTaken && (
            <p className="mt-1 text-[12px] font-semibold text-red-600">
              Domain already taken by another party
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[12px] text-[#5a6a85]">
            <span>{formattedDate}</span>
            {domainName && isDomain && (
              <>
                <span>•</span>
                <span className="font-mono text-[#1787D4] font-medium">
                  {domainName}
                </span>
              </>
            )}
            {invoice.whmcsInvoiceId && (
              <>
                <span>•</span>
                <span className="font-mono text-[#8a9bb2]">
                  #{invoice.whmcsInvoiceId}
                </span>
              </>
            )}
            {invoice.paystackRef && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="font-mono text-[11px] text-[#8a9bb2] hidden sm:inline truncate max-w-[140px]">
                  ref: {invoice.paystackRef}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Amount, Status Badge & Action */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f2f5fc]">
        <div className="text-left sm:text-right">
          <span className="text-[14.5px] font-extrabold text-[#031033] block tracking-tight">
            {formattedAmount}
          </span>
          <div className="mt-1">{renderStatusBadge()}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pay now ONLY for domain invoices when PENDING or FAILED */}
          {isPendingOrFailed && isDomain && (
            <>
              {isTaken ? (
                <span
                  className="text-[12px] font-semibold text-red-600 px-2 py-1"
                  title="This domain is unavailable and cannot be purchased."
                >
                  Domain Taken
                </span>
              ) : (
                <button
                  type="button"
                  id={`btn-pay-invoice-${invoice.id}`}
                  onClick={() => onPay(invoice)}
                  disabled={isPaying || isRevalidating}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-white bg-[#1787D4] hover:bg-[#1370B5] active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
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
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1787D4] hover:text-[#1370B5] hover:underline whitespace-nowrap px-2 py-1"
            >
              <span>Manage Hosting →</span>
            </Link>
          )}

          {/* View invoice for PAID */}
          {isPaid && (
            <button
              type="button"
              id={`btn-view-invoice-${invoice.id}`}
              onClick={() => onViewInvoice(invoice.id)}
              disabled={isViewing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#031033] bg-[#f2f5fc] hover:bg-[#e4ebf8] border border-[#dce5f5] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {isViewing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
        </div>
      </div>
    </div>
  );
}
