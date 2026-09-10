"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Sparkles,
  Loader2,
  Trash2,
  ArrowRight,
  X,
  Globe,
  ArrowRightLeft,
} from "lucide-react";
import { searchDomains, DomainResult } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
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

export default function DomainSearchSection() {
  const [query, setQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const { addDomainItem, removeItem, hasItem, openDrawer } = useCartStore();

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setState("searching");
    setErrorMsg("");
    setSearchedTerm(trimmed);
    setFilter("all");

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
    const domainName = dotIdx !== -1 ? result.domain.slice(0, dotIdx) : result.domain;
    const extension = dotIdx !== -1 ? result.domain.slice(dotIdx + 1) : "";

    addDomainItem({
      type: "DOMAIN",
      domainName,
      extension,
      price: result.price.price,
      currency: result.price.currency ?? "USD",
      isPremium: result.isPremium,
    });

    toast.success(`${result.domain} added to cart!`, {
      action: {
        label: "View Cart",
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

  const formatPrice = (r: DomainResult) => {
    if (r.price.price == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: r.price.currency ?? "USD",
      minimumFractionDigits: 2,
    }).format(r.price.price);
  };

  const formatRenewalPrice = (r: DomainResult) => {
    if (r.renewalPrice?.price == null) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: r.renewalPrice.currency ?? "USD",
      minimumFractionDigits: 2,
    }).format(r.renewalPrice.price);
  };

  const getExt = (domain: string) => {
    const idx = domain.indexOf(".");
    return idx !== -1 ? domain.slice(idx + 1).toLowerCase() : "";
  };

  return (
    <section
      id="domain-search"
      className="w-full bg-[#f0f4fa] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all"
    >
      {/* Background Curvelines */}
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

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-7">
          <h2 className="type-h2 text-[#031033] mb-3 inline-block">
            <span className="relative inline-block pb-1">
              Start with the right domain
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="type-lead text-[#5a6a85] max-w-xl mx-auto">
            Find, register, and secure your domain from one high-performance platform.
          </p>
        </div>

        {/* Blue Search Card */}
        <div className="bg-[#1787D4] rounded-2xl overflow-hidden shadow-lg border border-[#1474b8]/20">
          <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-7 gap-4">
            {/* Search bar — Apple pill container */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-full p-1.5 shadow-sm overflow-hidden h-14 border border-white/40 focus-within:ring-2 focus-within:ring-white/40 transition-all"
            >
              <div className="flex items-center gap-2.5 flex-1 px-4 min-w-0">
                <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                <input
                  id="domain-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your domain name (e.g., yourbusiness.ng)"
                  className="flex-1 text-sm text-[#031033] placeholder:text-[#9ca3af] outline-none bg-transparent"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-slate-400 hover:text-slate-600 p-1"
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
                className="shrink-0 h-full bg-[#031033] hover:bg-[#081a4a] text-white font-semibold rounded-full text-sm px-6 sm:px-7 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {state === "searching" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FD9F09]" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 hidden sm:inline" />
                    Search Domain
                  </>
                )}
              </button>
            </form>

            {/* Extension pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white/80 text-xs font-medium mr-1 hidden sm:inline">
                Suggested TLDs:
              </span>
              {EXTENSIONS.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => handlePillClick(ext)}
                  className="bg-white/95 hover:bg-white text-[#031033] text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150 shadow-xs cursor-pointer active:scale-95 hover:shadow"
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SEARCHING STATE: Skeleton Grid ── */}
        {state === "searching" && (
          <div className="mt-8 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-44 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-5 w-16 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-6 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="h-10 w-full bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {state === "error" && (
          <div className="mt-8 p-6 bg-red-50/90 border border-red-200 rounded-2xl text-center space-y-3 animate-fade-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Search Failed
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {errorMsg}
            </p>
            <button
              onClick={() => executeSearch(query || searchedTerm)}
              className="btn-primary !rounded-full px-5 py-2 text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── RESULTS STATE: Grid Layout ── */}
        {state === "done" && (
          <div className="mt-8 space-y-6 animate-fade-up">
            {/* Top Toolbar: Search summary, Filter pills, Clear button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1787D4]" />
                <span className="text-sm font-semibold text-[#031033]">
                  Results for &ldquo;{searchedTerm}&rdquo;
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {results.length} found
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Tabs */}
                <div className="inline-flex bg-slate-100 p-1 rounded-full text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      filter === "all"
                        ? "bg-white text-[#031033] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All ({results.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("available")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      filter === "available"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Available ({available.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("taken")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      filter === "taken"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Taken ({taken.length})
                  </button>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={handleClearResults}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Close search results"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Empty filter message */}
            {displayed.length === 0 && (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">
                  No domains match the &ldquo;{filter}&rdquo; filter.
                </p>
              </div>
            )}

            {/* ── THE RESULTS GRID ── */}
            {displayed.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((result) => {
                  const ext = getExt(result.domain);
                  const isPopular = POPULAR_EXTENSIONS.has(ext);
                  const isInCart = hasItem(`domain:${result.domain}`);

                  return (
                    <div
                      key={result.domain}
                      className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 group ${
                        result.available
                          ? "border-[#e2eaff] hover:border-[#1787D4] hover:shadow-md"
                          : "border-slate-200/80 bg-slate-50/50 opacity-90"
                      }`}
                    >
                      {/* Card Header: Domain name + Status badge */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className={`text-lg font-extrabold tracking-tight break-all ${
                              result.available ? "text-[#031033]" : "text-slate-500"
                            }`}
                          >
                            {result.domain}
                          </h3>

                          {/* Status Badge */}
                          {result.available ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Taken
                            </span>
                          )}
                        </div>

                        {/* Badges row: Popular / Premium */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPopular && (
                            <span className="text-[10px] font-bold text-[#e8900a] bg-[#fff8ee] border border-[#f5d38a] px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                          {result.isPremium && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Middle: Price or Taken Explanation */}
                      <div className="pt-2 border-t border-slate-100">
                        {result.available ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-extrabold text-[#031033]">
                                {formatPrice(result)}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                / 1st yr
                              </span>
                            </div>
                            {formatRenewalPrice(result) && (
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Renews at {formatRenewalPrice(result)}/yr
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 space-y-1">
                            <p>Already registered by someone else.</p>
                            <Link
                              href={`/dashboard/domain-transfer?domain=${encodeURIComponent(
                                result.domain
                              )}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1787D4] hover:underline"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Transfer to Nupat
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Action Button */}
                      <div className="pt-1">
                        {result.available ? (
                          isInCart ? (
                            <div className="flex items-center gap-2">
                              <span className="flex-1 text-center py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Added in Cart
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(result.domain)}
                                className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                                title="Remove from cart"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(result)}
                              disabled={result.price.price == null}
                              className="btn-primary w-full py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Cart
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed"
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

            {/* Bottom Link to Full Registrar Page */}
            <div className="pt-2 text-center">
              <Link
                href={`/domains?search=${encodeURIComponent(searchedTerm)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1787D4] hover:text-[#0f5c94] bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-xs hover:shadow transition-all"
              >
                <span>View all extensions and TLD filters on Domains page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
