"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Server,
  Globe,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useGetExpiryWarnings } from "@/hooks/useExpiryWarnings";
import type { ExpiryWarning } from "@/lib/api";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetExpiryWarnings();

  const count = data?.count ?? 0;
  const warnings = data?.warnings ?? [];

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
        className="relative p-2 rounded-xl text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f2f5fc] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />

        {/* Count Badge */}
        {count > 0 && (
          <span
            id="notification-bell-badge"
            className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#e8900a] text-white text-[9.5px] font-extrabold flex items-center justify-center rounded-full shadow-xs ring-2 ring-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          id="dashboard-notification-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#e2eaff] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Panel Header */}
          <div className="px-4 py-3 bg-white border-b border-[#f2f5fc] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-[#031033]">
                Notifications
              </span>
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {count} warning{count === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#8a9bb2]">
              Expiry Warnings
            </span>
          </div>

          {/* Warnings List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f5f8ff]">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-[#8a9bb2]">
                Loading notifications…
              </div>
            ) : sortedWarnings.length === 0 ? (
              <div className="py-8 px-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                  <Bell className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-[13px] font-semibold text-[#031033]">
                  All caught up!
                </p>
                <p className="text-[11.5px] text-[#5a6a85] mt-0.5">
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
                    className="flex items-start gap-3 p-3.5 hover:bg-[#fbfcfe] transition-colors group cursor-pointer"
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isExpired
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isExpired ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : warning.type === "HOSTING" ? (
                        <Server className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#031033] leading-snug group-hover:text-[#1787D4] transition-colors">
                        {formatWarningMessage(warning)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                            isExpired
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isExpired ? "Expired" : "Expiring"}
                        </span>
                        {warning.expiresAt && (
                          <span className="text-[11px] text-[#8a9bb2]">
                            {new Date(warning.expiresAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#8a9bb2] group-hover:text-[#1787D4] group-hover:translate-x-0.5 transition-all mt-1.5 shrink-0" />
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
