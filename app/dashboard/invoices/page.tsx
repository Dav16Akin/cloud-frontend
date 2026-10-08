"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Receipt,
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
        const cutoff = Date.parse("2026-10-07T23:59:59Z") - daysLimit * 24 * 60 * 60 * 1000;
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
  }, [invoices, statusFilter, dateRange, searchQuery]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
          style={{ letterSpacing: "-0.4px" }}
        >
          Invoices
        </h1>
        <p className="text-[13.5px] text-[#6e6e73] mt-0.5">
          View, download, and keep track of invoices for your Nupat Cloud services.
        </p>
      </div>

      {/* ── Top Filters & Search Row (Matches Screen 1) ────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="input-search-invoices"
            placeholder="Search invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
          />
        </div>

        {/* Date range dropdown */}
        <div className="relative shrink-0">
          <select
            id="select-invoice-date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "30" | "7" | "90" | "all")}
            className="appearance-none bg-white border border-[#e2eaff] rounded-xl px-4 py-2.5 pr-9 text-[13px] font-medium text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] cursor-pointer shadow-sm"
          >
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#6e6e73] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status dropdown */}
        <div className="relative shrink-0">
          <select
            id="select-invoice-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusTab)}
            className="appearance-none bg-white border border-[#e2eaff] rounded-xl px-4 py-2.5 pr-9 text-[13px] font-medium text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] cursor-pointer shadow-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#6e6e73] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── Filter Pills (All, Paid, Pending, Failed, Refunded) ────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#1787D4] text-white shadow-xs font-semibold"
                  : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:text-[#1d1d1f] hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#1787D4]" />
          <p className="text-[13px] text-[#6e6e73]">Loading invoices…</p>
        </div>
      ) : invoices.length === 0 ? (
        /* ── Screen 5: Empty State (No invoices yet) ──────────────────── */
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center border border-[#b8ece5]">
              <Receipt className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">
                No invoices yet
              </h2>
              <p className="text-[13px] text-[#6e6e73] mt-1 max-w-md mx-auto leading-relaxed">
                Your invoices will appear here after you purchase a domain, hosting, email, SSL certificate, or other services.
              </p>
            </div>

            <Link
              href="/dashboard/hosting/purchase"
              className="mt-2 inline-flex items-center px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs"
            >
              Explore Services
            </Link>
          </div>

          {/* 3 Quick Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/domains?tab=register"
              className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs hover:border-[#1787D4] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-[#1787D4] transition-colors">
                    Domains
                  </h3>
                  <p className="text-[12px] text-[#6e6e73] mt-0.5">
                    Find the right address for your next idea.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/hosting/purchase"
              className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs hover:border-[#1787D4] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-[#1787D4] transition-colors">
                    Web Hosting
                  </h3>
                  <p className="text-[12px] text-[#6e6e73] mt-0.5">
                    Fast, reliable hosting built to scale.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/ssl/purchase"
              className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs hover:border-[#1787D4] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#4AC3B4] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-[#1787D4] transition-colors">
                    SSL Security
                  </h3>
                  <p className="text-[12px] text-[#6e6e73] mt-0.5">
                    Protect your website and customers.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        /* Empty search results */
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-12 text-center shadow-xs">
          <p className="text-[14.5px] font-bold text-[#1d1d1f]">
            No invoices match your filter
          </p>
          <p className="text-[12.5px] text-[#6e6e73] mt-1">
            Try adjusting your search query, status, or date range.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setDateRange("all");
            }}
            className="mt-3 px-4 py-2 bg-[#1787D4] text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* ── Screen 1: Invoices Table ─────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f0f4f9] bg-[#fbfcfe]">
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f5fc]">
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

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#fbfcfe] transition-colors"
                    >
                      <td className="py-4 px-6 text-[13.5px] font-bold text-[#1d1d1f]">
                        <Link
                          href={`/dashboard/invoices/${encodeURIComponent(inv.id)}`}
                          className="hover:text-[#1787D4] transition-colors"
                        >
                          {invNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#6e6e73]">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#5a6a85] font-medium">
                        {serviceLabel}
                      </td>
                      <td className="py-4 px-6 text-[13.5px] font-bold text-[#1d1d1f]">
                        {formatPrice(inv.amount)}
                      </td>
                      <td className="py-4 px-6">
                        {isPaid && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                            Paid
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                            Failed
                          </span>
                        )}
                        {!isPaid && !isPending && !isFailed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            Refunded
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/dashboard/invoices/${encodeURIComponent(inv.id)}`}
                          className="text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
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

          {/* Table pagination/footer matching screenshot */}
          <div className="px-6 py-3.5 bg-[#fbfcfe] border-t border-[#f0f4f9] flex items-center justify-between text-[12px] text-[#6e6e73]">
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading invoices…</p>
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
