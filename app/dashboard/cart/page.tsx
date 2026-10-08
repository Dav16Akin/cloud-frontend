"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Shield,
  Server,
  ArrowRightLeft,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Check,
  Loader2,
  Plus,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useCartStore, getCartItemKey, cartItemLabel, type CartItem } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useGetSslProducts } from "@/hooks/useSsl";
import { toast } from "sonner";

function DashboardCartContent() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  const { items, removeItem, clearCart, grandTotal, addSslItem } = useCartStore();

  // SSL pricing for quick add
  const { data: sslProducts } = useGetSslProducts();
  const positiveSslPrice = (() => {
    const prod = sslProducts?.find?.((p: { id: number }) => p.id === 41);
    return (
      prod?.prices?.find?.((p: { period: number }) => p.period === 1)?.price ??
      prod?.price ??
      15000
    );
  })();

  // Require authentication — users can only enter the cart if they are logged in
  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace("/login?redirect=/dashboard/cart");
    }
  }, [_hasHydrated, token, router]);

  if (!_hasHydrated || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        <p className="text-[13px] text-[#6e6e73]">Loading your cart…</p>
      </div>
    );
  }

  const totalAmount = grandTotal();

  // Domains in cart that don't have SSL yet
  const domainsWithoutSsl = items
    .filter((i) => i.type === "DOMAIN")
    .filter((d) => {
      const fullName = `${d.domainName}.${d.extension}`;
      return !items.some((i) => i.type === "SSL" && i.domainName === fullName);
    });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Navigation Link ───────────────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>
      </div>

      {/* ── Page Title & Subtitle ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-[24px] sm:text-[26px] font-bold text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            Your Cart
          </h1>
          <p className="text-[14px] text-[#6e6e73] mt-1">
            Review and manage your stacked domains, SSL certificates, and cloud services.
          </p>
        </div>

        {items.length > 0 && (
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#e6f4fc] text-[#1787D4] shrink-0">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* ── Main Two-Column Layout (Wizard Design System) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Cart Items + Recommendations */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Cart Items Card */}
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f3]">
              <div>
                <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                  Cart items ({items.length})
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                  Services ready for setup and provisioning
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[12.5px] font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3.5">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <h4 className="text-[16px] font-bold text-[#1d1d1f]">
                  Your cart is currently empty
                </h4>
                <p className="text-[13px] text-[#6e6e73] mt-1 max-w-sm">
                  Add domain registrations, PositiveSSL certificates, or hosting packages to process your order.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/dashboard/domains"
                    className="px-5 py-2.5 rounded-lg font-semibold text-white text-[13px] bg-[#1787D4] hover:bg-[#1578bd] transition-colors"
                  >
                    Search Domains
                  </Link>
                  <Link
                    href="/dashboard/hosting"
                    className="px-5 py-2.5 rounded-lg font-semibold text-[#1d1d1f] text-[13px] bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Browse Hosting
                  </Link>
                  <Link
                    href="/dashboard/ssl"
                    className="px-5 py-2.5 rounded-lg font-semibold text-[#1d1d1f] text-[13px] bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    SSL Certificates
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f3]">
                {items.map((item) => {
                  const key = getCartItemKey(item);

                  let Icon = Globe;
                  let iconBg = "bg-emerald-50 text-emerald-600";
                  let itemBadge = "Domain Registration";
                  let title = "";
                  let subtitle = "";

                  if (item.type === "DOMAIN") {
                    Icon = Globe;
                    iconBg = "bg-emerald-50 text-emerald-600";
                    itemBadge = "Domain";
                    title = `${item.domainName}.${item.extension}`;
                    subtitle = "1-year domain registration • Privacy protection included";
                  } else if (item.type === "SSL") {
                    Icon = Shield;
                    iconBg = "bg-blue-50 text-[#1787D4]";
                    itemBadge = "SSL Certificate";
                    title = item.productName || "PositiveSSL Certificate";
                    subtitle = `For ${item.domainName} • 1-year HTTPS encryption`;
                  } else if (item.type === "HOSTING") {
                    Icon = Server;
                    iconBg = "bg-indigo-50 text-indigo-600";
                    itemBadge = "Web Hosting";
                    title = `${item.planName} Hosting Plan`;
                    subtitle = `Billed ${item.billingCycle || "yearly"} • High-speed NVMe cloud`;
                  } else if (item.type === "DOMAIN_TRANSFER") {
                    Icon = ArrowRightLeft;
                    iconBg = "bg-amber-50 text-amber-600";
                    itemBadge = "Transfer";
                    title = `${item.domainName}.${item.extension}`;
                    subtitle = `Domain transfer with 1-year renewal extension`;
                  }

                  return (
                    <div
                      key={key}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-bold text-[#1d1d1f] truncate">
                              {title}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-[#4b5563] border border-slate-200">
                              {itemBadge}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-14 sm:pl-0">
                        <span className="text-[16px] font-bold text-[#1d1d1f]">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          className="p-2 rounded-lg text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label={`Remove ${title}`}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complementary Services / Quick-Add Card (when domains are in cart) */}
          {domainsWithoutSsl.length > 0 && (
            <div className="w-full bg-[#f8fbfe] rounded-lg border border-[#d6eaf8] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-blue-100 text-[#1787D4] flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-[14.5px] font-bold text-[#1d1d1f]">
                      Add SSL Protection for your domain
                    </h4>
                    <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                      Secure visitor traffic with a 256-bit PositiveSSL Certificate (₦{positiveSslPrice.toLocaleString()}/yr).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  {domainsWithoutSsl.slice(0, 2).map((d) => {
                    const full = `${d.domainName}.${d.extension}`;
                    return (
                      <button
                        key={full}
                        type="button"
                        onClick={() => {
                          addSslItem({
                            type: "SSL",
                            domainName: full,
                            price: positiveSslPrice,
                            productId: 41,
                            period: 1,
                            productName: "PositiveSSL Certificate",
                          });
                          toast.success(`PositiveSSL added for ${full}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#1787D4] bg-white border border-[#bce0f8] hover:bg-[#1787D4] hover:text-white transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add for {full}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-white border border-[#e8e8ed] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-[#1d1d1f]">
                  Instant Setup
                </p>
                <p className="text-[11.5px] text-[#6e6e73]">
                  Immediate service activation
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-[#e8e8ed] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-[#1d1d1f]">
                  256-Bit Encryption
                </p>
                <p className="text-[11.5px] text-[#6e6e73]">
                  Certified secure processing
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-[#e8e8ed] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-[#4b5563] flex items-center justify-center shrink-0">
                <Image
                  src="/paystack-logo.png"
                  alt="Paystack"
                  width={60}
                  height={16}
                  className="h-3.5 w-auto object-contain"
                />
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-[#1d1d1f]">
                  Paystack Verified
                </p>
                <p className="text-[11.5px] text-[#6e6e73]">
                  Direct gateway checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary & Checkout Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <h4 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
              Order summary
            </h4>

            {items.length === 0 ? (
              <p className="text-[13px] text-[#8a9bb2] py-2">
                No items in your cart
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                {items.map((item) => (
                  <div
                    key={getCartItemKey(item)}
                    className="flex justify-between items-start"
                  >
                    <span className="font-medium text-[#1d1d1f] truncate pr-2">
                      {cartItemLabel(item)}
                    </span>
                    <span className="font-semibold text-[#1d1d1f] shrink-0">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Tax commented out as requested */}
                {/* <div className="flex justify-between items-center">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div> */}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[16px] font-bold text-[#1d1d1f]">
                  <span>Total</span>
                  <span className="text-[#1787D4]">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Primary Action: Proceed to Checkout */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => router.push("/dashboard/checkout")}
                className="w-full py-3 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-[11.5px] text-[#8a9bb2] mt-3.5 leading-relaxed">
              You will confirm registrant and billing details before completing payment.
            </p>
          </div>

          {/* Reserved Banner */}
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-3.5 text-[#0369a1] text-[12px] flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 shrink-0 text-[#0284c7]" />
            <span>
              Your domain names stay reserved for 15 minutes while you complete setup.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DashboardCartContent />
    </Suspense>
  );
}
