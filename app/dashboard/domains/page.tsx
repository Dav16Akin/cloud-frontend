"use client";

import { useState } from "react";
import {
  Globe,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Trash2,
  ShoppingCart,
  Sparkles,
  Loader2,
  Lock,
} from "lucide-react";
import { searchDomains, type DomainResult } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { toast } from "sonner";

type SearchState = "idle" | "searching" | "done" | "error";
type Tab = "my-domains" | "register";

export default function DomainsDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my-domains");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: registeredDomains, isLoading: loadingDomains, refetch } = useGetRegisteredDomains();
  const { addItem, removeItem, hasItem, openDrawer } = useCartStore();

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

  const handleAddToCart = (result: DomainResult) => {
    if (result.price.price == null) return;
    addItem({
      domain: result.domain,
      price: result.price.price,
      currency: result.price.currency ?? "USD",
      isPremium: result.isPremium,
    });
    toast.success(`${result.domain} added to cart!`);
    openDrawer(); // Automatically open the side drawer inside the dashboard
  };

  const handleRemoveFromCart = (domain: string) => {
    removeItem(domain);
    toast.info(`${domain} removed from cart.`);
  };

  const formatPrice = (priceVal: number | null, currency = "USD") => {
    if (priceVal == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(priceVal);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#031033]">Domains</h1>
          <p className="text-[#5a6a85] text-sm mt-0.5">
            Register new domain names or manage your existing domain portfolio.
          </p>
        </div>
        {activeTab === "my-domains" && (
          <button
            onClick={() => setActiveTab("register")}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto text-sm py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            Register New Domain
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2eaff]">
        <button
          onClick={() => setActiveTab("my-domains")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "my-domains"
              ? "border-[#e8900a] text-[#e8900a]"
              : "border-transparent text-[#5a6a85] hover:text-[#031033]"
          }`}
        >
          My Domains ({loadingDomains ? "..." : registeredDomains?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === "register"
              ? "border-[#e8900a] text-[#e8900a]"
              : "border-transparent text-[#5a6a85] hover:text-[#031033]"
          }`}
        >
          Register / Search Domain
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "my-domains" ? (
        <div className="bg-white border border-[#e2eaff] min-h-[300px]">
          {loadingDomains ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#e8900a] animate-spin" />
              <p className="text-sm text-[#5a6a85]">Loading registered domains...</p>
            </div>
          ) : !registeredDomains || registeredDomains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[#9ba8c0]" />
              </div>
              <h3 className="font-bold text-[#031033] text-base">No domains registered yet</h3>
              <p className="text-sm text-[#5a6a85] max-w-sm mt-1 mb-6">
                You don&apos;t have any domain names registered to this account. Find your perfect domain now.
              </p>
              <button
                onClick={() => setActiveTab("register")}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Find a Domain
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f6f9ff] border-b border-[#e2eaff]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider">
                      Domain Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#9ba8c0] uppercase tracking-wider">
                      Auto Renew
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4fc]">
                  {registeredDomains.map((domain) => (
                    <tr key={domain.domain} className="hover:bg-[#fafbff] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#e8900a]" />
                          <span className="font-bold text-[#031033] text-sm">{domain.domain}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border ${
                            domain.status === "ACTIVE"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : domain.status === "PENDING"
                              ? "bg-amber-50 border-amber-100 text-amber-600"
                              : "bg-red-50 border-red-100 text-red-500"
                          }`}
                        >
                          {domain.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#5a6a85] text-xs">
                        {formatDate(domain.registrationDate)}
                      </td>
                      <td className="px-6 py-4 text-[#5a6a85] text-xs">
                        {formatDate(domain.expiryDate)}
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={domain.autoRenew}
                            readOnly
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-2 text-xs text-[#5a6a85]">Enabled</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Register Domain Search */
        <div className="flex flex-col gap-6">
          <div className="bg-[#031033] border border-[#1a2d5a] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            <div className="max-w-2xl relative z-10">
              <h2 className="text-xl font-bold text-white mb-2">Find a Domain Name</h2>
              <p className="text-[#9ba8c0] text-sm mb-6">
                Type in the name you want, click search, and register it instantly.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 flex items-center bg-white border border-[#dce4f7] overflow-hidden focus-within:border-[#e8900a] transition-all">
                  <div className="pl-3 shrink-0">
                    <Search className="w-4 h-4 text-[#9ba8c0]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchState !== "idle") {
                        setSearchState("idle");
                        setSearchResults([]);
                      }
                    }}
                    placeholder="Enter your ideal domain (e.g. business.com.ng)..."
                    className="w-full bg-transparent px-3 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchState === "searching" || !searchQuery.trim()}
                  className="btn-primary py-3 px-6 text-sm shrink-0 flex items-center gap-2 disabled:opacity-60"
                >
                  {searchState === "searching" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Searching Status banner */}
          {searchState === "searching" && (
            <div className="bg-white border border-[#e2eaff] p-5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-[#e8900a] animate-spin" />
              <span className="text-sm text-[#5a6a85]">
                Checking availability for <span className="font-semibold text-[#031033]">{searchQuery}</span> across extensions...
              </span>
            </div>
          )}

          {/* Error Banner */}
          {searchState === "error" && (
            <div className="bg-red-50 border border-red-100 p-5 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm text-red-600">{errorMsg}</span>
            </div>
          )}

          {/* Results Table */}
          {searchState === "done" && searchResults.length > 0 && (
            <div className="bg-white border border-[#e2eaff]">
              <div className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff]">
                <h3 className="font-semibold text-[#031033] text-sm">Search Results</h3>
              </div>
              <div className="divide-y divide-[#f0f4fc]">
                {searchResults.map((result) => (
                  <div
                    key={result.domain}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 transition-colors ${
                      result.available ? "hover:bg-green-50/10" : "hover:bg-gray-50/20"
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0">
                      {result.available ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#c5cedf] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold text-sm truncate ${
                              result.available ? "text-[#031033]" : "text-[#9ba8c0]"
                            }`}
                          >
                            {result.domain}
                          </span>
                          {result.isPremium && (
                            <span className="text-[9px] bg-[#f3f0ff] text-[#7c3aed] border border-[#d8b4fe] px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                      <div className="text-right">
                        {result.price.price != null ? (
                          <>
                            <p
                              className={`font-bold text-sm ${
                                result.available ? "text-[#031033]" : "text-[#9ba8c0]"
                              }`}
                            >
                              {formatPrice(result.price.price, result.price.currency ?? "USD")}
                            </p>
                            <p className="text-[10px] text-[#9ba8c0]">/year</p>
                          </>
                        ) : (
                          <p className="text-xs text-[#9ba8c0]">—</p>
                        )}
                      </div>

                      {result.available ? (
                        hasItem(result.domain) ? (
                          <button
                            onClick={() => handleRemoveFromCart(result.domain)}
                            className="py-2 px-4 text-xs flex items-center gap-1 font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(result)}
                            disabled={result.price.price == null}
                            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-[#9ba8c0] font-medium px-4 py-2 bg-[#f6f8fc]">
                          Taken
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchState === "done" && searchResults.length === 0 && (
            <div className="bg-white border border-[#e2eaff] py-10 text-center text-[#9ba8c0] text-sm">
              No domains found. Try searching for another name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
