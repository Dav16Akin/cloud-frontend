"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Check,
  Star,
  ShoppingCart,
  ArrowRight,
  Globe,
  PauseCircle,
  BarChart2,
  X,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Mail,
  Database,
  Plus,
  ChevronRight,
  XCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import {
  useGetHosting,
  useGetHostingStats,
  useRenewHosting,
  useUpgradeHosting,
} from "@/hooks/useHosting";
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

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: HostingStatus }) {
  const s = status?.toUpperCase() as HostingStatus;
  const cfg =
    s === "ACTIVE"
      ? {
          icon: CheckCircle2,
          label: "Active",
          cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
        }
      : s === "SUSPENDED"
      ? {
          icon: PauseCircle,
          label: "Suspended",
          cls: "bg-red-50 text-red-500 border-red-200",
        }
      : s === "TERMINATED"
      ? {
          icon: XCircle,
          label: "Terminated",
          cls: "bg-gray-100 text-gray-500 border-gray-200",
        }
      : {
          icon: Clock,
          label: "Pending",
          cls: "bg-amber-50 text-amber-600 border-amber-200",
        };

  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${cfg.cls}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white border border-[#e2eaff] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2
                id="stats-modal-title"
                className="text-sm font-semibold text-[#031033]"
              >
                Hosting Stats
              </h2>
              <p className="text-xs text-[#9ba8c0]">{domain}</p>
            </div>
          </div>
          <button
            id="stats-modal-close"
            onClick={onClose}
            className="p-1.5 text-[#9ba8c0] hover:bg-[#f2f5fc] hover:text-[#031033] transition-colors"
            aria-label="Close stats modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#e8900a]" />
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-[#5a6a85]">
                Could not load stats. Please try again.
              </p>
            </div>
          )}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: HardDrive,
                  label: "Disk Used",
                  value: `${stats.diskUsed} / ${stats.diskLimit}`,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  icon: Database,
                  label: "Max Databases",
                  value: stats.maxDatabases,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                },
                {
                  icon: Mail,
                  label: "Max Emails",
                  value: stats.maxEmails,
                  color: "text-[#e8900a]",
                  bg: "bg-[#fff8ee]",
                },
                {
                  icon: Globe,
                  label: "Max Subdomains",
                  value: stats.maxSubdomains,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 bg-[#f6f9ff] border border-[#e2eaff]"
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center shrink-0 ${bg}`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#9ba8c0] uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#031033] mt-0.5 truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e2eaff] w-full max-w-md shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#e2eaff] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-50 border border-amber-100 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-[#e8900a]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#031033]">Renew Hosting</h3>
              <p className="text-xs text-[#5a6a85]">{domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9ba8c0] hover:text-[#031033]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#f6f9ff] border border-[#e2eaff] p-3.5 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#5a6a85]">Plan:</span>
            <span className="font-semibold text-[#031033]">{currentPlan?.name ?? "Hosting Plan"}</span>
          </div>
          {expiresAt && (
            <div className="flex justify-between text-xs">
              <span className="text-[#5a6a85]">Current Expiry:</span>
              <span className="font-semibold text-[#031033]">{formatDate(expiresAt)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#031033]">Select Billing Cycle</label>
          <div className="grid grid-cols-3 gap-2">
            {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`py-2 px-3 text-xs font-semibold border transition-all ${
                  billingCycle === cycle
                    ? "bg-[#031033] text-white border-[#031033] shadow-sm"
                    : "bg-white text-[#5a6a85] border-[#e2eaff] hover:border-[#e8900a]"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>

        {price != null && (
          <div className="flex items-center justify-between border-t border-[#e2eaff] pt-3">
            <span className="text-xs text-[#5a6a85]">Total Renewal Amount:</span>
            <span className="text-lg font-extrabold text-[#031033]">₦{price.toLocaleString("en-NG")}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={renewing}
            className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-60"
          >
            {renewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {renewing ? "Initializing..." : "Pay & Renew"}
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#e2eaff] w-full max-w-lg shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#e2eaff] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#031033]">Upgrade Hosting Plan</h3>
              <p className="text-xs text-[#5a6a85]">{domain} • Current: <span className="font-semibold text-[#031033]">{currentPlanName ?? "—"}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9ba8c0] hover:text-[#031033]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#031033]">Billing Cycle</label>
          <div className="inline-flex bg-[#f2f5fc] border border-[#e2eaff] p-1 rounded-lg">
            {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                  billingCycle === cycle
                    ? "bg-[#031033] text-white shadow-sm"
                    : "text-[#5a6a85] hover:text-[#031033]"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
          <label className="text-xs font-semibold text-[#031033]">Select Upgrade Plan</label>
          {loadingPlans && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
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
                className={`p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#fff8ee] border-[#e8900a] shadow-sm"
                    : "bg-white border-[#e2eaff] hover:border-[#e8900a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-[#e8900a] bg-[#e8900a]"
                        : "border-[#c0cad8] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#031033]">{plan.name}</p>
                      {isCurrent && (
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 font-semibold">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5a6a85] mt-0.5">
                      {plan.storage} Storage • {plan.bandwidth} Bandwidth • {plan.websites} Website{plan.websites > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#031033]">₦{pPrice?.toLocaleString("en-NG")}</p>
                  <p className="text-[10px] text-[#9ba8c0]">/{billingCycle === "yearly" ? "yr" : billingCycle === "quarterly" ? "qtr" : "mo"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {targetPrice != null && (
          <div className="flex items-center justify-between border-t border-[#e2eaff] pt-3">
            <span className="text-xs text-[#5a6a85]">Total Upgrade Amount:</span>
            <span className="text-lg font-extrabold text-[#031033]">₦{targetPrice.toLocaleString("en-NG")}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={upgrading || !selectedPlanId || selectedPlanId === currentPlanId}
            className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-60"
          >
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {upgrading ? "Initializing..." : "Upgrade Now"}
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

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-[#f6f9ff] transition-colors group border-b border-[#e2eaff] last:border-b-0">
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${
          status === "ACTIVE"
            ? "bg-emerald-500"
            : status === "SUSPENDED"
            ? "bg-red-500"
            : status === "TERMINATED"
            ? "bg-gray-400"
            : "bg-amber-400"
        }`}
      />

      {/* Domain + plan */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#031033] truncate">
          {account.domain}
        </p>
        <p className="text-xs text-[#9ba8c0]">{planName} Plan</p>
      </div>

      {/* Badge */}
      <StatusBadge status={status} />

      {/* Expiry */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#9ba8c0]" />
        <span
          className={`text-xs font-medium ${
            expiring ? "text-amber-600" : "text-[#5a6a85]"
          }`}
        >
          {account.expiresAt ? formatDate(account.expiresAt) : "—"}
        </span>
        {expiring && (
          <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 font-semibold">
            Soon
          </span>
        )}
      </div>

      {/* Stats button */}
      <button
        id={`hosting-stats-${account.id}`}
        onClick={(e) => {
          e.preventDefault();
          onViewStats(account.id, account.domain);
        }}
        className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] px-2.5 py-1.5 border border-[#e2eaff] transition-colors shrink-0"
        aria-label={`View stats for ${account.domain}`}
      >
        <BarChart2 className="w-3.5 h-3.5" />
        Stats
      </button>

      {/* Quick Renew button */}
      {status !== "TERMINATED" && (
        <button
          id={`hosting-renew-${account.id}`}
          onClick={(e) => {
            e.preventDefault();
            onRenew(account);
          }}
          className={`hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 border transition-colors shrink-0 ${
            expiring || status === "SUSPENDED"
              ? "bg-[#e8900a] text-white border-[#e8900a] hover:bg-[#c97a08]"
              : "text-[#031033] border-[#e2eaff] hover:bg-[#f2f5fc]"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Renew
        </button>
      )}

      {/* Quick Upgrade button */}
      {status !== "TERMINATED" && (
        <button
          id={`hosting-upgrade-${account.id}`}
          onClick={(e) => {
            e.preventDefault();
            onUpgrade(account);
          }}
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 border border-blue-200 transition-colors shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          Upgrade
        </button>
      )}

      {/* Manage arrow */}
      <Link
        href={`/dashboard/hosting/${account.id}`}
        id={`hosting-manage-${account.id}`}
        className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2 shrink-0"
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
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e2eaff] last:border-b-0 animate-pulse">
      <div className="w-2 h-2 rounded-full bg-[#e8edf8] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-40 bg-[#e8edf8] rounded mb-1.5" />
        <div className="h-3 w-24 bg-[#e8edf8] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#e8edf8] rounded" />
      <div className="hidden sm:block h-4 w-24 bg-[#e8edf8] rounded" />
      <div className="hidden sm:block h-7 w-16 bg-[#e8edf8] rounded" />
      <div className="h-4 w-16 bg-[#e8edf8] rounded" />
    </div>
  );
}

// ── Plan Card Skeleton ────────────────────────────────────────────────────────

function PlanCardSkeleton() {
  return (
    <div className="bg-white border border-[#e2eaff] p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-5 w-28 bg-[#e8edf8] rounded" />
      <div className="h-4 w-44 bg-[#e8edf8] rounded" />
      <div className="h-8 w-24 bg-[#e8edf8] rounded" />
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 w-full bg-[#e8edf8] rounded" />
        ))}
      </div>
      <div className="h-10 w-full bg-[#e8edf8] rounded" />
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function HostingPlanCard({
  plan,
  selectedCycle,
}: {
  plan: Plan;
  selectedCycle: "monthly" | "quarterly" | "yearly";
}) {
  const slug = plan.name.toLowerCase();

  const priceMap = {
    monthly: plan.monthlyPrice,
    quarterly: plan.quarterlyPrice,
    yearly: plan.price,
  };
  const price = priceMap[selectedCycle];

  const websiteLabel =
    plan.websites >= 999
      ? "Unlimited Websites"
      : `${plan.websites} Website${plan.websites > 1 ? "s" : ""}`;
  const emailLabel =
    plan.emails >= 999
      ? "Unlimited Emails"
      : `${plan.emails} Email Account${plan.emails > 1 ? "s" : ""}`;

  const features = [
    `${plan.storage} Storage`,
    `${plan.bandwidth} Bandwidth`,
    websiteLabel,
    emailLabel,
    ...plan.features,
  ];

  return (
    <div
      id={`hosting-plan-${slug}`}
      className={`relative flex flex-col border transition-all duration-200 hover:shadow-lg ${
        plan.isPopular
          ? "bg-[#031033] border-[#031033] shadow-xl shadow-[#031033]/20 text-white"
          : "bg-white border-[#e2eaff] hover:border-[#e8900a] text-[#031033]"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 bg-[#e8900a] text-white text-[11px] font-bold px-3 py-1 shadow shadow-[#e8900a]/30">
            <Star className="w-3 h-3 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      <div
        className={`p-6 border-b ${
          plan.isPopular ? "border-white/10" : "border-[#e2eaff]"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3
              className={`font-bold text-lg ${
                plan.isPopular ? "text-white" : "text-[#031033]"
              }`}
            >
              {plan.name} Hosting
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                plan.isPopular ? "text-gray-300" : "text-[#9ba8c0]"
              }`}
            >
              {selectedCycle === "yearly"
                ? "Billed annually"
                : selectedCycle === "quarterly"
                ? "Billed quarterly"
                : "Billed monthly"}
            </p>
          </div>
          <div
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
              plan.isPopular
                ? "border-white/20 text-white/70"
                : "border-[#e2eaff] text-[#9ba8c0]"
            }`}
          >
            {selectedCycle}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-extrabold ${
              plan.isPopular ? "text-white" : "text-[#031033]"
            }`}
          >
            {formatPrice(price)}
          </span>
          <span
            className={`text-sm ${
              plan.isPopular ? "text-gray-300" : "text-[#9ba8c0]"
            }`}
          >
            /{selectedCycle === "yearly" ? "yr" : selectedCycle === "quarterly" ? "qtr" : "mo"}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 p-6 flex-1">
        {features.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                plan.isPopular
                  ? "bg-[#e8900a]/20"
                  : "bg-[#f2f5fc] border border-[#dce4f7]"
              }`}
            >
              <Check
                className={`w-2.5 h-2.5 ${
                  plan.isPopular ? "text-[#e8900a]" : "text-[#031033]"
                }`}
                strokeWidth={2.5}
              />
            </div>
            <span
              className={`text-sm ${
                plan.isPopular ? "text-gray-200" : "text-[#5a6a85]"
              }`}
            >
              {feat}
            </span>
          </li>
        ))}
      </ul>

      <div className="p-6 pt-0">
        <Link
          id={`hosting-order-${slug}`}
          href={`/dashboard/hosting/purchase?planId=${plan.id}&billingCycle=${selectedCycle}`}
          className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-all ${
            plan.isPopular
              ? "bg-[#e8900a] text-white hover:bg-[#c97a08]"
              : "btn-primary"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Order {plan.name}
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HostingDashboardPage() {
  const {
    data: accounts,
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useGetHosting();
  const { data: plans, isLoading: loadingPlans, isError: plansError } =
    usePlans();

  const [statsTarget, setStatsTarget] = useState<{
    id: string;
    domain: string;
  } | null>(null);
  const [renewTarget, setRenewTarget] = useState<HostingAccount | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<HostingAccount | null>(null);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const hasAccounts = accounts && accounts.length > 0;
  const activeCount = accounts?.filter(
    (a) => (a.status as string).toUpperCase() === "ACTIVE"
  ).length ?? 0;

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

      <div className="flex flex-col gap-7 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
              Hosting
            </h1>
            <p className="text-[#5a6a85] mt-1 text-sm">
              Manage your hosting accounts and purchase new plans.
            </p>
          </div>
          <Link
            href="/dashboard/hosting/purchase"
            id="hosting-provision-cta"
            className="hidden sm:flex btn-primary text-sm py-2 px-4 items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Hosting
          </Link>
        </div>

        {/* ── Active Hosting Accounts (list) ─────────────────────────────── */}
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#9ba8c0]" />
              <h2 className="text-sm font-semibold text-[#031033]">
                Your Hosting Accounts
              </h2>
              {hasAccounts && (
                <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                  {accounts.length}
                </span>
              )}
              {activeCount > 0 && (
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5">
                  {activeCount} active
                </span>
              )}
            </div>
            <Link
              href="/dashboard/hosting/purchase"
              id="hosting-add-account"
              className="text-xs font-semibold text-[#e8900a] hover:underline underline-offset-4 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </Link>
          </div>

          {/* Error */}
          {accountsError && (
            <div className="flex items-center gap-2 p-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-500">
                Could not load your hosting accounts. Please refresh the page.
              </p>
            </div>
          )}

          {/* Loading */}
          {loadingAccounts &&
            [...Array(2)].map((_, i) => <AccountRowSkeleton key={i} />)}

          {/* Empty */}
          {!loadingAccounts && !accountsError && !hasAccounts && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-3">
                <Server className="w-5 h-5 text-[#9ba8c0]" />
              </div>
              <p className="text-sm text-[#5a6a85] max-w-xs mb-4">
                You currently do not have any hosting services. Purchase a plan
                below to get started.
              </p>
              <Link
                href="/dashboard/hosting/purchase"
                id="hosting-empty-cta"
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase Hosting
              </Link>
            </div>
          )}

          {/* Accounts list */}
          {hasAccounts && (
            <div className="flex flex-col">
              {/* Table header */}
              <div className="hidden sm:flex items-center gap-4 px-5 py-2 bg-[#f6f9ff] border-b border-[#e2eaff]">
                <div className="w-2 shrink-0" />
                <p className="flex-1 text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider">
                  Domain
                </p>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-20">
                  Status
                </p>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-28">
                  Expiry
                </p>
                <div className="w-16" />
                <div className="w-16" />
              </div>

              {accounts.map((account) => (
                <HostingAccountRow
                  key={account.id}
                  account={account}
                  onViewStats={(id, domain) => setStatsTarget({ id, domain })}
                  onRenew={(acc) => setRenewTarget(acc)}
                  onUpgrade={(acc) => setUpgradeTarget(acc)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Available Plans ─────────────────────────────────────────────── */}
        <div id="plans" className="scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#031033] mb-1">
                Available Plans
              </h2>
              <p className="text-xs text-[#9ba8c0]">
                All plans include free SSL, daily backups, and 99.9% uptime
                guarantee.
              </p>
            </div>
            
            {/* Billing Cycle Selector Tabs */}
            <div className="inline-flex items-center bg-[#f2f5fc] border border-[#e2eaff] p-1 rounded-xl shrink-0 self-start sm:self-auto">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    billingCycle === cycle
                      ? "bg-[#031033] text-white shadow-sm"
                      : "text-[#5a6a85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>

          {plansError && (
            <p className="text-sm text-red-500 mb-4">
              Could not load plans. Please try refreshing the page.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {loadingPlans
              ? [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
              : plans?.map((plan) => (
                  <HostingPlanCard
                    key={plan.id}
                    plan={plan}
                    selectedCycle={billingCycle}
                  />
                ))}
          </div>
        </div>

        {/* ── Help CTA ───────────────────────────────────────────────────── */}
        <div className="bg-[#f2f5fc] border border-[#e2eaff] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#031033]">
              Not sure which plan to pick?
            </p>
            <p className="text-xs text-[#5a6a85] mt-0.5">
              Our team can help you choose the right hosting plan for your
              business.
            </p>
          </div>
          <Link
            href="/dashboard/tickets"
            id="hosting-contact-support"
            className="text-sm font-semibold text-[#e8900a] hover:underline underline-offset-4 whitespace-nowrap inline-flex items-center gap-1"
          >
            Talk to Support <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
