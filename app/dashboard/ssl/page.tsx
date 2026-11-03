"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useGetSslCertificates } from "@/hooks/useSsl";
import SslPurchaseWizard from "@/components/dashboard/SslPurchaseWizard";

interface SslItem {
  id: string;
  certificate: string;
  domain: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Pending";
  expires: string;
}

function SslPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "order" ? "order" : "overview";

  const [activeTab, setActiveTab] = useState<"overview" | "order">(initialTab);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Expiring Soon">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: liveCerts, isLoading } = useGetSslCertificates();

  // If redirected with domain or product, switch to order wizard
  useEffect(() => {
    const domain = searchParams.get("domain");
    const product = searchParams.get("product");
    if (domain || product) {
      setActiveTab("order");
    }
  }, [searchParams]);

  // Existing user certificates strictly from API
  const certificates: SslItem[] = useMemo(() => {
    if (!liveCerts || !Array.isArray(liveCerts)) {
      return [];
    }
    return liveCerts.map((c: any) => {
      let st: SslItem["status"] = "Active";
      const statusUpper = (c.status as string)?.toUpperCase();
      if (statusUpper === "EXPIRED") st = "Expired";
      else if (statusUpper === "PENDING" || statusUpper === "PROCESSING") st = "Pending";

      let expStr = "—";
      if (c.expiresAt) {
        const d = new Date(c.expiresAt);
        expStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 30 && diffDays > 0) st = "Expiring Soon";
      }

      return {
        id: c.id,
        certificate: c.productName || "SSL Certificate",
        domain: c.domainName || "—",
        status: st,
        expires: expStr,
      };
    });
  }, [liveCerts]);

  // Filter items in Orders overview
  const filteredCerts = useMemo(() => {
    return certificates.filter((c) => {
      const matchesFilter =
        statusFilter === "All" ||
        (statusFilter === "Active" && c.status === "Active") ||
        (statusFilter === "Expiring Soon" && c.status === "Expiring Soon");

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.domain.toLowerCase().includes(q) ||
        c.certificate.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [certificates, statusFilter, searchQuery]);

  // Metrics
  const activeCount = certificates.filter((c) => c.status === "Active").length;
  const expiringSoonCount = certificates.filter((c) => c.status === "Expiring Soon").length;
  const expiredCount = certificates.filter((c) => c.status === "Expired").length;

  // If in "order" mode, display the 7-step wizard directly
  if (activeTab === "order") {
    return (
      <SslPurchaseWizard
        onBack={() => setActiveTab("overview")}
        initialDomain={searchParams.get("domain") || ""}
        initialProductId={searchParams.get("product") ? Number(searchParams.get("product")) : undefined}
      />
    );
  }

  const statusLabel = (s: string) => (s === "Expiring Soon" ? "Expiring soon" : s);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">SSL certificates</h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Manage installed certificates or order a new SSL/TLS certificate.
          </p>
        </div>

        {/* Quick action button */}
        <button
          type="button"
          id="btn-header-order-ssl"
          onClick={() => setActiveTab("order")}
          className="inline-flex h-9 items-center gap-2 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          <Plus className="w-4 h-4" />
          Order new certificate
        </button>
      </div>

      {/* Tabs / Sub-Navigation */}
      <div className="flex border-b border-[#E2E8F0] gap-8">
        <button
          type="button"
          id="tab-orders-overview"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === "overview"
              ? "text-[#031033]"
              : "text-[#5A6A85] hover:text-[#031033]"
          }`}
        >
          Orders overview
          <span className="ml-1.5 text-[#5A6A85] font-normal tabular-nums">
            {isLoading ? "…" : certificates.length}
          </span>
          {activeTab === "overview" && (
            <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#1787D4]" />
          )}
        </button>

        <button
          type="button"
          id="tab-order-new-certificate"
          onClick={() => setActiveTab("order")}
          className="pb-3 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors relative cursor-pointer"
        >
          Order new certificate
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB: ORDERS OVERVIEW (Existing User Certificates)
         ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Stat row: one container split by hairlines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#EEF2F7]">
          {[
            { label: "Active", value: activeCount },
            { label: "Expiring soon", value: expiringSoonCount },
            { label: "Expired", value: expiredCount },
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

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 self-start rounded-lg bg-[#F2F5FC] p-1">
            {(["All", "Active", "Expiring Soon"] as const).map((filter) => {
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  id={`btn-ssl-filter-${filter.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`h-7 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  {statusLabel(filter)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-1 sm:justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search certificates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Certificate</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Domain</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">Status</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Expires</th>
                  <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i} className="border-b border-[#EEF2F7] last:border-0">
                      <td className="py-3 px-5"><span className="block h-4 w-32 animate-pulse rounded bg-[#EEF2F7]" /></td>
                      <td className="py-3 px-5"><span className="block h-4 w-40 animate-pulse rounded bg-[#EEF2F7]" /></td>
                      <td className="py-3 px-5"><span className="block h-5 w-16 animate-pulse rounded-full bg-[#EEF2F7]" /></td>
                      <td className="py-3 px-5"><span className="ml-auto block h-4 w-24 animate-pulse rounded bg-[#EEF2F7]" /></td>
                      <td className="py-3 px-5"><span className="ml-auto block h-8 w-20 animate-pulse rounded-lg bg-[#EEF2F7]" /></td>
                    </tr>
                  ))
                ) : filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-5 text-center">
                      <p className="text-sm text-[#5A6A85]">
                        No SSL certificates yet. Order one to secure your site over HTTPS.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("order")}
                        className="mt-4 inline-flex h-9 items-center gap-2 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                      >
                        Order new certificate
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => {
                    const isActive = cert.status === "Active";
                    const isExpiring = cert.status === "Expiring Soon";
                    const isExpired = cert.status === "Expired";

                    return (
                      <tr
                        key={cert.id}
                        className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm font-medium text-[#031033]">
                          {cert.certificate}
                        </td>
                        <td className="py-3 px-5 text-sm text-[#5A6A85]">
                          {cert.domain}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`inline-flex items-center gap-2 whitespace-nowrap text-sm ${
                              isExpired ? "text-[#C21F1F]" : "text-[#031033]"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                isActive
                                  ? "bg-[#12A150]"
                                  : isExpiring
                                  ? "bg-[#E8900A]"
                                  : isExpired
                                  ? "bg-[#DC2626]"
                                  : "bg-[#1787D4]"
                              }`}
                            />
                            {statusLabel(cert.status)}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-sm text-[#5A6A85] text-right tabular-nums whitespace-nowrap">
                          {cert.expires}
                        </td>
                        <td className="py-3 px-5 text-right">
                          {isExpired ? (
                            <Link
                              href={`/dashboard/ssl/purchase?domain=${encodeURIComponent(cert.domain)}`}
                              className="inline-flex h-8 items-center gap-1.5 px-3 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#1787D4] text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              Renew
                            </Link>
                          ) : cert.status === "Pending" ? (
                            <Link
                              href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                              className="inline-flex h-8 items-center gap-1.5 px-3 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#9A5B00]" />
                              Verify DNS
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                              className="inline-flex h-8 items-center gap-1.5 px-3 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors"
                            >
                              Manage
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SslCertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading SSL certificates…</p>
        </div>
      }
    >
      <SslPageContent />
    </Suspense>
  );
}
