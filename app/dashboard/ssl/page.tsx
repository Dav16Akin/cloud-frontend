"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useGetSslCertificates, useGetSslProducts } from "@/hooks/useSsl";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface SslItem {
  id: string;
  certificate: string;
  domain: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Pending";
  expires: string;
}

export default function SslCertificatesPage() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Expiring Soon">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyDomain, setBuyDomain] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number>(41);

  const { data: liveCerts, isLoading } = useGetSslCertificates();
  const { data: products } = useGetSslProducts();
  const { addSslItem, openDrawer } = useCartStore();

  // Use only live data from API endpoint
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

  // Filter items
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

  // Metrics directly from live data
  const activeCount = certificates.filter((c) => c.status === "Active").length;
  const expiringSoonCount = certificates.filter((c) => c.status === "Expiring Soon").length;
  const expiredCount = certificates.filter((c) => c.status === "Expired").length;

  const handleOrderSsl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }
    const cleanDomain = buyDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    
    // Find price from products if available
    const prod = (products || []).find((p: any) => p.id === selectedProduct || p.productId === selectedProduct);
    const price = prod?.price || 15000;

    addSslItem({
      type: "SSL",
      domainName: cleanDomain,
      price: price,
      productId: selectedProduct,
    });
    toast.success(`SSL certificate for ${cleanDomain} added to cart`);
    setShowBuyModal(false);
    setBuyDomain("");
    openDrawer();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2
          className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          SSL Certificates
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Keep your websites protected with secure SSL certificates.
        </p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">Active</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : activeCount}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">Expiring Soon</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiringSoonCount}
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm min-h-[108px] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">Expired</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" /> : expiredCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search Bar, and Action Button */}
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
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
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
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
            />
          </div>

          {/* Get SSL Certificate */}
          <button
            type="button"
            id="btn-get-ssl-cert"
            onClick={() => setShowBuyModal(true)}
            className="px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
          >
            Get SSL Certificate
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-1">
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4]">
                        <Shield className="w-6 h-6 stroke-[2]" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
                        No SSL certificates found
                      </p>
                      <p className="text-[12.5px] text-[#6e6e73] max-w-sm">
                        {searchQuery || statusFilter !== "All"
                          ? "No certificates match your current filters."
                          : "Protect your domains and visitor trust with industry-standard SSL encryption."}
                      </p>
                      {!searchQuery && statusFilter === "All" && (
                        <button
                          type="button"
                          onClick={() => setShowBuyModal(true)}
                          className="mt-2 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
                        >
                          Get SSL Certificate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => {
                  const isExpiring = cert.status === "Expiring Soon";
                  return (
                    <tr
                      key={cert.id}
                      className="hover:bg-[#fbfcfe] transition-colors"
                    >
                      <td className="py-5 px-6">
                        <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                          {cert.certificate}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[13px] text-[#6e6e73]">
                          {cert.domain}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {cert.status === "Active" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                            Active
                          </span>
                        )}
                        {cert.status === "Expiring Soon" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef5e7] text-[#e8900a] border border-[#fde1b0]">
                            Expiring Soon
                          </span>
                        )}
                        {cert.status === "Expired" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef0f0] text-[#f56c6c] border border-[#fde2e2]">
                            Expired
                          </span>
                        )}
                        {cert.status === "Pending" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[13px] text-[#1d1d1f]">
                          {cert.expires}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {isExpiring ? (
                          <button
                            type="button"
                            onClick={() => {
                              addSslItem({
                                type: "SSL",
                                domainName: cert.domain,
                                price: 15000,
                                productId: 41,
                              });
                              toast.success(`Renewal for ${cert.domain} added to cart`);
                              openDrawer();
                            }}
                            className="inline-flex items-center justify-center px-4 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold rounded-full transition-colors active:scale-95 shadow-sm"
                          >
                            Renew
                          </button>
                        ) : (
                          <Link
                            href={`/dashboard/ssl/${encodeURIComponent(cert.id || cert.domain)}`}
                            id={`manage-ssl-${(cert.domain || cert.id).replace(/[@.]/g, "-")}`}
                            className="inline-flex items-center justify-center px-4 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold rounded-full transition-colors active:scale-95 shadow-sm"
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

      {/* Get SSL Certificate Modal */}
      {showBuyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBuyModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Get SSL Certificate
            </h3>
            <p className="text-xs text-[#6e6e73]">
              Protect your website with instant SSL/TLS encryption.
            </p>

            <form onSubmit={handleOrderSsl} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Domain Name *
                </label>
                <input
                  type="text"
                  placeholder="example.com"
                  value={buyDomain}
                  onChange={(e) => setBuyDomain(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Certificate Type
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                >
                  {products && products.length > 0 ? (
                    products.map((p: any) => (
                      <option key={p.id || p.productId} value={p.id || p.productId}>
                        {p.name || p.productName || "SSL Certificate"} — ₦{Number(p.price || 15000).toLocaleString()} / yr
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={41}>Positive SSL — ₦15,000 / yr</option>
                      <option value={42}>Positive SSL Wildcard — ₦45,000 / yr</option>
                      <option value={20}>InstantSSL — ₦35,000 / yr</option>
                      <option value={24}>EV SSL — ₦75,000 / yr</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl shadow-sm"
                >
                  Add to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
