"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Globe, MapPin, Server } from "lucide-react";

export default function IpLookupToolPage() {
  const [query, setQuery] = useState("102.89.23.4");
  const [loading, setLoading] = useState(false);
  const [ipData, setIpData] = useState({
    ip: "102.89.23.4",
    hostname: "host-102-89-23-4.ng.net",
    country: "Nigeria",
    countryCode: "NG",
    region: "Lagos",
    city: "Lagos",
    postal: "100001",
    org: "MTN Nigeria Communications Limited",
    asn: "AS29465",
    timezone: "Africa/Lagos (GMT+1)",
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIpData({
        ip: query.trim(),
        hostname: `host-${query.trim().replace(/\./g, "-")}.net`,
        country: "Nigeria",
        countryCode: "NG",
        region: "Lagos",
        city: "Ikeja",
        postal: "100271",
        org: "Airtel Networks Ltd",
        asn: "AS36873",
        timezone: "Africa/Lagos (GMT+1)",
      });
    }, 600);
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
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Look up IP geolocation, ASN information, and ISP network details.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleLookup} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="102.89.23.4 or example.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60 shrink-0"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lookup IP
          </button>
        </form>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
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

        <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
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
    </div>
  );
}
