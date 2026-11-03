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
import { useGetSslProducts } from "@/hooks/useSsl";
import { toast } from "sonner";
import DomainRegistrationWizard from "@/components/dashboard/DomainRegistrationWizard";

// ─── Shared class strings ─────────────────────────────────────────────────────
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0";
const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 shrink-0";
const btnSecondarySm =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";
const pillBase =
  "inline-flex items-center gap-2 whitespace-nowrap text-sm shrink-0";
const dotBase = "h-2 w-2 shrink-0 rounded-full";

type SearchState = "idle" | "searching" | "done" | "error";
type Tab = "registered" | "hosted" | "register";
type StatusFilter = "All" | "Active" | "Expiring Soon" | "Expired";

// Display labels (sentence case); filter values stay as they are.
const FILTER_LABEL: Record<StatusFilter, string> = {
  All: "All",
  Active: "Active",
  "Expiring Soon": "Expiring soon",
  Expired: "Expired",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({
  status,
  expiryDate,
}: {
  status: string;
  expiryDate?: string;
}) {
  const days = expiryDate ? daysUntil(expiryDate) : 999;
  const isExpired = days < 0 || (status ?? "").toUpperCase() === "EXPIRED";
  const isExpiring = !isExpired && days <= 30;

  if (isExpired) {
    return (
      <span className={`${pillBase} text-[#C21F1F]`}>
        <span aria-hidden className={`${dotBase} bg-[#DC2626]`} />
        Expired
      </span>
    );
  }
  if (isExpiring) {
    return (
      <span className={`${pillBase} text-[#031033]`}>
        <span aria-hidden className={`${dotBase} bg-[#E8900A]`} />
        Expiring soon
      </span>
    );
  }
  return (
    <span className={`${pillBase} text-[#031033]`}>
      <span aria-hidden className={`${dotBase} bg-[#12A150]`} />
      Active
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-[#EEF2F7] last:border-0 animate-pulse">
      <div className="h-4 w-40 rounded bg-[#EEF2F7] flex-1" />
      <div className="h-5 w-16 rounded-full bg-[#EEF2F7] shrink-0" />
      <div className="h-4 w-12 rounded bg-[#EEF2F7] shrink-0" />
      <div className="h-4 w-24 rounded bg-[#EEF2F7] shrink-0" />
      <div className="h-8 w-20 rounded-lg bg-[#EEF2F7] shrink-0" />
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

  const { data: registeredDomains, isLoading: loadingDomains } =
    useGetRegisteredDomains();
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();
  const { addDomainItem, addSslItem, removeItem, hasItem, openDrawer } =
    useCartStore();

  // Fetch real SSL product pricing — Positive SSL (id:41) 1-year price
  const { data: sslProducts } = useGetSslProducts();
  const positiveSslPrice = (() => {
    const prod = (sslProducts ?? []).find((p: { id: number }) => p.id === 41);
    return (
      prod?.prices?.find((p: { period: number }) => p.period === 1)?.price ??
      prod?.price ??
      15000
    );
  })();

  useEffect(() => {
    if (
      tabQuery === "hosted" ||
      tabQuery === "register" ||
      tabQuery === "registered"
    ) {
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
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong during the search.",
      );
      setSearchState("error");
    }
  };

  const formatPrice = (priceVal: number | null, currency = "USD") => {
    if (priceVal == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(priceVal);
  };

  const isInCart = (domain: string) =>
    hasItem(
      `domain:${domain.slice(0, domain.indexOf("."))}.${domain.slice(domain.indexOf(".") + 1)}`,
    );

  const handleAddToCart = (result: DomainResult) => {
    if (result.price.price == null) return;
    const dotIdx = result.domain.indexOf(".");
    const domainName =
      dotIdx !== -1 ? result.domain.slice(0, dotIdx) : result.domain;
    const extension = dotIdx !== -1 ? result.domain.slice(dotIdx + 1) : "";
    addDomainItem({
      type: "DOMAIN",
      domainName,
      extension,
      price: result.price.price,
      currency: result.price.currency ?? "USD",
      isPremium: result.isPremium,
    });
    toast.success(`${result.domain} added to cart.`);
    openDrawer();
  };

  const handleRemoveFromCart = (result: DomainResult) => {
    const dotIdx = result.domain.indexOf(".");
    const domainName =
      dotIdx !== -1 ? result.domain.slice(0, dotIdx) : result.domain;
    const extension = dotIdx !== -1 ? result.domain.slice(dotIdx + 1) : "";
    removeItem(`domain:${domainName}.${extension}`);
    toast.info(`${result.domain} removed from cart.`);
  };

  // Filter registered domains by status and search
  const filteredDomains = (registeredDomains ?? []).filter((d) => {
    const matchesSearch = d.domain
      .toLowerCase()
      .includes(domainSearch.toLowerCase());
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

  const STATUS_FILTERS: StatusFilter[] = [
    "All",
    "Active",
    "Expiring Soon",
    "Expired",
  ];

  return (
    <div
      className={`flex flex-col gap-6 w-full ${
        activeTab === "register" ? "" : "max-w-6xl mx-auto"
      }`}
    >
      {/* ── Registered tab ──────────────────────────────────────────────── */}
      {activeTab === "registered" && (
        <>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#031033]">
                Your domains
              </h1>
              <p className="text-sm text-[#5A6A85] mt-1">
                Manage renewals, DNS settings and domain details in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Link
                href="/dashboard/domain-transfer"
                id="domains-transfer-in"
                className={`${btnSecondary} flex-1 sm:flex-initial`}
              >
                <ArrowRightLeft className="w-4 h-4 text-[#5A6A85]" />
                Transfer in
              </Link>
              <button
                id="domains-register-new"
                onClick={() => handleTabChange("register")}
                className={`${btnPrimary} flex-1 sm:flex-initial`}
              >
                <Plus className="w-4 h-4" />
                Register a domain
              </button>
            </div>
          </div>

          {/* Filter row: segmented status filter + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F2F5FC] w-fit max-w-full overflow-x-auto">
              {STATUS_FILTERS.map((f) => {
                const isActive = f === statusFilter;
                return (
                  <button
                    key={f}
                    id={`domain-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setStatusFilter(f)}
                    aria-pressed={isActive}
                    className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                      isActive
                        ? "bg-white text-[#031033] shadow-sm"
                        : "text-[#5A6A85] hover:text-[#031033]"
                    }`}
                  >
                    {FILTER_LABEL[f]}
                  </button>
                );
              })}
            </div>

            {/* Domain search */}
            <div className="relative w-full sm:w-72 sm:ml-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85] pointer-events-none" />
              <input
                id="domain-search-filter"
                type="text"
                placeholder="Search by domain name"
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white pl-9 pr-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
              />
            </div>
          </div>

          {/* Table card */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            {/* Table header */}
            <div
              className="hidden md:grid items-center px-5 py-3 text-xs font-medium text-[#5A6A85] border-b border-[#E2E8F0]"
              style={{ gridTemplateColumns: "1fr 160px 100px 140px 100px" }}
            >
              <span>Domain</span>
              <span>Status</span>
              <span>Auto-renew</span>
              <span className="text-right">Expires</span>
              <span className="text-right">Action</span>
            </div>

            {/* Rows */}
            {loadingDomains ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            ) : filteredDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-5">
                <p className="text-sm font-medium text-[#031033]">
                  {domainSearch || statusFilter !== "All"
                    ? "No domains match your filter"
                    : "You have no registered domains yet"}
                </p>
                <p className="text-sm text-[#5A6A85] mt-1">
                  {domainSearch || statusFilter !== "All"
                    ? "Try a different search or status."
                    : "Search for a name to register your first domain."}
                </p>
                {!domainSearch && statusFilter === "All" && (
                  <button
                    onClick={() => handleTabChange("register")}
                    className={`${btnSecondary} mt-4`}
                  >
                    <Search className="w-4 h-4 text-[#5A6A85]" />
                    Search domains
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop / tablet table view */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <div className="min-w-[580px]">
                    {filteredDomains.map((domain) => (
                      <div
                        key={domain.id}
                        className="grid items-center px-5 py-3 text-sm border-b border-[#EEF2F7] last:border-0 transition-colors hover:bg-[#F2F5FC]/60"
                        style={{
                          gridTemplateColumns: "1fr 160px 100px 140px 100px",
                        }}
                      >
                        {/* Domain name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe className="w-4 h-4 shrink-0 text-[#5A6A85]" />
                          <span className="font-medium text-[#031033] truncate">
                            {domain.domain}
                          </span>
                        </div>

                        {/* Status */}
                        <div>
                          <StatusPill
                            status={domain.status}
                            expiryDate={domain.expiryDate}
                          />
                        </div>

                        {/* Auto-renew */}
                        <span className="text-[#5A6A85]">
                          {domain.autoRenew === undefined ? "—" : domain.autoRenew ? "On" : "Off"}
                        </span>

                        {/* Expiry date */}
                        <span className="text-right tabular-nums text-[#5A6A85]">
                          {formatDate(domain.expiryDate)}
                        </span>

                        {/* Action */}
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/domains/${domain.id}`}
                            className={btnSecondarySm}
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile list view */}
                <div className="md:hidden flex flex-col divide-y divide-[#EEF2F7]">
                  {filteredDomains.map((domain) => (
                    <div
                      key={`mobile-${domain.id}`}
                      className="px-4 py-3.5 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-4 h-4 shrink-0 text-[#5A6A85]" />
                          <span className="text-sm font-medium text-[#031033] truncate">
                            {domain.domain}
                          </span>
                        </div>
                        <StatusPill
                          status={domain.status}
                          expiryDate={domain.expiryDate}
                        />
                      </div>

                      <dl className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs text-[#5A6A85]">
                            Auto-renew
                          </dt>
                          <dd className="text-sm text-[#031033]">
                            {domain.autoRenew === undefined ? "—" : domain.autoRenew ? "On" : "Off"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-[#5A6A85]">Expires</dt>
                          <dd className="text-sm text-[#031033] tabular-nums">
                            {formatDate(domain.expiryDate)}
                          </dd>
                        </div>
                      </dl>

                      <Link
                        href={`/dashboard/domains/${domain.id}`}
                        className={`${btnSecondary} w-full`}
                      >
                        Manage domain
                        <ChevronRight className="w-4 h-4 text-[#5A6A85]" />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Secondary nav to hosted domains */}
          <div className="flex items-center gap-3">
            <button
              id="domains-tab-hosted"
              onClick={() => handleTabChange("hosted")}
              className="inline-flex items-center gap-1.5 h-8 px-3 -ml-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              <Server className="w-4 h-4" />
              Hosted domains
              <span className="tabular-nums text-[#5A6A85]">
                {loadingHosting ? "…" : (hostingAccounts?.length ?? 0)}
              </span>
            </button>
          </div>
        </>
      )}

      {/* ── Hosted tab ────────────────────────────────────────────────────── */}
      {activeTab === "hosted" && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#031033]">
                Hosted domains
              </h1>
              <p className="text-sm text-[#5A6A85] mt-1">
                Domains tied to your active hosting accounts.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("registered")}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              ← Registered domains
            </button>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            {/* Header */}
            <div
              className="hidden md:grid items-center px-5 py-3 text-xs font-medium text-[#5A6A85] border-b border-[#E2E8F0]"
              style={{ gridTemplateColumns: "1fr 180px 160px 120px 120px" }}
            >
              <span>Domain</span>
              <span>Hosting plan</span>
              <span>cPanel username</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            {loadingHosting ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            ) : !hostingAccounts || hostingAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-5">
                <p className="text-sm font-medium text-[#031033]">
                  No hosted domains
                </p>
                <p className="text-sm text-[#5A6A85] mt-1">
                  Order a hosting plan and its domain will appear here.
                </p>
                <Link href="/dashboard/hosting" className={`${btnSecondary} mt-4`}>
                  <Plus className="w-4 h-4 text-[#5A6A85]" />
                  Order a hosting plan
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop / tablet table view */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <div className="min-w-[580px]">
                    {hostingAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="grid items-center px-5 py-3 text-sm border-b border-[#EEF2F7] last:border-0 transition-colors hover:bg-[#F2F5FC]/60"
                        style={{
                          gridTemplateColumns: "1fr 180px 160px 120px 120px",
                        }}
                      >
                        <span className="font-medium text-[#031033] truncate">
                          {account.domain}
                        </span>
                        <span className="text-[#5A6A85] truncate">
                          {account.plan?.name ?? "Hosting"} plan
                        </span>
                        <code className="font-mono text-sm text-[#5A6A85] truncate">
                          {account.cpanelUsername ?? "—"}
                        </code>
                        <span>
                          <span
                            className={`${pillBase} ${
                              account.status === "ACTIVE"
                                ? "text-[#031033]"
                                : "text-[#C21F1F]"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`${dotBase} ${
                                account.status === "ACTIVE"
                                  ? "bg-[#12A150]"
                                  : "bg-[#DC2626]"
                              }`}
                            />
                            {account.status === "ACTIVE"
                              ? "Active"
                              : account.status}
                          </span>
                        </span>
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/hosting/${account.id}`}
                            className={btnSecondarySm}
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile list view */}
                <div className="md:hidden flex flex-col divide-y divide-[#EEF2F7]">
                  {hostingAccounts.map((account) => (
                    <div
                      key={`mobile-hosted-${account.id}`}
                      className="px-4 py-3.5 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-[#031033] block truncate">
                            {account.domain}
                          </span>
                          <span className="text-xs text-[#5A6A85] mt-0.5 block">
                            {account.plan?.name ?? "Hosting"} plan
                          </span>
                        </div>
                        <span
                          className={`${pillBase} ${
                            account.status === "ACTIVE"
                              ? "text-[#031033]"
                              : "text-[#C21F1F]"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`${dotBase} ${
                              account.status === "ACTIVE"
                                ? "bg-[#12A150]"
                                : "bg-[#DC2626]"
                            }`}
                          />
                          {account.status === "ACTIVE"
                            ? "Active"
                            : account.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#5A6A85]">
                          cPanel username
                        </span>
                        <code className="font-mono text-sm text-[#031033] truncate">
                          {account.cpanelUsername ?? "—"}
                        </code>
                      </div>

                      <Link
                        href={`/dashboard/hosting/${account.id}`}
                        className={`${btnSecondary} w-full`}
                      >
                        Manage hosting
                        <ChevronRight className="w-4 h-4 text-[#5A6A85]" />
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Register / search tab ─────────────────────────────────────────── */}
      {activeTab === "register" && (
        <DomainRegistrationWizard
          onBackToDomains={() => handleTabChange("registered")}
          initialQuery={searchQuery}
        />
      )}
    </div>
  );
}

export default function DomainsDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DomainsDashboardPageContent />
    </Suspense>
  );
}
