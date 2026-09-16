"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Globe, Server } from "lucide-react";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export default function DnsLookupToolPage() {
  const [domain, setDomain] = useState("nupatcloud.com");
  const [recordType, setRecordType] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DnsRecord[]>([
    { type: "A", name: "nupatcloud.com", value: "198.51.100.24", ttl: 3600 },
    { type: "AAAA", name: "nupatcloud.com", value: "2001:db8::1", ttl: 3600 },
    { type: "CNAME", name: "www.nupatcloud.com", value: "nupatcloud.com", ttl: 3600 },
    { type: "MX", name: "nupatcloud.com", value: "mail.nupatcloud.com (Priority: 10)", ttl: 14400 },
    { type: "TXT", name: "nupatcloud.com", value: "v=spf1 include:_spf.google.com ~all", ttl: 3600 },
    { type: "NS", name: "nupatcloud.com", value: "ns1.nupatcloud.com", ttl: 86400 },
    { type: "NS", name: "nupatcloud.com", value: "ns2.nupatcloud.com", ttl: 86400 },
  ]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "");
      setRecords([
        { type: "A", name: clean, value: "104.21.48.112", ttl: 300 },
        { type: "AAAA", name: clean, value: "2606:4700:3038::6815:3070", ttl: 300 },
        { type: "CNAME", name: `www.${clean}`, value: clean, ttl: 3600 },
        { type: "MX", name: clean, value: `mail.${clean} (Priority: 10)`, ttl: 3600 },
        { type: "TXT", name: clean, value: "v=spf1 +a +mx ~all", ttl: 3600 },
        { type: "NS", name: clean, value: "ns1.nupatcloud.com", ttl: 86400 },
        { type: "NS", name: clean, value: "ns2.nupatcloud.com", ttl: 86400 },
      ]);
    }, 600);
  };

  const filteredRecords =
    recordType === "ALL"
      ? records
      : records.filter((r) => r.type === recordType);

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
          DNS Lookup
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Check DNS information and active nameservers for any domain.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full sm:w-36 px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4]"
          >
            <option value="ALL">All Records</option>
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="MX">MX</option>
            <option value="TXT">TXT</option>
            <option value="NS">NS</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lookup DNS
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">Type</th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">Host / Name</th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">Value / Target</th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5fc]">
              {filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-[#fbfcfe] transition-colors">
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f0f5ff] text-[#1787D4] border border-[#d6e4ff]">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-[#1d1d1f]">{r.name}</td>
                  <td className="py-4 px-6 text-[13px] text-[#5a6a85] font-mono break-all">{r.value}</td>
                  <td className="py-4 px-6 text-[13px] text-[#6e6e73] text-right">{r.ttl}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
