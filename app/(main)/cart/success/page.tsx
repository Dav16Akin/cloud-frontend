"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Globe,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Search,
  Server,
} from "lucide-react";
import { ApiError, verifyPayment, type HostingAccount } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { HostingProvisioningCard } from "@/components/dashboard/HostingProvisioningCard";
import { useGetHosting, getRecentHostingPurchase } from "@/hooks/useHosting";

type VerifyState = "loading" | "pending" | "success" | "failed" | "error";

const MAX_POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 3500;

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

function CartSuccessContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem("domain_order_ref")
      : null) ??
    "";

  const [verifyState, setVerifyState] = useState<VerifyState>("loading");
  const [pollCount, setPollCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [orderData, setOrderData] = useState<{
    items: Array<{
      type: string;
      domainName?: string;
      plan?: { name?: string };
      price: number;
      id: string;
    }>;
    amount: number;
    reference: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  // Shown under the error so support can find the order and the request.
  const [errorRequestId, setErrorRequestId] = useState<string | undefined>();

  const verifyAttempt = async (isManual = false) => {
    if (!reference) {
      setVerifyState("error");
      setErrorMsg("No payment reference found.");
      return;
    }

    if (isManual) {
      setIsManualChecking(true);
    }

    const token = useAuthStore.getState().token;

    try {
      const res = await verifyPayment(token, reference);
      const status = res?.data?.status;

      // Handle successful or idempotent responses
      if (
        status === "PAID" ||
        (status as any) === "ALREADY_VERIFIED" ||
        (status as any) === "COMPLETED"
      ) {
        setOrderData({
          items: res.data.items ?? [],
          amount: res.data.amount ?? 0,
          reference: res.data.reference ?? reference,
        });
        setVerifyState("success");
        useCartStore.getState().clearCart();
        sessionStorage.removeItem("cart_order_ref");
        sessionStorage.removeItem("domain_order_ref");
      } else if (status === "FAILED" || (status as any) === "CANCELLED") {
        setVerifyState("failed");
      } else {
        // Status is PENDING
        setVerifyState("pending");
      }
    } catch (err: any) {
      // Check if error message contains idempotent confirmation
      const msg = (err?.message || "").toLowerCase();
      if (
        msg.includes("already verified") ||
        msg.includes("already processed") ||
        msg.includes("already completed")
      ) {
        setOrderData({
          items: [],
          amount: 0,
          reference,
        });
        setVerifyState("success");
        useCartStore.getState().clearCart();
        sessionStorage.removeItem("cart_order_ref");
        sessionStorage.removeItem("domain_order_ref");
      } else {
        setErrorMsg(err?.message || "Could not verify payment status.");
        setErrorRequestId(err instanceof ApiError ? err.requestId : undefined);
        setVerifyState("error");
      }
    } finally {
      if (isManual) {
        setIsManualChecking(false);
      }
    }
  };

  useEffect(() => {
    if (!reference) {
      setVerifyState("error");
      setErrorMsg("No payment reference found.");
      return;
    }

    // Initial check
    verifyAttempt();
  }, [reference]);

  // Safe polling effect when in pending state
  useEffect(() => {
    if (verifyState !== "pending" && verifyState !== "loading") return;
    if (pollCount >= MAX_POLL_ATTEMPTS) return;

    const timer = setTimeout(() => {
      setPollCount((prev) => prev + 1);
      verifyAttempt();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [verifyState, pollCount]);

  // Ensure cart is cleared as soon as verifyState becomes success
  useEffect(() => {
    if (verifyState === "success") {
      useCartStore.getState().clearCart();
    }
  }, [verifyState]);

  const domainCount =
    orderData?.items?.filter((item) => item.type === "DOMAIN").length ?? 0;

  // Hosting provisioning tracking
  const recentPurchase = typeof window !== "undefined" ? getRecentHostingPurchase() : null;
  const hasHostingItem =
    orderData?.items?.some((item) => item.type === "HOSTING") ||
    !!recentPurchase;

  const hasSslItem =
    orderData?.items?.some((item) => item.type === "SSL");

  const {
    data: hostingData,
    refetch: refetchHosting,
    isRefetching: isRefetchingHosting,
  } = useGetHosting({
    refetchInterval: (query: any) => {
      if (verifyState !== "success" || !hasHostingItem) return false;
      const items = (query.state.data as HostingAccount[] | undefined) ?? [];
      const hasPending = items.some((h) => h.status === "PENDING");
      return hasPending || !!recentPurchase ? 5000 : false;
    },
  });

  const hostingList: HostingAccount[] = hostingData ?? [];
  const pendingHosting = hostingList.find((h) => h.status === "PENDING");
  const matchingActiveHosting = recentPurchase?.domain
    ? hostingList.find((h) => h.domain === recentPurchase.domain && h.status === "ACTIVE")
    : undefined;

  const hostingDomain =
    pendingHosting?.domain ??
    matchingActiveHosting?.domain ??
    recentPurchase?.domain ??
    orderData?.items?.find((i) => i.type === "HOSTING")?.domainName;

  const hostingPlanName =
    pendingHosting?.plan?.name ??
    matchingActiveHosting?.plan?.name ??
    recentPurchase?.planName ??
    orderData?.items?.find((i) => i.type === "HOSTING")?.plan?.name ??
    "Web Hosting";

  const hostingStatus: "PENDING" | "ACTIVE" = matchingActiveHosting
    ? "ACTIVE"
    : pendingHosting
    ? (pendingHosting.status as "PENDING" | "ACTIVE")
    : recentPurchase
    ? "PENDING"
    : "PENDING";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <section className="pt-32 pb-24 bg-[#F2F5FC] flex-1">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Loading */}
          {verifyState === "loading" && (
            <div className="space-y-5">
              <Loader2 className="w-10 h-10 mx-auto text-[#1787D4] animate-spin" />
              <h1 className="text-2xl font-semibold text-[#031033]">
                Verifying payment…
              </h1>
              <p className="text-base text-[#5A6A85]">
                Please wait while we confirm your transaction.
              </p>
            </div>
          )}

          {/* Pending */}
          {verifyState === "pending" && (
            <div className="space-y-6">
              <Loader2 className="w-10 h-10 mx-auto text-[#E8900A] animate-spin" />
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-medium text-[#031033] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#E8900A]" aria-hidden />
                  Payment processing
                </p>
                <h1 className="text-3xl font-semibold text-[#031033] mb-2">
                  Awaiting confirmation
                </h1>
                <p className="text-base text-[#5A6A85] max-w-lg mx-auto leading-relaxed">
                  {pollCount < MAX_POLL_ATTEMPTS ? (
                    `Confirming your order with Paystack (attempt ${pollCount + 1} of ${MAX_POLL_ATTEMPTS})…`
                  ) : (
                    "Paystack has received your payment instruction. Confirmation is taking longer than usual, but your order is safe."
                  )}
                </p>
              </div>

              {reference && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-4 text-left w-full max-w-md mx-auto">
                  <p className="text-sm text-[#5A6A85] mb-1">
                    Payment reference
                  </p>
                  <p className="text-sm font-medium text-[#031033] break-all tabular-nums">
                    {reference}
                  </p>
                </div>
              )}

              <div className="p-5 bg-[#FFF8EE] border border-[#FFC75D]/60 rounded-xl text-sm text-[#031033] text-left max-w-md mx-auto space-y-1">
                <p className="font-medium">What happens next?</p>
                <p className="text-[#5A6A85]">
                  You do not need to keep this page open. Your services will be activated
                  automatically once Paystack confirms the payment, and we will email you a receipt.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => verifyAttempt(true)}
                  disabled={isManualChecking}
                  className={BTN_PRIMARY}
                >
                  {isManualChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking status…
                    </>
                  ) : (
                    "Check status again"
                  )}
                </button>
                <Link href="/dashboard" className={BTN_SECONDARY}>
                  <LayoutDashboard className="w-4 h-4" />
                  Go to dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Success */}
          {verifyState === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
                <Image
                  src="/checkmark.svg"
                  alt="Order Confirmed"
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                  priority
                />
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-[#031033] mb-2">
                  Order confirmed
                </h1>
                <p className="text-base text-[#5A6A85]">
                  {domainCount > 0 ? (
                    `Your domain${domainCount > 1 ? "s are" : " is"} being registered. We'll email you a confirmation shortly.`
                  ) : (
                    "Your order has been confirmed. We'll email you a confirmation shortly."
                  )}
                </p>
              </div>

              {orderData?.reference && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-4 text-left w-full">
                  <p className="text-sm text-[#5A6A85] mb-1">Payment reference</p>
                  <p className="text-sm font-medium text-[#031033] break-all tabular-nums">
                    {orderData.reference}
                  </p>
                </div>
              )}

              {/* Order items */}
              {(orderData?.items?.length ?? 0) > 0 && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] text-left overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[#E2E8F0]">
                    <h2 className="text-sm font-medium text-[#031033]">
                      Order items
                    </h2>
                  </div>
                  <ul className="divide-y divide-[#EEF2F7]">
                    {orderData!.items.map((item) => {
                      const isHosting = item.type === "HOSTING";
                      const isSsl = item.type === "SSL";
                      const label =
                        isHosting
                          ? `${item.plan?.name ?? "Hosting"} plan`
                          : isSsl
                          ? `SSL certificate for ${item.domainName}`
                          : item.domainName;
                      return (
                        <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                          {isHosting ? (
                            <Server className="w-4 h-4 text-[#1787D4] shrink-0" />
                          ) : isSsl ? (
                            <Shield className="w-4 h-4 text-[#12A150] shrink-0" />
                          ) : (
                            <Globe className="w-4 h-4 text-[#1787D4] shrink-0" />
                          )}
                          <span className="text-[#031033] font-medium text-sm min-w-0 break-words">{label}</span>
                          {typeof item.price === "number" && item.price > 0 && (
                            <span className="ml-auto text-sm text-[#031033] tabular-nums text-right shrink-0">
                              {formatNaira(item.price)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {(orderData?.amount ?? 0) > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0]">
                      <span className="text-sm font-medium text-[#031033]">Total paid</span>
                      <span className="text-base font-semibold text-[#031033] tabular-nums text-right">
                        {formatNaira(orderData!.amount)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* SSL activation and DNS validation */}
              {hasSslItem && (
                <div className="bg-[#E8F4FC] border border-[#1787D4]/25 rounded-xl p-5 text-left flex items-start gap-3.5">
                  <Shield className="w-5 h-5 text-[#1787D4] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#031033]">
                      Activate your SSL certificate
                    </h3>
                    <p className="text-sm text-[#5A6A85] mt-1 leading-relaxed">
                      Your SSL certificate order has been sent to the Certificate Authority. To complete issuance, open your SSL dashboard and add the DNS verification records it lists.
                    </p>
                    <div className="mt-3">
                      <Link
                        href="/dashboard/ssl"
                        id="success-view-ssl-dns"
                        className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                      >
                        View DNS records
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Hosting provisioning tracker */}
              {hasHostingItem && (
                <div className="text-left my-2">
                  <HostingProvisioningCard
                    domain={hostingDomain}
                    planName={hostingPlanName}
                    status={hostingStatus}
                    createdAt={pendingHosting?.createdAt}
                    onRefetch={refetchHosting}
                    isRefetching={isRefetchingHosting}
                  />
                </div>
              )}

              {/* What happens next */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] text-left overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2E8F0]">
                  <h2 className="text-sm font-medium text-[#031033]">
                    What happens next
                  </h2>
                </div>
                <ul className="divide-y divide-[#EEF2F7]">
                  {[
                    { icon: CheckCircle, text: "Your payment has been received and confirmed." },
                    hasHostingItem
                      ? { icon: Server, text: "Your hosting account and cPanel are being set up now." }
                      : { icon: Globe, text: "DNS propagation starts now and can take 24–48 hours worldwide." },
                    {
                      icon: Shield,
                      text: hasSslItem
                        ? "SSL certificate requested. Complete DNS validation in your dashboard to activate it."
                        : "Your SSL certificate will be issued and activated automatically.",
                    },
                    { icon: LayoutDashboard, text: "Manage your services any time from your dashboard." },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 px-5 py-3 text-sm text-[#5A6A85]">
                      <Icon className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                {hasHostingItem ? (
                  <Link
                    href="/dashboard/hosting"
                    id="success-go-hosting"
                    className={BTN_PRIMARY}
                  >
                    <Server className="w-4 h-4" />
                    Go to hosting
                  </Link>
                ) : hasSslItem && domainCount === 0 ? (
                  <Link
                    href="/dashboard/ssl"
                    id="success-go-ssl"
                    className={BTN_PRIMARY}
                  >
                    <Shield className="w-4 h-4" />
                    Go to SSL certificates
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/domains"
                    id="success-go-dashboard"
                    className={BTN_PRIMARY}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Go to my domains
                  </Link>
                )}
                {hasSslItem && (domainCount > 0 || hasHostingItem) && (
                  <Link
                    href="/dashboard/ssl"
                    id="success-go-ssl-secondary"
                    className={BTN_SECONDARY}
                  >
                    <Shield className="w-4 h-4 text-[#12A150]" />
                    SSL certificates
                  </Link>
                )}
                {domainCount > 0 && hasHostingItem && (
                  <Link
                    href="/dashboard/domains"
                    id="success-go-domains"
                    className={BTN_SECONDARY}
                  >
                    <Globe className="w-4 h-4" />
                    My domains
                  </Link>
                )}
                <Link
                  href="/domains"
                  id="success-search-more"
                  className={BTN_SECONDARY}
                >
                  <Search className="w-4 h-4" />
                  Search more domains
                </Link>
              </div>
            </div>
          )}

          {/* Failed */}
          {verifyState === "failed" && (
            <div className="space-y-5">
              <AlertCircle className="w-10 h-10 mx-auto text-[#DC2626]" />
              <h1 className="text-2xl font-semibold text-[#031033]">Payment failed</h1>
              <p className="text-base text-[#5A6A85]">
                Your payment could not be processed and you have not been charged. Please try again.
              </p>
              <Link
                href="/cart"
                id="success-try-again"
                className={BTN_PRIMARY}
              >
                Return to cart <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Error */}
          {verifyState === "error" && (
            <div className="space-y-5">
              <AlertCircle className="w-10 h-10 mx-auto text-[#E8900A]" />
              <h1 className="text-2xl font-semibold text-[#031033]">We couldn&apos;t confirm your payment</h1>
              <p className="text-base text-[#5A6A85]">{errorMsg || "Could not verify your payment. Please contact support."}</p>
              {(reference || errorRequestId) && (
                <div className="text-sm text-[#5A6A85] break-all space-y-1">
                  {reference && <p>Payment reference: <span className="text-[#031033] tabular-nums">{reference}</span></p>}
                  {errorRequestId && <p>Request ID: <span className="text-[#031033] tabular-nums">{errorRequestId}</span></p>}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/cart" className={BTN_SECONDARY}>
                  Return to cart
                </Link>
                <Link
                  href="/contact"
                  id="success-contact-support"
                  className={BTN_PRIMARY}
                >
                  Contact support
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CartSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F2F5FC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
      </div>
    }>
      <CartSuccessContent />
    </Suspense>
  );
}
