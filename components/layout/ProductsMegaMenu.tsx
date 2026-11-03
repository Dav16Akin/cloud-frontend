"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  ArrowRightLeft,
  Server,
  ArrowRight,
  BookOpen,
  Headphones,
  Tag,
  /* Icons preserved for commented-out items:
  Settings,
  Monitor,
  Cpu,
  Cloud,
  Globe,
  Sparkles,
  ArrowUpRight,
  Layers,
  Zap,
  HardDrive,
  Database,
  GitBranch,
  Users,
  BarChart3,
  Receipt,
  UserCheck,
  ShoppingBag,
  CreditCard,
  Bot,
  ShieldCheck,
  Briefcase,
  Terminal,
  */
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

export interface MenuItem {
  title: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  href: string;
  available: boolean;
  highlighted?: boolean;
}

/* ─────────────────────────────────────────────────────────────
 * ACTIVE PRODUCTS
 * ───────────────────────────────────────────────────────────── */
export const activeProductsItems: MenuItem[] = [
  {
    title: "Domain Registration",
    description: "Search, buy and manage your domains.",
    icon: Search,
    href: "/domains",
    available: true,
  },
  {
    title: "Domain Transfer",
    description: "Move a domain you already own to Nupat.",
    icon: ArrowRightLeft,
    href: "/domain-transfer",
    available: true,
  },
  {
    title: "Web Hosting",
    description: "SSD cPanel hosting with free SSL.",
    icon: Server,
    href: "/hosting",
    available: true,
  },
  {
    title: "VPS Hosting",
    description: "Virtual servers with full root access.",
    icon: Server,
    href: "/vps",
    available: true,
  },
  {
    title: "Hosting Plans & Pricing",
    description: "Plans for personal sites, startups and agencies.",
    icon: Tag,
    href: "/pricing",
    available: true,
  },
];

/* ─────────────────────────────────────────────────────────────
 * ACTIVE RESOURCES
 * ───────────────────────────────────────────────────────────── */
export const activeResourcesItems: MenuItem[] = [
  {
    title: "Documentation",
    description: "Guides, API references and architecture docs.",
    icon: BookOpen,
    href: DOCS_URL,
    available: true,
  },
  {
    title: "Help Center & Support",
    description: "Reach our technical support team.",
    icon: Headphones,
    href: "/contact",
    available: true,
  },
  {
    title: "Pricing",
    description: "Plan prices with no hidden fees or lock-in.",
    icon: Tag,
    href: "/pricing",
    available: true,
  },
];

/* ─────────────────────────────────────────────────────────────
 * COMMENTED OUT UNUSED / UNRELEASED ITEMS (Preserved for future release)
 * ─────────────────────────────────────────────────────────────
export const domainsItems: MenuItem[] = [
  {
    title: "Domain Registration",
    description: "Find and register your domain.",
    icon: Search,
    href: "/domains",
    available: true,
  },
  {
    title: "Domain Management",
    description: "Manage your domains in one place.",
    icon: Settings,
    href: "/dashboard/domains",
    available: false,
  },
  {
    title: "Domain Transfer",
    description: "Move your domain to Nupat.",
    icon: ArrowRightLeft,
    href: "/domain-transfer",
    available: true,
  },
];

export const hostingItems: MenuItem[] = [
  {
    title: "Web Hosting",
    description: "Hosting for websites.",
    icon: Monitor,
    href: "/hosting",
    available: true,
  },
  {
    title: "VPS Hosting",
    description: "Virtual servers with more control.",
    icon: Cpu,
    href: "/hosting#vps",
    available: false,
  },
  {
    title: "Cloud Hosting",
    description: "Infrastructure that scales with traffic.",
    icon: Cloud,
    href: "/hosting#cloud",
    available: false,
  },
  {
    title: "Managed WordPress",
    description: "Managed hosting for WordPress websites.",
    icon: Globe,
    href: "/hosting#wordpress",
    available: false,
  },
];

export const aiWebsitesItems: MenuItem[] = [
  {
    title: "AI Website Builder",
    description: "Build a website with AI.",
    icon: Sparkles,
    href: "#",
    available: false,
    highlighted: true,
  },
  {
    title: "Website Migration",
    description: "Move your existing website to Nupat.",
    icon: ArrowUpRight,
    href: "#",
    available: false,
  },
];

export const developerCloudItems: MenuItem[] = [
  {
    title: "Kubernetes",
    description: "Run and scale containerized applications.",
    icon: Layers,
    href: "#",
    available: false,
  },
  {
    title: "Serverless",
    description: "Run code without managing servers.",
    icon: Zap,
    href: "#",
    available: false,
  },
  {
    title: "Object Storage",
    description: "Store and access your application data.",
    icon: HardDrive,
    href: "#",
    available: false,
  },
  {
    title: "CDN",
    description: "Serve content from locations near your visitors.",
    icon: Globe,
    href: "#",
    available: false,
  },
  {
    title: "Databases",
    description: "Managed databases for your apps.",
    icon: Database,
    href: "#",
    available: false,
  },
  {
    title: "CI/CD",
    description: "Build, test and deploy from your repository.",
    icon: GitBranch,
    href: "#",
    available: false,
  },
];

export const businessItems: MenuItem[] = [
  {
    title: "CRM",
    description: "Manage customer relationships.",
    icon: Users,
    href: "#",
    available: false,
  },
  {
    title: "ERP",
    description: "Manage business operations.",
    icon: BarChart3,
    href: "#",
    available: false,
  },
  {
    title: "Accounting",
    description: "Manage your financial activities.",
    icon: Receipt,
    href: "#",
    available: false,
  },
  {
    title: "HR",
    description: "Manage your people and workflows.",
    icon: UserCheck,
    href: "#",
    available: false,
  },
  {
    title: "E-commerce",
    description: "Build and manage your online store.",
    icon: ShoppingBag,
    href: "#",
    available: false,
  },
  {
    title: "POS",
    description: "Manage sales and transactions.",
    icon: CreditCard,
    href: "#",
    available: false,
  },
  {
    title: "AI Agents",
    description: "Automate supported business workflows.",
    icon: Bot,
    href: "#",
    available: false,
  },
  {
    title: "Payments",
    description: "Accept payments through integrated capabilities.",
    icon: ShieldCheck,
    href: "#",
    available: false,
  },
];

// Blog link commented out until /blog route exists:
// {
//   title: "Blog",
//   href: "/blog",
//   icon: FileText,
//   description: "News, tips and product updates.",
// },
───────────────────────────────────────────────────────────── */

/* ─── Compact Dropdown Item Component ───────────────────────── */
export function DropdownItemRow({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose?: () => void;
}) {
  const Icon = item.icon;
  const isExternal = item.href.startsWith("http");

  return (
    <Link
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={onClose}
      className={cn(
        "flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-[#F2F5FC] group cursor-pointer",
        focusRing,
        item.highlighted && "bg-[#F2F5FC]",
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#1787D4]" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#031033] group-hover:text-[#1787D4] leading-tight transition-colors">
          {item.title}
        </p>
        <p className="text-xs text-[#5A6A85] leading-snug mt-1">
          {item.description}
        </p>
      </div>
    </Link>
  );
}

/* ─── Products dropdown ─────────────────────────────────────── */
export function ProductsMegaMenu({ onClose }: { onClose?: () => void }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_12px_32px_rgba(3,16,51,0.12)] w-[400px] max-w-[calc(100vw-32px)] text-left">
      {/* Header */}
      <div className="mb-2 px-2.5 pb-2 border-b border-[#E2E8F0]">
        <span className="text-xs text-[#5A6A85]">Domains and cloud hosting</span>
      </div>

      {/* Active Items List */}
      <div className="flex flex-col gap-0.5">
        {activeProductsItems.map((item) => (
          <DropdownItemRow key={item.title} item={item} onClose={onClose} />
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-[#E2E8F0] mt-2 pt-2.5 px-2.5 flex items-center justify-between">
        <Link
          href="/hosting"
          onClick={onClose}
          className={cn(
            "inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors",
            focusRing,
          )}
        >
          <span>Compare hosting plans</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className={cn(
            "inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors",
            focusRing,
          )}
        >
          <span>API docs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Resources dropdown ────────────────────────────────────── */
export function ResourcesMegaMenu({ onClose }: { onClose?: () => void }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_12px_32px_rgba(3,16,51,0.12)] w-[400px] max-w-[calc(100vw-32px)] text-left">
      {/* Header */}
      <div className="mb-2 px-2.5 pb-2 border-b border-[#E2E8F0]">
        <span className="text-xs text-[#5A6A85]">Documentation and support</span>
      </div>

      {/* Active Items List */}
      <div className="flex flex-col gap-0.5">
        {activeResourcesItems.map((item) => (
          <DropdownItemRow key={item.title} item={item} onClose={onClose} />
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-[#E2E8F0] mt-2 pt-2.5 px-2.5 flex items-center justify-between">
        <Link
          href="/contact"
          onClick={onClose}
          className={cn(
            "inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors",
            focusRing,
          )}
        >
          <span>Contact 24/7 technical support</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
