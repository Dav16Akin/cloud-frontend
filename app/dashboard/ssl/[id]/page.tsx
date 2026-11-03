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
  // Real status only — no assumed "ACTIVE" when the API has none.
  const rawStatus = (cert?.status as string | undefined)?.toUpperCase() || "";

  const expiresAtMs = cert?.expiresAt ? new Date(cert.expiresAt).getTime() : NaN;
  const [nowMs] = useState(() => Date.now());
  const pastExpiry = Number.isFinite(expiresAtMs) && expiresAtMs < nowMs;

  const isExpired = rawStatus === "EXPIRED" || (rawStatus === "ACTIVE" && pastExpiry);
  const isPending = rawStatus === "PENDING" || rawStatus === "PROCESSING";
  const isActive = rawStatus === "ACTIVE" && !pastExpiry;
  const otherStatusLabel =
    rawStatus && !isExpired && !isPending && !isActive
      ? rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase()
      : null;

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
    const productId = (cert as { productId?: number } | null | undefined)?.productId;
    router.push(
      `/dashboard/ssl?tab=order&domain=${encodeURIComponent(domainName)}${
        productId ? `&product=${encodeURIComponent(String(productId))}` : ""
      }`
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
        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#5A6A85]">Loading certificate details…</p>
      </div>
    );
  }

  const metaItems: { label: string; value: string; tone?: string }[] = [
    { label: "Certificate type", value: certType },
    { label: "Domain", value: domainName },
    // createdAt is when the order was placed, not when the CA issued it.
    { label: "Ordered", value: issuedDate },
    { label: "Expires", value: expiryDate },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/ssl"
          id="btn-back-ssl"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SSL certificates
        </Link>
      </div>

      {/* Header with Title and Status Badge */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#031033] break-all">
            {domainName} SSL certificate
          </h1>
          {isActive && (
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
              Active
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#E8900A]" />
              Pending
            </span>
          )}
          {isExpired && (
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#C21F1F]">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />
              Expired
            </span>
          )}
          {otherStatusLabel && (
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#5A6A85]" />
              {otherStatusLabel}
            </span>
          )}
        </div>
        <p className="text-sm text-[#5A6A85] mt-1">
          View certificate status, validity, and renewal settings.
        </p>
      </div>

      {/* Domain Validation (DNS / Email) Section — exposed via GET /api/ssl/:id/status */}
      {isPending && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#9A5B00] shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Action required: complete domain validation
                </h3>
                <p className="text-sm text-[#5A6A85] mt-1 max-w-2xl">
                  Before the Certificate Authority (OpenProvider) can issue your certificate, you need to verify domain ownership. Add the DNS record below in your domain&apos;s DNS manager.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-refresh-ssl-status"
              onClick={() => {
                refetch();
                toast.info("Checking certificate status with OpenProvider…");
              }}
              disabled={isFetching}
              className="inline-flex h-8 items-center gap-2 px-3 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors shrink-0 self-start cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Checking…" : "Refresh status"}
            </button>
          </div>

          {/* Validation Entries */}
          <div className="p-5">
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
                      className="rounded-lg border border-[#E2E8F0] p-4 flex flex-col gap-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#031033]">
                            Validation record {idx + 1}
                          </span>
                          <span className="font-mono text-xs text-[#5A6A85]">
                            {method === "dns" ? "DNS record" : method}
                          </span>
                        </div>
                        <span className="text-xs text-[#5A6A85]">
                          Domain: <span className="font-medium text-[#031033]">{hostName}</span>
                        </span>
                      </div>

                      {method === "dns" ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Type */}
                          <div className="md:col-span-2 bg-[#F2F5FC] rounded-lg p-3">
                            <span className="text-xs text-[#5A6A85] block mb-1">Type</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-sm text-[#031033]">{recordType || "CNAME"}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(recordType || "CNAME", `type-${idx}`)}
                                className="p-1 rounded text-[#5A6A85] hover:text-[#1787D4] transition-colors cursor-pointer"
                                title="Copy type"
                              >
                                {copiedField === `type-${idx}` ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Name / Host */}
                          <div className="md:col-span-5 bg-[#F2F5FC] rounded-lg p-3">
                            <span className="text-xs text-[#5A6A85] block mb-1">Host / name</span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-sm text-[#031033] truncate select-all">{recordHost}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(recordHost, `host-${idx}`)}
                                className="p-1 rounded text-[#5A6A85] hover:text-[#1787D4] transition-colors shrink-0 cursor-pointer"
                                title="Copy host/name"
                              >
                                {copiedField === `host-${idx}` ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Value / Target */}
                          <div className="md:col-span-5 bg-[#F2F5FC] rounded-lg p-3">
                            <span className="text-xs text-[#5A6A85] block mb-1">Value / target</span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-sm text-[#031033] truncate select-all">
                                {recordValue || "Generating record value…"}
                              </span>
                              {recordValue && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(recordValue, `val-${idx}`)}
                                  className="p-1 rounded text-[#5A6A85] hover:text-[#1787D4] transition-colors shrink-0 cursor-pointer"
                                  title="Copy value"
                                >
                                  {copiedField === `val-${idx}` ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#F2F5FC] rounded-lg text-sm text-[#5A6A85]">
                          <p>An approval email was sent to the administrator address for <span className="font-medium text-[#031033]">{hostName}</span>. Open it and confirm the verification link.</p>
                        </div>
                      )}

                      <p className="text-xs text-[#5A6A85]">
                        In your DNS provider (e.g. Nupat DNS, Cloudflare, Route53), create the {recordType || "DNS"} record above, then allow 5–15 minutes for propagation.
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#031033]">
                    Awaiting the DNS validation record from OpenProvider
                  </p>
                  <p className="text-xs text-[#5A6A85] mt-1">
                    The order was sent to the Certificate Authority, which is generating your DNS verification token. This page refreshes every few seconds.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
                  <span className="text-sm text-[#5A6A85]">Processing…</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Certificate Summary & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Certificate Details Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0]">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEF2F7]">
            <Shield className="w-4 h-4 text-[#5A6A85] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[#031033]">{certType}</h2>
              <span className="text-xs text-[#5A6A85] block truncate">{domainName}</span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Metadata list */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {metaItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 py-3 border-b border-[#EEF2F7]"
                >
                  <dt className="text-sm text-[#5A6A85]">{item.label}</dt>
                  <dd className={`text-sm font-medium text-right truncate tabular-nums ${item.value === "—" ? "text-[#5A6A85]" : item.tone ?? "text-[#031033]"}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Protection is active notice — only for an active, unexpired certificate */}
            {isActive && (
              <div className="rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] px-4 py-3 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#0E7C3A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-[#031033] block">Protection is active</span>
                  <span className="text-xs text-[#5A6A85] mt-0.5 block">
                    This certificate is active for {domainName}
                    {expiryDate !== "—" ? ` until ${expiryDate}` : ""}.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Operations */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0]">
          <div className="px-5 py-4 border-b border-[#EEF2F7]">
            <h3 className="text-base font-semibold text-[#031033]">Quick operations</h3>
          </div>

          <div className="p-5 flex flex-col gap-2">
            {/* Renew Button */}
            <button
              type="button"
              id="op-renew-ssl"
              onClick={handleRenew}
              className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Renew certificate
            </button>

            {/* View Details Button */}
            <button
              type="button"
              id="op-view-ssl-details"
              onClick={() => setShowTechnicalModal(true)}
              className="w-full h-9 px-4 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              View details
            </button>

            {/* Download CRT */}
            <button
              type="button"
              id="op-download-ssl"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-9 px-4 text-[#1787D4] hover:bg-[#E8F4FC] text-sm font-medium rounded-lg transition-colors text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download certificate (.crt)
            </button>

            {expiryDate !== "—" && (
              <p className="text-xs text-[#5A6A85] mt-2">
                {isExpired ? `Expired ${expiryDate}.` : `Renew before ${expiryDate} to stay protected.`}
              </p>
            )}
          </div>
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
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowTechnicalModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold text-[#031033]">Certificate technical details</h3>
            </div>

            <div className="px-6 py-4 flex flex-col gap-4">
              <dl className="flex flex-col text-sm">
                {[
                  { label: "Common name (CN)", value: domainName },
                  { label: "Validation method", value: cert?.validationMethod || "—" },
                  { label: "Product name", value: certType },
                  { label: "Status", value: rawStatus || "—" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 py-2.5 border-b border-[#EEF2F7] last:border-0">
                    <dt className="text-[#5A6A85]">{row.label}</dt>
                    <dd className="font-medium text-[#031033] text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>

              {cert?.certificate ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#031033]">Public certificate (CRT)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(cert.certificate || "")}
                      className="text-xs font-medium text-[#1787D4] hover:text-[#1370B5] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy CRT
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={5}
                    value={cert.certificate}
                    className="w-full p-3 bg-[#F2F5FC] border border-[#D5DCE6] rounded-lg font-mono text-xs text-[#031033] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033]">
                  The public CRT is available for download once the certificate is active.
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTechnicalModal(false)}
                className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
