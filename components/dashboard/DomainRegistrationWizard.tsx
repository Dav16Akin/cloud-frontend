"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Globe,
  CheckCircle2,
  XCircle,
  Shield,
  Lightbulb,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Lock,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  searchDomains,
  suggestDomains,
  extractAlternativeDomainNames,
  initializeCartPayment,
  type DomainResult,
  type BackendCartItem,
} from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useGetMe } from "@/hooks/useUser";
import { useGetSslProducts } from "@/hooks/useSsl";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface DomainRegistrationWizardProps {
  onBackToDomains?: () => void;
  initialQuery?: string;
  initialStep?: Step;
}

export default function DomainRegistrationWizard({
  onBackToDomains,
  initialQuery = "",
  initialStep = 1,
}: DomainRegistrationWizardProps) {
  const router = useRouter();
  const { addDomainItem, addSslItem } = useCartStore();
  const { data: meData } = useGetMe();
  const userProfile = meData?.data;

  // Real SSL pricing from backend
  const { data: sslProducts } = useGetSslProducts();
  const positiveSslPrice = (() => {
    const prod = sslProducts?.find?.((p: { id: number }) => p.id === 41);
    return (
      prod?.prices?.find?.((p: { period: number }) => p.period === 1)?.price ??
      prod?.price ??
      0
    );
  })();

  // Wizard Step:
  // 1 = Search
  // 2 = Select & Configure ("Choose your domain" -> "Your domain is ready")
  // 3 = Details ("Set up your domain" - Contact & Registrant info)
  // 4 = Review ("Review your order")
  // 5 = Payment ("Complete your payment" - Paystack direct checkout)
  // 6 = Done ("Your domain is registered!" - Order Completed)
  const [currentStep, setCurrentStep] = useState<Step>(initialStep);

  // Sub-step for Step 2: "list" shows search results; "ready" shows the "Your domain is ready" configuration card
  const [step2View, setStep2View] = useState<"list" | "ready">("list");

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Real API search results
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<DomainResult | null>(
    null,
  );

  // Suggested alternative names from backend suggest API
  const [suggestedAlternativeNames, setSuggestedAlternativeNames] = useState<
    string[]
  >([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // ── Configuration State (from "Your domain is ready" screen) ───────────
  const termYears = 1;
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  const [privacyProtection, setPrivacyProtection] = useState<boolean>(true);
  const [includeSsl, setIncludeSsl] = useState<boolean>(false);

  // ── Contact & Registrant Info (Step 3: Details) ─────────────────────────
  const [useAccountInfo, setUseAccountInfo] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [organization, setOrganization] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");

  // Auto-fill from account info when logged in
  useEffect(() => {
    if (useAccountInfo && userProfile) {
      if (userProfile.firstName) setFirstName(userProfile.firstName);
      if (userProfile.lastName) setLastName(userProfile.lastName);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phoneNumber) setPhone(userProfile.phoneNumber);
      if (userProfile.companyName) setOrganization(userProfile.companyName);
      const addr = [userProfile.houseNumber, userProfile.address]
        .filter(Boolean)
        .join(" ");
      if (addr) setStreetAddress(addr);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.state) setState(userProfile.state);
      if (userProfile.postcode) setPostalCode(userProfile.postcode);
      if (userProfile.country) setCountry(userProfile.country);
    }
  }, [useAccountInfo, userProfile]);

  // Step 4: Review Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Step 5: Direct Paystack redirect state
  const [isRedirectingToPaystack, setIsRedirectingToPaystack] = useState(false);

  // Parse root keyword from query
  const cleanKeyword = (query: string) => {
    let q = query.trim().toLowerCase();
    if (q.startsWith("http://")) q = q.slice(7);
    if (q.startsWith("https://")) q = q.slice(8);
    if (q.startsWith("www.")) q = q.slice(4);
    const dot = q.indexOf(".");
    return dot !== -1 ? q.slice(0, dot) : q;
  };

  // Perform search using the real backend API
  const handlePerformSearch = async (termToSearch?: string) => {
    const raw = (
      termToSearch !== undefined ? termToSearch : searchQuery
    ).trim();
    if (!raw) {
      toast.error("Please enter a domain name to search.");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    const baseWord = cleanKeyword(raw);

    setIsFetchingSuggestions(true);
    suggestDomains({
      term: baseWord,
      extensions: ["com", "net", "org"],
    })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const names = extractAlternativeDomainNames(res.data, baseWord);
          setSuggestedAlternativeNames(names);
        } else {
          setSuggestedAlternativeNames([]);
        }
      })
      .catch(() => {
        setSuggestedAlternativeNames([]);
      })
      .finally(() => {
        setIsFetchingSuggestions(false);
      });

    try {
      const res = await searchDomains(raw);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setSearchResults(res.data);

        const exactMatch = res.data.find(
          (d) => d.domain.toLowerCase() === raw.toLowerCase(),
        );
        const comMatch = res.data.find(
          (d) => d.domain.toLowerCase() === `${cleanKeyword(raw)}.com`,
        );
        const chosen = exactMatch || comMatch || res.data[0];

        setSelectedResult(chosen);
        if (exactMatch && exactMatch.available) {
          setStep2View("ready");
        } else {
          setStep2View("list");
        }
        setCurrentStep(2);
      } else {
        setSearchResults([]);
        setSearchError(
          "No domain results found from the server. Try a different name.",
        );
        setStep2View("list");
        setCurrentStep(2);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to query domain availability.";
      setSearchError(msg);
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a domain from Step 2 list -> transition to "Your domain is ready" configuration view
  const handleSelectDomain = (result: DomainResult) => {
    setSelectedResult(result);
    setStep2View("ready");
  };

  // Date formatting helpers
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getExpiryDateFormatted = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculations
  const selectedDomainName = selectedResult?.domain || searchQuery || "";
  const unitPrice = selectedResult?.price?.price ?? 0;
  const domainSubtotal = unitPrice * termYears;
  const sslSubtotal = includeSsl ? positiveSslPrice * termYears : 0;
  const grandTotal = domainSubtotal + sslSubtotal;

  // Filter out primary result from other results in Step 2 list
  const primaryResult = selectedResult || searchResults[0] || null;
  const otherAvailable = searchResults.filter(
    (r) => r.available && r.domain !== primaryResult?.domain,
  );
  const unavailableList = searchResults.filter(
    (r) => !r.available && r.domain !== primaryResult?.domain,
  );

  const baseKeyword = cleanKeyword(searchQuery) || "domain";
  const targetExtension = searchQuery.includes(".")
    ? searchQuery.split(".").slice(1).join(".")
    : "com";

  const accountTag = userProfile?.email
    ? userProfile.email.split("@")[0]
    : [firstName.toLowerCase(), lastName.toLowerCase()].filter(Boolean).join(".") || "user";

  // ── Paystack Direct Checkout ──────────────────────────────────────────────
  const handlePaystackCheckout = async () => {
    if (!selectedResult) {
      toast.error("Please select a domain first.");
      return;
    }

    setIsRedirectingToPaystack(true);

    try {
      const domain = selectedResult.domain;
      const dotIdx = domain.indexOf(".");
      const domainName = dotIdx !== -1 ? domain.slice(0, dotIdx) : domain;
      const extension = dotIdx !== -1 ? domain.slice(dotIdx + 1) : "com";

      // Also persist to local cart store so user has record
      addDomainItem({
        type: "DOMAIN",
        domainName,
        extension,
        price: domainSubtotal,
        currency: selectedResult.price?.currency || "NGN",
        isPremium: selectedResult.isPremium ?? false,
      });

      if (includeSsl) {
        addSslItem({
          type: "SSL",
          domainName: domain,
          price: sslSubtotal,
          productId: 41,
          period: termYears,
          productName: "PositiveSSL Certificate",
        });
      }

      // Map to real backend items for POST /orders/initialize
      const backendItems: BackendCartItem[] = [
        {
          type: "DOMAIN",
          domainName,
          extension,
        },
      ];

      if (includeSsl) {
        backendItems.push({
          type: "SSL",
          domainName: domain,
          productId: 41,
          period: termYears,
        });
      }

      // Call real backend endpoint to get official Paystack authorization URL
      const res = await initializeCartPayment({ items: backendItems });

      if (res?.data?.paymentUrl) {
        sessionStorage.setItem("cart_order_ref", res.data.reference);
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error(
          res?.message || "No payment URL returned from server.",
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Payment initialisation failed. Please try again.";
      toast.error(msg);
      setIsRedirectingToPaystack(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Breadcrumb / Back Link ───────────────────────────────── */}
      <div>
        {currentStep === 1 && (
          <button
            type="button"
            onClick={onBackToDomains}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to domains
          </button>
        )}
        {currentStep === 2 && step2View === "list" && (
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </button>
        )}
        {currentStep === 2 && step2View === "ready" && (
          <button
            type="button"
            onClick={() => setStep2View("list")}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to domains
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={() => {
              setCurrentStep(2);
              setStep2View("ready");
            }}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to domains
          </button>
        )}
        {currentStep === 4 && (
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to details
          </button>
        )}
        {currentStep === 5 && (
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to review
          </button>
        )}
        {currentStep === 6 && (
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setStep2View("list");
            }}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to registration
          </button>
        )}
      </div>

      {/* ── Title and Subtitle ────────────────────────────────────────── */}
      <div>
        <h1
          className="text-[24px] sm:text-[26px] font-bold text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          {currentStep === 1 && "Find your perfect domain"}
          {currentStep === 2 &&
            (step2View === "list"
              ? "Choose your domain"
              : "Your domain is ready")}
          {currentStep === 3 && "Set up your domain"}
          {currentStep === 4 && "Review your order"}
          {currentStep === 5 && "Complete your payment"}
          {currentStep === 6 && "Your domain is registered!"}
        </h1>
        <p className="text-[14px] text-[#6e6e73] mt-1">
          {currentStep === 1 &&
            "Search for a domain name that represents your business, brand, or next idea."}
          {currentStep === 2 &&
            (step2View === "list"
              ? searchResults.length > 0
                ? `Great news — we found available options for ${baseKeyword}.`
                : `Review options for ${baseKeyword}.`
              : `Confirm the registration term and protection settings for ${selectedDomainName}.`)}
          {currentStep === 3 &&
            `Add the contact information required to register ${selectedDomainName}.`}
          {currentStep === 4 &&
            "Check your domain, registrant details, and final pricing before payment."}
          {currentStep === 5 &&
            "Choose a payment method and securely complete your domain registration."}
          {currentStep === 6 &&
            `${selectedDomainName} is now active and ready for your next idea.`}
        </p>
      </div>

      {/* ── Horizontal Stepper (6 Steps matching Figma design) ────────── */}
      <div className="w-full bg-white rounded-lg border border-[#e8e8ed] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {[
            { num: 1, label: "Search" },
            { num: 2, label: "Select" },
            { num: 3, label: "Details" },
            { num: 4, label: "Review" },
            { num: 5, label: "Payment" },
            { num: 6, label: "Done" },
          ].map((s, idx, arr) => {
            const isCompleted = currentStep > s.num;
            const isActive = currentStep === s.num;

            return (
              <div
                key={s.num}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                          ? "bg-[#1787D4] text-white"
                          : "bg-[#e5e7eb] text-[#6b7280]"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </div>
                  <span
                    className={`text-[13px] font-medium whitespace-nowrap hidden sm:inline ${
                      isActive
                        ? "text-[#1787D4] font-semibold"
                        : isCompleted
                          ? "text-[#1d1d1f]"
                          : "text-[#9ca3af]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-3 transition-colors ${
                      isCompleted ? "bg-[#1787D4]" : "bg-[#e5e7eb]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 1: SEARCH PAGE
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6 w-full">
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-6 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4 mb-6">
              <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-blue-50 text-[#1787D4] shrink-0">
                <Globe className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-[17px] font-bold text-[#1d1d1f]">
                  Start with a name you love
                </h3>
                <p className="text-[13.5px] text-[#6e6e73] mt-0.5">
                  We&apos;ll check availability across popular extensions in
                  seconds.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch();
              }}
              className="flex flex-col gap-2"
            >
              <label
                htmlFor="domain-search-input"
                className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider"
              >
                Domain name
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="yourbusiness.com"
                    autoComplete="off"
                    className="w-full h-12 px-4 rounded-lg border border-[#d1d5db] bg-white text-[15px] font-medium text-[#1d1d1f] placeholder-[#9ca3af] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="h-12 px-8 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              <p className="text-[12px] text-[#6e6e73] mt-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Tip: Keep it short, memorable, and easy to spell.</span>
              </p>
            </form>
          </div>

          {/* Popular Extensions Cards */}
          <div>
            <h4 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3">
              Popular extensions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { ext: ".com", desc: "Global presence" },
                { ext: ".ng", desc: "Nigeria top-level" },
                { ext: ".co", desc: "Crisp alternative" },
                { ext: ".africa", desc: "Pan-African identity" },
              ].map((item) => (
                <button
                  key={item.ext}
                  type="button"
                  onClick={() => {
                    const clean = cleanKeyword(searchQuery);
                    if (clean) {
                      const domain = `${clean}${item.ext}`;
                      setSearchQuery(domain);
                      handlePerformSearch(domain);
                    } else {
                      document.getElementById("domain-search-input")?.focus();
                      toast.info(
                        `Type your business name to search with ${item.ext}`,
                      );
                    }
                  }}
                  className="bg-white border border-[#e8e8ed] hover:border-[#1787D4] hover:shadow-xs p-4 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <p className="text-[16px] font-bold text-[#1d1d1f] group-hover:text-[#1787D4] transition-colors">
                    {item.ext}
                  </p>
                  <p className="text-[12px] text-[#6e6e73] mt-0.5">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 2: SELECT DOMAIN OR "YOUR DOMAIN IS READY"
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && step2View === "list" && (
        <div className="flex flex-col gap-6 w-full">
          {/* Search Again Bar */}
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-4 sm:p-5 shadow-2xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="yourbusiness.com"
                  autoComplete="off"
                  className="w-full h-11 px-4 rounded-lg border border-[#d1d5db] bg-white text-[14px] font-medium text-[#1d1d1f] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="h-11 px-6 rounded-lg font-semibold text-white text-[13px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching…
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>

          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column (8 cols): Primary result & other available extensions */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {primaryResult && (
                <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {primaryResult.available ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[18px] font-bold text-[#1d1d1f] truncate">
                          {primaryResult.domain}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            primaryResult.available
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {primaryResult.available
                            ? "Available"
                            : "Unavailable"}
                        </span>
                        {primaryResult.isPremium && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <Sparkles className="w-2.5 h-2.5" /> Premium
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#6e6e73] mt-1">
                        {primaryResult.available
                          ? "A trusted, global address for your business."
                          : "This domain is taken. Check other available extensions below."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f0f3]">
                    <div>
                      <span className="text-[18px] font-bold text-[#1d1d1f] block text-right">
                        {primaryResult.price?.price != null
                          ? `₦${primaryResult.price.price.toLocaleString()}`
                          : "—"}
                      </span>
                      <span className="text-[11px] text-[#8a9bb2] block text-right">
                        for the first year
                      </span>
                    </div>
                    {primaryResult.available ? (
                      <button
                        type="button"
                        onClick={() => handleSelectDomain(primaryResult)}
                        className="px-5 py-2.5 rounded-lg font-semibold text-white text-[13px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        Select & Continue
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500">
                        Taken
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Other Available Extensions */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-[#1d1d1f]">
                  Other available extensions
                </h4>

                {otherAvailable.length === 0 ? (
                  <div className="p-6 bg-white rounded-lg border border-[#e8e8ed] text-center text-sm text-[#8a9bb2]">
                    No other extensions found available for this keyword.
                  </div>
                ) : (
                  <div className="w-full bg-white rounded-lg border border-[#e8e8ed] divide-y divide-[#f0f0f3] overflow-hidden shadow-2xs">
                    {otherAvailable.map((item) => (
                      <div
                        key={item.domain}
                        className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-[15px] font-bold text-[#1d1d1f] block truncate">
                            {item.domain}
                          </span>
                          <span className="text-[12px] text-[#8a9bb2] block mt-0.5">
                            {item.isPremium
                              ? "Premium extension"
                              : "Verified available"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[14px] font-bold text-[#1d1d1f]">
                            {item.price?.price != null
                              ? `₦${item.price.price.toLocaleString()}`
                              : "—"}{" "}
                            <span className="text-[11.5px] font-normal text-[#8a9bb2]">
                              /yr
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectDomain(item)}
                            className="px-4 py-1.5 rounded-lg border border-[#1787D4] text-[#1787D4] hover:bg-[#1787D4] hover:text-white transition-all text-[12.5px] font-semibold cursor-pointer active:scale-95"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Unavailable & Suggestions */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {(unavailableList.length > 0 || !primaryResult?.available) && (
                <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 shadow-2xs">
                  <div className="flex items-start gap-2.5 pb-3 border-b border-[#f0f0f3]">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[14px] font-bold text-[#1d1d1f]">
                        {!primaryResult?.available
                          ? primaryResult?.domain
                          : unavailableList[0]?.domain}
                      </p>
                      <p className="text-[11.5px] text-red-500 font-medium">
                        This name is unavailable
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-semibold text-[#1d1d1f]">
                        Suggested Alternative Names:
                      </p>
                      {isFetchingSuggestions && (
                        <Loader2 className="w-3 h-3 animate-spin text-[#1787D4]" />
                      )}
                    </div>
                    {suggestedAlternativeNames.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {suggestedAlternativeNames
                          .slice(0, 6)
                          .map((altName) => {
                            const fullSuggestedDomain = `${altName}.${targetExtension}`;
                            return (
                              <button
                                key={altName}
                                type="button"
                                onClick={() => {
                                  setSearchQuery(fullSuggestedDomain);
                                  handlePerformSearch(fullSuggestedDomain);
                                }}
                                className="flex items-center justify-between text-[12.5px] text-[#1787D4] hover:text-[#136eb0] p-2 rounded-lg hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-semibold text-[#1d1d1f] group-hover:text-[#1787D4] truncate">
                                    {altName}
                                  </span>
                                  <span className="text-[11px] font-medium text-[#6e6e73]">
                                    .{targetExtension}
                                  </span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#6e6e73] group-hover:text-[#1787D4] group-hover:translate-x-0.5 transition-all" />
                              </button>
                            );
                          })}
                      </div>
                    ) : isFetchingSuggestions ? (
                      <p className="text-[12px] text-[#6e6e73] py-2">
                        Fetching alternative names...
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#6e6e73] py-2">
                        No name suggestions available for this term.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Renewal hint box */}
              <div className="bg-[#f0fdfa] border border-[#99f6e4] rounded-lg p-3.5 text-[#115e59] text-[12px] leading-relaxed">
                <p className="flex items-start gap-1.5">
                  <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    Keep down-time low: renewal pricing is always shown clearly
                    before checkout.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 2b: "YOUR DOMAIN IS READY" (TERM, PROTECTION & SSL)
          (Exactly matching the user's uploaded mockup screenshot)
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && step2View === "ready" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column (8 cols): Domain Overview + Protection Settings (including SSL) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Domain Overview Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#f0f0f3]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#e6f7f8] text-[#0d9488] shrink-0">
                    <Globe className="w-6 h-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-bold text-[#1d1d1f] truncate">
                        {selectedDomainName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selected
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                      New domain registration
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[18px] font-bold text-[#1d1d1f] block">
                    ₦{domainSubtotal.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-[#8a9bb2] block">
                    for 1 year
                  </span>
                </div>
              </div>

              {/* Registration term selector row */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="registration-term-select"
                    className="text-[13px] font-semibold text-[#1d1d1f] block"
                  >
                    Registration term
                  </label>
                  <p className="text-[12px] text-[#6e6e73] mt-0.5">
                    Registered through {getExpiryDateFormatted(termYears)}
                  </p>
                </div>

                <div className="relative">
                  <select
                    id="registration-term-select"
                    value={1}
                    disabled
                    className="h-10 pl-3.5 pr-8 rounded-lg border border-[#d1d5db] bg-[#f9fafb] text-[13.5px] font-semibold text-[#1d1d1f] outline-none appearance-none cursor-default"
                  >
                    <option value={1}>1 Year (₦{unitPrice.toLocaleString()})</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9ca3af] absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Protection Settings Card (including SSL certificate option) */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Protection settings
              </h3>
              <p className="text-[13px] text-[#6e6e73] mt-0.5 mb-5">
                Keep your domain active and your personal details protected.
              </p>

              <div className="flex flex-col divide-y divide-[#f0f0f3]">
                {/* Auto-Renewal Toggle */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 pr-4">
                    <p className="text-[14px] font-bold text-[#1d1d1f]">
                      Auto-Renewal
                    </p>
                    <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                      Renew automatically before expiry using your saved payment
                      method.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] font-medium text-[#6e6e73]">
                      Included
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoRenew}
                      onClick={() => setAutoRenew(!autoRenew)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoRenew ? "bg-[#1787D4]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          autoRenew ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Privacy Protection Toggle */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 pr-4">
                    <p className="text-[14px] font-bold text-[#1d1d1f]">
                      Privacy Protection
                    </p>
                    <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                      Hide your registrant details from public lookup records.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] font-bold text-emerald-600">
                      Free
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={privacyProtection}
                      onClick={() => setPrivacyProtection(!privacyProtection)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        privacyProtection ? "bg-[#1787D4]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          privacyProtection ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* SSL Certificate Protection Option */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-[#1d1d1f]">
                        SSL Certificate Protection
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1787D4] border border-blue-200">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                      Activate 256-bit encryption padlock and protect visitor
                      data with PositiveSSL.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] font-semibold text-[#1d1d1f]">
                      ₦{positiveSslPrice.toLocaleString()}/yr
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={includeSsl}
                      onClick={() => setIncludeSsl(!includeSsl)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeSsl ? "bg-[#1787D4]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          includeSsl ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Order Summary Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h4 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
                Order summary
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate pr-2">
                    {selectedDomainName}
                  </span>
                  <span className="font-semibold text-[#1d1d1f] shrink-0">
                    ₦{domainSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Privacy Protection</span>
                  <span className={`font-semibold ${privacyProtection ? "text-emerald-600" : "text-[#1d1d1f]"}`}>
                    {privacyProtection ? "Free" : "NO"}
                  </span>
                </div>

                {includeSsl && (
                  <div className="flex justify-between items-center text-blue-700">
                    <span className="truncate pr-2">
                      PositiveSSL Certificate (1 yr)
                    </span>
                    <span className="font-semibold shrink-0">
                      ₦{sslSubtotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[16px] font-bold text-[#1d1d1f]">
                  <span>Total</span>
                  <span className="text-[#1787D4]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Continue to Step 3 */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                Continue
              </button>

              <p className="text-center text-[12px] text-[#6e6e73] mt-3">
                You&apos;ll review contact details before payment.
              </p>
            </div>

            {/* Reserved Banner */}
            <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-3.5 text-[#0369a1] text-[12px] flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 shrink-0 text-[#0284c7]" />
              <span>
                Your domain stays reserved for 15 minutes while you complete
                setup.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 3: DETAILS ("Set up your domain" - Contact & Registrant)
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column (8 cols): Contact Info & Registrant Info */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Contact Information Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Contact information
              </h3>
              <p className="text-[13px] text-[#6e6e73] mt-0.5 mb-5">
                We&apos;ll use these details for important registration and
                renewal notices.
              </p>

              {/* Use account information checkbox bar */}
              <div className="mb-5 bg-[#f8fbfe] border border-[#dbeafe] rounded-lg p-3.5 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useAccountInfo}
                    onChange={(e) => setUseAccountInfo(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1787D4] focus:ring-[#1787D4] border-gray-300 cursor-pointer"
                  />
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">
                    Use my account information
                  </span>
                </label>
                <span className="text-[12.5px] font-mono text-[#1787D4] bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                  {accountTag}
                </span>
              </div>

              {/* Form Grid */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Chibuike"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ugwu"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="chibuike@yourbusiness.com"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 555 0142"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registrant Information Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Registrant information
              </h3>
              <p className="text-[13px] text-[#6e6e73] mt-0.5 mb-5">
                This information identifies the legal owner of the domain.
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your Business Limited"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="24 Admiralty Way"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lagos"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Lagos"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="100104"
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#1d1d1f] mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] bg-white text-[13.5px] text-[#1d1d1f] outline-none focus:border-[#1787D4] appearance-none cursor-pointer"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#6e6e73] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bottom buttons row in Card */}
              <div className="mt-8 pt-5 border-t border-[#f0f0f3] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    setStep2View("ready");
                  }}
                  className="text-[13.5px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white text-[13.5px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Registration Contact Preview + Mini Summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h4 className="text-[15px] font-bold text-[#1d1d1f] mb-3">
                Registration contact
              </h4>

              <div className="space-y-1.5 text-[13px] text-[#6e6e73] pb-4 border-b border-[#f0f0f3]">
                <p className="font-bold text-[#1d1d1f] text-[14px]">
                  {firstName} {lastName}
                </p>
                <p>{organization}</p>
                <p className="text-[#1787D4]">{email}</p>
                <p>
                  {city}, {country}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-2.5 text-[12px] text-[#6e6e73] leading-relaxed">
                <Shield className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
                <span>
                  Privacy Protection will keep these details out of public
                  domain lookup results.
                </span>
              </div>
            </div>

            {/* Mini Order Summary Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate pr-2">
                    {selectedDomainName}
                  </span>
                  <span className="font-semibold text-[#1d1d1f] shrink-0">
                    ₦{domainSubtotal.toLocaleString()}
                  </span>
                </div>

                {includeSsl && (
                  <div className="flex justify-between items-center text-blue-700">
                    <span>PositiveSSL</span>
                    <span className="font-semibold">
                      ₦{sslSubtotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="my-1.5 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[15px] font-bold text-[#1d1d1f]">
                  <span>Total</span>
                  <span>₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 4: REVIEW ("Review your order")
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column (8 cols): Domain Details + Registrant Summary */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Domain Details Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f3]">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                    Domain details
                  </h3>
                  <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                    Registration and protection settings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    setStep2View("ready");
                  }}
                  className="text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Domain Item */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-bold text-[#1d1d1f] truncate">
                        {selectedDomainName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6e6e73] mt-0.5">
                      1-year registration • {getTodayFormatted()} -{" "}
                      {getExpiryDateFormatted(1)}
                    </p>
                  </div>
                </div>

                <span className="text-[16px] font-bold text-[#1d1d1f] shrink-0">
                  ₦{domainSubtotal.toLocaleString()}
                </span>
              </div>

              {/* 4 Stats Columns */}
              <div className="mt-2 pt-4 border-t border-[#f0f0f3] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12.5px]">
                <div>
                  <span className="text-[#8a9bb2] block text-[11.5px]">
                    Auto-Renewal
                  </span>
                  <span className="font-semibold text-[#1d1d1f] mt-0.5 block">
                    {autoRenew ? "On" : "Off"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a9bb2] block text-[11.5px]">
                    Privacy Protection
                  </span>
                  <span className="font-semibold text-emerald-600 mt-0.5 block">
                    {privacyProtection ? "Included" : "Disabled"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a9bb2] block text-[11.5px]">
                    SSL Certificate
                  </span>
                  <span
                    className={`font-semibold mt-0.5 block ${
                      includeSsl ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {includeSsl ? "Included" : "None"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a9bb2] block text-[11.5px]">
                    Nameservers
                  </span>
                  <span className="font-semibold text-[#1d1d1f] mt-0.5 block">
                    Nupat default
                  </span>
                </div>
              </div>
            </div>

            {/* Registrant Summary Card */}
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f3]">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                    Registrant summary
                  </h3>
                  <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                    Legal owner and administrative contact
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="space-y-1.5 text-[#6e6e73]">
                  <p className="font-bold text-[#1d1d1f] text-[14px]">
                    {firstName} {lastName}
                  </p>
                  <p>{organization}</p>
                  <p className="text-[#1787D4]">{email}</p>
                </div>
                <div className="space-y-1.5 text-[#6e6e73]">
                  <p>{phone}</p>
                  <p>{streetAddress}</p>
                  <p>
                    {city} {postalCode}, {country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Order Summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h4 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
                Order summary
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                <div className="flex justify-between items-center">
                  <span>Domain registration</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{domainSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Privacy Protection</span>
                  <span className={`font-semibold ${privacyProtection ? "text-emerald-600" : "text-[#1d1d1f]"}`}>
                    {privacyProtection ? "Free" : "Disabled"}
                  </span>
                </div>

                {includeSsl && (
                  <div className="flex justify-between items-center text-blue-700">
                    <span>PositiveSSL Certificate</span>
                    <span className="font-semibold">
                      ₦{sslSubtotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[16px] font-bold text-[#1d1d1f]">
                  <span>Total due today</span>
                  <span className="text-[#1787D4]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="mt-5 pt-4 border-t border-[#f0f0f3]">
                <label className="flex items-start gap-2.5 cursor-pointer text-[12px] text-[#6e6e73] leading-relaxed">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1787D4] focus:ring-[#1787D4] border-gray-300 mt-0.5 cursor-pointer"
                  />
                  <span>
                    I confirm these details are accurate and agree to the Domain
                    Registration Terms.
                  </span>
                </label>
              </div>

              {/* Proceed to Payment */}
              <button
                type="button"
                disabled={!agreedToTerms}
                onClick={() => setCurrentStep(5)}
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-[#6e6e73]">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Your registration starts immediately after payment is
                  confirmed.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 5: COMPLETE PAYMENT (DIRECT TO PAYSTACK GATEWAY)
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column (8 cols): Paystack Payment Method */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Payment method
              </h3>
              <p className="text-[13px] text-[#6e6e73] mt-0.5 mb-5">
                Your payment details are encrypted and handled securely.
              </p>

              {/* Paystack Card */}
              <div className="p-4 sm:p-5 rounded-lg border-2 border-[#1787D4] bg-[#f8fbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full border-4 border-[#1787D4] bg-white flex items-center justify-center shrink-0" />
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-auto flex items-center shrink-0">
                      <Image
                        src="/paystack-logo.png"
                        alt="Paystack"
                        width={110}
                        height={28}
                        className="h-7 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1d1d1f]">
                        Paystack
                      </p>
                      <p className="text-[12px] text-[#6e6e73]">
                        Pay with debit/credit card, bank transfer, USSD, or Apple
                        Pay
                      </p>
                    </div>
                  </div>
                </div>

                <span className="self-start sm:self-center text-[11.5px] font-bold text-[#1787D4] bg-[#e6f4fc] px-2.5 py-1 rounded-full shrink-0">
                  Primary Gateway
                </span>
              </div>

              {/* Security note */}
              <div className="mt-5 p-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-start gap-3 text-[12.5px] text-[#6e6e73]">
                <Shield className="w-5 h-5 text-[#1787D4] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1d1d1f]">
                    Direct & Secure Paystack Checkout
                  </p>
                  <p className="mt-0.5">
                    Clicking &ldquo;Pay with Paystack&rdquo; will direct you
                    straight to Paystack&apos;s certified payment gateway to
                    complete the transaction. No card details are ever stored on
                    our servers.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[12px] text-[#6e6e73]">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secured with encrypted payment processing.</span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Order Summary & Direct Pay Button */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
              <h4 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
                Order summary
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-[#1d1d1f] block truncate">
                      {selectedDomainName}
                    </span>
                    <span className="text-[11.5px] text-[#8a9bb2]">
                      1-year registration
                    </span>
                  </div>
                  <span className="font-semibold text-[#1d1d1f] shrink-0">
                    ₦{domainSubtotal.toLocaleString()}
                  </span>
                </div>

                {includeSsl && (
                  <div className="flex justify-between items-start text-blue-700">
                    <div>
                      <span className="font-semibold block truncate">
                        PositiveSSL Certificate
                      </span>
                      <span className="text-[11.5px] text-blue-500">
                        1-year term
                      </span>
                    </div>
                    <span className="font-semibold shrink-0">
                      ₦{sslSubtotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[16px] font-bold text-[#1d1d1f]">
                  <span>Total</span>
                  <span className="text-[#1787D4]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pay with Paystack Button -> Direct redirect */}
              <button
                type="button"
                disabled={isRedirectingToPaystack}
                onClick={handlePaystackCheckout}
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRedirectingToPaystack ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Paystack…
                  </>
                ) : (
                  `Pay ₦${grandTotal.toLocaleString()} with Paystack`
                )}
              </button>

              <p className="text-center text-[11.5px] text-[#8a9bb2] mt-3 leading-relaxed">
                By paying, you authorise this charge and agree to the domain
                registration terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 6: DONE ("Your domain is registered!" - Order Completed)
          (Matching Figma screen from user's upload with 3D checkmark SVG)
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 6 && (
        <div className="w-full flex flex-col gap-5 items-center">
          <div className="w-full max-w-3xl bg-white rounded-lg border border-[#e8e8ed] p-6 sm:p-10 shadow-xs flex flex-col items-center text-center">
            {/* The 3D checkmark SVG */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 flex items-center justify-center">
              <Image
                src="/checkmark.svg"
                alt="Registration Complete"
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                priority
              />
            </div>

            <h2 className="text-[20px] sm:text-[23px] font-bold text-[#1d1d1f]">
              Welcome to the internet, {selectedDomainName}
            </h2>
            <p className="text-[13.5px] text-[#6e6e73] mt-1.5 max-w-lg leading-relaxed">
              Your registration is complete. You can manage DNS, connect a website, or add hosting whenever you&apos;re ready.
            </p>

            {/* Domain Info Box */}
            <div className="w-full mt-7 p-4 sm:p-5 rounded-lg border border-[#e8e8ed] bg-[#f9fafb] text-left">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#e6f7f8] text-[#0d9488] shrink-0">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#1d1d1f] truncate">
                      {selectedDomainName}
                    </p>
                    <p className="text-[11.5px] text-[#6e6e73]">
                      Primary domain
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Active
                </span>
              </div>

              <div className="pt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
                <div>
                  <span className="text-[#8a9bb2] block text-[11px]">
                    Registered
                  </span>
                  <span className="font-semibold text-[#1d1d1f] mt-0.5 block">
                    {getTodayFormatted()}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a9bb2] block text-[11px]">
                    Expires
                  </span>
                  <span className="font-semibold text-[#1d1d1f] mt-0.5 block">
                    {getExpiryDateFormatted(1)}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a9bb2] block text-[11px]">
                    Auto-Renew
                  </span>
                  <span className={`font-semibold mt-0.5 block ${autoRenew ? "text-emerald-600" : "text-[#1d1d1f]"}`}>
                    {autoRenew ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => router.push("/dashboard/domains")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white text-[13.5px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer"
              >
                Manage Domain
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/hosting")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-[#1d1d1f] text-[13.5px] bg-white border border-[#d1d5db] hover:bg-slate-50 transition-all cursor-pointer"
              >
                Set Up Hosting
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-[#6e6e73] hover:text-[#1d1d1f] text-[13.5px] transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          {/* Bottom notification */}
          <div className="w-full max-w-3xl bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-3.5 text-[#0369a1] text-[12.5px] flex items-center justify-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0 text-[#0284c7]" />
            <span>
              A registration receipt and verification details were sent to {email || userProfile?.email || "your registered email"}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
