"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
      title: "Payment confirmed",
      desc: "Order verified via Paystack",
      done: true,
      active: false,
    },
    {
      id: 2,
      title: "Allocating cloud resources",
      desc: "Provisioning CPU, RAM and SSD storage",
      done: currentStep > 2 || isCompleted,
      active: currentStep === 2 && !isCompleted,
    },
    {
      id: 3,
      title: "Creating cPanel and vhost",
      desc: "Generating filesystem and credentials",
      done: currentStep > 3 || isCompleted,
      active: currentStep === 3 && !isCompleted,
    },
    {
      id: 4,
      title: "Configuring DNS and SSL",
      desc: "Setting nameservers and certificates",
      done: isCompleted,
      active: currentStep === 4 && !isCompleted,
    },
  ];

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#E2E8F0] bg-white ${className}`}
    >
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-[#EEF2F7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#F2F5FC] flex items-center justify-center">
              {isCompleted ? (
                <Image
                  src="/checkmark.svg"
                  alt="Completed"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <Server className="w-5 h-5 text-[#5A6A85]" />
              )}
            </div>
            {!isCompleted && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1787D4] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1787D4]" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#031033] flex items-center gap-2 flex-wrap">
              {isCompleted ? (
                <>
                  <span>Hosting provisioned and active</span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-normal text-[#031033]">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                    Live
                  </span>
                </>
              ) : (
                <>
                  <span>Provisioning your cloud hosting</span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-normal text-[#031033]">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#1787D4]" />
                    In progress
                  </span>
                </>
              )}
            </h3>

            <p className="text-sm text-[#5A6A85] mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[#031033] font-mono">
                {domain}
              </span>
              <span aria-hidden="true">·</span>
              <span>{planName}</span>
              {!isCompleted && elapsedSeconds > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-xs tabular-nums">
                    <Clock className="w-3 h-3" />
                    Elapsed {elapsedSeconds}s
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
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshingActive ? "animate-spin" : ""}`}
              />
              <span>{isRefreshingActive ? "Checking…" : "Check status"}</span>
            </button>
          )}

          {isCompleted && hostingId && (
            <Link
              href={`/dashboard/hosting/${hostingId}`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              <span>Manage account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {showDismiss && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              title="Dismiss"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 flex flex-col gap-5">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#5A6A85] mb-2">
            <span>Provisioning progress</span>
            <span className="font-medium text-[#031033] tabular-nums">
              {progressPercent}% complete
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden">
            <div
              className={`h-full transition-[width] duration-700 ease-out rounded-full ${
                isCompleted ? "bg-[#0E7C3A]" : "bg-[#1787D4]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stepper Timeline */}
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            return (
              <li
                key={step.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  step.active
                    ? "bg-white border-[#1787D4]"
                    : "bg-white border-[#E2E8F0]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-medium mt-px ${
                    step.done
                      ? "text-[#0E7C3A]"
                      : step.active
                      ? "text-[#1787D4]"
                      : "bg-[#EEF2F7] text-[#5A6A85]"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : step.active ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="tabular-nums">{step.id}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      step.done || step.active
                        ? "text-[#031033]"
                        : "text-[#5A6A85]"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-[#5A6A85] mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Informational banner */}
        {!isCompleted ? (
          <div className="flex items-start gap-3 rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033]">
            <Info className="w-4 h-4 shrink-0 text-[#1787D4] mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-medium">Provisioning is running. </span>
              <span className="text-[#5A6A85]">
                We are setting up your virtual host, cPanel account and security policies.
                This usually takes 1 to 3 minutes. You can leave this page; we will email your
                cPanel login and server IP when it is done.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-[#0E7C3A]/20 bg-[#E7F6EC] px-4 py-3 text-sm text-[#031033]">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E7C3A]" />
              <span className="font-medium">Your hosting account is active.</span>
              {cpanelUsername && (
                <span className="font-mono text-xs text-[#031033] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  user: {cpanelUsername}
                </span>
              )}
              {serverIp && (
                <span className="font-mono text-xs text-[#031033] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  ip: {serverIp}
                </span>
              )}
            </div>

            {hostingId && (
              <Link
                href={`/dashboard/hosting/${hostingId}`}
                className="text-sm font-medium text-[#0E7C3A] hover:underline shrink-0"
              >
                Open hosting tools →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostingProvisioningCard;
