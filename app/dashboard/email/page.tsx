"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Mail, HardDrive, Globe, Loader2, ArrowRight } from "lucide-react";
import { useGetHosting } from "@/hooks/useHosting";

interface MailboxItem {
  id: string;
  email: string;
  domain: string;
  storage: string;
  status: "Active" | "Suspended" | "Pending";
  hostingId?: string;
}

// Default seed mailboxes matching Figma
const DEFAULT_MAILBOXES: MailboxItem[] = [
  {
    id: "hello-acme-com",
    email: "hello@acme.com",
    domain: "acme.com",
    storage: "2.4 GB",
    status: "Active",
  },
  {
    id: "admin-acme-com",
    email: "admin@acme.com",
    domain: "acme.com",
    storage: "1.1 GB",
    status: "Active",
  },
  {
    id: "sales-acme-com",
    email: "sales@acme.com",
    domain: "acme.com",
    storage: "4.2 GB",
    status: "Active",
  },
];

export default function PrivateEmailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: hostingAccounts, isLoading: loadingHosting } = useGetHosting();

  // Combine seeded/saved mailboxes with any local storage mailboxes
  const [mailboxes] = useState<MailboxItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nupat_private_mailboxes");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_MAILBOXES;
  });

  const filteredMailboxes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mailboxes;
    return mailboxes.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.domain.toLowerCase().includes(q)
    );
  }, [mailboxes, searchQuery]);

  // Derive stats
  const totalMailboxes = mailboxes.length;
  const uniqueDomains = Array.from(new Set(mailboxes.map((m) => m.domain))).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Disabled Notification Banner */}
      <div className="bg-[#FFF4E0] border border-[#E8900A]/25 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-[#E8900A] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-[#9A5B00]">
              Private Email is temporarily disabled
            </h3>
            <p className="text-xs text-[#9A5B00] mt-0.5">
              Email creation and management are currently offline. All existing data is safely preserved.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors shrink-0"
        >
          Return to dashboard →
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">
          Private Email
        </h1>
        <p className="text-sm mt-1 text-[#5A6A85]">
          Create and manage professional email addresses for your domains.
        </p>
      </div>

      {/* Metrics: one container split by hairlines */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EEF2F7]">
        {/* Mailboxes */}
        <div className="px-5 py-4">
          <span className="text-xs text-[#5A6A85]">Mailboxes</span>
          <div className="text-2xl font-semibold text-[#031033] tabular-nums mt-1">
            {totalMailboxes}
          </div>
        </div>

        {/* Storage Used */}
        <div className="px-5 py-4">
          <span className="text-xs text-[#5A6A85]">Storage used</span>
          <div className="text-2xl font-semibold text-[#031033] tabular-nums mt-1">
            24 GB
          </div>
        </div>

        {/* Domains */}
        <div className="px-5 py-4">
          <span className="text-xs text-[#5A6A85]">Domains</span>
          <div className="text-2xl font-semibold text-[#031033] tabular-nums mt-1">
            {uniqueDomains || 3}
          </div>
        </div>
      </div>

      {/* Action and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by email or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
        </div>

        <Link
          href="/dashboard/email/create"
          id="btn-create-mailbox"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          Create mailbox
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                  Email address
                </th>
                <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                  Domain
                </th>
                <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">
                  Storage
                </th>
                <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                  Status
                </th>
                <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMailboxes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#5A6A85]">
                    No mailboxes found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredMailboxes.map((item) => (
                  <tr
                    key={item.id || item.email}
                    className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <span className="text-sm font-medium text-[#031033]">
                        {item.email}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-sm text-[#5A6A85]">
                        {item.domain}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className="text-sm text-[#5A6A85] tabular-nums whitespace-nowrap">
                        {item.storage}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-2 whitespace-nowrap text-sm ${
                          item.status === "Suspended" ? "text-[#C21F1F]" : "text-[#031033]"
                        }`}>
                        <span
                          aria-hidden
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            item.status === "Suspended"
                              ? "bg-[#DC2626]"
                              : item.status === "Pending"
                                ? "bg-[#E8900A]"
                                : "bg-[#12A150]"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/dashboard/email/${encodeURIComponent(item.email)}`}
                        id={`manage-mailbox-${item.email.replace(/[@.]/g, "-")}`}
                        className="inline-flex items-center justify-center h-8 px-3 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
