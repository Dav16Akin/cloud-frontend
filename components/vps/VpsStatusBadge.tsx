"use client";

import { Loader2 } from "lucide-react";
import type { VpsStatus } from "@/lib/api";

const BUSY_STATUSES: VpsStatus[] = [
  "PROVISIONING",
  "REBOOTING",
  "REBUILDING",
  "DELETING",
];

export function isVpsBusy(status?: string | null) {
  return BUSY_STATUSES.includes((status ?? "").toUpperCase() as VpsStatus);
}

const STATUS_STYLES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  PROVISIONING: {
    label: "Provisioning",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  RUNNING: {
    label: "Running",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  STOPPED: {
    label: "Stopped",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  REBOOTING: {
    label: "Rebooting",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  REBUILDING: {
    label: "Rebuilding",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
  DELETING: {
    label: "Deleting",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function VpsStatusBadge({
  status,
  className = "",
}: {
  status?: string | null;
  className?: string;
}) {
  const key = (status ?? "").toUpperCase();
  const style =
    STATUS_STYLES[key] ?? {
      label: status ?? "Unknown",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-semibold whitespace-nowrap ${style.className} ${className}`}
    >
      {isVpsBusy(key) ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      )}
      {style.label}
    </span>
  );
}
