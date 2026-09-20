"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  ShieldCheck,
  Server,
  FileSearch,
  ArrowRight,
  Network,
  Radio,
} from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  href: string;
  popular?: boolean;
  badge?: string;
  iconType: "domain-search" | "dns" | "whois" | "ssl" | "migration" | "ip";
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: "domain-search",
    title: "Domain Search",
    description: "Find and register an available custom domain name.",
    href: "/dashboard/tools/domain-search",
    popular: true,
    iconType: "domain-search",
  },
  {
    id: "dns-lookup",
    title: "DNS Lookup",
    description: "Check live authoritative DNS records, NS, MX, and SOA.",
    href: "/dashboard/tools/dns-lookup",
    badge: "NEW",
    iconType: "dns",
  },
  {
    id: "whois-lookup",
    title: "WHOIS Lookup",
    description: "View domain registration details, registrar, and dates.",
    href: "/dashboard/tools/whois-lookup",
    badge: "NEW",
    iconType: "whois",
  },
  {
    id: "ssl-checker",
    title: "SSL Checker",
    description: "Verify SSL certificate validity, issuer, and expiration.",
    href: "/dashboard/tools/ssl-checker",
    iconType: "ssl",
  },
  {
    id: "website-migration",
    title: "Website Migration",
    description: "Start moving your website seamlessly to Nupat Cloud.",
    href: "/dashboard/tools/migration",
    iconType: "migration",
  },
  {
    id: "ip-lookup",
    title: "IP Lookup",
    description: "Look up IP geolocation, ASN information, and ISP network details.",
    href: "/dashboard/tools/ip-lookup",
    iconType: "ip",
  },
];

export default function ToolsDashboardPage() {
  const router = useRouter();
  const [quickDnsDomain, setQuickDnsDomain] = useState("");
  const [quickWhoisDomain, setQuickWhoisDomain] = useState("");

  const handleQuickDnsLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickDnsDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");
    if (clean) {
      router.push(`/dashboard/tools/dns-lookup?domain=${encodeURIComponent(clean)}`);
    } else {
      router.push("/dashboard/tools/dns-lookup");
    }
  };

  const handleQuickWhoisLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickWhoisDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");
    if (clean) {
      router.push(`/dashboard/tools/whois-lookup?domain=${encodeURIComponent(clean)}`);
    } else {
      router.push("/dashboard/tools/whois-lookup");
    }
  };

  const renderToolIcon = (iconType: ToolItem["iconType"]) => {
    switch (iconType) {
      case "domain-search":
        return (
          <div className="w-10 h-10 rounded-xl border border-pink-200 flex items-center justify-center bg-pink-50 text-pink-600">
            <Search className="w-5 h-5" />
          </div>
        );
      case "dns":
        return (
          <div className="w-10 h-10 rounded-xl border border-[#d6e4ff] flex items-center justify-center bg-[#eff6ff] text-[#1787D4]">
            <Network className="w-5 h-5" />
          </div>
        );
      case "whois":
        return (
          <div className="w-10 h-10 rounded-xl border border-indigo-200 flex items-center justify-center bg-indigo-50 text-indigo-600">
            <FileSearch className="w-5 h-5" />
          </div>
        );
      case "ssl":
        return (
          <div className="w-10 h-10 rounded-xl border border-emerald-200 flex items-center justify-center bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
      case "migration":
        return (
          <div className="w-10 h-10 rounded-xl border border-amber-200 flex items-center justify-center bg-amber-50 text-amber-700">
            <Server className="w-5 h-5" />
          </div>
        );
      case "ip":
        return (
          <div className="w-10 h-10 rounded-xl border border-cyan-200 flex items-center justify-center bg-cyan-50 text-cyan-700">
            <Globe className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2
          className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Tools
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Diagnostic and management tools to inspect, verify, and grow your online infrastructure.
        </p>
      </div>

      {/* Tools Grid (2 rows x 3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-1">
        {TOOLS_LIST.map((tool) => {
          return (
            <div
              key={tool.id}
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                tool.popular
                  ? "border-2 border-[#1787D4]"
                  : "border border-[#e2eaff]"
              }`}
            >
              <div>
                {/* Icon and Optional Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  {renderToolIcon(tool.iconType)}

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold tracking-wider uppercase">
                        {tool.badge}
                      </span>
                    )}
                    {tool.popular && (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#1787D4] text-white text-[10px] font-bold uppercase tracking-wider">
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>

                {/* Tool Title */}
                <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-1">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                  {tool.description}
                </p>

                {/* Extra inline quick input for DNS Lookup */}
                {tool.id === "dns-lookup" && (
                  <form onSubmit={handleQuickDnsLookup} className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. dcdatalab.com"
                      value={quickDnsDomain}
                      onChange={(e) => setQuickDnsDomain(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-[#fbfcfe] border border-[#e2eaff] rounded-xl text-[12px] text-[#1d1d1f] placeholder:text-[#8a9bb2] focus:outline-none focus:border-[#1787D4]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Lookup
                    </button>
                  </form>
                )}

                {/* Extra inline quick input for WHOIS Lookup */}
                {tool.id === "whois-lookup" && (
                  <form onSubmit={handleQuickWhoisLookup} className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. dcdatalab.com"
                      value={quickWhoisDomain}
                      onChange={(e) => setQuickWhoisDomain(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 bg-[#fbfcfe] border border-[#e2eaff] rounded-xl text-[12px] text-[#1d1d1f] placeholder:text-[#8a9bb2] focus:outline-none focus:border-[#1787D4]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Lookup
                    </button>
                  </form>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-2 border-t border-[#f2f5fc] flex items-center justify-between">
                <Link
                  href={tool.href}
                  id={`btn-open-${tool.id}`}
                  className="inline-flex items-center gap-1.5 text-[#1787D4] hover:text-[#1371B5] text-[13px] font-semibold transition-colors"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-[#8a9bb2] font-mono">
                  {tool.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
