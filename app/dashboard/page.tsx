"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Server,
  Globe,
  Mail,
  Shield,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Clock,
  Sun,
  CloudSun,
  Moon,
  Sparkles,
  RefreshCcw,
  Wrench,
  Eye,
  Plus,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetSslCertificates } from "@/hooks/useSsl";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  ink: "#1d1d1f",
  inkMuted: "#6e6e73",
  inkSubtle: "#aeaeb2",
  canvas: "#ffffff",
  parchment: "#f5f5f7",
  hairline: "#e8e8ed",
  orange: "#e8900a",
  orangeLight: "#fff8ee",
  orangeMid: "#fff0d6",
  blue: "#1787D4",
  blueLight: "#e8f4fc",
  emerald: "#059669",
  emeraldLight: "#ecfdf5",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ background: "#f0f0f3" }}
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
type StatCardProps = {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  sublabel: string;
  href: string;
  accentColor: string;
  accentBg: string;
  loading: boolean;
};

function StatCard({ icon: Icon, label, value, sublabel, href, accentColor, accentBg, loading }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: T.canvas,
        border: `1px solid ${T.hairline}`,
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background: accentBg }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: accentColor }} />
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: T.inkSubtle }}
        >
          {label}
        </span>
      </div>

      {loading ? (
        <>
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </>
      ) : (
        <>
          <p
            className="text-[2.25rem] font-semibold leading-none"
            style={{
              color: T.ink,
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: T.inkMuted }}>
              {sublabel}
            </span>
            <span
              className="flex items-center gap-0.5 text-[12px] font-medium transition-colors group-hover:gap-1"
              style={{ color: accentColor }}
            >
              View
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </>
      )}
    </Link>
  );
}

// ─── Days until expiry helper ─────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const exp = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

// ─── Attention item badge ─────────────────────────────────────────────────────
type AlertSeverity = "renewal" | "expiring" | "expired";

function AlertBadge({ severity }: { severity: AlertSeverity }) {
  const cfg = {
    renewal: { label: "Renewal Due", bg: T.amberLight, color: T.amber },
    expiring: { label: "SSL Expiring", bg: "#fff7ed", color: "#ea580c" },
    expired: { label: "Expired", bg: T.redLight, color: T.red },
  }[severity];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Attention Required section ───────────────────────────────────────────────
type AttentionItem = {
  id: string;
  domain: string;
  severity: AlertSeverity;
  subtitle: string;
  primaryAction: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
};

function AttentionRequired({
  items,
  loading,
}: {
  items: AttentionItem[];
  loading: boolean;
}) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: T.canvas,
        border: `1px solid ${T.hairline}`,
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ borderBottom: `1px solid ${T.hairline}` }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: T.orangeMid }}
        >
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: T.orange }} />
        </span>
        <h2
          className="text-[15px] font-semibold"
          style={{
            color: T.ink,
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          Attention Required
        </h2>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col divide-y" style={{ borderColor: T.hairline }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
              <div className="flex-1">
                <Skeleton className="h-3.5 w-28 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full mb-3"
            style={{ background: T.emeraldLight }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: T.emerald }} />
          </span>
          <p className="text-[14px] font-medium" style={{ color: T.ink }}>
            All services look good
          </p>
          <p className="text-[13px] mt-1" style={{ color: T.inkMuted }}>
            No renewals or expiries require attention.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => {
            const ActionIcon = item.primaryAction.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[#fafafa]"
                style={{
                  borderTop: i > 0 ? `1px solid ${T.hairline}` : undefined,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p
                      className="text-[13px] font-semibold truncate"
                      style={{ color: T.ink }}
                    >
                      {item.domain}
                    </p>
                    <AlertBadge severity={item.severity} />
                  </div>
                  <p className="text-[12px]" style={{ color: T.inkMuted }}>
                    {item.subtitle}
                  </p>
                </div>
                <Link
                  href={item.primaryAction.href}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                  style={{ background: T.blue }}
                >
                  <ActionIcon className="w-3.5 h-3.5" />
                  {item.primaryAction.label}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions section ────────────────────────────────────────────────────
type QuickAction = {
  id: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  description: string;
  href: string;
  accentColor: string;
  accentBg: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-domain",
    icon: Globe,
    label: "Register a Domain",
    description: "Find and purchase a new domain",
    href: "/dashboard/domains?tab=register",
    accentColor: T.blue,
    accentBg: T.blueLight,
  },
  {
    id: "qa-hosting",
    icon: Server,
    label: "Buy Hosting",
    description: "High-performance secure servers",
    href: "/dashboard/hosting",
    accentColor: T.orange,
    accentBg: T.orangeMid,
  },
  {
    id: "qa-email",
    icon: Mail,
    label: "Create Email",
    description: "Set up customised business mailboxes",
    href: "/dashboard/email/create",
    accentColor: T.emerald,
    accentBg: T.emeraldLight,
  },
  {
    id: "qa-ssl",
    icon: Shield,
    label: "Get SSL Certificate",
    description: "Add instant website lock protection",
    href: "/dashboard/ssl",
    accentColor: "#7c3aed",
    accentBg: "#f5f3ff",
  },
];

function QuickActions() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: T.canvas,
        border: `1px solid ${T.hairline}`,
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ borderBottom: `1px solid ${T.hairline}` }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: T.blueLight }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: T.blue }} />
        </span>
        <h2
          className="text-[15px] font-semibold"
          style={{
            color: T.ink,
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          Quick Actions
        </h2>
      </div>

      {/* Actions */}
      <div className="flex flex-col">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              id={action.id}
              className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-[#fafafa]"
              style={{
                borderTop: i > 0 ? `1px solid ${T.hairline}` : undefined,
              }}
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105"
                style={{ background: action.accentBg }}
              >
                <Icon className="w-4 h-4" style={{ color: action.accentColor }} />
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: T.ink, letterSpacing: "-0.1px" }}
                >
                  {action.label}
                </p>
                <p className="text-[12px]" style={{ color: T.inkMuted }}>
                  {action.description}
                </p>
              </div>
              <ChevronRight
                className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: T.inkSubtle }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const { data: me, isLoading } = useGetMe();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();
  const { data: registeredDomains, isLoading: loadingDomains } = useGetRegisteredDomains();
  const { data: sslCerts, isLoading: loadingSsl } = useGetSslCertificates();

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";

  // ── Last login ──────────────────────────────────────────────────────────────
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "nupat_cloud_last_login";
    let stored = localStorage.getItem(KEY);
    // Record now as the new last-login for next session, but show the old one
    const now = new Date().toISOString();
    if (!stored) {
      // First visit — save now, show nothing yet
      localStorage.setItem(KEY, now);
      return;
    }
    try {
      setLastLogin(
        new Date(stored).toLocaleString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch {
      setLastLogin(stored);
    }
    // Update to current session time
    localStorage.setItem(KEY, now);
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const activeDomains = (registeredDomains ?? []).filter(
    (d) => (d.status as string).toUpperCase() === "ACTIVE"
  ).length;

  const activeHosting = (hostingAccounts ?? []).filter(
    (a) => (a.status as string).toUpperCase() === "ACTIVE"
  ).length;

  // Private email = sum of all email accounts across hosting accounts (no dedicated hook)
  const privateEmailCount = 0; // placeholder — no email API hook available yet

  const activeSsl = (sslCerts ?? []).filter(
    (c: any) => (c.status as string)?.toUpperCase() === "ACTIVE"
  ).length;

  // ── Attention Required items ────────────────────────────────────────────────
  const attentionItems: AttentionItem[] = [];

  (registeredDomains ?? []).forEach((domain) => {
    if (!domain.expiryDate) return;
    const days = daysUntil(domain.expiryDate);
    const domainName = domain.domain;

    if (days < 0) {
      attentionItems.push({
        id: `dom-expired-${domain.id}`,
        domain: domainName,
        severity: "expired",
        subtitle: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
        primaryAction: { label: "Manage", href: "/dashboard/domains", icon: Wrench },
      });
    } else if (days <= 30) {
      attentionItems.push({
        id: `dom-renewal-${domain.id}`,
        domain: domainName,
        severity: "renewal",
        subtitle: `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: { label: "Renew", href: "/dashboard/domains", icon: RefreshCcw },
      });
    }
  });

  (sslCerts ?? []).forEach((cert: any) => {
    if (!cert.expiryDate) return;
    const days = daysUntil(cert.expiryDate);
    if (days <= 30 && days >= 0) {
      attentionItems.push({
        id: `ssl-${cert.id}`,
        domain: cert.domain ?? cert.commonName ?? "SSL Certificate",
        severity: "expiring",
        subtitle: `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: { label: "View", href: "/dashboard/ssl", icon: Eye },
      });
    }
  });

  // Sort: expired first, then by urgency
  attentionItems.sort((a, b) => {
    const order: Record<AlertSeverity, number> = { expired: 0, renewal: 1, expiring: 2 };
    return order[a.severity] - order[b.severity];
  });

  const loadingAttention = loadingDomains || loadingSsl;

  // ── Greeting ────────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? CloudSun : Moon;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-56 mb-2" />
              <Skeleton className="h-4 w-80" />
            </>
          ) : (
            <>
              <h2
                className="flex items-center gap-2.5 text-[1.75rem] font-semibold leading-tight"
                style={{
                  color: T.ink,
                  fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                {greeting}, {firstName || "there"}
                <GreetIcon className="w-6 h-6 shrink-0" style={{ color: T.orange }} />
              </h2>
              <p className="mt-1 text-[14px]" style={{ color: T.inkMuted }}>
                Here&apos;s an overview of your domains, hosting, email, and other services.
              </p>
              {lastLogin && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium"
                    style={{
                      color: T.inkMuted,
                      background: T.parchment,
                      border: `1px solid ${T.hairline}`,
                    }}
                  >
                    <Clock className="w-3 h-3 shrink-0" style={{ color: T.orange }} />
                    Last login: {lastLogin}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <Link
          href="/dashboard/hosting"
          id="dashboard-new-order-btn"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95 shrink-0 whitespace-nowrap"
          style={{
            background: T.blue,
            boxShadow: "0 2px 8px rgba(23,135,212,0.35)",
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* ── Promo banner ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: "148px", borderRadius: "16px" }}
      >
        <Image
          src="/dashboard-banner.png"
          alt="Nupat Cloud infrastructure"
          fill
          className="object-cover object-center"
          priority
        />
        {/* left-to-right gradient — text readable, image visible right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(3,16,51,0.92) 0%, rgba(3,16,51,0.75) 45%, rgba(3,16,51,0.18) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-7 py-7">
          <div className="max-w-sm">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full text-[11px] font-semibold tracking-wider"
              style={{
                background: "rgba(232,144,10,0.20)",
                border: "1px solid rgba(232,144,10,0.45)",
                color: "#FFC75D",
              }}
            >
              <Sparkles className="w-3 h-3" />
              RECOMMENDED FOR YOU
            </span>
            <h2
              className="text-[1.2rem] font-semibold text-white leading-snug mb-1.5"
              style={{
                fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Secure your brand extension with .ai and .co domains
            </h2>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.68)" }}>
              Expand your business reach. Search globally recognised tech extensions starting from only $8.98/year.
            </p>
          </div>
          <Link
            href="/dashboard/domains?tab=register"
            id="promo-banner-cta"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95 whitespace-nowrap"
            style={{
              background: T.blue,
              boxShadow: "0 2px 16px rgba(23,135,212,0.5)",
            }}
          >
            Search Extensions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Globe}
          label="Domains"
          value={loadingDomains ? "—" : activeDomains}
          sublabel="Active"
          href="/dashboard/domains"
          accentColor={T.blue}
          accentBg={T.blueLight}
          loading={isLoading || loadingDomains}
        />
        <StatCard
          icon={Server}
          label="Hosting"
          value={loadingHosting ? "—" : activeHosting}
          sublabel="Active"
          href="/dashboard/hosting"
          accentColor={T.orange}
          accentBg={T.orangeMid}
          loading={isLoading || loadingHosting}
        />
        <StatCard
          icon={Mail}
          label="Private Email"
          value={privateEmailCount}
          sublabel="Mailboxes"
          href="/dashboard/email"
          accentColor={T.emerald}
          accentBg={T.emeraldLight}
          loading={isLoading}
        />
        <StatCard
          icon={Shield}
          label="SSL Certificates"
          value={loadingSsl ? "—" : activeSsl}
          sublabel="Active"
          href="/dashboard/ssl"
          accentColor="#7c3aed"
          accentBg="#f5f3ff"
          loading={isLoading || loadingSsl}
        />
      </div>

      {/* ── Two-column lower section ──────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <AttentionRequired
          items={attentionItems.slice(0, 5)}
          loading={loadingAttention}
        />
        <QuickActions />
      </div>

      {/* ── Help / knowledge base strip ──────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5"
        style={{
          background: T.parchment,
          border: `1px solid ${T.hairline}`,
          borderRadius: "14px",
        }}
      >
        <div>
          <p
            className="text-[14px] font-semibold"
            style={{
              color: T.ink,
              fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            }}
          >
            Need help setting up your hosting or domain?
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: T.inkMuted }}>
            Check our step-by-step documentation guides or open a ticket with our support engineers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="dashboard-knowledge-base"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: T.orange }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base ↗
          </a>
          <Link
            href="/dashboard/tickets"
            id="dashboard-open-ticket"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 hover:bg-white active:scale-95"
            style={{
              color: T.ink,
              border: `1px solid ${T.hairline}`,
              background: T.canvas,
            }}
          >
            Open a Ticket
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
