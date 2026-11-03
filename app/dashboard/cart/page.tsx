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

/** Real term in years for a cart item, if the item carries one (never assumed). */
function itemYears(item: CartItem): number | null {
  const raw = item as { period?: unknown; years?: unknown };
  const n = Number(raw.period ?? raw.years);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function DashboardCartContent() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  const { items, removeItem, clearCart, grandTotal, addSslItem } = useCartStore();

  // SSL pricing for quick add
  // Quick-add is only offered once the real PositiveSSL product (and its
  // price) has loaded from the API — no assumed product ID or price.
  const { data: sslProducts } = useGetSslProducts();
  const quickSsl = (() => {
    const list = Array.isArray(sslProducts) ? sslProducts : [];
    const prod =
      list.find((p) => p.id === 41) ??
      list.find((p) => /positive\s*ssl/i.test(p.name || ""));
    if (!prod) return null;
    const yearly = prod.prices?.find?.((p) => p.period === 1)?.price;
    const price = yearly ?? prod.price;
    if (typeof price !== "number" || !(price > 0)) return null;
    return {
      id: prod.id,
      name: prod.name || "SSL certificate",
      price,
      period: typeof yearly === "number" ? 1 : undefined,
    };
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
        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#5A6A85]">Loading your cart…</p>
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>
      </div>

      {/* ── Page Title & Subtitle ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">Your cart</h1>
          <p className="text-sm text-[#5A6A85] mt-1">
            Review the domains, SSL certificates, and cloud services in your cart.
          </p>
        </div>

        {items.length > 0 && (
          <span className="self-start sm:self-center text-sm tabular-nums whitespace-nowrap text-[#5A6A85] shrink-0">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* ── Main Two-Column Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Cart Items + Recommendations */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Cart Items Card */}
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F7]">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Cart items <span className="text-[#5A6A85] font-normal tabular-nums">({items.length})</span>
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Services ready for setup and provisioning
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="h-8 px-3 rounded-lg text-sm font-medium text-[#C21F1F] hover:bg-[#FDECEC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
                <h4 className="text-base font-semibold text-[#031033]">
                  Your cart is empty
                </h4>
                <p className="text-sm text-[#5A6A85] mt-1 max-w-sm">
                  Add a domain registration, an SSL certificate, or a hosting plan to start an order.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/dashboard/domains"
                    className="inline-flex h-9 items-center px-4 rounded-lg font-medium text-white text-sm bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Search domains
                  </Link>
                  <Link
                    href="/dashboard/hosting"
                    className="inline-flex h-9 items-center px-4 rounded-lg font-medium text-[#031033] text-sm border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Browse hosting
                  </Link>
                  <Link
                    href="/dashboard/ssl"
                    className="inline-flex h-9 items-center px-4 rounded-lg font-medium text-[#031033] text-sm border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    SSL certificates
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#EEF2F7]">
                {items.map((item) => {
                  const key = getCartItemKey(item);

                  let Icon = Globe;
                  let itemBadge = "Domain registration";
                  let title = "";
                  let subtitle = "";

                  if (item.type === "DOMAIN") {
                    Icon = Globe;
                    itemBadge = "Domain";
                    title = `${item.domainName}.${item.extension}`;
                    const years = itemYears(item);
                    subtitle = `${years ? `${years}-year domain registration` : "Domain registration"} · Privacy protection included`;
                  } else if (item.type === "SSL") {
                    Icon = Shield;
                    itemBadge = "SSL certificate";
                    title = item.productName || "SSL certificate";
                    const years = itemYears(item);
                    subtitle = `For ${item.domainName} · ${years ? `${years}-year ` : ""}HTTPS encryption`;
                  } else if (item.type === "HOSTING") {
                    Icon = Server;
                    itemBadge = "Web hosting";
                    title = `${item.planName} Hosting Plan`;
                    subtitle = `Billed ${item.billingCycle || "yearly"} · NVMe cloud storage`;
                  } else if (item.type === "DOMAIN_TRANSFER") {
                    Icon = ArrowRightLeft;
                    itemBadge = "Transfer";
                    title = `${item.domainName}.${item.extension}`;
                    const years = itemYears(item);
                    subtitle = years
                      ? `Domain transfer with ${years}-year renewal extension`
                      : "Domain transfer";
                  }

                  return (
                    <div
                      key={key}
                      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#031033] truncate">
                              {title}
                            </span>
                            <span className="text-xs text-[#5A6A85] whitespace-nowrap">
                              {itemBadge}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A6A85] mt-1">
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-7 sm:pl-0">
                        <span className="text-sm font-semibold text-[#031033] tabular-nums text-right">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          className="p-2 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
          {domainsWithoutSsl.length > 0 && quickSsl && (
            <div className="w-full bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#031033]">
                      Add SSL protection for your domain
                    </h4>
                    <p className="text-xs text-[#5A6A85] mt-1">
                      Secure visitor traffic with a {quickSsl.name} certificate (<span className="tabular-nums">₦{quickSsl.price.toLocaleString()}</span>{quickSsl.period === 1 ? "/yr" : ""}).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2 pl-7 sm:pl-0">
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
                            price: quickSsl.price,
                            productId: quickSsl.id,
                            ...(quickSsl.period ? { period: quickSsl.period } : {}),
                            productName: quickSsl.name,
                          });
                          toast.success(`${quickSsl.name} added for ${full}`);
                        }}
                        className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-[#1787D4] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#EEF2F7]">
            <div className="px-5 py-4 flex items-start gap-3">
              <Check className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#031033]">Instant setup</p>
                <p className="text-xs text-[#5A6A85] mt-0.5">Activated right after payment</p>
              </div>
            </div>

            <div className="px-5 py-4 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#031033]">256-bit encryption</p>
                <p className="text-xs text-[#5A6A85] mt-0.5">Secure payment processing</p>
              </div>
            </div>

            <div className="px-5 py-4 flex items-start gap-3">
              <span className="h-4 w-12 shrink-0 mt-0.5 flex items-center">
                <Image
                  src="/paystack-logo.png"
                  alt="Paystack"
                  width={60}
                  height={16}
                  className="h-3.5 w-auto object-contain"
                />
              </span>
              <div>
                <p className="text-sm font-medium text-[#031033]">Paystack verified</p>
                <p className="text-xs text-[#5A6A85] mt-0.5">Direct gateway checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary & Checkout Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h4 className="text-base font-semibold text-[#031033]">Order summary</h4>
            </div>

            <div className="p-5">
              {items.length === 0 ? (
                <p className="text-sm text-[#5A6A85]">No items in your cart</p>
              ) : (
                <dl className="flex flex-col text-sm">
                  {items.map((item) => (
                    <div
                      key={getCartItemKey(item)}
                      className="flex justify-between items-start gap-4 py-1.5 first:pt-0"
                    >
                      <dt className="text-[#5A6A85] truncate">{cartItemLabel(item)}</dt>
                      <dd className="text-[#031033] tabular-nums text-right shrink-0">
                        ₦{item.price.toLocaleString()}
                      </dd>
                    </div>
                  ))}

                  <div className="flex justify-between items-center gap-4 pt-3 mt-1.5 border-t border-[#EEF2F7]">
                    <dt className="text-[#5A6A85]">Subtotal</dt>
                    <dd className="text-[#031033] tabular-nums text-right">
                      ₦{totalAmount.toLocaleString()}
                    </dd>
                  </div>

                  {/* Tax commented out as requested */}
                  {/* <div className="flex justify-between items-center">
                    <span>Tax (7.5%)</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div> */}

                  <div className="flex justify-between items-baseline gap-4 pt-3 mt-3 border-t border-[#E2E8F0]">
                    <dt className="font-semibold text-[#031033]">Total</dt>
                    <dd className="text-lg font-semibold text-[#031033] tabular-nums text-right">
                      ₦{totalAmount.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              )}

              {/* Primary Action: Proceed to Checkout */}
              <div className="mt-5">
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => router.push("/dashboard/checkout")}
                  className="w-full h-10 rounded-lg font-medium text-white text-sm bg-[#1787D4] hover:bg-[#1370B5] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Proceed to checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center text-xs text-[#5A6A85] mt-3">
                You will confirm registrant and billing details before completing payment.
              </p>
            </div>
          </div>

          {/* Reserved notice */}
          <div className="rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033] flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#1787D4]" />
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
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DashboardCartContent />
    </Suspense>
  );
}
