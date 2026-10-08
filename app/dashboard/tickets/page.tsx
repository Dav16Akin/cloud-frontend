"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useGetTickets } from "@/hooks/useSupport";
import type { SupportTicketSummary } from "@/lib/api";

type StatusTab = "ALL" | "OPEN" | "IN_PROGRESS" | "WAITING_FOR_YOU" | "RESOLVED" | "CLOSED";

export function formatTicketNumber(ticket: SupportTicketSummary): string {
  if (ticket.tid) {
    return `#TKT-${ticket.tid}`;
  }
  if (ticket.id?.startsWith("TKT-") || ticket.id?.startsWith("#TKT-")) {
    return ticket.id.startsWith("#") ? ticket.id : `#${ticket.id}`;
  }
  return `#TKT-${ticket.id || "10245"}`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getTicketStatusStyle(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("progress")) {
    return {
      label: "In Progress",
      bg: "bg-[#e8fbf7] text-[#0f9f8c] border-[#b9f2e8]",
    };
  }
  if (s.includes("wait") || s.includes("customer")) {
    return {
      label: "Waiting for You",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (s.includes("resolve") || s.includes("completed")) {
    return {
      label: "Resolved",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (s.includes("close")) {
    return {
      label: "Closed",
      bg: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }
  return {
    label: "Open",
    bg: "bg-blue-50 text-[#1787D4] border-blue-200",
  };
}

function TicketsContent() {
  const { data, isLoading } = useGetTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("ALL");

  const tickets = useMemo(() => data?.tickets ?? [], [data?.tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Status Filter
      if (statusFilter !== "ALL") {
        const s = (ticket.status || "").toLowerCase();
        if (statusFilter === "OPEN" && !s.includes("open") && s !== "") return false;
        if (statusFilter === "IN_PROGRESS" && !s.includes("progress")) return false;
        if (statusFilter === "WAITING_FOR_YOU" && !s.includes("wait") && !s.includes("customer")) return false;
        if (statusFilter === "RESOLVED" && !s.includes("resolve")) return false;
        if (statusFilter === "CLOSED" && !s.includes("close")) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const tNum = formatTicketNumber(ticket).toLowerCase();
        const subj = (ticket.subject || "").toLowerCase();
        const dept = (ticket.deptname || "").toLowerCase();
        return tNum.includes(q) || subj.includes(q) || dept.includes(q);
      }

      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{ letterSpacing: "-0.4px" }}
          >
            Support Tickets
          </h1>
          <p className="text-[13.5px] text-[#6e6e73] mt-0.5">
            Get help from our support team and keep track of your requests in one place.
          </p>
        </div>

        <Link
          href="/dashboard/tickets/create"
          id="btn-create-support-ticket"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ticket</span>
        </Link>
      </div>

      {/* ── Search Bar (Matches Screenshot) ────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9ba8c0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          id="input-search-tickets"
          placeholder="Search by ticket ID or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-sm"
        />
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "ALL", label: "All" },
            { id: "OPEN", label: "Open" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "WAITING_FOR_YOU", label: "Waiting for You" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "CLOSED", label: "Closed" },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`pill-filter-ticket-${tab.id.toLowerCase()}`}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#1787D4] text-white shadow-xs font-semibold"
                  : "bg-white border border-[#e2eaff] text-[#6e6e73] hover:text-[#1d1d1f] hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#1787D4]" />
          <p className="text-[13px] text-[#6e6e73]">Loading support tickets…</p>
        </div>
      ) : tickets.length === 0 ? (
        /* ── Empty State (Screen 3 in Mockups) ────────────────────────── */
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center border border-[#b8ece5]">
              <MessageSquare className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">
                No support tickets yet
              </h2>
              <p className="text-[13px] text-[#6e6e73] mt-1 max-w-md mx-auto leading-relaxed">
                When you need help, create a ticket and our support team will assist you.
              </p>
            </div>

            <Link
              href="/dashboard/tickets/create"
              className="mt-2 inline-flex items-center px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs"
            >
              Create a Ticket
            </Link>
          </div>

          {/* Need quick help? Ask AI Banner */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#4AC3B4] flex items-center justify-center shrink-0 border border-teal-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#1d1d1f]">
                  Need quick help?
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5 max-w-xl">
                  Ask Nupat AI about your domains, hosting, email, or security. If the issue needs a specialist, your conversation can be escalated to a ticket.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/tickets/create?from=ai"
              className="px-4 py-2 rounded-xl border border-[#d6eaf8] bg-[#f8fbfe] hover:bg-[#eaf4fd] text-[#1787D4] text-[12.5px] font-semibold transition-colors shrink-0 text-center"
            >
              Ask AI
            </Link>
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        /* Empty search results */
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-12 text-center shadow-xs">
          <p className="text-[14.5px] font-bold text-[#1d1d1f]">
            No tickets match your filter
          </p>
          <p className="text-[12.5px] text-[#6e6e73] mt-1">
            Try adjusting your search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="mt-3 px-4 py-2 bg-[#1787D4] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* ── Screen 1: Support Tickets Table ──────────────────────────── */
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e2eaff] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f4f9] bg-[#fbfcfe]">
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-6 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5fc]">
                  {filteredTickets.map((ticket) => {
                    const ticketIdStr = formatTicketNumber(ticket);
                    const statusInfo = getTicketStatusStyle(ticket.status);
                    const updatedStr = formatShortDate(ticket.lastreply || ticket.date);
                    const categoryLabel = ticket.deptname || "General";

                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-[#fbfcfe] transition-colors"
                      >
                        <td className="py-4 px-6 text-[13.5px] font-bold text-[#1d1d1f]">
                          <Link
                            href={`/dashboard/tickets/${encodeURIComponent(ticket.id)}`}
                            className="hover:text-[#1787D4] transition-colors"
                          >
                            {ticketIdStr}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[13.5px] font-semibold text-[#1d1d1f]">
                          {ticket.subject || "Support Request"}
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#5a6a85] font-medium">
                          {categoryLabel}
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#6e6e73]">
                          {updatedStr}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/tickets/${encodeURIComponent(ticket.id)}`}
                            className="text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table pagination/footer */}
            <div className="px-6 py-3.5 bg-[#fbfcfe] border-t border-[#f0f4f9] flex items-center justify-between text-[12px] text-[#6e6e73]">
              <span>
                Showing {filteredTickets.length} ticket
                {filteredTickets.length === 1 ? "" : "s"}
              </span>
              <span>Page 1 of 1</span>
            </div>
          </div>

          {/* Ticket status key legend footer matching screenshot */}
          <div className="flex items-center gap-3 px-2 text-[12px] text-[#6e6e73] overflow-x-auto">
            <span className="font-medium shrink-0">Ticket status key:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1787D4] border border-blue-200 shrink-0">
              Open
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8fbf7] text-[#0f9f8c] border border-[#b9f2e8] shrink-0">
              In Progress
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              Waiting for You
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Resolved
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
              Closed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading support tickets…</p>
        </div>
      }
    >
      <TicketsContent />
    </Suspense>
  );
}
