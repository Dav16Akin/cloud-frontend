"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Copy,
  Cpu,
  Globe,
  HardDrive,
  Headphones,
  KeyRound,
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
      tone: "text-red-600",
    };
  }
  if (days === 0) return { label: "Due today", tone: "text-amber-600" };
  if (days <= 5) {
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      tone: "text-amber-600",
    };
  }
  return { label: `${days} days left`, tone: "text-[#6e6e73]" };
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
      className={`p-1.5 rounded-md text-[#8a9bb2] hover:text-[#1787D4] hover:bg-[#eff6fc] transition-colors shrink-0 ${className}`}
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12.5px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styling =
    tone === "danger"
      ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
      : "border-[#e8e8ed] bg-white text-[#1d1d1f] hover:bg-[#f8fafc]";

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
            tone === "danger" ? "text-red-500" : "text-[#1787D4]"
          }`}
        />
      ) : (
        <Icon
          className={`w-3.5 h-3.5 ${
            tone === "danger" ? "text-red-500" : "text-[#1787D4]"
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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="w-3 h-3" />
        Succeeded
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
        <AlertCircle className="w-3 h-3" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
      <Loader2 className="w-3 h-3 animate-spin" />
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
        <div className="w-12 h-12 rounded-xl bg-[#eff6fc] flex items-center justify-center text-[#1787D4]">
          <Server className="w-6 h-6" />
        </div>
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
          Server not found
        </h2>
        <Link
          href="/dashboard/vps"
          className="text-[12.5px] font-semibold text-[#1787D4] hover:underline"
        >
          Back to VPS servers
        </Link>
      </div>
    );
  }

  if (serverQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-6 h-6 text-[#1787D4] animate-spin" />
        <p className="text-[13px] text-[#6e6e73]">Loading server…</p>
      </div>
    );
  }

  if (serverQuery.isError || !server) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-3 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
          <Server className="w-6 h-6" />
        </div>
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
          Could not load this server
        </h2>
        <p className="text-[12.5px] text-[#6e6e73]">
          {serverQuery.error instanceof Error
            ? serverQuery.error.message
            : "It may have been deleted, or you may not have access."}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => serverQuery.refetch()}
            className="px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard/vps"
            className="px-4 py-2 rounded-lg border border-[#e8e8ed] text-[#6e6e73] text-[12.5px] font-semibold hover:bg-[#f5f5f7] transition-colors"
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
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-16">
      {/* ── Back + header ─────────────────────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/vps"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          All VPS servers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-[22px] font-bold truncate"
                  style={{
                    color: "#1d1d1f",
                    fontFamily:
                      "SF Pro Display, system-ui, -apple-system, sans-serif",
                    letterSpacing: "-0.4px",
                  }}
                >
                  {server.name}
                </h2>
                <VpsStatusBadge status={status} />
              </div>
              <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                {server.plan?.name ?? "VPS"} · {humanizeImage(server.image)} ·{" "}
                {locationLabel(server.location)}
              </p>
              <p className="text-[10.5px] text-[#8a9bb2] mt-0.5">
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
              className="p-2 rounded-lg border border-[#e8e8ed] bg-white text-[#6e6e73] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors shadow-sm"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-[#7f1d1d]">
                Server suspended for non-payment
              </p>
              <p className="text-[11.5px] text-red-700/80 mt-0.5">
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold transition-colors shrink-0"
            >
              Renew now
            </button>
          )}
        </div>
      )}

      {failed && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#7f1d1d]">
              This server could not be provisioned
            </p>
            <p className="text-[11.5px] text-red-700/80 mt-0.5 leading-relaxed">
              If you were charged for this server, we request a refund to your
              original payment method. Paystack processes it, and bank
              settlement can take up to 10 business days. Contact support if you
              need help or want to try again.
            </p>
            <Link
              href="/dashboard/tickets"
              className="inline-block mt-1.5 text-[11.5px] font-semibold text-red-700 hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      )}

      {deleted && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-[#e8e8ed] bg-[#fbfcfe] px-4 py-3.5">
          <AlertCircle className="w-5 h-5 text-[#8a9bb2] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#1d1d1f]">
              This server has been deleted
            </p>
            <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
              Billing has stopped and the data is no longer available. Its
              history remains below for your records.
            </p>
          </div>
        </div>
      )}

      {busy && !deleted && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-[#d6eaf8] bg-[#f6fbff] px-4 py-3.5">
          <Loader2 className="w-5 h-5 text-[#1787D4] animate-spin shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#0b4a7a]">
              {busyMessage}
            </p>
            <p className="text-[11.5px] text-[#5a6a85] mt-0.5">
              This page refreshes automatically. You can safely leave it open.
            </p>
          </div>
        </div>
      )}

      {server.providerSynced === false && (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            We could not reach the provider just now, so this is the last known
            state.{" "}
            <button
              type="button"
              onClick={() => serverQuery.refetch()}
              className="font-semibold underline hover:no-underline"
            >
              Refresh
            </button>
          </span>
        </div>
      )}

      {/* ── Action toolbar ────────────────────────────────────────────── */}
      {!deleted && (
        <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] mr-1">
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

          <span className="hidden sm:block h-5 w-px bg-[#eef2f8] mx-1" />

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Overview */}
          <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
                  <Server className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    Overview
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    Connection details and server configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#eef2f8] bg-[#fbfcfe] px-3.5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public IPv4
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[13px] font-mono text-[#1d1d1f] break-all">
                      {server.ipv4 ?? "Pending"}
                    </span>
                    {server.ipv4 && (
                      <CopyButton value={server.ipv4} label="IP address" />
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-[#eef2f8] bg-[#fbfcfe] px-3.5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public IPv6
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[12px] font-mono text-[#1d1d1f] break-all">
                      {server.ipv6 ?? "Pending"}
                    </span>
                    {server.ipv6 && (
                      <CopyButton value={server.ipv6} label="IPv6 address" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Plan
                  </span>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block mt-0.5">
                    {server.plan?.name ?? "—"}
                  </span>
                  {server.plan && (
                    <span className="text-[11px] text-[#6e6e73] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Operating system
                  </span>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] block mt-0.5">
                    {humanizeImage(server.image)}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#8a9bb2]">
                    {server.image}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Location
                  </span>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1787D4]" />
                    {locationLabel(server.location)}
                  </span>
                  <span className="block text-[10.5px] font-mono text-[#8a9bb2]">
                    {server.location}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                    Firewall
                  </span>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5 inline-flex items-center gap-1">
                    <ShieldCheck
                      className={`w-3.5 h-3.5 ${
                        server.firewallConfigured
                          ? "text-emerald-600"
                          : "text-[#8a9bb2]"
                      }`}
                    />
                    {server.firewallConfigured ? "Configured" : "Not configured"}
                  </span>
                  <span className="block text-[10.5px] text-[#8a9bb2]">
                    {server.firewallConfigured
                      ? "Firewall attached to this server"
                      : "Default rules are not applied yet"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SSH access */}
          <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
                  <KeyRound className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    SSH access
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    Connect with the key you attached at checkout.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/vps#ssh-keys"
                className="text-[11.5px] font-semibold text-[#1787D4] hover:underline shrink-0"
              >
                Manage keys
              </Link>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              {server.sshKey ? (
                <div className="flex items-center gap-3 rounded-lg border border-[#eef2f8] bg-[#fbfcfe] px-3.5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold text-[#1d1d1f] truncate">
                      {server.sshKey.name}
                    </p>
                    <p className="text-[10.5px] text-[#8a9bb2]">
                      Authorised SSH key
                    </p>
                  </div>
                  <Terminal className="w-4 h-4 text-[#8a9bb2] shrink-0" />
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    No SSH key is attached. Add one and contact support if you
                    cannot log in.
                  </span>
                </div>
              )}

              {server.ipv4 ? (
                <div>
                  <span className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1.5">
                    Connect from your terminal
                  </span>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#eef2f8] bg-[#f8fafc] px-3.5 py-2.5">
                    <code className="text-[12px] font-mono text-[#1d1d1f] truncate">
                      ssh root@{server.ipv4}
                    </code>
                    <CopyButton
                      value={`ssh root@${server.ipv4}`}
                      label="SSH command"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11.5px] text-[#6e6e73]">
                  The SSH command appears once a public IP is assigned.
                </p>
              )}

              <p className="text-[10.5px] text-[#8a9bb2] leading-relaxed">
                Nupat never stores or emails root passwords. Log in with the
                private key that matches the public key above.
              </p>
            </div>
          </div>

          {!failed && !deleted && !deleting && (
            <FirewallEditor vpsId={server.id} disabled={!canEditFirewall} />
          )}

          {/* Activity */}
          <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
                  <Activity className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    Activity
                  </h3>
                  <p className="text-[11.5px] text-[#6e6e73]">
                    Recent actions on this server.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => actionsQuery.refetch()}
                disabled={actionsQuery.isFetching}
                className="text-[11.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] flex items-center gap-1.5 disabled:opacity-60 shrink-0"
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
              <div className="flex items-center justify-center py-10 gap-2 text-[12px] text-[#6e6e73]">
                <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
                Loading activity…
              </div>
            ) : actionsQuery.isError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-[12px] text-[#6e6e73]">
                  Could not load activity.
                </p>
                <button
                  type="button"
                  onClick={() => actionsQuery.refetch()}
                  className="text-[11.5px] font-semibold text-[#1787D4] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Activity className="w-6 h-6 text-[#aeaeb2]" />
                <p className="text-[12.5px] font-semibold text-[#1d1d1f] mt-2">
                  No activity yet
                </p>
                <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
                  Power and lifecycle actions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f2f5fc]">
                {actions.map((action) => {
                  const Icon = ACTION_ICONS[action.type] ?? Server;
                  const detail = actionDetail(action);

                  return (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 px-5 sm:px-6 py-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                          action.status === "FAILED"
                            ? "bg-red-50 border-red-200 text-red-500"
                            : "bg-[#f8fafc] border-[#eef2f8] text-[#1787D4]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[12.5px] font-semibold text-[#1d1d1f]">
                            {ACTION_LABELS[action.type] ?? action.type}
                          </p>
                          <ActionStatusBadge status={action.status} />
                        </div>
                        {detail && (
                          <p className="text-[11px] text-[#6e6e73] mt-0.5 break-words">
                            {detail}
                          </p>
                        )}
                      </div>

                      <span className="text-[10.5px] text-[#8a9bb2] shrink-0 text-right">
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
        <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-[#1787D4]" />
              <h3 className="text-[14px] font-bold text-[#1d1d1f]">
                Billing
              </h3>
            </div>

            {deleted ? (
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                This server has been deleted. Billing has stopped and no further
                renewals are scheduled.
              </p>
            ) : failed ? (
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                Renewal is unavailable for a server that failed to provision.
                Contact support if you need assistance.
              </p>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
                  Next renewal
                </span>
                <p className="text-[18px] font-bold text-[#1d1d1f] mt-0.5">
                  {formatVpsDate(server.nextBillingAt)}
                </p>
                {suspended ? (
                  <span className="text-[11px] font-semibold text-red-600">
                    Payment overdue — server suspended
                  </span>
                ) : renewal ? (
                  <span className={`text-[11px] font-semibold ${renewal.tone}`}>
                    {renewal.label}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#8a9bb2]">
                    No renewal scheduled
                  </span>
                )}

                <div className="mt-3.5 pt-3.5 border-t border-[#f0f0f3] flex items-center justify-between text-[12.5px]">
                  <span className="text-[#6e6e73]">Plan price</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {price > 0 ? `${formatNaira(price)} / month` : "—"}
                  </span>
                </div>

                {canRenew && (
                  <button
                    type="button"
                    onClick={() => setModal("renew")}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors"
                  >
                    <CalendarClock className="w-4 h-4" />
                    {suspended ? "Renew and restore" : "Renew server"}
                  </button>
                )}

                <p className="text-[10.5px] text-[#8a9bb2] mt-2.5 leading-relaxed">
                  Servers are prepaid for 30 days. There are no automatic card
                  charges — renew manually before the due date.
                </p>
              </>
            )}
          </div>

          <div className="bg-[#eff6fb] border border-[#d3e7f8] rounded-[14px] p-5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#d3e7f8] text-[#1787D4] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#1d1d1f]">
                  Need help with this server?
                </h4>
                <p className="text-[11.5px] text-[#5a6a85] mt-0.5 leading-relaxed">
                  Our team can help with networking, access or billing
                  questions.
                </p>
                <Link
                  href="/dashboard/tickets"
                  className="inline-flex mt-2 text-[11.5px] font-semibold text-[#1787D4] hover:underline"
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
