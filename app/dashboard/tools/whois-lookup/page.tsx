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
  ShieldCheck,
  Server,
  User,
  Copy,
  Check,
  AlertCircle,
  Code,
  ExternalLink,
  RefreshCw,
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tools
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#031033]">WHOIS lookup</h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Inspect domain registration details, registrar, active nameservers and expiry dates.
          </p>
        </div>

        {whoisData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-[#D5DCE6] text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-[#5A6A85]" />
              {showRawJson ? "Hide JSON" : "Raw JSON"}
            </button>
            <button
              onClick={() => executeLookup(domain)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-[#D5DCE6] text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#5A6A85] ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
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
                Querying WHOIS…
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Look up WHOIS
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
            <h4 className="text-sm font-medium">WHOIS query failed</h4>
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
      {loading && !whoisData && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm font-medium text-[#031033]">Querying WHOIS registry for {domain}…</p>
          <p className="text-xs text-[#5A6A85]">Retrieving registrar details, expiry dates and nameserver delegation.</p>
        </div>
      )}

      {/* Initial Empty State */}
      {!loading && !whoisData && !error && !hasLookedUp && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center">
          <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-[#031033]">
              No WHOIS lookup performed yet
            </p>
            <p className="text-sm text-[#5A6A85]">
              Enter a domain name above and select &ldquo;Look up WHOIS&rdquo; to query live registration details and status.
            </p>
          </div>
        </div>
      )}

      {/* Live WHOIS Data Presentation */}
      {whoisData && (
        <>
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#EEF2F7] sm:grid-cols-4">
            {/* Domain Status */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Domain</span>
              <div className="mt-1 truncate font-mono text-base font-semibold text-[#031033]">
                {domainName}
              </div>
              <p className="mt-0.5 text-xs text-[#5A6A85]">
                DNSSEC: <span className="font-medium text-[#031033]">{dnssec}</span>
              </p>
            </div>

            {/* Registrar */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Registrar</span>
              <div className="mt-1 truncate text-base font-semibold text-[#031033]">
                {registrar}
              </div>
              <p className="mt-0.5 text-xs tabular-nums text-[#5A6A85]">
                IANA ID: {registrarIana || "—"}
              </p>
            </div>

            {/* Registered On */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Registered</span>
              <div className="mt-1 text-base font-semibold tabular-nums text-[#031033]">
                {formatDate(creationDate)}
              </div>
              <p className="mt-0.5 text-xs tabular-nums text-[#5A6A85]">
                Updated {formatDate(updatedDate)}
              </p>
            </div>

            {/* Expires On */}
            <div className="min-w-0 bg-white px-5 py-4">
              <span className="text-xs text-[#5A6A85]">Expires</span>
              <div className="mt-1 text-base font-semibold tabular-nums text-[#031033]">
                {formatDate(expiryDate)}
              </div>
              <p className="mt-0.5 text-xs text-[#5A6A85]">
                Active registration
              </p>
            </div>
          </div>

          {/* Raw JSON View */}
          {showRawJson && (
            <div className="bg-[#031033] text-[#E2E8F0] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-medium text-white">Raw WHOIS JSON</span>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(whoisData, null, 2), "whois-json")}
                  className="inline-flex items-center gap-1.5 h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === "whois-json" ? (
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
                {JSON.stringify(whoisData, null, 2)}
              </pre>
            </div>
          )}

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration & Authority Overview */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5A6A85]" />
                  Registration and authority
                </h3>
                <button
                  onClick={() =>
                    handleCopy(
                      `Domain: ${domainName}\nRegistrar: ${registrar}\nIANA ID: ${registrarIana}\nRegistered: ${creationDate}\nExpires: ${expiryDate}`,
                      "reg-overview",
                    )
                  }
                  className="text-sm text-[#1787D4] hover:text-[#1370B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "reg-overview" ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "reg-overview" ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Domain name</span>
                  <span className="font-medium text-[#031033] font-mono">{domainName}</span>
                </div>

                {registryDomainId && (
                  <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                    <span className="text-[#5A6A85]">Registry domain ID</span>
                    <span className="font-mono text-xs text-right break-all text-[#031033]">{registryDomainId}</span>
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Registrar</span>
                  <span className="text-[#031033] text-right">{registrar}</span>
                </div>

                {registrarUrl && (
                  <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                    <span className="text-[#5A6A85]">Registrar URL</span>
                    <a
                      href={registrarUrl.startsWith("http") ? registrarUrl : `http://${registrarUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1787D4] hover:underline flex items-center gap-1 font-mono text-xs"
                    >
                      {registrarUrl.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {registrarWhoisServer && (
                  <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                    <span className="text-[#5A6A85]">Registrar WHOIS</span>
                    <span className="font-mono text-xs text-[#031033]">{registrarWhoisServer}</span>
                  </div>
                )}

                {abuseEmail && (
                  <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                    <span className="text-[#5A6A85]">Abuse email</span>
                    <span className="font-mono text-[#031033] text-xs">{abuseEmail}</span>
                  </div>
                )}

                {abusePhone && (
                  <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                    <span className="text-[#5A6A85]">Abuse phone</span>
                    <span className="font-mono text-[#031033] text-xs">{abusePhone}</span>
                  </div>
                )}

                <div className="flex justify-between items-start pt-1">
                  <span className="text-[#5A6A85] shrink-0">Domain status</span>
                  <div className="flex flex-col items-end gap-1 max-w-[280px]">
                    {statuses.length > 0 ? (
                      statuses.map((st) => (
                        <span
                          key={st}
                          className="inline-flex items-center gap-2 text-sm text-[#031033] break-all"
                        >
                          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#9AA6B8]" />
                          {st}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#5A6A85]">active / ok</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Active Nameservers */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5A6A85]" />
                  Dates and delegation
                </h3>
                <button
                  onClick={() =>
                    handleCopy(
                      `Registered: ${creationDate}\nExpires: ${expiryDate}\nUpdated: ${updatedDate}\nNameservers: ${nameServers.join(", ")}`,
                      "dates-ns",
                    )
                  }
                  className="text-sm text-[#1787D4] hover:text-[#1370B5] font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "dates-ns" ? <Check className="w-3.5 h-3.5 text-[#0E7C3A]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "dates-ns" ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Registered</span>
                  <div className="text-right">
                    <span className="font-medium tabular-nums text-[#031033] block">{formatDate(creationDate)}</span>
                    {creationDate && (
                      <span className="text-xs text-[#5A6A85] font-mono block">{creationDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Expires</span>
                  <div className="text-right">
                    <span className="font-medium tabular-nums text-[#031033] block">{formatDate(expiryDate)}</span>
                    {expiryDate && (
                      <span className="text-xs text-[#5A6A85] font-mono block">{expiryDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 border-b border-[#EEF2F7] pb-3">
                  <span className="text-[#5A6A85]">Updated</span>
                  <div className="text-right">
                    <span className="font-medium tabular-nums text-[#031033] block">{formatDate(updatedDate)}</span>
                    {updatedDate && (
                      <span className="text-xs text-[#5A6A85] font-mono block">{updatedDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <span className="text-[#5A6A85] shrink-0">Nameservers</span>
                  <div className="flex flex-col items-end gap-1.5 font-mono text-xs text-[#031033]">
                    {nameServers.length > 0 ? (
                      nameServers.map((ns) => (
                        <span
                          key={ns}
                          className="px-2 py-0.5 rounded-md bg-[#F2F5FC] text-[#031033]"
                        >
                          {ns}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#5A6A85] font-sans">No nameservers listed in WHOIS</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registrant / Contact Information (if present) */}
            {(registrantOrg || registrantName || registrantCountry || registrantState || registrantEmail) && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4 md:col-span-2">
                <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                  <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#5A6A85]" />
                    Registrant and contact information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {registrantOrg && (
                    <div className="bg-[#F2F5FC] p-3 rounded-lg">
                      <span className="text-xs text-[#5A6A85] block">Organisation</span>
                      <span className="font-medium text-[#031033] mt-0.5 block">{registrantOrg}</span>
                    </div>
                  )}
                  {registrantName && (
                    <div className="bg-[#F2F5FC] p-3 rounded-lg">
                      <span className="text-xs text-[#5A6A85] block">Name</span>
                      <span className="font-medium text-[#031033] mt-0.5 block">{registrantName}</span>
                    </div>
                  )}
                  {(registrantState || registrantCountry) && (
                    <div className="bg-[#F2F5FC] p-3 rounded-lg">
                      <span className="text-xs text-[#5A6A85] block">Location</span>
                      <span className="font-medium text-[#031033] mt-0.5 block">
                        {[registrantCity, registrantState, registrantCountry].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {registrantEmail && (
                    <div className="bg-[#F2F5FC] p-3 rounded-lg">
                      <span className="text-xs text-[#5A6A85] block">Contact / email form</span>
                      {registrantEmail.startsWith("http") ? (
                        <a
                          href={registrantEmail}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1787D4] hover:underline text-xs font-mono break-all inline-flex items-center gap-1 mt-0.5"
                        >
                          Contact form <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-[#031033] text-xs break-all mt-0.5 block">
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
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-[#5A6A85]" />
                  <h3 className="text-base font-semibold text-[#031033]">
                    All WHOIS record fields <span className="font-normal tabular-nums text-[#5A6A85]">({allAttributes.length})</span>
                  </h3>
                </div>

                <span className="text-xs text-[#5A6A85] font-mono">
                  {domainName}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] w-64">
                        Field name
                      </th>
                      <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85]">
                        Value
                      </th>
                      <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] text-right w-20">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7]">
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
                        <tr key={key} className="hover:bg-[#F2F5FC]/60 transition-colors">
                          <td className="py-3 px-5 text-sm text-[#031033] align-top">
                            {formatFieldKey(key)}
                            <span className="block text-xs text-[#5A6A85] font-mono mt-0.5">{key}</span>
                          </td>
                          <td className="py-3 px-5 text-sm text-[#031033] align-top">
                            <span className="font-mono text-xs break-all whitespace-pre-line text-[#031033]">
                              {displayVal}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right align-top">
                            <button
                              onClick={() => handleCopy(displayVal, `attr-${key}`)}
                              className="p-1.5 rounded-lg hover:bg-[#F2F5FC] text-[#5A6A85] hover:text-[#031033] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                              title={`Copy ${key}`}
                              aria-label={`Copy ${key}`}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-[#0E7C3A]" />
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
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading WHOIS lookup…</p>
        </div>
      }
    >
      <WhoisContent />
    </Suspense>
  );
}
