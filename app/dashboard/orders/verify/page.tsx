"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useVerifyPayment } from "@/hooks/useOrders";

// Countdown from N seconds then auto-navigate
function useCountdown(seconds: number, onDone: () => void) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return count;
}

// ── Main verify page ──────────────────────────────────────────────────────────

export default function OrderVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference") ?? "";
  const { data, isLoading, isError, error } = useVerifyPayment(
    reference || null,
  );

  const isPaid = data?.status === "PAID";
  const planId = data?.plan?.id ?? "";

  const [shouldCountdown, setShouldCountdown] = useState(false);

  // Start the countdown only once we know payment is confirmed
  useEffect(() => {
    if (isPaid) setShouldCountdown(true);
  }, [isPaid]);

  const countdown = useCountdown(
    shouldCountdown ? 5 : 999,
    () => {
      if (isPaid && planId) {
        router.replace(
          `/dashboard/hosting/provision?planId=${planId}&planName=${encodeURIComponent(data.plan.name)}`,
        );
      }
    },
  );

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
          from the hosting plans page.
        </p>
        <Link
          href="/dashboard/hosting"
          className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          View Plans
        </Link>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

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

  // ── Error / Failed ────────────────────────────────────────────────────────

  if (isError || !data || data.status !== "PAID") {
    const message =
      isError && error instanceof Error
        ? error.message
        : data?.status === "PENDING"
        ? "Your payment is still being processed. Please check back in a moment."
        : "Payment verification failed. The payment may not have completed.";

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5 max-w-md mx-auto">
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

  const displayCountdown = shouldCountdown ? Math.max(0, countdown) : 5;

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
          Your payment for the{" "}
          <span className="font-semibold text-[#031033]">
            {data.plan.name} Hosting
          </span>{" "}
          plan has been confirmed. You can now provision your hosting account.
        </p>
      </div>

      {/* Order summary */}
      <div className="w-full bg-[#f6f9ff] border border-[#e2eaff] divide-y divide-[#e2eaff] text-left">
        {[
          { label: "Plan", value: `${data.plan.name} Hosting` },
          {
            label: "Amount",
            value: `₦${data.amount.toLocaleString("en-NG")}`,
          },
          { label: "Reference", value: data.reference },
          { label: "Status", value: "PAID" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
              {label}
            </span>
            <span
              className={`text-sm font-semibold ${
                label === "Status"
                  ? "text-emerald-600"
                  : label === "Reference"
                  ? "font-mono text-xs text-[#5a6a85]"
                  : "text-[#031033]"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Auto-redirect countdown */}
      <div className="flex flex-col items-center gap-3 w-full">
        <p className="text-xs text-[#9ba8c0]">
          Redirecting to setup in{" "}
          <span className="font-bold text-[#e8900a]">{displayCountdown}s</span>
          …
        </p>

        <Link
          href={`/dashboard/hosting/provision?planId=${planId}&planName=${encodeURIComponent(data.plan.name)}`}
          id="verify-setup-now"
          className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
        >
          Set Up Hosting Now
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/dashboard/orders"
          className="text-xs font-semibold text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
}
