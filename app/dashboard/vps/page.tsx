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
  MapPin,
  Plus,
  RefreshCw,
  Search,
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
  if (days < 0) return { label: "Overdue", tone: "text-[#C21F1F]" };
  if (days === 0) return { label: "Due today", tone: "text-[#9A5B00]" };
  if (days <= 5)
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      tone: "text-[#9A5B00]",
    };
  return {
    label: `${days} days left`,
    tone: "text-[#5A6A85]",
  };
}

function StatCard({
  label,
  value,
  loading,
  className = "",
}: {
  label: string;
  value: number;
  loading: boolean;
  className?: string;
}) {
  return (
    <div className={`p-5 border-[#EEF2F7] ${className}`}>
      <span className="block text-xs text-[#5A6A85]">{label}</span>
      <div className="text-2xl font-semibold text-[#031033] tabular-nums mt-1.5 leading-8">
        {loading ? (
          <span className="block h-6 w-10 my-1 rounded bg-[#EEF2F7] animate-pulse" />
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
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[#1787D4] hover:bg-[#E8F4FC] hover:text-[#1370B5] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
      className="p-1 rounded text-[#5A6A85] hover:text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C3A]" />
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-3.5 border-b border-[#1787D4]/15 last:border-b-0">

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#031033] truncate">
            {name}
          </p>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033]">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#12A150]" />
            Paid
          </span>
        </div>
        <p className="text-xs text-[#5A6A85] mt-0.5 truncate">
          {item.vpsPlan?.name ?? "VPS"} ·{" "}
          {humanizeImage(item.vpsConfig?.image)} ·{" "}
          {locationLabel(item.vpsConfig?.location)}
        </p>
        <p className="text-xs text-[#5A6A85] mt-0.5">
          Order ref <span className="font-mono">{order.paystackRef}</span> ·{" "}
          {formatVpsDate(order.createdAt)}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-sm font-semibold text-[#031033] tabular-nums">
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
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
        dot: "bg-[#12A150]",
        text: "text-[#031033]",
        note: "Paystack has completed this refund to your original payment method.",
      };
    case "FAILED":
      return {
        label: "Needs attention",
        dot: "bg-[#DC2626]",
        text: "text-[#C21F1F]",
        note: "The refund could not be completed automatically. Please contact support so we can finish it for you.",
      };
    case "REQUESTED":
    case "PROCESSING":
      return {
        label: "Refund in progress",
        dot: "bg-[#1787D4]",
        text: "text-[#031033]",
        note: "Paystack is processing this refund. It has not settled to your account yet.",
      };
    default:
      return {
        label: "Not refunded",
        dot: "bg-[#9AA6B8]",
        text: "text-[#031033]",
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
          <h1 className="text-2xl font-semibold text-[#031033]">
            VPS servers
          </h1>
          <p className="text-sm mt-1 text-[#5A6A85]">
            Deploy, monitor and manage your virtual servers.
          </p>
        </div>

        <Link
          href="/dashboard/vps/purchase"
          id="vps-deploy-cta"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Deploy VPS
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <StatCard
          label="Total servers"
          value={liveServers.length}
          loading={serversQuery.isLoading}
          className="border-r border-b lg:border-b-0"
        />
        <StatCard
          label="Running"
          value={runningCount}
          loading={serversQuery.isLoading}
          className="border-b lg:border-b-0 lg:border-r"
        />
        <StatCard
          label="Stopped"
          value={stoppedCount}
          loading={serversQuery.isLoading}
          className="border-r"
        />
        <StatCard
          label="Needs attention"
          value={attentionCount}
          loading={serversQuery.isLoading}
        />
      </div>

      {/* ── Recent purchase banner ─────────────────────────────────────── */}
      {showRecent && (
        <div className="flex items-start gap-3 rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-[#0E7C3A] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#0E7C3A]">
              Payment confirmed
            </p>
            <p className="text-sm text-[#0E7C3A] mt-0.5 leading-relaxed">
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
            className="p-1 rounded-lg text-[#0E7C3A]/70 hover:text-[#0E7C3A] hover:bg-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C3A]/30 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Paid but not provisioned ───────────────────────────────────── */}
      {pendingItems.length > 0 && (
        <div className="rounded-xl border border-[#1787D4]/20 bg-[#E8F4FC] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1787D4]/15">
            <div>
              <h3 className="text-base font-semibold text-[#031033]">
                Finish setting up your server
              </h3>
              <p className="text-sm text-[#5A6A85] mt-0.5">
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
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF2F7]">
            <div>
              <h3 className="text-base font-semibold text-[#031033]">
                Provisioning refunds
              </h3>
              <p className="text-sm text-[#5A6A85] mt-0.5">
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
                className="px-5 py-3.5 border-b border-[#EEF2F7] last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[#031033] tabular-nums">
                    {item.vpsPlan?.name ?? "VPS"} ·{" "}
                    {formatNaira(item.refundAmount ?? item.price)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 whitespace-nowrap text-sm ${copy.text}`}
                  >
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${copy.dot}`}
                    />
                    {copy.label}
                  </span>
                </div>
                <p className="text-xs text-[#5A6A85] mt-1 leading-relaxed">
                  {copy.note}
                </p>
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  <span className="text-xs text-[#5A6A85]">
                    Ref <span className="font-mono">{order.paystackRef}</span> ·{" "}
                    {status === "PROCESSED"
                      ? `Refunded ${formatVpsDate(item.refundedAt)}`
                      : `Requested ${formatVpsDate(item.refundRequestedAt)}`}
                  </span>
                  <Link
                    href="/dashboard/tickets"
                    className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 self-start rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] p-1 overflow-x-auto max-w-full">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                id={`vps-filter-${filter.value.toLowerCase()}`}
                onClick={() => setStatusFilter(filter.value)}
                aria-pressed={active}
                className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                  active
                    ? "bg-white text-[#031033] shadow-sm"
                    : "text-[#5A6A85] hover:text-[#031033]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="vps-search"
            placeholder="Search by name, IP or plan…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
        </div>
      </div>

      {/* ── Server list ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#031033]">
              Your servers
            </h3>
            {liveServers.length > 0 && (
              <span className="text-sm tabular-nums text-[#5A6A85]">
                {liveServers.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => serversQuery.refetch()}
            disabled={serversQuery.isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-3 -mr-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="divide-y divide-[#EEF2F7]" aria-label="Loading your servers">
            {[0, 1, 2].map((index) => (
              <div key={index} className="px-5 py-4 flex items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 rounded bg-[#EEF2F7] animate-pulse" />
                  <div className="h-3 w-56 rounded bg-[#EEF2F7] animate-pulse" />
                </div>
                <div className="hidden md:block h-3.5 w-28 rounded bg-[#EEF2F7] animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-[#EEF2F7] animate-pulse" />
              </div>
            ))}
          </div>
        ) : serversQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
            <p className="text-sm font-medium text-[#031033]">
              Could not load your servers.
            </p>
            <p className="text-sm text-[#5A6A85]">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => serversQuery.refetch()}
              className="mt-2 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Try again
            </button>
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <p className="text-sm font-medium text-[#031033]">
              {liveServers.length === 0
                ? "No servers yet"
                : "No servers match your filters"}
            </p>
            <p className="text-sm text-[#5A6A85] max-w-sm mt-1">
              {liveServers.length === 0
                ? "Deploy your first virtual server. It comes with dedicated resources, full root access and an IPv4 address."
                : "Try a different status or clear the search."}
            </p>
            {liveServers.length === 0 ? (
              <Link
                href="/dashboard/vps/purchase"
                className="mt-4 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-[#5A6A85]" />
                Deploy your first VPS
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#EEF2F7]">
              {filteredServers.map((server) => {
                const hint = renewalHint(server.nextBillingAt);
                return (
                  <div key={server.id} className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#031033] truncate">
                          {server.name}
                        </p>
                        <p className="text-xs text-[#5A6A85] mt-0.5 truncate">
                          {server.plan?.name ?? "VPS"} ·{" "}
                          {humanizeImage(server.image)}
                        </p>
                      </div>
                      <VpsStatusBadge status={server.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#F2F5FC] p-3 rounded-lg">
                      <div className="min-w-0">
                        <span className="text-[#5A6A85] block text-xs">
                          Public IP
                        </span>
                        <span className="font-mono text-xs text-[#031033] flex items-center gap-1">
                          <span className="truncate">
                            {server.ipv4 ?? "Pending"}
                          </span>
                          {server.ipv4 && (
                            <CopyIpButton ip={server.ipv4} />
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5A6A85] block text-xs">
                          Renews
                        </span>
                        <span className="text-xs text-[#031033] tabular-nums">
                          {formatVpsDate(server.nextBillingAt)}
                        </span>
                        {hint && (
                          <span
                            className={`block text-xs ${hint.tone}`}
                          >
                            {hint.label}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                        <span className="text-[#5A6A85] text-xs inline-flex items-center gap-1">
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
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Server
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Public IP
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Plan
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Status
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Renews
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {filteredServers.map((server) => {
                    const hint = renewalHint(server.nextBillingAt);
                    return (
                      <tr
                        key={server.id}
                        className="hover:bg-[#F2F5FC]/60 transition-colors"
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#031033] truncate max-w-[220px]">
                                {server.name}
                              </p>
                              <p className="text-xs text-[#5A6A85] truncate max-w-[220px]">
                                {humanizeImage(server.image)} ·{" "}
                                {locationLabel(server.location)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-mono text-[#031033]">
                              {server.ipv4 ?? <span className="text-[#5A6A85]">—</span>}
                            </span>
                            {server.ipv4 && (
                              <CopyIpButton ip={server.ipv4} />
                            )}
                          </div>
                          {server.ipv6 && (
                            <span className="block text-xs font-mono text-[#5A6A85] truncate max-w-[160px]">
                              {server.ipv6}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <span className="text-sm text-[#031033]">
                            {server.plan?.name ?? <span className="text-[#5A6A85]">—</span>}
                          </span>
                          {server.plan && (
                            <span className="block text-xs text-[#5A6A85]">
                              {server.plan.cpu} vCPU · {server.plan.ramGb} GB RAM
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <VpsStatusBadge status={server.status} />
                          {isVpsBusy(server.status) && (
                            <span className="block text-xs text-[#5A6A85] mt-1">
                              Updating…
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <span className="text-sm text-[#5A6A85] tabular-nums">
                            {formatVpsDate(server.nextBillingAt)}
                          </span>
                          {hint && (
                            <span
                              className={`block text-xs ${hint.tone}`}
                            >
                              {hint.label}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right">
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

      <p className="text-xs text-[#5A6A85] flex items-start gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#5A6A85] shrink-0 mt-px" />
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
        <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-label="Loading your servers">
          <div className="h-8 w-48 rounded bg-[#EEF2F7] animate-pulse" />
          <div className="h-24 rounded-xl bg-[#EEF2F7] animate-pulse" />
          <div className="h-64 rounded-xl bg-[#EEF2F7] animate-pulse" />
        </div>
      }
    >
      <VpsDashboardContent />
    </Suspense>
  );
}
