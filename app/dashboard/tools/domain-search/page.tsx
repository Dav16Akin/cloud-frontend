"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Globe, ShieldCheck } from "lucide-react";
import { searchDomains, type DomainResult } from "@/lib/api";
import { toast } from "sonner";

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
    router.push(
      `/dashboard/domains?tab=register&domain=${encodeURIComponent(domainName)}`,
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tools
        </Link>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">Domain search</h1>
        <p className="text-sm mt-1 text-[#5A6A85]">
          Search live domain availability, pricing and status across supported top-level domains.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-[#5A6A85] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter a domain name (e.g. yourbrand.com)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
            />
          </div>
          <button
            type="submit"
            id="btn-domain-search"
            disabled={searching || !searchTerm.trim()}
            className="h-10 px-5 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors shrink-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {searching && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <h3 className="text-base font-semibold text-[#031033] mb-3">
          Search results
        </h3>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85]">
                    Domain name
                  </th>
                  <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85]">
                    Status
                  </th>
                  <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] text-right">
                    Price
                  </th>
                  <th className="py-2.5 px-5 text-xs font-medium text-[#5A6A85] text-right">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {!hasSearched ? (
                  <tr>
                    <td colSpan={4} className="py-10 px-5 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
                        <p className="text-sm font-medium text-[#031033]">
                          No search performed yet
                        </p>
                        <p className="text-sm text-[#5A6A85]">
                          Enter a domain name above and select Search to check live availability and registration rates.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 px-5 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
                        <p className="text-sm font-medium text-[#031033]">
                          No domains found
                        </p>
                        <p className="text-sm text-[#5A6A85]">
                          No domain results were returned for &ldquo;{searchTerm}&rdquo;. Try another domain or keyword.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((row) => (
                    <tr
                      key={row.domain}
                      className="hover:bg-[#F2F5FC]/60 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <span className="text-sm font-medium text-[#031033]">
                          {row.domain}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {row.isAvailable ? (
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#9AA6B8]" />
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-sm tabular-nums text-[#031033]">
                          {row.price}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        {row.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleRegister(row.domain)}
                            id={`btn-register-${row.domain.replace(/[@.]/g, "-")}`}
                            className="inline-flex h-8 items-center justify-center px-3 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                          >
                            Register
                          </button>
                        ) : (
                          <Link
                            href={`/dashboard/tools/whois-lookup?domain=${encodeURIComponent(
                              row.domain
                            )}`}
                            id={`btn-whois-${row.domain.replace(/[@.]/g, "-")}`}
                            className="inline-flex h-8 items-center justify-center px-3 text-[#1787D4] hover:bg-[#E8F4FC] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading domain search…</p>
        </div>
      }
    >
      <DomainSearchContent />
    </Suspense>
  );
}
