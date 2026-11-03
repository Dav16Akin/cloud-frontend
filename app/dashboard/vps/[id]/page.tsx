"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Copy,
  Cpu,
  Globe,
  HardDrive,
  Loader2,
  MapPin,
  MemoryStick,
  Pencil,
  Play,
  RefreshCw,
  RotateCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Square,
  Terminal,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetVpsActions,
  useGetVpsServer,
  useStartVps,
} from "@/hooks/useVps";
import type { VpsAction, VpsActionType } from "@/lib/api";
import VpsStatusBadge, { isVpsBusy } from "@/components/vps/VpsStatusBadge";
import FirewallEditor from "@/components/vps/FirewallEditor";
import {
  DeleteVpsModal,
  RebuildVpsModal,
  RebootVpsModal,
  RenewVpsModal,
  RenameVpsModal,
  ResizeVpsModal,
  StopVpsModal,
} from "@/components/vps/VpsActionModals";
import {
  daysUntil,
  formatNaira,
  formatVpsDate,
  formatVpsDateTime,
  humanizeImage,
  locationLabel,
  vpsStatusLabel,
} from "@/components/vps/vps-utils";

type ModalKind =
  | "stop"
  | "reboot"
  | "rename"
  | "rebuild"
  | "resize"
  | "delete"
  | "renew"
  | null;

const ACTION_ICONS: Record<VpsActionType, LucideIcon> = {
  CREATE: Server,
  START: Play,
  STOP: Square,
  REBOOT: RotateCw,
  REBUILD: RefreshCw,
  RESIZE: TrendingUp,
  DELETE: Trash2,
};

const ACTION_LABELS: Record<VpsActionType, string> = {
  CREATE: "Server created",
  START: "Powered on",
  STOP: "Powered off",
  REBOOT: "Rebooted",
  REBUILD: "Reinstalled",
  RESIZE: "Resized",
  DELETE: "Deleted",
};

function billingHint(iso?: string | null) {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      label: `${overdue} day${overdue === 1 ? "" : "s"} overdue`,
      tone: "text-[#C21F1F]",
    };
  }
  if (days === 0) return { label: "Due today", tone: "text-[#9A5B00]" };
  if (days <= 5) {
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      tone: "text-[#9A5B00]",
    };
  }
  return { label: `${days} days left`, tone: "text-[#5A6A85]" };
}

function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Could not copy the ${label.toLowerCase()}`);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={`p-1.5 rounded-md text-[#5A6A85] hover:text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0 ${className}`}
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C3A]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  reason,
  tone = "default",
  busy = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  reason?: string;
  tone?: "default" | "danger";
  busy?: boolean;
}) {
  const base =
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";
  const styling =
    tone === "danger"
      ? "border-[#F3C7C7] bg-white text-[#C21F1F] hover:bg-[#FDECEC]"
      : "border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? reason : undefined}
      aria-label={label}
      className={`${base} ${styling}`}
    >
      {busy ? (
        <Loader2
          className={`w-3.5 h-3.5 animate-spin ${
            tone === "danger" ? "text-[#C21F1F]" : "text-[#5A6A85]"
          }`}
        />
      ) : (
        <Icon
          className={`w-3.5 h-3.5 ${
            tone === "danger" ? "text-[#C21F1F]" : "text-[#5A6A85]"
          }`}
        />
      )}
      {label}
    </button>
  );
}

function ActionStatusBadge({ status }: { status: VpsAction["status"] }) {
  if (status === "SUCCEEDED") {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
        Succeeded
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#C21F1F]">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
      {status === "PENDING" ? (
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#E8900A]" />
      ) : (
        <Loader2 aria-hidden className="w-3.5 h-3.5 shrink-0 animate-spin text-[#1787D4]" />
      )}
      {status === "PENDING" ? "Queued" : "Running"}
    </span>
  );
}

function actionDetail(action: VpsAction): string | null {
  if (action.status === "FAILED") {
    const error = action.error;
    const message =
      error && typeof error.message === "string" ? error.message : null;
    return message ?? "The provider rejected this action.";
  }

  const metadata = action.metadata ?? {};

  if (action.type === "RESIZE") {
    const from = metadata.fromPlanName;
    const to = metadata.toPlanName;
    if (typeof from === "string" && typeof to === "string") {
      return `${from} → ${to}`;
    }
  }

  if (action.type === "REBUILD" && typeof metadata.image === "string") {
    return humanizeImage(metadata.image);
  }

  if (action.type === "DELETE" && typeof metadata.previousStatus === "string") {
    return `Previous status: ${vpsStatusLabel(metadata.previousStatus)}`;
  }

  if (action.type === "STOP" && metadata.command === "poweroff") {
    return "Forced power off";
  }

  return null;
}

export default function VpsDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();

  const serverQuery = useGetVpsServer(id);
  const actionsQuery = useGetVpsActions(id);
  const startVps = useStartVps(id);

  const [modal, setModal] = useState<ModalKind>(null);

  const server = serverQuery.data;
  const actions = useMemo(() => actionsQuery.data ?? [], [actionsQuery.data]);

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-3">
        <h2 className="text-base font-semibold text-[#031033]">
          Server not found
        </h2>
        <Link
          href="/dashboard/vps"
          className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          Back to VPS servers
        </Link>
      </div>
    );
  }

  if (serverQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto" aria-label="Loading server">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-[#EEF2F7] animate-pulse" />
          <div className="h-8 w-64 rounded bg-[#EEF2F7] animate-pulse" />
          <div className="h-3 w-80 max-w-full rounded bg-[#EEF2F7] animate-pulse" />
        </div>
        <div className="h-14 rounded-xl bg-[#EEF2F7] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-72 rounded-xl bg-[#EEF2F7] animate-pulse" />
          <div className="lg:col-span-4 h-56 rounded-xl bg-[#EEF2F7] animate-pulse" />
        </div>
      </div>
    );
  }

  if (serverQuery.isError || !server) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-3 max-w-md mx-auto">
        <AlertCircle className="w-5 h-5 text-[#DC2626]" />
        <h2 className="text-base font-semibold text-[#031033]">
          Could not load this server
        </h2>
        <p className="text-sm text-[#5A6A85]">
          {serverQuery.error instanceof Error
            ? serverQuery.error.message
            : "It may have been deleted, or you may not have access."}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => serverQuery.refetch()}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try again
          </button>
          <Link
            href="/dashboard/vps"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            All servers
          </Link>
        </div>
      </div>
    );
  }

  const status = server.status;
  const busy = isVpsBusy(status);
  const provisioning = status === "PROVISIONING";
  const running = status === "RUNNING";
  const stopped = status === "STOPPED";
  const suspended = status === "SUSPENDED";
  const failed = status === "FAILED";
  const deleted = status === "DELETED";
  const deleting = status === "DELETING";

  const canStart = stopped && !!server.providerServerId;
  const canStop = running;
  const canReboot = running;
  const canRename = !deleted && !deleting;
  const canRebuild =
    (running || stopped) && !!server.providerServerId && !busy;
  const canResize =
    stopped && !!server.plan && !!server.providerServerId && !busy;
  const canDelete =
    !deleted && !deleting && !busy && !!server.providerServerId;
  const canRenew = !deleted && !failed && !deleting && !!server.plan;
  const canEditFirewall =
    !provisioning && !deleted && !failed && !deleting;

  const powerReason = suspended
    ? "This server is suspended. Renew it to restore access."
    : !server.providerServerId
      ? "The server is still being provisioned."
      : undefined;

  const price = server.plan?.priceNgnMonthly ?? 0;
  const renewal = billingHint(server.nextBillingAt);

  const busyMessage = provisioning
    ? "We are creating your server. This usually takes under a minute."
    : status === "REBOOTING"
      ? "Your server is rebooting."
      : status === "REBUILDING"
        ? "Your server is being reinstalled from a fresh image."
        : deleting
          ? "This server is being deleted."
          : "An action is in progress.";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Back + header ─────────────────────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/vps"
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          All VPS servers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-[#031033] truncate">
                  {server.name}
                </h1>
                <VpsStatusBadge status={status} />
              </div>
              <p className="text-sm text-[#5A6A85] mt-1">
                {server.plan?.name ?? "VPS"} · {humanizeImage(server.image)} ·{" "}
                {locationLabel(server.location)}
              </p>
              <p className="text-xs text-[#5A6A85] mt-1 tabular-nums">
                Created {formatVpsDate(server.createdAt)}
                {server.lastSyncedAt
                  ? ` · Synced ${formatVpsDateTime(server.lastSyncedAt)}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => serverQuery.refetch()}
              disabled={serverQuery.isFetching}
              aria-label="Refresh server"
              title="Refresh server"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[#D5DCE6] bg-white text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  serverQuery.isFetching ? "animate-spin" : ""
                }`}
              />
            </button>

            {canRenew && (
              <button
                type="button"
                id="vps-renew-cta"
                onClick={() => setModal("renew")}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
              >
                <CalendarClock className="w-4 h-4" />
                Renew{price > 0 ? ` · ${formatNaira(price)}` : ""}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status banners ────────────────────────────────────────────── */}
      {suspended && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#C21F1F]">
                Server suspended for non-payment
              </p>
              <p className="text-sm text-[#C21F1F] mt-0.5">
                {server.nextBillingAt
                  ? `The renewal was due on ${formatVpsDate(
                      server.nextBillingAt,
                    )}. `
                  : ""}
                Renew to restore access. The server is powered back on
                automatically after payment.
              </p>
            </div>
          </div>
          {canRenew && (
            <button
              type="button"
              onClick={() => setModal("renew")}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#F3C7C7] bg-white text-[#C21F1F] hover:bg-[#FDECEC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Renew now
            </button>
          )}
        </div>
      )}

      {failed && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#C21F1F]">
              This server could not be provisioned
            </p>
            <p className="text-sm text-[#C21F1F] mt-0.5 leading-relaxed">
              If you were charged for this server, we request a refund to your
              original payment method. Paystack processes it, and bank
              settlement can take up to 10 business days. Contact support if you
              need help or want to try again.
            </p>
            <Link
              href="/dashboard/tickets"
              className="inline-block mt-1.5 rounded text-sm font-medium text-[#C21F1F] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30"
            >
              Contact support
            </Link>
          </div>
        </div>
      )}

      {deleted && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
          <AlertCircle className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#031033]">
              This server has been deleted
            </p>
            <p className="text-sm text-[#5A6A85] mt-0.5">
              Billing has stopped and the data is no longer available. Its
              history remains below for your records.
            </p>
          </div>
        </div>
      )}

      {busy && !deleted && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3">
          <Loader2 className="w-4 h-4 text-[#1787D4] animate-spin shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#031033]">
              {busyMessage}
            </p>
            <p className="text-sm text-[#5A6A85] mt-0.5">
              This page refreshes automatically. You can safely leave it open.
            </p>
          </div>
        </div>
      )}

      {server.providerSynced === false && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] px-4 py-3 text-sm text-[#9A5B00]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            We could not reach the provider just now, so this is the last known
            state.{" "}
            <button
              type="button"
              onClick={() => serverQuery.refetch()}
              className="rounded font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8900A]/30"
            >
              Refresh
            </button>
          </span>
        </div>
      )}

      {/* ── Action toolbar ────────────────────────────────────────────── */}
      {!deleted && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-5 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#5A6A85] mr-1">
            Actions
          </span>

          <ActionButton
            icon={Play}
            label="Start"
            onClick={() => startVps.mutate(undefined)}
            disabled={!canStart || suspended}
            reason={
              suspended
                ? powerReason
                : stopped
                  ? undefined
                  : "Only a stopped server can be started."
            }
            busy={startVps.isPending}
          />
          <ActionButton
            icon={Square}
            label="Stop"
            onClick={() => setModal("stop")}
            disabled={!canStop || suspended}
            reason={suspended ? powerReason : "Only a running server can be stopped."}
          />
          <ActionButton
            icon={RotateCw}
            label="Reboot"
            onClick={() => setModal("reboot")}
            disabled={!canReboot || suspended}
            reason={
              suspended ? powerReason : "Only a running server can be rebooted."
            }
          />

          <span className="hidden sm:block h-5 w-px bg-[#E2E8F0] mx-1" />

          <ActionButton
            icon={Pencil}
            label="Rename"
            onClick={() => setModal("rename")}
            disabled={!canRename}
            reason="This server can no longer be renamed."
          />
          <ActionButton
            icon={RefreshCw}
            label="Rebuild"
            onClick={() => setModal("rebuild")}
            disabled={!canRebuild}
            reason={
              !server.providerServerId
                ? "The server is still being provisioned."
                : "The server must be running or stopped to rebuild."
            }
          />
          <ActionButton
            icon={TrendingUp}
            label="Resize"
            onClick={() => setModal("resize")}
            disabled={!canResize}
            reason={
              !server.providerServerId
                ? "The server is still being provisioned."
                : "Stop the server before resizing it."
            }
          />

          <span className="flex-1" />

          <ActionButton
            icon={Trash2}
            label="Delete"
            tone="danger"
            onClick={() => setModal("delete")}
            disabled={!canDelete}
            reason={
              deleting
                ? "This server is already being deleted."
                : "Wait for provisioning to finish before deleting."
            }
          />
        </div>
      )}

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Overview */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F7]">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Overview
                  </h3>
                  <p className="text-xs text-[#5A6A85]">
                    Connection details and server configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#EEF2F7] bg-[#F2F5FC] px-4 py-3">
                  <span className="text-xs text-[#5A6A85] flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public IPv4
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-mono text-[#031033] break-all">
                      {server.ipv4 ?? (
                        <span className="font-sans text-[#5A6A85]">Pending</span>
                      )}
                    </span>
                    {server.ipv4 && (
                      <CopyButton value={server.ipv4} label="IP address" />
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-[#EEF2F7] bg-[#F2F5FC] px-4 py-3">
                  <span className="text-xs text-[#5A6A85] flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public IPv6
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-mono text-[#031033] break-all">
                      {server.ipv6 ?? (
                        <span className="font-sans text-[#5A6A85]">Pending</span>
                      )}
                    </span>
                    {server.ipv6 && (
                      <CopyButton value={server.ipv6} label="IPv6 address" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Plan
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5">
                    {server.plan?.name ?? "—"}
                  </span>
                  {server.plan && (
                    <span className="text-xs text-[#5A6A85] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> {server.plan.cpu} vCPU
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MemoryStick className="w-3 h-3" />{" "}
                        {server.plan.ramGb} GB RAM
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> {server.plan.diskGb} GB
                      </span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Operating system
                  </span>
                  <span className="text-sm font-medium text-[#031033] block mt-0.5">
                    {humanizeImage(server.image)}
                  </span>
                  <span className="text-xs font-mono text-[#5A6A85]">
                    {server.image}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Location
                  </span>
                  <span className="text-sm font-medium text-[#031033] mt-0.5 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5A6A85]" />
                    {locationLabel(server.location)}
                  </span>
                  <span className="block text-xs font-mono text-[#5A6A85]">
                    {server.location}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Firewall
                  </span>
                  <span className="text-sm font-medium text-[#031033] mt-0.5 inline-flex items-center gap-1">
                    <ShieldCheck
                      className={`w-3.5 h-3.5 ${
                        server.firewallConfigured
                          ? "text-[#0E7C3A]"
                          : "text-[#5A6A85]"
                      }`}
                    />
                    {server.firewallConfigured ? "Configured" : "Not configured"}
                  </span>
                  <span className="block text-xs text-[#5A6A85]">
                    {server.firewallConfigured
                      ? "Firewall attached to this server"
                      : "Default rules are not applied yet"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SSH access */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F7]">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    SSH access
                  </h3>
                  <p className="text-xs text-[#5A6A85]">
                    Connect with the key you attached at checkout.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/vps#ssh-keys"
                className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0"
              >
                Manage keys
              </Link>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {server.sshKey ? (
                <div className="flex items-center gap-3 rounded-lg border border-[#EEF2F7] bg-[#F2F5FC] px-4 py-3">
                  <ShieldCheck className="w-4 h-4 text-[#0E7C3A] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#031033] truncate">
                      {server.sshKey.name}
                    </p>
                    <p className="text-xs text-[#5A6A85]">
                      Authorised SSH key
                    </p>
                  </div>
                  <Terminal className="w-4 h-4 text-[#5A6A85] shrink-0" />
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] px-4 py-3 text-sm text-[#9A5B00]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No SSH key is attached. Add one and contact support if you
                    cannot log in.
                  </span>
                </div>
              )}

              {server.ipv4 ? (
                <div>
                  <span className="text-xs font-medium text-[#5A6A85] block mb-1.5">
                    Connect from your terminal
                  </span>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] pl-4 pr-2 py-2">
                    <code className="text-sm font-mono text-[#031033] truncate">
                      ssh root@{server.ipv4}
                    </code>
                    <CopyButton
                      value={`ssh root@${server.ipv4}`}
                      label="SSH command"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#5A6A85]">
                  The SSH command appears once a public IP is assigned.
                </p>
              )}

              <p className="text-xs text-[#5A6A85] leading-relaxed">
                Nupat never stores or emails root passwords. Log in with the
                private key that matches the public key above.
              </p>
            </div>
          </div>

          {!failed && !deleted && !deleting && (
            <FirewallEditor vpsId={server.id} disabled={!canEditFirewall} />
          )}

          {/* Activity */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F7]">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Activity
                  </h3>
                  <p className="text-xs text-[#5A6A85]">
                    Recent actions on this server.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => actionsQuery.refetch()}
                disabled={actionsQuery.isFetching}
                className="inline-flex items-center gap-1.5 h-8 px-3 -mr-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    actionsQuery.isFetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {actionsQuery.isLoading ? (
              <div className="divide-y divide-[#EEF2F7]" aria-label="Loading activity">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 rounded bg-[#EEF2F7] animate-pulse" />
                      <div className="h-3 w-48 rounded bg-[#EEF2F7] animate-pulse" />
                    </div>
                    <div className="h-3 w-24 rounded bg-[#EEF2F7] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : actionsQuery.isError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                <p className="text-sm text-[#5A6A85]">
                  Could not load activity.
                </p>
                <button
                  type="button"
                  onClick={() => actionsQuery.refetch()}
                  className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Try again
                </button>
              </div>
            ) : actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                <p className="text-sm font-medium text-[#031033]">
                  No activity yet
                </p>
                <p className="text-sm text-[#5A6A85] mt-1">
                  Power and lifecycle actions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EEF2F7]">
                {actions.map((action) => {
                  const Icon = ACTION_ICONS[action.type] ?? Server;
                  const detail = actionDetail(action);

                  return (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 px-5 py-3.5"
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          action.status === "FAILED"
                            ? "text-[#DC2626]"
                            : "text-[#5A6A85]"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#031033]">
                            {ACTION_LABELS[action.type] ?? action.type}
                          </p>
                          <ActionStatusBadge status={action.status} />
                        </div>
                        {detail && (
                          <p className="text-xs text-[#5A6A85] mt-0.5 break-words">
                            {detail}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-[#5A6A85] tabular-nums whitespace-nowrap shrink-0 text-right">
                        {formatVpsDateTime(
                          action.completedAt ??
                            action.startedAt ??
                            action.createdAt,
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[#031033]">
                Billing
              </h3>
            </div>

            {deleted ? (
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                This server has been deleted. Billing has stopped and no further
                renewals are scheduled.
              </p>
            ) : failed ? (
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                Renewal is unavailable for a server that failed to provision.
                Contact support if you need assistance.
              </p>
            ) : (
              <>
                <span className="text-xs text-[#5A6A85] block">
                  Next renewal
                </span>
                <p className="text-2xl font-semibold text-[#031033] tabular-nums mt-1">
                  {formatVpsDate(server.nextBillingAt)}
                </p>
                {suspended ? (
                  <span className="text-xs font-medium text-[#C21F1F]">
                    Payment overdue, server suspended
                  </span>
                ) : renewal ? (
                  <span className={`text-xs font-medium ${renewal.tone}`}>
                    {renewal.label}
                  </span>
                ) : (
                  <span className="text-xs text-[#5A6A85]">
                    No renewal scheduled
                  </span>
                )}

                <div className="mt-3.5 pt-3.5 border-t border-[#EEF2F7] flex items-center justify-between text-sm">
                  <span className="text-[#5A6A85]">Plan price</span>
                  <span className="font-medium text-[#031033] tabular-nums">
                    {price > 0 ? `${formatNaira(price)} / month` : "—"}
                  </span>
                </div>

                {canRenew && (
                  <button
                    type="button"
                    onClick={() => setModal("renew")}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CalendarClock className="w-4 h-4 text-[#5A6A85]" />
                    {suspended ? "Renew and restore" : "Renew server"}
                  </button>
                )}

                <p className="text-xs text-[#5A6A85] mt-3 leading-relaxed">
                  Servers are prepaid for 30 days. There are no automatic card
                  charges, so renew manually before the due date.
                </p>
              </>
            )}
          </div>

          <div className="bg-[#E8F4FC] border border-[#1787D4]/20 rounded-xl p-5">
            <div>
              <div>
                <h4 className="text-sm font-medium text-[#031033]">
                  Need help with this server?
                </h4>
                <p className="text-xs text-[#5A6A85] mt-0.5 leading-relaxed">
                  Our team can help with networking, access or billing
                  questions.
                </p>
                <Link
                  href="/dashboard/tickets"
                  className="inline-flex mt-2 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Open a support ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal === "stop" && (
        <StopVpsModal server={server} onClose={() => setModal(null)} />
      )}
      {modal === "reboot" && (
        <RebootVpsModal server={server} onClose={() => setModal(null)} />
      )}
      {modal === "rename" && (
        <RenameVpsModal server={server} onClose={() => setModal(null)} />
      )}
      {modal === "rebuild" && (
        <RebuildVpsModal server={server} onClose={() => setModal(null)} />
      )}
      {modal === "resize" && (
        <ResizeVpsModal server={server} onClose={() => setModal(null)} />
      )}
      {modal === "delete" && (
        <DeleteVpsModal
          server={server}
          onClose={() => setModal(null)}
          onDeleted={() => router.push("/dashboard/vps")}
        />
      )}
      {modal === "renew" && (
        <RenewVpsModal server={server} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
