"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import {
  useGetExpiryWarnings,
  useDismissedWarnings,
} from "@/hooks/useExpiryWarnings";
import { useRenewHosting } from "@/hooks/useHosting";
import { useRenewDomain } from "@/hooks/useDomains";
import type { ExpiryWarning } from "@/lib/api";

export default function ExpiryBanner() {
  const pathname = usePathname();
  const { data, isLoading } = useGetExpiryWarnings();
  const { isDismissed, dismissWarning } = useDismissedWarnings();
  const { mutate: renewHosting, isPending: isRenewingHosting } =
    useRenewHosting();
  const { mutate: renewDomain, isPending: isRenewingDomain } = useRenewDomain();

  const [renewingId, setRenewingId] = useState<string | null>(null);

  // Show exclusively on the main dashboard page
  if (pathname !== "/dashboard") {
    return null;
  }

  const warnings = data?.warnings || [];

  // Filter out session-dismissed warnings
  const visibleWarnings = warnings.filter((w) => !isDismissed(w.type, w.id));

  if (isLoading || visibleWarnings.length === 0) {
    return null;
  }

  const handleRenew = (warning: ExpiryWarning) => {
    setRenewingId(warning.id);
    if (warning.type === "HOSTING") {
      renewHosting(
        { id: warning.id },
        { onSettled: () => setRenewingId(null) },
      );
    } else {
      renewDomain(warning.id, {
        onSettled: () => setRenewingId(null),
      });
    }
  };

  const getServiceLink = (warning: ExpiryWarning) => {
    return warning.type === "HOSTING"
      ? `/dashboard/hosting/${warning.id}`
      : `/dashboard/domains/${warning.id}`;
  };

  return (
    <div className="w-full shrink-0 flex flex-col z-20">
      {visibleWarnings.map((warning) => {
        const isExpired =
          warning.isExpired ||
          (warning.daysLeft !== null && warning.daysLeft < 0);
        const isProcessing =
          (isRenewingHosting || isRenewingDomain) && renewingId === warning.id;
        const serviceName =
          warning.label ||
          (warning.type === "HOSTING" ? "Hosting Plan" : "Domain Name");
        const typeStr = warning.type === "HOSTING" ? "Hosting" : "Domain";

        let statusText = "expiring soon";
        if (isExpired) {
          statusText = "has expired";
        } else if (warning.daysLeft === 0) {
          statusText = "expires today";
        } else if (warning.daysLeft === 1) {
          statusText = "expires tomorrow";
        } else if (warning.daysLeft !== null && warning.daysLeft > 1) {
          statusText = `expires in ${warning.daysLeft} days`;
        }

        return (
          <div
            key={`${warning.type}:${warning.id}`}
            id={`expiry-banner-${warning.type.toLowerCase()}-${warning.id}`}
            className="w-full bg-[#0a0f1d] border-b border-white/10 px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all text-white text-[12.5px]"
          >
            {/* Left Content */}
            <div className="flex items-center gap-2 flex-wrap min-w-0 pr-2">
              <span
                className={`font-bold tracking-tight text-[11px] uppercase ${
                  isExpired ? "text-red-400" : "text-orange-400"
                }`}
              >
                {isExpired ? "Expired" : "Expiring Soon"}
              </span>
              <span className="text-white/30">•</span>
              <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-sm">
                {serviceName}
              </span>
              <span className="text-white/30 hidden md:inline">•</span>
              <span className="text-slate-300 text-[12px] hidden md:inline">
                Your {typeStr.toLowerCase()} {statusText}. Renew to prevent service disruption.
              </span>
            </div>

            {/* Actions & Dismiss */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              <Link
                href={getServiceLink(warning)}
                className="text-[11.5px] font-medium text-slate-400 hover:text-white transition-colors"
              >
                Details
              </Link>

              <button
                type="button"
                id={`btn-renew-${warning.id}`}
                onClick={() => handleRenew(warning)}
                disabled={isProcessing}
                className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[11.5px] font-semibold text-white bg-[#1787D4] hover:bg-[#1371B5] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-xs whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    <span>Renewing…</span>
                  </>
                ) : (
                  <span>Renew now</span>
                )}
              </button>

              <button
                type="button"
                id={`btn-dismiss-${warning.type.toLowerCase()}-${warning.id}`}
                onClick={() => dismissWarning(warning.type, warning.id)}
                title="Dismiss for this session"
                aria-label="Dismiss warning for this session"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
