"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Download,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  useGetSslCertificateDetails,
  useDownloadSslCertificate,
} from "@/hooks/useSsl";
import { toast } from "sonner";

export default function CertificateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const certParam = decodeURIComponent(resolvedParams.id);
  const router = useRouter();

  const [showTechnicalModal, setShowTechnicalModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: cert, isLoading, isError, refetch, isFetching } = useGetSslCertificateDetails(certParam);
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
    router.push(
      `/dashboard/ssl?tab=order&domain=${encodeURIComponent(domainName)}&product=${(cert as any)?.productId || 41}`
    );
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

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
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

      {/* Domain Validation (DNS / Email) Section — exposed via GET /api/ssl/:id/status */}
      {isPending && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#031033]">
                    Action Required: Complete Domain Validation
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-200/70 text-amber-800 border border-amber-300">
                    {rawStatus}
                  </span>
                </div>
                <p className="text-xs text-[#5a6a85] mt-1 leading-relaxed max-w-2xl">
                  Before your SSL certificate can be issued by the Certificate Authority (OpenProvider), you must verify domain ownership. Please add the DNS record below to your domain&apos;s DNS manager.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-refresh-ssl-status"
              onClick={() => {
                refetch();
                toast.info("Checking certificate status with OpenProvider...");
              }}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Checking..." : "Refresh Status"}
            </button>
          </div>

          {/* Validation Entries */}
          {cert?.validation && Array.isArray(cert.validation) && cert.validation.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cert.validation.map((v: any, idx: number) => {
                const method = (v.method || "dns").toLowerCase();
                const hostName = v.host_name || domainName;
                const recordType = v.dns_type || v.type || (method === "dns" ? "CNAME" : "");
                const recordHost = v.dns_record || v.name || v.record || (method === "dns" ? `_validation.${hostName}` : hostName);
                const recordValue = v.dns_value || v.value || v.content || v.target || "";

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-amber-200/80 p-4 sm:p-5 flex flex-col gap-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5a6a85]">
                          Validation Record #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-[#1787D4] border border-blue-200">
                          {method === "dns" ? "DNS Record" : method}
                        </span>
                      </div>
                      <span className="text-xs text-[#5a6a85] font-medium">Domain: <strong className="text-[#031033]">{hostName}</strong></span>
                    </div>

                    {method === "dns" ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        {/* Type */}
                        <div className="md:col-span-2 bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#5a6a85] uppercase tracking-wider block mb-1">
                            Record Type
                          </span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-sm text-[#031033]">{recordType || "CNAME"}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(recordType || "CNAME", `type-${idx}`)}
                              className="p-1 text-[#9ba8c0] hover:text-[#1787D4] transition-colors cursor-pointer"
                              title="Copy type"
                            >
                              {copiedField === `type-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Name / Host */}
                        <div className="md:col-span-5 bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#5a6a85] uppercase tracking-wider block mb-1">
                            Host / Name
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-[#031033] truncate select-all">{recordHost}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(recordHost, `host-${idx}`)}
                              className="p-1 text-[#9ba8c0] hover:text-[#1787D4] transition-colors shrink-0 cursor-pointer"
                              title="Copy host/name"
                            >
                              {copiedField === `host-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Value / Target */}
                        <div className="md:col-span-5 bg-[#f8faff] rounded-xl border border-[#e2eaff] p-3 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#5a6a85] uppercase tracking-wider block mb-1">
                            Value / Target
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-[#031033] truncate select-all">
                              {recordValue || "Generating record value..."}
                            </span>
                            {recordValue && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(recordValue, `val-${idx}`)}
                                className="p-1 text-[#9ba8c0] hover:text-[#1787D4] transition-colors shrink-0 cursor-pointer"
                                title="Copy value"
                              >
                                {copiedField === `val-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2eaff] text-xs text-[#5a6a85]">
                        <p>An approval email was sent to your domain administrator address for <strong>{hostName}</strong>. Please check your inbox and confirm the verification link.</p>
                      </div>
                    )}

                    <div className="text-[11px] text-[#5a6a85] flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>
                        Log in to your DNS provider (e.g. Nupat DNS, Cloudflare, Route53), create the {recordType || "DNS"} record above, and wait 5–15 minutes for propagation.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-amber-200/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#031033]">
                  Awaiting DNS Validation Record from OpenProvider
                </p>
                <p className="text-[11px] text-[#5a6a85] mt-0.5">
                  The order was sent to the Certificate Authority. OpenProvider is currently provisioning your DNS verification token. This page auto-refreshes every few seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-xs text-amber-800 font-semibold">Processing...</span>
              </div>
            </div>
          )}
        </div>
      )}

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
