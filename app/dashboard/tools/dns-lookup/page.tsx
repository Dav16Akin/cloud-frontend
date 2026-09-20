"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Loader2,
  Globe,
  Server,
  Copy,
  Check,
  AlertCircle,
  Code,
  ShieldCheck,
  Mail,
  Network,
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

function getBadgeColors(type: string) {
  switch (type) {
    case "A":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "AAAA":
      return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" };
    case "CNAME":
      return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
    case "MX":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    case "TXT":
      return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    case "NS":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "SOA":
      return { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
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
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tools
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            DNS Lookup
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Query live authoritative DNS records, nameservers, mail exchanges, and zone SOA parameters.
          </p>
        </div>

        {dnsData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2eaff] hover:border-[#1787D4] text-[#5a6a85] hover:text-[#1787D4] text-[12.5px] font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
              title="Toggle JSON View"
            >
              <Code className="w-3.5 h-3.5" />
              {showRawJson ? "Hide JSON" : "Raw JSON"}
            </button>
            <button
              onClick={() => executeLookup(domain)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2eaff] hover:border-[#1787D4] text-[#5a6a85] hover:text-[#1787D4] text-[12.5px] font-medium rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              title="Refresh DNS Lookup"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 text-[#8a9bb2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter a domain name (e.g. yourdomain.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#8a9bb2] focus:outline-none focus:border-[#1787D4] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lookup DNS
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-[13.5px] font-semibold">DNS Lookup Error</h4>
            <p className="text-[12.5px] mt-0.5 text-red-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-[12px] font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !dnsData && (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-[14px] font-medium text-[#1d1d1f]">Resolving DNS records for {domain}...</p>
          <p className="text-[12.5px] text-[#6e6e73]">Querying nameservers, mail exchangers, and address records</p>
        </div>
      )}

      {/* Initial Empty State (When no search has been performed yet) */}
      {!loading && !dnsData && !error && !hasLookedUp && (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-12 shadow-sm text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#1787D4] flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              No DNS lookup performed yet
            </p>
            <p className="text-[12.5px] text-[#6e6e73]">
              Enter a domain name above and click &ldquo;Lookup DNS&rdquo; to query live records, nameservers, and mail servers.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {dnsData && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Records */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Total Records</span>
                <div className="w-7 h-7 rounded-lg bg-[#eff6ff] text-[#1787D4] flex items-center justify-center">
                  <Network className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-[22px] font-bold text-[#1d1d1f]">
                {allRecords.length}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">Found across 7 record types</p>
            </div>

            {/* IPv4 (A) */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">IPv4 Addresses</span>
                <div className="w-7 h-7 rounded-lg bg-[#eff6ff] text-[#1787D4] flex items-center justify-center">
                  <Server className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-[22px] font-bold text-[#1d1d1f]">
                {dnsData.records?.A?.length || 0}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                {dnsData.records?.A?.[0] ? dnsData.records.A[0] : "No A record"}
              </p>
            </div>

            {/* Mail Exchanges (MX) */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Mail Servers</span>
                <div className="w-7 h-7 rounded-lg bg-[#faf5ff] text-[#9333ea] flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-[22px] font-bold text-[#1d1d1f]">
                {dnsData.records?.MX?.length || 0}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                {dnsData.records?.MX?.[0] ? dnsData.records.MX[0].exchange : "No MX records"}
              </p>
            </div>

            {/* Nameservers (NS) */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Nameservers</span>
                <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 text-[22px] font-bold text-[#1d1d1f]">
                {dnsData.records?.NS?.length || 0}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                {dnsData.records?.NS?.[0] ? dnsData.records.NS[0] : "No NS records"}
              </p>
            </div>
          </div>

          {/* Raw JSON viewer */}
          {showRawJson && (
            <div className="bg-[#031033] text-[#e2eaff] rounded-2xl p-5 shadow-sm border border-[#1e293b]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-[13px] font-semibold text-white">JSON Response Payload</span>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(dnsData, null, 2), "raw-json")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === "raw-json" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
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
              <pre className="text-[12px] font-mono overflow-x-auto p-3 bg-black/30 rounded-xl max-h-96 text-emerald-300">
                {JSON.stringify(dnsData, null, 2)}
              </pre>
            </div>
          )}

          {/* SOA Zone Parameters Card */}
          {soa && (selectedType === "ALL" || selectedType === "SOA") && (
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f2f5fc] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center font-bold text-[12px]">
                    SOA
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1d1d1f]">Start of Authority (SOA)</h3>
                    <p className="text-[12px] text-[#6e6e73]">Zone authority and replication parameters</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Primary NS: ${soa.nsname}\nHostmaster: ${soa.hostmaster}\nSerial: ${soa.serial}\nRefresh: ${soa.refresh}\nRetry: ${soa.retry}\nExpire: ${soa.expire}\nMin TTL: ${soa.minttl}`,
                      "soa-data",
                    )
                  }
                  className="text-[12px] text-[#1787D4] hover:text-[#1371B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "soa-data" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "soa-data" ? "Copied" : "Copy SOA"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Primary Nameserver</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold break-all">{soa.nsname}</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Hostmaster / Authority</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold break-all">{soa.hostmaster}</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Serial Number</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">{soa.serial}</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Minimum TTL</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">{soa.minttl}s ({Math.round(soa.minttl / 3600)}h)</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Refresh Interval</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">{soa.refresh}s ({Math.round(soa.refresh / 60)}m)</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Retry Interval</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">{soa.retry}s ({Math.round(soa.retry / 60)}m)</span>
                </div>
                <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8] sm:col-span-2">
                  <span className="text-[11.5px] text-[#6e6e73] font-medium block">Expire Limit</span>
                  <span className="font-mono text-[#1d1d1f] font-semibold">{soa.expire}s ({Math.round(soa.expire / 86400)} days)</span>
                </div>
              </div>
            </div>
          )}

          {/* Record Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e2eaff] pb-1">
            {(
              [
                { key: "ALL", label: "All Records" },
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
                  className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#1787D4] text-white shadow-sm"
                      : "bg-white text-[#5a6a85] hover:bg-[#f2f5fc] hover:text-[#1d1d1f] border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : count > 0
                        ? "bg-[#eef2f8] text-[#5a6a85]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] w-24">Type</th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] w-48">Host / Name</th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">Value / Target</th>
                    <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((r) => {
                      const isCopied = copiedKey === r.id;
                      return (
                        <tr key={r.id} className="hover:bg-[#fbfcfe] transition-colors group">
                          {/* Type Badge */}
                          <td className="py-4 px-6 align-top">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${r.badgeColor.bg} ${r.badgeColor.text} ${r.badgeColor.border}`}
                            >
                              {r.type}
                            </span>
                          </td>

                          {/* Host */}
                          <td className="py-4 px-6 text-[13px] font-medium text-[#1d1d1f] align-top font-mono">
                            {r.host}
                          </td>

                          {/* Value */}
                          <td className="py-4 px-6 text-[13px] text-[#1d1d1f] align-top">
                            <div className="font-mono break-all text-[#2a3b50] leading-relaxed">
                              {r.value}
                            </div>
                            {r.extra && (
                              <div className="mt-1 text-[11.5px] text-[#6e6e73] font-medium">
                                {r.extra}
                              </div>
                            )}
                          </td>

                          {/* Action (Copy) */}
                          <td className="py-4 px-6 text-right align-top">
                            <button
                              onClick={() => handleCopy(r.value, r.id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-[#e2eaff] hover:bg-[#f8fafc] text-[#8a9bb2] hover:text-[#1787D4] transition-colors cursor-pointer"
                              title="Copy value"
                            >
                              {isCopied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
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
                      <td colSpan={4} className="py-12 px-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-8 h-8 text-[#8a9bb2]" />
                          <p className="text-[14px] font-medium text-[#1d1d1f]">
                            No {selectedType === "ALL" ? "" : selectedType} records found
                          </p>
                          <p className="text-[12.5px] text-[#6e6e73]">
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-[14px] text-[#6e6e73]">Loading DNS Lookup Tool...</p>
        </div>
      }
    >
      <DnsLookupContent />
    </Suspense>
  );
}
