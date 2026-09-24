"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Globe,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Shield,
  ShoppingCart,
  Sparkles,
  Loader2,
  Trash2,
  RefreshCw,
  Server,
  Network,
  Calendar,
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import { searchDomains, type DomainResult } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { useGetHosting } from "@/hooks/useHosting";
import { toast } from "sonner";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink: "#1d1d1f",
  inkMuted: "#6e6e73",
  inkSubtle: "#aeaeb2",
  canvas: "#ffffff",
  parchment: "#f5f5f7",
  hairline: "#e8e8ed",
  blue: "#1787D4",
  blueLight: "#e8f4fc",
  emerald: "#059669",
  emeraldLight: "#ecfdf5",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#d97706",
  amberLight: "#fffbeb",
};

type SearchState = "idle" | "searching" | "done" | "error";
type Tab = "registered" | "hosted" | "register";
type StatusFilter = "All" | "Active" | "Expiring Soon" | "Expired";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({ status, expiryDate }: { status: string; expiryDate?: string }) {
  const days = expiryDate ? daysUntil(expiryDate) : 999;
  const isExpired = days < 0 || (status ?? "").toUpperCase() === "EXPIRED";
  const isExpiring = !isExpired && days <= 30;

  if (isExpired) {
    return (
      <span className="text-[12px] font-semibold text-red-600">
        Expired
      </span>
    );
  }
  if (isExpiring) {
    return (
      <span className="text-[12px] font-semibold text-orange-600">
        Expiring Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#eff6fb] text-[#1787D4]">
      Active
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 animate-pulse"
      style={{ borderTop: `1px solid ${T.hairline}` }}
    >
      <div className="h-3.5 w-40 rounded bg-[#f0f0f3] flex-1" />
      <div className="h-6 w-24 rounded-full bg-[#f0f0f3] shrink-0" />
      <div className="h-3.5 w-10 rounded bg-[#f0f0f3] w-20 shrink-0" />
      <div className="h-3.5 w-24 rounded bg-[#f0f0f3] shrink-0" />
      <div className="h-8 w-20 rounded-lg bg-[#f0f0f3] shrink-0" />
    </div>
  );
}

function DomainsDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<Tab>("registered");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [domainSearch, setDomainSearch] = useState("");

  // Domain search (register tab)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: registeredDomains, isLoading: loadingDomains } = useGetRegisteredDomains();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();
  const { addDomainItem, addSslItem, removeItem, hasItem, openDrawer } = useCartStore();

  useEffect(() => {
    if (tabQuery === "hosted" || tabQuery === "register" || tabQuery === "registered") {
      setActiveTab(tabQuery as Tab);
    } else {
      setActiveTab("registered");
    }
  }, [tabQuery]);

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    router.push(`/dashboard/domains?tab=${newTab}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchState("searching");
    setSearchResults([]);
    setErrorMsg("");
    try {
      const res = await searchDomains(searchQuery.trim());
      setSearchResults(res.data || []);
      setSearchState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong during the search.");
      setSearchState("error");
    }
  };

  const formatPrice = (priceVal: number | null, currency = "USD") => {
    if (priceVal == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(priceVal);
  };

  const isInCart = (domain: string) =>
    hasItem(`domain:${domain.slice(0, domain.indexOf("."))}.${domain.slice(domain.indexOf(".") + 1)}`);

  const handleAddToCart = (result: DomainResult) => {
    if (result.price.price == null) return;
    const dotIdx = result.domain.indexOf(".");
    const domainName = dotIdx !== -1 ? result.domain.slice(0, dotIdx) : result.domain;
    const extension = dotIdx !== -1 ? result.domain.slice(dotIdx + 1) : "";
    addDomainItem({ type: "DOMAIN", domainName, extension, price: result.price.price, currency: result.price.currency ?? "USD", isPremium: result.isPremium });
    toast.success(`${result.domain} added to cart!`);
    openDrawer();
  };

  const handleRemoveFromCart = (result: DomainResult) => {
    const dotIdx = result.domain.indexOf(".");
    const domainName = dotIdx !== -1 ? result.domain.slice(0, dotIdx) : result.domain;
    const extension = dotIdx !== -1 ? result.domain.slice(dotIdx + 1) : "";
    removeItem(`domain:${domainName}.${extension}`);
    toast.info(`${result.domain} removed from cart.`);
  };

  // Filter registered domains by status and search
  const filteredDomains = (registeredDomains ?? []).filter((d) => {
    const matchesSearch = d.domain.toLowerCase().includes(domainSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "All") return true;
    const days = d.expiryDate ? daysUntil(d.expiryDate) : 999;
    const isExpired = days < 0 || (d.status ?? "").toUpperCase() === "EXPIRED";
    const isExpiring = !isExpired && days <= 30;

    if (statusFilter === "Expired") return isExpired;
    if (statusFilter === "Expiring Soon") return isExpiring;
    if (statusFilter === "Active") return !isExpired && !isExpiring;
    return true;
  });

  const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Expiring Soon", "Expired"];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">

      {/* ── Registered tab (Figma "Your Domains" design) ─────────────────── */}
      {activeTab === "registered" && (
        <>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2
                className="text-[24px] font-bold"
                style={{
                  color: T.ink,
                  fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.4px",
                }}
              >
                Your Domains
              </h2>
              <p className="text-[14px] mt-0.5" style={{ color: T.inkMuted }}>
                Manage your domains, renewals, DNS settings, and domain details from one place.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
              <Link
                href="/dashboard/domain-transfer"
                id="domains-transfer-in"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#1d1d1f] bg-white border border-[#e2eaff] hover:bg-[#f8fafc] transition-all duration-150 active:scale-95 shrink-0 shadow-xs"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#1787D4]" />
                Transfer In
              </Link>
              <button
                id="domains-register-new"
                onClick={() => handleTabChange("register")}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95 shrink-0 shadow-xs"
                style={{ background: T.blue }}
              >
                <Plus className="w-4 h-4" />
                Register New Domain
              </button>
            </div>
          </div>

          {/* Filter row: pills + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Status filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => {
                const isActive = f === statusFilter;
                return (
                  <button
                    key={f}
                    id={`domain-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setStatusFilter(f)}
                    className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                    style={{
                      background: isActive ? T.blue : T.canvas,
                      color: isActive ? "#fff" : T.inkMuted,
                      border: `1px solid ${isActive ? T.blue : T.hairline}`,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Domain search */}
            <div
              className="flex items-center gap-2 w-full sm:w-auto sm:max-w-xs sm:ml-auto px-3 py-2 rounded-xl"
              style={{ background: T.canvas, border: `1px solid ${T.hairline}` }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: T.inkSubtle }} />
              <input
                id="domain-search-filter"
                type="text"
                placeholder="Search by domain name..."
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="flex-1 text-[13px] outline-none bg-transparent"
                style={{ color: T.ink }}
              />
            </div>
          </div>

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
              className="grid items-center px-6 py-3 text-[12px] font-semibold"
              style={{
                gridTemplateColumns: "1fr 160px 100px 140px 100px",
                borderBottom: `1px solid ${T.hairline}`,
                background: T.parchment,
                color: T.inkMuted,
              }}
            >
              <span>Service</span>
              <span>Status</span>
              <span>Auto-Renew</span>
              <span>Expiry Date</span>
              <span className="text-right">Action</span>
            </div>

            {/* Rows */}
            {loadingDomains ? (
              <>
                {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
              </>
            ) : filteredDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Globe className="w-8 h-8 mb-3" style={{ color: T.inkSubtle }} />
                <p className="text-[15px] font-semibold" style={{ color: T.ink }}>
                  {domainSearch || statusFilter !== "All" ? "No domains match your filter" : "No registered domains"}
                </p>
                <p className="text-[13px] mt-1 mb-4" style={{ color: T.inkMuted }}>
                  {domainSearch || statusFilter !== "All"
                    ? "Try adjusting your search or filter."
                    : "Register your first domain to get started."}
                </p>
                {!domainSearch && statusFilter === "All" && (
                  <button
                    onClick={() => handleTabChange("register")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
                    style={{ background: T.blue }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search Domain
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <div className="min-w-[580px]">
                    {filteredDomains.map((domain) => (
                      <div
                        key={domain.id}
                        className="grid items-center px-6 py-4 transition-colors hover:bg-[#fafafa]"
                        style={{
                          gridTemplateColumns: "1fr 160px 100px 140px 100px",
                          borderTop: `1px solid ${T.hairline}`,
                        }}
                      >
                        {/* Domain name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                            style={{ background: T.parchment }}
                          >
                            <Globe className="w-3.5 h-3.5" style={{ color: T.inkMuted }} />
                          </span>
                          <span className="text-[14px] font-semibold truncate" style={{ color: T.ink }}>
                            {domain.domain}
                          </span>
                        </div>

                        {/* Status */}
                        <StatusPill status={domain.status} expiryDate={domain.expiryDate} />

                        {/* Auto-Renew */}
                        <span className="text-[13px]" style={{ color: T.inkMuted }}>
                          {domain.autoRenew ? "On" : "Off"}
                        </span>

                        {/* Expiry date */}
                        <span className="text-[13px]" style={{ color: T.inkMuted }}>
                          {formatDate(domain.expiryDate)}
                        </span>

                        {/* Action */}
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/domains/${domain.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{ background: T.blue }}
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Card View (Cards stack nicely, buttons fully accessible) */}
                <div className="md:hidden flex flex-col divide-y divide-[#f2f5fc]">
                  {filteredDomains.map((domain) => (
                    <div
                      key={`mobile-${domain.id}`}
                      className="p-4 flex flex-col gap-3 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                            style={{ background: T.parchment }}
                          >
                            <Globe className="w-3.5 h-3.5" style={{ color: T.inkMuted }} />
                          </span>
                          <span className="text-[14.5px] font-bold truncate" style={{ color: T.ink }}>
                            {domain.domain}
                          </span>
                        </div>
                        <StatusPill status={domain.status} expiryDate={domain.expiryDate} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-1 px-2.5 rounded-lg bg-[#fbfcfe] border border-[#eef2f8]">
                        <div>
                          <span className="text-[#8a9bb2] block text-[10.5px] uppercase font-semibold">Auto-Renew</span>
                          <span className="font-medium text-[#1d1d1f]">{domain.autoRenew ? "Enabled" : "Disabled"}</span>
                        </div>
                        <div>
                          <span className="text-[#8a9bb2] block text-[10.5px] uppercase font-semibold">Expiry Date</span>
                          <span className="font-medium text-[#1d1d1f]">{formatDate(domain.expiryDate)}</span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/domains/${domain.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white transition-all shadow-xs active:scale-98"
                        style={{ background: T.blue }}
                      >
                        Manage Domain
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Also show hosted domains & register tabs as secondary nav */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="domains-tab-hosted"
              onClick={() => handleTabChange("hosted")}
              className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
              style={{ color: T.inkMuted }}
            >
              <Server className="w-3.5 h-3.5" />
              Hosted Domains ({loadingHosting ? "…" : hostingAccounts?.length ?? 0})
            </button>
          </div>
        </>
      )}

      {/* ── Hosted tab ────────────────────────────────────────────────────── */}
      {activeTab === "hosted" && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-[24px] font-bold"
                style={{
                  color: T.ink,
                  fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.4px",
                }}
              >
                Hosted Domains
              </h2>
              <p className="text-[14px] mt-0.5" style={{ color: T.inkMuted }}>
                Domains tied to your active hosting accounts.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("registered")}
              className="flex items-center gap-1.5 text-[13px] font-medium transition-colors shrink-0"
              style={{ color: T.blue }}
            >
              ← Registered Domains
            </button>
          </div>

          <div
            className="flex flex-col overflow-hidden"
            style={{
              background: T.canvas,
              border: `1px solid ${T.hairline}`,
              borderRadius: "14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div
              className="grid items-center px-6 py-3 text-[12px] font-semibold"
              style={{
                gridTemplateColumns: "1fr 180px 160px 120px 120px",
                borderBottom: `1px solid ${T.hairline}`,
                background: T.parchment,
                color: T.inkMuted,
              }}
            >
              <span>Domain</span>
              <span>Hosting Plan</span>
              <span>cPanel Username</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {loadingHosting ? (
              <>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</>
            ) : !hostingAccounts || hostingAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Server className="w-8 h-8 mb-3" style={{ color: T.inkSubtle }} />
                <p className="text-[15px] font-semibold" style={{ color: T.ink }}>No hosted domains</p>
                <p className="text-[13px] mt-1 mb-4" style={{ color: T.inkMuted }}>
                  Purchase a hosting plan to get started.
                </p>
                <Link
                  href="/dashboard/hosting"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
                  style={{ background: T.blue }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Order Hosting Plan
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <div className="min-w-[580px]">
                    {hostingAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="grid items-center px-6 py-4 transition-colors hover:bg-[#fafafa]"
                        style={{
                          gridTemplateColumns: "1fr 180px 160px 120px 120px",
                          borderTop: `1px solid ${T.hairline}`,
                        }}
                      >
                        <span className="text-[14px] font-semibold truncate" style={{ color: T.ink }}>
                          {account.domain}
                        </span>
                        <span className="text-[13px]" style={{ color: T.inkMuted }}>
                          {account.plan?.name ?? "Hosting"} Plan
                        </span>
                        <code className="text-[12px] font-mono" style={{ color: T.inkMuted }}>
                          {account.cpanelUsername ?? "—"}
                        </code>
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit"
                          style={{
                            background: account.status === "ACTIVE" ? T.emeraldLight : T.redLight,
                            color: account.status === "ACTIVE" ? T.emerald : T.red,
                          }}
                        >
                          {account.status === "ACTIVE" ? "Active" : account.status}
                        </span>
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/hosting/${account.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{ background: T.blue }}
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col divide-y divide-[#f2f5fc]">
                  {hostingAccounts.map((account) => (
                    <div
                      key={`mobile-hosted-${account.id}`}
                      className="p-4 flex flex-col gap-3 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <span className="text-[14.5px] font-bold text-[#1d1d1f] block truncate">
                            {account.domain}
                          </span>
                          <span className="text-xs text-[#6e6e73] mt-0.5 block">
                            {account.plan?.name ?? "Hosting"} Plan
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold shrink-0"
                          style={{
                            background: account.status === "ACTIVE" ? T.emeraldLight : T.redLight,
                            color: account.status === "ACTIVE" ? T.emerald : T.red,
                          }}
                        >
                          {account.status === "ACTIVE" ? "Active" : account.status}
                        </span>
                      </div>

                      <div className="text-xs bg-[#fbfcfe] border border-[#eef2f8] p-2.5 rounded-lg flex items-center justify-between">
                        <span className="text-[#8a9bb2] text-[11px]">cPanel Username:</span>
                        <code className="font-mono text-[#1d1d1f] font-semibold">{account.cpanelUsername ?? "—"}</code>
                      </div>

                      <Link
                        href={`/dashboard/hosting/${account.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white transition-all shadow-xs active:scale-98"
                        style={{ background: T.blue }}
                      >
                        Manage Hosting
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Register / Search tab ─────────────────────────────────────────── */}
      {activeTab === "register" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-[24px] font-bold"
                style={{
                  color: T.ink,
                  fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.4px",
                }}
              >
                Register a Domain
              </h2>
              <p className="text-[14px] mt-0.5" style={{ color: T.inkMuted }}>
                Type in the name you want, click search, and register it instantly.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("registered")}
              className="flex items-center gap-1.5 text-[13px] font-medium shrink-0"
              style={{ color: T.blue }}
            >
              ← Your Domains
            </button>
          </div>

          {/* Search bar */}
          <div
            className="flex gap-2 p-1.5 rounded-2xl"
            style={{ background: "#031033", boxShadow: "0 4px 24px rgba(3,16,51,0.3)" }}
          >
            <div
              className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <Search className="w-4 h-4 shrink-0 text-white/50" />
              <input
                id="domain-register-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchState !== "idle") { setSearchState("idle"); setSearchResults([]); }
                }}
                placeholder="Enter domain (e.g. business.com.ng)..."
                className="flex-1 bg-transparent text-white placeholder-white/40 text-[14px] outline-none"
              />
            </div>
            <button
              onClick={(e) => handleSearch(e as any)}
              disabled={searchState === "searching" || !searchQuery.trim()}
              className="px-6 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: T.blue }}
            >
              {searchState === "searching" ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Searching...</span>
              ) : "Search"}
            </button>
          </div>

          {/* Error */}
          {searchState === "error" && (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-xl"
              style={{ background: "#fef2f2", border: `1px solid #fecaca` }}
            >
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-[13px] text-red-600">{errorMsg}</span>
            </div>
          )}

          {/* Results */}
          {searchState === "done" && searchResults.length > 0 && (
            <div
              className="flex flex-col overflow-hidden"
              style={{
                background: T.canvas,
                border: `1px solid ${T.hairline}`,
                borderRadius: "14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="px-5 py-3 text-[13px] font-semibold"
                style={{ color: T.inkMuted, borderBottom: `1px solid ${T.hairline}`, background: T.parchment }}
              >
                Search Results
              </div>
              {searchResults.map((result) => (
                <div
                  key={result.domain}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[#fafafa]"
                  style={{ borderTop: `1px solid ${T.hairline}` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {result.available
                      ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      : <XCircle className="w-5 h-5 shrink-0" style={{ color: T.inkSubtle }} />
                    }
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-semibold text-[14px] truncate"
                          style={{ color: result.available ? T.ink : T.inkSubtle }}
                        >
                          {result.domain}
                        </span>
                        {result.isPremium && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "#f3f0ff", color: "#7c3aed" }}>
                            <Sparkles className="w-2.5 h-2.5" />Premium
                          </span>
                        )}
                      </div>
                      {result.available && isInCart(result.domain) && (
                        <label className="inline-flex items-center gap-1.5 mt-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasItem(`ssl:${result.domain}`)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addSslItem({ type: "SSL", domainName: result.domain, price: 10000 });
                                toast.success(`SSL for ${result.domain} added!`);
                              } else {
                                removeItem(`ssl:${result.domain}`);
                              }
                            }}
                            className="w-3.5 h-3.5 accent-[#1787D4]"
                          />
                          <span className="text-[11px] flex items-center gap-1" style={{ color: T.inkMuted }}>
                            <Shield className="w-3 h-3 text-emerald-500" />
                            Add SSL (+₦10,000/yr)
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      {result.price.price != null ? (
                        <>
                          <p className="font-bold text-[14px]" style={{ color: result.available ? T.ink : T.inkSubtle }}>
                            {formatPrice(result.price.price, result.price.currency ?? "USD")}
                          </p>
                          <p className="text-[11px]" style={{ color: T.inkSubtle }}>/ 1st year</p>
                        </>
                      ) : <p className="text-[13px]" style={{ color: T.inkSubtle }}>—</p>}
                    </div>
                    {result.available ? (
                      isInCart(result.domain) ? (
                        <button
                          onClick={() => handleRemoveFromCart(result)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(result)}
                          disabled={result.price.price == null}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                          style={{ background: T.blue }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />Add to Cart
                        </button>
                      )
                    ) : (
                      <span className="px-4 py-2 rounded-lg text-[12.5px] font-medium" style={{ background: T.parchment, color: T.inkMuted }}>
                        Taken
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchState === "done" && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center" style={{ background: T.canvas, border: `1px solid ${T.hairline}`, borderRadius: "14px" }}>
              <Search className="w-8 h-8 mb-3" style={{ color: T.inkSubtle }} />
              <p className="text-[14px]" style={{ color: T.inkMuted }}>No domains found. Try a different name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DomainsDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1787D4" }} />
      </div>
    }>
      <DomainsDashboardPageContent />
    </Suspense>
  );
}
