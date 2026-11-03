"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Server,
  Shield,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useGetInvoices } from "@/hooks/useInvoices";
import type { Invoice } from "@/lib/api";

type StatusTab = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

function formatPrice(n: number) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

export function formatInvoiceNumber(invoice: Invoice): string {
  if (invoice.whmcsInvoiceId) {
    const year = invoice.createdAt
      ? new Date(invoice.createdAt).getFullYear()
      : new Date().getFullYear();
    return `INV-${year}-${String(invoice.whmcsInvoiceId).padStart(5, "0")}`;
  }
  return invoice.id;
}

export function getInvoiceServiceLabel(invoice: Invoice): string {
  const desc = (invoice.description || "").toLowerCase();
  if (
    desc.includes("hosting") ||
    desc.includes("cpanel") ||
    desc.includes("vps") ||
    desc.includes("server")
  ) {
    return "Web Hosting";
  }
  if (desc.includes("ssl") || desc.includes("certificate")) {
    return "SSL Certificate";
  }
  if (
    desc.includes("domain") ||
    desc.includes("registration") ||
    desc.includes(".com") ||
    desc.includes(".ng")
  ) {
    return "Domain Registration";
  }
  return invoice.description || "Cloud Service";
}

function InvoicesContent() {
  const { data: invoices = [], isLoading } = useGetInvoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("ALL");
  const [dateRange, setDateRange] = useState<"30" | "7" | "90" | "all">("30");
  // Reference "now" for the date-range filter, captured once on mount.
  const [nowMs] = useState(() => Date.now());

  // Filtering invoices by status, search, and date range
  const filteredInvoices = useMemo(() => {
    const daysLimit = dateRange === "all" ? null : Number(dateRange);
    return invoices.filter((inv) => {
      // 1. Status Filter
      if (statusFilter !== "ALL") {
        const invStatus = (inv.status || "PENDING").toUpperCase();
        if (statusFilter === "PAID" && !(invStatus === "PAID" || inv.isPaid)) {
          return false;
        }
        if (statusFilter === "PENDING" && invStatus !== "PENDING") return false;
        if (statusFilter === "FAILED" && invStatus !== "FAILED") return false;
        if (statusFilter === "REFUNDED" && invStatus !== "REFUNDED") return false;
      }

      // 2. Date Range Filter
      if (daysLimit !== null && inv.createdAt) {
        const invTime = new Date(inv.createdAt).getTime();
        const cutoff = nowMs - daysLimit * 24 * 60 * 60 * 1000;
        if (invTime < cutoff) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const invNum = formatInvoiceNumber(inv).toLowerCase();
        const desc = (inv.description || "").toLowerCase();
        const srv = getInvoiceServiceLabel(inv).toLowerCase();
        const match =
          invNum.includes(q) ||
          desc.includes(q) ||
          srv.includes(q) ||
          String(inv.amount).includes(q) ||
          inv.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [invoices, statusFilter, dateRange, searchQuery, nowMs]);

  const controlCls =
    "h-9 appearance-none bg-white border border-[#D5DCE6] rounded-lg pl-3 pr-9 text-sm text-[#031033] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 cursor-pointer";
  const serviceCards = [
    { href: "/dashboard/domains?tab=register", Icon: Globe, title: "Domains", body: "Find the right address for your next idea." },
    { href: "/dashboard/hosting/purchase", Icon: Server, title: "Web hosting", body: "Hosting plans that grow with your site." },
    { href: "/dashboard/ssl/purchase", Icon: Shield, title: "SSL security", body: "Serve your website over HTTPS." },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">Invoices</h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          View, download, and keep track of invoices for your Nupat Cloud services.
        </p>
      </div>

      {/* ── Top Filters & Search Row ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="input-search-invoices"
            placeholder="Search invoice number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
        </div>

        {/* Date range dropdown */}
        <div className="relative shrink-0">
          <select
            id="select-invoice-date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "30" | "7" | "90" | "all")}
            className={`w-full ${controlCls}`}
          >
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#5A6A85] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status dropdown */}
        <div className="relative shrink-0">
          <select
            id="select-invoice-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusTab)}
            className={`w-full ${controlCls}`}
          >
            <option value="ALL">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#5A6A85] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Status segmented control (All, Paid, Pending, Failed, Refunded) ── */}
      <div className="overflow-x-auto">
        <div className="inline-flex items-center gap-1 rounded-lg bg-[#F2F5FC] p-1">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "PAID", label: "Paid" },
              { id: "PENDING", label: "Pending" },
              { id: "FAILED", label: "Failed" },
              { id: "REFUNDED", label: "Refunded" },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`pill-filter-${tab.id.toLowerCase()}`}
                onClick={() => setStatusFilter(tab.id)}
                className={`h-7 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-[#031033] shadow-sm"
                    : "text-[#5A6A85] hover:text-[#031033]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="border-b border-[#E2E8F0] px-5 py-3 flex gap-8">
            {["Invoice", "Date", "Service", "Amount", "Status"].map((h) => (
              <span key={h} className="text-xs font-medium text-[#5A6A85]">{h}</span>
            ))}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-3.5 border-b border-[#EEF2F7] last:border-0 flex items-center gap-8">
              <span className="block h-4 w-28 animate-pulse rounded bg-[#EEF2F7]" />
              <span className="block h-4 w-24 animate-pulse rounded bg-[#EEF2F7]" />
              <span className="block h-4 w-32 animate-pulse rounded bg-[#EEF2F7]" />
              <span className="ml-auto block h-4 w-20 animate-pulse rounded bg-[#EEF2F7]" />
              <span className="block h-5 w-14 animate-pulse rounded-full bg-[#EEF2F7]" />
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        /* ── Empty State (No invoices yet) ──────────────────────────────── */
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-12 text-center flex flex-col items-center justify-center gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#031033]">No invoices yet</h2>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-md mx-auto">
                Invoices appear here after you buy a domain, hosting, email, an SSL certificate, or another service.
              </p>
            </div>

            <Link
              href="/dashboard/hosting/purchase"
              className="inline-flex h-9 items-center px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Explore services
            </Link>
          </div>

          {/* 3 Quick Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceCards.map(({ href, Icon, title, body }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#D5DCE6] hover:bg-[#F2F5FC]/60 transition-colors group flex items-start gap-3"
              >
                <Icon className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-[#031033] group-hover:text-[#1787D4] transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">{body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        /* Empty search results */
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-12 text-center">
          <p className="text-sm font-medium text-[#031033]">No invoices match your filters</p>
          <p className="text-xs text-[#5A6A85] mt-1">
            Try a different search, status, or date range.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setDateRange("all");
            }}
            className="mt-4 inline-flex h-8 items-center px-3 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Reset filters
          </button>
        </div>
      ) : (
        /* ── Invoices Table ───────────────────────────────────────────── */
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Invoice</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Date</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Service</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Amount</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Status</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const invNumber = formatInvoiceNumber(inv);
                  const serviceLabel = getInvoiceServiceLabel(inv);
                  const dateStr = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const isPaid = inv.status === "PAID" || inv.isPaid;
                  const isPending = inv.status === "PENDING" && !inv.isPaid;
                  const isFailed = inv.status === "FAILED";
                  const pill = "inline-flex items-center gap-2 whitespace-nowrap text-sm";

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                    >
                      <td className="py-3 px-5 text-sm font-medium text-[#031033] font-mono whitespace-nowrap">
                        <Link
                          href={`/dashboard/invoices/${encodeURIComponent(inv.id)}`}
                          className="hover:text-[#1787D4] transition-colors"
                        >
                          {invNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-5 text-sm text-[#5A6A85] tabular-nums whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-5 text-sm text-[#5A6A85]">
                        {serviceLabel}
                      </td>
                      <td className="py-3 px-5 text-sm font-medium text-[#031033] text-right tabular-nums whitespace-nowrap">
                        {formatPrice(inv.amount)}
                      </td>
                      <td className="py-3 px-5">
                        {isPaid && <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />Paid</span>}
                        {isPending && <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#E8900A]" />Pending</span>}
                        {isFailed && <span className={`${pill} text-[#C21F1F]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />Failed</span>}
                        {!isPaid && !isPending && !isFailed && (
                          <span className={`${pill} text-[#031033]`}><span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#9AA6B8]" />Refunded</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Link
                          href={`/dashboard/invoices/${encodeURIComponent(inv.id)}`}
                          className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] cursor-pointer"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-[#EEF2F7] flex items-center justify-between text-xs text-[#5A6A85] tabular-nums">
            <span>
              Showing {filteredInvoices.length} invoice
              {filteredInvoices.length === 1 ? "" : "s"}
            </span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading invoices…</p>
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
