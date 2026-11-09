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
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import type { ExpiryWarning } from "@/lib/api";

export default function ExpiryBanner() {
  const pathname = usePathname();
  const { data, isLoading } = useGetExpiryWarnings();
  const { isDismissed, dismissWarning } = useDismissedWarnings();
  const { mutate: renewHosting, isPending: isRenewingHosting } =
    useRenewHosting();
  const { mutate: renewDomain, isPending: isRenewingDomain } = useRenewDomain();
  // One-click renewals use the gateway the customer last chose.
  const { method: provider } = usePaymentMethod();

  const [renewingId, setRenewingId] = useState<string | null>(null);
  // Capture "now" once per mount; Date.now() during render is impure.
  const [now] = useState(() => Date.now());

  // Show exclusively on the main dashboard page
  if (pathname !== "/dashboard") {
    return null;
  }

  const warnings = data?.warnings || [];

  // Filter out session-dismissed warnings and show only if expired or <= 10 days to expiry
  const visibleWarnings = warnings.filter((w) => {
    if (isDismissed(w.type, w.id)) return false;
    const isExpired =
      w.isExpired ||
      (w.daysLeft !== null && w.daysLeft < 0);
    if (isExpired) return true;
    if (w.daysLeft !== null) return w.daysLeft <= 10;
    if (w.expiresAt) {
      const diffDays = Math.ceil(
        (new Date(w.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24),
      );
      return diffDays <= 10;
    }
    return false;
  });

  if (isLoading || visibleWarnings.length === 0) {
    return null;
  }

  const handleRenew = (warning: ExpiryWarning) => {
    setRenewingId(warning.id);
    if (warning.type === "HOSTING") {
      renewHosting(
        { id: warning.id, data: { provider } },
        { onSettled: () => setRenewingId(null) },
      );
    } else {
      renewDomain({ id: warning.id, provider }, {
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
          (warning.type === "HOSTING" ? "Hosting plan" : "Domain name");
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
            className="w-full border-b border-white/10 bg-[#031033] px-4 py-2.5 text-sm text-white sm:px-6 lg:px-8"
          >
            {/* Desktop Row: Single horizontal strip */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {isExpired ? (
                  <AlertCircle className="w-4 h-4 text-[#F5A3A3] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#FFC75D] shrink-0" />
                )}
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-white/80">
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isExpired ? "bg-[#DC2626]" : "bg-[#E8900A]"
                    }`}
                  />
                  {isExpired ? "Expired" : "Expiring soon"}
                </span>
                <span className="shrink-0 text-white/30" aria-hidden="true">·</span>
                <span className="max-w-[200px] truncate font-medium text-white md:max-w-xs">
                  {serviceName}
                </span>
                <span className="hidden shrink-0 text-white/30 md:inline" aria-hidden="true">·</span>
                <span className="hidden truncate text-white/70 md:inline">
                  Your {typeStr.toLowerCase()} {statusText}. Renew to prevent service disruption.
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={getServiceLink(warning)}
                  className="rounded-md text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Details
                </Link>

                <button
                  type="button"
                  id={`btn-renew-${warning.id}`}
                  onClick={() => handleRenew(warning)}
                  disabled={isProcessing}
                  className="inline-flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#1787D4] px-3 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                    <AlertCircle className="w-4 h-4 text-[#F5A3A3] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#FFC75D] shrink-0" />
                  )}
                  <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-white/80">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isExpired ? "bg-[#DC2626]" : "bg-[#E8900A]"
                      }`}
                    />
                    {isExpired ? "Expired" : "Expiring soon"}
                  </span>
                  <span className="truncate text-sm font-medium text-white">
                    {serviceName}
                  </span>
                </div>
                <button
                  type="button"
                  id={`btn-dismiss-mobile-${warning.type.toLowerCase()}-${warning.id}`}
                  onClick={() => dismissWarning(warning.type, warning.id)}
                  title="Dismiss"
                  aria-label="Dismiss warning"
                  className="-mr-2 -mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70">
                Your {typeStr.toLowerCase()} {statusText}. Renew to prevent service disruption.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={getServiceLink(warning)}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-white/15 px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Details
                </Link>

                <button
                  type="button"
                  id={`btn-renew-mobile-${warning.id}`}
                  onClick={() => handleRenew(warning)}
                  disabled={isProcessing}
                  className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#1787D4] px-3 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
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
