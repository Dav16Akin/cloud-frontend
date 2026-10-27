"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Cpu,
  Loader2,
  MapPin,
  Plus,
  Power,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useGetOrders } from "@/hooks/useOrders";
import {
  useGetVpsServers,
  getRecentVpsPurchase,
  clearRecentVpsPurchase,
  type RecentVpsPurchase,
} from "@/hooks/useVps";
import { useAuthStore } from "@/store/authStore";
import {
  verifyPayment,
  type Order,
  type OrderItem,
  type RefundStatus,
  type VpsServer,
} from "@/lib/api";
import VpsStatusBadge, {
  isVpsBusy,
} from "@/components/vps/VpsStatusBadge";
import ActivateVpsModal from "@/components/vps/ActivateVpsModal";
import { SshKeyManager } from "@/components/vps/SshKeyManager";
import {
  daysUntil,
  formatNaira,
  formatVpsDate,
  humanizeImage,
  locationLabel,
} from "@/components/vps/vps-utils";

type StatusFilter = "ALL" | "RUNNING" | "STOPPED" | "OTHER";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "RUNNING", label: "Running" },
  { value: "STOPPED", label: "Stopped" },
  { value: "OTHER", label: "Attention" },
];

function matchesFilter(status: string, filter: StatusFilter) {
  if (filter === "ALL") return true;
  if (filter === "RUNNING") return status === "RUNNING";
  if (filter === "STOPPED") return status === "STOPPED";
  return status !== "RUNNING" && status !== "STOPPED";
}

function renewalHint(iso?: string | null) {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return { label: "Overdue", tone: "text-red-600" };
  if (days === 0) return { label: "Due today", tone: "text-amber-600" };
  if (days <= 5)
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      tone: "text-amber-600",
    };
  return {
    label: `${days} days left`,
    tone: "text-[#6e6e73]",
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 min-h-[108px] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-[#6e6e73]">
          {label}
        </span>
        <span
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconClassName}`}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="text-[26px] font-bold text-[#1d1d1f] tracking-tight mt-1 leading-none">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function VpsRowActions({ server }: { server: VpsServer }) {
  return (
    <Link
      href={`/dashboard/vps/${server.id}`}
      id={`vps-manage-${server.id}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff6fc] hover:bg-[#e4f0fa] text-[#1787D4] hover:text-[#1371B5] text-[12px] font-semibold transition-colors"
    >
      Manage
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );
}

function CopyIpButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success("IP address copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the IP address");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${ip}`}
      className="p-1 rounded text-[#8a9bb2] hover:text-[#1787D4] hover:bg-[#eff6fc] transition-colors"
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function PendingSetupCard({
  item,
  order,
  onActivate,
}: {
  item: OrderItem;
  order: Order;
  onActivate: () => void;
}) {
  const name =
    item.vpsConfig?.name?.trim() ||
    `${item.vpsPlan?.name ?? "VPS"} server`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 px-4 sm:px-5 py-3.5 border-b border-[#e2eaf3] last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-white border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
        <Cpu className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">
            {name}
          </p>
          <span className="text-[10.5px] font-bold uppercase tracking-wide bg-white text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
            Paid
          </span>
        </div>
        <p className="text-[11.5px] text-[#5a6a85] mt-0.5 truncate">
          {item.vpsPlan?.name ?? "VPS"} ·{" "}
          {humanizeImage(item.vpsConfig?.image)} ·{" "}
          {locationLabel(item.vpsConfig?.location)}
        </p>
        <p className="text-[10.5px] text-[#8a9bb2] mt-0.5">
          Order ref {order.paystackRef} · {formatVpsDate(order.createdAt)}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-[12.5px] font-bold text-[#1d1d1f]">
          {formatNaira(item.price)}
        </span>
        <button
          type="button"
          id={`vps-finish-setup-${item.id}`}
          onClick={onActivate}
          disabled={!item.vpsConfig || !item.vpsPlanId}
          title={
            !item.vpsConfig || !item.vpsPlanId
              ? "Contact support to complete this order."
              : undefined
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
        >
          Finish setup
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function refundStateOf(item: OrderItem): RefundStatus {
  return item.refundStatus ?? (item.refundedAt ? "PROCESSED" : "NONE");
}

function refundCopy(status: RefundStatus) {
  switch (status) {
    case "PROCESSED":
      return {
        label: "Refunded",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        note: "Paystack has completed this refund to your original payment method.",
      };
    case "FAILED":
      return {
        label: "Needs attention",
        badge: "border-red-200 bg-red-50 text-red-700",
        note: "The refund could not be completed automatically. Please contact support so we can finish it for you.",
      };
    case "REQUESTED":
    case "PROCESSING":
      return {
        label: "Refund in progress",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        note: "Paystack is processing this refund. It has not settled to your account yet.",
      };
    default:
      return {
        label: "Not refunded",
        badge: "border-[#e8e8ed] bg-[#f5f5f7] text-[#6e6e73]",
        note: "No refund has been recorded for this payment.",
      };
  }
}

function VpsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const ordersQuery = useGetOrders();

  const pendingItems = useMemo(() => {
    const list: { item: OrderItem; order: Order }[] = [];
    for (const order of ordersQuery.data ?? []) {
      if (order.status !== "PAID") continue;
      for (const item of order.items ?? []) {
        if (item.type === "VPS" && refundStateOf(item) === "NONE" && !item.vps) {
          list.push({ item, order });
        }
      }
    }
    return list;
  }, [ordersQuery.data]);

  const refundItems = useMemo(() => {
    const list: { item: OrderItem; order: Order; status: RefundStatus }[] = [];
    for (const order of ordersQuery.data ?? []) {
      for (const item of order.items ?? []) {
        if (item.type !== "VPS") continue;
        const status = refundStateOf(item);
        if (status !== "NONE") list.push({ item, order, status });
      }
    }
    const timestamp = (item: OrderItem) =>
      new Date(item.refundedAt ?? item.refundRequestedAt ?? 0).getTime();
    return list.sort((a, b) => timestamp(b.item) - timestamp(a.item));
  }, [ordersQuery.data]);

  const serversQuery = useGetVpsServers(
    pendingItems.length > 0 ? { refetchInterval: 7000 } : undefined,
  );

  const servers = useMemo(() => serversQuery.data ?? [], [serversQuery.data]);
  const liveServers = useMemo(
    () => servers.filter((server) => server.status !== "DELETED"),
    [servers],
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activateTarget, setActivateTarget] = useState<OrderItem | null>(null);
  const [recent, setRecent] = useState<RecentVpsPurchase | null>(() =>
    getRecentVpsPurchase(),
  );

  const handledReference = useRef<string | null>(null);

  // Returning from Paystack after renewing a server.
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref");

  useEffect(() => {
    if (!reference || !token || handledReference.current === reference) return;
    handledReference.current = reference;

    let cancelled = false;
    const toastId = toast.loading("Confirming your payment…");

    verifyPayment(token, reference)
      .then(async (res) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["vps"] }),
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
        ]);
        if (cancelled) return;

        const status = String(res?.data?.status ?? "");
        const renewal = (res?.data?.items ?? []).find(
          (item) => item.type === "VPS_RENEWAL",
        );

        if (status === "PAID" || status === "ALREADY_VERIFIED") {
          toast.success("Payment confirmed. Your renewal is active.", {
            id: toastId,
          });
        } else if (status === "PENDING") {
          toast.info(
            "Payment received. We are still confirming it with Paystack.",
            { id: toastId },
          );
        } else {
          toast.error("This payment was not successful.", { id: toastId });
        }

        const targetId = renewal?.vpsTarget?.id;
        router.replace(
          targetId ? `/dashboard/vps/${targetId}` : "/dashboard/vps",
          { scroll: false },
        );
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "We could not confirm that payment yet. Contact support if you were charged.",
          { id: toastId },
        );
        router.replace("/dashboard/vps", { scroll: false });
      });

    return () => {
      cancelled = true;
    };
  }, [reference, token, queryClient, router]);

  // Keep polling the orders list while a paid VPS is waiting on provisioning.
  const refetchOrders = ordersQuery.refetch;
  useEffect(() => {
    if (pendingItems.length === 0) return;
    const interval = window.setInterval(() => {
      refetchOrders();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [pendingItems.length, refetchOrders]);

  // Clear the purchase marker once the server is attached to the order.
  const recentOrder = recent
    ? ordersQuery.data?.find(
        (order) => order.paystackRef === recent.reference,
      )
    : undefined;

  // A server attached or a refund started means the "preparing" note is stale.
  const recentSettled = recentOrder?.items?.some(
    (item) =>
      item.type === "VPS" &&
      (!!item.vps || refundStateOf(item) !== "NONE"),
  );

  useEffect(() => {
    if (!recentSettled) return;
    clearRecentVpsPurchase();
  }, [recentSettled]);

  const showRecent = !!recent && !recentSettled;

  const runningCount = liveServers.filter(
    (server) => server.status === "RUNNING",
  ).length;
  const stoppedCount = liveServers.filter(
    (server) => server.status === "STOPPED",
  ).length;
  const attentionCount = liveServers.filter(
    (server) =>
      server.status === "SUSPENDED" || server.status === "FAILED",
  ).length;

  const filteredServers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return liveServers.filter((server) => {
      if (!matchesFilter(server.status, statusFilter)) return false;
      if (!query) return true;

      return [
        server.name,
        server.ipv4,
        server.ipv6,
        server.plan?.name,
        server.image,
        server.location,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [liveServers, statusFilter, searchQuery]);

  const dismissRecent = () => {
    clearRecentVpsPurchase();
    setRecent(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-[24px] font-bold"
            style={{
              color: "#1d1d1f",
              fontFamily:
                "SF Pro Display, system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            VPS Servers
          </h2>
          <p className="text-[14px] mt-0.5 text-[#6e6e73]">
            Deploy, monitor and manage your virtual servers.
          </p>
        </div>

        <Link
          href="/dashboard/vps/purchase"
          id="vps-deploy-cta"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-lg transition-all duration-150 shadow-sm self-start sm:self-auto active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Deploy VPS
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total servers"
          value={liveServers.length}
          icon={Server}
          iconClassName="bg-[#eff6fc] text-[#1787D4] border-[#d6eaf8]"
          loading={serversQuery.isLoading}
        />
        <StatCard
          label="Running"
          value={runningCount}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600 border-emerald-200"
          loading={serversQuery.isLoading}
        />
        <StatCard
          label="Stopped"
          value={stoppedCount}
          icon={Power}
          iconClassName="bg-slate-100 text-slate-500 border-slate-200"
          loading={serversQuery.isLoading}
        />
        <StatCard
          label="Needs attention"
          value={attentionCount}
          icon={AlertCircle}
          iconClassName="bg-red-50 text-red-500 border-red-200"
          loading={serversQuery.isLoading}
        />
      </div>

      {/* ── Recent purchase banner ─────────────────────────────────────── */}
      {showRecent && (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#166534]">
              Payment confirmed
            </p>
            <p className="text-[11.5px] text-[#15803d] mt-0.5 leading-relaxed">
              We are preparing{" "}
              {recent.name?.trim() || recent.planName || "your new server"}. It
              will appear below automatically, usually within a minute. If it
              needs a final step, a Finish setup card will appear.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissRecent}
            aria-label="Dismiss"
            className="p-1 rounded-lg text-emerald-700/60 hover:text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Paid but not provisioned ───────────────────────────────────── */}
      {pendingItems.length > 0 && (
        <div className="rounded-[14px] border border-[#d6eaf8] bg-[#f6fbff] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 border-b border-[#e2eaf3]">
            <span className="w-7 h-7 rounded-lg bg-white border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold text-[#1d1d1f]">
                Finish setting up your server
              </h3>
              <p className="text-[11px] text-[#5a6a85]">
                Your payment is confirmed. No further charge is needed.
              </p>
            </div>
          </div>

          {pendingItems.map(({ item, order }) => (
            <PendingSetupCard
              key={item.id}
              item={item}
              order={order}
              onActivate={() => setActivateTarget(item)}
            />
          ))}
        </div>
      )}

      {/* ── Refund status for provisioning failures ────────────────────── */}
      {refundItems.length > 0 && (
        <div className="rounded-[14px] border border-[#e8e8ed] bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 border-b border-[#e8e8ed]">
            <span className="w-7 h-7 rounded-lg bg-[#f5f5f7] border border-[#e8e8ed] text-[#6e6e73] flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold text-[#1d1d1f]">
                Provisioning refunds
              </h3>
              <p className="text-[11px] text-[#6e6e73]">
                Refund status is reported by Paystack. Bank settlement can take
                up to 10 business days.
              </p>
            </div>
          </div>

          {refundItems.slice(0, 3).map(({ item, order, status }) => {
            const copy = refundCopy(status);
            return (
              <div
                key={item.id}
                className="px-4 sm:px-5 py-3 border-b border-[#f0f0f2] last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12.5px] font-semibold text-[#1d1d1f]">
                    {item.vpsPlan?.name ?? "VPS"} ·{" "}
                    {formatNaira(item.refundAmount ?? item.price)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${copy.badge}`}
                  >
                    {copy.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#6e6e73] mt-1 leading-relaxed">
                  {copy.note}
                </p>
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  <span className="text-[10.5px] text-[#9ba8c0]">
                    Ref {order.paystackRef} ·{" "}
                    {status === "PROCESSED"
                      ? `Refunded ${formatVpsDate(item.refundedAt)}`
                      : `Requested ${formatVpsDate(item.refundRequestedAt)}`}
                  </span>
                  <Link
                    href="/dashboard/tickets"
                    className="text-[11.5px] font-semibold text-[#1787D4] hover:underline shrink-0"
                  >
                    {status === "FAILED" ? "Contact support" : "Need help?"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filters + search ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                id={`vps-filter-${filter.value.toLowerCase()}`}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#1787D4] text-white shadow-sm"
                    : "bg-white border border-[#e8e8ed] text-[#6e6e73] hover:bg-[#f8fafc]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="vps-search"
            placeholder="Search by name, IP or plan…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#e8e8ed] rounded-lg text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* ── Server list ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden mt-1">
        <div className="px-5 sm:px-6 py-4 border-b border-[#eef2f8] bg-[#fbfcfe] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#1787D4]" />
            <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
              Your servers
            </h3>
            {liveServers.length > 0 && (
              <span className="text-[11px] font-bold bg-[#eff6fc] text-[#1787D4] border border-[#d6eaf8] px-2 py-0.5 rounded-full">
                {liveServers.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => serversQuery.refetch()}
            disabled={serversQuery.isFetching}
            className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                serversQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {serversQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
            <p className="text-[13px] text-[#6e6e73]">Loading your servers…</p>
          </div>
        ) : serversQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-[14px] font-semibold text-red-600">
              Could not load your servers.
            </p>
            <p className="text-[12px] text-[#6e6e73]">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => serversQuery.refetch()}
              className="mt-2 text-[12px] font-semibold text-[#1787D4] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4] mb-2">
              <Cpu className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-semibold text-[#1d1d1f] mt-1">
              {liveServers.length === 0
                ? "No servers yet"
                : "No servers match your filters"}
            </p>
            <p className="text-[12.5px] text-[#6e6e73] max-w-sm mt-0.5">
              {liveServers.length === 0
                ? "Deploy your first virtual server. It comes with dedicated resources, full root access and an IPv4 address."
                : "Try a different status or clear the search."}
            </p>
            {liveServers.length === 0 ? (
              <Link
                href="/dashboard/vps/purchase"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Deploy your first VPS
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 text-[12px] font-semibold text-[#1787D4] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#f2f5fc]">
              {filteredServers.map((server) => {
                const hint = renewalHint(server.nextBillingAt);
                return (
                  <div key={server.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-[#1d1d1f] truncate">
                          {server.name}
                        </p>
                        <p className="text-[11px] text-[#6e6e73] mt-0.5 truncate">
                          {server.plan?.name ?? "VPS"} ·{" "}
                          {humanizeImage(server.image)}
                        </p>
                      </div>
                      <VpsStatusBadge status={server.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#fbfcfe] p-3 rounded-lg border border-[#eef2f8]">
                      <div className="min-w-0">
                        <span className="text-[#6e6e73] block text-[11px]">
                          Public IP
                        </span>
                        <span className="font-mono text-[12px] text-[#1d1d1f] flex items-center gap-1">
                          <span className="truncate">
                            {server.ipv4 ?? "Pending"}
                          </span>
                          {server.ipv4 && (
                            <CopyIpButton ip={server.ipv4} />
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6e6e73] block text-[11px]">
                          Renews
                        </span>
                        <span className="text-[12px] text-[#1d1d1f]">
                          {formatVpsDate(server.nextBillingAt)}
                        </span>
                        {hint && (
                          <span
                            className={`block text-[10.5px] ${hint.tone}`}
                          >
                            {hint.label}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 pt-1.5 border-t border-[#eef2f8] flex items-center justify-between gap-2">
                        <span className="text-[#6e6e73] text-[11px] inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {locationLabel(server.location)}
                        </span>
                        <VpsRowActions server={server} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Server
                    </th>
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Public IP
                    </th>
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Plan
                    </th>
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Status
                    </th>
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                      Renews
                    </th>
                    <th className="py-3.5 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
                  {filteredServers.map((server) => {
                    const hint = renewalHint(server.nextBillingAt);
                    return (
                      <tr
                        key={server.id}
                        className="hover:bg-[#fbfcfe] transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                                server.status === "RUNNING"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : "bg-[#eff6fc] border-[#d6eaf8] text-[#1787D4]"
                              }`}
                            >
                              <Cpu className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-[#1d1d1f] truncate max-w-[220px]">
                                {server.name}
                              </p>
                              <p className="text-[11px] text-[#8a9bb2] truncate max-w-[220px]">
                                {humanizeImage(server.image)} ·{" "}
                                {locationLabel(server.location)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1">
                            <span className="text-[12px] font-mono text-[#1d1d1f]">
                              {server.ipv4 ?? "—"}
                            </span>
                            {server.ipv4 && (
                              <CopyIpButton ip={server.ipv4} />
                            )}
                          </div>
                          {server.ipv6 && (
                            <span className="block text-[10px] font-mono text-[#8a9bb2] truncate max-w-[160px]">
                              {server.ipv6}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-[12.5px] font-semibold text-[#1d1d1f]">
                            {server.plan?.name ?? "—"}
                          </span>
                          {server.plan && (
                            <span className="block text-[10.5px] text-[#8a9bb2]">
                              {server.plan.cpu} vCPU · {server.plan.ramGb} GB RAM
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <VpsStatusBadge status={server.status} />
                          {isVpsBusy(server.status) && (
                            <span className="block text-[10px] text-[#8a9bb2] mt-1">
                              Updating…
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-[12px] text-[#1d1d1f]">
                            {formatVpsDate(server.nextBillingAt)}
                          </span>
                          {hint && (
                            <span
                              className={`block text-[10.5px] ${hint.tone}`}
                            >
                              {hint.label}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <VpsRowActions server={server} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <p className="text-[10.5px] text-[#8a9bb2] flex items-start gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#1787D4] shrink-0 mt-px" />
        Servers are prepaid for 30 days. You are only charged when you renew.
        Deleting a server stops future billing.
      </p>

      <SshKeyManager />

      {activateTarget && (
        <ActivateVpsModal
          item={activateTarget}
          onClose={() => setActivateTarget(null)}
          onActivated={(server) => {
            setActivateTarget(null);
            router.push(`/dashboard/vps/${server.id}`);
          }}
        />
      )}
    </div>
  );
}

export default function VpsDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
          <p className="text-[13px] text-[#6e6e73]">Loading your servers…</p>
        </div>
      }
    >
      <VpsDashboardContent />
    </Suspense>
  );
}
