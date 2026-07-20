"use client";

import { useEffect, useRef } from "react";
import {
  X,
  ShoppingCart,
  Trash2,
  Globe,
  Shield,
  Server,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";
import {
  useCartStore,
  cartItemLabel,
  getCartItemKey,
  type CartItem,
} from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

function formatNGN(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function ItemIcon({ item }: { item: CartItem }) {
  if (item.type === "HOSTING")
    return (
      <div className="w-9 h-9 bg-[#fffbf2] border border-[#f5d99e] flex items-center justify-center shrink-0">
        <Server className="w-4 h-4 text-[#e8900a]" />
      </div>
    );
  if (item.type === "DOMAIN")
    return (
      <div className="w-9 h-9 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
        <Globe className="w-4 h-4 text-[#031033]" />
      </div>
    );
  if (item.type === "DOMAIN_TRANSFER")
    return (
      <div className="w-9 h-9 bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
        <ArrowRightLeft className="w-4 h-4 text-amber-600" />
      </div>
    );
  // SSL
  return (
    <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-emerald-500" />
    </div>
  );
}

function ItemSubtitle({ item }: { item: CartItem }) {
  if (item.type === "HOSTING") {
    const cycle = item.billingCycle ? item.billingCycle.charAt(0).toUpperCase() + item.billingCycle.slice(1) : "Yearly";
    return <p className="text-xs text-[#9ba8c0] mt-0.5">Web Hosting Plan ({cycle})</p>;
  }
  if (item.type === "DOMAIN")
    return <p className="text-xs text-[#9ba8c0] mt-0.5">Domain Registration</p>;
  if (item.type === "DOMAIN_TRANSFER")
    return <p className="text-xs text-amber-600 mt-0.5">Domain Transfer</p>;
  return <p className="text-xs text-emerald-600 mt-0.5">SSL Certificate</p>;
}

export default function CartDrawer() {
  const {
    items,
    addSslItem,
    removeItem,
    grandTotal,
    isDrawerOpen,
    closeDrawer,
    itemCount,
  } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleCheckout = () => {
    closeDrawer();
    if (!token) {
      router.push("/login?redirect=/dashboard/hosting/provision");
    } else {
      router.push("/dashboard/hosting/provision");
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        id="cart-drawer"
        role="dialog"
        aria-label="Shopping cart"
        className="fixed top-0 right-0 h-full z-50 w-full max-w-md bg-white border-l border-[#e2eaff] shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.25s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#031033]" />
            <div>
              <h2 className="font-bold text-[#031033] text-sm">
                Shopping Cart
              </h2>
              <p className="text-xs text-[#9ba8c0]">
                {itemCount()} item{itemCount() !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            id="cart-drawer-close"
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center text-[#9ba8c0] hover:text-[#031033] hover:bg-[#e2eaff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-14 h-14 bg-[#f2f5fc] flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#c5cedf]" />
              </div>
              <div>
                <p className="text-[#031033] font-semibold text-sm">
                  Your cart is empty
                </p>
                <p className="text-[#9ba8c0] text-xs mt-1">
                  Add a hosting plan or domain to get started.
                </p>
              </div>
              <button
                onClick={() => {
                  closeDrawer();
                  router.push("/dashboard/hosting");
                }}
                className="btn-primary py-2.5 px-6 text-sm"
              >
                Browse Plans
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f4fc]">
              {items.map((item) => {
                const key = getCartItemKey(item);
                return (
                  <div
                    key={key}
                    id={`drawer-item-${key.replace(/[.:]/g, "-")}`}
                    className="px-5 py-4 hover:bg-[#fafbff] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <ItemIcon item={item} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#031033] text-sm truncate">
                          {cartItemLabel(item)}
                        </p>
                        <ItemSubtitle item={item} />
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="font-bold text-[#031033] text-sm">
                          {formatNGN(item.price)}
                        </p>
                        <button
                          id={`drawer-remove-${key.replace(/[.:]/g, "-")}`}
                          onClick={() => removeItem(key)}
                          className="text-[#c5cedf] hover:text-red-500 transition-colors"
                          aria-label={`Remove ${cartItemLabel(item)}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* SSL cross-sell recommendation */}
                    {item.type === "DOMAIN" && !items.some(i => i.type === "SSL" && i.domainName === `${item.domainName}.${item.extension}`) && (
                      <div className="mt-3 pt-3 border-t border-[#f0f4fc] flex items-center justify-between gap-2 bg-[#fcfdfe] p-2 -mx-2 -mb-2 rounded">
                        <span className="text-[10px] text-[#5a6a85] flex items-center gap-1 font-medium">
                          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          Add SSL security (+₦10,000/yr)
                        </span>
                        <button
                          onClick={() => {
                            addSslItem({
                              type: "SSL",
                              domainName: `${item.domainName}.${item.extension}`,
                              price: 10000,
                            });
                          }}
                          className="text-[10px] font-bold text-[#e8900a] hover:underline shrink-0 px-2 py-1 bg-white border border-[#e2eaff] hover:bg-[#fafbff] rounded"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e2eaff] px-6 py-5 space-y-3 shrink-0 bg-white">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#5a6a85]">Total</span>
              <span className="font-extrabold text-lg text-[#031033]">
                {formatNGN(grandTotal())}
              </span>
            </div>

            {/* Checkout */}
            <button
              id="cart-drawer-checkout"
              onClick={handleCheckout}
              className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {!token ? "Sign In & Checkout" : "Proceed to Checkout"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[10px] text-[#9ba8c0]">
              Secure checkout via Paystack
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
