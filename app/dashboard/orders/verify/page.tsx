"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  XCircle,
  Loader2,
  ArrowRight,
  ShoppingCart,
  AlertCircle,
  Server,
  Globe,
  Shield,
  Cpu,
} from "lucide-react";
import { useVerifyPayment } from "@/hooks/useOrders";
import type { OrderItem } from "@/lib/api";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";
const PRIMARY_BTN = `inline-flex h-9 items-center justify-center gap-2 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;
const SECONDARY_BTN = `inline-flex h-9 items-center justify-center gap-2 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors ${FOCUS}`;

function ItemTypeIcon({ type }: { type: OrderItem["type"] }) {
  const Icon =
    type === "HOSTING"
      ? Server
      : type === "DOMAIN"
        ? Globe
        : type === "VPS" || type === "VPS_RENEWAL"
          ? Cpu
          : Shield;
  return <Icon className="w-4 h-4 text-[#5A6A85] shrink-0" />;
}

function ItemLabel({ item }: { item: OrderItem }) {
  if (item.type === "HOSTING") return <>{item.plan?.name ?? "Hosting"} Plan</>;
  if (item.type === "DOMAIN") return <>{item.domainName}</>;
  if (item.type === "VPS")
    return <>{item.vpsPlan?.name ?? "VPS"} Server</>;
  if (item.type === "VPS_RENEWAL")
    return (
      <>
        {item.vpsTarget?.name ?? item.vpsPlan?.name ?? "VPS"} Renewal
      </>
    );
  return <>SSL — {item.domainName}</>;
}

function ItemSubtitle({ item }: { item: OrderItem }) {
  if (item.type === "HOSTING") return <>Web hosting plan</>;
  if (item.type === "DOMAIN") return <>Domain registration</>;
  if (item.type === "VPS")
    return (
      <>
        Virtual server
        {item.vpsConfig?.location ? ` · ${item.vpsConfig.location}` : ""}
      </>
    );
  if (item.type === "VPS_RENEWAL") return <>30-day extension</>;
  return <>SSL certificate</>;
}

function ReferenceLine({ reference }: { reference: string }) {
  return (
    <p className="text-xs text-[#5A6A85]">
      Reference <span className="font-mono text-[#031033]">{reference}</span>
    </p>
  );
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

  const items = data?.items ?? [];
  const hasVpsServer = items.some((item) => item.type === "VPS");
  const hasVpsRenewal = items.some((item) => item.type === "VPS_RENEWAL");
  const hasVps = hasVpsServer || hasVpsRenewal;
  const hasNonVps = items.some(
    (item) => item.type !== "VPS" && item.type !== "VPS_RENEWAL",
  );
  const isVpsOnly = hasVps && !hasNonVps;
  const destination = isVpsOnly ? "/dashboard/vps" : "/dashboard/orders";

  useEffect(() => {
    if (!isPaid) return;

    const timer = setTimeout(() => {
      router.replace(destination);
    }, 5000);

    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isPaid, router, destination]);

  // ── No reference in URL ───────────────────────────────────────────────────

  if (!reference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
        <AlertCircle className="w-6 h-6 text-[#E8900A]" />
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">
            No payment reference found
          </h1>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-xs mx-auto">
            This page needs a payment reference from Paystack. Start again from
            the checkout page.
          </p>
        </div>
        <Link href="/dashboard/hosting" className={PRIMARY_BTN}>
          <ShoppingCart className="w-4 h-4" />
          Go to hosting
        </Link>
      </div>
    );
  }

  // ── Initial Loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">
            Verifying your payment…
          </h1>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-xs mx-auto">
            Please wait while we confirm your payment with Paystack.
          </p>
        </div>
        <ReferenceLine reference={reference} />
      </div>
    );
  }

  // ── Pending / Processing State ───────────────────────────────────────────

  if (isPendingStatus && !isPaid && !isFailed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4 max-w-md mx-auto">
        <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />

        <div>
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033] mb-2">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#1787D4]" />
            Payment processing
          </span>
          <h1 className="text-2xl font-semibold text-[#031033]">
            Awaiting confirmation
          </h1>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-sm mx-auto tabular-nums">
            {!isExhausted ? (
              `Checking transaction status with Paystack (attempt ${pollCount + 1} of ${maxPolls})…`
            ) : (
              "Paystack has received your payment instruction. Verification is taking longer than usual. Your order is safe, and services will provision automatically once it's confirmed."
            )}
          </p>
        </div>

        <ReferenceLine reference={reference} />

        <div className="px-4 py-3 rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] text-sm text-[#9A5B00] text-left w-full">
          <p className="font-medium mb-0.5">No need to wait here</p>
          <p className="text-xs">
            You can safely leave this page. We&apos;ll email you as soon as Paystack confirms the transaction.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={checkStatusNow}
            disabled={isManualChecking}
            className={`flex-1 ${PRIMARY_BTN}`}
          >
            {isManualChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Check status"
            )}
          </button>
          <Link href="/dashboard/orders" className={`flex-1 ${SECONDARY_BTN}`}>
            My orders
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4 max-w-md mx-auto">
        <XCircle className="w-6 h-6 text-[#DC2626]" />

        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">
            Payment not verified
          </h1>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-xs mx-auto">
            {message}
          </p>
        </div>

        <ReferenceLine reference={reference} />

        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
          <Link href="/dashboard/hosting" className={`flex-1 ${PRIMARY_BTN}`}>
            <ShoppingCart className="w-4 h-4" />
            Try again
          </Link>
          <Link href="/dashboard/orders" className={`flex-1 ${SECONDARY_BTN}`}>
            My orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  const displayCountdown = Math.max(0, countdown);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-6 max-w-md mx-auto">
      {/* Completed buying process checkmark */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
        <Image
          src="/checkmark.svg"
          alt="Payment confirmed"
          width={96}
          height={96}
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          priority
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">
          Payment confirmed
        </h1>
        <p className="text-[#5A6A85] mt-1 text-sm">
          {isVpsOnly
            ? hasVpsRenewal && !hasVpsServer
              ? "Your payment is confirmed and the renewal is being applied. You can manage the server from your VPS dashboard."
              : "Your payment is confirmed and your server is being provisioned automatically. Its IP address will appear on the VPS dashboard shortly."
            : "Your payment is confirmed and your services are being provisioned automatically. No further action is needed."}
        </p>
      </div>

      {/* Items summary */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] text-left">
        <div className="divide-y divide-[#EEF2F7]">
          {data?.items?.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-0.5">
                <ItemTypeIcon type={item.type} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#031033] truncate">
                  <ItemLabel item={item} />
                </p>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  <ItemSubtitle item={item} />
                </p>
              </div>
              <p className="text-sm text-[#031033] tabular-nums text-right shrink-0">
                ₦{item.price.toLocaleString("en-NG")}
              </p>
            </div>
          ))}
        </div>
        {/* Total row */}
        <div className="flex items-baseline justify-between gap-4 px-5 py-3 border-t border-[#E2E8F0]">
          <span className="text-sm font-semibold text-[#031033]">Total</span>
          <span className="text-lg font-semibold text-[#031033] tabular-nums">
            ₦{(data?.amount ?? 0).toLocaleString("en-NG")}
          </span>
        </div>
        {/* Reference */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-[#EEF2F7]">
          <span className="text-xs text-[#5A6A85]">Reference</span>
          <span className="text-xs font-mono text-[#031033] truncate">
            {data?.reference ?? reference}
          </span>
        </div>
      </div>

      {/* Auto-redirect countdown */}
      <div className="flex flex-col items-center gap-3 w-full">
        <p className="text-xs text-[#5A6A85]">
          Redirecting to {isVpsOnly ? "your VPS servers" : "your orders"} in{" "}
          <span className="font-medium text-[#031033] tabular-nums">{displayCountdown}s</span>
          …
        </p>

        <Link href={destination} id="verify-view-orders" className={`w-full h-10 ${PRIMARY_BTN}`}>
          {isVpsOnly ? "Go to VPS servers" : "View my orders"}
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href={isVpsOnly ? "/dashboard/orders" : "/dashboard/hosting"}
          className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          {isVpsOnly ? "View order history" : "Go to hosting dashboard"}
        </Link>
      </div>
    </div>
  );
}

export default function OrderVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#5A6A85]">Loading verification details…</p>
      </div>
    }>
      <OrderVerifyContent />
    </Suspense>
  );
}
