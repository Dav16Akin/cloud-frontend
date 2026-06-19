"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Shield,
  ArrowRight,
  Globe,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useCartStore, SSL_PRICE } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const SSL_LABEL = "SSL Certificate";

function YearsSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (y: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 border border-[#dce4f7] bg-[#f6f8fd]">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="px-2 py-1.5 text-[#5a6a85] hover:text-[#031033] disabled:opacity-30 transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs font-bold text-[#031033] min-w-[48px] text-center">
        {value} yr{value !== 1 ? "s" : ""}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= 5}
        className="px-2 py-1.5 text-[#5a6a85] hover:text-[#031033] disabled:opacity-30 transition-colors"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function CartPage() {
  const {
    items,
    removeItem,
    toggleSsl,
    setYears,
    clearCart,
    subtotal,
    sslTotal,
    grandTotal,
  } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [clearing, setClearing] = useState(false);

  const handleCheckout = () => {
    if (!token) {
      router.push("/login?redirect=/cart/checkout");
    } else {
      router.push("/cart/checkout");
    }
  };

  const handleClearCart = () => {
    setClearing(true);
    setTimeout(() => {
      clearCart();
      setClearing(false);
    }, 300);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col bg-white min-h-[70vh]">
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden section-navy-tint">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <div className="w-20 h-20 mx-auto bg-white border border-[#e2eaff] flex items-center justify-center mb-6 shadow-sm">
              <ShoppingCart className="w-9 h-9 text-[#9ba8c0]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#031033] mb-3">
              Your Cart is <span className="gradient-text">Empty</span>
            </h1>
            <p className="text-[#5a6a85] mb-8 text-base">
              Search for a domain and add it to your cart to get started.
            </p>
            <Link
              href="/domains"
              id="cart-empty-search"
              className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 text-base"
            >
              <Globe className="w-4 h-4" />
              Search Domains
            </Link>
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
              <h1 className="text-3xl font-extrabold text-[#031033]">
                Your <span className="gradient-text">Cart</span>
              </h1>
              <p className="text-[#5a6a85] text-sm mt-1">
                {items.length} domain{items.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/domains"
                id="cart-add-more"
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Add More Domains
              </Link>
              <button
                id="cart-clear-all"
                onClick={handleClearCart}
                disabled={clearing}
                className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider border-b border-[#e2eaff]">
                <span>Domain</span>
                <span className="text-center">Period</span>
                <span className="text-center">SSL</span>
                <span className="text-right">Price</span>
              </div>

              {items.map((item) => {
                const domainTotal = item.price * item.years + (item.addSsl ? SSL_PRICE * item.years : 0);
                return (
                  <div
                    key={item.domain}
                    id={`cart-item-${item.domain.replace(/\./g, "-")}`}
                    className="bg-white border border-[#e2eaff] hover:border-[#e8900a]/30 hover:shadow-sm transition-all"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4 text-[#031033]" />
                          </div>
                          <div>
                            <p className="font-bold text-[#031033] text-sm">{item.domain}</p>
                            {item.isPremium && (
                              <span className="text-[10px] text-purple-600 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Premium
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          id={`cart-remove-mobile-${item.domain.replace(/\./g, "-")}`}
                          onClick={() => removeItem(item.domain)}
                          className="text-[#c5cedf] hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#5a6a85]">Period:</span>
                          <YearsSelector
                            value={item.years}
                            onChange={(y) => setYears(item.domain, y)}
                          />
                        </div>
                        <label
                          className="flex items-center gap-2 cursor-pointer"
                          id={`cart-ssl-toggle-mobile-${item.domain.replace(/\./g, "-")}`}
                        >
                          <div
                            onClick={() => toggleSsl(item.domain)}
                            className={`w-9 h-5 relative transition-colors ${item.addSsl ? "bg-[#e8900a]" : "bg-[#dce4f7]"}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white shadow-sm transition-transform ${item.addSsl ? "translate-x-4" : "translate-x-0.5"}`}
                            />
                          </div>
                          <span className="text-xs text-[#5a6a85]">
                            SSL <span className="text-[#031033] font-semibold">+{formatCurrency(SSL_PRICE)}/yr</span>
                          </span>
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <p className="font-bold text-[#031033]">{formatCurrency(domainTotal, item.currency)}</p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4">
                      {/* Domain info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-[#031033]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#031033] truncate">{item.domain}</p>
                            {item.isPremium && (
                              <span className="text-[10px] bg-[#f3f0ff] text-purple-600 border border-purple-200 px-2 py-0.5 font-semibold shrink-0 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Premium
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#9ba8c0]">
                            {formatCurrency(item.price, item.currency)}/yr
                            {item.addSsl && ` + SSL ${formatCurrency(SSL_PRICE)}/yr`}
                          </p>
                        </div>
                        <button
                          id={`cart-remove-${item.domain.replace(/\./g, "-")}`}
                          onClick={() => removeItem(item.domain)}
                          className="ml-2 text-[#c5cedf] hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Years */}
                      <YearsSelector
                        value={item.years}
                        onChange={(y) => setYears(item.domain, y)}
                      />

                      {/* SSL toggle */}
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        id={`cart-ssl-toggle-${item.domain.replace(/\./g, "-")}`}
                      >
                        <div
                          onClick={() => toggleSsl(item.domain)}
                          className={`w-9 h-5 relative transition-colors cursor-pointer ${item.addSsl ? "bg-[#e8900a]" : "bg-[#dce4f7]"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white shadow-sm transition-transform ${item.addSsl ? "translate-x-4" : "translate-x-0.5"}`}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-[#031033]">SSL</p>
                          <p className="text-[10px] text-[#9ba8c0]">+{formatCurrency(SSL_PRICE)}/yr</p>
                        </div>
                      </label>

                      {/* Row total */}
                      <div className="text-right">
                        <p className="font-bold text-[#031033]">{formatCurrency(domainTotal, item.currency)}</p>
                        <p className="text-[10px] text-[#9ba8c0]">for {item.years} yr{item.years !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    {/* SSL add-on info chip */}
                    {item.addSsl && (
                      <div className="flex items-center gap-2 px-5 py-2 bg-[#fff8ee] border-t border-[#f5d38a]/50 text-xs text-[#e8900a]">
                        <Shield className="w-3 h-3 shrink-0" />
                        <span>
                          <strong>{SSL_LABEL}</strong> included — {formatCurrency(SSL_PRICE * item.years, item.currency)} for {item.years} yr{item.years !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add SSL notice */}
              <div className="mt-4 bg-[#f6f9ff] border border-[#dce4f7] p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#e8900a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#031033]">Why add SSL?</p>
                  <p className="text-xs text-[#5a6a85] mt-0.5 leading-relaxed">
                    SSL certificates encrypt your visitors' data, boost SEO rankings, and display the padlock icon in browsers — making your site look professional and trustworthy.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border border-[#e2eaff]">
                {/* Summary header */}
                <div className="px-6 py-4 border-b border-[#e2eaff] bg-[#f6f9ff]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#5a6a85]" />
                    <h2 className="font-bold text-[#031033] text-sm">Order Summary</h2>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-3">
                  {/* Line items */}
                  {items.map((item) => (
                    <div key={item.domain} className="flex justify-between text-sm gap-2">
                      <span className="text-[#5a6a85] truncate min-w-0 flex-1">{item.domain}</span>
                      <span className="text-[#031033] font-medium shrink-0">
                        {formatCurrency(item.price * item.years, item.currency)}
                      </span>
                    </div>
                  ))}

                  {sslTotal() > 0 && (
                    <>
                      <div className="my-2 border-t border-[#f0f4fc]" />
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-[#5a6a85] flex items-center gap-1">
                          <Shield className="w-3 h-3" /> SSL Certificates
                        </span>
                        <span className="text-[#031033] font-medium">{formatCurrency(sslTotal())}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-[#e2eaff] pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#031033]">Total</span>
                      <span className="font-extrabold text-xl text-[#031033]">
                        {formatCurrency(grandTotal())}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ba8c0] mt-1">Billed now. Renews annually.</p>
                  </div>
                </div>

                {/* Auth notice if not logged in */}
                {!token && (
                  <div className="px-6 pb-2">
                    <div className="flex items-start gap-2 bg-[#fff8ee] border border-[#f5d38a] px-3 py-2.5 text-xs text-[#e8900a]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        You&apos;ll need to <strong>sign in</strong> or <strong>create an account</strong> to complete your purchase.
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-6 pb-6 space-y-3">
                  <button
                    id="cart-checkout-btn"
                    onClick={handleCheckout}
                    className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
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
                    className="bg-[#f6f9ff] border border-[#dce4f7] p-3 flex flex-col items-center gap-1.5 text-center"
                  >
                    <Icon className="w-4 h-4 text-[#e8900a]" />
                    <span className="text-[10px] text-[#5a6a85] font-medium">{label}</span>
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
