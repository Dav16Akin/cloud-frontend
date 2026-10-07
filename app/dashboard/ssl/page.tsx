"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Shield,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            SSL certificates
          </h1>
          <p className="text-[14px] mt-0.5 text-[#6e6e73]">
            Manage installed certificates or order new high-assurance SSL/TLS encryption.
          </p>
        </div>

        {/* Quick action button */}
        <button
          type="button"
          id="btn-header-order-ssl"
          onClick={() => setActiveTab("order")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Order new certificate
        </button>
      </div>

      {/* Tabs / Sub-Navigation */}
      <div className="flex border-b border-[#e2eaff] gap-8">
        <button
          type="button"
          id="tab-orders-overview"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-[14px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === "overview"
              ? "text-[#1787D4]"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          Orders overview
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#f0f4f9] text-[#5a6a85] font-medium">
            {isLoading ? "…" : certificates.length}
          </span>
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1787D4] rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          id="tab-order-new-certificate"
          onClick={() => setActiveTab("order")}
          className="pb-3 text-[14px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors relative cursor-pointer"
        >
          Order new certificate
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB: ORDERS OVERVIEW (Existing User Certificates)
         ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active */}
          <div className="bg-white rounded-lg border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-[#6e6e73]">Active</span>
            <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : activeCount}
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-lg border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-[#6e6e73]">Expiring Soon</span>
            <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiringSoonCount}
            </div>
          </div>

          {/* Expired */}
          <div className="bg-white rounded-lg border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
            <span className="text-[13px] font-medium text-[#6e6e73]">Expired</span>
            <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiredCount}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {(["All", "Active", "Expiring Soon"] as const).map((filter) => {
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  id={`btn-ssl-filter-${filter.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#1787D4] text-white shadow-sm"
                      : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-1 sm:justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-lg text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white rounded-lg border border-[#e2eaff] shadow-sm overflow-hidden mt-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Certificate
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Domain
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Expires
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f5fc]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[13.5px] text-[#6e6e73]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
                        <span>Loading SSL certificates…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-lg bg-[#eff6fc] flex items-center justify-center text-[#1787D4]">
                          <Shield className="w-6 h-6 stroke-[2]" />
                        </div>
                        <p className="text-[14.5px] font-bold text-[#1d1d1f] mt-1">
                          No SSL certificates found
                        </p>
                        <p className="text-[13px] text-[#6e6e73] text-center">
                          Protect your websites with instant SSL/TLS certificates.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("order")}
                          className="mt-3 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                          Order New Certificate
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
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
                        className="hover:bg-[#fbfcfe] transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-[13.5px] font-semibold text-[#1d1d1f]">
                          {cert.certificate}
                        </td>
                        <td className="py-4 px-6 text-[13.5px] text-[#1d1d1f] font-mono">
                          {cert.domain}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                              isActive
                                ? "bg-[#eaf8ee] text-[#1e824c]"
                                : isExpiring
                                ? "bg-[#fff8ea] text-[#b37400]"
                                : isExpired
                                ? "bg-[#fdeaea] text-[#d92d20]"
                                : "bg-[#eff6fc] text-[#1787D4]"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isExpiring ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : isExpired ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                            )}
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[13.5px] text-[#6e6e73]">
                          {cert.expires}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isExpired ? (
                            <Link
                              href={`/dashboard/ssl/purchase?domain=${encodeURIComponent(cert.domain)}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                              Renew
                            </Link>
                          ) : cert.status === "Pending" ? (
                            <Link
                              href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[12.5px] font-bold rounded-lg transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                              Verify DNS
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#e2eaff] hover:bg-[#f2f5fc] text-[#1787D4] text-[12.5px] font-semibold rounded-lg transition-colors"
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading SSL certificates…</p>
        </div>
      }
    >
      <SslPageContent />
    </Suspense>
  );
}
