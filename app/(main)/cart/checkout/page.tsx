"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Globe,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  User,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { initializeCartPayment } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { toast } from "sonner";

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { items, grandTotal } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Redirect guests to login
  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace("/login?redirect=/cart/checkout");
    }
  }, [_hasHydrated, token, router]);

  // Redirect to cart if empty (and not currently redirecting to payment gateway)
  useEffect(() => {
    if (_hasHydrated && !isProcessing && items.length === 0) {
      router.replace("/cart");
    }
  }, [_hasHydrated, isProcessing, items.length, router]);

  // Fetch user profile for billing pre-fill
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
  });

  const user = meData?.data ?? meData?.user ?? null;

  const handlePay = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setError("");

    try {
      // Map cart items to backend CartItem format
      const backendItems = items.map((item) => {
        if (item.type === "HOSTING") return { type: "HOSTING" as const, planId: item.planId };
        if (item.type === "DOMAIN")
          return { type: "DOMAIN" as const, domainName: item.domainName, extension: item.extension };
        if (item.type === "DOMAIN_TRANSFER")
          return {
            type: "DOMAIN_TRANSFER" as const,
            domainName: item.domainName,
            extension: item.extension,
            authCode: item.authCode,
          };
        return { type: "SSL" as const, domainName: item.domainName, productId: item.productId };
      });

      const res = await initializeCartPayment({ items: backendItems });

      if (res?.data?.paymentUrl) {
        sessionStorage.setItem("cart_order_ref", res.data.reference);
        window.location.href = res.data.paymentUrl;
        // Keep isProcessing as true while the browser navigates to Paystack
      } else {
        throw new Error("No payment URL returned from server.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment initialisation failed.";
      setError(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  // Show nothing while hydrating (avoids flash)
  if (!_hasHydrated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center section-navy-tint">
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
      <section className="relative pt-28 pb-10 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#9ba8c0] mb-5">
            <Link href="/domains" className="hover:text-[#5a6a85] transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/cart" className="hover:text-[#5a6a85] transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#031033] font-medium">Checkout</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-[#031033]">
            Secure <span className="gradient-text">Checkout</span>
          </h1>
          <p className="text-[#5a6a85] text-sm mt-1">
            Review your order and complete your purchase securely.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section-pad flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Account info */}
              <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2eaff] bg-[#f8faff]">
                  <div className="w-6 h-6 rounded-full bg-[#1787D4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1787D4]" />
                    <h2 className="font-bold text-[#031033] text-sm">Account Information</h2>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="px-6 py-5">
                  {user ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-[#9ba8c0] mb-1 uppercase tracking-wide font-semibold">Name</p>
                        <p className="text-[#031033] font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9ba8c0] mb-1 uppercase tracking-wide font-semibold">Email</p>
                        <p className="text-[#031033] font-medium">{user.email}</p>
                      </div>
                      {user.companyName && (
                        <div>
                          <p className="text-xs text-[#9ba8c0] mb-1 uppercase tracking-wide font-semibold">Company</p>
                          <p className="text-[#031033] font-medium">{user.companyName}</p>
                        </div>
                      )}
                      {user.phoneNumber && (
                        <div>
                          <p className="text-xs text-[#9ba8c0] mb-1 uppercase tracking-wide font-semibold">Phone</p>
                          <p className="text-[#031033] font-medium">{user.phoneNumber}</p>
                        </div>
                      )}
                      {user.country && (
                        <div>
                          <p className="text-xs text-[#9ba8c0] mb-1 uppercase tracking-wide font-semibold">Country</p>
                          <p className="text-[#031033] font-medium">{user.country}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[#5a6a85]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
                      Loading account details...
                    </div>
                  )}
                  <Link
                    href="/dashboard/settings"
                    id="checkout-edit-profile"
                    className="mt-4 inline-block text-xs font-semibold text-[#1787D4] hover:underline underline-offset-4"
                  >
                    Edit billing info →
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2eaff] bg-[#f8faff]">
                  <div className="w-6 h-6 rounded-full bg-[#1787D4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#1787D4]" />
                    <h2 className="font-bold text-[#031033] text-sm">Order Items</h2>
                  </div>
                </div>
                <div className="divide-y divide-[#f0f4fc]">
                  {items.map((item) => {
                    const label =
                      item.type === "HOSTING"
                        ? `${item.planName} Hosting`
                        : item.type === "DOMAIN"
                        ? `${item.domainName}.${item.extension}`
                        : item.type === "DOMAIN_TRANSFER"
                        ? `${item.domainName}.${item.extension} (Transfer)`
                        : `SSL — ${item.domainName}`;
                    const Icon = item.type === "DOMAIN_TRANSFER" ? ArrowRightLeft : Globe;
                    return (
                      <div key={label} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#e8f4fc] border border-[#d4e9f7] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#1787D4]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#031033] text-sm truncate">{label}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-[#031033] text-sm shrink-0">
                            ₦{item.price.toLocaleString("en-NG")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2eaff] bg-[#f8faff]">
                  <div className="w-6 h-6 rounded-full bg-[#1787D4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1787D4]" />
                    <h2 className="font-bold text-[#031033] text-sm">Payment Method</h2>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="border-2 border-[#1787D4] bg-[#f0f7ff] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1787D4] flex items-center justify-center shrink-0 shadow-xs">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#031033] text-sm">Pay with Paystack</p>
                      <p className="text-xs text-[#5a6a85] mt-0.5">
                        Cards, bank transfer, USSD, and mobile money accepted.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-4 h-4 rounded-full border-2 border-[#1787D4] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#1787D4]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-[#9ba8c0]">
                    <Lock className="w-3 h-3 shrink-0 text-[#1787D4]" />
                    <span>Your payment is encrypted and secure. We never store your card details.</span>
                  </div>
                </div>
              </div>

              {/* Error state */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Right: total + CTA */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e2eaff] bg-[#f8faff]">
                  <p className="font-bold text-[#031033] text-sm">Order Total</p>
                </div>
                <div className="px-6 py-5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5a6a85]">Items ({items.length})</span>
                    <span className="text-[#031033] font-medium">₦{grandTotal().toLocaleString("en-NG")}</span>
                  </div>
                  <div className="border-t border-[#e2eaff] pt-3 flex justify-between items-center">
                    <span className="font-bold text-[#031033]">Total</span>
                    <span className="font-extrabold text-2xl text-[#031033]">
                      ₦{grandTotal().toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    id="checkout-pay-btn"
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="btn-primary w-full py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting to Paystack...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay ₦{grandTotal().toLocaleString("en-NG")}
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-[#9ba8c0] mt-3">
                    By paying, you agree to our{" "}
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                    {" "}&amp;{" "}
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </div>

              {/* Trust */}
              <div className="bg-[#f8faff] border border-[#e2eaff] rounded-2xl px-5 py-4 space-y-3 shadow-2xs">
                {[
                  { icon: Shield, text: "256-bit SSL encryption" },
                  { icon: Lock, text: "PCI-DSS compliant payment" },
                  { icon: CheckCircle, text: "Instant domain activation" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-[#5a6a85]">
                    <Icon className="w-3.5 h-3.5 text-[#1787D4] shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
