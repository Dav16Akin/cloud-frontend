"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Send,
  Loader2,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useGetTickets, useGetDepartments, useCreateTicket } from "@/hooks/useSupport";
import type { SupportTicketSummary } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

type TicketStatus = string;

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const normalized = status?.toLowerCase() ?? "";

  const cfg = normalized.includes("open")
    ? {
        icon: AlertCircle,
        label: "Open",
        cls: "bg-blue-50 text-blue-600 border-blue-200",
      }
    : normalized.includes("answered")
    ? {
        icon: CheckCircle2,
        label: "Answered",
        cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
      }
    : normalized.includes("customer")
    ? {
        icon: Clock,
        label: "Customer Reply",
        cls: "bg-amber-50 text-amber-600 border-amber-200",
      }
    : normalized.includes("closed")
    ? {
        icon: CheckCircle2,
        label: "Closed",
        cls: "bg-gray-50 text-gray-500 border-gray-200",
      }
    : normalized.includes("in progress")
    ? {
        icon: Clock,
        label: "In Progress",
        cls: "bg-purple-50 text-purple-600 border-purple-200",
      }
    : {
        icon: Clock,
        label: status || "Unknown",
        cls: "bg-gray-50 text-gray-500 border-gray-200",
      };

  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border whitespace-nowrap ${cfg.cls}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase() ?? "";
  const cls = p === "high"
    ? "text-red-500"
    : p === "medium"
    ? "text-amber-500"
    : "text-[#9ba8c0]";

  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {priority || "—"}
    </span>
  );
}

// ── Ticket Row ────────────────────────────────────────────────────────────────

function TicketRow({ ticket }: { ticket: SupportTicketSummary }) {
  return (
    <Link
      href={`/dashboard/tickets/${ticket.id}`}
      id={`ticket-row-${ticket.id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f6f9ff] transition-colors border-b border-[#e2eaff] last:border-b-0 cursor-pointer group"
    >
      {/* Icon */}
      <div className="w-8 h-8 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center shrink-0">
        <MessageSquare className="w-3.5 h-3.5 text-[#9ba8c0]" />
      </div>

      {/* Subject + ticket number */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#031033] truncate group-hover:text-[#e8900a] transition-colors">
          {ticket.subject}
        </p>
        <p className="text-xs text-[#9ba8c0] truncate">
          #{ticket.tid} · {ticket.deptname}
        </p>
      </div>

      {/* Priority */}
      <div className="hidden sm:block shrink-0 w-16">
        <PriorityBadge priority={ticket.priority} />
      </div>

      {/* Status */}
      <TicketStatusBadge status={ticket.status} />

      {/* Last reply date */}
      <p className="text-xs text-[#9ba8c0] shrink-0 hidden md:block w-24 text-right">
        {formatDate(ticket.lastreply)}
      </p>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-[#c8d0e0] shrink-0 group-hover:text-[#e8900a] transition-colors" />
    </Link>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function TicketRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#e2eaff] last:border-b-0 animate-pulse">
      <div className="w-8 h-8 bg-[#e8edf8] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-48 bg-[#e8edf8] rounded mb-1.5" />
        <div className="h-3 w-32 bg-[#e8edf8] rounded" />
      </div>
      <div className="hidden sm:block h-3 w-14 bg-[#e8edf8] rounded" />
      <div className="h-5 w-20 bg-[#e8edf8] rounded" />
      <div className="hidden md:block h-3 w-20 bg-[#e8edf8] rounded" />
      <div className="w-4 h-4 bg-[#e8edf8] rounded" />
    </div>
  );
}

// ── Create Ticket Modal ───────────────────────────────────────────────────────

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const { data: departments, isLoading: deptsLoading } = useGetDepartments();
  const { mutate: create, isPending } = useCreateTicket();

  const [deptId, setDeptId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = deptId && subject.trim() && message.trim() && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    create(
      { deptId, subject: subject.trim(), message: message.trim() },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-[#e2eaff] w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaff]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#e8900a]" />
            <h2 className="text-sm font-semibold text-[#031033]">
              New Support Ticket
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#f2f5fc] transition-colors"
            id="create-ticket-close"
          >
            <X className="w-4 h-4 text-[#9ba8c0]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5 overflow-y-auto">
          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-ticket-dept"
              className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide"
            >
              Department
            </label>
            <select
              id="create-ticket-dept"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              disabled={deptsLoading}
              className="w-full border border-[#e2eaff] bg-white text-sm text-[#031033] px-3 py-2 focus:outline-none focus:border-[#e8900a] transition-colors disabled:opacity-50"
            >
              <option value="">
                {deptsLoading ? "Loading…" : "Select department"}
              </option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-ticket-subject"
              className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide"
            >
              Subject
            </label>
            <input
              id="create-ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="w-full border border-[#e2eaff] bg-white text-sm text-[#031033] px-3 py-2 focus:outline-none focus:border-[#e8900a] transition-colors placeholder:text-[#c8d0e0]"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-ticket-message"
              className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide"
            >
              Message
            </label>
            <textarea
              id="create-ticket-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail…"
              rows={5}
              className="w-full border border-[#e2eaff] bg-white text-sm text-[#031033] px-3 py-2 focus:outline-none focus:border-[#e8900a] transition-colors placeholder:text-[#c8d0e0] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e2eaff]">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-sm font-semibold text-[#5a6a85] hover:text-[#031033] px-4 py-2 transition-colors"
            id="create-ticket-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            id="create-ticket-submit"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isPending ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const { data, isLoading, isError, refetch } = useGetTickets();
  const [showCreate, setShowCreate] = useState(false);

  const tickets = data?.tickets ?? [];
  const hasTickets = tickets.length > 0;
  const openCount = tickets.filter(
    (t) => !["Closed"].includes(t.status),
  ).length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;

  return (
    <div className="flex flex-col gap-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-extrabold text-[#031033]">
            Support Tickets
          </h1>
          <p className="text-[#5a6a85] mt-1 text-sm">
            Get help from our support team. Create a ticket or check existing
            ones.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          id="tickets-new-ticket"
          className="hidden sm:flex btn-primary text-sm py-2 px-4 items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Stats strip */}
      {hasTickets && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Tickets",
              value: data?.totalResults ?? tickets.length,
              color: "text-[#031033]",
            },
            { label: "Open", value: openCount, color: "text-blue-600" },
            { label: "Closed", value: closedCount, color: "text-gray-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white border border-[#e2eaff] px-4 py-3"
            >
              <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide">
                {label}
              </p>
              <p className={`text-2xl font-extrabold mt-1 ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tickets table */}
      <div className="bg-white border border-[#e2eaff]">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#9ba8c0]" />
            <h2 className="text-sm font-semibold text-[#031033]">
              Your Tickets
            </h2>
            {hasTickets && (
              <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                {data?.totalResults ?? tickets.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile new ticket button */}
            <button
              onClick={() => setShowCreate(true)}
              className="sm:hidden text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
              id="tickets-new-ticket-mobile"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
            {(isError || hasTickets) && (
              <button
                onClick={() => refetch()}
                className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
                id="tickets-refresh"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Column labels (desktop) */}
        {hasTickets && !isLoading && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2 bg-[#f6f9ff] border-b border-[#e2eaff]">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider">
              Subject
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-16">
              Priority
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-28">
              Status
            </p>
            <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wider w-24 hidden md:block text-right">
              Last Reply
            </p>
            <div className="w-4" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-300" />
            <p className="text-sm text-red-500">
              Could not load your tickets. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              id="tickets-retry"
              className="text-xs font-semibold text-[#e8900a] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading &&
          [...Array(4)].map((_, i) => <TicketRowSkeleton key={i} />)}

        {/* Empty */}
        {!isLoading && !isError && !hasTickets && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-[#9ba8c0]" />
            </div>
            <p className="text-sm text-[#5a6a85] max-w-xs mb-4">
              No support tickets yet. If you need help, create a ticket and
              our team will get back to you.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              id="tickets-empty-cta"
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          </div>
        )}

        {/* Ticket rows */}
        {hasTickets && (
          <div className="flex flex-col">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {/* Create ticket modal */}
      {showCreate && (
        <CreateTicketModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
