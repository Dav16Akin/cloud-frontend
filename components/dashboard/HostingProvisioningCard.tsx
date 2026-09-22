"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Sparkles,
  Info,
  X,
} from "lucide-react";

export interface HostingProvisioningCardProps {
  domain?: string;
  planName?: string;
  status?: string;
  createdAt?: string | number;
  cpanelUsername?: string;
  serverIp?: string;
  isReady?: boolean;
  hostingId?: string;
  onRefresh?: () => void;
  onRefetch?: () => void;
  isRefreshing?: boolean;
  isRefetching?: boolean;
  onDismiss?: () => void;
  showDismiss?: boolean;
  className?: string;
}

export function HostingProvisioningCard({
  domain,
  planName = "Cloud Hosting",
  status = "PENDING",
  createdAt,
  cpanelUsername,
  serverIp,
  isReady = false,
  hostingId,
  onRefresh,
  onRefetch,
  isRefreshing = false,
  isRefetching = false,
  onDismiss,
  showDismiss = false,
  className = "",
}: HostingProvisioningCardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const handleRefresh = onRefresh || onRefetch;
  const isRefreshingActive = isRefreshing || isRefetching;

  // Calculate elapsed time from creation
  useEffect(() => {
    const startTime = createdAt
      ? typeof createdAt === "number"
        ? createdAt
        : new Date(createdAt).getTime()
      : Date.now();

    const updateElapsed = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(seconds);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isCompleted = isReady || (status || "").toUpperCase() === "ACTIVE";

  // Determine stage and progress percentage based on elapsed time or completion
  let currentStep = 1; // 1 = Payment, 2 = Node, 3 = cPanel, 4 = DNS, 5 = Ready
  let progressPercent = 30;

  if (isCompleted) {
    currentStep = 5;
    progressPercent = 100;
  } else if (elapsedSeconds < 25) {
    currentStep = 2;
    progressPercent = 35 + Math.min(20, Math.floor(elapsedSeconds * 0.8));
  } else if (elapsedSeconds < 65) {
    currentStep = 3;
    progressPercent = 60 + Math.min(20, Math.floor((elapsedSeconds - 25) * 0.5));
  } else {
    currentStep = 4;
    progressPercent = Math.min(95, 80 + Math.floor((elapsedSeconds - 65) * 0.2));
  }

  const steps = [
    {
      id: 1,
      title: "Payment Confirmed",
      desc: "Order verified via Paystack",
      done: true,
      active: false,
    },
    {
      id: 2,
      title: "Allocating Cloud Resources",
      desc: "Provisioning CPU, RAM & SSD storage",
      done: currentStep > 2 || isCompleted,
      active: currentStep === 2 && !isCompleted,
    },
    {
      id: 3,
      title: "Creating cPanel & VHost",
      desc: "Generating filesystem & credentials",
      done: currentStep > 3 || isCompleted,
      active: currentStep === 3 && !isCompleted,
    },
    {
      id: 4,
      title: "Configuring DNS & SSL",
      desc: "Setting nameservers & security certificates",
      done: isCompleted,
      active: currentStep === 4 && !isCompleted,
    },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isCompleted
          ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 border-emerald-200 shadow-sm"
          : "bg-gradient-to-br from-[#f8faff] via-white to-[#eff6fc] border-[#d4e4fc] shadow-sm"
      } ${className}`}
    >
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#1787D4]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="p-5 sm:p-6 border-b border-[#e6effb]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Animated pulsing icon */}
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${
                isCompleted
                  ? "bg-emerald-100/70 border-emerald-300 text-emerald-600"
                  : "bg-[#eaf3fe] border-[#cbe1fb] text-[#1787D4]"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Server className="w-6 h-6 animate-pulse" />
              )}
            </div>
            {!isCompleted && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1787D4] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#1787D4]" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-[17px] font-bold text-[#031033] tracking-tight flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <span>Hosting Provisioned & Active</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Live
                    </span>
                  </>
                ) : (
                  <>
                    <span>Provisioning Your Cloud Hosting</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1787D4] bg-[#eff6fc] px-2.5 py-0.5 rounded-full border border-[#d6eaf8]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      In Progress
                    </span>
                  </>
                )}
              </h3>
            </div>

            <p className="text-[13px] text-[#5a6a85] mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#031033] font-mono">
                {domain}
              </span>
              <span>•</span>
              <span className="text-[#1787D4] font-medium">{planName}</span>
              {!isCompleted && elapsedSeconds > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#8a9bb2] flex items-center gap-1 text-[12px]">
                    <Clock className="w-3 h-3" />
                    Elapsed: {elapsedSeconds}s
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {handleRefresh && !isCompleted && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshingActive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#1787D4] bg-white border border-[#d6eaf8] hover:bg-[#eff6fc] active:scale-95 transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshingActive ? "animate-spin" : ""}`}
              />
              <span>{isRefreshingActive ? "Checking…" : "Check Status"}</span>
            </button>
          )}

          {isCompleted && hostingId && (
            <Link
              href={`/dashboard/hosting/${hostingId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#1787D4] hover:bg-[#1370B5] active:scale-95 transition-all shadow-xs"
            >
              <span>Manage Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {showDismiss && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-[#8a9bb2] hover:text-[#031033] hover:bg-slate-100 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#5a6a85] mb-2">
            <span>Provisioning Progress</span>
            <span className={isCompleted ? "text-emerald-600 font-bold" : "text-[#1787D4] font-bold"}>
              {progressPercent}% Complete
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#e8eef8] overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-[#1787D4] to-[#4da7e8]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  step.done
                    ? "bg-white/90 border-emerald-200"
                    : step.active
                    ? "bg-white border-[#1787D4] ring-2 ring-[#1787D4]/10 shadow-xs"
                    : "bg-slate-50/60 border-slate-200/70 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                    step.done
                      ? "bg-emerald-100 text-emerald-700"
                      : step.active
                      ? "bg-[#1787D4] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : step.active ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-[13px] font-bold leading-tight ${
                      step.active
                        ? "text-[#031033]"
                        : step.done
                        ? "text-emerald-800"
                        : "text-[#5a6a85]"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11.5px] text-[#8a9bb2] mt-0.5 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational reassurance banner */}
        {!isCompleted ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eff6fc]/80 border border-[#d6eaf8] text-[#1e4a7a]">
            <Info className="w-4 h-4 shrink-0 text-[#1787D4] mt-0.5" />
            <div className="text-[12.5px] leading-relaxed">
              <span className="font-semibold text-[#031033]">
                Automated Cloud Provisioning in progress.{" "}
              </span>
              Our servers are configuring your virtual host, cPanel account, and security policies.
              This typically finishes within <strong>1 to 3 minutes</strong>. You do not have to stay on this screen—we will also email your cPanel login credentials and server IP once complete.
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="text-[12.5px]">
                <span className="font-bold">Your server environment is fully activated!</span>
                {cpanelUsername && (
                  <span className="ml-2 font-mono text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-200 text-[11.5px]">
                    user: {cpanelUsername}
                  </span>
                )}
                {serverIp && (
                  <span className="ml-2 font-mono text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-200 text-[11.5px]">
                    ip: {serverIp}
                  </span>
                )}
              </div>
            </div>

            {hostingId && (
              <Link
                href={`/dashboard/hosting/${hostingId}`}
                className="text-[12.5px] font-bold text-emerald-700 hover:underline shrink-0"
              >
                Access Hosting Features →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostingProvisioningCard;
