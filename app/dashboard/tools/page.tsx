"use client";

import Link from "next/link";
import {
  Search,
  Check,
  Globe,
  ShieldCheck,
  ArrowRight,
  Server,
  FileSearch,
  MoveRight,
  Network,
} from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  href: string;
  popular?: boolean;
  iconType: "domain-search" | "dns" | "whois" | "ssl" | "migration" | "ip";
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: "domain-search",
    title: "Domain Search",
    description: "Find an available domain.",
    href: "/dashboard/tools/domain-search",
    popular: true,
    iconType: "domain-search",
  },
  {
    id: "dns-lookup",
    title: "DNS Lookup",
    description: "Check DNS information for a domain.",
    href: "/dashboard/tools/dns-lookup",
    iconType: "dns",
  },
  {
    id: "whois-lookup",
    title: "WHOIS Lookup",
    description: "View available domain registration information.",
    href: "/dashboard/tools/whois-lookup",
    iconType: "whois",
  },
  {
    id: "ssl-checker",
    title: "SSL Checker",
    description: "Check the SSL status of a website.",
    href: "/dashboard/tools/ssl-checker",
    iconType: "ssl",
  },
  {
    id: "website-migration",
    title: "Website Migration",
    description: "Start moving your website.",
    href: "/dashboard/tools/migration",
    iconType: "migration",
  },
  {
    id: "ip-lookup",
    title: "IP Lookup",
    description: "Look up IP and network information.",
    href: "/dashboard/tools/ip-lookup",
    iconType: "ip",
  },
];

export default function ToolsDashboardPage() {
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
          Useful tools to help you manage and grow your online presence.
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
                <div className="flex items-center justify-between mb-5">
                  {/* Icon Box */}
                  {tool.iconType === "domain-search" ? (
                    <div className="w-10 h-10 rounded-full border-2 border-[#ff80b5]/50 flex items-center justify-center bg-[#fff0f6]">
                      <div className="w-4 h-4 rounded-full border-2 border-[#ff4d88]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl border border-[#e2eaff] flex items-center justify-center bg-[#f8fafc] text-[#5a6a85]">
                      <Check className="w-5 h-5 text-[#6e6e73]" />
                    </div>
                  )}

                  {/* Popular Badge */}
                  {tool.popular && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1787D4] text-white text-[10px] font-bold uppercase tracking-wider">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Tool Title */}
                <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-1">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-2">
                <Link
                  href={tool.href}
                  id={`btn-open-${tool.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
                >
                  Open Tool →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
