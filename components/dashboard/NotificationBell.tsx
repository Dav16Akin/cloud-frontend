"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Bell, Server, Globe, ArrowRight } from "lucide-react";
import { useGetExpiryWarnings } from "@/hooks/useExpiryWarnings";
import type { ExpiryWarning } from "@/lib/api";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetExpiryWarnings();

  // Capture "now" once per mount; Date.now() during render is impure.
  const [now] = useState(() => Date.now());

  // Ensure notification bell only shows services that have expired or have <= 10 days remaining
  const warnings = useMemo(() => {
    const rawWarnings = data?.warnings ?? [];
    return rawWarnings.filter((w) => {
      const isExpired =
        w.isExpired || (w.daysLeft !== null && w.daysLeft < 0);
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
  }, [data?.warnings, now]);

  const count = warnings.length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Sort warnings:
  // 1. Expired services appear before services that have not expired
  // 2. Sort by nearest expiry first (lowest daysLeft)
  const sortedWarnings = useMemo(() => {
    return [...warnings].sort((a, b) => {
      if (a.isExpired && !b.isExpired) return -1;
      if (!a.isExpired && b.isExpired) return 1;

      const aDays = a.daysLeft ?? 9999;
      const bDays = b.daysLeft ?? 9999;
      return aDays - bDays;
    });
  }, [warnings]);

  // Dynamic message formatter per requirements
  const formatWarningMessage = (w: ExpiryWarning) => {
    const label = w.label || (w.type === "HOSTING" ? "Hosting service" : "Domain");
    const typeLabel = w.type === "HOSTING" ? "hosting" : "domain";

    if (w.isExpired || (w.daysLeft !== null && w.daysLeft < 0)) {
      return `${label} ${typeLabel} has expired`;
    }
    if (w.daysLeft === 0) {
      return `${label} ${typeLabel} expires today`;
    }
    if (w.daysLeft === 1) {
      return `${label} ${typeLabel} expires tomorrow`;
    }
    if (w.daysLeft !== null && w.daysLeft > 1) {
      return `${label} ${typeLabel} expires in ${w.daysLeft} days`;
    }
    return `${label} ${typeLabel} expires soon`;
  };

  const getServiceLink = (w: ExpiryWarning) => {
    return w.type === "HOSTING"
      ? `/dashboard/hosting/${w.id}`
      : `/dashboard/domains/${w.id}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="dashboard-notification-bell"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#5A6A85] transition-colors hover:bg-[#F2F5FC] hover:text-[#031033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />

        {/* Count badge */}
        {count > 0 && (
          <span
            id="notification-bell-badge"
            className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#1787D4] px-1 text-xs font-medium leading-none tabular-nums text-white ring-2 ring-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Notification dropdown panel */}
      {isOpen && (
        <div
          id="dashboard-notification-panel"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg animate-in fade-in duration-150 sm:w-96"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-[#EEF2F7] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#031033]">
                Notifications
              </span>
              {count > 0 && (
                <span className="text-xs font-medium tabular-nums text-[#9A5B00]">
                  {count} warning{count === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <span className="text-xs text-[#5A6A85]">Expiry warnings</span>
          </div>

          {/* Warnings list */}
          <div className="max-h-96 divide-y divide-[#EEF2F7] overflow-y-auto">
            {isLoading ? (
              <div aria-label="Loading notifications" className="divide-y divide-[#EEF2F7]">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded bg-[#EEF2F7]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#EEF2F7]" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#EEF2F7]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedWarnings.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm font-medium text-[#031033]">
                  All caught up
                </p>
                <p className="mt-1 text-xs text-[#5A6A85]">
                  No active domain or hosting expiry warnings.
                </p>
              </div>
            ) : (
              sortedWarnings.map((warning) => {
                const isExpired =
                  warning.isExpired || (warning.daysLeft !== null && warning.daysLeft < 0);

                return (
                  <Link
                    key={`${warning.type}-${warning.id}`}
                    href={getServiceLink(warning)}
                    onClick={() => setIsOpen(false)}
                    className="group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#F2F5FC]/60 focus-visible:bg-[#F2F5FC] focus-visible:outline-none"
                  >
                    {/* Service type icon, inline (no chip) */}
                    {warning.type === "HOSTING" ? (
                      <Server className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6A85]" />
                    ) : (
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6A85]" />
                    )}

                    {/* Message body */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-[#031033] transition-colors group-hover:text-[#1787D4]">
                        {formatWarningMessage(warning)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${
                            isExpired ? "text-[#C21F1F]" : "text-[#031033]"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              isExpired ? "bg-[#DC2626]" : "bg-[#E8900A]"
                            }`}
                          />
                          {isExpired ? "Expired" : "Expiring"}
                        </span>
                        {warning.expiresAt && (
                          <span className="text-xs tabular-nums text-[#5A6A85]">
                            {new Date(warning.expiresAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#5A6A85] transition-colors group-hover:text-[#1787D4]" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
