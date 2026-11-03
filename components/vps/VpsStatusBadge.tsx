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
    className: "text-[#031033]",
    dot: "bg-[#1787D4]",
  },
  RUNNING: {
    label: "Running",
    className: "text-[#031033]",
    dot: "bg-[#12A150]",
  },
  STOPPED: {
    label: "Stopped",
    className: "text-[#031033]",
    dot: "bg-[#9AA6B8]",
  },
  REBOOTING: {
    label: "Rebooting",
    className: "text-[#031033]",
    dot: "bg-[#1787D4]",
  },
  REBUILDING: {
    label: "Rebuilding",
    className: "text-[#031033]",
    dot: "bg-[#1787D4]",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "text-[#C21F1F]",
    dot: "bg-[#DC2626]",
  },
  FAILED: {
    label: "Failed",
    className: "text-[#C21F1F]",
    dot: "bg-[#DC2626]",
  },
  DELETING: {
    label: "Deleting",
    className: "text-[#031033]",
    dot: "bg-[#1787D4]",
  },
  DELETED: {
    label: "Deleted",
    className: "text-[#031033]",
    dot: "bg-[#9AA6B8]",
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
      className: "text-[#031033]",
      dot: "bg-[#9AA6B8]",
    };

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap text-sm ${style.className} ${className}`}
    >
      {isVpsBusy(key) ? (
        <Loader2 aria-hidden className="w-3.5 h-3.5 shrink-0 animate-spin text-[#1787D4]" />
      ) : (
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
      )}
      {style.label}
    </span>
  );
}
