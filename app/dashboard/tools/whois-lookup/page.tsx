"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Loader2,
  Globe,
  Calendar,
  Building,
  ShieldCheck,
  Server,
  User,
  Copy,
  Check,
  AlertCircle,
  Code,
  ExternalLink,
  RefreshCw,
  Clock,
  List,
} from "lucide-react";
import { lookupWhois, WhoisData } from "@/lib/api";

function cleanDomainInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function parseDomainStatus(statusVal?: string | string[]): string[] {
  if (!statusVal) return [];
  const list = Array.isArray(statusVal) ? statusVal : [String(statusVal)];
  const statuses: string[] = [];

  list.forEach((item) => {
    const parts = item.split(/\s+/);
    parts.forEach((p) => {
      const clean = p.replace(/[(),]/g, "").trim();
      if (
        clean &&
        !clean.startsWith("http") &&
        !clean.startsWith("https") &&
        !clean.startsWith("//") &&
        !statuses.includes(clean)
      ) {
        statuses.push(clean);
      }
    });
  });

  return statuses;
}

function parseNameservers(nsVal?: string | string[]): string[] {
  if (!nsVal) return [];
  const list = Array.isArray(nsVal) ? nsVal : String(nsVal).split(/\s+/);
  const result: string[] = [];
  list.forEach((ns) => {
    const clean = ns.trim().toLowerCase();
    if (clean && !result.includes(clean)) {
      result.push(clean);
    }
  });
  return result;
}

function formatFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function WhoisContent() {
  const searchParams = useSearchParams();
  const urlDomain = searchParams.get("domain") || "";

  const [domain, setDomain] = useState(urlDomain || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
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
      const res = await lookupWhois(clean);
      if (res.success && res.data) {
        setWhoisData(res.data);
      } else {
        const errorMsg = Array.isArray(res.error)
          ? res.error.join(", ")
          : res.error || res.message || "Failed to query WHOIS records.";
        setError(errorMsg);
        setWhoisData(null);
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred while querying WHOIS.";
      setError(msg);
      setWhoisData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run initial lookup on mount if domain is provided via searchParams
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

  // Normalize results regardless of whether results is an object or array of servers
  const whoisObj: Record<string, any> = {};
  if (whoisData?.results) {
    if (Array.isArray(whoisData.results)) {
      whoisData.results.forEach((r: any) => {
        if (r?.data && typeof r.data === "object") {
          Object.assign(whoisObj, r.data);
        } else if (r && typeof r === "object") {
          Object.assign(whoisObj, r);
        }
      });
    } else if (typeof whoisData.results === "object") {
      Object.assign(whoisObj, whoisData.results);
    }
  }

  const domainName =
    whoisObj.domainName || whoisObj.domain || whoisData?.domain || domain;
  const registryDomainId = whoisObj.registryDomainId || "";
  const registrar =
    whoisObj.registrar || whoisObj.registrarName || "—";
  const registrarUrl = whoisObj.registrarUrl || "";
  const registrarIana = whoisObj.registrarIanaId || "";
  const registrarWhoisServer = whoisObj.registrarWhoisServer || "";
  const creationDate =
    whoisObj.creationDate || whoisObj.createdDate || whoisObj.registeredDate;
  const expiryDate =
    whoisObj.registrarRegistrationExpirationDate ||
    whoisObj.registryExpiryDate ||
    whoisObj.expiresDate ||
    whoisObj.expirationDate;
  const updatedDate = whoisObj.updatedDate || whoisObj.lastUpdated;
  const statuses = parseDomainStatus(whoisObj.domainStatus || whoisObj.status);
  const nameServers = parseNameservers(
    whoisObj.nameServers || whoisObj.nameServer || whoisObj.nameservers,
  );
  const dnssec = whoisObj.dnssec || "unsigned";

  const registrantOrg =
    whoisObj.registrantOrganization || whoisObj.registrantOrg || "";
  const registrantName = whoisObj.registrantName || "";
  const registrantStreet = whoisObj.registrantStreet || "";
  const registrantCity = whoisObj.registrantCity || "";
  const registrantState = whoisObj.registrantStateProvince || "";
  const registrantPostal = whoisObj.registrantPostalCode || "";
  const registrantCountry = whoisObj.registrantCountry || "";
  const registrantPhone = whoisObj.registrantPhone || "";
  const registrantEmail = whoisObj.registrantEmail || "";
  const abuseEmail = whoisObj.registrarAbuseContactEmail || "";
  const abusePhone = whoisObj.registrarAbuseContactPhone || "";
  const lastUpdate = whoisObj.LastUpdateOfWhoisDatabase || whoisObj.lastUpdateOfWhoisDatabase || "";

  const allAttributes = Object.entries(whoisObj);

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

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
            style={{
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            WHOIS Lookup
          </h2>
          <p className="text-[14px] mt-1 text-[#6e6e73]">
            Inspect domain registration details, registrar authority, active nameservers, and expiration dates.
          </p>
        </div>

        {whoisData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2eaff] hover:border-[#1787D4] text-[#5a6a85] hover:text-[#1787D4] text-[12.5px] font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              {showRawJson ? "Hide JSON" : "Raw JSON"}
            </button>
            <button
              onClick={() => executeLookup(domain)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2eaff] hover:border-[#1787D4] text-[#5a6a85] hover:text-[#1787D4] text-[12.5px] font-medium rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
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
                Querying WHOIS...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lookup WHOIS
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
            <h4 className="text-[13.5px] font-semibold">WHOIS Query Failed</h4>
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
      {loading && !whoisData && (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-10 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-[14px] font-semibold text-[#1d1d1f]">Querying WHOIS registry for {domain}...</p>
          <p className="text-[12.5px] text-[#6e6e73]">Retrieving registrar credentials, expiration dates, and nameserver delegation.</p>
        </div>
      )}

      {/* Initial Empty State */}
      {!loading && !whoisData && !error && !hasLookedUp && (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-12 shadow-sm text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#1787D4] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              No WHOIS lookup performed yet
            </p>
            <p className="text-[12.5px] text-[#6e6e73]">
              Enter a domain name above and click &ldquo;Lookup WHOIS&rdquo; to query live registration authority and status.
            </p>
          </div>
        </div>
      )}

      {/* Live WHOIS Data Presentation */}
      {whoisData && (
        <>
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Domain Status */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Domain</span>
                <Globe className="w-4 h-4 text-[#1787D4]" />
              </div>
              <div className="mt-2 text-[15px] font-bold text-[#1d1d1f] truncate font-mono">
                {domainName}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                DNSSEC: <span className="font-semibold text-[#5a6a85] uppercase">{dnssec}</span>
              </p>
            </div>

            {/* Registrar */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Registrar</span>
                <Building className="w-4 h-4 text-[#9333ea]" />
              </div>
              <div className="mt-2 text-[15px] font-bold text-[#1d1d1f] truncate">
                {registrar}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                IANA ID: {registrarIana || "—"}
              </p>
            </div>

            {/* Registered On */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Registered On</span>
                <Calendar className="w-4 h-4 text-[#059669]" />
              </div>
              <div className="mt-2 text-[15px] font-bold text-[#1d1d1f]">
                {formatDate(creationDate)}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                Updated: {formatDate(updatedDate)}
              </p>
            </div>

            {/* Expires On */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#6e6e73]">Expires On</span>
                <Clock className="w-4 h-4 text-[#d97706]" />
              </div>
              <div className="mt-2 text-[15px] font-bold text-[#059669]">
                {formatDate(expiryDate)}
              </div>
              <p className="text-[11px] text-[#8a9bb2] mt-0.5">
                Active registration
              </p>
            </div>
          </div>

          {/* Raw JSON View */}
          {showRawJson && (
            <div className="bg-[#031033] text-[#e2eaff] rounded-2xl p-5 shadow-sm border border-[#1e293b]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-[13px] font-semibold text-white">Raw WHOIS JSON Payload</span>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(whoisData, null, 2), "whois-json")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === "whois-json" ? (
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
                {JSON.stringify(whoisData, null, 2)}
              </pre>
            </div>
          )}

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Registration & Authority Overview */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#f2f5fc] pb-3">
                <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1787D4]" />
                  Registration & Authority
                </h3>
                <button
                  onClick={() =>
                    handleCopy(
                      `Domain: ${domainName}\nRegistrar: ${registrar}\nIANA ID: ${registrarIana}\nRegistered: ${creationDate}\nExpires: ${expiryDate}`,
                      "reg-overview",
                    )
                  }
                  className="text-[12px] text-[#1787D4] hover:text-[#1371B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "reg-overview" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "reg-overview" ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="flex flex-col gap-3 text-[13px]">
                <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                  <span className="text-[#6e6e73]">Domain Name</span>
                  <span className="font-bold text-[#1d1d1f] font-mono">{domainName}</span>
                </div>

                {registryDomainId && (
                  <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                    <span className="text-[#6e6e73]">Registry Domain ID</span>
                    <span className="font-mono text-[12px] text-[#5a6a85]">{registryDomainId}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                  <span className="text-[#6e6e73]">Registrar</span>
                  <span className="font-semibold text-[#1d1d1f] text-right">{registrar}</span>
                </div>

                {registrarUrl && (
                  <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                    <span className="text-[#6e6e73]">Registrar URL</span>
                    <a
                      href={registrarUrl.startsWith("http") ? registrarUrl : `http://${registrarUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1787D4] hover:underline flex items-center gap-1 font-mono text-[12px]"
                    >
                      {registrarUrl.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {registrarWhoisServer && (
                  <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                    <span className="text-[#6e6e73]">Registrar WHOIS</span>
                    <span className="font-mono text-[12px] text-[#5a6a85]">{registrarWhoisServer}</span>
                  </div>
                )}

                {abuseEmail && (
                  <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                    <span className="text-[#6e6e73]">Abuse Email</span>
                    <span className="font-mono text-[#1d1d1f] text-[12px]">{abuseEmail}</span>
                  </div>
                )}

                {abusePhone && (
                  <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                    <span className="text-[#6e6e73]">Abuse Phone</span>
                    <span className="font-mono text-[#1d1d1f] text-[12px]">{abusePhone}</span>
                  </div>
                )}

                <div className="flex justify-between items-start pt-1">
                  <span className="text-[#6e6e73] shrink-0">Domain Status</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                    {statuses.length > 0 ? (
                      statuses.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eff6ff] text-[#1787D4] border border-[#d6e4ff]"
                        >
                          {st}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#6e6e73] font-medium">active / ok</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Active Nameservers */}
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#f2f5fc] pb-3">
                <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1787D4]" />
                  Dates & Delegation
                </h3>
                <button
                  onClick={() =>
                    handleCopy(
                      `Registered: ${creationDate}\nExpires: ${expiryDate}\nUpdated: ${updatedDate}\nNameservers: ${nameServers.join(", ")}`,
                      "dates-ns",
                    )
                  }
                  className="text-[12px] text-[#1787D4] hover:text-[#1371B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "dates-ns" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "dates-ns" ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="flex flex-col gap-3 text-[13px]">
                <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                  <span className="text-[#6e6e73]">Registered On</span>
                  <div className="text-right">
                    <span className="font-semibold text-[#1d1d1f] block">{formatDate(creationDate)}</span>
                    {creationDate && (
                      <span className="text-[11px] text-[#8a9bb2] font-mono block">{creationDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                  <span className="text-[#6e6e73]">Expires On</span>
                  <div className="text-right">
                    <span className="font-bold text-[#059669] block">{formatDate(expiryDate)}</span>
                    {expiryDate && (
                      <span className="text-[11px] text-[#8a9bb2] font-mono block">{expiryDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-[#f2f5fc] pb-2">
                  <span className="text-[#6e6e73]">Updated On</span>
                  <div className="text-right">
                    <span className="font-medium text-[#1d1d1f] block">{formatDate(updatedDate)}</span>
                    {updatedDate && (
                      <span className="text-[11px] text-[#8a9bb2] font-mono block">{updatedDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <span className="text-[#6e6e73] shrink-0">Nameservers</span>
                  <div className="flex flex-col items-end gap-1.5 font-mono text-[12px] text-[#1d1d1f]">
                    {nameServers.length > 0 ? (
                      nameServers.map((ns) => (
                        <span
                          key={ns}
                          className="px-2.5 py-0.5 rounded-md bg-[#fbfcfe] border border-[#eef2f8] font-semibold text-[#2a3b50]"
                        >
                          {ns}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8a9bb2] font-sans">No nameservers listed in WHOIS</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registrant / Contact Information (if present) */}
            {(registrantOrg || registrantName || registrantCountry || registrantState || registrantEmail) && (
              <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4 md:col-span-2">
                <div className="flex items-center justify-between border-b border-[#f2f5fc] pb-3">
                  <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1787D4]" />
                    Registrant & Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                  {registrantOrg && (
                    <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                      <span className="text-[11.5px] text-[#6e6e73] font-medium block">Organization</span>
                      <span className="font-semibold text-[#1d1d1f] mt-0.5 block">{registrantOrg}</span>
                    </div>
                  )}
                  {registrantName && (
                    <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                      <span className="text-[11.5px] text-[#6e6e73] font-medium block">Name</span>
                      <span className="font-semibold text-[#1d1d1f] mt-0.5 block">{registrantName}</span>
                    </div>
                  )}
                  {(registrantState || registrantCountry) && (
                    <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                      <span className="text-[11.5px] text-[#6e6e73] font-medium block">Location</span>
                      <span className="font-semibold text-[#1d1d1f] mt-0.5 block">
                        {[registrantCity, registrantState, registrantCountry].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {registrantEmail && (
                    <div className="bg-[#fbfcfe] p-3 rounded-xl border border-[#eef2f8]">
                      <span className="text-[11.5px] text-[#6e6e73] font-medium block">Contact / Email Form</span>
                      {registrantEmail.startsWith("http") ? (
                        <a
                          href={registrantEmail}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1787D4] hover:underline text-[12px] font-mono break-all inline-flex items-center gap-1 mt-0.5"
                        >
                          Contact Form <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-[#1d1d1f] text-[12px] break-all mt-0.5 block">
                          {registrantEmail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* All Parsed WHOIS Attributes Table */}
          {allAttributes.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden mt-2">
              <div className="p-5 border-b border-[#f2f5fc] flex items-center justify-between bg-[#fbfcfe]">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-[#1787D4]" />
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    All WHOIS Record Fields ({allAttributes.length})
                  </h3>
                </div>

                <span className="text-[12px] text-[#8a9bb2] font-mono">
                  {domainName}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#eef2f8] bg-[#fafbfd]">
                      <th className="py-3 px-6 text-[12px] font-semibold text-[#5a6a85] w-64">
                        Field Name
                      </th>
                      <th className="py-3 px-6 text-[12px] font-semibold text-[#5a6a85]">
                        Value
                      </th>
                      <th className="py-3 px-6 text-[12px] font-semibold text-[#5a6a85] text-right w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f5fc]">
                    {allAttributes.map(([key, val]) => {
                      let displayVal = "";
                      if (Array.isArray(val)) {
                        displayVal = val.join("\n");
                      } else if (typeof val === "object" && val !== null) {
                        displayVal = JSON.stringify(val);
                      } else {
                        displayVal = String(val);
                      }

                      const isCopied = copiedKey === `attr-${key}`;
                      return (
                        <tr key={key} className="hover:bg-[#fbfcfe] transition-colors">
                          <td className="py-3.5 px-6 font-mono text-[12.5px] font-medium text-[#5a6a85] align-top">
                            {formatFieldKey(key)}
                            <span className="block text-[10.5px] text-[#8a9bb2] font-mono mt-0.5">{key}</span>
                          </td>
                          <td className="py-3.5 px-6 text-[13px] text-[#1d1d1f] align-top">
                            <span className="font-mono text-[12.5px] break-all whitespace-pre-line leading-relaxed text-[#2a3b50]">
                              {displayVal}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right align-top">
                            <button
                              onClick={() => handleCopy(displayVal, `attr-${key}`)}
                              className="p-1 rounded-md hover:bg-[#f2f5fc] text-[#8a9bb2] hover:text-[#1787D4] transition-colors cursor-pointer"
                              title={`Copy ${key}`}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WhoisLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-[14px] text-[#6e6e73]">Loading WHOIS tool...</p>
        </div>
      }
    >
      <WhoisContent />
    </Suspense>
  );
}
