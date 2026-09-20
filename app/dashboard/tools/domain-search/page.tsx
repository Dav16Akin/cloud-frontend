"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Loader2, Globe, ShieldCheck } from "lucide-react";
import { searchDomains, type DomainResult } from "@/lib/api";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";

interface DomainRow {
  domain: string;
  status: "Available" | "Unavailable";
  price: string;
  isAvailable: boolean;
}

function DomainSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("domain") || "";

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<DomainRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const addDomainItem = useCartStore((s) => s.addDomainItem);

  const executeSearch = useCallback(async (termToSearch: string) => {
    const term = termToSearch.trim().toLowerCase();
    if (!term) return;

    setSearching(true);
    setHasSearched(true);

    try {
      const res = await searchDomains(term);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: DomainRow[] = res.data.map((item: DomainResult) => {
          const isAvail = item.available;
          const p = item.price?.price;
          const curr = item.price?.currency || "₦";
          const formattedPrice =
            isAvail && p
              ? `${curr === "NGN" ? "₦" : curr}${p.toLocaleString("en-NG")} / yr`
              : "—";

          return {
            domain: item.domain,
            status: isAvail ? "Available" : "Unavailable",
            price: formattedPrice,
            isAvailable: isAvail,
          };
        });
        setResults(mapped);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to search domain availability.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery, executeSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const handleRegister = (domainName: string) => {
    try {
      const parts = domainName.split(".");
      const name = parts[0];
      const ext = parts.slice(1).join(".");
      addDomainItem({
        type: "DOMAIN",
        domainName: name,
        extension: ext,
        price: 27000,
        currency: "NGN",
        isPremium: false,
      });
      toast.success(`${domainName} added to cart`);
      router.push("/cart");
    } catch {
      router.push(`/domains?search=${encodeURIComponent(domainName)}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tools
        </Link>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Domain Search
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Search live domain availability, pricing, and status across supported top-level domains.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter a domain name (e.g. yourbrand.com)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors"
            />
          </div>
          <button
            type="submit"
            id="btn-domain-search"
            disabled={searching || !searchTerm.trim()}
            className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm shrink-0 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {searching && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-2">
        <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
          Search Results
        </h3>

        <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Domain Name
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                    Price
                  </th>
                  <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f5fc]">
                {!hasSearched ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Search className="w-7 h-7 text-[#9ba8c0]" />
                        <p className="text-[14px] font-medium text-[#1d1d1f]">
                          No search performed yet
                        </p>
                        <p className="text-[12.5px] text-[#6e6e73]">
                          Enter a domain name above and click search to check live availability and registration rates.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Globe className="w-7 h-7 text-[#9ba8c0]" />
                        <p className="text-[14px] font-medium text-[#1d1d1f]">
                          No domains found
                        </p>
                        <p className="text-[12.5px] text-[#6e6e73]">
                          No domain results were returned for &ldquo;{searchTerm}&rdquo;. Try another domain or keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((row) => (
                    <tr
                      key={row.domain}
                      className="hover:bg-[#fbfcfe] transition-colors"
                    >
                      <td className="py-5 px-6">
                        <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                          {row.domain}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {row.isAvailable ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#fef0f0] text-[#f56c6c] border border-[#fde2e2]">
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-[13px] text-[#1d1d1f] font-medium">
                          {row.price}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {row.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleRegister(row.domain)}
                            id={`btn-register-${row.domain.replace(/[@.]/g, "-")}`}
                            className="inline-flex items-center justify-center px-5 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-full transition-colors active:scale-95 shadow-sm cursor-pointer"
                          >
                            Register
                          </button>
                        ) : (
                          <Link
                            href={`/dashboard/tools/whois-lookup?domain=${encodeURIComponent(
                              row.domain
                            )}`}
                            id={`btn-whois-${row.domain.replace(/[@.]/g, "-")}`}
                            className="inline-flex items-center justify-center px-4 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#5a6a85] hover:text-[#1d1d1f] text-[12.5px] font-semibold rounded-full transition-colors"
                          >
                            WHOIS
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DomainSearchToolPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-[14px] text-[#6e6e73]">Loading Domain Search...</p>
        </div>
      }
    >
      <DomainSearchContent />
    </Suspense>
  );
}
