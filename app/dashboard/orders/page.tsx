"use client";

import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Server,
  Globe,
  Shield,
} from "lucide-react";
import { useGetOrders } from "@/hooks/useOrders";
import type { Order, OrderItem, OrderStatus } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

/** Returns a human-readable summary for an order's items array */
function orderSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "—";
  return items
    .map((i) => {
      if (i.type === "HOSTING") return `${i.plan?.name ?? "Hosting"} Plan`;
      if (i.type === "DOMAIN")  return i.domainName ?? "Domain";
      return `SSL (${i.domainName ?? ""})`;
    })
    .join(", ");
}

function ItemTypeIcon({ type }: { type: OrderItem["type"] }) {
  if (type === "HOSTING")
    return <Server className="w-3.5 h-3.5 text-[#e8900a]" />;
  if (type === "DOMAIN")
    return <Globe className="w-3.5 h-3.5 text-[#031033]" />;
  return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg =
    status === "PAID"
      ? {
          icon: CheckCircle2,
          label: "Paid",
          cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
        }
      : status === "PENDING"
      ? {
          icon: Clock,
          label: "Pending",
          cls: "bg-amber-50 text-amber-600 border-amber-200",
        }
      : {
          icon: XCircle,
          label: "Failed",
          cls: "bg-red-50 text-red-500 border-red-200",
        };

  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${cfg.cls}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const summary = orderSummary(order.items);
  const itemTypes = [...new Set(order.items.map((i) => i.type))];

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f6f9ff] transition-colors border-b border-[#e2eaff] last:border-b-0">
      {/* Icon cluster */}
      <div className="w-8 h-8 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center shrink-0">
        <Receipt className="w-3.5 h-3.5 text-[#9ba8c0]" />
      </div>

      {/* Summary + ref */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          {itemTypes.map((t) => (
            <ItemTypeIcon key={t} type={t} />
          ))}
          <p className="text-sm font-semibold text-[#031033] truncate">
            {summary}
          </p>
        </div>
        <p className="text-xs text-[#9ba8c0] font-mono truncate">
          {order.paystackRef}
        </p>
      </div>

      {/* Amount */}
      <p className="text-sm font-extrabold text-[#031033] shrink-0 hidden sm:block">
        {formatPrice(order.amount)}
      </p>

      {/* Status */}
      <OrderStatusBadge status={order.status} />

      {/* Date */}
      <p className="text-xs text-[#9ba8c0] shrink-0 hidden md:block">
        {formatDate(order.createdAt)}
      </p>
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e2eaff] last:border-b-0 animate-pulse">
      <div className="w-8 h-8 bg-[#e8edf8] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-36 bg-[#e8edf8] rounded mb-1.5" />
        <div className="h-3 w-48 bg-[#e8edf8] rounded" />
      </div>
      <div className="hidden sm:block h-4 w-16 bg-[#e8edf8] rounded" />
      <div className="h-5 w-14 bg-[#e8edf8] rounded" />
      <div className="hidden md:block h-3 w-20 bg-[#e8edf8] rounded" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useGetOrders();

  const hasOrders = orders && orders.length > 0;
  const paidCount = orders?.filter((o) => o.status === "PAID").length ?? 0;

  return (
    <div className="flex flex-col gap-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
            Orders
          </h1>
          <p className="text-[#5a6a85] mt-1 text-sm">
            View your payment history. Services are provisioned automatically
            after payment.
          </p>
        </div>
        <Link
          href="/dashboard/hosting/provision"
          id="orders-new-order"
          className="hidden sm:flex btn-primary text-sm py-2 px-4 items-center gap-2 whitespace-nowrap shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stats strip */}
      {hasOrders && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: orders.length, color: "text-[#031033]" },
            { label: "Paid", value: paidCount, color: "text-emerald-600" },
            {
              label: "Pending / Failed",
              value: orders.length - paidCount,
              color: "text-amber-600",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white border border-[#e2eaff] px-4 py-3"
            >
              <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide">
                {label}
              </p>
              <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white border border-[#e2eaff]">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#9ba8c0]" />
            <h2 className="text-sm font-semibold text-[#031033]">
              Payment History
            </h2>
            {hasOrders && (
              <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                {orders.length}
              </span>
            )}
          </div>
          {isError && (
            <button
              onClick={() => refetch()}
              className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>

        {/* Column headers (desktop) */}
        {hasOrders && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2 bg-[#f6f9ff] border-b border-[#e2eaff]">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider">
              Items
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-20 hidden sm:block">
              Amount
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-16">
              Status
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-24 hidden md:block">
              Date
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 p-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">
              Could not load your orders. Please try again.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && [...Array(3)].map((_, i) => <OrderRowSkeleton key={i} />)}

        {/* Empty */}
        {!isLoading && !isError && !hasOrders && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5 text-[#9ba8c0]" />
            </div>
            <p className="text-sm text-[#5a6a85] max-w-xs mb-4">
              You have not placed any orders yet. Purchase a hosting plan or
              domain to get started.
            </p>
            <Link
              href="/dashboard/hosting/provision"
              id="orders-empty-cta"
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders list */}
        {hasOrders && (
          <div className="flex flex-col">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Help note */}
      <div className="bg-[#f2f5fc] border border-[#e2eaff] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#031033]">
            Payment issue or missing order?
          </p>
          <p className="text-xs text-[#5a6a85] mt-0.5">
            If your payment was deducted but your order is still pending, please
            contact support with your payment reference.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          id="orders-contact-support"
          className="text-sm font-semibold text-[#e8900a] hover:underline underline-offset-4 whitespace-nowrap inline-flex items-center gap-1"
        >
          Contact Support <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
