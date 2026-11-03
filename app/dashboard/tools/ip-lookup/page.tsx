"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Globe, MapPin, AlertCircle } from "lucide-react";

interface IpData {
  ip: string;
  hostname?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  postal?: string;
  org?: string;
  asn?: string;
  timezone?: string;
}

export default function IpLookupToolPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipData, setIpData] = useState<IpData | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    if (!clean) return;

    setLoading(true);
    setError(null);

    try {
      // Use standard IP lookup
      const res = await fetch(`https://ipapi.co/${clean}/json/`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.reason || "Unable to lookup the specified IP or host.");
      }

      setIpData({
        ip: data.ip || clean,
        hostname: data.hostname || clean,
        country: data.country_name || "Unknown",
        countryCode: data.country_code || "—",
        region: data.region || "—",
        city: data.city || "—",
        postal: data.postal || "—",
        org: data.org || "—",
        asn: data.asn || "—",
        timezone: data.timezone || "—",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup IP information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
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

      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">IP lookup</h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          Inspect geolocation, autonomous system (ASN), ISP and organisation details for any IP or hostname.
        </p>
      </div>

      {/* Input bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <input
            id="input-ip"
            type="text"
            placeholder="Enter IP or hostname (e.g. 102.89.23.4 or example.com)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-10 px-5 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Look up IP
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-[#FDECEC] border border-[#DC2626]/20 rounded-lg px-4 py-3 flex items-center gap-2 text-[#C21F1F] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Details Grid or Empty prompt */}
      {ipData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5A6A85]" /> IP and network details
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">IP address</span>
                <span className="font-mono font-medium text-[#031033]">{ipData.ip}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">Hostname</span>
                <span className="font-mono text-[#031033] text-right break-all">{ipData.hostname}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">ISP / organisation</span>
                <span className="text-right text-[#031033]">{ipData.org}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5A6A85]">Autonomous system (ASN)</span>
                <span className="font-mono text-[#031033]">{ipData.asn}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5A6A85]" /> Geolocation
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">Country</span>
                <span className="text-right text-[#031033]">{ipData.country} ({ipData.countryCode})</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">Region / city</span>
                <span className="text-right text-[#031033]">{ipData.region}, {ipData.city}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EEF2F7] pb-3">
                <span className="text-[#5A6A85]">Postal code</span>
                <span className="tabular-nums text-[#031033]">{ipData.postal}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5A6A85]">Timezone</span>
                <span className="text-[#031033]">{ipData.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center flex flex-col items-center justify-center text-[#5A6A85]">
          <p className="text-sm font-medium text-[#031033]">No IP looked up yet</p>
          <p className="text-sm text-[#5A6A85] mt-1 max-w-sm">
            Enter an IP address or hostname above to inspect geolocation, ASN and network carrier data.
          </p>
        </div>
      )}
    </div>
  );
}
