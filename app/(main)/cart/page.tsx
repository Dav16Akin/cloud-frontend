"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Shield,
  ArrowRight,
  Globe,
  Server,
  Package,
  AlertCircle,
  ArrowRightLeft,
  X,
  CheckCircle,
} from "lucide-react";
import { useCartStore, cartItemLabel, getCartItemKey, type CartItem } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useGetSslProducts } from "@/hooks/useSsl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function ItemTypeIcon({ item }: { item: CartItem }) {
  if (item.type === "HOSTING")
    return (
      <div className="w-10 h-10 rounded-xl bg-[#e8f4fc] border border-[#d4e9f7] flex items-center justify-center shrink-0">
        <Server className="w-5 h-5 text-[#1787D4]" />
      </div>
    );
  if (item.type === "DOMAIN")
    return (
      <div className="w-10 h-10 rounded-xl bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
        <Globe className="w-5 h-5 text-[#031033]" />
      </div>
    );
  if (item.type === "DOMAIN_TRANSFER")
    return (
      <div className="w-10 h-10 rounded-xl bg-[#fff8ee] border border-[#fde8c0] flex items-center justify-center shrink-0">
        <ArrowRightLeft className="w-5 h-5 text-[#fd9f09]" />
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
      <Shield className="w-5 h-5 text-emerald-500" />
    </div>
  );
}

function itemTypeLabel(item: CartItem) {
  if (item.type === "HOSTING") {
    const cycle = item.billingCycle ? item.billingCycle.charAt(0).toUpperCase() + item.billingCycle.slice(1) : "Yearly";
    return `Hosting Plan (${cycle})`;
  }
  if (item.type === "DOMAIN") return "Domain Registration";
  if (item.type === "DOMAIN_TRANSFER") return "Domain Transfer";
  if (item.type === "SSL") {
    const periodLabel = item.period ? ` (${item.period} ${item.period === 1 ? "Year" : "Years"})` : "";
    const nameLabel = item.productName ? `${item.productName} • ` : "";
    return `${nameLabel}SSL Certificate${periodLabel}`;
  }
  return "SSL Certificate";
}

export default function CartPage() {
  const { items, addSslItem, removeItem, clearCart, grandTotal } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  // Fetch real SSL product pricing — Positive SSL (id:41)
  const { data: sslProducts } = useGetSslProducts();
  const positiveSslPrice = (() => {
    const prod = sslProducts?.find?.((p: { id: number }) => p.id === 41);
    return prod?.prices?.find?.((p: { period: number }) => p.period === 1)?.price ?? prod?.price ?? 15000;
  })();

  // Cheapest DV SSL options to show on the cart
  const cheapSslOptions: Array<{ id: number; name: string; price: number }> = useMemo(() => {
    const source = sslProducts && Array.isArray(sslProducts) && sslProducts.length > 0
      ? sslProducts
      : [];
    const dv = source
      .filter((p: any) => !p.category || p.category === "domain_validation" || p.category === "dv")
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.prices?.find?.((pr: any) => pr.period === 1)?.price ?? p.price ?? 15000,
      }))
      .sort((a: any, b: any) => a.price - b.price)
      .slice(0, 3);

    return dv.length > 0 ? dv : [{ id: 41, name: "Positive SSL", price: positiveSslPrice }];
  }, [sslProducts, positiveSslPrice]);

  const [staleWarning, setStaleWarning] = useState<string | null>(null);

  // Auto-purge stale/malformed items from a previous session on first render.
  // These would cause "Invalid cart" on the backend due to undefined required fields.
  useEffect(() => {
    const removed: string[] = [];
    for (const item of items) {
      let isInvalid = false;
      let label = "Unknown item";
      if (item.type === "HOSTING" && !item.planId) {
        isInvalid = true; label = "a Hosting item";
      } else if (item.type === "DOMAIN" && (!item.domainName || !item.extension)) {
        isInvalid = true; label = item.domainName ? `"${item.domainName}" (missing extension)` : "a Domain item";
      } else if (item.type === "DOMAIN_TRANSFER" && (!item.domainName || !item.extension || !item.authCode)) {
        isInvalid = true;
        label = item.domainName ? `"${item.domainName}" transfer` : "a Domain Transfer item";
      } else if (item.type === "SSL" && !item.domainName) {
        isInvalid = true;
        label = "an SSL item";
      }
      if (isInvalid) {
        // Use getCartItemKey to build the key, same as removeItem expects
        const key =
          item.type === "HOSTING" ? `hosting:${item.planId ?? ""}:${(item as any).billingCycle ?? ""}` :
          item.type === "DOMAIN" ? `domain:${item.domainName ?? ""}.${item.extension ?? ""}` :
          item.type === "DOMAIN_TRANSFER" ? `domain-transfer:${item.domainName ?? ""}.${item.extension ?? ""}` :
          `ssl:${item.domainName ?? ""}`;
        removeItem(key);
        removed.push(label);
      }
    }
    if (removed.length > 0) {
      setStaleWarning(
        `${removed.length === 1 ? `${removed[0]} was` : `${removed.length} items were`} removed from your cart because ${removed.length === 1 ? "it was" : "they were"} no longer valid. Please re-add from the relevant page.`
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = () => {
    if (!token) {
      router.push("/login?redirect=/cart/checkout");
    } else {
      router.push("/cart/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col bg-white min-h-[70vh]">
        <section className="relative pt-32 pb-24 overflow-hidden section-navy-tint">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <div className="w-20 h-20 mx-auto bg-white border border-[#e2eaff] flex items-center justify-center mb-6 shadow-sm">
              <ShoppingCart className="w-9 h-9 text-[#9ba8c0]" />
            </div>
            <h1 className="type-h1 text-[#031033] mb-3">
              Your Cart is <span className="gradient-text">Empty</span>
            </h1>
            <p className="text-[#5a6a85] mb-8 text-base">
              Add a hosting plan or search for a domain to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/hosting"
                id="cart-empty-hosting"
                className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 text-base"
              >
                <Server className="w-4 h-4" />
                Browse Hosting
              </Link>
              <Link
                href="/domains"
                id="cart-empty-domains"
                className="btn-outline inline-flex items-center gap-2 py-3.5 px-8 text-base"
              >
                <Globe className="w-4 h-4" />
                Search Domains
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Hero header */}
      <section className="relative pt-28 pb-10 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="type-h1 text-[#031033]">
                Your <span className="gradient-text">Cart</span>
              </h1>
              <p className="text-[#5a6a85] text-sm mt-1">
                {items.length} item{items.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/domains"
                id="cart-add-domains"
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Add Domains
              </Link>
              <button
                id="cart-clear-all"
                onClick={clearCart}
                className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cart content */}
      <section className="section-pad flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Stale item warning banner */}
              {staleWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span className="flex-1">{staleWarning}</span>
                  <button
                    onClick={() => setStaleWarning(null)}
                    className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {items.map((item) => {
                const key = getCartItemKey(item);
                return (
                  <div
                    key={key}
                    id={`cart-item-${key.replace(/[.:]/g, "-")}`}
                    className="bg-white rounded-2xl border border-[#e2eaff] hover:border-[#1787D4]/40 hover:shadow-sm transition-all p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <ItemTypeIcon item={item} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#031033] text-sm sm:text-base truncate">
                          {cartItemLabel(item)}
                        </p>
                        <p className="text-xs text-[#5a6a85] mt-0.5">
                          {itemTypeLabel(item)}
                        </p>
                      </div>
                      <p className="font-extrabold text-[#031033] text-base shrink-0">
                        {formatNGN(item.price)}
                      </p>
                      <button
                        id={`cart-remove-${key.replace(/[.:]/g, "-")}`}
                        onClick={() => removeItem(key)}
                        className="text-[#c5cedf] hover:text-red-500 transition-colors ml-2 shrink-0 p-1 cursor-pointer"
                        aria-label={`Remove ${cartItemLabel(item)}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* SSL in-cart options — directly selectable without redirect */}
                    {item.type === "DOMAIN" && !items.some(i => i.type === "SSL" && i.domainName === `${item.domainName}.${item.extension}`) && (
                      <div className="mt-4 pt-4 border-t border-[#edf2f7]">
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-[#031033]">Add SSL Certificate to this domain</span>
                          </div>
                          <span className="text-[11px] text-[#5a6a85] hidden sm:inline">Automatic Setup (No CSR needed)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {cheapSslOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              id={`cart-add-ssl-${opt.id}-${key.replace(/[.:]/g, "-")}`}
                              onClick={() => {
                                addSslItem({
                                  type: "SSL",
                                  domainName: `${item.domainName}.${item.extension}`,
                                  price: opt.price,
                                  productId: opt.id,
                                  period: 1,
                                  productName: opt.name,
                                });
                                toast.success(`${opt.name} added for ${item.domainName}.${item.extension}`);
                              }}
                              className="flex items-center justify-between sm:flex-col sm:items-start p-2.5 rounded-xl border border-[#d4e9f7] bg-[#f0f7ff] hover:bg-[#e1f0fe] hover:border-[#1787D4] transition-all cursor-pointer group text-left"
                            >
                              <div>
                                <span className="text-xs font-bold text-[#031033] group-hover:text-[#1787D4] transition-colors block">
                                  {opt.name}
                                </span>
                                <span className="text-[11px] font-semibold text-[#1787D4] block mt-0.5">
                                  +{formatNGN(opt.price)}/yr
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-white bg-[#1787D4] group-hover:bg-[#1370B5] px-2.5 py-1 rounded-lg transition-colors shadow-2xs sm:mt-2">
                                + Add
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SSL already added for this domain */}
                    {item.type === "DOMAIN" && items.some(i => i.type === "SSL" && i.domainName === `${item.domainName}.${item.extension}`) && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-800 font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            SSL Certificate included for {item.domainName}.{item.extension}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(`ssl:${item.domainName}.${item.extension}`)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                        >
                          Remove SSL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Order summary */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#e2eaff] bg-[#f8faff]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#1787D4]" />
                    <h2 className="font-bold text-[#031033] text-sm">
                      Order Summary
                    </h2>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-3">
                  {/* Line items */}
                  {items.map((item) => {
                    const key = getCartItemKey(item);
                    return (
                      <div
                        key={key}
                        className="flex justify-between text-sm gap-2"
                      >
                        <span className="text-[#5a6a85] truncate min-w-0 flex-1">
                          {cartItemLabel(item)}
                        </span>
                        <span className="text-[#031033] font-medium shrink-0">
                          {formatNGN(item.price)}
                        </span>
                      </div>
                    );
                  })}

                  <div className="border-t border-[#e2eaff] pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#031033]">Total</span>
                      <span className="font-extrabold text-xl text-[#031033]">
                        {formatNGN(grandTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auth notice */}
                {!token && (
                  <div className="px-6 pb-2">
                    <div className="flex items-start gap-2 bg-[#f0f7ff] border border-[#d4e9f7] rounded-xl px-3.5 py-2.5 text-xs text-[#1787D4]">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#1787D4]" />
                      <span className="text-[#031033]">
                        You&apos;ll need to <strong>sign in</strong> or{" "}
                        <strong>create an account</strong> to complete your
                        purchase.
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-6 pb-6 space-y-3">
                  <button
                    id="cart-checkout-btn"
                    onClick={handleCheckout}
                    className="btn-primary w-full py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {!token ? "Sign In & Checkout" : "Proceed to Checkout"}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-[10px] text-[#9ba8c0]">
                    Secure checkout powered by Paystack
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, label: "Secure Payment" },
                  { icon: Globe, label: "Instant Setup" },
                  { icon: Package, label: "24/7 Support" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="bg-[#f8faff] border border-[#e2eaff] rounded-xl p-3 flex flex-col items-center gap-1.5 text-center shadow-2xs"
                  >
                    <Icon className="w-4 h-4 text-[#1787D4]" />
                    <span className="text-[10px] text-[#5a6a85] font-medium">
                      {label}
                    </span>
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
