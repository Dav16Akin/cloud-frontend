"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Server,
  Globe,
  Shield,
  ExternalLink,
  Loader2,
  Search,
  Cpu,
} from "lucide-react";
import { useGetOrders, useGetInvoiceLink } from "@/hooks/useOrders";
import type { OrderItem, OrderStatus } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function orderSummary(items: OrderItem[]): string {
  if (!items || items.length === 0) return "—";
  return items
    .map((i) => {
      if (i.type === "HOSTING") return `${i.plan?.name ?? "Hosting"} Plan`;
      if (i.type === "DOMAIN") return i.domainName ?? "Domain";
      if (i.type === "VPS") return `${i.vpsPlan?.name ?? "VPS"} Server`;
      if (i.type === "VPS_RENEWAL")
        return `${i.vpsTarget?.name ?? i.vpsPlan?.name ?? "VPS"} Renewal`;
      return `SSL (${i.domainName ?? ""})`;
    })
    .join(", ");
}

function ItemTypeIcon({ type }: { type: OrderItem["type"] }) {
  if (type === "HOSTING")
    return <Server className="w-4 h-4 text-[#5A6A85]" />;
  if (type === "DOMAIN")
    return <Globe className="w-4 h-4 text-[#5A6A85]" />;
  if (type === "VPS" || type === "VPS_RENEWAL")
    return <Cpu className="w-4 h-4 text-[#5A6A85]" />;
  return <Shield className="w-4 h-4 text-[#5A6A85]" />;
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const PILL =
  "inline-flex items-center gap-2 whitespace-nowrap text-sm";

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "PAID") {
    return <span className={`${PILL} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />Paid</span>;
  }
  if (status === "PENDING") {
    return <span className={`${PILL} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#E8900A]" />Pending</span>;
  }
  return <span className={`${PILL} text-[#C21F1F]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />Failed</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useGetOrders();
  const {
    mutate: openInvoice,
    isPending: isDownloading,
    variables: downloadingId,
  } = useGetInvoiceLink();

  const [statusFilter, setStatusFilter] = useState<
    "All" | "PAID" | "PENDING" | "FAILED"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const hasOrders = orders && orders.length > 0;
  const totalOrders = orders?.length || 0;
  const paidCount = orders?.filter((o) => o.status === "PAID").length ?? 0;
  const pendingCount =
    orders?.filter((o) => o.status === "PENDING").length ?? 0;

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const matchesFilter =
        statusFilter === "All" || order.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const summary = orderSummary(order.items).toLowerCase();
      const matchesSearch =
        !q ||
        (order.paystackRef && order.paystackRef.toLowerCase().includes(q)) ||
        summary.includes(q) ||
        (order.items || []).some(
          (i) => i.domainName && i.domainName.toLowerCase().includes(q)
        );

      return matchesFilter && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const focusCls =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">Orders</h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Track your payments and the services provisioned from them.
          </p>
        </div>

        <Link
          href="/dashboard/hosting"
          id="orders-new-order"
          className={`inline-flex h-9 items-center gap-1.5 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors self-start sm:self-auto shrink-0 ${focusCls}`}
        >
          <ShoppingCart className="w-4 h-4" />
          New order
        </Link>
      </div>

      {/* Metric row: one container split by hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#EEF2F7]">
        {[
          { label: "Total orders", value: totalOrders },
          { label: "Completed (paid)", value: paidCount },
          { label: "Pending or in review", value: pendingCount },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <span className="text-xs text-[#5A6A85]">{stat.label}</span>
            <div className="mt-1 text-2xl font-semibold text-[#031033] tabular-nums">
              {isLoading ? (
                <span className="block h-8 w-10 animate-pulse rounded bg-[#EEF2F7]" />
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Row: Segmented control + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 self-start rounded-lg bg-[#F2F5FC] p-1">
          {(
            [
              { label: "All", val: "All" },
              { label: "Paid", val: "PAID" },
              { label: "Pending", val: "PENDING" },
              { label: "Failed", val: "FAILED" },
            ] as const
          ).map(({ label, val }) => {
            const isActive = statusFilter === val;
            return (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`h-7 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white text-[#031033] shadow-sm"
                    : "text-[#5A6A85] hover:text-[#031033]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reference or item"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#031033]">Payment history</h3>
            {hasOrders && (
              <span className="text-sm text-[#5A6A85] tabular-nums">
                {orders.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className={`inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${focusCls}`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-3.5 border-b border-[#EEF2F7] last:border-0 flex items-center gap-6">
                <span className="block h-4 w-48 animate-pulse rounded bg-[#EEF2F7]" />
                <span className="block h-4 w-28 animate-pulse rounded bg-[#EEF2F7]" />
                <span className="ml-auto block h-4 w-20 animate-pulse rounded bg-[#EEF2F7]" />
                <span className="block h-5 w-14 animate-pulse rounded-full bg-[#EEF2F7]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
            <p className="text-sm text-[#031033]">Couldn&apos;t load your orders.</p>
            <button
              onClick={() => refetch()}
              className={`mt-1 inline-flex h-8 items-center px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors cursor-pointer ${focusCls}`}
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <p className="text-sm font-medium text-[#031033]">No orders found</p>
            <p className="text-xs text-[#5A6A85] max-w-sm mt-1">
              {searchQuery || statusFilter !== "All"
                ? "No transactions match your current filters."
                : "You haven't placed any orders yet. Buy a domain or hosting plan to get started."}
            </p>
            {!searchQuery && statusFilter === "All" && (
              <Link
                href="/dashboard/hosting"
                className={`mt-4 inline-flex h-9 items-center px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors ${focusCls}`}
              >
                Browse services
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View: Touch-Friendly Cards */}
            <div className="md:hidden divide-y divide-[#EEF2F7]">
              {filteredOrders.map((order) => {
                const summary = orderSummary(order.items);
                const itemTypes = [
                  ...new Set(order.items?.map((i) => i.type) || []),
                ];
                const canDownload =
                  order.status === "PAID" && !!order.whmcsInvoiceId;

                return (
                  <div key={order.id} className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          {itemTypes.map((t) => (
                            <ItemTypeIcon key={t} type={t} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-[#031033] truncate">
                          {summary}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <dl className="grid grid-cols-2 gap-2 text-xs bg-[#F2F5FC] px-4 py-3 rounded-lg">
                      <div>
                        <dt className="text-[#5A6A85]">Amount</dt>
                        <dd className="font-semibold text-[#031033] text-sm tabular-nums">
                          {formatPrice(order.amount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5A6A85]">Date</dt>
                        <dd className="text-[#031033] text-sm tabular-nums">{formatDate(order.createdAt)}</dd>
                      </div>
                      {order.paystackRef && (
                        <div className="col-span-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <dt className="text-[#5A6A85] shrink-0">Reference</dt>
                          <dd className="font-mono text-[#031033] truncate">
                            {order.paystackRef}
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="flex items-center">
                      {canDownload ? (
                        <button
                          id={`order-view-invoice-mobile-${order.id}`}
                          onClick={() => openInvoice(order.id)}
                          disabled={
                            isDownloading && downloadingId === order.id
                          }
                          className={`w-full inline-flex h-9 items-center justify-center gap-1.5 text-sm font-medium text-[#031033] border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${focusCls}`}
                        >
                          {isDownloading && downloadingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5 text-[#5A6A85]" />
                          )}
                          View invoice
                        </button>
                      ) : (
                        <span className="text-xs text-[#5A6A85]">No invoice available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Items</th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Reference</th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Amount</th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Status</th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Date</th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const summary = orderSummary(order.items);
                    const itemTypes = [
                      ...new Set(order.items?.map((i) => i.type) || []),
                    ];
                    const canDownload =
                      order.status === "PAID" && !!order.whmcsInvoiceId;

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 shrink-0">
                              {itemTypes.map((t) => (
                                <ItemTypeIcon key={t} type={t} />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-[#031033] truncate max-w-xs">
                              {summary}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <span className="text-sm font-mono text-[#5A6A85]">
                            {order.paystackRef || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className="text-sm font-medium text-[#031033] tabular-nums whitespace-nowrap">
                            {formatPrice(order.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-5 text-sm text-[#5A6A85] text-right tabular-nums whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-5 text-right">
                          {canDownload ? (
                            <button
                              id={`order-view-invoice-${order.id}`}
                              onClick={() => openInvoice(order.id)}
                              disabled={
                                isDownloading && downloadingId === order.id
                              }
                              title="View invoice"
                              className={`inline-flex h-8 items-center gap-1.5 px-3 text-sm font-medium text-[#031033] border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${focusCls}`}
                            >
                              {isDownloading && downloadingId === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5 text-[#5A6A85]" />
                              )}
                              Invoice
                            </button>
                          ) : (
                            <span className="text-sm text-[#5A6A85]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Help / Support Strip */}
      <div className="bg-[#E8F4FC] border border-[#1787D4]/20 rounded-lg px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[#031033]">
            Payment inquiry or missing order?
          </h4>
          <p className="text-xs text-[#5A6A85] mt-0.5">
            If you were debited but your order is still pending, contact support
            with your payment reference.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          id="orders-contact-support"
          className={`inline-flex h-8 items-center gap-1 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-white transition-colors whitespace-nowrap shrink-0 ${focusCls}`}
        >
          Contact support <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
