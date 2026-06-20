"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  XCircle,
  ArrowRight,
  Globe,
  Shield,
  Star,
  ShoppingCart,
  Sparkles,
  Filter,
  Trash2,
} from "lucide-react";
import { searchDomains, DomainResult } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

const extensionInfo: Record<string, { desc: string; popular: boolean }> = {
  "com": { desc: "Perfect for global businesses and startups.", popular: true },
  "com.ng": { desc: "Ideal for Nigerian businesses and brands.", popular: true },
  "ng": { desc: "Short, modern, and locally trusted.", popular: false },
  "africa": { desc: "Built for African brands and businesses.", popular: false },
  "net": { desc: "Great for tech-focused projects.", popular: false },
  "org": { desc: "For organisations and non-profits.", popular: false },
  "io": { desc: "Popular with tech startups and SaaS.", popular: false },
  "co": { desc: "A sleek alternative to .com.", popular: false },
  "app": { desc: "Built for modern web applications.", popular: false },
  "dev": { desc: "Made for developers and dev tools.", popular: false },
};

type SearchState = "idle" | "searching" | "done" | "error";
type FilterTab = "all" | "available" | "taken";

export default function DomainsPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const { addDomainItem, removeItem, hasItem, itemCount } = useCartStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setState("searching");
    setResults([]);
    setFilter("all");
    try {
      const res = await searchDomains(query.trim());
      setResults(res.data || []);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
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
      action: { label: "View Cart", onClick: () => window.location.href = "/cart" },
    });
  };

  const handleRemoveFromCart = (domain: string) => {
    removeItem(`domain:${domain}`);
    toast.info(`${domain} removed from cart.`);
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

  const getTLD = (domain: string) => {
    const idx = domain.indexOf(".");
    return idx !== -1 ? domain.slice(idx + 1) : domain;
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] mb-5 leading-tight">
            Find the <span className="gradient-text">Perfect Domain Name</span>
          </h1>
          <p className="text-[#5a6a85] text-lg mb-10">
            Search and register domains for your business, startup, brand, or
            project.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} id="domain-search-form">
            <div className="flex items-center bg-white rounded-2xl border-2 border-[#dce4f7] focus-within:border-[#fd9f09] transition-all overflow-hidden shadow-lg shadow-gray-200/50">
              <div className="pl-5 shrink-0">
                <Search className="w-5 h-5 text-[#9ba8c0]" />
              </div>
              <input
                id="domain-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (state !== "idle") {
                    setState("idle");
                    setResults([]);
                  }
                }}
                placeholder="Search your domain name..."
                className="flex-1 bg-transparent px-4 py-4 text-[#031033] placeholder-[#9ba8c0] text-base outline-none"
              />
              <button
                id="domain-search-btn"
                type="submit"
                disabled={state === "searching"}
                className="btn-primary m-2 py-3 px-3 sm:px-6 rounded-xl text-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {state === "searching" ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Search Domain</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Searching state */}
          {state === "searching" && (
            <div className="mt-6 bg-white rounded-xl p-5 border-none shadow-apple flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#fd9f09] border-t-transparent animate-spin" />
              <span className="text-[#5a6a85] text-sm">
                Checking availability for{" "}
                <span className="text-[#031033] font-semibold">{query}</span>{" "}
                across all extensions...
              </span>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="mt-6 bg-white rounded-xl p-5 border border-red-100 shadow-apple flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-red-500 text-sm">{errorMsg}</span>
            </div>
          )}

          {/* Results */}
          {state === "done" && results.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-[#dce4f7] shadow-apple overflow-hidden text-left">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[#f0f4fc]">
                <div className="flex gap-1 flex-1">
                  {(
                    [
                      { key: "all", label: `All (${results.length})` },
                      { key: "available", label: `Available (${available.length})` },
                      { key: "taken", label: `Taken (${taken.length})` },
                    ] as { key: FilterTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      id={`domain-filter-${tab.key}`}
                      onClick={() => setFilter(tab.key)}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
                        filter === tab.key
                          ? "border-[#fd9f09] text-[#fd9f09]"
                          : "border-transparent text-[#5a6a85] hover:text-[#031033]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <Filter className="w-4 h-4 text-[#9ba8c0] mb-2" />
              </div>

              {/* Domain result rows */}
              <div className="divide-y divide-[#f0f4fc]">
                {displayed.map((result) => {
                  const tld = getTLD(result.domain);
                  const info = extensionInfo[tld];
                  return (
                    <div
                      key={result.domain}
                      id={`domain-result-${result.domain.replace(".", "-")}`}
                      className={`flex items-center justify-between px-5 py-4 gap-4 transition-colors ${
                        result.available
                          ? "hover:bg-green-50/40"
                          : "hover:bg-gray-50/60"
                      }`}
                    >
                      {/* Left: status icon + domain name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {result.available ? (
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#c5cedf] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold text-base truncate ${
                                result.available
                                  ? "text-[#031033]"
                                  : "text-[#9ba8c0]"
                              }`}
                            >
                              {result.domain}
                            </span>
                            {info?.popular && (
                              <span className="text-[10px] bg-[#fff8ee] text-[#e8900a] border border-[#f5d38a] px-2 py-0.5 rounded font-semibold shrink-0">
                                Popular
                              </span>
                            )}
                            {result.isPremium && (
                              <span className="text-[10px] bg-[#f3f0ff] text-[#7c3aed] border border-[#d8b4fe] px-2 py-0.5 rounded font-semibold shrink-0 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Premium
                              </span>
                            )}
                          </div>
                          {/* Price under domain name — mobile only */}
                          {result.price.price != null && (
                            <p className={`sm:hidden text-xs font-semibold mt-0.5 ${
                              result.available ? "text-[#031033]" : "text-[#9ba8c0]"
                            }`}>
                              {formatPrice(result)}{" "}
                              <span className="font-normal text-[#9ba8c0]">/year</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: price + action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          {result.price.price != null ? (
                            <>
                              <p
                                className={`font-bold text-sm ${
                                  result.available
                                    ? "text-[#031033]"
                                    : "text-[#9ba8c0]"
                                }`}
                              >
                                {formatPrice(result)}
                              </p>
                              <p className="text-[10px] text-[#9ba8c0]">
                                /year
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-[#9ba8c0]">—</p>
                          )}
                        </div>
                        {result.available ? (
                          hasItem(`domain:${result.domain}`) ? (
                            <button
                              id={`domain-remove-${result.domain.replace(".", "-")}`}
                              onClick={() => handleRemoveFromCart(result.domain)}
                              className="py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          ) : (
                            <button
                              id={`domain-add-${result.domain.replace(".", "-")}`}
                              onClick={() => handleAddToCart(result)}
                              disabled={result.price.price == null}
                              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-[#9ba8c0] font-medium px-4 py-2 bg-[#f6f8fc]">
                            Taken
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {displayed.length === 0 && (
                <div className="py-10 text-center text-[#9ba8c0] text-sm">
                  No domains match this filter.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Extensions showcase */}
      <section className="section-pad section-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#031033] mb-3">
              Popular <span className="gradient-text">Extensions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(extensionInfo)
              .slice(0, 6)
              .map(([ext, info]) => (
                <div
                  key={ext}
                  className="feature-card p-6 flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0 font-bold text-[#031033] text-xs group-hover:scale-110 transition-transform">
                    .{ext}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#031033] font-semibold">.{ext}</h3>
                      {info.popular && (
                        <span className="text-[10px] bg-[#fff8ee] text-[#e8900a] border border-[#f5d38a] px-2 py-0.5 font-semibold rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[#5a6a85] text-sm">{info.desc}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Why domain matters */}
      <section className="section-pad section-light relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[#031033] mb-5">
                Why Your <span className="gradient-text">Domain Matters</span>
              </h2>
              <p className="text-[#5a6a85] leading-relaxed mb-4">
                A professional domain name builds trust, improves credibility,
                and helps customers find your business online.
              </p>
              <p className="text-[#5a6a85] leading-relaxed mb-8">
                Your domain is the foundation of your digital identity.
              </p>
              <Link
                href="#domain-search-form"
                id="domain-why-search"
                className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 rounded-xl text-base"
              >
                Search Domain <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Globe,
                  title: "Brand Identity",
                  desc: "Your domain defines how the world sees your business.",
                  color: "blue",
                },
                {
                  icon: Shield,
                  title: "Trust & Credibility",
                  desc: "Customers trust businesses with professional domain names.",
                  color: "orange",
                },
                {
                  icon: Star,
                  title: "SEO Advantage",
                  desc: "A .ng or .africa domain can rank better for local searches.",
                  color: "blue",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="feature-card p-4 flex items-start gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
                      color === "orange" ? "bg-[#fff8ee]" : "bg-[#f2f5fc]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        color === "orange"
                          ? "text-[#e8900a]"
                          : "text-[#031033]"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-[#031033] font-semibold text-sm mb-1">
                      {title}
                    </p>
                    <p className="text-[#5a6a85] text-xs leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-pad relative overflow-hidden">
        <div className="absolute inset-0 bg-[#031033]" />
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/nupat-cloud-logo-blackbg-removebg-preview.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Secure Your Domain{" "}
            <span style={{ color: "#fd9f09" }}>Before Someone Else Does</span>
          </h2>
          <Link
            href="#domain-search-form"
            id="domain-final-search"
            className="inline-flex items-center gap-2 py-4 px-10 rounded-xl text-base font-semibold bg-white text-[#031033] hover:bg-gray-100 transition-all shadow-xl mt-4"
          >
            <Search className="w-5 h-5" />
            Search Domain
          </Link>
        </div>
      </section>
    </div>
  );
}
