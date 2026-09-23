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
      <div className="bg-amber-50/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#eff6fb] flex items-center justify-center text-[#1787D4] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-orange-600">
              Private Email is Temporarily Disabled
            </h3>
            <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
              Email creation and management are currently offline. All existing data is safely preserved.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-[12.5px] font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors shrink-0"
        >
          Return to Dashboard →
        </Link>
      </div>

      {/* Header */}
      <div>
        <h2
          className="text-[26px] font-bold tracking-tight"
          style={{
            color: "#1d1d1f",
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Private Email
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Create and manage professional email addresses for your domains.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Mailboxes */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm flex flex-col justify-between min-h-[108px]">
          <span className="text-[13px] font-medium text-[#6e6e73]">Mailboxes</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {totalMailboxes}
          </div>
        </div>

        {/* Card 2: Storage Used */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm flex flex-col justify-between min-h-[108px]">
          <span className="text-[13px] font-medium text-[#6e6e73]">Storage Used</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            24 GB
          </div>
        </div>

        {/* Card 3: Domains */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-sm flex flex-col justify-between min-h-[108px]">
          <span className="text-[13px] font-medium text-[#6e6e73]">Domains</span>
          <div className="text-[28px] font-bold text-[#1d1d1f] tracking-tight mt-1">
            {uniqueDomains || 3}
          </div>
        </div>
      </div>

      {/* Action and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by email or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
          />
        </div>

        <Link
          href="/dashboard/email/create"
          id="btn-create-mailbox"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm shrink-0"
        >
          Create Mailbox
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eef2f8] bg-[#fbfcfe]">
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                  Email Address
                </th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                  Domain
                </th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                  Storage
                </th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85]">
                  Status
                </th>
                <th className="py-4 px-6 text-[12.5px] font-semibold text-[#5a6a85] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f5fc]">
              {filteredMailboxes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[13.5px] text-[#6e6e73]">
                    No mailboxes found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredMailboxes.map((item) => (
                  <tr
                    key={item.id || item.email}
                    className="hover:bg-[#fbfcfe] transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                        {item.email}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[13px] text-[#6e6e73]">
                        {item.domain}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[13px] text-[#6e6e73]">
                        {item.storage}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#eff6fb] text-[#1787D4]">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <Link
                        href={`/dashboard/email/${encodeURIComponent(item.email)}`}
                        id={`manage-mailbox-${item.email.replace(/[@.]/g, "-")}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold rounded-full transition-colors active:scale-95 shadow-sm"
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
