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
  return ticket.id ? `#TKT-${ticket.id}` : "—";
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
      label: "In progress",
      bg: "bg-[#1787D4]",
    };
  }
  if (s.includes("wait") || s.includes("customer")) {
    return {
      label: "Waiting for you",
      bg: "bg-[#E8900A]",
    };
  }
  if (s.includes("resolve") || s.includes("completed")) {
    return {
      label: "Resolved",
      bg: "bg-[#12A150]",
    };
  }
  if (s.includes("close")) {
    return {
      label: "Closed",
      bg: "bg-[#9AA6B8]",
    };
  }
  return {
    label: "Open",
    bg: "bg-[#1787D4]",
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
          <h1 className="text-2xl font-semibold text-[#031033]">
            Support tickets
          </h1>
          <p className="text-sm text-[#5A6A85] mt-1">
            Get help from our support team and keep track of your requests in one place.
          </p>
        </div>

        <Link
          href="/dashboard/tickets/create"
          id="btn-create-support-ticket"
          className="inline-flex items-center gap-2 h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors shrink-0 self-start sm:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create ticket</span>
        </Link>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          id="input-search-tickets"
          placeholder="Search by ticket ID or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
        />
      </div>

      {/* ── Status filter (segmented control) ──────────────────────────── */}
      <div className="overflow-x-auto">
        <div className="inline-flex items-center gap-1 bg-[#F2F5FC] p-1 rounded-lg">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "OPEN", label: "Open" },
              { id: "IN_PROGRESS", label: "In progress" },
              { id: "WAITING_FOR_YOU", label: "Waiting for you" },
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
                className={`h-8 px-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                  isActive
                    ? "bg-white text-[#031033] shadow-sm"
                    : "text-[#5A6A85] hover:text-[#031033]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E8F0]">
            <div className="h-3 w-48 animate-pulse rounded bg-[#EEF2F7]" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="px-5 py-4 border-b border-[#EEF2F7] last:border-0 flex items-center gap-6"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-[#EEF2F7]" />
              <div className="h-4 flex-1 animate-pulse rounded bg-[#EEF2F7]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#EEF2F7]" />
            </div>
          ))}
          <p className="sr-only">Loading support tickets…</p>
        </div>
      ) : tickets.length === 0 ? (
        /* ── Empty State ──────────────────────────────────────────────── */
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 sm:p-12 text-center flex flex-col items-center justify-center gap-4">
            <MessageSquare className="w-5 h-5 text-[#5A6A85]" />

            <div>
              <h2 className="text-base font-semibold text-[#031033]">
                No support tickets yet
              </h2>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-md mx-auto">
                When you need help, create a ticket and our support team will assist you.
              </p>
            </div>

            <Link
              href="/dashboard/tickets/create"
              className="inline-flex items-center h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Create a ticket
            </Link>
          </div>

          {/* Need quick help? Ask AI */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#031033]">
                <Sparkles className="w-4 h-4 text-[#5A6A85]" />
                Need quick help?
              </h3>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-xl">
                Ask Nupat AI about your domains, hosting, email, or security. If the issue needs a specialist, your conversation can be escalated to a ticket.
              </p>
            </div>

            <Link
              href="/dashboard/tickets/create?from=ai"
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Ask AI
            </Link>
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        /* Empty search results */
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <p className="text-base font-semibold text-[#031033]">
            No tickets match your filter
          </p>
          <p className="text-sm text-[#5A6A85] mt-1">
            Try adjusting your search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="mt-4 h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Reset filters
          </button>
        </div>
      ) : (
        /* ── Support Tickets Table ────────────────────────────────────── */
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Ticket ID
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Subject
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85]">
                      Category
                    </th>
                    <th className="py-3 px-5 text-xs font-medium text-[#5A6A85] text-right">
                      Updated
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
                  {filteredTickets.map((ticket) => {
                    const ticketIdStr = formatTicketNumber(ticket);
                    const statusInfo = getTicketStatusStyle(ticket.status);
                    const updatedStr = formatShortDate(ticket.lastreply || ticket.date);
                    const categoryLabel = ticket.deptname || "General";

                    return (
                      <tr
                        key={ticket.id}
                        className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm font-mono text-[#031033] whitespace-nowrap">
                          <Link
                            href={`/dashboard/tickets/${encodeURIComponent(ticket.id)}`}
                            className="hover:text-[#1787D4] transition-colors"
                          >
                            {ticketIdStr}
                          </Link>
                        </td>
                        <td className="py-3 px-5 text-sm font-medium text-[#031033]">
                          {ticket.subject || "Support request"}
                        </td>
                        <td className="py-3 px-5 text-sm text-[#5A6A85]">
                          {categoryLabel}
                        </td>
                        <td className="py-3 px-5 text-sm text-[#5A6A85] text-right tabular-nums whitespace-nowrap">
                          {updatedStr}
                        </td>
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${statusInfo.bg}`} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <Link
                            href={`/dashboard/tickets/${encodeURIComponent(ticket.id)}`}
                            className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
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

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-[#EEF2F7] flex items-center justify-between text-xs text-[#5A6A85] tabular-nums">
              <span>
                Showing {filteredTickets.length} ticket
                {filteredTickets.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Ticket status key */}
          <div className="flex items-center gap-3 px-1 text-xs text-[#5A6A85] overflow-x-auto">
            <span className="font-medium shrink-0">Ticket status key:</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033] shrink-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1787D4]" />
              Open
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033] shrink-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1787D4]" />
              In progress
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033] shrink-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8900A]" />
              Waiting for you
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033] shrink-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#12A150]" />
              Resolved
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#031033] shrink-0">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9AA6B8]" />
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
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading support tickets…</p>
        </div>
      }
    >
      <TicketsContent />
    </Suspense>
  );
}
