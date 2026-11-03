"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  XCircle,
  ArrowRight,
  Globe,
  Shield,
  ShoppingCart,
  Trash2,
  CreditCard,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  searchDomains,
  suggestDomains,
  extractAlternativeDomainNames,
  DomainResult,
} from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { formatApiPrice } from "@/lib/formatPrice";
import { useGetSslProducts } from "@/hooks/useSsl";
import { toast } from "sonner";

const extensionInfo: Record<string, { desc: string; popular: boolean }> = {
  "com": { desc: "For businesses and startups selling worldwide.", popular: true },
  "net": { desc: "Great for tech-focused projects.", popular: false },
  "org": { desc: "For organisations and non-profits.", popular: false },
  "io": { desc: "Popular with tech startups and SaaS.", popular: false },
  "co": { desc: "A short alternative to .com.", popular: false },
  "info": { desc: "For informational websites, blogs and directories.", popular: false },
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
  const [suggestedAlternativeNames, setSuggestedAlternativeNames] = useState<string[]>([]);

  const { addDomainItem, addSslItem, removeItem, hasItem } = useCartStore();

  // Fetch real SSL pricing — Positive SSL (id:41) 1-year price; hook returns [] when unauthenticated.
  // null when not loaded, in which case the SSL upsell is hidden instead of showing a made-up price.
  const { data: sslProducts } = useGetSslProducts();
  const positiveSsl = (sslProducts ?? []).find((p: { id: number }) => p.id === 41);
  const positiveSslYear = positiveSsl?.prices?.find((p: { period: number }) => p.period === 1);
  const positiveSslPrice: number | null = positiveSslYear?.price ?? positiveSsl?.price ?? null;
  const positiveSslCurrency = positiveSslYear?.currency ?? positiveSsl?.currency ?? null;

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setState("searching");
    setResults([]);
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
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
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
      action: { label: "View cart", onClick: () => window.location.href = "/cart" },
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

  // Prices are shown in the currency the API returns (NGN for domain search).
  const formatPrice = (r: DomainResult) => {
    if (r.price.price == null) return "—";
    return formatApiPrice(r.price.price, r.price.currency);
  };

  const formatRenewalPrice = (r: DomainResult) => {
    if (r.renewalPrice?.price == null) return null;
    return formatApiPrice(r.renewalPrice.price, r.renewalPrice.currency);
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

  const primaryBtn =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1787D4] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 cursor-pointer";

  const steps = [
    { icon: Search, title: "Search", desc: "Find a domain that represents your business." },
    { icon: CreditCard, title: "Register", desc: "Choose your domain and complete your registration." },
    { icon: Zap, title: "Go live", desc: "Connect your domain to your website or other Nupat services." },
  ];

  const features = [
    { icon: Search, title: "Easy registration", desc: "Search and register your domain in a few steps." },
    { icon: Shield, title: "Secure", desc: "Keep your domain protected on reliable infrastructure." },
    { icon: Settings, title: "Easy management", desc: "Manage your domain settings from one dashboard." },
    { icon: Globe, title: "Built for Africa", desc: "A platform designed around African businesses." },
  ];

  const extensions = [
    { tld: ".com", desc: "For businesses worldwide" },
    { tld: ".ng", desc: "For businesses in Nigeria" },
    { tld: ".africa", desc: "For brands representing Africa" },
    { tld: ".co", desc: "For companies and startups" },
    { tld: ".ai", desc: "For AI and technology brands" },
  ];

  const faqs = [
    {
      q: "How do I register a domain with Nupat?",
      a: "Use the search above to find the domain you want, add it to your cart and complete payment. Your domain is registered and active within minutes.",
    },
    {
      q: "How long does domain registration take?",
      a: "Most registrations are processed straight away. Once your payment is confirmed, your domain is usually active and ready to use within a few minutes.",
    },
    {
      q: "Can I transfer my existing domain to Nupat?",
      a: "Yes. You can transfer domains from your previous registrar to Nupat without any downtime.",
    },
    {
      q: "How do I renew my domain?",
      a: "Renew manually at any time from your dashboard, or turn on auto-renew so your domain never lapses.",
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-left z-10">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#031033] max-w-xl">
                Find the right domain for your business
              </h1>
              <p className="mt-4 text-lg text-[#5A6A85] leading-relaxed max-w-lg">
                Search, register and secure your domain with Nupat. Get your business online with
                a domain that is easy to manage and ready to grow with you.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={scrollToSearch}
                  id="hero-search-btn"
                  className={primaryBtn}
                >
                  Search domains
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-[540px] lg:max-w-[620px]">
                <Image
                  src="/domain.png"
                  alt="Business owner choosing a domain name"
                  width={1536}
                  height={1024}
                  priority
                  sizes="(min-width: 1024px) 620px, (min-width: 640px) 540px, 100vw"
                  className="w-full h-auto object-contain -scale-x-100 select-none pointer-events-none mix-blend-multiply"
                />

                <div className="absolute bottom-[14%] left-[24%] sm:left-[28%]">
                  <div className="bg-white text-[#031033] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-[#E2E8F0] -rotate-[6deg] flex items-center select-none">
                    yourbusiness.com
                  </div>
                </div>

                <div className="absolute top-[46%] right-[1%] sm:right-[3%]">
                  <div className="bg-white text-[#031033] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border-2 border-[#1787D4] rotate-[5deg] flex items-center select-none">
                    yourbusiness.ng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section
        id="domain-search-section"
        className="bg-[#F2F5FC] py-16 sm:py-24 border-t border-[#E2E8F0] relative scroll-mt-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
            Your name starts here
          </h2>
          <p className="mt-3 text-lg text-[#5A6A85] max-w-xl mx-auto">
            Search thousands of domain names and find the right one for your brand.
          </p>

          <form onSubmit={handleSearch} id="domain-search-form" className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-lg border border-[#D5DCE6] focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/20 transition-colors p-1.5 sm:p-2">
              <div className="pl-3 sm:pl-4 pr-1 shrink-0">
                <Search className="w-5 h-5 text-[#5A6A85]" aria-hidden="true" />
              </div>
              <label htmlFor="domain-search-input" className="sr-only">
                Domain name
              </label>
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
                placeholder="Search for your domain"
                className="flex-1 bg-transparent py-2.5 px-3 text-[#031033] placeholder-[#5A6A85]/70 text-base outline-none min-w-0"
              />
              <button
                id="domain-search-btn"
                type="submit"
                disabled={state === "searching"}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1787D4] px-5 sm:px-6 text-sm font-medium text-white hover:bg-[#1370B5] transition-colors shrink-0 disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                {state === "searching" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    <span>Searching</span>
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[".com", ".ng", ".africa", ".co", ".io"].map((tld) => (
              <button
                key={tld}
                type="button"
                id={`tld-pill-${tld.replace(".", "")}`}
                onClick={() => handleTldClick(tld)}
                className="bg-white hover:bg-[#E8F4FC] border border-[#D5DCE6] text-[#1787D4] font-medium text-sm px-4 py-1.5 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                {tld}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-[#5A6A85]">
            Looking to transfer an existing domain?{" "}
            <Link
              href={`/dashboard/domain-transfer${query.trim() ? `?domain=${encodeURIComponent(query.trim())}` : ""}`}
              id="domain-transfer-link"
              className="text-[#1787D4] hover:text-[#1370B5] font-medium hover:underline transition-colors"
            >
              Transfer it here
            </Link>
          </div>

          {state === "searching" && (
            <div className="mt-8 bg-white rounded-xl p-5 border border-[#E2E8F0] flex items-center justify-center gap-3 max-w-2xl mx-auto">
              <div className="w-5 h-5 rounded-full border-2 border-[#1787D4] border-t-transparent animate-spin" />
              <span className="text-[#5A6A85] text-sm">
                Checking availability for{" "}
                <span className="text-[#031033] font-semibold">{query}</span> across all
                extensions
              </span>
            </div>
          )}

          {state === "error" && (
            <div className="mt-8 bg-white rounded-xl p-5 border border-[#DC2626]/30 flex items-center justify-center gap-3 max-w-2xl mx-auto">
              <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" aria-hidden="true" />
              <span className="text-[#DC2626] text-sm">{errorMsg}</span>
            </div>
          )}

          {state === "done" && results.length > 0 && (
            <div className="mt-8 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden text-left max-w-3xl mx-auto">
              <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[#E2E8F0]">
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
                      type="button"
                      id={`domain-filter-${tab.key}`}
                      onClick={() => setFilter(tab.key)}
                      aria-pressed={filter === tab.key}
                      className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        filter === tab.key
                          ? "border-[#1787D4] text-[#1787D4]"
                          : "border-transparent text-[#5A6A85] hover:text-[#031033]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {displayed.map((result) => {
                  const tld = getTLD(result.domain);
                  const info = extensionInfo[tld];
                  return (
                    <div
                      key={result.domain}
                      id={`domain-result-${result.domain.replace(".", "-")}`}
                      className="flex items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[#F2F5FC]/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-semibold text-base truncate ${
                                result.available ? "text-[#031033]" : "text-[#5A6A85]"
                              }`}
                            >
                              {result.domain}
                            </span>
                            {info?.popular && (
                              <span className="text-xs bg-[#FFF8EE] text-[#031033] px-2 py-0.5 rounded-full font-medium shrink-0">
                                Popular
                              </span>
                            )}
                            {result.isPremium && (
                              <span className="text-xs bg-[#E8F4FC] text-[#1787D4] px-2 py-0.5 rounded-full font-medium shrink-0">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                result.available ? "bg-[#12A150]" : "bg-[#5A6A85]/50"
                              }`}
                              aria-hidden="true"
                            />
                            <span className={result.available ? "text-[#0E7C3A]" : "text-[#5A6A85]"}>
                              {result.available ? "Available" : "Taken"}
                            </span>
                          </div>
                          {result.price.price != null && (
                            <div className="sm:hidden mt-1">
                              <p
                                className={`text-xs font-semibold ${
                                  result.available ? "text-[#031033]" : "text-[#5A6A85]"
                                }`}
                              >
                                {formatPrice(result)}{" "}
                                <span className="font-normal text-[#5A6A85]">/ first year</span>
                              </p>
                              {formatRenewalPrice(result) && (
                                <p className="text-xs text-[#5A6A85]">
                                  {formatRenewalPrice(result)} / year to renew
                                </p>
                              )}
                            </div>
                          )}

                          {result.available && positiveSslPrice != null && hasItem(`domain:${result.domain}`) && (
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
                                        price: positiveSslPrice,
                                        productId: 41,
                                        period: 1,
                                        productName: "Positive SSL",
                                      });
                                      toast.success(`Positive SSL added for ${result.domain}`);
                                    } else {
                                      removeItem(`ssl:${result.domain}`);
                                      toast.info(`SSL removed for ${result.domain}`);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-[#D5DCE6] accent-[#1787D4] focus:ring-[#1787D4]"
                                />
                                <span className="text-xs text-[#5A6A85] font-medium flex items-center gap-1 hover:text-[#031033] transition-colors">
                                  <Shield className="w-4 h-4 text-[#12A150]" aria-hidden="true" />
                                  Add SSL certificate (+{formatApiPrice(positiveSslPrice, positiveSslCurrency)}/yr)
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          {result.price.price != null ? (
                            <>
                              <p
                                className={`font-semibold text-sm tabular-nums ${
                                  result.available ? "text-[#031033]" : "text-[#5A6A85]"
                                }`}
                              >
                                {formatPrice(result)}
                              </p>
                              <p className="text-xs text-[#5A6A85]">first year</p>
                              {formatRenewalPrice(result) && (
                                <p className="text-xs text-[#5A6A85] mt-0.5 tabular-nums">
                                  {formatRenewalPrice(result)} / year to renew
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-[#5A6A85]">—</p>
                          )}
                        </div>
                        {result.available &&
                          (hasItem(`domain:${result.domain}`) ? (
                            <button
                              type="button"
                              id={`domain-remove-${result.domain.replace(".", "-")}`}
                              onClick={() => handleRemoveFromCart(result.domain)}
                              className="inline-flex h-9 items-center gap-1.5 px-4 text-sm font-medium border border-[#D5DCE6] bg-white text-[#DC2626] hover:bg-[#F2F5FC] transition-colors rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              id={`domain-add-${result.domain.replace(".", "-")}`}
                              onClick={() => handleAddToCart(result)}
                              disabled={result.price.price == null}
                              className="inline-flex h-9 items-center gap-1.5 px-4 text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors rounded-lg shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                            >
                              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                              Add
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {displayed.length === 0 && (
                <div className="py-10 text-center text-[#5A6A85] text-sm">
                  No domains match this filter.
                </div>
              )}

              {suggestedAlternativeNames.length > 0 && (
                <div className="p-5 bg-[#F2F5FC] border-t border-[#E2E8F0]">
                  <h3 className="text-sm font-semibold text-[#031033] mb-3">Other names to try</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestedAlternativeNames.slice(0, 8).map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => {
                          const newTerm = `${alt}.com`;
                          setQuery(newTerm);
                          executeSearch(newTerm);
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white hover:bg-[#E8F4FC] text-[#1787D4] border border-[#D5DCE6] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                      >
                        <span>{alt}</span>
                        <span className="text-[#5A6A85] font-normal">.com</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#E8F4FC] py-16 sm:py-24 border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Get your domain in three steps
            </h2>
          </div>

          <ol className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Fragment key={step.title}>
                  <li className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E8F0] flex-1 min-h-[180px] flex flex-col justify-start">
                    <Icon className="w-6 h-6 text-[#1787D4]" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-[#031033] mt-5 mb-2">
                      <span className="text-[#1787D4]">{idx + 1}.</span> {step.title}
                    </h3>
                    <p className="text-[#5A6A85] text-sm leading-relaxed">{step.desc}</p>
                  </li>
                  {idx < steps.length - 1 && (
                    <li
                      className="hidden lg:flex items-center justify-center text-[#1787D4] px-1 shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Domain management features */}
      <section className="bg-white pt-16 sm:pt-24 pb-0 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 pb-10 sm:pb-14 lg:pb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-8 sm:mb-10">
                Everything you need to manage your domain
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                {features.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.title}
                      className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] flex flex-col justify-start"
                    >
                      <Icon className="w-6 h-6 text-[#1787D4] mb-5 shrink-0" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-[#031033] mb-1.5 leading-snug">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-[#5A6A85] leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 relative flex justify-center lg:justify-end items-end pt-8 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] flex items-end justify-center">
                <div
                  className="absolute w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] lg:w-[370px] lg:h-[370px] rounded-full bg-[#1787D4] top-[8%] right-[5%] sm:right-[8%]"
                  aria-hidden="true"
                />
                <Image
                  src="/domain-2.png"
                  alt="Man with headphones managing his domain on a phone"
                  width={736}
                  height={736}
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 380px, 340px"
                  className="w-full h-auto object-contain relative z-10 select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extensions */}
      <section className="bg-[#FFF8EE] py-16 sm:py-24 border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Choose a domain that fits your brand
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {extensions.map((item) => (
              <div
                key={item.tld}
                className="bg-white rounded-xl p-6 border border-[#E2E8F0] flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <h3 className="text-3xl font-semibold text-[#1787D4]">{item.tld}</h3>
                  <p className="text-[#5A6A85] text-sm mt-3 leading-relaxed">{item.desc}</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRegisterClick(item.tld)}
                    className="text-[#1787D4] hover:text-[#1370B5] font-medium text-sm inline-flex items-center gap-1.5 transition-colors mt-8 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
                  >
                    Register {item.tld}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA and FAQ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl overflow-hidden p-8 sm:p-12 lg:p-14 text-center bg-[#031033]">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Ready to claim your domain?
            </h2>
            <p className="text-white/70 text-lg mt-3 max-w-xl mx-auto">
              Search for your name now and start building your business online today.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={scrollToSearch}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
              >
                Search domains
              </button>
            </div>
          </div>

          <div className="mt-16 sm:mt-24">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] text-center mb-10 sm:mb-12">
              Frequently asked questions
            </h2>

            <div className="max-w-3xl mx-auto border border-[#E2E8F0] rounded-xl bg-white divide-y divide-[#E2E8F0] overflow-hidden">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`domain-faq-${idx}`}
                      className="w-full text-left py-5 px-6 flex items-center justify-between gap-4 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1787D4]"
                    >
                      <span className="font-semibold text-base text-[#031033] group-hover:text-[#1787D4] transition-colors">
                        {faq.q}
                      </span>
                      <span className="shrink-0 text-[#1787D4]">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-5 h-5" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div id={`domain-faq-${idx}`} className="px-6 pb-6 pt-0">
                        <p className="text-[#5A6A85] text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
