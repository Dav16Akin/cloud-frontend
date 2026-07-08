"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Globe,
  LifeBuoy,
  Receipt,
  ShoppingCart,
  Search,
  MessageSquarePlus,
  ArrowRight,
  TrendingUp,
  Minus,
  ChevronRight,
  CheckCircle2,
  PauseCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import type { HostingAccount, HostingStatus, RegisteredDomain } from "@/lib/api";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-[#e8edf8] animate-pulse ${className}`} />;
}

// ── Status dot ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: HostingStatus }) {
  const s = (status ?? "").toUpperCase() as HostingStatus;
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
        s === "ACTIVE"
          ? "bg-emerald-500"
          : s === "SUSPENDED"
          ? "bg-red-500"
          : s === "TERMINATED"
          ? "bg-gray-400"
          : "bg-amber-400"
      }`}
    />
  );
}

// ── Status label ──────────────────────────────────────────────────────────────

function StatusLabel({ status }: { status: HostingStatus }) {
  const s = (status ?? "").toUpperCase() as HostingStatus;
  const cfg =
    s === "ACTIVE"
      ? { icon: CheckCircle2, label: "Active", cls: "text-emerald-600" }
      : s === "SUSPENDED"
      ? { icon: PauseCircle, label: "Suspended", cls: "text-red-500" }
      : s === "TERMINATED"
      ? { icon: XCircle, label: "Terminated", cls: "text-gray-400" }
      : { icon: Clock, label: "Pending", cls: "text-amber-500" };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Clickable Stat Card ───────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  iconColor: string;
  iconBg: string;
  href: string;
  change?: { value: string; positive: boolean | null };
  loading: boolean;
};

function StatCard({ icon: Icon, label, value, iconColor, iconBg, href, change, loading }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#e2eaff] p-5 flex flex-col gap-3 group hover:border-[#e8900a] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#484d57] uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-20" />
        </>
      ) : (
        <>
          <p className="text-3xl font-extrabold text-[#031033] leading-none">{value}</p>
          {change && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 w-fit ${
                change.positive === true
                  ? "bg-emerald-50 text-emerald-600"
                  : change.positive === false
                  ? "bg-red-50 text-red-500"
                  : "bg-[#f2f5fc] text-[#9ba8c0]"
              }`}
            >
              {change.positive === true ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {change.value}
            </div>
          )}
        </>
      )}
      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#9ba8c0] group-hover:text-[#e8900a] transition-colors mt-auto">
        View details
        <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  cta: string;
  href: string;
  ctaIcon: React.ComponentType<{ className?: string }>;
};

function EmptyState({ icon: Icon, message, cta, href, ctaIcon: CtaIcon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#9ba8c0]" />
      </div>
      <p className="text-sm text-[#5a6a85] max-w-xs mb-4">{message}</p>
      <Link href={href} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
        <CtaIcon className="w-4 h-4" />
        {cta}
      </Link>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e2eaff] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#031033]">{title}</h2>
          {subtitle && <p className="text-xs text-[#9ba8c0] mt-0.5">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="text-[11px] font-semibold text-[#e8900a] hover:underline flex items-center gap-0.5"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

// ── Hosting Section ──────────────────────────────────────────────────────────

function HostingSectionContent({
  accounts,
  loading,
}: {
  accounts: HostingAccount[] | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-[#e2eaff]">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#e8edf8] shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-32 bg-[#e8edf8] rounded mb-1" />
              <div className="h-3 w-20 bg-[#e8edf8] rounded" />
            </div>
            <div className="h-4 w-12 bg-[#e8edf8] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon={Server}
        message="You currently do not have any active hosting services."
        cta="Purchase Hosting"
        href="/dashboard/hosting/provision"
        ctaIcon={ShoppingCart}
      />
    );
  }

  // show up to 3 most recent
  const shown = accounts.slice(0, 3);

  return (
    <div className="flex flex-col divide-y divide-[#e2eaff]">
      {shown.map((account) => (
        <Link
          key={account.id}
          href={`/dashboard/hosting/${account.id}`}
          className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors group"
        >
          <StatusDot status={account.status} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#031033] truncate">
              {account.domain}
            </p>
            <p className="text-xs text-[#9ba8c0]">
              {account.plan?.name ?? "—"} Plan
            </p>
          </div>
          <StatusLabel status={account.status} />
          <ChevronRight className="w-3.5 h-3.5 text-[#9ba8c0] group-hover:text-[#e8900a] transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}

// ── Domains Section ──────────────────────────────────────────────────────────

function DomainsSectionContent({
  domains,
  loading,
}: {
  domains: RegisteredDomain[] | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-[#e2eaff]">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#e8edf8] shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-32 bg-[#e8edf8] rounded mb-1" />
              <div className="h-3 w-20 bg-[#e8edf8] rounded" />
            </div>
            <div className="h-4 w-12 bg-[#e8edf8] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <EmptyState
        icon={Globe}
        message="You do not have any registered domains yet."
        cta="Search Domain"
        href="/dashboard/domains"
        ctaIcon={Search}
      />
    );
  }

  // show up to 3 most recent
  const shown = domains.slice(0, 3);

  return (
    <div className="flex flex-col divide-y divide-[#e2eaff]">
      {shown.map((domain) => (
        <Link
          key={domain.id}
          href="/dashboard/domains"
          className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors group"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              domain.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#031033] truncate">
              {domain.domain}
            </p>
            <p className="text-xs text-[#9ba8c0]">
              Expires {new Date(domain.expiryDate).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 border ${
              domain.status === "ACTIVE"
                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                : "bg-amber-50 border-amber-100 text-amber-500"
            }`}
          >
            {domain.status}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9ba8c0] group-hover:text-[#e8900a] transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}

// ── Overview Page ─────────────────────────────────────────────────────────────

export default function DashboardOverview() {
  const { data: me, isLoading } = useGetMe();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();
  const { data: registeredDomains, isLoading: loadingDomains } = useGetRegisteredDomains();

  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let stored = localStorage.getItem("nupat_cloud_last_login");
      if (!stored) {
        const now = new Date().toISOString();
        localStorage.setItem("nupat_cloud_last_login", now);
        stored = now;
      }
      try {
        const formatted = new Date(stored).toLocaleString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setLastLogin(formatted);
      } catch {
        setLastLogin(stored);
      }
    }
  }, []);

  const firstName = me?.data?.firstName ?? "";

  const activeHosting =
    hostingAccounts?.filter(
      (a) => (a.status as string).toUpperCase() === "ACTIVE"
    ).length ?? 0;

  const STAT_CARDS: StatCardProps[] = [
    {
      icon: Server,
      label: "Active Hosting Plans",
      value: loadingHosting ? "—" : activeHosting,
      iconBg: "bg-blue-50",
      iconColor: "text-[031033]",
      href: "/dashboard/hosting",
      change:
        activeHosting > 0
          ? { value: `${activeHosting} running`, positive: true }
          : { value: "No active plans", positive: null },
      loading: isLoading || loadingHosting,
    },
    {
      icon: Globe,
      label: "Registered Domains",
      value: loadingDomains ? "—" : registeredDomains?.length ?? 0,
        iconBg: "bg-blue-50",
      iconColor: "text-[031033]",
      href: "/dashboard/domains",
      change:
        registeredDomains && registeredDomains.length > 0
          ? { value: `${registeredDomains.length} active`, positive: true }
          : { value: "No domains yet", positive: null },
      loading: isLoading || loadingDomains,
    },
    {
      icon: LifeBuoy,
      label: "Open Tickets",
      value: 0,
     iconBg: "bg-blue-50",
      iconColor: "text-[031033]",
      href: "/dashboard/tickets",
      change: { value: "All clear", positive: true },
      loading: isLoading,
    },
    {
      icon: Receipt,
      label: "Unpaid Invoices",
      value: 0,
        iconBg: "bg-blue-50",
      iconColor: "text-[031033]",
      href: "/dashboard/invoices",
      change: { value: "No overdue items", positive: true },
      loading: isLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-7 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
                Welcome back, {firstName}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1.5 text-sm text-[#5a6a85]">
                {lastLogin && (
                  <>
                    <span className="text-xs font-semibold text-[#031033]">
                      Recent Login: {lastLogin}
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <Link
          href="/dashboard/hosting"
          className="hidden sm:flex btn-primary text-sm py-2 px-4 items-center gap-2 whitespace-nowrap shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Section panels */}
      <div className="grid md:grid-cols-3 gap-4">
        <SectionCard title="Hosting" subtitle="Your hosting accounts" href="/dashboard/hosting">
          <HostingSectionContent
            accounts={hostingAccounts}
            loading={loadingHosting}
          />
        </SectionCard>

        <SectionCard title="Domains" subtitle="Registered domains" href="/dashboard/domains">
          <DomainsSectionContent
            domains={registeredDomains}
            loading={loadingDomains}
          />
        </SectionCard>

        <SectionCard title="Support Tickets" subtitle="Recent tickets" href="/dashboard/tickets">
          <EmptyState
            icon={LifeBuoy}
            message="You currently have no support tickets."
            cta="Contact Support"
            href="/dashboard/tickets"
            ctaIcon={MessageSquarePlus}
          />
        </SectionCard>
      </div>

      {/* Help banner */}
      <div className="bg-[#031033] border-l-4 border-[#e8900a] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-base">Need help getting started?</p>
          <p className="text-[#9ba8c0] text-sm mt-0.5">
            Our support team is ready to assist you — typically responds within 2 hours.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          Open a Ticket
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
