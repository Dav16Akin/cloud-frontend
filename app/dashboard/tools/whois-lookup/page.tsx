"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Loader2, ShieldCheck, Calendar, Globe, Building } from "lucide-react";

function WhoisContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get("domain") || "acme.com";

  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [whoisData, setWhoisData] = useState({
    domainName: initialDomain,
    registrar: "NameCheap, Inc.",
    registeredOn: "2018-04-12T00:00:00Z",
    expiresOn: "2027-04-12T00:00:00Z",
    updatedOn: "2024-03-10T00:00:00Z",
    status: ["clientTransferProhibited", "clientUpdateProhibited"],
    nameServers: ["ns1.nupatcloud.com", "ns2.nupatcloud.com"],
    dnssec: "unsigned",
  });

  useEffect(() => {
    if (searchParams.get("domain")) {
      setDomain(searchParams.get("domain")!);
      setWhoisData((prev) => ({
        ...prev,
        domainName: searchParams.get("domain")!,
      }));
    }
  }, [searchParams]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "");
      setWhoisData({
        domainName: clean,
        registrar: "NameCheap, Inc. / Nupat Technologies",
        registeredOn: "2021-06-18",
        expiresOn: "2027-06-18",
        updatedOn: "2024-06-15",
        status: ["clientTransferProhibited"],
        nameServers: ["ns1.nupatcloud.com", "ns2.nupatcloud.com"],
        dnssec: "unsigned",
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
          WHOIS Lookup
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          View available domain registration information, registrar details, and status.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleLookup} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="acme.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60 shrink-0"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lookup WHOIS
          </button>
        </form>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domain & Registrar */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1787D4]" /> Registration Overview
          </h3>
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Domain</span>
              <span className="font-bold text-[#1d1d1f]">{whoisData.domainName}</span>
            </div>
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Registrar</span>
              <span className="font-semibold text-[#1d1d1f]">{whoisData.registrar}</span>
            </div>
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Status</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {whoisData.status.map((st) => (
                  <span
                    key={st}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0f5ff] text-[#1787D4]"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6e6e73]">DNSSEC</span>
              <span className="font-medium text-[#1d1d1f]">{whoisData.dnssec}</span>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1787D4]" /> Key Dates
          </h3>
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Registered On</span>
              <span className="font-semibold text-[#1d1d1f]">{whoisData.registeredOn}</span>
            </div>
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Expires On</span>
              <span className="font-semibold text-[#12a150]">{whoisData.expiresOn}</span>
            </div>
            <div className="flex justify-between border-b border-[#f2f5fc] pb-2">
              <span className="text-[#6e6e73]">Updated On</span>
              <span className="font-medium text-[#1d1d1f]">{whoisData.updatedOn}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#6e6e73]">Nameservers</span>
              <div className="flex flex-col items-end gap-1 font-mono text-[12px] text-[#1d1d1f]">
                {whoisData.nameServers.map((ns) => (
                  <span key={ns}>{ns}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhoisLookupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading WHOIS tool...</div>}>
      <WhoisContent />
    </Suspense>
  );
}
