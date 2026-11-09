"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Server,
  Shield,
  RefreshCcw,
  ArrowUpDown,
  Layers,
  Loader2,
} from "lucide-react";
import { useGetRegisteredDomains, useRenewDomain } from "@/hooks/useDomains";
import { useGetSslCertificates, useGetSslProducts } from "@/hooks/useSsl";
import { useGetHosting, useRenewHosting } from "@/hooks/useHosting";
import { usePlans } from "@/hooks/usePlans";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { toast } from "sonner";

// ─── Design tokens (brand palette) ───────────────────────────────────────────
const T = {
  ink: "#031033",
  inkMuted: "#5A6A85",
  canvas: "#ffffff",
  control: "#D5DCE6",
  blue: "#1787D4",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const exp = new Date(dateStr).getTime();
  return Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
}

function isValidDate(dateStr: string | null | undefined): dateStr is string {
  return !!dateStr && !Number.isNaN(new Date(dateStr).getTime());
}

function formatDate(dateStr: string | null): string {
  if (!isValidDate(dateStr)) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceType = "Domains" | "Hosting" | "SSL";

/** How a service is renewed: a backend renewal (redirects to the payment page) or a re-order link. */
type RenewAction =
  | { kind: "domain"; id: string }
  | { kind: "hosting"; id: string }
  | { kind: "link"; href: string };

type ExpiredService = {
  id: string;
  name: string;
  type: ServiceType;
  /** Real expiry date from the API, or null when the API has none. */
  expiredOn: string | null;
  daysAgo: number | null;
  /** Hosting status note shown when no expiry date is known. */
  statusNote?: string;
  renew: RenewAction | null;
  /** Real price from the API; undefined means it is only known at checkout. */
  renewalPrice?: number;
};

type FilterTab = "All" | "Domains" | "Hosting" | "SSL";
type SortField = "name" | "type" | "expiredOn";
type SortDir = "asc" | "desc";

// ─── Skeleton Row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex w-full animate-pulse items-center gap-4 border-b border-[#EEF2F7] px-5 py-3 last:border-0">
      <div className="h-4 w-4 shrink-0 rounded bg-[#EEF2F7]" />
      <div className="h-4 w-44 flex-1 rounded bg-[#EEF2F7]" />
      <div className="h-4 w-20 shrink-0 rounded bg-[#EEF2F7]" />
      <div className="h-4 w-24 shrink-0 rounded bg-[#EEF2F7]" />
      <div className="h-4 w-16 shrink-0 rounded bg-[#EEF2F7]" />
      <div className="h-8 w-20 shrink-0 rounded-lg bg-[#EEF2F7]" />
    </div>
  );
}

// ─── Service type icon ───────────────────────────────────────────────────────
function TypeIcon({ type }: { type: ServiceType }) {
  const icons: Record<ServiceType, React.ReactNode> = {
    Domains: <Globe className="h-4 w-4" />,
    Hosting: <Server className="h-4 w-4" />,
    SSL: <Shield className="h-4 w-4" />,
  };
  return <span className="text-[#5A6A85]">{icons[type]}</span>;
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
      aria-label={`Sort by ${label.toLowerCase()}${isActive ? (dir === "asc" ? ", ascending" : ", descending") : ""}`}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-[#031033] ${
        isActive ? "text-[#031033]" : "text-[#5A6A85]"
      }`}
    >
      {label}
      {isActive && <ArrowUpDown className="h-3 w-3" />}
    </button>
  );
}

// ─── Table row for expired services ──────────────────────────────────────────
const renewBtnCls =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:cursor-not-allowed disabled:opacity-50";

function ServiceRow({
  service,
  selected,
  onToggle,
  onRenew,
  renewing,
  renewBusy,
}: {
  service: ExpiredService;
  selected: boolean;
  onToggle: () => void;
  onRenew: (service: ExpiredService) => void;
  renewing: boolean;
  renewBusy: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#EEF2F7] px-5 py-3 transition-colors last:border-0 hover:bg-[#F2F5FC]/60">
      {/* Checkbox */}
      <label className="flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="peer sr-only"
        />
        <span
          className="flex items-center justify-center rounded border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1787D4]/30"
          style={{
            width: "18px",
            height: "18px",
            borderColor: selected ? T.blue : T.control,
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
        <TypeIcon type={service.type} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#031033]">
            {service.name}
          </p>
          <p className="text-xs tabular-nums text-[#5A6A85]">
            {service.daysAgo !== null
              ? `Expired ${service.daysAgo} day${service.daysAgo !== 1 ? "s" : ""} ago`
              : service.statusNote ?? "Expired"}
          </p>
        </div>
      </div>

      {/* Type */}
      <div className="w-24 shrink-0">
        <span className="text-sm text-[#5A6A85]">{service.type}</span>
      </div>

      {/* Expired On */}
      <div className="w-32 shrink-0 text-right">
        <span className="text-sm tabular-nums text-[#5A6A85]">
          {formatDate(service.expiredOn)}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#C21F1F]">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />
          Expired
        </span>
      </div>

      {/* Action */}
      <div className="shrink-0 w-24 text-right">
        {service.renew?.kind === "link" ? (
          <Link href={service.renew.href} className={renewBtnCls}>
            <RefreshCcw className="h-3.5 w-3.5 text-[#5A6A85]" />
            Renew
          </Link>
        ) : service.renew ? (
          <button
            type="button"
            onClick={() => onRenew(service)}
            disabled={renewBusy}
            className={renewBtnCls}
          >
            {renewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5A6A85]" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5 text-[#5A6A85]" />
            )}
            Renew
          </button>
        ) : (
          <span className="text-sm text-[#5A6A85]">—</span>
        )}
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

  // Real pricing sources: hosting plans (yearly price) and SSL products.
  const { data: plans } = usePlans();
  const { data: sslProducts } = useGetSslProducts();

  const { mutate: renewDomain, isPending: renewingDomain } = useRenewDomain();
  const { mutate: renewHosting, isPending: renewingHosting } = useRenewHosting();
  // One-click renewals use the gateway the customer last chose.
  const { method: provider } = usePaymentMethod();
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const renewBusy = renewingDomain || renewingHosting;

  const isLoading = loadingDomains || loadingSsl || loadingHosting;

  // Aggregate expired services
  const allExpiredServices = useMemo<ExpiredService[]>(() => {
    const services: ExpiredService[] = [];

    // Domains — renewed via POST /domains/:id/renew. The renewal price is
    // computed by the backend, so it is only shown at checkout.
    if (registeredDomains) {
      for (const d of registeredDomains) {
        const hasDate = isValidDate(d.expiryDate);
        const isExp =
          (d.status ?? "").toUpperCase() === "EXPIRED" ||
          (hasDate && daysUntil(d.expiryDate) < 0);
        if (isExp) {
          const isLocal = String(d.id).startsWith("local-");
          services.push({
            id: `domain-${d.id}`,
            name: d.domain,
            type: "Domains",
            expiredOn: hasDate ? d.expiryDate : null,
            daysAgo: hasDate ? Math.abs(daysUntil(d.expiryDate)) : null,
            renew: isLocal ? null : { kind: "domain", id: d.id },
          });
        }
      }
    }

    // SSL — there is no renew endpoint; renewal is a new order for the same
    // domain/product. Price comes from the SSL product catalogue.
    if (sslCerts) {
      for (const s of sslCerts) {
        const hasDate = isValidDate(s.expiresAt);
        const isExp =
          (s.status ?? "").toUpperCase() === "EXPIRED" ||
          (hasDate && daysUntil(s.expiresAt as string) < 0);
        if (isExp) {
          const product = (sslProducts ?? []).find((p) => p.id === s.productId);
          const price =
            product?.prices?.find((p) => p.period === 1)?.price ?? product?.price;
          const params = new URLSearchParams();
          if (s.domainName) params.set("domain", s.domainName);
          if (s.productId) params.set("product", String(s.productId));
          const qs = params.toString();
          services.push({
            id: `ssl-${s.id}`,
            name: s.domainName ?? `SSL #${s.id}`,
            type: "SSL",
            expiredOn: hasDate ? (s.expiresAt as string) : null,
            daysAgo: hasDate ? Math.abs(daysUntil(s.expiresAt as string)) : null,
            renew: { kind: "link", href: `/dashboard/ssl/purchase${qs ? `?${qs}` : ""}` },
            renewalPrice: typeof price === "number" && price > 0 ? price : undefined,
          });
        }
      }
    }

    // Hosting — renewed via POST /hosting/:id/renew (yearly, as on the
    // hosting page). Price is the plan's yearly price.
    if (hostingAccounts) {
      for (const h of hostingAccounts) {
        const statusUpper = (h.status ?? "").toUpperCase();
        const hasDate = isValidDate(h.expiresAt);
        const isExp =
          statusUpper === "SUSPENDED" ||
          statusUpper === "TERMINATED" ||
          (hasDate && daysUntil(h.expiresAt) < 0);
        if (isExp) {
          const plan = (plans ?? []).find((p) => p.id === (h.plan?.id ?? h.planId));
          const price = plan?.price ?? h.plan?.price;
          services.push({
            id: `hosting-${h.id}`,
            name: h.domain ?? `Hosting #${h.id}`,
            type: "Hosting",
            // Only a past expiry date counts as "expired on" (a suspended
            // account can still have a future expiry date).
            expiredOn: hasDate && daysUntil(h.expiresAt) < 0 ? h.expiresAt : null,
            daysAgo:
              hasDate && daysUntil(h.expiresAt) < 0
                ? Math.abs(daysUntil(h.expiresAt))
                : null,
            statusNote:
              statusUpper === "SUSPENDED"
                ? "Suspended"
                : statusUpper === "TERMINATED"
                  ? "Terminated"
                  : undefined,
            renew: { kind: "hosting", id: h.id },
            renewalPrice: typeof price === "number" && price > 0 ? price : undefined,
          });
        }
      }
    }

    return services;
  }, [registeredDomains, sslCerts, hostingAccounts, plans, sslProducts]);

  const handleRenew = (service: ExpiredService) => {
    if (!service.renew || renewBusy) return;
    setRenewingId(service.id);
    const onError = () => setRenewingId(null);
    // The hooks redirect to the payment page on success; if no payment link came
    // back, stop the spinner and say so.
    const onSuccess = (res: { data?: { paymentUrl?: string } }) => {
      if (!res?.data?.paymentUrl) {
        setRenewingId(null);
        toast.error("Renewal started but no payment link was returned. Please try again.");
      }
    };
    if (service.renew.kind === "domain") {
      renewDomain({ id: service.renew.id, provider }, { onError, onSuccess });
    } else if (service.renew.kind === "hosting") {
      renewHosting(
        { id: service.renew.id, data: { billingCycle: "yearly", provider } },
        { onError, onSuccess },
      );
    }
  };

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
        // Services without a known expiry date sort as oldest.
        cmp =
          (a.expiredOn ? new Date(a.expiredOn).getTime() : 0) -
          (b.expiredOn ? new Date(b.expiredOn).getTime() : 0);
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
  // Only show a total when every selected service has a real price.
  const allPriced =
    selectedServices.length > 0 &&
    selectedServices.every((s) => typeof s.renewalPrice === "number");
  const totalRenewalPrice = selectedServices.reduce(
    (sum, s) => sum + (s.renewalPrice ?? 0),
    0
  );
  // Each renewal is its own payment, so "Renew now" acts on one service.
  const singleSelected =
    selectedServices.length === 1 ? selectedServices[0] : null;

  const allChecked =
    visibleServices.length > 0 && selected.size === visibleServices.length;
  const someChecked = selected.size > 0 && !allChecked;

  const tabs: FilterTab[] = ["All", "Domains", "Hosting", "SSL"];
  const renewNowCls =
    "inline-flex h-9 items-center gap-2 rounded-lg bg-[#1787D4] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">
          Expired services
        </h1>
        <p className="mt-1 text-sm text-[#5A6A85]">
          Review expired domains and services and restore them before they are permanently lost.
        </p>
      </div>

      {/* ── Filter (segmented control) ───────────────────────────────── */}
      <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-inset ring-[#E2E8F0]">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={`expired-filter-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              aria-pressed={isActive}
              className={`h-8 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                isActive
                  ? "bg-[#F2F5FC] text-[#031033]"
                  : "text-[#5A6A85] hover:text-[#031033]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Content card ─────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        {isLoading ? (
          <div className="flex flex-col">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : visibleServices.length === 0 ? (
          /* Empty / all caught up */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Image
              src="/checkmark.svg"
              alt="All caught up checkmark"
              width={64}
              height={64}
              className="mb-4 h-16 w-16 select-none object-contain"
              priority
            />
            <h2 className="text-base font-semibold text-[#031033]">
              You&apos;re all caught up
            </h2>
            <p className="mt-1 max-w-md text-sm text-[#5A6A85]">
              You don&apos;t have any expired services at the moment.
            </p>
          </div>
        ) : (
          /* Table view when expired items exist */
          <div className="flex flex-col">
            {/* Table header */}
            <div className="flex items-center gap-4 border-b border-[#E2E8F0] px-5 py-2.5 text-xs font-medium text-[#5A6A85]">
              <label className="flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="peer sr-only"
                />
                <span
                  className="flex items-center justify-center rounded border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1787D4]/30"
                  style={{
                    width: "18px",
                    height: "18px",
                    borderColor: allChecked || someChecked ? T.blue : T.control,
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
              <div className="w-32 shrink-0 text-right">
                <SortButton
                  label="Expired on"
                  field="expiredOn"
                  active={sortField}
                  dir={sortDir}
                  onClick={handleSort}
                />
              </div>
              <div className="w-24 shrink-0">
                <span>Status</span>
              </div>
              <div className="shrink-0 w-24 text-right">
                <span className="sr-only">Action</span>
              </div>
            </div>

            {/* Rows */}
            {visibleServices.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                selected={selected.has(service.id)}
                onToggle={() => toggleSelect(service.id)}
                onRenew={handleRenew}
                renewing={renewingId === service.id}
                renewBusy={renewBusy}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Renewal summary footer (when items are selected) ──────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
          <div>
            <p className="text-sm text-[#5A6A85]">
              <span className="font-medium text-[#031033]">
                {selected.size} service{selected.size !== 1 ? "s" : ""}
              </span>{" "}
              selected for renewal
            </p>
            {allPriced ? (
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#031033]">
                Total ₦{totalRenewalPrice.toLocaleString()}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-[#5A6A85]">Price shown at checkout</p>
            )}
            {selectedServices.length > 1 && (
              <p className="mt-0.5 text-xs text-[#5A6A85]">
                Each renewal is paid separately. Select one service to renew.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="h-9 rounded-lg border border-[#D5DCE6] bg-white px-4 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Clear
            </button>
            {singleSelected?.renew?.kind === "link" ? (
              <Link href={singleSelected.renew.href} className={renewNowCls}>
                <Layers className="h-4 w-4" />
                Renew now
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => singleSelected && handleRenew(singleSelected)}
                disabled={!singleSelected?.renew || renewBusy}
                className={renewNowCls}
              >
                {renewBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
                Renew now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
