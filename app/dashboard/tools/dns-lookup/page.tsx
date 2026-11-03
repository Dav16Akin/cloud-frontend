"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Loader2,
  Globe,
  Copy,
  Check,
  AlertCircle,
  Code,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { lookupDns, DnsRecordsData, DnsRecordSOA } from "@/lib/api";

type RecordTypeKey = "ALL" | "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA";

interface NormalizedRecord {
  id: string;
  type: string;
  host: string;
  value: string;
  extra?: string;
  badgeColor: { bg: string; text: string; border: string };
}

// Record types share one neutral chip: the type is identity, not status.
function getBadgeColors(type: string) {
  const neutral = { bg: "", text: "text-[#031033]", border: "border-transparent" };
  switch (type) {
    case "A":
      return neutral;
    case "AAAA":
      return neutral;
    case "CNAME":
      return neutral;
    case "MX":
      return neutral;
    case "TXT":
      return neutral;
    case "NS":
      return neutral;
    case "SOA":
      return neutral;
    default:
      return neutral;
  }
}

function cleanDomainInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function DnsLookupContent() {
  const searchParams = useSearchParams();
  const urlDomain = searchParams.get("domain") || "";

  const [domain, setDomain] = useState(urlDomain || "");
  const [selectedType, setSelectedType] = useState<RecordTypeKey>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dnsData, setDnsData] = useState<DnsRecordsData | null>(null);
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const executeLookup = useCallback(async (targetDomain: string) => {
    const clean = cleanDomainInput(targetDomain);
    if (!clean) {
      setError("Please enter a domain name to lookup.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasLookedUp(true);

    try {
      const res = await lookupDns(clean);
      if (res.success && res.data) {
        setDnsData(res.data);
      } else {
        const errorMsg = Array.isArray(res.error)
          ? res.error.join(", ")
          : res.error || res.message || "Failed to resolve DNS records.";
        setError(errorMsg);
        setDnsData(null);
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred while querying DNS records.";
      setError(msg);
      setDnsData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only run lookup on mount if a domain is explicitly supplied in URL searchParams
  useEffect(() => {
    if (urlDomain) {
      setDomain(urlDomain);
      executeLookup(urlDomain);
    }
  }, [urlDomain, executeLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(domain);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Flatten and normalize records for filtering and table presentation
  const allRecords: NormalizedRecord[] = [];
  if (dnsData?.records) {
    const r = dnsData.records;
    const currentDomain = dnsData.domainName;

    (r.A || []).forEach((ip, idx) => {
      allRecords.push({
        id: `A-${idx}`,
        type: "A",
        host: currentDomain,
        value: ip,
        badgeColor: getBadgeColors("A"),
      });
    });

    (r.AAAA || []).forEach((ip, idx) => {
      allRecords.push({
        id: `AAAA-${idx}`,
        type: "AAAA",
        host: currentDomain,
        value: ip,
        badgeColor: getBadgeColors("AAAA"),
      });
    });

    (r.CNAME || []).forEach((target, idx) => {
      allRecords.push({
        id: `CNAME-${idx}`,
        type: "CNAME",
        host: currentDomain,
        value: target,
        badgeColor: getBadgeColors("CNAME"),
      });
    });

    (r.MX || []).forEach((mx, idx) => {
      allRecords.push({
        id: `MX-${idx}`,
        type: "MX",
        host: currentDomain,
        value: mx.exchange,
        extra: `Priority: ${mx.priority}`,
        badgeColor: getBadgeColors("MX"),
      });
    });

    (r.TXT || []).forEach((txt, idx) => {
      const txtValue = Array.isArray(txt) ? txt.join("") : String(txt);
      allRecords.push({
        id: `TXT-${idx}`,
        type: "TXT",
        host: currentDomain,
        value: txtValue,
        badgeColor: getBadgeColors("TXT"),
      });
    });

    (r.NS || []).forEach((ns, idx) => {
      allRecords.push({
        id: `NS-${idx}`,
        type: "NS",
        host: currentDomain,
        value: ns,
        badgeColor: getBadgeColors("NS"),
      });
    });

    if (r.SOA) {
      allRecords.push({
        id: "SOA-0",
        type: "SOA",
        host: currentDomain,
        value: r.SOA.nsname,
        extra: `Hostmaster: ${r.SOA.hostmaster} · Serial: ${r.SOA.serial}`,
        badgeColor: getBadgeColors("SOA"),
      });
    }
  }

  const recordCounts: Record<RecordTypeKey, number> = {
    ALL: allRecords.length,
    A: dnsData?.records?.A?.length || 0,
    AAAA: dnsData?.records?.AAAA?.length || 0,
    CNAME: dnsData?.records?.CNAME?.length || 0,
    MX: dnsData?.records?.MX?.length || 0,
    TXT: dnsData?.records?.TXT?.length || 0,
    NS: dnsData?.records?.NS?.length || 0,
    SOA: dnsData?.records?.SOA ? 1 : 0,
  };

  const filteredRecords =
    selectedType === "ALL"
      ? allRecords
      : allRecords.filter((r) => r.type === selectedType);

  const soa = dnsData?.records?.SOA;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tools
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">DNS lookup</h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Query live authoritative DNS records, nameservers, mail exchanges and zone SOA parameters.
          </p>
        </div>

        {dnsData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-[#D5DCE6] text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium rounded-lg transition-colors cursor-pointer"
              title="Toggle JSON View"
            >
              <Code className="w-3.5 h-3.5 text-[#5A6A85]" />
              {showRawJson ? "Hide JSON" : "Raw JSON"}
            </button>
            <button
              onClick={() => executeLookup(domain)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-[#D5DCE6] text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Refresh DNS Lookup"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#5A6A85] ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 text-[#5A6A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter a domain name (e.g. yourdomain.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full sm:w-auto h-10 px-5 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Look up DNS
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-[#FDECEC] border border-[#DC2626]/20 rounded-lg px-4 py-3 flex items-start gap-3 text-[#C21F1F]">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium">DNS lookup failed</h4>
            <p className="text-xs mt-0.5 text-[#C21F1F]">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[#C21F1F]/70 hover:text-[#C21F1F] text-xs font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !dnsData && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm font-medium text-[#031033]">Resolving DNS records for {domain}…</p>
          <p className="text-xs text-[#5A6A85]">Querying nameservers, mail exchangers and address records</p>
        </div>
      )}

      {/* Initial Empty State (When no search has been performed yet) */}
      {!loading && !dnsData && !error && !hasLookedUp && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center">
          <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-[#031033]">
              No DNS lookup performed yet
            </p>
            <p className="text-sm text-[#5A6A85]">
              Enter a domain name above and select &ldquo;Look up DNS&rdquo; to query live records, nameservers and mail servers.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {dnsData && (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#EEF2F7] sm:grid-cols-4">
            {/* Total Records */}
            <div className="bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Total records</span>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-[#031033]">
                {allRecords.length}
              </div>
              <p className="mt-0.5 text-xs text-[#5A6A85]">Found across 7 record types</p>
            </div>

            {/* IPv4 (A) */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">IPv4 addresses</span>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-[#031033]">
                {dnsData.records?.A?.length || 0}
              </div>
              <p className="mt-0.5 truncate text-xs text-[#5A6A85]">
                {dnsData.records?.A?.[0] ? <span className="font-mono">{dnsData.records.A[0]}</span> : "No A record"}
              </p>
            </div>

            {/* Mail Exchanges (MX) */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Mail servers</span>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-[#031033]">
                {dnsData.records?.MX?.length || 0}
              </div>
              <p className="mt-0.5 truncate text-xs text-[#5A6A85]">
                {dnsData.records?.MX?.[0] ? <span className="font-mono">{dnsData.records.MX[0].exchange}</span> : "No MX records"}
              </p>
            </div>

            {/* Nameservers (NS) */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Nameservers</span>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-[#031033]">
                {dnsData.records?.NS?.length || 0}
              </div>
              <p className="mt-0.5 truncate text-xs text-[#5A6A85]">
                {dnsData.records?.NS?.[0] ? <span className="font-mono">{dnsData.records.NS[0]}</span> : "No NS records"}
              </p>
            </div>
          </div>

          {/* Raw JSON viewer */}
          {showRawJson && (
            <div className="bg-[#031033] text-[#E2E8F0] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-medium text-white">JSON response</span>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(dnsData, null, 2), "raw-json")}
                  className="inline-flex items-center gap-1.5 h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === "raw-json" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4AC3B4]" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono overflow-x-auto p-3 bg-black/30 rounded-lg max-h-96 text-[#E2E8F0]">
                {JSON.stringify(dnsData, null, 2)}
              </pre>
            </div>
          )}

          {/* SOA Zone Parameters Card */}
          {soa && (selectedType === "ALL" || selectedType === "SOA") && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div>
                    <h3 className="text-base font-semibold text-[#031033]">Start of Authority (SOA)</h3>
                    <p className="text-xs text-[#5A6A85]">Zone authority and replication parameters</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Primary NS: ${soa.nsname}\nHostmaster: ${soa.hostmaster}\nSerial: ${soa.serial}\nRefresh: ${soa.refresh}\nRetry: ${soa.retry}\nExpire: ${soa.expire}\nMin TTL: ${soa.minttl}`,
                      "soa-data",
                    )
                  }
                  className="text-sm text-[#1787D4] hover:text-[#1370B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "soa-data" ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "soa-data" ? "Copied" : "Copy SOA"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Primary nameserver</span>
                  <span className="font-mono text-[#031033] font-medium break-all">{soa.nsname}</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Hostmaster / authority</span>
                  <span className="font-mono text-[#031033] font-medium break-all">{soa.hostmaster}</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Serial number</span>
                  <span className="font-mono text-[#031033] font-medium">{soa.serial}</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Minimum TTL</span>
                  <span className="font-mono text-[#031033] font-medium">{soa.minttl}s ({Math.round(soa.minttl / 3600)}h)</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Refresh interval</span>
                  <span className="font-mono text-[#031033] font-medium">{soa.refresh}s ({Math.round(soa.refresh / 60)}m)</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg">
                  <span className="text-xs text-[#5A6A85] block">Retry interval</span>
                  <span className="font-mono text-[#031033] font-medium">{soa.retry}s ({Math.round(soa.retry / 60)}m)</span>
                </div>
                <div className="bg-[#F2F5FC] p-3 rounded-lg sm:col-span-2">
                  <span className="text-xs text-[#5A6A85] block">Expire limit</span>
                  <span className="font-mono text-[#031033] font-medium">{soa.expire}s ({Math.round(soa.expire / 86400)} days)</span>
                </div>
              </div>
            </div>
          )}

          {/* Record Filter Tabs */}
          <div className="flex items-center gap-5 overflow-x-auto border-b border-[#E2E8F0]">
            {(
              [
                { key: "ALL", label: "All records" },
                { key: "A", label: "A (IPv4)" },
                { key: "AAAA", label: "AAAA (IPv6)" },
                { key: "CNAME", label: "CNAME" },
                { key: "MX", label: "MX (Mail)" },
                { key: "TXT", label: "TXT" },
                { key: "NS", label: "NS" },
                { key: "SOA", label: "SOA" },
              ] as { key: RecordTypeKey; label: string }[]
            ).map((tab) => {
              const count = recordCounts[tab.key];
              const isActive = selectedType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedType(tab.key)}
                  className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "border-[#1787D4] text-[#031033]"
                      : "border-transparent text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 text-xs font-medium tabular-nums ${
                      count > 0 ? "bg-[#F2F5FC] text-[#5A6A85]" : "text-[#5A6A85]/70"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] w-24">Type</th>
                    <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] w-48">Host / name</th>
                    <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85]">Value / target</th>
                    <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] text-right w-24"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((r) => {
                      const isCopied = copiedKey === r.id;
                      return (
                        <tr key={r.id} className="hover:bg-[#F2F5FC]/60 transition-colors group">
                          {/* Type Badge */}
                          <td className="py-3 px-5 align-top">
                            <span
                              className={`inline-flex items-center text-sm font-medium font-mono ${r.badgeColor.bg} ${r.badgeColor.text} ${r.badgeColor.border}`}
                            >
                              {r.type}
                            </span>
                          </td>

                          {/* Host */}
                          <td className="py-3 px-5 text-sm text-[#031033] align-top font-mono">
                            {r.host}
                          </td>

                          {/* Value */}
                          <td className="py-3 px-5 text-sm text-[#031033] align-top">
                            <div className="font-mono break-all text-[#031033]">
                              {r.value}
                            </div>
                            {r.extra && (
                              <div className="mt-1 text-xs text-[#5A6A85]">
                                {r.extra}
                              </div>
                            )}
                          </td>

                          {/* Action (Copy) */}
                          <td className="py-3 px-5 text-right align-top">
                            <button
                              onClick={() => handleCopy(r.value, r.id)}
                              className="p-1.5 rounded-lg text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                              title="Copy value"
                              aria-label="Copy value"
                            >
                              {isCopied ? (
                                <Check className="w-4 h-4 text-[#0E7C3A]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 px-5 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <p className="text-sm font-medium text-[#031033]">
                            No {selectedType === "ALL" ? "" : selectedType} records found
                          </p>
                          <p className="text-sm text-[#5A6A85]">
                            The queried domain does not currently advertise active {selectedType} records.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DnsLookupToolPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading DNS lookup…</p>
        </div>
      }
    >
      <DnsLookupContent />
    </Suspense>
  );
}
