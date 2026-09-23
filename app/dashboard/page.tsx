"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Server,
  Globe,
  Mail,
  Shield,
  ShieldCheck,
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "@/hooks/useUser";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetSslCertificates } from "@/hooks/useSsl";
import { verifyPayment } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

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
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: number | string;
  sublabel: string;
  href: string;
  actionText: string;
  iconBg?: string;
  disabled?: boolean;
  loading?: boolean;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  href,
  actionText,
  iconBg = "bg-[#eff6fb]",
  disabled,
  loading,
}: StatCardProps) {
  if (disabled) {
    return (
      <div className="bg-white/80 rounded-2xl border border-[#e8ecf4] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between opacity-60 cursor-not-allowed select-none">
        <div>
          {/* Top row: Icon box on left, Category label uppercase on right */}
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-[#1787D4] opacity-75`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#98a2b3]">
                {label}
              </span>
              <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                Soon
              </span>
            </div>
          </div>

          {/* Middle row: Large number and inline sublabel */}
          <div className="flex items-baseline gap-2 mt-5 mb-4">
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <>
                <span className="text-[34px] font-extrabold text-[#64748b] tracking-tight leading-none">
                  {value}
                </span>
                <span className="text-[14px] font-medium text-[#94a3b8] leading-none">
                  {sublabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bottom row: Divider and Action Link */}
        <div className="border-t border-[#f0f3f8] pt-3.5 mt-auto">
          <span className="text-[13px] font-medium text-[#94a3b8] inline-flex items-center gap-1">
            {actionText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-[#e8ecf4] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-150 flex flex-col justify-between"
    >
      <div>
        {/* Top row: Icon box on left, Category label uppercase on right */}
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-[#1787D4]`}
          >
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#98a2b3]">
            {label}
          </span>
        </div>

        {/* Middle row: Large number and inline sublabel */}
        <div className="flex items-baseline gap-2 mt-5 mb-4">
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <>
              <span className="text-[34px] font-extrabold text-[#101828] tracking-tight leading-none">
                {value}
              </span>
              <span className="text-[14px] font-medium text-[#667085] leading-none">
                {sublabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom row: Divider and Action Link */}
      <div className="border-t border-[#f0f3f8] pt-3.5 mt-auto">
        <span className="text-[13px] font-semibold text-[#1787D4] group-hover:text-[#1371B5] transition-colors inline-flex items-center gap-1.5">
          {actionText}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

// ─── Days until expiry helper ─────────────────────────────────────────────────
function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const exp = new Date(dateStr).getTime();
  if (isNaN(exp)) return null;
  const now = Date.now();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

// ─── Service type badge ───────────────────────────────────────────────────────
type ServiceType = "Domain" | "Hosting" | "SSL";

function ServiceTypeBadge({ type }: { type: ServiceType }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 bg-[#eff6fb] text-[#1787D4]">
      {type}
    </span>
  );
}

// ─── Attention item badge ─────────────────────────────────────────────────────
type AlertSeverity = "renewal" | "expiring" | "expired";

function AlertBadge({ severity }: { severity: AlertSeverity }) {
  const cfg = {
    expired: {
      label: "Expired",
      color: "#dc2626", // Red text, no outline
    },
    expiring: {
      label: "Expiring Soon",
      color: "#ea580c", // Orange text, no outline
    },
    renewal: {
      label: "Renewal Due",
      color: "#ea580c", // Orange text, no outline
    },
  }[severity];

  return (
    <span
      className="inline-flex items-center text-[11.5px] font-semibold shrink-0"
      style={{ color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Attention Required section ───────────────────────────────────────────────
type AttentionItem = {
  id: string;
  name: string;
  serviceType: ServiceType;
  severity: AlertSeverity;
  subtitle: string;
  daysRemaining: number;
  primaryAction: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
};

function AttentionRequired({
  items,
  loading,
}: {
  items: AttentionItem[];
  loading: boolean;
}) {
  const expiredCount = items.filter((i) => i.severity === "expired").length;

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
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${T.hairline}` }}
      >
        <div className="flex items-center gap-2.5">
          <h3
            className="text-[15px] font-semibold"
            style={{
              color: T.ink,
              fontFamily:
                "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.2px",
            }}
          >
            Attention Required
          </h3>
          {!loading && items.length > 0 && (
            <span
              className={`text-[12px] font-bold ${
                expiredCount > 0 ? "text-[#dc2626]" : "text-[#ea580c]"
              }`}
            >
              · {items.length} {items.length === 1 ? "service" : "services"}
            </span>
          )}
        </div>

        {!loading && expiredCount > 0 && (
          <Link
            href="/dashboard/expired-services"
            className="text-[12px] font-semibold text-[#1787D4] hover:underline flex items-center gap-1"
          >
            Expired Services ({expiredCount})
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div
          className="flex flex-col divide-y"
          style={{ borderColor: T.hairline }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-4 animate-pulse"
            >
              <div className="flex-1">
                <Skeleton className="h-3.5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full mb-3"
            style={{ background: T.blueLight }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: T.blue }} />
          </span>
          <p className="text-[14px] font-semibold" style={{ color: T.ink }}>
            All services look good
          </p>
          <p className="text-[13px] mt-1" style={{ color: T.inkMuted }}>
            No renewals or expiries require attention.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.slice(0, 5).map((item, i) => {
            const ActionIcon = item.primaryAction.icon;
            const isExpired = item.severity === "expired";
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#fafafa]"
                style={{
                  borderTop: i > 0 ? `1px solid ${T.hairline}` : undefined,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <ServiceTypeBadge type={item.serviceType} />
                    <p
                      className="text-[13.5px] font-semibold truncate max-w-[180px] sm:max-w-xs"
                      style={{ color: T.ink }}
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <AlertBadge severity={item.severity} />
                  </div>
                  <p className="text-[12px]" style={{ color: T.inkMuted }}>
                    {item.subtitle}
                  </p>
                </div>
                <Link
                  href={item.primaryAction.href}
                  className="shrink-0 flex items-center px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                  style={{ background: isExpired ? T.red : T.blue }}
                >
                  {item.primaryAction.label}
                </Link>
              </div>
            );
          })}

          {items.length > 5 && (
            <div
              className="px-5 py-3 border-t flex items-center justify-between text-[12.5px]"
              style={{
                borderColor: T.hairline,
                background: T.parchment,
              }}
            >
              <span style={{ color: T.inkMuted }}>
                Showing 5 of {items.length} items requiring attention
              </span>
              <Link
                href="/dashboard/expired-services"
                className="font-semibold text-[#1787D4] hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions section ────────────────────────────────────────────────────
type QuickAction = {
  id: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  description: string;
  href: string;
  accentColor: string;
  accentBg: string;
  disabled?: boolean;
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
    accentColor: T.blue,
    accentBg: T.blueLight,
  },
  {
    id: "qa-email",
    icon: Mail,
    label: "Create Email",
    description: "Set up customised business mailboxes",
    href: "/dashboard/email/create",
    accentColor: T.blue,
    accentBg: T.blueLight,
    disabled: true,
  },
  {
    id: "qa-ssl",
    icon: Shield,
    label: "Get SSL Certificate",
    description: "Add instant website lock protection",
    href: "/dashboard/ssl",
    accentColor: T.blue,
    accentBg: T.blueLight,
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
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${T.hairline}` }}
      >
        <h3
          className="text-[15px] font-semibold"
          style={{
            color: T.ink,
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          Quick Actions
        </h3>
      </div>

      {/* Actions */}
      <div className="flex flex-col">
        {QUICK_ACTIONS.map((action, i) => {
          // const Icon = action.icon;
          if ((action as any).disabled) {
            return (
              <div
                key={action.id}
                id={action.id}
                className="flex items-center gap-3.5 px-5 py-4 opacity-50 cursor-not-allowed select-none bg-white"
                style={{
                  borderTop: i > 0 ? `1px solid ${T.hairline}` : undefined,
                }}
              >
                {/* <span
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: action.accentBg }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: action.accentColor }}
                  />
                </span> */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold flex items-center gap-2"
                    style={{ color: T.ink, letterSpacing: "-0.1px" }}
                  >
                    {action.label}
                    {/* <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                      Soon
                    </span> */}
                  </p>
                  <p className="text-[12px]" style={{ color: T.inkMuted }}>
                    {action.description}
                  </p>
                </div>
              </div>
            );
          }

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
              {/* <span
                className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105"
                style={{ background: action.accentBg }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: action.accentColor }}
                />
              </span> */}
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

// ─── Main page content ────────────────────────────────────────────────────────
function DashboardOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  const { data: me, isLoading } = useGetMe();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();
  const { data: registeredDomains, isLoading: loadingDomains } =
    useGetRegisteredDomains();
  const { data: sslCerts, isLoading: loadingSsl } = useGetSslCertificates();

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";

  // ── Handle return from Paystack renewal / order ───────────────────────────
  const reference =
    searchParams?.get("reference") || searchParams?.get("trxref");

  useEffect(() => {
    if (!reference) return;

    let isMounted = true;
    const verify = async () => {
      try {
        toast.info("Verifying payment with Paystack…");
        const res = await verifyPayment(token, reference);
        if (!isMounted) return;

        if (res.success || res.data?.status === "PAID") {
          toast.success("Payment verified! Your service has been updated.");
        } else {
          toast.info(res.message || "Payment status received from Paystack.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        toast.error(err?.message || "Failed to verify payment with Paystack.");
      } finally {
        if (isMounted) {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["hosting"] });
          queryClient.invalidateQueries({ queryKey: ["registered-domains"] });
          queryClient.invalidateQueries({ queryKey: ["expiry-warnings"] });
          router.replace("/dashboard");
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference, token, queryClient, router]);

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
        }),
      );
    } catch {
      setLastLogin(stored);
    }
    // Update to current session time
    localStorage.setItem(KEY, now);
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const activeDomains = (registeredDomains ?? []).filter((d) => {
    const statusUpper = (d.status ?? "").toUpperCase();
    if (statusUpper === "EXPIRED" || statusUpper === "CANCELLED") return false;
    const days = daysUntil(d.expiryDate);
    if (days !== null && days < 0) return false;
    return statusUpper === "ACTIVE" || !statusUpper;
  }).length;

  const activeHosting = (hostingAccounts ?? []).filter((a) => {
    const statusUpper = (a.status ?? "").toUpperCase();
    if (statusUpper === "TERMINATED" || statusUpper === "SUSPENDED")
      return false;
    const exp = a.expiresAt ?? (a as any).expiryDate;
    const days = daysUntil(exp);
    if (days !== null && days < 0) return false;
    return statusUpper === "ACTIVE" || !statusUpper;
  }).length;

  const [privateEmailCount, setPrivateEmailCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nupat_private_mailboxes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPrivateEmailCount(parsed.length);
        }
      }
    } catch {}
  }, []);

  const activeSsl = (sslCerts ?? []).filter((c: any) => {
    const statusUpper = (c.status ?? "").toUpperCase();
    if (
      statusUpper === "EXPIRED" ||
      statusUpper === "CANCELLED" ||
      statusUpper === "FAILED"
    )
      return false;
    const exp = c.expiresAt ?? c.expiryDate;
    const days = daysUntil(exp);
    if (days !== null && days < 0) return false;
    return statusUpper === "ACTIVE" || !statusUpper;
  }).length;

  const displayDomains = activeDomains;
  const displayHosting = activeHosting;
  const displayEmail = privateEmailCount;
  const displaySsl = activeSsl;

  // ── Attention Required items ────────────────────────────────────────────────
  const attentionItems: AttentionItem[] = [];

  // 1. Domains: expired or expiring in <= 30 days
  (registeredDomains ?? []).forEach((domain, idx) => {
    const exp = domain.expiryDate ?? (domain as any).expiresAt;
    const days = daysUntil(exp);
    const domainName = domain.domain || `Domain #${idx + 1}`;
    const statusUpper = (domain.status ?? "").toUpperCase();
    const isExplicitlyExpired = statusUpper === "EXPIRED";

    if ((days !== null && days < 0) || isExplicitlyExpired) {
      const daysAgo = days !== null && days < 0 ? Math.abs(days) : null;
      attentionItems.push({
        id: `dom-expired-${domain.id || idx}`,
        name: domainName,
        serviceType: "Domain",
        severity: "expired",
        daysRemaining: days ?? -1,
        subtitle:
          daysAgo !== null
            ? `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
            : "Domain expired",
        primaryAction: {
          label: "Renew",
          href: "/dashboard/domains",
          icon: RefreshCcw,
        },
      });
    } else if (days !== null && days <= 30 && days >= 0) {
      attentionItems.push({
        id: `dom-renewal-${domain.id || idx}`,
        name: domainName,
        serviceType: "Domain",
        severity: days <= 7 ? "expiring" : "renewal",
        daysRemaining: days,
        subtitle:
          days === 0
            ? "Expires today"
            : `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: {
          label: "Renew",
          href: "/dashboard/domains",
          icon: RefreshCcw,
        },
      });
    }
  });

  // 2. Hosting accounts: expired or expiring in <= 30 days
  (hostingAccounts ?? []).forEach((account, idx) => {
    const exp =
      account.expiresAt ??
      (account as any).expiryDate ??
      (account as any).expiry_date;
    const days = daysUntil(exp);
    const hostingName =
      account.domain || (account as any).username || `Hosting #${idx + 1}`;
    const statusUpper = (account.status ?? "").toUpperCase();
    const isExplicitlyTerminated =
      statusUpper === "TERMINATED" || statusUpper === "SUSPENDED";

    if ((days !== null && days < 0) || isExplicitlyTerminated) {
      const daysAgo = days !== null && days < 0 ? Math.abs(days) : null;
      const statusNote =
        statusUpper === "SUSPENDED" ? "Hosting suspended" : "Hosting expired";
      attentionItems.push({
        id: `hosting-expired-${account.id || idx}`,
        name: hostingName,
        serviceType: "Hosting",
        severity: "expired",
        daysRemaining: days ?? -1,
        subtitle:
          daysAgo !== null
            ? `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
            : statusNote,
        primaryAction: {
          label: "Renew",
          href: "/dashboard/hosting",
          icon: RefreshCcw,
        },
      });
    } else if (days !== null && days <= 30 && days >= 0) {
      attentionItems.push({
        id: `hosting-renewal-${account.id || idx}`,
        name: hostingName,
        serviceType: "Hosting",
        severity: days <= 7 ? "expiring" : "renewal",
        daysRemaining: days,
        subtitle:
          days === 0
            ? "Expires today"
            : `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: {
          label: "Renew",
          href: "/dashboard/hosting",
          icon: RefreshCcw,
        },
      });
    }
  });

  // 3. SSL Certificates: expired or expiring in <= 30 days
  (sslCerts ?? []).forEach((cert: any, idx: number) => {
    const exp = cert.expiresAt ?? cert.expiryDate;
    const days = daysUntil(exp);
    const certName =
      cert.domainName ??
      cert.domain ??
      cert.commonName ??
      cert.productName ??
      `SSL Certificate #${idx + 1}`;
    const statusUpper = (cert.status ?? "").toUpperCase();
    const isExplicitlyExpired = statusUpper === "EXPIRED";

    if ((days !== null && days < 0) || isExplicitlyExpired) {
      const daysAgo = days !== null && days < 0 ? Math.abs(days) : null;
      attentionItems.push({
        id: `ssl-expired-${cert.id || idx}`,
        name: certName,
        serviceType: "SSL",
        severity: "expired",
        daysRemaining: days ?? -1,
        subtitle:
          daysAgo !== null
            ? `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
            : "Certificate expired",
        primaryAction: {
          label: "Renew",
          href: "/dashboard/ssl",
          icon: RefreshCcw,
        },
      });
    } else if (days !== null && days <= 30 && days >= 0) {
      attentionItems.push({
        id: `ssl-renewal-${cert.id || idx}`,
        name: certName,
        serviceType: "SSL",
        severity: days <= 7 ? "expiring" : "renewal",
        daysRemaining: days,
        subtitle:
          days === 0
            ? "Expires today"
            : `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: {
          label: "Renew",
          href: "/dashboard/ssl",
          icon: Eye,
        },
      });
    }
  });

  // Sort: expired items first, then items closest to expiring
  attentionItems.sort((a, b) => {
    if (a.severity === "expired" && b.severity !== "expired") return -1;
    if (a.severity !== "expired" && b.severity === "expired") return 1;

    if (a.severity === "expired" && b.severity === "expired") {
      return b.daysRemaining - a.daysRemaining;
    }

    return a.daysRemaining - b.daysRemaining;
  });

  const loadingAttention = loadingDomains || loadingHosting || loadingSsl;

  // ── Greeting ────────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
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
                className="text-[1.75rem] font-semibold leading-tight text-[#101828]"
                style={{
                  fontFamily:
                    "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.03em",
                }}
              >
                {greeting}, {firstName || "there"}
              </h2>
              <p className="mt-1 text-[14px]" style={{ color: T.inkMuted }}>
                Here&apos;s an overview of your domains, hosting, email, and
                other services.
              </p>
              {lastLogin && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium"
                    style={{
                      color: T.inkMuted,
                      background: T.parchment,
                      border: `1px solid ${T.hairline}`,
                    }}
                  >
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full text-[11px] text-white font-semibold tracking-wider"
              style={{
                background: T.blue,
              }}
            >
              RECOMMENDED FOR YOU
            </span>
            <h2
              className="text-[1.2rem] font-semibold text-white leading-snug mb-1.5"
              style={{
                fontFamily:
                  "SF Pro Display, system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Secure your brand extension with .ai and .co domains
            </h2>
            <p
              className="text-[13px]"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
              Expand your business reach. Search globally recognised tech
              extensions starting from only ₦15,000/year.
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
          label="DOMAINS"
          value={loadingDomains ? "—" : displayDomains}
          sublabel="Active"
          href="/dashboard/domains"
          actionText="View Domains"
          iconBg="bg-[#eff6fb]"
          loading={isLoading || loadingDomains}
        />
        <StatCard
          icon={Server}
          label="HOSTING"
          value={loadingHosting ? "—" : displayHosting}
          sublabel="Active"
          href="/dashboard/hosting"
          actionText="View Hosting"
          iconBg="bg-[#eff6fb]"
          loading={isLoading || loadingHosting}
        />
        <StatCard
          icon={Mail}
          label="PRIVATE EMAIL"
          value={displayEmail}
          sublabel="Mailboxes"
          href="/dashboard/email"
          actionText="Temporarily Disabled"
          iconBg="bg-[#eff6fb]"
          disabled={true}
          loading={isLoading}
        />
        <StatCard
          icon={ShieldCheck}
          label="SSL CERTIFICATES"
          value={loadingSsl ? "—" : displaySsl}
          sublabel="Active"
          href="/dashboard/ssl"
          actionText="View Certificates"
          iconBg="bg-[#eff6fb]"
          loading={isLoading || loadingSsl}
        />
      </div>

      {/* ── Two-column lower section ──────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <AttentionRequired items={attentionItems} loading={loadingAttention} />
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
              fontFamily:
                "SF Pro Display, system-ui, -apple-system, sans-serif",
            }}
          >
            Need help setting up your hosting or domain?
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: T.inkMuted }}>
            Check our step-by-step documentation guides or open a ticket with
            our support engineers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="dashboard-knowledge-base"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: T.blue }}
          >
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

export default function DashboardOverview() {
  return (
    <Suspense fallback={null}>
      <DashboardOverviewContent />
    </Suspense>
  );
}
