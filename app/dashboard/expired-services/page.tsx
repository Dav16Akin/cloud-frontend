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
  Info,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetSslCertificates } from "@/hooks/useSsl";
import { useGetHosting } from "@/hooks/useHosting";

// ─── Design tokens ───────────────────────────────────────────────────────────
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
type ServiceType = "Domains" | "Hosting" | "SSL" | "Email";

type ExpiredService = {
  id: string;
  name: string;
  type: ServiceType;
  expiredOn: string;
  daysAgo: number;
  renewHref: string;
  renewalPrice?: number;
};

type FilterTab = "All" | "Domains" | "Hosting" | "Email" | "SSL";
type SortField = "name" | "type" | "expiredOn";
type SortDir = "asc" | "desc";

// ─── Skeleton Row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 animate-pulse"
      style={{ borderTop: `1px solid ${T.hairline}` }}
    >
      <div className="w-4 h-4 rounded bg-[#f0f0f3] shrink-0" />
      <div className="h-4 w-44 rounded bg-[#f0f0f3] flex-1" />
      <div className="h-4 w-20 rounded bg-[#f0f0f3] shrink-0" />
      <div className="h-4 w-24 rounded bg-[#f0f0f3] shrink-0" />
      <div className="h-5 w-20 rounded-full bg-[#f0f0f3] shrink-0" />
      <div className="h-8 w-20 rounded-lg bg-[#f0f0f3] shrink-0" />
    </div>
  );
}

// ─── Service type icon ───────────────────────────────────────────────────────
function TypeIcon({ type }: { type: ServiceType }) {
  const icons: Record<ServiceType, React.ReactNode> = {
    Domains: <Globe className="w-3.5 h-3.5" />,
    Hosting: <Server className="w-3.5 h-3.5" />,
    SSL: <Shield className="w-3.5 h-3.5" />,
    Email: <Mail className="w-3.5 h-3.5" />,
  };
  return <span style={{ color: T.inkMuted }}>{icons[type]}</span>;
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

// ─── Table row for expired services ──────────────────────────────────────────
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
      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50"
      style={{ borderTop: `1px solid ${T.hairline}` }}
    >
      {/* Checkbox */}
      <label className="flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
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

      {/* Service Name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ background: T.parchment }}
        >
          <TypeIcon type={service.type} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: T.ink }}>
            {service.name}
          </p>
          <p className="text-[11.5px]" style={{ color: T.inkMuted }}>
            Expired {service.daysAgo} day{service.daysAgo !== 1 ? "s" : ""} ago
          </p>
        </div>
      </div>

      {/* Type */}
      <div className="w-24 shrink-0">
        <span className="text-[13px]" style={{ color: T.inkMuted }}>
          {service.type}
        </span>
      </div>

      {/* Expired On */}
      <div className="w-32 shrink-0">
        <span className="text-[13px]" style={{ color: T.inkMuted }}>
          {formatDate(service.expiredOn)}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
          style={{ background: T.redLight, color: T.red }}
        >
          <AlertTriangle className="w-3 h-3" />
          Expired
        </span>
      </div>

      {/* Action */}
      <div className="shrink-0 w-24 text-right">
        <Link
          href={service.renewHref}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{ background: T.blue }}
        >
          <RefreshCcw className="w-3 h-3" />
          Renew
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ExpiredServicesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("expiredOn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: registeredDomains, isLoading: loadingDomains } = useGetRegisteredDomains();
  const { data: sslCerts, isLoading: loadingSsl } = useGetSslCertificates();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();

  const isLoading = loadingDomains || loadingSsl || loadingHosting;

  // Aggregate expired services
  const allExpiredServices = useMemo<ExpiredService[]>(() => {
    const services: ExpiredService[] = [];

    // Domains
    if (registeredDomains) {
      for (const d of registeredDomains) {
        const isExp =
          (d.status ?? "").toUpperCase() === "EXPIRED" ||
          (d.expiryDate && daysUntil(d.expiryDate) < 0);
        if (isExp && d.expiryDate) {
          const days = Math.abs(daysUntil(d.expiryDate));
          services.push({
            id: `domain-${d.id}`,
            name: d.domain,
            type: "Domains",
            expiredOn: d.expiryDate,
            daysAgo: days,
            renewHref: `/dashboard/domains?tab=register`,
            renewalPrice: 18500,
          });
        }
      }
    }

    // SSL
    if (sslCerts) {
      for (const s of sslCerts) {
        const isExp =
          (s.status ?? "").toUpperCase() === "EXPIRED" ||
          (s.expiresAt && daysUntil(s.expiresAt) < 0);
        if (isExp && s.expiresAt) {
          const days = Math.abs(daysUntil(s.expiresAt));
          services.push({
            id: `ssl-${s.id}`,
            name: s.domainName ?? `SSL #${s.id}`,
            type: "SSL",
            expiredOn: s.expiresAt,
            daysAgo: days,
            renewHref: "/dashboard/ssl",
            renewalPrice: 15000,
          });
        }
      }
    }

    // Hosting
    if (hostingAccounts) {
      for (const h of hostingAccounts) {
        const isExp =
          (h.status ?? "").toUpperCase() === "SUSPENDED" ||
          (h.status ?? "").toUpperCase() === "TERMINATED";
        if (isExp && h.createdAt) {
          const days = Math.abs(daysUntil(h.createdAt));
          services.push({
            id: `hosting-${h.id}`,
            name: h.domain ?? `Hosting #${h.id}`,
            type: "Hosting",
            expiredOn: h.createdAt,
            daysAgo: days,
            renewHref: "/dashboard/hosting",
            renewalPrice: 12000,
          });
        }
      }
    }

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

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === visibleServices.length && visibleServices.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleServices.map((s) => s.id)));
    }
  };

  const selectedServices = visibleServices.filter((s) => selected.has(s.id));
  const totalRenewalPrice = selectedServices.reduce(
    (sum, s) => sum + (s.renewalPrice ?? 0),
    0
  );

  const allChecked =
    visibleServices.length > 0 && selected.size === visibleServices.length;
  const someChecked = selected.size > 0 && !allChecked;

  const tabs: FilterTab[] = ["All", "Domains", "Hosting", "Email", "SSL"];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page heading (Exact matching Image 1) ─────────────────────── */}
      <div>
        <h1
          className="text-[24px] sm:text-[26px] font-bold text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Expired Services
        </h1>
        <p className="text-[14px] text-[#6e6e73] mt-1">
          Review expired domains and services and restore them before they are permanently lost.
        </p>
      </div>

      {/* ── Filter pills (Exact matching Image 1) ─────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={`expired-filter-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#1787D4] text-white shadow-xs"
                  : "bg-white text-[#4b5563] border border-[#e5e7eb] hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Content Card (Exact matching Image 1) ─────────────────────── */}
      <div
        className="w-full bg-white rounded-lg sm:rounded-3xl border border-[#e8e8ed] shadow-xs overflow-hidden"
      >
        {isLoading ? (
          <div className="py-24 px-6 flex flex-col items-center justify-center">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : visibleServices.length === 0 ? (
          /* Empty / All Caught Up State matching Image 1 */
          <div className="py-24 sm:py-28 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 relative mb-4 select-none animate-in fade-in zoom-in-95 duration-200">
              <Image
                src="/checkmark.svg"
                alt="All caught up checkmark"
                width={96}
                height={96}
                className="w-24 h-24 object-contain"
                priority
              />
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1d1f] tracking-tight">
              You&apos;re all caught up.
            </h2>
            <p className="text-[14px] text-[#6e6e73] mt-1.5 max-w-md">
              You don&apos;t have any expired services at the moment.
            </p>
          </div>
        ) : (
          /* Table View when expired items exist */
          <div className="flex flex-col">
            {/* Table Header */}
            <div
              className="flex items-center gap-4 px-6 py-3 text-[12px] font-semibold text-[#6e6e73]"
              style={{
                borderBottom: `1px solid ${T.hairline}`,
                background: T.parchment,
              }}
            >
              <label className="flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
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
                <span className="flex items-center gap-1 text-[12px] font-semibold text-[#6e6e73]">
                  <Info className="w-3 h-3" /> Status
                </span>
              </div>
              <div className="shrink-0 w-24 text-right">
                <span className="text-[12px] font-semibold text-[#6e6e73]">Action</span>
              </div>
            </div>

            {/* Rows */}
            {visibleServices.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                selected={selected.has(service.id)}
                onToggle={() => toggleSelect(service.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Renewal summary footer (when items are selected) ──────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-lg bg-white border border-[#e8e8ed] shadow-sm">
          <div>
            <p className="text-[13px] text-[#6e6e73]">
              <span className="font-semibold text-[#1d1d1f]">
                {selected.size} service{selected.size !== 1 ? "s" : ""}
              </span>{" "}
              selected for renewal
            </p>
            <p className="text-[18px] font-bold text-[#1d1d1f] mt-0.5">
              Total: ₦{totalRenewalPrice.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#6e6e73] bg-[#f5f5f7] hover:bg-[#eaeaea] transition-colors"
            >
              Clear
            </button>
            <Link
              href="/dashboard/domains?tab=register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs active:scale-95"
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
