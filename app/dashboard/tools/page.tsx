"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  ShieldCheck,
  Server,
  FileSearch,
  ArrowRight,
  Network,
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
  const [activeToolId, setActiveToolId] = useState<string>("domain-search");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("active_tool_id");
      if (saved && TOOLS_LIST.some((t) => t.id === saved)) {
        setActiveToolId(saved);
      }
    }
  }, []);

  const handleToolSelect = (id: string) => {
    setActiveToolId(id);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("active_tool_id", id);
      } catch {}
    }
  };

  const renderToolIcon = (iconType: ToolItem["iconType"]) => {
    const iconClass = "w-5 h-5 text-[#1787D4]";
    const iconBoxClass =
      "w-10 h-10 rounded-xl border border-[#d6e4ff] flex items-center justify-center bg-[#eff6ff] text-[#1787D4]";

    switch (iconType) {
      case "domain-search":
        return (
          <div className={iconBoxClass}>
            <Search className={iconClass} />
          </div>
        );
      case "dns":
        return (
          <div className={iconBoxClass}>
            <Network className={iconClass} />
          </div>
        );
      case "whois":
        return (
          <div className={iconBoxClass}>
            <FileSearch className={iconClass} />
          </div>
        );
      case "ssl":
        return (
          <div className={iconBoxClass}>
            <ShieldCheck className={iconClass} />
          </div>
        );
      case "migration":
        return (
          <div className={iconBoxClass}>
            <Server className={iconClass} />
          </div>
        );
      case "ip":
        return (
          <div className={iconBoxClass}>
            <Globe className={iconClass} />
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
          const isActive = activeToolId === tool.id;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              id={`tool-card-${tool.id}`}
              onClick={() => handleToolSelect(tool.id)}
              className={`group bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-2 border-[#1787D4] shadow-md ring-2 ring-[#1787D4]/10"
                  : "border border-[#e2eaff] hover:border-[#1787D4]/60 hover:shadow-md"
              }`}
            >
              <div>
                {/* Icon and Optional Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  {renderToolIcon(tool.iconType)}

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-[#eff6fb] text-[#1787D4] text-[10px] font-bold tracking-wider uppercase">
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
                <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-1.5 group-hover:text-[#1787D4] transition-colors">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="mt-6 pt-3 border-t border-[#f2f5fc] flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[#1787D4] group-hover:text-[#1371B5] text-[13px] font-semibold transition-colors">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="text-[11px] text-[#8a9bb2] font-mono">
                  {tool.id}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
