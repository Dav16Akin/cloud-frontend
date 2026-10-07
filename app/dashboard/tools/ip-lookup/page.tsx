"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Globe, MapPin, Server, AlertCircle } from "lucide-react";

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
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tools
        </Link>
      </div>

      <div>
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          IP Lookup
        </h2>
        <p className="text-[14px] text-[#6e6e73] mt-1">
          Inspect geolocation, autonomous system (ASN), ISP, and organization details for any IP or hostname.
        </p>
      </div>

      {/* Input bar */}
      <div className="bg-white rounded-lg border border-[#e2eaff] p-4 shadow-sm">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <input
            id="input-ip"
            type="text"
            placeholder="Enter IP or hostname (e.g. 102.89.23.4 or example.com)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#e2eaff] rounded-lg text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-lg transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lookup IP
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Details Grid or Empty prompt */}
      {ipData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1787D4]" /> IP & Network Details
            </h3>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">IP Address</span>
                <span className="font-mono font-bold text-[#1d1d1f]">{ipData.ip}</span>
              </div>
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">Hostname</span>
                <span className="font-mono text-[#5a6a85]">{ipData.hostname}</span>
              </div>
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">ISP / Organization</span>
                <span className="font-semibold text-[#1d1d1f]">{ipData.org}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Autonomous System (ASN)</span>
                <span className="font-mono font-semibold text-[#1787D4]">{ipData.asn}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1787D4]" /> Geolocation
            </h3>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">Country</span>
                <span className="font-semibold text-[#1d1d1f]">{ipData.country} ({ipData.countryCode})</span>
              </div>
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">Region / City</span>
                <span className="font-semibold text-[#1d1d1f]">{ipData.region}, {ipData.city}</span>
              </div>
              <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
                <span className="text-[#6e6e73]">Postal Code</span>
                <span className="font-medium text-[#1d1d1f]">{ipData.postal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73]">Timezone</span>
                <span className="font-medium text-[#1d1d1f]">{ipData.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-lg border border-[#e2eaff] p-12 text-center flex flex-col items-center justify-center text-[#6e6e73]">
          <Server className="w-10 h-10 text-[#8a9bb2] mb-3" />
          <p className="text-[15px] font-semibold text-[#1d1d1f]">No IP looked up yet</p>
          <p className="text-[13px] text-[#6e6e73] mt-1 max-w-sm">
            Enter an IP address or hostname above to inspect geolocation, ASN, and network carrier data.
          </p>
        </div>
      )}
    </div>
  );
}
