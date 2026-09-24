"use client";

import { useState, useMemo } from "react";
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
  ExternalLink,
  Loader2,
  Search,
  Plus,
} from "lucide-react";
import { useGetOrders, useGetInvoiceLink } from "@/hooks/useOrders";
import type { Order, OrderItem, OrderStatus } from "@/lib/api";

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
      return `SSL (${i.domainName ?? ""})`;
    })
    .join(", ");
}

function ItemTypeIcon({ type }: { type: OrderItem["type"] }) {
  if (type === "HOSTING")
    return <Server className="w-3.5 h-3.5 text-[#1787D4]" />;
  if (type === "DOMAIN")
    return <Globe className="w-3.5 h-3.5 text-[#1787D4]" />;
  return <Shield className="w-3.5 h-3.5 text-[#1787D4]" />;
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#eff6fb] text-[#1787D4]">
        Paid
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="text-[12px] font-semibold text-orange-600">
        Pending
      </span>
    );
  }
  return (
    <span className="text-[12px] font-semibold text-red-600">
      Failed
    </span>
  );
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            Orders
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Track your payment transactions and automatically provisioned services.
          </p>
        </div>

        <Link
          href="/dashboard/hosting"
          id="orders-new-order"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 shadow-sm self-start sm:self-auto active:scale-95 shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Total Orders
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              totalOrders
            )}
          </div>
        </div>

        {/* Paid Orders */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Completed (Paid)
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              paidCount
            )}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Pending / In Review
          </span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            ) : (
              pendingCount
            )}
          </div>
        </div>
      </div>

      {/* Filter Row: Pills + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => setStatusFilter(val as any)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#1787D4] text-white shadow-xs"
                    : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:bg-[#f8fafc]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ref or item…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-1">
        <div className="px-6 py-4 border-b border-[#eef2f8] bg-[#fbfcfe] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#1787D4]" />
            <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
              Payment History
            </h3>
            {hasOrders && (
              <span className="text-[11px] font-bold bg-[#eff6fc] text-[#1787D4] border border-[#d6eaf8] px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
            <p className="text-[13px] text-[#6e6e73]">Loading your orders…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-[14px] font-semibold text-red-600">
              Could not load your orders.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-semibold text-[#1787D4] hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4] mb-2">
              <Receipt className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              No orders found
            </p>
            <p className="text-[12.5px] text-[#6e6e73] max-w-sm mt-0.5">
              {searchQuery || statusFilter !== "All"
                ? "No transactions match your current filters."
                : "You have not placed any orders yet. Purchase a domain or hosting plan to get started."}
            </p>
            {!searchQuery && statusFilter === "All" && (
              <Link
                href="/dashboard/hosting"
                className="mt-3 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
              >
                Browse Services
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View: Touch-Friendly Cards */}
            <div className="md:hidden divide-y divide-[#f2f5fc]">
              {filteredOrders.map((order) => {
                const summary = orderSummary(order.items);
                const itemTypes = [
                  ...new Set(order.items?.map((i) => i.type) || []),
                ];
                const canDownload =
                  order.status === "PAID" && !!order.whmcsInvoiceId;

                return (
                  <div key={order.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          {itemTypes.map((t) => (
                            <ItemTypeIcon key={t} type={t} />
                          ))}
                        </div>
                        <span className="text-[13.5px] font-bold text-[#1d1d1f] truncate">
                          {summary}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                      <div>
                        <span className="text-[#6e6e73] block text-[11px]">Amount</span>
                        <span className="font-bold text-[#1d1d1f] text-[13px]">
                          {formatPrice(order.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6e6e73] block text-[11px]">Date</span>
                        <span className="text-[#1d1d1f]">{formatDate(order.createdAt)}</span>
                      </div>
                      {order.paystackRef && (
                        <div className="col-span-2 pt-1.5 border-t border-[#eef2f8] flex items-center justify-between gap-2">
                          <span className="text-[#6e6e73] text-[11px] shrink-0">Ref:</span>
                          <span className="font-mono text-[#6e6e73] text-[11px] truncate">
                            {order.paystackRef}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      {canDownload ? (
                        <button
                          id={`order-view-invoice-mobile-${order.id}`}
                          onClick={() => openInvoice(order.id)}
                          disabled={
                            isDownloading && downloadingId === order.id
                          }
                          className="w-full inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] bg-[#eff6fc] hover:bg-[#e4f0fa] py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDownloading && downloadingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5" />
                          )}
                          View Invoice
                        </button>
                      ) : (
                        <span className="text-[11.5px] text-[#9ba8c0] italic">No invoice available</span>
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
                  <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Items
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Reference
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Date
                    </th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
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
                        className="hover:bg-[#fbfcfe] transition-colors"
                      >
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 shrink-0">
                              {itemTypes.map((t) => (
                                <ItemTypeIcon key={t} type={t} />
                              ))}
                            </div>
                            <span className="text-[13.5px] font-bold text-[#1d1d1f] truncate max-w-xs">
                              {summary}
                            </span>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="text-[12px] font-mono text-[#6e6e73]">
                            {order.paystackRef || "—"}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                            {formatPrice(order.amount)}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-4.5 px-6 text-[12.5px] text-[#6e6e73]">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          {canDownload ? (
                            <button
                              id={`order-view-invoice-${order.id}`}
                              onClick={() => openInvoice(order.id)}
                              disabled={
                                isDownloading && downloadingId === order.id
                              }
                              title="View Invoice"
                              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1787D4] hover:text-[#1371B5] bg-[#eff6fc] hover:bg-[#e4f0fa] px-3 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isDownloading && downloadingId === order.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ExternalLink className="w-3 h-3" />
                              )}
                              Invoice
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#9ba8c0]">—</span>
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
      <div className="bg-[#eff6fb] border border-[#d3e7f8] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-[14px] font-bold text-[#1d1d1f]">
            Payment inquiry or missing order?
          </h4>
          <p className="text-[12.5px] text-[#4b5563] mt-0.5">
            If your funds were debited but your order remains pending, please
            contact support with your payment reference.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          id="orders-contact-support"
          className="text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] whitespace-nowrap inline-flex items-center gap-1 shrink-0"
        >
          Contact Support <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
