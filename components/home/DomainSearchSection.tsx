"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Loader2,
  Trash2,
  ArrowRight,
  X,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";
import {
  searchDomains,
  suggestDomains,
  extractAlternativeDomainNames,
  DomainResult,
} from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { formatApiPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

const EXTENSIONS = [
  ".com",
  ".ng",
  ".africa",
  ".co",
  ".io",
  ".ai",
  ".net",
  ".org",
];

const POPULAR_EXTENSIONS = new Set(["com", "ng", "ai", "io", "africa"]);

type SearchState = "idle" | "searching" | "done" | "error";
type FilterTab = "all" | "available" | "taken";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

export default function DomainSearchSection() {
  const [query, setQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [suggestedAlternativeNames, setSuggestedAlternativeNames] = useState<string[]>([]);

  const { addDomainItem, removeItem, hasItem, openDrawer } = useCartStore();

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setState("searching");
    setErrorMsg("");
    setSearchedTerm(trimmed);
    setFilter("all");

    const baseWord = trimmed.replace(/\.[a-z0-9.]+$/i, "");
    suggestDomains({
      term: baseWord,
      extensions: ["com", "net", "org"],
    })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setSuggestedAlternativeNames(extractAlternativeDomainNames(res.data, baseWord));
        } else {
          setSuggestedAlternativeNames([]);
        }
      })
      .catch(() => setSuggestedAlternativeNames([]));

    try {
      const res = await searchDomains(trimmed);
      setResults(res.data || []);
      setState("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to search domains. Please try again."
      );
      setState("error");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handlePillClick = (ext: string) => {
    let cleanBase = query.trim();
    if (!cleanBase) {
      cleanBase = "mybrand";
    } else {
      cleanBase = cleanBase.replace(/\.\w+(\.\w+)?$/, "");
    }
    const newQuery = `${cleanBase}${ext}`;
    setQuery(newQuery);
    executeSearch(newQuery);
  };

  const handleAddToCart = (result: DomainResult) => {
    if (result.price.price == null) return;
    const dotIdx = result.domain.indexOf(".");
    // Guard: every domain must have a valid extension for the backend schema
    if (dotIdx === -1) return;
    const domainName = result.domain.slice(0, dotIdx);
    const extension = result.domain.slice(dotIdx + 1);
    if (!extension) return;

    addDomainItem({
      type: "DOMAIN",
      domainName,
      extension,
      price: result.price.price,
      // Cart totals are charged in naira; the domain search API prices in NGN.
      currency: result.price.currency ?? "NGN",
      isPremium: result.isPremium,
    });

    toast.success(`${result.domain} added to cart`, {
      action: {
        label: "View cart",
        onClick: () => openDrawer(),
      },
    });
  };

  const handleRemoveFromCart = (domain: string) => {
    removeItem(`domain:${domain}`);
    toast.info(`${domain} removed from cart.`);
  };

  const handleClearResults = () => {
    setState("idle");
    setResults([]);
    setSearchedTerm("");
  };

  const available = results.filter((r) => r.available);
  const taken = results.filter((r) => !r.available);

  const displayed =
    filter === "available" ? available : filter === "taken" ? taken : results;

  // Prices are shown in the currency the API returns (NGN for domain search).
  const formatPrice = (r: DomainResult) => {
    if (r.price.price == null) return "—";
    return formatApiPrice(r.price.price, r.price.currency);
  };

  const formatRenewalPrice = (r: DomainResult) => {
    if (r.renewalPrice?.price == null) return null;
    return formatApiPrice(r.renewalPrice.price, r.renewalPrice.currency);
  };

  const getExt = (domain: string) => {
    const idx = domain.indexOf(".");
    return idx !== -1 ? domain.slice(idx + 1).toLowerCase() : "";
  };

  const filterTabClass = (active: boolean) =>
    `px-3 py-1 rounded-full transition-colors cursor-pointer ${FOCUS_RING} ${
      active ? "bg-[#031033] text-white" : "text-[#5A6A85] hover:text-[#031033]"
    }`;

  return (
    <section
      id="domain-search"
      className="w-full bg-[#F2F5FC] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background curvelines */}
      <div className="absolute -top-12 -right-16 pointer-events-none select-none z-0 hidden sm:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-105 lg:w-135 h-auto brightness-0 opacity-[0.045] rotate-20"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -left-20 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-95 lg:w-120 h-auto brightness-0 opacity-[0.04] rotate-[-30deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="type-h2 text-[#031033] mb-3 inline-block">
            <span className="relative inline-block pb-1">
              Start with the right domain
              <span
                className="absolute left-0 bottom-0 w-full h-1 bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="type-lead text-[#5A6A85] max-w-xl mx-auto">
            Search .com, .ng, .africa and other extensions, then register the
            one you want in a few clicks.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-[#1787D4] rounded-xl overflow-hidden max-w-5xl mx-auto">
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-5 sm:py-7 gap-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-lg p-1 sm:p-1.5 overflow-hidden h-12 sm:h-14 focus-within:ring-2 focus-within:ring-white/60"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 px-3 sm:px-4 min-w-0">
                <Search className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <input
                  id="domain-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a domain, e.g. yourbusiness.ng"
                  aria-label="Domain name"
                  className="flex-1 text-base sm:text-sm text-[#031033] placeholder:text-[#5A6A85] outline-none bg-transparent min-w-0"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-[#5A6A85] hover:text-[#031033] p-1 shrink-0"
                    aria-label="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                id="domain-search-btn"
                disabled={state === "searching"}
                className="shrink-0 h-full bg-[#031033] hover:bg-[#0A1C4A] text-white font-medium rounded-md text-sm px-4 sm:px-6 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]"
              >
                {state === "searching" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFC75D]" />
                    <span className="hidden sm:inline">Searching…</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search domains</span>
                    <span className="sm:hidden">Search</span>
                  </>
                )}
              </button>
            </form>

            {/* Extension pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white/80 text-sm mr-1 hidden sm:inline">
                Try:
              </span>
              {EXTENSIONS.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => handlePillClick(ext)}
                  className="bg-white hover:bg-[#E8F4FC] text-[#031033] text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1787D4]"
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Searching state: skeleton grid */}
        {state === "searching" && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-[#E2E8F0] rounded animate-pulse" />
              <div className="h-8 w-32 bg-[#E2E8F0] rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-[#E2E8F0] flex flex-col justify-between h-44 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-[#E2E8F0] rounded" />
                      <div className="h-5 w-16 bg-[#F2F5FC] rounded-full" />
                    </div>
                    <div className="h-6 w-24 bg-[#E2E8F0] rounded" />
                  </div>
                  <div className="h-9 w-full bg-[#F2F5FC] rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="mt-8 p-6 bg-white border border-[#DC2626]/30 rounded-xl text-center space-y-3">
            <h3 className="text-lg font-semibold text-[#031033]">
              Search failed
            </h3>
            <p className="text-sm text-[#5A6A85] max-w-md mx-auto">
              {errorMsg}
            </p>
            <button
              onClick={() => executeSearch(query || searchedTerm)}
              className={`inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              Try again
            </button>
          </div>
        )}

        {/* Results state */}
        {state === "done" && (
          <div className="mt-8 space-y-6">
            {/* Toolbar: summary, filters, clear */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[#031033]">
                  Results for &ldquo;{searchedTerm}&rdquo;
                </span>
                <span className="text-xs text-[#5A6A85]">
                  {results.length} found
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex bg-[#F2F5FC] p-1 rounded-full text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={filterTabClass(filter === "all")}
                  >
                    All ({results.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("available")}
                    className={filterTabClass(filter === "available")}
                  >
                    Available ({available.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("taken")}
                    className={filterTabClass(filter === "taken")}
                  >
                    Taken ({taken.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClearResults}
                  className={`p-1.5 text-[#5A6A85] hover:text-[#031033] rounded-full hover:bg-[#F2F5FC] transition-colors ${FOCUS_RING}`}
                  title="Close search results"
                  aria-label="Close search results"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {displayed.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-[#E2E8F0]">
                <p className="text-[#5A6A85] text-sm">
                  No domains match the &ldquo;{filter}&rdquo; filter.
                </p>
              </div>
            )}

            {displayed.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((result) => {
                  const ext = getExt(result.domain);
                  const isPopular = POPULAR_EXTENSIONS.has(ext);
                  const isInCart = hasItem(`domain:${result.domain}`);

                  return (
                    <div
                      key={result.domain}
                      className={`rounded-xl p-6 border transition-colors flex flex-col justify-between gap-4 ${
                        result.available
                          ? "bg-white border-[#E2E8F0] hover:border-[#1787D4]"
                          : "bg-[#F2F5FC] border-[#E2E8F0]"
                      }`}
                    >
                      {/* Domain name and status */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className={`text-lg font-semibold break-all ${
                              result.available ? "text-[#031033]" : "text-[#5A6A85]"
                            }`}
                          >
                            {result.domain}
                          </h3>

                          {result.available ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0E7C3A] shrink-0 mt-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#12A150]" aria-hidden="true" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A6A85] shrink-0 mt-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#5A6A85]" aria-hidden="true" />
                              Taken
                            </span>
                          )}
                        </div>

                        {(isPopular || result.isPremium) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isPopular && (
                              <span className="text-xs font-medium text-[#031033] bg-[#FFF8EE] px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                            {result.isPremium && (
                              <span className="text-xs font-medium text-[#1370B5] bg-[#E8F4FC] px-2 py-0.5 rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price or taken explanation */}
                      <div className="pt-3 border-t border-[#E2E8F0]">
                        {result.available ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-semibold text-[#031033] tabular-nums">
                                {formatPrice(result)}
                              </span>
                              <span className="text-xs text-[#5A6A85]">
                                first year
                              </span>
                            </div>
                            {formatRenewalPrice(result) && (
                              <p className="text-xs text-[#5A6A85] mt-0.5">
                                Renews at {formatRenewalPrice(result)}/yr
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-[#5A6A85] space-y-1">
                            <p>Already registered by someone else.</p>
                            <Link
                              href={`/dashboard/domain-transfer?domain=${encodeURIComponent(
                                result.domain
                              )}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#1787D4] hover:underline"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Transfer to Nupat
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div>
                        {result.available ? (
                          isInCart ? (
                            <div className="flex items-center gap-2">
                              <span className="flex-1 h-9 px-3 text-sm font-medium text-[#0E7C3A] bg-[#12A150]/10 rounded-lg flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                In cart
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(result.domain)}
                                className={`h-9 w-9 flex items-center justify-center text-[#DC2626] hover:bg-[#DC2626]/10 border border-[#E2E8F0] rounded-lg transition-colors ${FOCUS_RING}`}
                                title="Remove from cart"
                                aria-label={`Remove ${result.domain} from cart`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(result)}
                              disabled={result.price.price == null}
                              className={`w-full h-9 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 bg-[#1787D4] hover:bg-[#1370B5] text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to cart
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full h-9 px-4 text-sm font-medium text-[#5A6A85] bg-white border border-[#E2E8F0] rounded-lg cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggested alternative names */}
            {suggestedAlternativeNames.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-semibold text-[#031033] mb-3">
                  Other names to try
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {suggestedAlternativeNames.slice(0, 8).map((alt) => (
                    <button
                      key={alt}
                      type="button"
                      onClick={() => {
                        const newQ = `${alt}.com`;
                        setQuery(newQ);
                        executeSearch(newQ);
                      }}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#F2F5FC] hover:bg-[#E8F4FC] text-[#1787D4] transition-colors cursor-pointer ${FOCUS_RING}`}
                    >
                      <span>{alt}</span>
                      <span className="text-[#5A6A85] font-normal">.com</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link to the full domains page */}
            <div className="pt-2 text-center">
              <Link
                href={`/domains?search=${encodeURIComponent(searchedTerm)}`}
                className={`inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-[#031033] bg-white rounded-lg border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors ${FOCUS_RING}`}
              >
                <span>See every extension on the domains page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
