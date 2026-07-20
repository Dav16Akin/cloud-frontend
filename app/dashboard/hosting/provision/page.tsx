"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Server,
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Trash2,
  CreditCard,
  ShoppingCart,
  Plus,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import { useInitializeCartPayment } from "@/hooks/useOrders";
import {
  useCartStore,
  cartItemLabel,
  getCartItemKey,
  type CartItem,
} from "@/store/cartStore";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ── Item type icon ─────────────────────────────────────────────────────────────

function ItemTypeIcon({ item }: { item: CartItem }) {
  if (item.type === "HOSTING")
    return (
      <div className="w-9 h-9 bg-[#fff8ee] border border-[#f5d99e] flex items-center justify-center shrink-0">
        <Server className="w-4 h-4 text-[#e8900a]" />
      </div>
    );
  if (item.type === "DOMAIN")
    return (
      <div className="w-9 h-9 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
        <Globe className="w-4 h-4 text-[#031033]" />
      </div>
    );
  return (
    <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-emerald-500" />
    </div>
  );
}

// ── Cart Item Row ─────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (key: string) => void;
}) {
  const key = getCartItemKey(item);
  const typeLabel =
    item.type === "HOSTING"
      ? `Hosting Plan (${item.billingCycle ? item.billingCycle.charAt(0).toUpperCase() + item.billingCycle.slice(1) : "Yearly"})`
      : item.type === "DOMAIN"
      ? "Domain Registration"
      : "SSL Certificate";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#f0f4fc] last:border-b-0">
      <ItemTypeIcon item={item} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#031033] truncate">
          {cartItemLabel(item)}
        </p>
        <p className="text-xs text-[#9ba8c0]">{typeLabel}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <p className="text-sm font-bold text-[#031033]">
          {formatNGN(item.price)}
        </p>
        <button
          onClick={() => onRemove(key)}
          className="text-[#c5cedf] hover:text-red-500 transition-colors"
          aria-label={`Remove ${cartItemLabel(item)}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Plan Selector Card ────────────────────────────────────────────────────────

function AddPlanSection() {
  const { data: plans, isLoading } = usePlans();
  const { addHostingItem, hasItem } = useCartStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  if (isLoading)
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-[#e8edf8] animate-pulse rounded" />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Billing Cycle Selector Tabs */}
      <div className="flex justify-start">
        <div className="inline-flex items-center bg-white border border-[#e2eaff] p-0.5 rounded-lg">
          {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${
                billingCycle === cycle
                  ? "bg-[#031033] text-white shadow-sm"
                  : "text-[#5a6a85] hover:text-[#031033]"
              }`}
            >
              {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {plans?.map((plan) => {
          const key = `hosting:${plan.id}:${billingCycle}`;
          const inCart = hasItem(key);
          const priceMap = {
            monthly: plan.monthlyPrice,
            quarterly: plan.quarterlyPrice,
            yearly: plan.price,
          };
          const price = priceMap[billingCycle];

          return (
            <div
              key={plan.id}
              className={`flex items-center gap-3 p-4 border transition-all ${
                inCart
                  ? "border-[#e8900a] bg-[#fff8ee]"
                  : "border-[#e2eaff] hover:border-[#e8900a]/50 bg-white"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#031033] flex items-center gap-2">
                  {plan.name} Hosting
                  {plan.isPopular && (
                    <span className="text-[10px] bg-[#e8900a] text-white px-1.5 py-0.5 font-bold">
                      Popular
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#9ba8c0] mt-0.5">
                  {plan.storage} · {plan.bandwidth} · {billingCycle}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-[#031033]">
                  {formatNGN(price)}
                </p>
                <span className="text-[10px] font-normal text-[#9ba8c0]">
                  /{billingCycle === "yearly" ? "yr" : billingCycle === "quarterly" ? "qtr" : "mo"}
                </span>
              </div>
              {inCart ? (
                <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 font-semibold shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Added
                </span>
              ) : (
                <button
                  id={`add-plan-${plan.id}`}
                  onClick={() =>
                    addHostingItem({
                      type: "HOSTING",
                      planId: plan.id,
                      planName: plan.name,
                      price: price,
                      billingCycle: billingCycle,
                    })
                  }
                  className="shrink-0 text-xs font-semibold btn-primary py-1.5 px-3 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Checkout Content ─────────────────────────────────────────────────────

function CheckoutContent() {
  const router = useRouter();
  const { items, removeItem, grandTotal, clearCart } = useCartStore();
  const { mutate: initPayment, isPending } = useInitializeCartPayment();

  const [showAddPlan, setShowAddPlan] = useState(false);

  const hasHosting = items.some((i) => i.type === "HOSTING");
  const hasDomain = items.some((i) => i.type === "DOMAIN");

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Build backend-compatible items array from the store
    const backendItems = items.map((item) => {
      if (item.type === "HOSTING") return { type: "HOSTING" as const, planId: item.planId, billingCycle: item.billingCycle };
      if (item.type === "DOMAIN")
        return {
          type: "DOMAIN" as const,
          domainName: item.domainName,
          extension: item.extension,
        };
      if (item.type === "DOMAIN_TRANSFER")
        return {
          type: "DOMAIN_TRANSFER" as const,
          domainName: item.domainName,
          extension: item.extension,
          authCode: item.authCode,
        };
      // SSL
      return { type: "SSL" as const, domainName: item.domainName, productId: item.productId };
    });

    initPayment(backendItems, {
      onSuccess: (res) => {
        clearCart();
        window.location.href = res.data.paymentUrl;
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-7 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/hosting"
            id="checkout-back"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Hosting
          </Link>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
            Checkout
          </h1>
          <p className="text-[#5a6a85] mt-1 text-sm">
            Review your order and complete payment to provision your services.
          </p>
        </div>

        {/* Cart items */}
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#9ba8c0]" />
              <h2 className="text-sm font-semibold text-[#031033]">
                Your Order
              </h2>
              {items.length > 0 && (
                <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                  {items.length}
                </span>
              )}
            </div>
            <button
              id="checkout-add-plan"
              onClick={() => setShowAddPlan((v) => !v)}
              className="text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Plan
            </button>
          </div>

          {/* Add Plan panel */}
          {showAddPlan && (
            <div className="border-b border-[#e2eaff] p-5 bg-[#f6f9ff]">
              <p className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide mb-3">
                Select a Hosting Plan
              </p>
              <AddPlanSection />
              <button
                onClick={() => setShowAddPlan(false)}
                className="mt-3 text-xs text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
              <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#9ba8c0]" />
              </div>
              <p className="text-sm text-[#5a6a85] max-w-xs">
                Your cart is empty. Add a hosting plan or search for a domain to
                get started.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddPlan(true)}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
                >
                  <Server className="w-4 h-4" />
                  Add Hosting
                </button>
                <Link
                  href="/dashboard/domains"
                  className="text-sm py-2 px-4 font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4" />
                  Add Domain
                </Link>
              </div>
            </div>
          )}

          {/* Items */}
          {items.length > 0 && (
            <div className="px-5 py-2">
              {items.map((item) => (
                <CartItemRow
                  key={getCartItemKey(item)}
                  item={item}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Domain note for hosting-only carts */}
        {hasHosting && !hasDomain && items.length > 0 && (
          <div className="flex items-start gap-3 bg-[#f6f9ff] border border-[#e2eaff] p-4">
            <Globe className="w-4 h-4 text-[#9ba8c0] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#5a6a85]">
                <span className="font-semibold text-[#031033]">
                  No domain in cart.
                </span>{" "}
                Your hosting account will use a temporary subdomain
                (e.g.&nbsp;<code className="text-xs">yourname.nupatcloud.com</code>).
                You can{" "}
                <Link
                  href="/dashboard/domains"
                  className="text-[#e8900a] hover:underline underline-offset-2"
                >
                  add a domain
                </Link>{" "}
                to use it as your primary domain.
              </p>
            </div>
          </div>
        )}

        {/* Payment summary + checkout */}
        {items.length > 0 && (
          <div className="bg-white border border-[#e2eaff] p-6 flex flex-col gap-5">
            {/* Order breakdown */}
            <div className="bg-[#f6f9ff] border border-[#e2eaff] divide-y divide-[#e2eaff]">
              {items.map((item) => (
                <div
                  key={getCartItemKey(item)}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-xs text-[#5a6a85]">
                    {cartItemLabel(item)}
                  </span>
                  <span className="text-sm font-semibold text-[#031033]">
                    {formatNGN(item.price)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-bold text-[#031033]">Total</span>
                <span className="text-lg font-extrabold text-[#031033]">
                  {formatNGN(grandTotal())}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 text-xs text-[#5a6a85]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9ba8c0]" />
              <p>
                Your services will be provisioned automatically after payment.
                No further setup steps required.
              </p>
            </div>

            {/* Pay button */}
            <button
              id="checkout-pay-now"
              onClick={handleCheckout}
              disabled={isPending || items.length === 0}
              className="btn-primary text-sm py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to Paystack…
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatNGN(grandTotal())} &amp; Checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#9ba8c0] flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Secured via Paystack
            </p>
          </div>
        )}

        {/* Help */}
        <div className="flex gap-2 text-xs text-[#5a6a85]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            Services are provisioned automatically after payment. If you
            purchased a domain in the same order, it will be registered and
            linked to your hosting account.
          </p>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-5">
          <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
          <p className="text-sm text-[#5a6a85]">Loading checkout…</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
