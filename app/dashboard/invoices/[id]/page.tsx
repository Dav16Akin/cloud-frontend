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

function formatPrice(n: number) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

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
  const amountVal = invoice?.amount || 45000;

  // Dates
  const issuedDate = useMemo(() => {
    const base = invoice?.createdAt ? new Date(invoice.createdAt) : new Date();
    return base.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [invoice]);

  const dueDate = useMemo(() => {
    const base = invoice?.createdAt ? new Date(invoice.createdAt) : new Date();
    base.setDate(base.getDate() + 7);
    return base.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [invoice]);

  // User billed-to information
  const user = me?.data;
  const billedName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Account Holder";
  const billedCompany = user?.companyName || "Personal Account";
  const billedEmail = user?.email || "billing@customer.com";
  const billedAddress =
    [user?.houseNumber, user?.address, user?.city, user?.country]
      .filter(Boolean)
      .join(", ") || "Lagos, Nigeria";

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#6e6e73]">Loading invoice details…</p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 4: Payment Failed Screen (Matches Screen 4 in User Mockup)
  // ───────────────────────────────────────────────────────────────────────────
  if (isFailedStatus) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoice
          </Link>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] tracking-tight"
              style={{ letterSpacing: "-0.4px" }}
            >
              Payment failed
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-red-50 text-red-600 border border-red-200">
              Failed
            </span>
          </div>
          <p className="text-[13.5px] text-[#6e6e73] mt-1">
            Invoice #{invNumber} • {serviceLabel}
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Payment Failed Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2eaff] p-8 sm:p-10 shadow-xs flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-[#1d1d1f]">
                Payment Failed
              </h2>
              <p className="text-[13px] text-[#6e6e73] mt-1 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t complete the payment for this invoice. No
                charge was made. Check your payment details or try another
                payment method.
              </p>
            </div>

            {/* Red amount banner */}
            <div className="w-full max-w-md py-4 px-6 rounded-xl bg-red-50/70 border border-red-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">
                Amount
              </span>
              <span className="text-[26px] font-extrabold text-[#1d1d1f] block mt-0.5 tracking-tight">
                {formatPrice(amountVal)}
              </span>
            </div>

            {/* Support CTA */}
            <div className="flex flex-col items-center justify-center gap-2 mt-2 w-full max-w-md">
              <Link
                href="/dashboard/tickets"
                className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                Contact Support
              </Link>
            </div>

            {/* Green info alert at bottom */}
            <div className="w-full mt-3 p-3.5 rounded-xl bg-[#e6f9ed]/70 border border-[#b7eed0] text-[12px] text-[#12a150] flex items-center justify-center gap-2">
              <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>
                Your invoice remains available and your payment details were not
                saved.
              </span>
            </div>
          </div>

          {/* Right Column (4 cols): Invoice Context */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">
              Invoice context
            </h3>

            <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-4 flex flex-col gap-3 text-xs">
              <div>
                <span className="text-[#6e6e73] block uppercase tracking-wider text-[10.5px] font-semibold">
                  Invoice number
                </span>
                <span className="font-bold text-[#1d1d1f] text-[13px] mt-0.5 block">
                  {invNumber}
                </span>
              </div>

              <div>
                <span className="text-[#6e6e73] block uppercase tracking-wider text-[10.5px] font-semibold">
                  Service
                </span>
                <span className="font-bold text-[#1d1d1f] text-[13px] mt-0.5 block">
                  {serviceLabel}
                </span>
              </div>

              <div>
                <span className="text-[#6e6e73] block uppercase tracking-wider text-[10.5px] font-semibold">
                  Amount due
                </span>
                <span className="font-extrabold text-[#d92d20] text-[16px] mt-0.5 block">
                  {formatPrice(amountVal)}
                </span>
              </div>

              <div>
                <span className="text-[#6e6e73] block uppercase tracking-wider text-[10.5px] font-semibold">
                  Due date
                </span>
                <span className="font-medium text-[#1d1d1f] text-[12.5px] mt-0.5 block">
                  {dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 3: Payment Pending Screen (Matches Screen 3 in User Mockup)
  // ───────────────────────────────────────────────────────────────────────────
  if (isPendingStatus) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] tracking-tight"
              style={{ letterSpacing: "-0.4px" }}
            >
              Invoice #{invNumber}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Payment Pending
            </span>
          </div>
          <p className="text-[13.5px] text-[#6e6e73] mt-1">
            Created: {issuedDate} • Due: {dueDate}
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Payment pending overview */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2eaff] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Clock className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#1d1d1f]">
                  Payment pending
                </h2>
                <p className="text-[13px] text-[#6e6e73] mt-0.5">
                  Your {serviceLabel} invoice is ready for payment.
                </p>
              </div>
            </div>

            {/* 3 Detail Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
                  Service
                </span>
                <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block truncate">
                  {serviceLabel}
                </span>
              </div>

              <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
                  Invoice date
                </span>
                <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block">
                  {issuedDate}
                </span>
              </div>

              <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
                  Due date
                </span>
                <span className="text-[13.5px] font-bold text-[#1d1d1f] mt-1 block">
                  {dueDate}
                </span>
              </div>
            </div>

            {/* Itemized card */}
            <div className="rounded-xl border border-[#e2eaff] p-4 bg-[#fbfcfe] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-bold text-[#1d1d1f] block">
                    {serviceLabel}
                  </span>
                  <span className="text-[12px] text-[#6e6e73] block mt-0.5">
                    {invoice?.description || "1-year renewal subscription plan"}
                  </span>
                </div>
                <span className="text-[15px] font-extrabold text-[#1d1d1f]">
                  {formatPrice(amountVal)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#eef2f8] flex flex-col gap-1.5 text-xs text-[#6e6e73]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatPrice(amountVal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium text-[#1d1d1f]">₦0</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#eef2f8] text-sm font-bold text-[#1d1d1f]">
                  <span>Amount due</span>
                  <span className="text-[#1787D4] font-extrabold text-[16px]">
                    {formatPrice(amountVal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Help note */}
            <p className="text-[12px] text-[#6e6e73] leading-relaxed">
              Need help with this invoice?{" "}
              <Link
                href="/dashboard/tickets"
                className="text-[#1787D4] font-medium hover:underline"
              >
                Contact support
              </Link>{" "}
              and quote <strong className="text-[#1d1d1f]">{invNumber}</strong>.
            </p>
          </div>

          {/* Right Column (4 cols): Amount due & Pay button */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-wider block">
                Amount due
              </span>
              <span className="text-[26px] font-extrabold text-[#1d1d1f] block mt-1 tracking-tight">
                {formatPrice(amountVal)}
              </span>
              <span className="text-[12px] text-amber-700 font-medium block mt-1">
                Due: {dueDate}
              </span>
            </div>

            <p className="text-[12px] text-[#6e6e73] leading-relaxed">
              Pay now to keep activation on schedule. Your payment is encrypted
              and processed securely.
            </p>

            <button
              type="button"
              id="btn-pay-pending-invoice"
              onClick={handlePayNow}
              disabled={isPaying}
              className="w-full py-3 px-4 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13.5px] font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Paystack…</span>
                </>
              ) : (
                "Pay Now"
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SCREEN 2: Paid Invoice Screen (Matches Screen 2 in User Mockup)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
      </div>

      {/* Header with Title, Paid Badge, Subtitle & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] tracking-tight"
              style={{ letterSpacing: "-0.4px" }}
            >
              Invoice #{invNumber}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
              Paid
            </span>
          </div>
          <p className="text-[13.5px] text-[#6e6e73] mt-1">
            Issued: {issuedDate} • Due: {dueDate}
          </p>
        </div>

        {/* Top Right Action Buttons (Download PDF, Print) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* ── Official Invoice Paper Card (Screen 2) ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 sm:p-12 shadow-xs flex flex-col gap-8 print:p-0 print:border-none print:shadow-none">
        {/* Top Row: Nupat Cloud Logo & Tax Invoice Number */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#f0f4f9]">
          <div>
            <Image
              src="/nupat_cloud_logo-nav.png"
              alt="Nupat Cloud"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="text-[10px] font-bold text-[#8a9bb2] uppercase tracking-wider block mt-2">
              Tax Invoice
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold text-[#6e6e73] block uppercase tracking-wider">
              Invoice Number
            </span>
            <div className="flex items-center sm:justify-end gap-2 mt-1">
              <span className="text-[18px] font-extrabold text-[#1d1d1f] tracking-tight">
                {invNumber}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f9ed] text-[#12a150]">
                PAID
              </span>
            </div>
          </div>
        </div>

        {/* FROM & BILLED TO Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-[12.5px] leading-relaxed">
          {/* FROM */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e6e73] block mb-1">
              From
            </span>
            <span className="font-bold text-[#1d1d1f] block">Nupat Cloud</span>
            <span className="text-[#5a6a85] block"></span>
            <span className="text-[#5a6a85] block">Lagos, Nigeria</span>
            <span className="text-[#5a6a85] block mt-1">
              billing@nupatcloud.com
            </span>
            <span className="text-[#5a6a85] block">+234 907 664 6154</span>
          </div>

          {/* BILLED TO */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e6e73] block mb-1">
              Billed To
            </span>
            <span className="font-bold text-[#1d1d1f] block">{billedName}</span>
            <span className="text-[#5a6a85] block">{billedCompany}</span>
            <span className="text-[#5a6a85] block">{billedEmail}</span>
            <span className="text-[#5a6a85] block">{billedAddress}</span>
          </div>

          {/* ISSUED */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e6e73] block mb-1">
              Issued
            </span>
            <span className="font-bold text-[#1d1d1f] block">{issuedDate}</span>
          </div>

          {/* DUE */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e6e73] block mb-1">
              Due
            </span>
            <span className="font-bold text-[#1d1d1f] block">{dueDate}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                <th className="py-3 px-4 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                  Description
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider text-center">
                  Qty
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider text-right">
                  Unit price
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5fc]">
              <tr>
                <td className="py-4 px-4 font-bold text-[#1d1d1f]">
                  {serviceLabel}
                  <span className="text-[11.5px] font-normal text-[#6e6e73] block mt-0.5">
                    {invoice?.description ||
                      "Subscription plan and active domain service"}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-[#5a6a85]">1</td>
                <td className="py-4 px-4 text-right text-[#5a6a85]">
                  {formatPrice(amountVal)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-[#1d1d1f]">
                  {formatPrice(amountVal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col items-end gap-2 text-[13px] pt-2 border-t border-[#f0f4f9]">
          <div className="w-full max-w-xs flex justify-between text-[#6e6e73]">
            <span>Subtotal</span>
            <span className="font-medium text-[#1d1d1f]">
              {formatPrice(amountVal)}
            </span>
          </div>
          <div className="w-full max-w-xs flex justify-between text-[#6e6e73]">
            <span>Tax (0%)</span>
            <span className="font-medium text-[#1d1d1f]">₦0</span>
          </div>
          <div className="w-full max-w-xs flex justify-between text-[#6e6e73]">
            <span>Discount</span>
            <span className="font-medium text-[#1d1d1f]">—</span>
          </div>
          <div className="w-full max-w-xs flex justify-between text-[16px] font-extrabold text-[#1d1d1f] pt-2 border-t border-[#eef2f8]">
            <span>Total</span>
            <span className="text-[#1787D4]">{formatPrice(amountVal)}</span>
          </div>
        </div>

        {/* Green Payment Status Bar */}
        <div className="p-4 rounded-xl bg-[#e6f9ed]/80 border border-[#b7eed0] flex items-center justify-between text-[13px] text-[#12a150]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold">Payment Status: PAID</span>
          </div>
          <span className="font-extrabold">
            {formatPrice(amountVal)} received
          </span>
        </div>

        {/* Fine Print Note */}
        <p className="text-center text-[11px] text-[#9ba8c0]">
          Thank you for choosing Nupat Cloud. This invoice was generated
          automatically and is valid without a signature.
        </p>
      </div>

      {/* ── Card Below Invoice: Payment Details (Screen 2) ────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-[15px] font-bold text-[#1d1d1f]">
          Payment details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
            <span className="text-[10.5px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
              Method
            </span>
            <span className="font-bold text-[#1d1d1f] text-[13px] mt-1 block">
              Card / Paystack
            </span>
          </div>

          <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
            <span className="text-[10.5px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
              Transaction ID
            </span>
            <span className="font-bold font-mono text-[#1d1d1f] text-[12px] mt-1 block truncate">
              {invoice?.paystackRef ||
                `TXN-20261003-${invoice?.id?.slice(-5) || "V6821"}`}
            </span>
          </div>

          <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
            <span className="text-[10.5px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
              Paid on Date
            </span>
            <span className="font-bold text-[#1d1d1f] text-[13px] mt-1 block">
              {issuedDate}
            </span>
          </div>

          <div className="bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3.5">
            <span className="text-[10.5px] font-semibold text-[#6e6e73] uppercase tracking-wider block">
              Status
            </span>
            <span className="font-bold text-[#12a150] text-[13px] mt-1 block">
              Successful
            </span>
          </div>
        </div>

        {/* Connected Service Box */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#e2eaff] bg-[#fbfcfe]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center">
              {serviceLabel === "Web Hosting" ? (
                <Server className="w-5 h-5" />
              ) : serviceLabel === "SSL Certificate" ? (
                <Shield className="w-5 h-5" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                  {serviceLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f9ed] text-[#12a150]">
                  Active
                </span>
              </div>
              <span className="text-[11.5px] text-[#6e6e73] block mt-0.5">
                {invoice?.description || "Subscription active on account"}
              </span>
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
            className="py-2 px-3.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-xl transition-colors shadow-sm"
          >
            Manage {serviceLabel.split(" ")[0]}
          </Link>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          Download Invoice
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Print Invoice
        </button>
        <Link
          href="/dashboard/tickets"
          className="py-2.5 px-4 text-[#1787D4] hover:bg-blue-50/50 text-[13px] font-semibold rounded-xl transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
