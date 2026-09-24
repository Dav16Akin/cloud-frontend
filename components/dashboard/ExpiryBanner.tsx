"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
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
            className="w-full bg-[#0a0f1d] border-b border-white/10 px-4 sm:px-6 py-2.5 transition-all text-white text-[12.5px]"
          >
            {/* Desktop Row: Single horizontal strip */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {isExpired ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span
                  className={`font-bold tracking-tight text-[11px] uppercase shrink-0 ${
                    isExpired ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {isExpired ? "Expired" : "Expiring Soon"}
                </span>
                <span className="text-white/30 shrink-0">•</span>
                <span className="font-semibold text-white truncate max-w-[200px] md:max-w-xs">
                  {serviceName}
                </span>
                <span className="text-white/30 hidden md:inline shrink-0">•</span>
                <span className="text-slate-300 text-[12px] hidden md:inline truncate">
                  Your {typeStr.toLowerCase()} {statusText}. Renew to prevent service disruption.
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={getServiceLink(warning)}
                  className="text-[12px] font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Details
                </Link>

                <button
                  type="button"
                  id={`btn-renew-${warning.id}`}
                  onClick={() => handleRenew(warning)}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#1787D4] hover:bg-[#1371B5] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
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
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile View: Clean, touch-friendly card layout */}
            <div className="flex sm:hidden flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isExpired ? (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span
                    className={`font-bold text-[10.5px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      isExpired
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {isExpired ? "Expired" : "Expiring Soon"}
                  </span>
                  <span className="font-semibold text-white text-[13px] truncate">
                    {serviceName}
                  </span>
                </div>
                <button
                  type="button"
                  id={`btn-dismiss-mobile-${warning.type.toLowerCase()}-${warning.id}`}
                  onClick={() => dismissWarning(warning.type, warning.id)}
                  title="Dismiss"
                  aria-label="Dismiss warning"
                  className="p-1 -mr-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[12px] text-slate-300">
                Your {typeStr.toLowerCase()} {statusText}. Renew to prevent service disruption.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={getServiceLink(warning)}
                  className="flex-1 text-center py-2 px-3 rounded-lg text-[12px] font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Details
                </Link>

                <button
                  type="button"
                  id={`btn-renew-mobile-${warning.id}`}
                  onClick={() => handleRenew(warning)}
                  disabled={isProcessing}
                  className="flex-1 inline-flex items-center justify-center py-2 px-3 rounded-lg text-[12px] font-semibold text-white bg-[#1787D4] hover:bg-[#1371B5] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Renewing…</span>
                    </>
                  ) : (
                    <span>Renew now</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
