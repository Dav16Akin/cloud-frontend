"use client";

import { useState, Suspense } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Plus,
  Copy,
  CheckCircle,
  Loader2,
  RefreshCw,
  Eye,
  Lock,
  ExternalLink,
  Clock,
  X,
  FileText,
  Download,
} from "lucide-react";
import { useGetSslCertificates, useGetSslStatus, useGetSslProducts } from "@/hooks/useSsl";
import { useCartStore } from "@/store/cartStore";
import { downloadSSLCertificateFile } from "@/lib/api";
import { toast } from "sonner";

type Tab = "certificates" | "buy";

const PRODUCT_PRICES: Record<number, { price: number; displayName: string }> = {
  41: { price: 10000, displayName: "Positive SSL" },
  42: { price: 25000, displayName: "Positive SSL Wildcard" },
  20: { price: 35000, displayName: "InstantSSL" },
  24: { price: 50000, displayName: "EV SSL" },
};

function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function SSLDashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("certificates");
  const [domainInput, setDomainInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number>(41);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: certificates, isLoading, refetch } = useGetSslCertificates();
  const { mutate: checkStatus, isPending: isCheckingStatus } = useGetSslStatus();
  const { data: products, isLoading: loadingProducts } = useGetSslProducts();
  const { addSslItem, openDrawer, hasItem } = useCartStore();

  const handleBuySSL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) {
      toast.error("Please enter a valid domain name.");
      return;
    }

    const domain = domainInput.trim().toLowerCase();
    
    // Check if domain input is valid (simple validation)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g. yourdomain.com).");
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasItem(`ssl:${domain}`)) {
        toast.info("This SSL Certificate is already in your cart.");
        openDrawer();
      } else {
        const priceInfo = PRODUCT_PRICES[selectedProductId] || { price: 10000, displayName: "Positive SSL" };
        addSslItem({
          type: "SSL",
          domainName: domain,
          price: priceInfo.price,
          productId: selectedProductId,
        });
        toast.success(`SSL Certificate (${priceInfo.displayName}) for ${domain} added to cart!`);
        setDomainInput("");
        openDrawer();
      }
    } catch (err) {
      toast.error("Failed to add SSL certificate to cart.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = (certId: string) => {
    checkStatus(certId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleViewCert = (cert: any) => {
    setSelectedCert(cert);
    setIsViewOpen(true);
  };

  const handleDownloadCert = async (cert: any) => {
    setIsDownloading(cert.id);
    try {
      const blob = await downloadSSLCertificateFile(cert.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ssl-${cert.domainName.replace(/[^a-z0-9.-]/gi, "_")}.pem`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download certificate.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#031033]">SSL Certificates</h1>
          <p className="text-[#5a6a85] text-sm mt-0.5">
            Manage your SSL security certificates or secure new domain names instantly.
          </p>
        </div>
        {activeTab !== "buy" && (
          <button
            onClick={() => setActiveTab("buy")}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto text-sm py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            Buy Standalone SSL
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2eaff]">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "certificates"
              ? "border-[#e8900a] text-[#e8900a]"
              : "border-transparent text-[#5a6a85] hover:text-[#031033]"
          }`}
        >
          My Certificates ({isLoading ? "..." : certificates?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("buy")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "buy"
              ? "border-[#e8900a] text-[#e8900a]"
              : "border-transparent text-[#5a6a85] hover:text-[#031033]"
          }`}
        >
          Buy Standalone SSL
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "certificates" && (
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-6 py-4 border-b border-[#e2eaff] flex items-center justify-between bg-[#f6f9ff]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#e8900a]" />
              <h2 className="text-sm font-semibold text-[#031033]">SSL Certificates</h2>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs text-[#5a6a85] hover:text-[#031033] flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 text-[#e8900a] animate-spin" />
              <p className="text-xs text-[#5a6a85]">Loading certificates...</p>
            </div>
          ) : !certificates || certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 bg-[#f2f5fc] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#c5cedf]" />
              </div>
              <h3 className="font-bold text-[#031033] text-sm">No SSL certificates found</h3>
              <p className="text-xs text-[#5a6a85] max-w-xs mt-1 mb-4">
                Secure your website data by purchasing a PositiveSSL certificate for any domain name.
              </p>
              <button
                onClick={() => setActiveTab("buy")}
                className="btn-primary text-xs py-2 px-4"
              >
                Buy SSL Certificate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafbff] border-b border-[#e2eaff]">
                    <th className="px-6 py-3.5 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                      Domain / Product Name
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                      Validation Method
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4fc]">
                  {certificates.map((cert: any) => (
                    <tr key={cert.id} className="hover:bg-[#fafbff] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#031033] text-sm">{cert.domainName}</span>
                          <span className="text-[10px] text-[#9ba8c0]">{cert.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 border ${
                            cert.status === "ACTIVE"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : cert.status === "PROCESSING" || cert.status === "PENDING"
                              ? "bg-amber-50 border-amber-100 text-amber-600"
                              : "bg-red-50 border-red-100 text-red-500"
                          }`}
                        >
                          {cert.status === "ACTIVE" ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          ) : cert.status === "PROCESSING" ? (
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          )}
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#5a6a85] text-xs capitalize">
                        {cert.validationMethod}
                      </td>
                      <td className="px-6 py-4 text-[#5a6a85] text-xs">
                        {formatDate(cert.expiresAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(cert.status === "PROCESSING" || cert.status === "PENDING") && (
                            <button
                              onClick={() => handleCheckStatus(cert.id)}
                              disabled={isCheckingStatus}
                              className="inline-flex items-center gap-1 py-1.5 px-3 border border-[#dce4f7] hover:border-[#e8900a] text-xs text-[#5a6a85] hover:text-[#031033] font-semibold bg-white transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? "animate-spin" : ""}`} />
                              Check Status
                            </button>
                          )}
                          {cert.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() => handleViewCert(cert)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 border border-[#dce4f7] hover:border-[#e8900a] text-xs text-[#5a6a85] hover:text-[#031033] font-semibold bg-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadCert(cert)}
                                disabled={isDownloading === cert.id}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 border border-[#dce4f7] hover:border-[#e8900a] text-xs text-[#5a6a85] hover:text-[#031033] font-semibold bg-white transition-colors disabled:opacity-50"
                              >
                                {isDownloading === cert.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "buy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-2 bg-white border border-[#e2eaff] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#031033]" />
              </div>
              <div>
                <h3 className="font-bold text-[#031033] text-base">Get Standalone SSL Certificate</h3>
                <p className="text-[#5a6a85] text-xs mt-0.5">
                  Secure any external domain or a domain registered elsewhere.
                </p>
              </div>
            </div>

            <form onSubmit={handleBuySSL} className="space-y-5">
              <div>
                <label htmlFor="domain-input" className="block text-xs font-bold text-[#031033] uppercase tracking-wide mb-2">
                  Domain Name
                </label>
                <div className="flex items-center bg-white border border-[#dce4f7] overflow-hidden focus-within:border-[#e8900a] transition-all">
                  <div className="pl-3 shrink-0">
                    <Globe className="w-4 h-4 text-[#9ba8c0]" />
                  </div>
                  <input
                    id="domain-input"
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. mybusiness.com"
                    className="w-full bg-transparent px-3 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none font-medium"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#9ba8c0] mt-1.5">
                  Do not include https:// or www. Just enter the root domain.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#031033] uppercase tracking-wide mb-2">
                  Select Certificate Type
                </label>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 text-xs text-[#5a6a85] py-6 bg-[#f6f9ff] border border-[#e2eaff] justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-[#e8900a]" />
                    Loading available products...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products?.map((prod: any) => {
                      const priceInfo = PRODUCT_PRICES[prod.id] || { price: 10000, displayName: prod.name };
                      const isSelected = selectedProductId === prod.id;
                      return (
                        <label
                          key={prod.id}
                          className={`border p-4 flex flex-col justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#e8900a] bg-[#fff8ee] ring-1 ring-[#e8900a]"
                              : "border-[#dce4f7] hover:border-[#e8900a]/50 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                name="ssl-product"
                                checked={isSelected}
                                onChange={() => setSelectedProductId(prod.id)}
                                className="w-3.5 h-3.5 mt-0.5 text-[#e8900a] border-gray-300 focus:ring-[#e8900a] accent-[#e8900a]"
                              />
                              <div>
                                <p className="text-xs font-bold text-[#031033]">{prod.name}</p>
                                <p className="text-[10px] text-[#5a6a85] mt-0.5 capitalize">
                                  {prod.validationMethod} validation · {prod.deliveryTime}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-[#031033] shrink-0">
                              {formatNGN(priceInfo.price)}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !domainInput.trim()}
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Add SSL Certificate to Cart
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Pricing Info / Sidebar */}
          <div className="bg-[#f6f9ff] border border-[#dce4f7] p-5 space-y-4">
            <h4 className="font-bold text-[#031033] text-sm flex items-center gap-2 border-b border-[#e2eaff] pb-3">
              <Lock className="w-4 h-4 text-[#e8900a]" />
              Why SSL is mandatory
            </h4>
            <ul className="space-y-3.5 text-xs text-[#5a6a85]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#e8900a] rounded-full shrink-0 mt-1.5" />
                <span>
                  <strong>Data Encryption:</strong> Encrypts sensitive data transmitted between browser and server, securing logins and credit card entries.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#e8900a] rounded-full shrink-0 mt-1.5" />
                <span>
                  <strong>SEO Ranking Boost:</strong> Search engines like Google give higher ranking preference to HTTPS secured domains.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#e8900a] rounded-full shrink-0 mt-1.5" />
                <span>
                  <strong>Trust Badges:</strong> Displays a secure padlock symbol in the address bar, assuring visitors your site is safe.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* View Certificate PEM Modal */}
      {isViewOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
          <div
            className="bg-white border border-[#e2eaff] max-w-2xl w-full max-h-[85vh] flex flex-col relative z-10 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2eaff] bg-[#f6f9ff]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#e8900a]" />
                <h3 className="font-bold text-[#031033] text-sm">
                  SSL Certificate Code — {selectedCert.domainName}
                </h3>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-[#9ba8c0] hover:text-[#031033] transition-colors hover:bg-[#e2eaff]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <p className="text-xs text-[#9ba8c0] mb-2 uppercase tracking-wide font-bold">Certificate Details</p>
                <div className="grid grid-cols-2 gap-3 bg-[#f6f9ff] border border-[#e2eaff] p-3 text-xs">
                  <div>
                    <span className="text-[#9ba8c0]">Domain: </span>
                    <span className="font-bold text-[#031033]">{selectedCert.domainName}</span>
                  </div>
                  <div>
                    <span className="text-[#9ba8c0]">Product: </span>
                    <span className="font-bold text-[#031033]">{selectedCert.productName}</span>
                  </div>
                  <div>
                    <span className="text-[#9ba8c0]">Issued Date: </span>
                    <span className="font-bold text-[#031033]">{formatDate(selectedCert.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[#9ba8c0]">Expiry Date: </span>
                    <span className="font-bold text-[#031033]">{formatDate(selectedCert.expiresAt)}</span>
                  </div>
                </div>
              </div>

              {selectedCert.certificate && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#9ba8c0] uppercase tracking-wide font-bold">Certificate PEM (CRT)</p>
                    <button
                      onClick={() => handleCopyText(selectedCert.certificate, "Certificate Code")}
                      className="text-xs text-[#e8900a] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      Copy CRT
                    </button>
                  </div>
                  <pre className="p-4 bg-gray-50 border border-gray-200 text-[10px] font-mono text-gray-700 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                    {selectedCert.certificate}
                  </pre>
                </div>
              )}

              {selectedCert.privateKey && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#9ba8c0] uppercase tracking-wide font-bold">Private Key (KEY)</p>
                    <button
                      onClick={() => handleCopyText(selectedCert.privateKey, "Private Key")}
                      className="text-xs text-[#e8900a] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      Copy KEY
                    </button>
                  </div>
                  <pre className="p-4 bg-gray-50 border border-gray-200 text-[10px] font-mono text-gray-700 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                    {selectedCert.privateKey}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#e2eaff] px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="py-2 px-5 text-xs font-semibold bg-white border border-[#dce4f7] text-[#5a6a85] hover:text-[#031033] hover:bg-[#f6f9ff] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SSLDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#e8900a]" />
        </div>
      }
    >
      <SSLDashboardContent />
    </Suspense>
  );
}
