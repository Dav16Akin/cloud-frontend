"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  X,
  RefreshCw,
  Server,
  Globe,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  useGetExpiryWarnings,
  useDismissedWarnings,
} from "@/hooks/useExpiryWarnings";
import { useRenewHosting } from "@/hooks/useHosting";
import { useRenewDomain } from "@/hooks/useDomains";
import type { ExpiryWarning } from "@/lib/api";

export default function ExpiryBanner() {
  const { data, isLoading } = useGetExpiryWarnings();
  const { isDismissed, dismissWarning } = useDismissedWarnings();
  const { mutate: renewHosting, isPending: isRenewingHosting } = useRenewHosting();
  const { mutate: renewDomain, isPending: isRenewingDomain } = useRenewDomain();

  const [renewingId, setRenewingId] = useState<string | null>(null);

  const warnings = data?.warnings || [];

  // Filter out session-dismissed warnings
  const visibleWarnings = warnings.filter(
    (w) => !isDismissed(w.type, w.id)
  );

  if (isLoading || visibleWarnings.length === 0) {
    return null;
  }

  const handleRenew = (warning: ExpiryWarning) => {
    setRenewingId(warning.id);
    if (warning.type === "HOSTING") {
      renewHosting(
        { id: warning.id },
        { onSettled: () => setRenewingId(null) }
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
    <div className="flex flex-col gap-2.5 w-full">
      {visibleWarnings.map((warning) => {
        const isExpired =
          warning.isExpired || (warning.daysLeft !== null && warning.daysLeft < 0);
        const isProcessing =
          (isRenewingHosting || isRenewingDomain) && renewingId === warning.id;
        const serviceName =
          warning.label || (warning.type === "HOSTING" ? "Hosting Plan" : "Domain Name");
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
            className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              isExpired
                ? "bg-rose-50/90 border-rose-200/90 text-rose-950"
                : "bg-amber-50/90 border-amber-200/90 text-amber-950"
            }`}
          >
            {/* Left Content */}
            <div className="flex items-start sm:items-center gap-3 pr-8 sm:pr-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                  isExpired
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {warning.type === "HOSTING" ? (
                  <Server className="w-4.5 h-4.5" />
                ) : (
                  <Globe className="w-4.5 h-4.5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[13.5px] leading-snug">
                    {serviceName}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isExpired
                        ? "bg-rose-200 text-rose-900"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {isExpired ? "Service Expired" : `${typeStr} Expiring`}
                  </span>
                </div>
                <p className="text-[12px] opacity-85 mt-0.5">
                  Your {typeStr.toLowerCase()} {statusText}. Renew now to avoid service interruption or loss of data.
                </p>
              </div>
            </div>

            {/* Actions & Dismiss */}
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0 mt-1 sm:mt-0">
              {/* Service details link */}
              <Link
                href={getServiceLink(warning)}
                className={`inline-flex items-center gap-1 text-[12px] font-semibold underline underline-offset-2 transition-opacity hover:opacity-75 mr-1 ${
                  isExpired ? "text-rose-900" : "text-amber-900"
                }`}
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {/* Renew now button */}
              <button
                type="button"
                id={`btn-renew-${warning.id}`}
                onClick={() => handleRenew(warning)}
                disabled={isProcessing}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer ${
                  isExpired
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#e8900a] hover:bg-[#c97a08]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Renewing…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renew now</span>
                  </>
                )}
              </button>

              {/* Session-only Dismiss Button */}
              <button
                type="button"
                id={`btn-dismiss-${warning.type.toLowerCase()}-${warning.id}`}
                onClick={() => dismissWarning(warning.type, warning.id)}
                title="Dismiss for this session"
                aria-label="Dismiss warning for this session"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
