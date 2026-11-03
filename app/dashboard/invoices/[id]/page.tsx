"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Globe,
  Shield,
  Loader2,
  Check,
  Headphones,
} from "lucide-react";
import {
  useGetInvoice,
  usePayInvoice,
  useViewInvoice,
} from "@/hooks/useInvoices";
import { useGetMe } from "@/hooks/useUser";
import { formatInvoiceNumber, getInvoiceServiceLabel } from "../page";
import { toast } from "sonner";

const DASH = "—";

function formatPrice(n: number | null | undefined) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return DASH;
  return "₦" + Number(n).toLocaleString("en-NG");
}

function formatLongDate(value: string | null | undefined) {
  if (!value) return DASH;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Grey out a missing value. */
function mutedIf(value: string) {
  return value === DASH ? "text-[#5A6A85]!" : "";
}

/**
 * Optional fields the API may add to an invoice. The current `Invoice` type has
 * no due date or payment date, so these are read only when present.
 */
type InvoiceExtras = {
  dueDate?: string | null;
  dueAt?: string | null;
  paidAt?: string | null;
  paidDate?: string | null;
  datePaid?: string | null;
};

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const invoiceId = decodeURIComponent(resolvedParams.id);
  const searchParams = useSearchParams();

  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: me } = useGetMe();
  const { mutate: payInvoice, isPending: isPaying } = usePayInvoice();
  const { mutate: viewInvoice, isPending: isDownloading } = useViewInvoice();

  // Simulated failure flag if URL contains status=failed or invoice is FAILED
  const isFailedStatus =
    searchParams.get("status") === "failed" || invoice?.status === "FAILED";

  const isPaidStatus =
    !isFailedStatus && (invoice?.status === "PAID" || invoice?.isPaid === true);

  const isPendingStatus = !isFailedStatus && !isPaidStatus;

  const invNumber = invoice ? formatInvoiceNumber(invoice) : invoiceId;
  const serviceLabel = invoice
    ? getInvoiceServiceLabel(invoice)
    : "Cloud Service";
  const amountVal = invoice?.amount;

  // Dates — only real values from the API; missing ones render as "—".
  const extras = (invoice ?? {}) as InvoiceExtras;
  const issuedDate = useMemo(
    () => formatLongDate(invoice?.createdAt),
    [invoice?.createdAt],
  );
  const dueDate = formatLongDate(extras.dueDate ?? extras.dueAt);
  const paidOnDate = formatLongDate(
    extras.paidAt ?? extras.paidDate ?? extras.datePaid,
  );

  // User billed-to information (lines without data are hidden)
  const user = me?.data;
  const billedName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || DASH;
  const billedCompany = user?.companyName || "";
  const billedEmail = user?.email || "";
  const billedAddress = [user?.houseNumber, user?.address, user?.city, user?.country]
    .filter(Boolean)
    .join(", ");

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (invoice?.id) {
      viewInvoice(invoice.id);
    } else {
      window.print();
    }
  };

  const handlePayNow = () => {
    if (!invoice?.id) {
      toast.error("Invoice identifier missing");
      return;
    }
    payInvoice(invoice.id);
  };

  const backLinkCls =
    "inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors";
  const pillCls =
    "inline-flex items-center gap-2 whitespace-nowrap text-sm";
  const focusCls =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";
  const secondaryBtnCls = `inline-flex h-9 items-center justify-center gap-1.5 px-4 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${focusCls}`;
  const primaryBtnCls = `inline-flex h-9 items-center justify-center gap-2 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${focusCls}`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#5A6A85]">Loading invoice details…</p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 4: Payment Failed Screen
  // ───────────────────────────────────────────────────────────────────────────
  if (isFailedStatus) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Back Link */}
        <div>
          <Link href="/dashboard/invoices" className={backLinkCls}>
            <ArrowLeft className="w-4 h-4" />
            Back to invoices
          </Link>
        </div>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#031033]">Payment failed</h1>
            <span className={`${pillCls} text-[#C21F1F]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />Failed</span>
          </div>
          <p className="text-sm text-[#5A6A85] mt-1">
            Invoice <span className="font-mono">#{invNumber}</span> · {serviceLabel}
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Payment Failed Card */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] px-5 py-10 sm:px-10 flex flex-col items-center text-center gap-5">
            <AlertTriangle className="w-6 h-6 text-[#DC2626]" />

            <div>
              <h2 className="text-lg font-semibold text-[#031033]">
                We couldn&apos;t complete this payment
              </h2>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-md mx-auto">
                No charge was made. Check your payment details or try another
                payment method.
              </p>
            </div>

            {/* Amount */}
            <div className="w-full max-w-md px-5 py-4 rounded-lg bg-[#F2F5FC] text-center">
              <span className="text-xs text-[#5A6A85] block">Amount</span>
              <span className="text-2xl font-semibold text-[#031033] tabular-nums block mt-1">
                {formatPrice(amountVal)}
              </span>
            </div>

            {/* Support CTA */}
            <div className="flex flex-col items-center justify-center gap-2 w-full max-w-md">
              <Link href="/dashboard/tickets" className={`w-full ${primaryBtnCls}`}>
                <Headphones className="w-4 h-4" />
                Contact support
              </Link>
            </div>

            {/* Info notice */}
            <div className="w-full max-w-md px-4 py-3 rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] text-sm text-[#0E7C3A] flex items-start justify-center gap-2 text-left">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Your invoice remains available and your payment details were not
                saved.
              </span>
            </div>
          </div>

          {/* Right Column (4 cols): Invoice Context */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h3 className="text-base font-semibold text-[#031033]">Invoice context</h3>
            </div>

            <dl className="px-5 py-2 text-sm divide-y divide-[#EEF2F7]">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#5A6A85]">Invoice number</dt>
                <dd className="font-mono text-[#031033] text-right">{invNumber}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#5A6A85]">Service</dt>
                <dd className="font-medium text-[#031033] text-right">{serviceLabel}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#5A6A85]">Amount due</dt>
                <dd className="font-semibold text-[#031033] tabular-nums text-right">
                  {formatPrice(amountVal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-[#5A6A85]">Due date</dt>
                <dd className={`text-[#031033] tabular-nums text-right ${mutedIf(dueDate)}`}>{dueDate}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 3: Payment Pending Screen
  // ───────────────────────────────────────────────────────────────────────────
  if (isPendingStatus) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Back Link */}
        <div>
          <Link href="/dashboard/invoices" className={backLinkCls}>
            <ArrowLeft className="w-4 h-4" />
            Back to invoices
          </Link>
        </div>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#031033]">
              Invoice <span className="font-mono">#{invNumber}</span>
            </h1>
            <span className={`${pillCls} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#E8900A]" />Awaiting payment</span>
          </div>
          <p className="text-sm text-[#5A6A85] mt-1 tabular-nums">
            Created {issuedDate}
            {dueDate !== DASH && <> · Due {dueDate}</>}
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Payment pending overview */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-start gap-3 px-5 py-4 border-b border-[#EEF2F7]">
              <Clock className="w-4 h-4 text-[#E8900A] shrink-0 mt-1" />
              <div>
                <h2 className="text-base font-semibold text-[#031033]">Payment pending</h2>
                <p className="text-sm text-[#5A6A85] mt-0.5">
                  Your {serviceLabel} invoice is ready for payment.
                </p>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* 3 Detail Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Service", value: serviceLabel },
                  { label: "Invoice date", value: issuedDate },
                  { label: "Due date", value: dueDate },
                ].map((tile) => (
                  <div key={tile.label} className="bg-[#F2F5FC] rounded-lg px-4 py-3">
                    <span className="text-xs text-[#5A6A85] block">{tile.label}</span>
                    <span className={`text-sm font-medium text-[#031033] mt-1 block truncate tabular-nums ${mutedIf(tile.value)}`}>
                      {tile.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Itemized summary */}
              <div className="rounded-lg border border-[#E2E8F0]">
                <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-[#EEF2F7]">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#031033] block">
                      {serviceLabel}
                    </span>
                    {invoice?.description && (
                      <span className="text-xs text-[#5A6A85] block mt-0.5">
                        {invoice.description}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#031033] tabular-nums text-right shrink-0">
                    {formatPrice(amountVal)}
                  </span>
                </div>

                <dl className="px-4 py-3 flex flex-col text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="text-[#5A6A85]">Subtotal</dt>
                    <dd className="text-[#031033] tabular-nums text-right">{formatPrice(amountVal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="text-[#5A6A85]">Tax</dt>
                    <dd className="text-[#031033] tabular-nums text-right">₦0</dd>
                  </div>
                  <div className="flex justify-between items-baseline gap-4 pt-3 mt-2 border-t border-[#E2E8F0]">
                    <dt className="font-semibold text-[#031033]">Amount due</dt>
                    <dd className="text-base font-semibold text-[#031033] tabular-nums text-right">
                      {formatPrice(amountVal)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Help note */}
              <p className="text-xs text-[#5A6A85]">
                Need help with this invoice?{" "}
                <Link
                  href="/dashboard/tickets"
                  className="text-[#1787D4] font-medium hover:text-[#1370B5]"
                >
                  Contact support
                </Link>{" "}
                and quote <span className="font-mono text-[#031033]">{invNumber}</span>.
              </p>
            </div>
          </div>

          {/* Right Column (4 cols): Amount due & Pay button */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
            <div>
              <span className="text-xs text-[#5A6A85] block">Amount due</span>
              <span className="text-3xl font-semibold text-[#031033] tabular-nums block mt-1">
                {formatPrice(amountVal)}
              </span>
              {dueDate !== DASH && (
                <span className="text-xs text-[#9A5B00] font-medium block mt-1 tabular-nums">
                  Due {dueDate}
                </span>
              )}
            </div>

            <p className="text-xs text-[#5A6A85]">
              Pay now to keep activation on schedule. Your payment is encrypted
              and processed by Paystack.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                id="btn-pay-pending-invoice"
                onClick={handlePayNow}
                disabled={isPaying}
                className={`w-full h-10 ${primaryBtnCls}`}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Paystack…</span>
                  </>
                ) : (
                  "Pay now"
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className={`w-full ${secondaryBtnCls}`}
              >
                Download invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 2: Paid Invoice Screen
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link href="/dashboard/invoices" className={backLinkCls}>
          <ArrowLeft className="w-4 h-4" />
          Back to invoices
        </Link>
      </div>

      {/* Header with Title, Paid Badge, Subtitle & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#031033]">
              Invoice <span className="font-mono">#{invNumber}</span>
            </h1>
            <span className={`${pillCls} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />Paid</span>
          </div>
          <p className="text-sm text-[#5A6A85] mt-1 tabular-nums">
            Issued {issuedDate}
            {dueDate !== DASH && <> · Due {dueDate}</>}
          </p>
        </div>

        {/* Top Right Action Buttons (Download PDF, Print) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={secondaryBtnCls}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>
          <button type="button" onClick={handlePrint} className={secondaryBtnCls}>
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* ── Invoice Paper Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-10 flex flex-col gap-8 print:p-0 print:border-none">
        {/* Top Row: Nupat Cloud Logo & Tax Invoice Number */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#EEF2F7]">
          <div>
            <Image
              src="/nupat_cloud_logo-nav.png"
              alt="Nupat Cloud"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="text-xs text-[#5A6A85] block mt-2">Tax invoice</span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#5A6A85] block">Invoice number</span>
            <div className="flex items-center sm:justify-end gap-2 mt-1">
              <span className="text-lg font-semibold text-[#031033] font-mono">{invNumber}</span>
              <span className={`${pillCls} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />Paid</span>
            </div>
          </div>
        </div>

        {/* FROM & BILLED TO Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {/* FROM */}
          <div>
            <span className="text-xs text-[#5A6A85] block mb-1.5">From</span>
            <span className="font-medium text-[#031033] block">Nupat Cloud</span>
            <span className="text-[#5A6A85] block">Lagos, Nigeria</span>
            <span className="text-[#5A6A85] block mt-1">billing@nupatcloud.com</span>
            <span className="text-[#5A6A85] block tabular-nums">+234 907 664 6154</span>
          </div>

          {/* BILLED TO */}
          <div>
            <span className="text-xs text-[#5A6A85] block mb-1.5">Billed to</span>
            <span className={`font-medium text-[#031033] block ${mutedIf(billedName)}`}>{billedName}</span>
            {billedCompany && (
              <span className="text-[#5A6A85] block">{billedCompany}</span>
            )}
            {billedEmail && (
              <span className="text-[#5A6A85] block break-all">{billedEmail}</span>
            )}
            {billedAddress && (
              <span className="text-[#5A6A85] block">{billedAddress}</span>
            )}
          </div>

          {/* ISSUED */}
          <div>
            <span className="text-xs text-[#5A6A85] block mb-1.5">Issued</span>
            <span className={`font-medium text-[#031033] block tabular-nums ${mutedIf(issuedDate)}`}>{issuedDate}</span>
          </div>

          {/* DUE */}
          <div>
            <span className="text-xs text-[#5A6A85] block mb-1.5">Due</span>
            <span className={`font-medium text-[#031033] block tabular-nums ${mutedIf(dueDate)}`}>{dueDate}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-3 pr-4 text-xs font-medium text-[#5A6A85]">Description</th>
                <th className="py-3 px-4 text-xs font-medium text-[#5A6A85] text-right">Qty</th>
                <th className="py-3 px-4 text-xs font-medium text-[#5A6A85] text-right">Unit price</th>
                <th className="py-3 pl-4 text-xs font-medium text-[#5A6A85] text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EEF2F7]">
                <td className="py-3 pr-4 font-medium text-[#031033]">
                  {serviceLabel}
                  {invoice?.description && (
                    <span className="text-xs font-normal text-[#5A6A85] block mt-0.5">
                      {invoice.description}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-[#5A6A85] tabular-nums">1</td>
                <td className="py-3 px-4 text-right text-[#5A6A85] tabular-nums whitespace-nowrap">
                  {formatPrice(amountVal)}
                </td>
                <td className="py-3 pl-4 text-right font-medium text-[#031033] tabular-nums whitespace-nowrap">
                  {formatPrice(amountVal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <dl className="flex flex-col items-end text-sm -mt-4">
          <div className="w-full max-w-xs flex justify-between gap-4 py-1.5">
            <dt className="text-[#5A6A85]">Subtotal</dt>
            <dd className="text-[#031033] tabular-nums">{formatPrice(amountVal)}</dd>
          </div>
          <div className="w-full max-w-xs flex justify-between gap-4 py-1.5">
            <dt className="text-[#5A6A85]">Tax (0%)</dt>
            <dd className="text-[#031033] tabular-nums">₦0</dd>
          </div>
          <div className="w-full max-w-xs flex justify-between gap-4 py-1.5">
            <dt className="text-[#5A6A85]">Discount</dt>
            <dd className="text-[#5A6A85]">—</dd>
          </div>
          <div className="w-full max-w-xs flex justify-between items-baseline gap-4 pt-3 mt-1.5 border-t border-[#E2E8F0]">
            <dt className="font-semibold text-[#031033]">Total</dt>
            <dd className="text-lg font-semibold text-[#031033] tabular-nums">{formatPrice(amountVal)}</dd>
          </div>
        </dl>

        {/* Payment status notice */}
        <div className="px-4 py-3 rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] flex flex-wrap items-center justify-between gap-2 text-sm text-[#0E7C3A]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Paid in full</span>
          </div>
          <span className="font-medium tabular-nums">
            {formatPrice(amountVal)} received
          </span>
        </div>

        {/* Fine Print Note */}
        <p className="text-center text-xs text-[#5A6A85]">
          Thank you for choosing Nupat Cloud. This invoice was generated
          automatically and is valid without a signature.
        </p>
      </div>

      {/* ── Card Below Invoice: Payment Details ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]">
        <div className="px-5 py-4 border-b border-[#EEF2F7]">
          <h3 className="text-base font-semibold text-[#031033]">Payment details</h3>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#F2F5FC] rounded-lg px-4 py-3">
              <span className="text-xs text-[#5A6A85] block">Method</span>
              <span className="font-medium text-[#031033] text-sm mt-1 block">Paystack</span>
            </div>

            <div className="bg-[#F2F5FC] rounded-lg px-4 py-3">
              <span className="text-xs text-[#5A6A85] block">Transaction ID</span>
              <span className={`font-mono text-[#031033] text-sm mt-1 block truncate ${mutedIf(invoice?.paystackRef || DASH)}`}>
                {invoice?.paystackRef || DASH}
              </span>
            </div>

            <div className="bg-[#F2F5FC] rounded-lg px-4 py-3">
              <span className="text-xs text-[#5A6A85] block">Paid on</span>
              <span className={`font-medium text-[#031033] text-sm mt-1 block tabular-nums ${mutedIf(paidOnDate)}`}>{paidOnDate}</span>
            </div>

            <div className="bg-[#F2F5FC] rounded-lg px-4 py-3">
              <span className="text-xs text-[#5A6A85] block">Status</span>
              <span className="mt-1 flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]"><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />Successful</span>
            </div>
          </div>

          {/* Connected Service Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[#E2E8F0]">
            <div className="flex items-start gap-3 min-w-0">
              {serviceLabel === "Web Hosting" ? (
                <Server className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
              ) : serviceLabel === "SSL Certificate" ? (
                <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
              ) : (
                <Globe className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#031033]">{serviceLabel}</span>
                </div>
                {invoice?.description && (
                  <span className="text-xs text-[#5A6A85] block mt-0.5">
                    {invoice.description}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={
                serviceLabel === "Web Hosting"
                  ? "/dashboard/hosting"
                  : serviceLabel === "SSL Certificate"
                    ? "/dashboard/ssl"
                    : "/dashboard/domains"
              }
              className={`inline-flex h-8 items-center justify-center px-3 self-start sm:self-auto shrink-0 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors ${focusCls}`}
            >
              Manage {serviceLabel.split(" ")[0]}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleDownload} className={primaryBtnCls}>
          Download invoice
        </button>
        <button type="button" onClick={handlePrint} className={secondaryBtnCls}>
          Print invoice
        </button>
        <Link
          href="/dashboard/tickets"
          className={`inline-flex h-9 items-center px-4 text-[#1787D4] hover:bg-[#E8F4FC] text-sm font-medium rounded-lg transition-colors ${focusCls}`}
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
