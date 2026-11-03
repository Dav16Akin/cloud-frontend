"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  href: string;
  iconType: "domain-search" | "dns" | "whois" | "ssl" | "migration" | "ip";
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: "domain-search",
    title: "Domain search",
    description: "Find and register an available custom domain name.",
    href: "/dashboard/tools/domain-search",
    iconType: "domain-search",
  },
  {
    id: "dns-lookup",
    title: "DNS lookup",
    description: "Check live authoritative DNS records: A, NS, MX and SOA.",
    href: "/dashboard/tools/dns-lookup",
    iconType: "dns",
  },
  {
    id: "whois-lookup",
    title: "WHOIS lookup",
    description: "View a domain's registration details, registrar and dates.",
    href: "/dashboard/tools/whois-lookup",
    iconType: "whois",
  },
  {
    id: "ssl-checker",
    title: "SSL checker",
    description: "Verify an SSL certificate's validity, issuer and expiry.",
    href: "/dashboard/tools/ssl-checker",
    iconType: "ssl",
  },
  {
    id: "website-migration",
    title: "Website migration",
    description: "Request a move of your existing website to Nupat Cloud.",
    href: "/dashboard/tools/migration",
    iconType: "migration",
  },
  {
    id: "ip-lookup",
    title: "IP lookup",
    description: "Look up an IP's location, ASN and ISP network.",
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">Tools</h1>
        <p className="mt-1 text-sm text-[#5A6A85]">
          Diagnostic and management tools to inspect, verify and grow your online infrastructure.
        </p>
      </div>

      {/* Tools grid (2 rows x 3 columns) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS_LIST.map((tool) => {
          const isActive = activeToolId === tool.id;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              id={`tool-card-${tool.id}`}
              onClick={() => handleToolSelect(tool.id)}
              className={`group flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                isActive
                  ? "border-[#1787D4] ring-1 ring-inset ring-[#1787D4]"
                  : "border-[#E2E8F0] hover:border-[#D5DCE6]"
              }`}
            >
              <div>
                {/* Tool title */}
                <h3 className="mb-1 text-base font-semibold text-[#031033]">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#5A6A85]">{tool.description}</p>
              </div>

              {/* Action link footer */}
              <div className="mt-5 flex items-center border-t border-[#EEF2F7] pt-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] transition-colors group-hover:text-[#1370B5]">
                  <span>Open tool</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
