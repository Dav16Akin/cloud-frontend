"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
  Server,
  Globe,
  Shield,
  Clock,
} from "lucide-react";
import { useVerifyPayment } from "@/hooks/useOrders";
import {
  useGetHosting,
  getRecentHostingPurchase,
  clearRecentHostingPurchase,
} from "@/hooks/useHosting";
import HostingProvisioningCard from "@/components/dashboard/HostingProvisioningCard";
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

function HostingVerifyContent() {
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

  const recent = getRecentHostingPurchase();
  const hostingItem = data?.items?.find((i) => i.type === "HOSTING");
  const targetDomain =
    hostingItem?.domainName ||
    (hostingItem as any)?.domain ||
    recent?.domain ||
    "yourdomain.com";
  const targetPlanName =
    hostingItem?.plan?.name || recent?.planName || "Cloud Hosting Plan";

  const {
    data: accounts,
    refetch: refetchHosting,
    isFetching: fetchingHosting,
  } = useGetHosting({
    refetchInterval: isPaid ? 5000 : false,
  });

  const matchedAccount = accounts?.find(
    (a) => a.domain?.toLowerCase() === targetDomain.toLowerCase()
  );
  const isProvisioned =
    matchedAccount &&
    (matchedAccount.status || "").toUpperCase() === "ACTIVE";

  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (!isProvisioned) return;

    clearRecentHostingPurchase();

    const timer = setTimeout(() => {
      router.replace(
        matchedAccount?.id
          ? `/dashboard/hosting/${matchedAccount.id}`
          : "/dashboard/hosting"
      );
    }, 8000);

    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isProvisioned, router, matchedAccount]);

  // ── No reference ─────────────────────────────────────────────────────────────
  if (!reference) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-[1.05rem] font-semibold text-[#031033]">
          No payment reference found
        </h2>
        <p className="text-sm text-[#5a6a85] max-w-xs">
          This page requires a payment reference from Paystack. Please return to the hosting page.
        </p>
        <Link
          href="/dashboard/hosting"
          className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2"
        >
          <Server className="w-4 h-4" />
          Go to Hosting
        </Link>
      </div>
    );
  }

  // ── Initial Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
        <div className="w-16 h-16 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
        </div>
        <div>
          <h2 className="text-[1.05rem] font-semibold text-[#031033]">
            Verifying your hosting payment…
          </h2>
          <p className="text-sm text-[#5a6a85] mt-1.5 max-w-xs">
            Please wait while we confirm your payment with Paystack and initialize account provisioning.
          </p>
        </div>
        <p className="text-xs font-mono text-[#9ba8c0] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5">
          ref: {reference}
        </p>
      </div>
    );
  }

  // ── Pending / Processing State ───────────────────────────────────────────────
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
          <h2 className="text-[1.05rem] font-semibold text-[#031033]">
            Confirming Hosting Order
          </h2>
          <p className="text-sm text-[#5a6a85] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {!isExhausted ? (
              `Checking transaction status with Paystack (attempt ${pollCount + 1} of ${maxPolls})…`
            ) : (
              "Paystack has received your payment instruction. Confirmation is taking slightly longer than usual. Your hosting account will be provisioned automatically once confirmed."
            )}
          </p>
        </div>

        <p className="text-xs font-mono text-[#9ba8c0] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5">
          ref: {reference}
        </p>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-800 text-left w-full">
          <p className="font-semibold mb-0.5">Automated provisioning</p>
          <p>
            You can safely close this page. You will receive an email with your cPanel details once setup completes.
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
            href="/dashboard/hosting"
            className="flex-1 text-sm py-2.5 font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors flex items-center justify-center gap-2"
          >
            My Hosting
          </Link>
        </div>
      </div>
    );
  }

  // ── Error / Failed ───────────────────────────────────────────────────────────
  if (isFailed || (isError && !isPaid)) {
    const message =
      isError && error instanceof Error
        ? error.message
        : "Payment verification failed. The transaction may not have completed.";

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5 max-w-md mx-auto animate-fade-up">
        <div className="w-16 h-16 bg-red-50 border border-red-200 flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>

        <div>
          <h2 className="text-[1.05rem] font-semibold text-[#031033]">
            Payment not verified
          </h2>
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
            <Server className="w-4 h-4" />
            Back to Hosting
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

  // ── Success ──────────────────────────────────────────────────────────────────
  const displayCountdown = Math.max(0, countdown);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6">
      {/* Hosting Provisioning Card */}
      <HostingProvisioningCard
        domain={targetDomain}
        planName={targetPlanName}
        status={isProvisioned ? "ACTIVE" : "PENDING"}
        isReady={isProvisioned}
        hostingId={matchedAccount?.id}
        cpanelUsername={matchedAccount?.cpanelUsername}
        serverIp={matchedAccount?.serverIp}
        onRefresh={() => refetchHosting()}
        isRefreshing={fetchingHosting}
      />

      {/* Summary box */}
      <div className="w-full bg-white rounded-2xl border border-[#e2eaff] overflow-hidden text-left shadow-xs">
        <div className="px-5 py-3 border-b border-[#f0f4fc] bg-[#fbfcfe]">
          <p className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wide">
            Payment & Order Summary
          </p>
        </div>

        {data?.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f4fc] last:border-b-0"
          >
            <ItemTypeIcon type={item.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#031033]">
                <ItemLabel item={item} />
              </p>
              <p className="text-xs text-[#9ba8c0]">
                {item.domainName ? item.domainName : "Web Hosting"}
              </p>
            </div>
            <p className="text-sm font-bold text-[#031033] shrink-0">
              ₦{item.price.toLocaleString("en-NG")}
            </p>
          </div>
        ))}

        <div className="flex items-center justify-between px-5 py-3 bg-[#f8faff] border-t border-[#f0f4fc]">
          <span className="text-xs font-bold text-[#9ba8c0] uppercase tracking-wide">
            Total Paid
          </span>
          <span className="text-base font-extrabold text-[#031033]">
            ₦{(data?.amount ?? 0).toLocaleString("en-NG")}
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#f0f4fc]">
          <span className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
            Paystack Reference
          </span>
          <span className="text-xs font-mono text-[#5a6a85]">
            {data?.reference ?? reference}
          </span>
        </div>
      </div>

      {/* Actions & Redirect info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e2eaff] shadow-xs">
        <div>
          {isProvisioned ? (
            <p className="text-xs text-emerald-700 font-semibold">
              ✓ Server setup complete. Redirecting to control panel in{" "}
              <span className="font-bold">{displayCountdown}s</span>…
            </p>
          ) : (
            <p className="text-xs text-[#5a6a85]">
              You can safely navigate away. cPanel credentials will also be sent to your email.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href={
              matchedAccount?.id
                ? `/dashboard/hosting/${matchedAccount.id}`
                : "/dashboard/hosting"
            }
            id="hosting-verify-done-cta"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#1787D4] hover:bg-[#1370B5] active:scale-95 transition-all shadow-xs"
          >
            <span>{isProvisioned ? "Open Control Panel" : "Go to Hosting"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/orders"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#5a6a85] hover:text-[#031033] bg-[#f8faff] hover:bg-[#eff4fb] border border-[#e2eaff] transition-all"
          >
            Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HostingVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
          <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
          <p className="text-sm text-[#5a6a85]">Loading verification details...</p>
        </div>
      }
    >
      <HostingVerifyContent />
    </Suspense>
  );
}
