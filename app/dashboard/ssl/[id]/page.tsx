"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Download,
  Loader2,
} from "lucide-react";
import {
  useGetSslCertificateDetails,
  useDownloadSslCertificate,
} from "@/hooks/useSsl";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export default function CertificateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const certParam = decodeURIComponent(resolvedParams.id);

  const [showTechnicalModal, setShowTechnicalModal] = useState(false);
  const { addSslItem, openDrawer } = useCartStore();

  const { data: cert, isLoading, isError } = useGetSslCertificateDetails(certParam);
  const { mutate: downloadCert, isPending: isDownloading } = useDownloadSslCertificate();

  const domainName = cert?.domainName || certParam;
  const certType = cert?.productName || "SSL Certificate";
  const rawStatus = (cert?.status as string)?.toUpperCase() || "ACTIVE";

  const isExpired = rawStatus === "EXPIRED";
  const isPending = rawStatus === "PENDING" || rawStatus === "PROCESSING";
  const isActive = rawStatus === "ACTIVE";

  const issuedDate = (cert as any)?.createdAt
    ? new Date((cert as any).createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const expiryDate = cert?.expiresAt
    ? new Date(cert.expiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const handleRenew = () => {
    addSslItem({
      type: "SSL",
      domainName: domainName,
      price: 15000,
      productId: (cert as any)?.productId || 41,
    });
    toast.success(`SSL certificate renewal for ${domainName} added to cart`);
    openDrawer();
  };

  const handleDownload = () => {
    if (!cert?.id && !certParam) {
      toast.error("Certificate ID unavailable for download");
      return;
    }
    downloadCert({
      id: cert?.id || certParam,
      domainName: domainName,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#6e6e73]">Loading certificate details…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/ssl"
          id="btn-back-ssl"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to SSL Certificates
        </Link>
      </div>

      {/* Header with Title and Status Badge */}
      <div className="flex items-center gap-3">
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Certificate Details
        </h2>
        {isActive && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
            Active
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending Issuance
          </span>
        )}
        {isExpired && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-red-50 text-red-600 border border-red-200">
            Expired
          </span>
        )}
      </div>

      {/* Main Grid: General Information & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-1">
        {/* Left Column (8 cols): General Information */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h3 className="text-[16px] font-bold text-[#1d1d1f]">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Domain */}
            <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
              <span className="text-[12px] font-medium text-[#6e6e73] block">
                Domain
              </span>
              <span className="text-[14.5px] font-bold text-[#1d1d1f] mt-1 block">
                {domainName}
              </span>
            </div>

            {/* Certificate Type */}
            <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
              <span className="text-[12px] font-medium text-[#6e6e73] block">
                Certificate Type
              </span>
              <span className="text-[14.5px] font-bold text-[#1d1d1f] mt-1 block">
                {certType}
              </span>
            </div>

            {/* Issued Date */}
            <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
              <span className="text-[12px] font-medium text-[#6e6e73] block">
                Issued Date
              </span>
              <span className="text-[14px] font-bold text-[#1d1d1f] mt-1 block">
                {issuedDate}
              </span>
            </div>

            {/* Expiry Date */}
            <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
              <span className="text-[12px] font-medium text-[#6e6e73] block">
                Expiry Date
              </span>
              <span className="text-[14px] font-bold text-[#1d1d1f] mt-1 block">
                {expiryDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Operations */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">
            Quick Operations
          </h3>

          {/* Renew Button */}
          <button
            type="button"
            id="op-renew-ssl"
            onClick={handleRenew}
            className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors text-center shadow-sm active:scale-98"
          >
            Renew
          </button>

          {/* Download Certificate Button */}
          <button
            type="button"
            id="op-download-ssl"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
            ) : (
              <Download className="w-4 h-4 text-[#1787D4]" />
            )}
            Download Certificate (.crt)
          </button>

          {/* View Details Button */}
          <button
            type="button"
            id="op-view-ssl-details"
            onClick={() => setShowTechnicalModal(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#5a6a85] text-[13px] font-semibold rounded-xl transition-colors text-center cursor-pointer"
          >
            View Technical Details
          </button>
        </div>
      </div>

      {/* Technical Details Modal */}
      {showTechnicalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTechnicalModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Certificate Technical Details
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-[#f2f5fc]">
                <span className="text-[#6e6e73]">Common Name (CN)</span>
                <span className="font-semibold text-[#1d1d1f]">{domainName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#f2f5fc]">
                <span className="text-[#6e6e73]">Validation Method</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {cert?.validationMethod || "DNS / HTTP Validation"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#f2f5fc]">
                <span className="text-[#6e6e73]">Product Name</span>
                <span className="font-semibold text-[#1d1d1f]">{certType}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#f2f5fc]">
                <span className="text-[#6e6e73]">Status</span>
                <span className="font-semibold text-[#1d1d1f]">{rawStatus}</span>
              </div>
            </div>

            {cert?.certificate ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#1d1d1f]">Public Certificate (CRT)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cert.certificate || "")}
                    className="text-[11px] text-[#1787D4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy CRT
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={5}
                  value={cert.certificate}
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#e2eaff] rounded-xl font-mono text-[11px] text-[#5a6a85] focus:outline-none"
                />
              </div>
            ) : (
              <div className="p-3 bg-[#f8fafc] border border-[#e2eaff] rounded-xl text-xs text-[#6e6e73]">
                Public CRT is available for download once the certificate status is Active.
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowTechnicalModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc] cursor-pointer"
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
