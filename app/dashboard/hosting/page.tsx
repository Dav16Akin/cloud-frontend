"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ShoppingCart,
  BarChart2,
  X,
  Loader2,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Zap,
  Search,
} from "lucide-react";

import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import {
  useGetHosting,
  useGetHostingStats,
  useRenewHosting,
  useUpgradeHosting,
  getRecentHostingPurchase,
  clearRecentHostingPurchase,
} from "@/hooks/useHosting";
import HostingProvisioningCard from "@/components/dashboard/HostingProvisioningCard";
import type { Plan, HostingAccount, HostingStatus } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return "₦" + price.toLocaleString("en-NG");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpiringSoon(iso: string) {
  const days = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 14;
}

type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

// Status = dot + plain text (no pill). Dot drawn with a ::before pseudo-element.
const STATUS_DOTS: Record<PillTone, string> = {
  success: "before:bg-[#12A150]",
  warning: "before:bg-[#E8900A]",
  danger: "before:bg-[#DC2626]",
  info: "before:bg-[#1787D4]",
  neutral: "before:bg-[#9AA6B8]",
};

function statusClass(tone: PillTone) {
  return `inline-flex items-center gap-2 whitespace-nowrap text-sm ${
    tone === "danger" ? "text-[#C21F1F]" : "text-[#031033]"
  } before:content-[''] before:h-2 before:w-2 before:shrink-0 before:rounded-full ${STATUS_DOTS[tone]}`;
}

const btnSecondarySm =
  "items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";

const iconCloseBtn =
  "p-1.5 rounded-lg text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: HostingStatus }) {
  const s = status?.toUpperCase() as HostingStatus;
  if (s === "ACTIVE") {
    return <span className={statusClass("success")}>Active</span>;
  }
  if (s === "SUSPENDED") {
    return <span className={statusClass("danger")}>Suspended</span>;
  }
  if (s === "TERMINATED") {
    return <span className="text-xs text-[#5A6A85]">Terminated</span>;
  }
  return <span className={statusClass("info")}>Provisioning</span>;
}

// ── Stats Modal ───────────────────────────────────────────────────────────────

function StatsModal({
  hostingId,
  domain,
  onClose,
}: {
  hostingId: string;
  domain: string;
  onClose: () => void;
}) {
  const { data: stats, isLoading, isError } = useGetHostingStats(hostingId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
    >
      <div
        className="absolute inset-0 bg-[#031033]/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2
              id="stats-modal-title"
              className="text-lg font-semibold text-[#031033]"
            >
              Hosting stats
            </h2>
            <p className="text-sm text-[#5A6A85] mt-0.5">{domain}</p>
          </div>
          <button
            id="stats-modal-close"
            onClick={onClose}
            className={iconCloseBtn}
            aria-label="Close stats modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 pb-6">
          {isLoading && (
            <div className="grid grid-cols-2 rounded-lg border border-[#E2E8F0] divide-x divide-[#EEF2F7] animate-pulse">
              {[0, 1].map((i) => (
                <div key={i} className="p-4">
                  <div className="h-3 w-20 rounded bg-[#EEF2F7]" />
                  <div className="h-5 w-16 rounded bg-[#EEF2F7] mt-2" />
                </div>
              ))}
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Could not load stats. Please try again.
            </div>
          )}
          {stats && (
            <dl className="grid grid-cols-2 rounded-lg border border-[#E2E8F0] overflow-hidden">
              {[
                {
                  label: "Disk used",
                  value: `${stats.diskUsed} / ${stats.diskLimit}`,
                },
                {
                  label: "Max databases",
                  value: stats.maxDatabases,
                },
                {
                  label: "Max email accounts",
                  value: stats.maxEmails,
                },
                {
                  label: "Max subdomains",
                  value: stats.maxSubdomains,
                },
              ].map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`p-4 min-w-0 ${i % 2 === 1 ? "border-l border-[#EEF2F7]" : ""} ${
                    i > 1 ? "border-t border-[#EEF2F7]" : ""
                  }`}
                >
                  <dt className="text-xs text-[#5A6A85]">{label}</dt>
                  <dd className="text-base font-semibold text-[#031033] mt-1 truncate tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Renew Hosting Modal ────────────────────────────────────────────────────────

function RenewHostingModal({
  hostingId,
  domain,
  currentPlan,
  expiresAt,
  onClose,
}: {
  hostingId: string;
  domain: string;
  currentPlan?: { name: string; price: number; monthlyPrice?: number; quarterlyPrice?: number };
  expiresAt?: string;
  onClose: () => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("yearly");
  const { mutate: renew, isPending: renewing } = useRenewHosting();

  const getPrice = () => {
    if (!currentPlan) return null;
    if (billingCycle === "monthly") return currentPlan.monthlyPrice ?? currentPlan.price;
    if (billingCycle === "quarterly") return currentPlan.quarterlyPrice ?? currentPlan.price;
    return currentPlan.price;
  };

  const price = getPrice();

  const handleRenew = () => {
    renew({ id: hostingId, data: { billingCycle } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-[#031033]">Renew hosting</h3>
            <p className="text-sm text-[#5A6A85] mt-0.5">{domain}</p>
          </div>
          <button onClick={onClose} className={iconCloseBtn} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          <dl className="rounded-lg border border-[#E2E8F0] divide-y divide-[#EEF2F7] text-sm">
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-[#5A6A85]">Plan</dt>
              <dd className="font-medium text-[#031033]">{currentPlan?.name ?? "Hosting Plan"}</dd>
            </div>
            {expiresAt && (
              <div className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[#5A6A85]">Current expiry</dt>
                <dd className="font-medium text-[#031033] tabular-nums">{formatDate(expiresAt)}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#031033]">Billing cycle</label>
            <div className="grid grid-cols-3 gap-1 bg-[#F2F5FC] p-1 rounded-lg">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  aria-pressed={billingCycle === cycle}
                  className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    billingCycle === cycle
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>

          {price != null && (
            <div className="flex items-baseline justify-between border-t border-[#EEF2F7] pt-4">
              <span className="text-sm text-[#5A6A85]">Total renewal amount</span>
              <span className="text-2xl font-semibold text-[#031033] tabular-nums">₦{price.toLocaleString("en-NG")}</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={renewing}
            className={btnPrimary}
          >
            {renewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {renewing ? "Initializing..." : "Pay and renew"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upgrade Hosting Modal ───────────────────────────────────────────────────────

function UpgradeHostingModal({
  hostingId,
  domain,
  currentPlanId,
  currentPlanName,
  onClose,
}: {
  hostingId: string;
  domain: string;
  currentPlanId?: string;
  currentPlanName?: string;
  onClose: () => void;
}) {
  const { data: plans, isLoading: loadingPlans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("yearly");

  const { mutate: upgrade, isPending: upgrading } = useUpgradeHosting();

  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      const otherPlan = plans.find((p) => p.id !== currentPlanId) ?? plans[0];
      if (otherPlan) setSelectedPlanId(otherPlan.id);
    }
  }, [plans, currentPlanId, selectedPlanId]);

  const targetPlan = plans?.find((p) => p.id === selectedPlanId);

  const getTargetPrice = () => {
    if (!targetPlan) return null;
    if (billingCycle === "monthly") return targetPlan.monthlyPrice ?? targetPlan.price;
    if (billingCycle === "quarterly") return targetPlan.quarterlyPrice ?? targetPlan.price;
    return targetPlan.price;
  };

  const targetPrice = getTargetPrice();

  const handleUpgrade = () => {
    if (!selectedPlanId) {
      toast.error("Please select a target plan.");
      return;
    }
    if (selectedPlanId === currentPlanId) {
      toast.error("Select a different plan to upgrade.");
      return;
    }
    upgrade({ id: hostingId, data: { planId: selectedPlanId, billingCycle } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-[#031033]">Upgrade hosting plan</h3>
            <p className="text-sm text-[#5A6A85] mt-0.5">
              {domain} · Current plan: <span className="font-medium text-[#031033]">{currentPlanName ?? "—"}</span>
            </p>
          </div>
          <button onClick={onClose} className={iconCloseBtn} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-[#031033]">Billing cycle</label>
            <div className="inline-flex gap-1 bg-[#F2F5FC] p-1 rounded-lg">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  aria-pressed={billingCycle === cycle}
                  className={`h-7 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    billingCycle === cycle
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            <label className="text-sm font-medium text-[#031033]">Choose a plan</label>
            {loadingPlans && (
              <div className="flex flex-col gap-2 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#EEF2F7]" />
                ))}
              </div>
            )}
            {plans?.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isSelected = plan.id === selectedPlanId;
              const pPrice =
                billingCycle === "monthly"
                  ? plan.monthlyPrice
                  : billingCycle === "quarterly"
                  ? plan.quarterlyPrice
                  : plan.price;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    if (!isCurrent) setSelectedPlanId(plan.id);
                  }}
                  className={`px-4 py-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                    isCurrent
                      ? "bg-[#F2F5FC] border-[#E2E8F0] cursor-not-allowed"
                      : isSelected
                      ? "bg-[#E8F4FC] border-[#1787D4]"
                      : "bg-white border-[#E2E8F0] hover:border-[#D5DCE6] hover:bg-[#F2F5FC]/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-[#D5DCE6] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isCurrent ? "text-[#5A6A85]" : "text-[#031033]"}`}>{plan.name}</p>
                        {isCurrent && (
                          <span className="text-xs text-[#5A6A85]">
                            Current plan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        {plan.storage} storage · {plan.bandwidth} bandwidth · {plan.websites} website{plan.websites > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#031033] tabular-nums">₦{pPrice?.toLocaleString("en-NG")}</p>
                    <p className="text-xs text-[#5A6A85]">/{billingCycle === "yearly" ? "yr" : billingCycle === "quarterly" ? "qtr" : "mo"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {targetPrice != null && (
            <div className="flex items-baseline justify-between border-t border-[#EEF2F7] pt-4">
              <span className="text-sm text-[#5A6A85]">Total upgrade amount</span>
              <span className="text-2xl font-semibold text-[#031033] tabular-nums">₦{targetPrice.toLocaleString("en-NG")}</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={upgrading || !selectedPlanId || selectedPlanId === currentPlanId}
            className={btnPrimary}
          >
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {upgrading ? "Initializing..." : "Upgrade now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hosting Account List Row ──────────────────────────────────────────────────

function HostingAccountRow({
  account,
  onViewStats,
  onRenew,
  onUpgrade,
}: {
  account: HostingAccount;
  onViewStats: (id: string, domain: string) => void;
  onRenew: (account: HostingAccount) => void;
  onUpgrade: (account: HostingAccount) => void;
}) {
  const expiring = account.expiresAt ? isExpiringSoon(account.expiresAt) : false;
  const planName = account.plan?.name ?? "—";
  const status = (account.status?.toUpperCase() ?? "PENDING") as HostingStatus;
  const isPending = status === "PENDING";

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-[#F2F5FC]/60 transition-colors group border-b border-[#EEF2F7] last:border-b-0">
      {/* Domain + plan */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#031033] truncate">
          {account.domain}
        </p>
        <p className="text-xs text-[#5A6A85]">{planName} plan</p>
        {isPending && (
          <span className="text-xs text-[#9A5B00] block mt-0.5">
            Provisioning in progress…
          </span>
        )}
      </div>

      {/* Badge */}
      <StatusBadge status={status} />

      {/* Expiry */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#5A6A85]" />
        <span
          className={`text-xs tabular-nums ${
            expiring ? "text-[#9A5B00] font-medium" : "text-[#5A6A85]"
          }`}
        >
          {account.expiresAt ? formatDate(account.expiresAt) : "—"}
        </span>
        {expiring && (
          <span className="text-xs text-[#9A5B00] font-medium">
            Soon
          </span>
        )}
      </div>

      {/* Stats button */}
      {!isPending && (
        <button
          id={`hosting-stats-${account.id}`}
          onClick={(e) => {
            e.preventDefault();
            onViewStats(account.id, account.domain);
          }}
          className={`hidden md:inline-flex ${btnSecondarySm}`}
          aria-label={`View stats for ${account.domain}`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-[#5A6A85]" />
          Stats
        </button>
      )}

      {/* Quick Renew button */}
      {status !== "TERMINATED" && !isPending && (
        <button
          id={`hosting-renew-${account.id}`}
          onClick={(e) => {
            e.preventDefault();
            onRenew(account);
          }}
          className={`hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-white text-sm font-medium hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0 ${
            expiring || status === "SUSPENDED"
              ? "border-[#E8900A]/40 text-[#9A5B00]"
              : "border-[#D5DCE6] text-[#031033]"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Renew
        </button>
      )}

      {/* Quick Upgrade button */}
      {status !== "TERMINATED" && !isPending && (
        <button
          id={`hosting-upgrade-${account.id}`}
          onClick={(e) => {
            e.preventDefault();
            onUpgrade(account);
          }}
          className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          Upgrade
        </button>
      )}

      {isPending && (
        <span className="hidden sm:inline-flex items-center text-xs text-[#5A6A85] shrink-0">
          Setting up…
        </span>
      )}

      {/* Manage arrow */}
      <Link
        href={`/dashboard/hosting/${account.id}`}
        id={`hosting-manage-${account.id}`}
        className="flex items-center gap-1 text-sm font-medium text-[#1787D4] hover:underline underline-offset-2 shrink-0"
      >
        Manage
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function AccountRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#EEF2F7] last:border-b-0 animate-pulse">
      <div className="flex-1 min-w-0">
        <div className="h-4 w-40 bg-[#EEF2F7] rounded mb-1.5" />
        <div className="h-3 w-24 bg-[#EEF2F7] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#EEF2F7] rounded-full" />
      <div className="hidden sm:block h-4 w-24 bg-[#EEF2F7] rounded" />
      <div className="hidden sm:block h-8 w-16 bg-[#EEF2F7] rounded-lg" />
    </div>
  );
}



// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HostingDashboardPage() {
  const recentPurchase =
    typeof window !== "undefined" ? getRecentHostingPurchase() : null;

  const {
    data: accounts,
    isLoading: loadingAccounts,
    isError: accountsError,
    refetch: refetchAccounts,
    isFetching: fetchingAccounts,
  } = useGetHosting({
    refetchInterval: (query) => {
      const list = query.state.data?.data || query.state.data;
      const hasPending =
        Array.isArray(list) &&
        list.some((a: any) => (a.status || "").toUpperCase() === "PENDING");
      const hasRecent =
        typeof window !== "undefined"
          ? !!sessionStorage.getItem("recent_hosting_purchase")
          : false;
      return hasPending || hasRecent ? 6000 : false;
    },
  });

  const [statsTarget, setStatsTarget] = useState<{
    id: string;
    domain: string;
  } | null>(null);
  const [renewTarget, setRenewTarget] = useState<HostingAccount | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<HostingAccount | null>(null);
  const { data: plans } = usePlans();

  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Provisioning" | "Expiring Soon" | "Expired"
  >("All");
  const [hostingSearch, setHostingSearch] = useState("");

  const pendingAccounts = (accounts || []).filter(
    (a) => (a.status || "").toUpperCase() === "PENDING"
  );

  const hasRecentPurchase =
    !!recentPurchase &&
    (!recentPurchase.domain ||
      !accounts?.some(
        (a) =>
          a.domain?.toLowerCase() === recentPurchase.domain?.toLowerCase() &&
          (a.status || "").toUpperCase() === "ACTIVE"
      ));

  // If recent purchase matches an active account, clear it and show celebration toast
  useEffect(() => {
    if (!recentPurchase || !accounts || !recentPurchase.domain) return;
    const matchingActive = accounts.find(
      (a) =>
        a.domain?.toLowerCase() === recentPurchase.domain?.toLowerCase() &&
        (a.status || "").toUpperCase() === "ACTIVE"
    );
    if (matchingActive) {
      clearRecentHostingPurchase();
      toast.success(
        `Hosting for ${matchingActive.domain} is now active.`
      );
    }
  }, [accounts, recentPurchase]);

  const hasAccounts = accounts && accounts.length > 0;
  const activeCount =
    accounts?.filter((a) => (a.status as string).toUpperCase() === "ACTIVE")
      .length ?? 0;
  const provisioningCount =
    pendingAccounts.length +
    (hasRecentPurchase &&
    !pendingAccounts.some(
      (a) => a.domain?.toLowerCase() === recentPurchase?.domain?.toLowerCase()
    )
      ? 1
      : 0);

  return (
    <>
      {/* Stats Modal */}
      {statsTarget && (
        <StatsModal
          hostingId={statsTarget.id}
          domain={statsTarget.domain}
          onClose={() => setStatsTarget(null)}
        />
      )}

      {/* Renew Modal */}
      {renewTarget && (
        <RenewHostingModal
          hostingId={renewTarget.id}
          domain={renewTarget.domain}
          currentPlan={renewTarget.plan}
          expiresAt={renewTarget.expiresAt}
          onClose={() => setRenewTarget(null)}
        />
      )}

      {/* Upgrade Modal */}
      {upgradeTarget && (
        <UpgradeHostingModal
          hostingId={upgradeTarget.id}
          domain={upgradeTarget.domain}
          currentPlanId={upgradeTarget.planId}
          currentPlanName={upgradeTarget.plan?.name}
          onClose={() => setUpgradeTarget(null)}
        />
      )}

      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#031033]">
              Your hosting
            </h1>
            <p className="text-sm text-[#5A6A85] mt-1">
              Manage your hosting services, websites, resources and subscription details.
            </p>
          </div>
          <Link
            href="/dashboard/hosting/purchase"
            id="hosting-get-cta"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0 self-start"
          >
            Get hosting
          </Link>
        </div>

        {/* Provisioning In-Progress Banners */}
        {pendingAccounts.map((acc) => (
          <HostingProvisioningCard
            key={acc.id}
            domain={acc.domain}
            planName={acc.plan?.name || "Cloud Hosting Plan"}
            status={acc.status}
            createdAt={acc.createdAt}
            cpanelUsername={acc.cpanelUsername}
            serverIp={acc.serverIp}
            hostingId={acc.id}
            onRefresh={() => refetchAccounts()}
            isRefreshing={fetchingAccounts}
          />
        ))}

        {hasRecentPurchase &&
          !pendingAccounts.some(
            (a) => a.domain?.toLowerCase() === recentPurchase?.domain?.toLowerCase()
          ) && (
            <HostingProvisioningCard
              domain={recentPurchase!.domain}
              planName={recentPurchase!.planName || "Cloud Hosting Plan"}
              status="PENDING"
              createdAt={recentPurchase!.timestamp}
              onRefresh={() => refetchAccounts()}
              isRefreshing={fetchingAccounts}
              showDismiss
              onDismiss={() => {
                clearRecentHostingPurchase();
                refetchAccounts();
              }}
            />
          )}

        {/* Filter + search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex items-center gap-1 flex-wrap self-start bg-[#F2F5FC] p-1 rounded-lg">
            {(
              [
                "All",
                "Active",
                ...(provisioningCount > 0 ? (["Provisioning"] as const) : []),
                "Expiring Soon",
                "Expired",
              ] as const
            ).map((f) => {
              const isActive = f === statusFilter;
              return (
                <button
                  key={f}
                  id={`hosting-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setStatusFilter(f as any)}
                  aria-pressed={isActive}
                  className={`h-7 px-3 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    isActive
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  <span>{f === "Expiring Soon" ? "Expiring soon" : f}</span>
                  {f === "Provisioning" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8900A]" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[260px] sm:max-w-xs sm:ml-auto h-9 px-3 rounded-lg bg-white border border-[#D5DCE6] focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/15 transition-colors">
            <Search className="w-4 h-4 shrink-0 text-[#5A6A85]" />
            <input
              id="hosting-search-filter"
              type="text"
              placeholder="Search by domain or plan"
              value={hostingSearch}
              onChange={(e) => setHostingSearch(e.target.value)}
              className="flex-1 min-w-0 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {/* Table header */}
          <div
            className="hidden md:grid items-center px-5 py-3 text-xs font-medium text-[#5A6A85] border-b border-[#E2E8F0]"
            style={{ gridTemplateColumns: "1fr 180px 140px 160px 100px" }}
          >
            <span>Hosting plan</span>
            <span>Website</span>
            <span>Status</span>
            <span>Renewal date</span>
            <span className="text-right">Action</span>
          </div>

          {/* Loading */}
          {loadingAccounts && (
            <>{[...Array(2)].map((_, i) => <AccountRowSkeleton key={i} />)}</>
          )}

          {/* Error */}
          {accountsError && (
            <div className="flex items-center gap-3 px-5 py-6">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <p className="text-sm text-[#031033]">Could not load your hosting accounts. Please refresh.</p>
            </div>
          )}

          {/* Empty */}
          {!loadingAccounts && !accountsError && !hasAccounts && !hasRecentPurchase && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-sm font-medium text-[#031033]">No hosting accounts yet</p>
              <p className="text-sm mt-1 mb-4 text-[#5A6A85]">
                Choose a plan to get your first website online.
              </p>
              <Link
                href="/dashboard/hosting/purchase"
                id="hosting-empty-cta"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#031033] border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                <ShoppingCart className="w-4 h-4 text-[#5A6A85]" />
                Purchase hosting
              </Link>
            </div>
          )}

          {/* Rows */}
          {hasAccounts && (() => {
            const filtered = accounts!.filter((a) => {
              const matchSearch =
                a.domain.toLowerCase().includes(hostingSearch.toLowerCase()) ||
                (a.plan?.name ?? "").toLowerCase().includes(hostingSearch.toLowerCase());
              if (!matchSearch) return false;
              if (statusFilter === "All") return true;
              const statusUp = (a.status ?? "").toUpperCase();
              if (statusFilter === "Provisioning") return statusUp === "PENDING";
              const days = a.expiresAt
                ? (new Date(a.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                : 999;
              const isExp = days < 0 || statusUp === "SUSPENDED" || statusUp === "TERMINATED";
              const isExpiring = !isExp && days <= 14;
              if (statusFilter === "Active") return !isExp && !isExpiring && statusUp === "ACTIVE";
              if (statusFilter === "Expiring Soon") return isExpiring;
              if (statusFilter === "Expired") return isExp;
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-[#5A6A85]">No accounts match your filter.</p>
                </div>
              );
            }

            return (
              <>
                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <div className="min-w-[640px] divide-y divide-[#EEF2F7]">
                    {filtered.map((account) => {
                      const days = account.expiresAt
                        ? (new Date(account.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        : 999;
                      const statusUp = (account.status ?? "").toUpperCase();
                      const isPending = statusUp === "PENDING";
                      const isActive = statusUp === "ACTIVE" && days >= 0;
                      const isExpiring = isActive && days <= 14;
                      const isExpired = days < 0 || statusUp === "SUSPENDED" || statusUp === "TERMINATED";
                      const planName =
                        account.plan?.name ||
                        plans?.find((p) => p.id === account.planId)?.name ||
                        (account as any)?.planName ||
                        "Cloud Hosting";

                      return (
                        <div
                          key={account.id}
                          className="grid items-center px-5 py-3 transition-colors hover:bg-[#F2F5FC]/60"
                          style={{ gridTemplateColumns: "1fr 180px 140px 160px 100px" }}
                        >
                          {/* Plan name */}
                          <span className="text-sm font-medium text-[#031033] truncate pr-4">
                            {planName}
                          </span>

                          {/* Website */}
                          <span className="text-sm text-[#5A6A85] truncate pr-4">
                            {account.domain}
                          </span>

                          {/* Status pill */}
                          <span>
                            {isPending ? (
                              <span className={statusClass("info")}>Provisioning</span>
                            ) : (
                              <span
                                className={statusClass(
                                  isExpired ? "danger" : isExpiring ? "warning" : "success"
                                )}
                              >
                                {isExpired ? "Expired" : isExpiring ? "Expiring soon" : "Active"}
                              </span>
                            )}
                          </span>

                          {/* Renewal date */}
                          <span className="text-sm text-[#5A6A85] tabular-nums">
                            {account.expiresAt ? new Date(account.expiresAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}
                          </span>

                          {/* Action */}
                          <div className="flex justify-end">
                            <Link
                              href={`/dashboard/hosting/${account.id}`}
                              id={`hosting-manage-${account.id}`}
                              className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium text-[#031033] border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0"
                            >
                              {isPending ? "View status" : "Manage"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden flex flex-col divide-y divide-[#EEF2F7]">
                  {filtered.map((account) => {
                    const days = account.expiresAt
                      ? (new Date(account.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      : 999;
                    const statusUp = (account.status ?? "").toUpperCase();
                    const isPending = statusUp === "PENDING";
                    const isActive = statusUp === "ACTIVE" && days >= 0;
                    const isExpiring = isActive && days <= 14;
                    const isExpired = days < 0 || statusUp === "SUSPENDED" || statusUp === "TERMINATED";
                    const planName =
                      account.plan?.name ||
                      plans?.find((p) => p.id === account.planId)?.name ||
                      (account as any)?.planName ||
                      "Cloud Hosting";

                    return (
                      <div
                        key={`mobile-${account.id}`}
                        className="px-4 py-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#031033] truncate">
                              {account.domain}
                            </p>
                            <p className="text-xs text-[#5A6A85] mt-1">
                              {planName}
                              <span aria-hidden="true"> · </span>
                              <span className="tabular-nums">
                                Renews{" "}
                                {account.expiresAt
                                  ? new Date(account.expiresAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "2-digit",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </p>
                          </div>

                          {isPending ? (
                            <span className={`${statusClass("info")} shrink-0`}>
                              Provisioning
                            </span>
                          ) : (
                            <span
                              className={`${statusClass(
                                isExpired ? "danger" : isExpiring ? "warning" : "success"
                              )} shrink-0`}
                            >
                              {isExpired ? "Expired" : isExpiring ? "Expiring soon" : "Active"}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/hosting/${account.id}`}
                          id={`hosting-manage-mobile-${account.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#031033] border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                        >
                          {isPending ? "View provisioning status" : "Manage hosting"}
                          <ChevronRight className="w-4 h-4 text-[#5A6A85]" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>

      </div>
    </>
  );
}
