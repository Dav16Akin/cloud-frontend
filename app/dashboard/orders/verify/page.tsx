"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShoppingCart,
  AlertCircle,
  Server,
  Globe,
  Shield,
} from "lucide-react";
import { useVerifyPayment } from "@/hooks/useOrders";
import type { OrderItem } from "@/lib/api";

function ItemTypeIcon({ type }: { type: OrderItem["type"] }) {
  if (type === "HOSTING")
    return (
      <div className="w-8 h-8 bg-[#fff8ee] border border-[#f5d99e] flex items-center justify-center shrink-0">
        <Server className="w-3.5 h-3.5 text-[#e8900a]" />
      </div>
    );
  if (type === "DOMAIN")
    return (
      <div className="w-8 h-8 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
        <Globe className="w-3.5 h-3.5 text-[#031033]" />
      </div>
    );
  return (
    <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
      <Shield className="w-3.5 h-3.5 text-emerald-500" />
    </div>
  );
}

function ItemLabel({ item }: { item: OrderItem }) {
  if (item.type === "HOSTING") return <>{item.plan?.name ?? "Hosting"} Plan</>;
  if (item.type === "DOMAIN") return <>{item.domainName}</>;
  return <>SSL — {item.domainName}</>;
}

function ItemSubtitle({ item }: { item: OrderItem }) {
  if (item.type === "HOSTING") return <>Web Hosting Plan</>;
  if (item.type === "DOMAIN") return <>Domain Registration</>;
  return <>SSL Certificate</>;
}

// ── Main verify page content ──────────────────────────────────────────────────

function OrderVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference") ?? "";
  const {
    data,
    isLoading,
    isError,
    error,
    isPaid,
    isFailed,
    isPendingStatus,
    isExhausted,
    pollCount,
    maxPolls,
    checkStatusNow,
    isManualChecking,
  } = useVerifyPayment(reference || null);

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isPaid) return;

    const timer = setTimeout(() => {
      router.replace("/dashboard/orders");
    }, 5000);

    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isPaid, router]);

  // ── No reference in URL ───────────────────────────────────────────────────

  if (!reference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-xl font-extrabold text-[#031033]">
          No payment reference found
        </h1>
        <p className="text-sm text-[#5a6a85] max-w-xs">
          This page requires a payment reference from Paystack. Please start
          from the checkout page.
        </p>
        <Link
          href="/dashboard/hosting"
          className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Go to Hosting
        </Link>
      </div>
    );
  }

  // ── Initial Loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#031033]">
            Verifying your payment…
          </h1>
          <p className="text-sm text-[#5a6a85] mt-1.5 max-w-xs">
            Please wait while we confirm your payment with Paystack.
          </p>
        </div>
        <p className="text-xs font-mono text-[#9ba8c0] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5">
          ref: {reference}
        </p>
      </div>
    );
  }

  // ── Pending / Processing State ───────────────────────────────────────────

  if (isPendingStatus && !isPaid && !isFailed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5 max-w-md mx-auto animate-fade-up">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>

        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full mb-2">
            Payment Processing
          </span>
          <h1 className="text-xl font-extrabold text-[#031033]">
            Awaiting Confirmation
          </h1>
          <p className="text-sm text-[#5a6a85] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {!isExhausted ? (
              `Checking transaction status with Paystack (attempt ${pollCount + 1} of ${maxPolls})…`
            ) : (
              "Paystack has received your payment instruction. Verification is taking a moment longer than expected. Your order is secure, and services will provision automatically once confirmed."
            )}
          </p>
        </div>

        <p className="text-xs font-mono text-[#9ba8c0] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5">
          ref: {reference}
        </p>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-800 text-left w-full">
          <p className="font-semibold mb-0.5">No need to wait here</p>
          <p>
            You can safely navigate away. You will receive an email confirmation as soon as Paystack confirms the transaction.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={checkStatusNow}
            disabled={isManualChecking}
            className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isManualChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Check Status"
            )}
          </button>
          <Link
            href="/dashboard/orders"
            className="flex-1 text-sm py-2.5 font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors flex items-center justify-center gap-2"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Failed / Error State ──────────────────────────────────────────────────

  if (isFailed || (isError && !isPaid)) {
    const message =
      isError && error instanceof Error
        ? error.message
        : "Payment verification failed. The transaction may have been cancelled or declined.";

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5 max-w-md mx-auto animate-fade-up">
        <div className="w-16 h-16 bg-red-50 border border-red-200 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-[#031033]">
            Payment not verified
          </h1>
          <p className="text-sm text-[#5a6a85] mt-1.5 max-w-xs mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        <p className="text-xs font-mono text-[#9ba8c0] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5">
          ref: {reference}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            href="/dashboard/hosting"
            className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex-1 text-sm py-2.5 font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors flex items-center justify-center gap-2"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  const displayCountdown = Math.max(0, countdown);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-6 max-w-md mx-auto">
      {/* Animated success icon */}
      <div className="relative">
        <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#e8900a] flex items-center justify-center text-white text-[10px] font-extrabold">
          ✓
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-[#031033]">
          Payment Confirmed!
        </h1>
        <p className="text-[#5a6a85] mt-2 text-sm leading-relaxed">
          Your payment has been confirmed and your services are being
          provisioned automatically. No further action needed.
        </p>
      </div>

      {/* Items summary */}
      <div className="w-full bg-[#f6f9ff] border border-[#e2eaff] text-left">
        {data?.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#e2eaff] last:border-b-0"
          >
            <ItemTypeIcon type={item.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#031033]">
                <ItemLabel item={item} />
              </p>
              <p className="text-xs text-[#9ba8c0]">
                <ItemSubtitle item={item} />
              </p>
            </div>
            <p className="text-sm font-bold text-[#031033] shrink-0">
              ₦{item.price.toLocaleString("en-NG")}
            </p>
          </div>
        ))}
        {/* Total row */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <span className="text-xs font-bold text-[#9ba8c0] uppercase tracking-wide">
            Total
          </span>
          <span className="text-base font-extrabold text-[#031033]">
            ₦{(data?.amount ?? 0).toLocaleString("en-NG")}
          </span>
        </div>
        {/* Reference */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e2eaff]">
          <span className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
            Reference
          </span>
          <span className="text-xs font-mono text-[#5a6a85]">
            {data?.reference ?? reference}
          </span>
        </div>
      </div>

      {/* Auto-redirect countdown */}
      <div className="flex flex-col items-center gap-3 w-full">
        <p className="text-xs text-[#9ba8c0]">
          Redirecting to your orders in{" "}
          <span className="font-bold text-[#e8900a]">{displayCountdown}s</span>
          …
        </p>

        <Link
          href="/dashboard/orders"
          id="verify-view-orders"
          className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
        >
          View My Orders
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/dashboard/hosting"
          className="text-xs font-semibold text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
        >
          Go to Hosting Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function OrderVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
        <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
        <p className="text-sm text-[#5a6a85]">Loading verification details...</p>
      </div>
    }>
      <OrderVerifyContent />
    </Suspense>
  );
}
