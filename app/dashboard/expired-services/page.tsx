"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Server,
  Shield,
  Mail,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Info,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetSslCertificates } from "@/hooks/useSsl";
import { useGetHosting } from "@/hooks/useHosting";

// ─── Design tokens (matches rest of dashboard) ───────────────────────────────
const T = {
  ink: "#1d1d1f",
  inkMuted: "#6e6e73",
  inkSubtle: "#aeaeb2",
  canvas: "#ffffff",
  parchment: "#f5f5f7",
  hairline: "#e8e8ed",
  blue: "#1787D4",
  blueLight: "#e8f4fc",
  red: "#dc2626",
  redLight: "#fef2f2",
  redMid: "#fee2e2",
  amber: "#d97706",
  amberLight: "#fffbeb",
  navy: "#0f172a",
  navyMid: "#1e293b",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const exp = new Date(dateStr).getTime();
  return Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceType = "Domain" | "Hosting" | "SSL" | "Email";

type ExpiredService = {
  id: string;
  name: string;
  type: ServiceType;
  expiredOn: string; // ISO date string
  daysAgo: number;
  renewHref: string;
  renewalPrice?: number; // USD
};

type FilterTab = "All" | ServiceType;
type SortField = "name" | "type" | "expiredOn";
type SortDir = "asc" | "desc";

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`rounded-md animate-pulse ${className}`}
      style={{ background: "#f0f0f3" }}
    />
  );
}

// ─── Service type icon ───────────────────────────────────────────────────────
function TypeIcon({ type }: { type: ServiceType }) {
  const icons: Record<ServiceType, React.ReactNode> = {
    Domain: <Globe className="w-3.5 h-3.5" />,
    Hosting: <Server className="w-3.5 h-3.5" />,
    SSL: <Shield className="w-3.5 h-3.5" />,
    Email: <Mail className="w-3.5 h-3.5" />,
  };
  return <span style={{ color: T.inkMuted }}>{icons[type]}</span>;
}

// ─── Hero banner ─────────────────────────────────────────────────────────────
function HeroBanner({ count }: { count: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl flex items-center justify-between gap-6 px-8 py-7"
      style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.3)", minHeight: "160px" }}
    >
      {/* Background image */}
      <Image
        src="/expired.png"
        alt="Expired services background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark gradient scrim so text stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(10,18,40,0.88) 0%, rgba(15,30,65,0.78) 55%, rgba(10,20,50,0.45) 100%)",
        }}
      />

      {/* Blue glow on right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 90% 50%, rgba(23,135,212,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-3 max-w-xl">
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
          style={{ background: T.red, color: "#fff" }}
        >
          <AlertTriangle className="w-3 h-3" />
          Critical Renewal Required
        </span>

        <h2
          className="text-[22px] font-bold leading-snug text-white"
          style={{ letterSpacing: "-0.3px" }}
        >
          Don&apos;t let your digital presence expire permanently
        </h2>

        <p
          className="text-[13.5px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Your expired services are entering their final grace period. Act now
          to prevent automatic deletion, premium redemption fees, and potential
          loss of your domain identity.
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <Link
          href="/dashboard/domains?tab=register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: T.blue,
            boxShadow: "0 2px 12px rgba(23,135,212,0.45)",
          }}
        >
          <RefreshCcw className="w-4 h-4" />
          Restore Services
        </Link>
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const TABS: FilterTab[] = ["All", "Domain", "Hosting", "Email", "SSL"];

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterTab;
  onChange: (t: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            id={`expired-filter-${tab.toLowerCase()}`}
            onClick={() => onChange(tab)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
            style={{
              background: isActive ? T.blue : T.canvas,
              color: isActive ? "#fff" : T.inkMuted,
              border: `1px solid ${isActive ? T.blue : T.hairline}`,
              boxShadow: isActive ? "0 1px 6px rgba(23,135,212,0.25)" : "none",
            }}
          >
            {tab}
            {counts[tab] > 0 && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : T.redLight,
                  color: isActive ? "#fff" : T.red,
                }}
              >
                {counts[tab]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sort button ──────────────────────────────────────────────────────────────
function SortButton({
  label,
  field,
  active,
  dir,
  onClick,
}: {
  label: string;
  field: SortField;
  active: SortField;
  dir: SortDir;
  onClick: (f: SortField) => void;
}) {
  const isActive = field === active;
  return (
    <button
      onClick={() => onClick(field)}
      className="flex items-center gap-1 text-[12px] font-semibold transition-colors"
      style={{ color: isActive ? T.blue : T.inkMuted }}
    >
      {label}
      <ArrowUpDown
        className="w-3 h-3"
        style={{ opacity: isActive ? 1 : 0.4 }}
      />
    </button>
  );
}

// ─── Table row ───────────────────────────────────────────────────────────────
function ServiceRow({
  service,
  selected,
  onToggle,
}: {
  service: ExpiredService;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors"
      style={{ borderTop: `1px solid ${T.hairline}` }}
    >
      {/* Checkbox */}
      <label className="flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          id={`select-service-${service.id}`}
          checked={selected}
          onChange={onToggle}
          className="sr-only"
        />
        <span
          className="w-4.5 h-4.5 flex items-center justify-center rounded border-2 transition-all duration-150"
          style={{
            width: "18px",
            height: "18px",
            borderColor: selected ? T.blue : T.hairline,
            background: selected ? T.blue : T.canvas,
          }}
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </label>

      {/* Service name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ background: T.parchment }}
        >
          <TypeIcon type={service.type} />
        </span>
        <span
          className="text-[14px] font-semibold truncate"
          style={{ color: T.ink }}
        >
          {service.name}
        </span>
      </div>

      {/* Type */}
      <div
        className="flex items-center gap-1.5 text-[13px] shrink-0 w-24"
        style={{ color: T.inkMuted }}
      >
        <TypeIcon type={service.type} />
        {service.type}
      </div>

      {/* Expired on */}
      <div
        className="flex items-center gap-1.5 text-[13px] shrink-0 w-32"
        style={{ color: T.inkMuted }}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        {formatDate(service.expiredOn)}
      </div>

      {/* Status badge */}
      <div className="shrink-0 w-24">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold"
          style={{ background: T.redLight, color: T.red }}
        >
          Expired
        </span>
      </div>

      {/* Action */}
      <div className="shrink-0">
        <Link
          href={service.renewHref}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{ background: T.blue }}
        >
          <RefreshCcw className="w-3 h-3" />
          Renew
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 animate-pulse"
      style={{ borderTop: `1px solid ${T.hairline}` }}
    >
      <Skeleton className="w-4 h-4 rounded shrink-0" />
      <div className="flex items-center gap-2.5 flex-1">
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
        <Skeleton className="h-3.5 w-36" />
      </div>
      <Skeleton className="h-3.5 w-16 shrink-0" />
      <Skeleton className="h-3.5 w-24 shrink-0" />
      <Skeleton className="h-6 w-16 rounded-lg shrink-0" />
      <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExpiredServicesPage() {
  const { data: registeredDomains, isLoading: loadingDomains } =
    useGetRegisteredDomains();
  const { data: sslCerts, isLoading: loadingSsl } = useGetSslCertificates();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();

  const isLoading = loadingDomains || loadingSsl || loadingHosting;

  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [sortField, setSortField] = useState<SortField>("expiredOn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Build expired services list from real data
  const allExpiredServices = useMemo<ExpiredService[]>(() => {
    const services: ExpiredService[] = [];

    // Expired domains
    (registeredDomains ?? []).forEach((domain) => {
      if (!domain.expiryDate) return;
      const days = daysUntil(domain.expiryDate);
      if (days < 0) {
        services.push({
          id: `domain-${domain.id}`,
          name: domain.domain,
          type: "Domain",
          expiredOn: domain.expiryDate,
          daysAgo: Math.abs(days),
          renewHref: "/dashboard/domains",
          renewalPrice: 14.98,
        });
      }
    });

    // Expired SSL certs
    (sslCerts ?? []).forEach((cert: any) => {
      if (!cert.expiryDate) return;
      const days = daysUntil(cert.expiryDate);
      if (days < 0) {
        services.push({
          id: `ssl-${cert.id}`,
          name: cert.domain ?? cert.commonName ?? "SSL Certificate",
          type: "SSL",
          expiredOn: cert.expiryDate,
          daysAgo: Math.abs(days),
          renewHref: "/dashboard/ssl",
          renewalPrice: 9.99,
        });
      }
    });

    // Expired hosting accounts
    (hostingAccounts ?? []).forEach((account: any) => {
      const expiryDate =
        account.expiresAt ?? account.expiryDate ?? account.expiry_date;
      if (!expiryDate) return;
      const days = daysUntil(expiryDate);
      if (days < 0) {
        services.push({
          id: `hosting-${account.id}`,
          name: account.domain ?? account.username ?? "Hosting Account",
          type: "Hosting",
          expiredOn: expiryDate,
          daysAgo: Math.abs(days),
          renewHref: "/dashboard/hosting",
          renewalPrice: 4.99,
        });
      }
    });

    return services;
  }, [registeredDomains, sslCerts, hostingAccounts]);

  // Filtered + sorted list
  const visibleServices = useMemo(() => {
    const filtered =
      activeTab === "All"
        ? allExpiredServices
        : allExpiredServices.filter((s) => s.type === activeTab);

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "expiredOn")
        cmp = new Date(a.expiredOn).getTime() - new Date(b.expiredOn).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [allExpiredServices, activeTab, sortField, sortDir]);

  // Tab counts
  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      All: allExpiredServices.length,
      Domain: 0,
      Hosting: 0,
      Email: 0,
      SSL: 0,
    };
    allExpiredServices.forEach((s) => c[s.type]++);
    return c;
  }, [allExpiredServices]);

  // Sort toggle
  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Selection
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (
      selected.size === visibleServices.length &&
      visibleServices.length > 0
    ) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleServices.map((s) => s.id)));
    }
  };

  const selectedServices = visibleServices.filter((s) => selected.has(s.id));
  const totalRenewalPrice = selectedServices.reduce(
    (sum, s) => sum + (s.renewalPrice ?? 0),
    0,
  );

  const allChecked =
    visibleServices.length > 0 && selected.size === visibleServices.length;
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page heading */}
      <div>
        <h2
          className="text-[24px] font-bold"
          style={{
            color: T.ink,
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Expired Services
        </h2>
        <p className="text-[14px] mt-0.5" style={{ color: T.inkMuted }}>
          Review expired domains and services and restore them before they are
          permanently lost.
        </p>
      </div>

      {/* Hero banner */}
      <HeroBanner count={allExpiredServices.length} />

      {/* Filter tabs */}
      <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts} />

      {/* Table card */}
      <div
        className="flex flex-col overflow-hidden"
        style={{
          background: T.canvas,
          border: `1px solid ${T.hairline}`,
          borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Table header */}
        <div
          className="flex items-center gap-4 px-5 py-3"
          style={{
            borderBottom: `1px solid ${T.hairline}`,
            background: T.parchment,
          }}
        >
          {/* Select all checkbox */}
          <label className="flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              id="select-all-services"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked;
              }}
              onChange={toggleAll}
              className="sr-only"
            />
            <span
              className="flex items-center justify-center rounded border-2 transition-all duration-150"
              style={{
                width: "18px",
                height: "18px",
                borderColor: allChecked || someChecked ? T.blue : T.hairline,
                background: allChecked ? T.blue : T.canvas,
              }}
            >
              {allChecked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {someChecked && !allChecked && (
                <span
                  style={{
                    width: 8,
                    height: 2,
                    background: T.blue,
                    display: "block",
                    borderRadius: 2,
                  }}
                />
              )}
            </span>
          </label>

          {/* Column headers */}
          <div className="flex-1">
            <SortButton
              label="Service"
              field="name"
              active={sortField}
              dir={sortDir}
              onClick={handleSort}
            />
          </div>
          <div className="w-24 shrink-0">
            <SortButton
              label="Type"
              field="type"
              active={sortField}
              dir={sortDir}
              onClick={handleSort}
            />
          </div>
          <div className="w-32 shrink-0">
            <SortButton
              label="Expired On"
              field="expiredOn"
              active={sortField}
              dir={sortDir}
              onClick={handleSort}
            />
          </div>
          <div className="w-24 shrink-0">
            <span
              className="flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: T.inkMuted }}
            >
              <Info className="w-3 h-3" />
              Status
            </span>
          </div>
          <div className="shrink-0 w-16 text-right">
            <span
              className="text-[12px] font-semibold"
              style={{ color: T.inkMuted }}
            >
              Action
            </span>
          </div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : visibleServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <span
              className="flex items-center justify-center w-12 h-12 rounded-full mb-3"
              style={{ background: "#ecfdf5" }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: "#059669" }} />
            </span>
            <p className="text-[15px] font-semibold" style={{ color: T.ink }}>
              No expired services
            </p>
            <p className="text-[13px] mt-1" style={{ color: T.inkMuted }}>
              {activeTab === "All"
                ? "All your services are active and in good standing."
                : `No expired ${activeTab} services found.`}
            </p>
          </div>
        ) : (
          visibleServices.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              selected={selected.has(service.id)}
              onToggle={() => toggleSelect(service.id)}
            />
          ))
        )}
      </div>

      {/* Renewal summary footer — only visible when items are selected */}
      {selected.size > 0 && (
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl"
          style={{
            background: T.canvas,
            border: `1px solid ${T.hairline}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <div>
            <p className="text-[13px]" style={{ color: T.inkMuted }}>
              <span className="font-semibold" style={{ color: T.ink }}>
                {selected.size} service{selected.size !== 1 ? "s" : ""}
              </span>{" "}
              selected for renewal
            </p>
            <p
              className="text-[18px] font-bold mt-0.5"
              style={{ color: T.ink }}
            >
              Total: ${totalRenewalPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="clear-renewal-selection"
              onClick={() => setSelected(new Set())}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
              style={{ color: T.inkMuted, background: T.parchment }}
            >
              Clear
            </button>
            <Link
              href="/dashboard/domains"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: T.blue,
                boxShadow: "0 2px 8px rgba(23,135,212,0.3)",
              }}
            >
              <Layers className="w-4 h-4" />
              Renew Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
