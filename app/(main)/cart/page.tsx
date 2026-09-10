"use client";

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
} from "lucide-react";
import { useCartStore, cartItemLabel, getCartItemKey, type CartItem } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

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
  return "SSL Certificate";
}

export default function CartPage() {
  const { items, addSslItem, removeItem, clearCart, grandTotal } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

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

                    {/* SSL cross-sell recommendation */}
                    {item.type === "DOMAIN" && !items.some(i => i.type === "SSL" && i.domainName === `${item.domainName}.${item.extension}`) && (
                      <div className="mt-4 pt-4 border-t border-[#edf2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f0f7ff] rounded-xl border border-[#d4e9f7] p-3.5 sm:p-4">
                        <div className="flex items-start gap-2.5">
                          <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-[#031033]">
                              Secure your domain name
                            </p>
                            <p className="text-[11px] text-[#5a6a85] mt-0.5">
                              Protect visitor data, boost search engine rankings, and build trust with a PositiveSSL Certificate.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addSslItem({
                              type: "SSL",
                              domainName: `${item.domainName}.${item.extension}`,
                              price: 10000,
                            });
                          }}
                          className="shrink-0 text-xs font-bold py-2 px-3.5 bg-[#1787D4] text-white hover:bg-[#1370B5] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Add SSL (+₦10,000/yr)
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
