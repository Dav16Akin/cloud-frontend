"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Send,
  Loader2,
  User,
  Headphones,
} from "lucide-react";
import { useGetTicket, useReplyToTicket } from "@/hooks/useSupport";
import type { TicketReply } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function TicketStatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized.includes("open")) {
    return <span className="text-[12px] font-semibold text-[#1787D4] whitespace-nowrap">Open</span>;
  }
  if (normalized.includes("answered")) {
    return <span className="text-[12px] font-semibold text-[#1787D4] whitespace-nowrap">Answered</span>;
  }
  if (normalized.includes("customer")) {
    return <span className="text-[12px] font-semibold text-orange-600 whitespace-nowrap">Customer Reply</span>;
  }
  if (normalized.includes("closed")) {
    return <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">Closed</span>;
  }
  if (normalized.includes("in progress")) {
    return <span className="text-[12px] font-semibold text-[#1787D4] whitespace-nowrap">In Progress</span>;
  }

  return (
    <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
      {status || "Unknown"}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase() ?? "";
  const cls =
    p === "high"
      ? "text-red-600 font-semibold"
      : p === "medium"
      ? "text-orange-600 font-semibold"
      : "text-slate-500 font-medium";

  return (
    <span
      className={`text-[11px] uppercase tracking-wide ${cls}`}
    >
      {priority || "—"}
    </span>
  );
}

// ── Reply Bubble ──────────────────────────────────────────────────────────────

function ReplyBubble({ reply }: { reply: TicketReply }) {
  const isStaff = !!reply.admin;

  return (
    <div
      className={`flex gap-3 ${isStaff ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
          isStaff
            ? "bg-[#f2f5fc] border-[#e2eaff] text-[#5a6a85]"
            : "bg-[#eff6fb] border-[#d6e4ff] text-[#1787D4]"
        }`}
      >
        {isStaff ? (
          <Headphones className="w-3.5 h-3.5" />
        ) : (
          <User className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 max-w-[80%] rounded-xl border p-4 ${
          isStaff
            ? "bg-[#f6f9ff] border-[#e2eaff]"
            : "bg-[#f8faff] border-[#d6e4ff]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#031033]">
            {isStaff ? reply.admin || "Support Staff" : reply.name || "You"}
          </span>
          {isStaff && (
            <span className="text-[10px] font-bold bg-[#e2eaff] text-[#5a6a85] px-1.5 py-0.5 uppercase tracking-wide">
              Staff
            </span>
          )}
          <span className="text-[11px] text-[#9ba8c0] ml-auto">
            {formatDateTime(reply.date)}
          </span>
        </div>

        {/* Message — render HTML safely since WHMCS returns HTML content */}
        <div
          className="text-sm text-[#2d3748] leading-relaxed whitespace-pre-wrap break-words [&_br]:leading-loose"
          dangerouslySetInnerHTML={{ __html: reply.message }}
        />
      </div>
    </div>
  );
}

// ── Reply Form ────────────────────────────────────────────────────────────────

function ReplyForm({
  ticketId,
  isClosed,
  onSuccess,
}: {
  ticketId: string;
  isClosed: boolean;
  onSuccess?: () => void;
}) {
  const { mutate: sendReply, isPending } = useReplyToTicket();
  const [message, setMessage] = useState("");

  const canSubmit = message.trim().length > 0 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    sendReply(
      { ticketId, message: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
          if (onSuccess) {
            onSuccess();
          }
        },
      },
    );
  };

  if (isClosed) {
    return (
      <div className="bg-[#f2f5fc] border border-[#e2eaff] p-5 text-center">
        <p className="text-sm text-[#5a6a85]">
          This ticket is closed. To reopen it, please create a new ticket
          referencing this one.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#e2eaff]"
    >
      <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center gap-2">
        <Send className="w-4 h-4 text-[#9ba8c0]" />
        <h3 className="text-sm font-semibold text-[#031033]">Reply</h3>
      </div>

      <div className="p-5">
        <textarea
          id="ticket-reply-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply…"
          rows={4}
          className="w-full border border-[#e2eaff] bg-white text-sm text-[#031033] px-3 py-2 focus:outline-none focus:border-[#1787D4] transition-colors placeholder:text-[#c8d0e0] resize-none"
        />
      </div>

      <div className="flex items-center justify-end px-5 py-3 border-t border-[#e2eaff]">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          id="ticket-reply-submit"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isPending ? "Sending…" : "Send Reply"}
        </button>
      </div>
    </form>
  );
}

// ── Detail Skeleton ───────────────────────────────────────────────────────────

function TicketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border border-[#e2eaff] p-5">
        <div className="h-5 w-64 bg-[#e8edf8] rounded mb-3" />
        <div className="flex gap-3">
          <div className="h-4 w-20 bg-[#e8edf8] rounded" />
          <div className="h-4 w-16 bg-[#e8edf8] rounded" />
          <div className="h-4 w-24 bg-[#e8edf8] rounded" />
        </div>
      </div>
      {/* Replies skeleton */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
        >
          <div className="w-8 h-8 bg-[#e8edf8] shrink-0" />
          <div className="flex-1 max-w-[80%] border border-[#e8edf8] p-4">
            <div className="h-3 w-32 bg-[#e8edf8] rounded mb-3" />
            <div className="h-4 w-full bg-[#e8edf8] rounded mb-2" />
            <div className="h-4 w-3/4 bg-[#e8edf8] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const { data: ticket, isLoading, isError, refetch } = useGetTicket(ticketId);

  const isClosed = ticket?.status?.toLowerCase() === "closed";

  return (
    <div className="flex flex-col gap-7 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/tickets"
        id="ticket-detail-back"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a6a85] hover:text-[#1787D4] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All Tickets
      </Link>

      {/* Error */}
      {isError && (
        <div className="bg-white border border-[#e2eaff] flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-300" />
          <p className="text-sm text-red-500">
            Could not load this ticket. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            id="ticket-detail-retry"
            className="text-xs font-semibold text-[#1787D4] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && <TicketDetailSkeleton />}

      {/* Ticket loaded */}
      {ticket && (
        <>
          {/* Ticket header */}
          <div className="bg-white border border-[#e2eaff]">
            <div className="px-5 py-4 border-b border-[#e2eaff] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1787D4]" />
              <h2 className="text-base font-extrabold text-[#031033] truncate">
                {ticket.subject}
              </h2>
            </div>

            <div className="px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Ticket number */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-0.5">
                  Ticket #
                </p>
                <p className="text-sm font-semibold text-[#031033] font-mono">
                  {ticket.ticketNumber}
                </p>
              </div>

              {/* Department */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-0.5">
                  Department
                </p>
                <p className="text-sm font-semibold text-[#031033]">
                  {ticket.departmentName}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-1">
                  Status
                </p>
                <TicketStatusBadge status={ticket.status} />
              </div>

              {/* Priority */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-1">
                  Priority
                </p>
                <PriorityBadge priority={ticket.priority} />
              </div>

              {/* Opened */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-0.5">
                  Opened
                </p>
                <p className="text-sm text-[#5a6a85]">
                  {formatDateTime(ticket.date)}
                </p>
              </div>

              {/* Last Reply */}
              <div>
                <p className="text-[11px] font-bold text-[#9ba8c0] uppercase tracking-wide mb-0.5">
                  Last Reply
                </p>
                <p className="text-sm text-[#5a6a85]">
                  {formatDateTime(ticket.lastReply)}
                </p>
              </div>
            </div>
          </div>

          {/* Replies thread */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="w-4 h-4 text-[#9ba8c0]" />
              <h2 className="text-sm font-semibold text-[#031033]">
                Conversation
              </h2>
              <span className="text-[11px] font-bold bg-[#f2f5fc] text-[#5a6a85] border border-[#e2eaff] px-1.5 py-0.5">
                {ticket.replies.length}
              </span>
              <button
                onClick={() => refetch()}
                className="ml-auto text-xs font-semibold text-[#1787D4] hover:underline flex items-center gap-1"
                id="ticket-detail-refresh"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {ticket.replies.length === 0 ? (
              <div className="bg-[#f6f9ff] border border-[#e2eaff] p-5 text-center">
                <p className="text-sm text-[#5a6a85]">
                  No replies yet. Our team will respond shortly.
                </p>
              </div>
            ) : (
              ticket.replies.map((reply, idx) => (
                <ReplyBubble key={reply.id || idx} reply={reply} />
              ))
            )}
          </div>

          {/* Reply form */}
          <ReplyForm ticketId={ticket.id} isClosed={isClosed} onSuccess={() => refetch()} />
        </>
      )}
    </div>
  );
}
