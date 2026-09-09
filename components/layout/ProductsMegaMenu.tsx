"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  ArrowRightLeft,
  Server,
  ArrowRight,
  ChevronRight,
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
  Mail,
  Inbox,
  Briefcase,
  Terminal,
  */
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

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
    description: "Search, purchase, and manage custom domains.",
    icon: Search,
    href: "/domains",
    available: true,
  },
  {
    title: "Domain Transfer",
    description: "Seamlessly transfer your domain to Nupat.",
    icon: ArrowRightLeft,
    href: "/domain-transfer",
    available: true,
  },
  {
    title: "Web Hosting",
    description: "High-speed SSD cPanel hosting with free SSL.",
    icon: Server,
    href: "/hosting",
    available: true,
  },
  {
    title: "Hosting Plans & Pricing",
    description: "Flexible packages for creators, startups, and agencies.",
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
    description: "Guides, API references, and architecture docs.",
    icon: BookOpen,
    href: DOCS_URL,
    available: true,
  },
  {
    title: "Help Center & Support",
    description: "Our dedicated technical team is ready to assist.",
    icon: Headphones,
    href: "/contact",
    available: true,
  },
  {
    title: "Transparent Pricing",
    description: "Clear tiers with no hidden fees or lock-ins.",
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
    description: "Find and register your perfect domain.",
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
    description: "Reliable hosting for websites.",
    icon: Monitor,
    href: "/hosting",
    available: true,
  },
  {
    title: "VPS Hosting",
    description: "Powerful infrastructure with more control.",
    icon: Cpu,
    href: "/hosting#vps",
    available: false,
  },
  {
    title: "Cloud Hosting",
    description: "Flexible infrastructure that scales.",
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
    description: "Create professional websites with AI.",
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
    description: "Build without managing servers.",
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
    description: "Deliver content faster.",
    icon: Globe,
    href: "#",
    available: false,
  },
  {
    title: "Databases",
    description: "Reliable data infrastructure.",
    icon: Database,
    href: "#",
    available: false,
  },
  {
    title: "CI/CD",
    description: "Streamline development and deployment.",
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

export const emailItems: MenuItem[] = [
  {
    title: "Email Suite",
    description: "Professional email for your business.",
    icon: Inbox,
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
        "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 hover:bg-[#f2f6fc] group cursor-pointer",
        item.highlighted && "bg-[#f8faff] border border-[#e2eaff]"
      )}
    >
      <div className="w-8.5 h-8.5 rounded-xl bg-[#1787D4]/10 text-[#1787D4] group-hover:bg-[#1787D4] group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
        <Icon className="w-4 h-4 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#005B8A] group-hover:text-[#1787D4] leading-tight transition-colors">
          {item.title}
        </p>
        <p className="text-[11.5px] text-[#5a6a85] leading-snug mt-0.5">
          {item.description}
        </p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-[#9ba8c0] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

/* ─── Redesigned Products Dropdown (Compact & Elegant) ─────── */
export function ProductsMegaMenu({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="rounded-2xl border border-[#e2eaff] bg-white/95 backdrop-blur-2xl p-3.5
                 shadow-[0_20px_50px_rgba(0,91,138,0.12),0_4px_16px_rgba(23,135,212,0.08)]
                 w-[410px] max-w-[calc(100vw-32px)] text-left animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="mb-2 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1787D4]">
          PRODUCTS
        </span>
        <span className="text-[11px] text-[#5a6a85]">
          Domains & Cloud Hosting
        </span>
      </div>

      {/* Active Items List */}
      <div className="flex flex-col gap-0.5">
        {activeProductsItems.map((item) => (
          <DropdownItemRow key={item.title} item={item} onClose={onClose} />
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-slate-100 mt-2 pt-2.5 px-2 flex items-center justify-between">
        <Link
          href="/hosting"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#005B8A] hover:text-[#1787D4] transition-colors group"
        >
          <span>Compare all hosting plans</span>
          <ArrowRight className="w-3 h-3 text-[#1787D4] group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#5a6a85] hover:text-[#1787D4] transition-colors group"
        >
          <span>API Docs</span>
          <ArrowRight className="w-3 h-3 text-[#9ba8c0] group-hover:text-[#1787D4] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Redesigned Resources Dropdown (Identical Apple Aesthetic) ─ */
export function ResourcesMegaMenu({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="rounded-2xl border border-[#e2eaff] bg-white/95 backdrop-blur-2xl p-3.5
                 shadow-[0_20px_50px_rgba(0,91,138,0.12),0_4px_16px_rgba(23,135,212,0.08)]
                 w-[410px] max-w-[calc(100vw-32px)] text-left animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="mb-2 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1787D4]">
          RESOURCES
        </span>
        <span className="text-[11px] text-[#5a6a85]">
          Documentation & Support
        </span>
      </div>

      {/* Active Items List */}
      <div className="flex flex-col gap-0.5">
        {activeResourcesItems.map((item) => (
          <DropdownItemRow key={item.title} item={item} onClose={onClose} />
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-slate-100 mt-2 pt-2.5 px-2 flex items-center justify-between">
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#005B8A] hover:text-[#1787D4] transition-colors group"
        >
          <span>Contact 24/7 technical support</span>
          <ArrowRight className="w-3 h-3 text-[#1787D4] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
