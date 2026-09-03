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
  ArrowRightLeft,
  CreditCard,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { searchDomains, DomainResult } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

const extensionInfo: Record<string, { desc: string; popular: boolean }> = {
  "com": { desc: "Perfect for global businesses and startups.", popular: true },
  "net": { desc: "Great for tech-focused projects.", popular: false },
  "org": { desc: "For organisations and non-profits.", popular: false },
  "io": { desc: "Popular with tech startups and SaaS.", popular: false },
  "co": { desc: "A sleek alternative to .com.", popular: false },
  "info": { desc: "Perfect for informational websites, blogs, and directories.", popular: false },
  "me": { desc: "Ideal for personal websites, portfolios, and blogs.", popular: false },
};

type SearchState = "idle" | "searching" | "done" | "error";
type FilterTab = "all" | "available" | "taken";

export default function DomainsPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { addDomainItem, addSslItem, removeItem, hasItem, itemCount } = useCartStore();

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

  const formatRenewalPrice = (r: DomainResult) => {
    if (r.renewalPrice?.price == null) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: r.renewalPrice.currency ?? "USD",
      minimumFractionDigits: 2,
    }).format(r.renewalPrice.price);
  };

  const getTLD = (domain: string) => {
    const idx = domain.indexOf(".");
    return idx !== -1 ? domain.slice(idx + 1) : domain;
  };

  const scrollToSearch = () => {
    const el = document.getElementById("domain-search-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    const input = document.getElementById("domain-search-input");
    if (input) {
      setTimeout(() => input.focus(), 400);
    }
  };

  const handleTldClick = (tld: string) => {
    let newQuery = query.trim();
    if (!newQuery) {
      newQuery = `mybrand${tld}`;
    } else {
      const dotIdx = newQuery.indexOf(".");
      if (dotIdx !== -1) {
        newQuery = `${newQuery.slice(0, dotIdx)}${tld}`;
      } else {
        newQuery = `${newQuery}${tld}`;
      }
    }
    setQuery(newQuery);
    const input = document.getElementById("domain-search-input");
    if (input) input.focus();
  };

  const handleRegisterClick = (tld: string) => {
    handleTldClick(tld);
    scrollToSearch();
  };

  return (
    <div className="flex flex-col bg-white">
      {/* ── New Hero Section ── */}
      <section className="relative pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, subtext, CTA */}
            <div className="lg:col-span-6 xl:col-span-6 text-left z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black text-[#031033] tracking-tight leading-[1.12]">
                <span className="lg:whitespace-nowrap block">Find the perfect domain</span>
                <span className="block">for your business</span>
              </h1>
              <p className="mt-6 text-[#5a6a85] text-base sm:text-lg leading-relaxed max-w-lg font-normal">
                Search, register, and secure your domain with Nupat. Get your
                business online with a domain that is easy to manage and ready to
                grow with you.
              </p>
              <div className="mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={scrollToSearch}
                  id="hero-search-btn"
                  className="btn-primary !rounded-[8px] py-3.5 px-7 sm:px-8 text-sm sm:text-base font-semibold text-white shadow-[0_2px_10px_rgba(23,135,212,0.35)] hover:shadow-[0_4px_16px_rgba(23,135,212,0.45)] transition-all cursor-pointer"
                >
                  Search for a Domain
                </button>
              </div>
            </div>

            {/* Right Column: Hero Graphic with Badges */}
            <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-[540px] lg:max-w-[620px]">
                <Image
                  src="/domain.png"
                  alt="Find the perfect domain for your business"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto object-contain -scale-x-100 select-none pointer-events-none mix-blend-multiply"
                />

                {/* Floating Badge: yourbusiness.com */}
                <div className="absolute bottom-[14%] left-[24%] sm:left-[28%] transition-transform hover:scale-105 duration-200">
                  <div className="bg-white text-[#031033] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.12)] border border-gray-100/90 -rotate-[6deg] flex items-center select-none">
                    yourbusiness.com
                  </div>
                </div>

                {/* Floating Badge: yourbusiness.ng */}
                <div className="absolute top-[46%] right-[1%] sm:right-[3%] transition-transform hover:scale-105 duration-200">
                  <div className="bg-white text-[#031033] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] border-2 border-[#1787D4] rotate-[5deg] flex items-center select-none">
                    yourbusiness.ng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Search Section ── */}
      <section
        id="domain-search-section"
        className="bg-[#f8f9fb] py-16 sm:py-24 border-t border-[#edf2f7] relative scroll-mt-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#031033] tracking-tight">
            Your name starts here
          </h2>
          <p className="mt-3 text-[#5a6a85] text-sm sm:text-base font-normal max-w-xl mx-auto">
            Search thousands of domain names and find the right one for your brand.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} id="domain-search-form" className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-xl sm:rounded-2xl border border-[#dce4f7] focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/15 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-1.5 sm:p-2">
              <div className="pl-3 sm:pl-4 pr-1 shrink-0">
                <Search className="w-5 h-5 text-[#1787D4]" />
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
                placeholder="Search for your domain..."
                className="flex-1 bg-transparent py-2.5 px-3 text-[#031033] placeholder-[#9ba8c0] text-sm sm:text-base outline-none"
              />
              <button
                id="domain-search-btn"
                type="submit"
                disabled={state === "searching"}
                className="btn-primary !rounded-[8px] py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white shrink-0 disabled:opacity-60 transition-colors"
              >
                {state === "searching" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    <span>Searching...</span>
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          {/* Suggested TLD Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[".com", ".ng", ".africa", ".co", ".io"].map((tld) => (
              <button
                key={tld}
                type="button"
                id={`tld-pill-${tld.replace(".", "")}`}
                onClick={() => handleTldClick(tld)}
                className="bg-white hover:bg-blue-50/70 border border-[#dce4f7] hover:border-[#1787D4]/40 text-[#1787D4] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
              >
                {tld}
              </button>
            ))}
          </div>

          {/* Transfer domain helper link */}
          <div className="mt-4 text-xs sm:text-sm text-[#5a6a85]">
            Looking to transfer an existing domain?{" "}
            <Link
              href={`/dashboard/domain-transfer${query.trim() ? `?domain=${encodeURIComponent(query.trim())}` : ""}`}
              id="domain-transfer-link"
              className="text-[#1787D4] hover:text-[#1370B5] font-semibold hover:underline transition-colors"
            >
              Transfer it here
            </Link>
          </div>

          {/* Searching state */}
          {state === "searching" && (
            <div className="mt-8 bg-white rounded-xl p-5 border border-[#dce4f7] shadow-sm flex items-center justify-center gap-3 max-w-2xl mx-auto">
              <div className="w-5 h-5 rounded-full border-2 border-[#1787D4] border-t-transparent animate-spin" />
              <span className="text-[#5a6a85] text-sm">
                Checking availability for{" "}
                <span className="text-[#031033] font-semibold">{query}</span>{" "}
                across all extensions...
              </span>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="mt-8 bg-white rounded-xl p-5 border border-red-200 shadow-sm flex items-center justify-center gap-3 max-w-2xl mx-auto">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-red-500 text-sm">{errorMsg}</span>
            </div>
          )}

          {/* Results */}
          {state === "done" && results.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl border border-[#dce4f7] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden text-left max-w-3xl mx-auto">
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
                          ? "border-[#1787D4] text-[#1787D4]"
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
                            <div className="sm:hidden mt-0.5">
                              <p
                                className={`text-xs font-semibold ${
                                  result.available ? "text-[#031033]" : "text-[#9ba8c0]"
                                }`}
                              >
                                {formatPrice(result)}{" "}
                                <span className="font-normal text-[#9ba8c0]">/ 1st yr</span>
                              </p>
                              {formatRenewalPrice(result) && (
                                <p className="text-[10px] text-[#5a6a85] font-medium">
                                  {formatRenewalPrice(result)}{" "}
                                  <span className="text-[#9ba8c0]">/ yr renewal</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* SSL cross-sell option */}
                          {result.available && hasItem(`domain:${result.domain}`) && (
                            <div className="mt-2 flex items-center">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={hasItem(`ssl:${result.domain}`)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      addSslItem({
                                        type: "SSL",
                                        domainName: result.domain,
                                        price: 10000,
                                      });
                                      toast.success(`SSL Certificate for ${result.domain} added to cart!`);
                                    } else {
                                      removeItem(`ssl:${result.domain}`);
                                      toast.info(`SSL Certificate for ${result.domain} removed.`);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-[#1787D4] border-[#dce4f7] rounded focus:ring-[#1787D4] accent-[#1787D4]"
                                />
                                <span className="text-[11px] text-[#5a6a85] font-medium flex items-center gap-1 hover:text-[#031033] transition-colors">
                                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                  Secure domain with SSL (+₦10,000/yr)
                                </span>
                              </label>
                            </div>
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
                                / 1st year
                              </p>
                              {formatRenewalPrice(result) && (
                                <p className="text-[11px] font-medium text-[#5a6a85] mt-0.5">
                                  {formatRenewalPrice(result)}{" "}
                                  <span className="text-[10px] text-[#9ba8c0]">/ yr renewal</span>
                                </p>
                              )}
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
                              className="py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          ) : (
                            <button
                              id={`domain-add-${result.domain.replace(".", "-")}`}
                              onClick={() => handleAddToCart(result)}
                              disabled={result.price.price == null}
                              className="btn-primary !rounded-[8px] py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-[#9ba8c0] font-medium px-4 py-2 bg-[#f6f8fc] rounded-lg">
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

      {/* ── 3 Steps Section ── */}
      <section className="bg-[#edf5ff] py-20 sm:py-24 border-t border-b border-[#e2edfc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#031033] tracking-tight">
              Get your domain in three simple steps
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e2edfc] flex-1 min-h-[200px] flex flex-col justify-start hover:shadow-[0_8px_30px_rgba(23,135,212,0.08)] transition-all">
              <span className="text-4xl sm:text-5xl font-black text-[#1787D4] tracking-tight">
                01
              </span>
              <div className="flex items-center gap-2.5 mt-5 mb-2.5">
                <Search className="w-5 h-5 text-[#1787D4] stroke-[2.5]" />
                <h3 className="text-lg font-bold text-[#031033]">Search</h3>
              </div>
              <p className="text-[#5a6a85] text-xs sm:text-sm leading-relaxed">
                Find a domain that represents your business.
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center text-[#1787D4] px-1 shrink-0">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e2edfc] flex-1 min-h-[200px] flex flex-col justify-start hover:shadow-[0_8px_30px_rgba(23,135,212,0.08)] transition-all">
              <span className="text-4xl sm:text-5xl font-black text-[#1787D4] tracking-tight">
                02
              </span>
              <div className="flex items-center gap-2.5 mt-5 mb-2.5">
                <CreditCard className="w-5 h-5 text-[#1787D4] stroke-[2.5]" />
                <h3 className="text-lg font-bold text-[#031033]">Register</h3>
              </div>
              <p className="text-[#5a6a85] text-xs sm:text-sm leading-relaxed">
                Choose your domain and complete your registration.
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center text-[#1787D4] px-1 shrink-0">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e2edfc] flex-1 min-h-[200px] flex flex-col justify-start hover:shadow-[0_8px_30px_rgba(23,135,212,0.08)] transition-all">
              <span className="text-4xl sm:text-5xl font-black text-[#1787D4] tracking-tight">
                03
              </span>
              <div className="flex items-center gap-2.5 mt-5 mb-2.5">
                <Zap className="w-5 h-5 text-[#1787D4] stroke-[2.5]" />
                <h3 className="text-lg font-bold text-[#031033]">Go Live</h3>
              </div>
              <p className="text-[#5a6a85] text-xs sm:text-sm leading-relaxed">
                Connect your domain to your website, email, or other Nupat services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Everything You Need Section ── */}
      <section className="bg-white pt-20 pb-0 sm:pt-24 sm:pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Column: Heading and 4 feature cards */}
            <div className="lg:col-span-8 pb-12 sm:pb-16 lg:pb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#031033] tracking-tight mb-10 sm:mb-12">
                Everything you need to manage your domain
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8eff8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/30 hover:shadow-[0_6px_20px_rgba(23,135,212,0.06)] transition-all flex flex-col justify-start">
                  <div className="w-10 h-10 rounded-xl bg-[#edf5ff] flex items-center justify-center mb-5 shrink-0">
                    <Search className="w-5 h-5 text-[#1787D4]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#031033] mb-2 leading-snug">
                    Easy<br />Registration
                  </h3>
                  <p className="text-[#5a6a85] text-xs leading-relaxed">
                    Search and register your domain in a few simple steps.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8eff8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/30 hover:shadow-[0_6px_20px_rgba(23,135,212,0.06)] transition-all flex flex-col justify-start">
                  <div className="w-10 h-10 rounded-xl bg-[#edf5ff] flex items-center justify-center mb-5 shrink-0">
                    <Shield className="w-5 h-5 text-[#1787D4]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#031033] mb-2 leading-snug">
                    Secure
                  </h3>
                  <p className="text-[#5a6a85] text-xs leading-relaxed">
                    Keep your domain protected with reliable infrastructure.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8eff8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/30 hover:shadow-[0_6px_20px_rgba(23,135,212,0.06)] transition-all flex flex-col justify-start">
                  <div className="w-10 h-10 rounded-xl bg-[#edf5ff] flex items-center justify-center mb-5 shrink-0">
                    <Settings className="w-5 h-5 text-[#1787D4]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#031033] mb-2 leading-snug">
                    Easy<br />Management
                  </h3>
                  <p className="text-[#5a6a85] text-xs leading-relaxed">
                    Manage your domain settings from one dashboard.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8eff8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/30 hover:shadow-[0_6px_20px_rgba(23,135,212,0.06)] transition-all flex flex-col justify-start">
                  <div className="w-10 h-10 rounded-xl bg-[#edf5ff] flex items-center justify-center mb-5 shrink-0">
                    <Globe className="w-5 h-5 text-[#1787D4]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#031033] mb-2 leading-snug">
                    Built for Africa
                  </h3>
                  <p className="text-[#5a6a85] text-xs leading-relaxed">
                    A digital platform designed around African businesses.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Man with yellow headphones and phone + Blue Circle */}
            <div className="lg:col-span-4 relative flex justify-center lg:justify-end items-end pt-8 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] flex items-end justify-center">
                {/* Large Blue Circle Backdrop */}
                <div className="absolute w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] lg:w-[370px] lg:h-[370px] rounded-full bg-[#1787D4] -z-0 top-[8%] right-[5%] sm:right-[8%]" />

                {/* Person Image */}
                <Image
                  src="/domain-2.png"
                  alt="Everything you need to manage your domain"
                  width={736}
                  height={736}
                  className="w-full h-auto object-contain relative z-10 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Choose a Domain Section ── */}
      <section className="bg-[#fff8f2] py-20 sm:py-24 border-t border-b border-[#fceee1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#031033] tracking-tight">
              Choose a domain that fits your brand
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              {
                ext: ".COM",
                tld: ".com",
                desc: "For businesses worldwide",
              },
              {
                ext: ".NG",
                tld: ".ng",
                desc: "For businesses in Nigeria",
              },
              {
                ext: ".AFRICA",
                tld: ".africa",
                desc: "For brands representing Africa",
              },
              {
                ext: ".CO",
                tld: ".co",
                desc: "For companies and startups",
              },
              {
                ext: ".AI",
                tld: ".ai",
                desc: "For AI and technology brands",
              },
            ].map((item) => (
              <div
                key={item.ext}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-[#f5e6d8]/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#1787D4]/40 hover:shadow-[0_8px_25px_rgba(23,135,212,0.08)] transition-all flex flex-col justify-between min-h-[210px] group"
              >
                <div>
                  <h3 className="text-3xl font-black text-[#1787D4] tracking-tight">
                    {item.ext}
                  </h3>
                  <p className="text-[#5a6a85] text-xs sm:text-sm mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRegisterClick(item.tld)}
                    className="text-[#1787D4] hover:text-[#1370B5] font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all mt-8 group-hover:gap-2.5 cursor-pointer"
                  >
                    Register now <span className="text-base leading-none">&gt;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ready to Claim Banner & FAQ Section ── */}
      <section className="bg-white pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Orange CTA Banner Card */}
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 lg:p-16 text-center shadow-xl bg-gradient-to-r from-[#ff5e00] via-[#ff7800] to-[#ffa000]">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight">
              Ready to claim your domain?
            </h2>
            <p className="text-white/95 text-sm sm:text-base font-normal mt-3 max-w-xl mx-auto">
              Find your perfect domain and start building your digital presence today.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={scrollToSearch}
                className="bg-white hover:bg-gray-50 text-[#1787D4] font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center"
              >
                Search Domain
              </button>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-20 sm:mt-24">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#031033] tracking-tight text-center mb-12 sm:mb-14">
              Frequently asked questions
            </h2>

            <div className="max-w-3xl mx-auto border border-[#e2edfc] rounded-xl bg-white divide-y divide-[#e2edfc] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              {[
                {
                  q: "How do I register a domain with Nupat?",
                  a: "Registering is incredibly simple. Just use our search tool to find your desired domain, select it, configure your checkout preferences, and complete your payment. Your domain will be registered and active within minutes.",
                },
                {
                  q: "How long does domain registration take?",
                  a: "Most domain registrations are processed instantly. Once your payment is confirmed, your domain will typically be active and ready to use within a few minutes.",
                },
                {
                  q: "Can I transfer my existing domain to Nupat?",
                  a: "Yes! You can transfer your existing domains to Nupat easily from your previous registrar with zero downtime.",
                },
                {
                  q: "Can I use my Nupat domain for email?",
                  a: "Absolutely. You can connect your domain to custom email hosting or Google Workspace / Microsoft 365 directly from your Nupat dashboard.",
                },
                {
                  q: "How do I renew my domain?",
                  a: "Domains can be renewed manually at any time through your dashboard or set to auto-renew so you never risk losing your domain.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left py-5 px-6 sm:px-7 flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#031033] group-hover:text-[#1787D4] transition-colors">
                      {faq.q}
                    </span>
                    <span className="shrink-0 text-[#1787D4]">
                      {openFaq === idx ? (
                        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 sm:px-7 pb-6 pt-0">
                      <p className="text-[#5a6a85] text-xs sm:text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
