"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PremiumProtectionBanner from "@/components/dashboard/PremiumProtectionBanner";
import {
  Server,
  Globe,
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "@/hooks/useUser";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetSslCertificates } from "@/hooks/useSsl";
import { verifyPayment } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[#EEF2F7] ${className}`} />;
}

// ─── KPI cell (one cell of the divided strip) ────────────────────────────────
type StatCardProps = {
  label: string;
  value: number | string;
  sublabel: string;
  href: string;
  actionText: string;
  disabled?: boolean;
  loading?: boolean;
};

function StatCard({
  label,
  value,
  sublabel,
  href,
  actionText,
  disabled,
  loading,
}: StatCardProps) {
  const body = (
    <>
      <p className="text-xs text-[#5A6A85]">{label}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <>
            <span
              className={`text-2xl font-semibold tabular-nums leading-8 ${
                disabled ? "text-[#5A6A85]" : "text-[#031033]"
              }`}
            >
              {value}
            </span>
            <span className="text-sm text-[#5A6A85]">{sublabel}</span>
          </>
        )}
      </div>
      <p
        className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${
          disabled
            ? "text-[#5A6A85]"
            : "text-[#1787D4] group-hover:text-[#1370B5]"
        }`}
      >
        {actionText}
        {!disabled && <ArrowRight className="h-3.5 w-3.5" />}
      </p>
    </>
  );

  if (disabled) {
    return (
      <div className="cursor-not-allowed select-none bg-white px-5 py-4 opacity-60">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group bg-white px-5 py-4 transition-colors hover:bg-[#F2F5FC]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4]/30"
    >
      {body}
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
    <span className="shrink-0 text-xs text-[#5A6A85]">
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
      dot: "bg-[#DC2626]",
      text: "text-[#C21F1F]",
    },
    expiring: {
      label: "Expiring soon",
      dot: "bg-[#E8900A]",
      text: "text-[#031033]",
    },
    renewal: {
      label: "Renewal due",
      dot: "bg-[#E8900A]",
      text: "text-[#031033]",
    },
  }[severity];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs ${cfg.text}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
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
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F7] px-5 py-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold text-[#031033]">
            Attention required
          </h3>
          {!loading && items.length > 0 && (
            <span className="text-sm tabular-nums text-[#5A6A85]">
              {items.length} {items.length === 1 ? "service" : "services"}
            </span>
          )}
        </div>

        {!loading && expiredCount > 0 && (
          <Link
            href="/dashboard/expired-services"
            className="flex items-center gap-1 text-sm font-medium text-[#1787D4] hover:text-[#1370B5]"
          >
            Expired services ({expiredCount})
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col divide-y divide-[#EEF2F7]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-start gap-2.5 px-5 py-5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0E7C3A]" />
          <div>
            <p className="text-sm font-medium text-[#031033]">
              All services look good
            </p>
            <p className="mt-0.5 text-sm text-[#5A6A85]">
              No renewals or expiries need attention.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="divide-y divide-[#EEF2F7]">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F2F5FC]/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <ServiceTypeBadge type={item.serviceType} />
                    <p
                      className="max-w-[180px] truncate text-sm font-medium text-[#031033] sm:max-w-xs"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <AlertBadge severity={item.severity} />
                  </div>
                  <p className="text-xs text-[#5A6A85]">{item.subtitle}</p>
                </div>
                <Link
                  href={item.primaryAction.href}
                  className="inline-flex h-8 shrink-0 items-center rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {item.primaryAction.label}
                </Link>
              </div>
            ))}
          </div>

          {items.length > 5 && (
            <div className="flex items-center justify-between border-t border-[#EEF2F7] px-5 py-3 text-sm">
              <span className="text-[#5A6A85]">
                Showing 5 of {items.length} items requiring attention
              </span>
              <Link
                href="/dashboard/expired-services"
                className="flex items-center gap-1 font-medium text-[#1787D4] hover:text-[#1370B5]"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
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
  disabled?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "qa-domain",
    icon: Globe,
    label: "Register a domain",
    description: "Find and buy a new domain name",
    href: "/dashboard/domains?tab=register",
  },
  {
    id: "qa-hosting",
    icon: Server,
    label: "Buy hosting",
    description: "Choose a hosting plan for your site",
    href: "/dashboard/hosting",
  },
  {
    id: "qa-ssl",
    icon: Shield,
    label: "Get an SSL certificate",
    description: "Serve your site over HTTPS",
    href: "/dashboard/ssl?tab=order",
  },
];

function QuickActions() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-4">
        <h3 className="text-base font-semibold text-[#031033]">
          Quick actions
        </h3>
      </div>

      {/* Actions */}
      <div className="flex flex-col divide-y divide-[#EEF2F7]">
        {QUICK_ACTIONS.map((action) => {
          if (action.disabled) {
            return (
              <div
                key={action.id}
                id={action.id}
                className="flex cursor-not-allowed select-none items-center gap-3 px-5 py-3.5 opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#031033]">
                    {action.label}
                  </p>
                  <p className="text-xs text-[#5A6A85]">
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
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F2F5FC]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4]/30"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#031033]">
                  {action.label}
                </p>
                <p className="text-xs text-[#5A6A85]">{action.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#5A6A85]" />
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
          useCartStore.getState().clearCart();
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
  const displaySsl = activeSsl;

  // ── Attention Required items ────────────────────────────────────────────────
  const attentionItems: AttentionItem[] = [];

  // 1. Domains: expired or expiring in <= 10 days
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
    } else if (days !== null && days <= 10 && days >= 0) {
      attentionItems.push({
        id: `dom-renewal-${domain.id || idx}`,
        name: domainName,
        serviceType: "Domain",
        severity: days <= 5 ? "expiring" : "renewal",
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

  // 2. Hosting accounts: expired or expiring in <= 10 days
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
    } else if (days !== null && days <= 10 && days >= 0) {
      attentionItems.push({
        id: `hosting-renewal-${account.id || idx}`,
        name: hostingName,
        serviceType: "Hosting",
        severity: days <= 5 ? "expiring" : "renewal",
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

  // 3. SSL Certificates: expired or expiring in <= 10 days
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
          href: `/dashboard/ssl?tab=order&domain=${encodeURIComponent(cert.domainName ?? cert.domain ?? "")}`,
          icon: RefreshCcw,
        },
      });
    } else if (days !== null && days <= 10 && days >= 0) {
      attentionItems.push({
        id: `ssl-renewal-${cert.id || idx}`,
        name: certName,
        serviceType: "SSL",
        severity: days <= 5 ? "expiring" : "renewal",
        daysRemaining: days,
        subtitle:
          days === 0
            ? "Expires today"
            : `Expires in ${days} day${days === 1 ? "" : "s"}`,
        primaryAction: {
          label: "Renew",
          href: `/dashboard/ssl?tab=order&domain=${encodeURIComponent(cert.domainName ?? cert.domain ?? "")}`,
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="mb-2 h-8 w-56" />
              <Skeleton className="h-4 w-80" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-[#031033]">
                {greeting}, {firstName || "there"}
              </h1>
              <p className="mt-1 text-sm text-[#5A6A85]">
                An overview of your domains, hosting, email and other
                services.
              </p>
              {lastLogin && (
                <p className="mt-1 text-xs text-[#5A6A85]">
                  Last login {lastLogin}
                </p>
              )}
            </>
          )}
        </div>

        <Link
          href="/dashboard/hosting"
          id="dashboard-new-order-btn"
          className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1787D4] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          <ShoppingCart className="h-4 w-4" />
          New order
        </Link>
      </div>

      {/* ── Premium protection promo (hides itself when dismissed) ───────── */}
      <PremiumProtectionBanner className="w-full" />

      {/* ── Promo banner ─────────────────────────────────────────────────── */}
      <div className="relative min-h-[148px] overflow-hidden rounded-xl bg-[#031033]">
        <Image
          src="/dashboard-banner.png"
          alt="Nupat Cloud infrastructure"
          fill
          sizes="(min-width: 1200px) 1152px, 100vw"
          className="object-cover object-center"
          priority
        />
        {/* flat scrim so the copy stays readable over the artwork */}
        <div className="absolute inset-0 bg-[#031033]/60" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-5 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div className="max-w-md">
            <p className="mb-2 text-xs font-medium text-[#FFC75D]">
              Recommended for you
            </p>
            <h2 className="mb-1 text-lg font-semibold text-white">
              Secure your brand with .ai and .co domains
            </h2>
            <p className="text-sm text-white/75">
              Search .ai, .co and other tech extensions from ₦15,000/year.
            </p>
          </div>
          <Link
            href="/dashboard/domains?tab=register"
            id="promo-banner-cta"
            className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Search extensions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Service counts: one strip split by hairlines ─────────────────── */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#EEF2F7] sm:grid-cols-3">
        <StatCard
          label="Domains"
          value={loadingDomains ? "—" : displayDomains}
          sublabel="active"
          href="/dashboard/domains"
          actionText="View domains"
          loading={isLoading || loadingDomains}
        />
        <StatCard
          label="Hosting"
          value={loadingHosting ? "—" : displayHosting}
          sublabel="active"
          href="/dashboard/hosting"
          actionText="View hosting"
          loading={isLoading || loadingHosting}
        />
        <StatCard
          label="SSL certificates"
          value={loadingSsl ? "—" : displaySsl}
          sublabel="active"
          href="/dashboard/ssl"
          actionText="View certificates"
          loading={isLoading || loadingSsl}
        />
      </div>

      {/* ── Two-column lower section ──────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <AttentionRequired items={attentionItems} loading={loadingAttention} />
        <QuickActions />
      </div>

      {/* ── Help / knowledge base strip ──────────────────────────────────── */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#031033]">
            Need help setting up your hosting or domain?
          </p>
          <p className="mt-0.5 text-sm text-[#5A6A85]">
            Read the step-by-step guides or open a ticket with our support
            engineers.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="dashboard-knowledge-base"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D5DCE6] bg-white px-4 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Knowledge base ↗
          </a>
          <Link
            href="/dashboard/tickets"
            id="dashboard-open-ticket"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-[#1787D4] transition-colors hover:bg-[#E8F4FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Open a ticket
            <ArrowRight className="h-3.5 w-3.5" />
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
