"use client";

import { useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Send,
  Loader2,
  Headphones,
  Paperclip,
  CheckCircle2,
  Clock,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  useGetTicket,
  useReplyToTicket,
  useCloseTicket,
  useReopenTicket,
} from "@/hooks/useSupport";
import { useGetMe } from "@/hooks/useUser";
import type { TicketReply } from "@/lib/api";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFullDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTimeWithBullet(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} • ${time}`;
  } catch {
    return dateStr;
  }
}

function formatShortTime(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getTicketStatusDetails(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("progress")) {
    return {
      type: "in_progress",
      label: "In progress",
      badgeClass: "bg-[#1787D4]",
    };
  }
  if (s.includes("wait") || s.includes("customer")) {
    return {
      type: "waiting",
      label: "Waiting for you",
      badgeClass: "bg-[#E8900A]",
    };
  }
  if (s.includes("resolve") || s.includes("completed")) {
    return {
      type: "resolved",
      label: "Resolved",
      badgeClass: "bg-[#12A150]",
    };
  }
  if (s.includes("close")) {
    return {
      type: "closed",
      label: "Closed",
      badgeClass: "bg-[#9AA6B8]",
    };
  }
  return {
    type: "open",
    label: "Open",
    badgeClass: "bg-[#1787D4]",
  };
}

function extractServiceFromText(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/\[Service:\s*([^\]]+)\]/i);
  return match ? match[1].trim() : null;
}

function cleanMessageText(rawHtmlOrText: string): string {
  if (!rawHtmlOrText) return "";
  // Strip out [Service: ...] tag from display message if present
  return rawHtmlOrText.replace(/\[Service:\s*[^\]]+\]\n*/gi, "").trim();
}

// ── Conversation Message Bubble ───────────────────────────────────────────────

function ConversationMessage({
  reply,
  clientInitial = "—",
}: {
  reply: TicketReply;
  clientInitial?: string;
}) {
  const isStaff = !!reply.admin;
  const displayName = isStaff ? reply.admin || "Support Team" : "You";
  const displayTime = formatShortTime(reply.date);
  const cleaned = cleanMessageText(reply.message);
  const safeHtml = useMemo(
    () => sanitizeHtml(cleaned || reply.message),
    [cleaned, reply.message],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Header: Avatar, Name, Timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isStaff ? (
            <div className="w-7 h-7 rounded-full bg-[#E8F4FC] text-[#1370B5] flex items-center justify-center shrink-0">
              <Headphones className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#EEF2F7] text-[#031033] font-medium text-xs flex items-center justify-center shrink-0">
              {clientInitial}
            </div>
          )}
          <span className="text-sm font-medium text-[#031033]">
            {displayName}
          </span>
        </div>
        <span className="text-xs text-[#5A6A85] tabular-nums">{displayTime}</span>
      </div>

      {/* Bubble container */}
      <div
        className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isStaff
            ? "bg-white border border-[#E2E8F0] text-[#031033]"
            : "bg-[#F2F5FC] border border-[#EEF2F7] text-[#031033]"
        }`}
      >
        {safeHtml === null ? (
          <div className="whitespace-pre-wrap break-words">
            {cleaned || reply.message}
          </div>
        ) : (
          <div
            className="whitespace-pre-wrap break-words [&_br]:leading-loose"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )}
      </div>
    </div>
  );
}

// ── Close Modal ───────────────────────────────────────────────────────────────

function CloseTicketModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  ticketIdStr,
  subject,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  ticketIdStr: string;
  subject: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031033]/40 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-xl max-w-md w-full shadow-xl flex flex-col"
      >
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-[#031033]">
            Close this ticket?
          </h2>
          <p className="text-sm text-[#5A6A85] mt-1">
            Are you sure you want to close this support request? You can reopen it later if you need further assistance.
          </p>
        </div>

        {/* Ticket Summary Box */}
        <div className="px-6 py-4">
          <div className="border border-[#E2E8F0] rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <span className="font-mono text-[#031033] shrink-0">{ticketIdStr}</span>
            <span className="text-[#5A6A85] truncate max-w-[200px]">
              {subject}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Close ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reopen Modal ──────────────────────────────────────────────────────────────

function ReopenTicketModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  ticketIdStr,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  ticketIdStr: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031033]/40 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-xl max-w-md w-full shadow-xl flex flex-col"
      >
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-[#031033]">
            Reopen this ticket?
          </h2>
          <p className="text-sm text-[#5A6A85] mt-1">
            If the issue hasn&apos;t been fully resolved, you can reopen this ticket and continue the conversation with support.
          </p>
        </div>

        {/* Transition Summary Box */}
        <div className="px-6 py-4">
          <div className="border border-[#E2E8F0] rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <span className="font-mono text-[#031033]">{ticketIdStr}</span>
            <span className="text-[#5A6A85]">
              Closed → In progress
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Reopen ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Ticket Detail Component ──────────────────────────────────────────────

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;

  const { data: ticket, isLoading, isError, refetch } = useGetTicket(ticketId);
  const { data: me } = useGetMe();
  const clientInitial = useMemo(() => {
    const u = me?.data;
    const fromName = `${u?.firstName?.trim()?.[0] ?? ""}${u?.lastName?.trim()?.[0] ?? ""}`;
    const initials = fromName || u?.email?.trim()?.[0] || "";
    return initials ? initials.toUpperCase() : "—";
  }, [me]);
  const replyMutation = useReplyToTicket();
  const closeMutation = useCloseTicket();
  const reopenMutation = useReopenTicket();

  // Reply Composer State
  const [replyMessage, setReplyMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Formatted Ticket ID
  const ticketNumberStr = useMemo(() => {
    if (!ticket) return `#TKT-${ticketId}`;
    const raw = ticket.ticketNumber || ticket.id || ticketId;
    if (raw.startsWith("#")) return raw;
    if (raw.startsWith("TKT-")) return `#${raw}`;
    return `#TKT-${raw}`;
  }, [ticket, ticketId]);

  // Derived status details
  const statusInfo = useMemo(() => {
    return getTicketStatusDetails(ticket?.status || "");
  }, [ticket?.status]);

  // Detected Service name
  const detectedService = useMemo(() => {
    if (!ticket) return null;
    // Check replies
    for (const r of ticket.replies || []) {
      const s = extractServiceFromText(r.message);
      if (s) return s;
    }
    // Check subject for domain-like strings (e.g. acme.com)
    const subjMatch = ticket.subject.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    if (subjMatch) return subjMatch[1];
    return null;
  }, [ticket]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error("Files larger than 10MB were excluded.");
      }
      setAttachedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    let finalMessage = replyMessage.trim();
    if (attachedFiles.length > 0) {
      finalMessage += `\n\n[Attachments: ${attachedFiles.map((f) => f.name).join(", ")}]`;
    }

    try {
      await replyMutation.mutateAsync({
        ticketId,
        message: finalMessage,
      });
      setReplyMessage("");
      setAttachedFiles([]);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  // Close Ticket Action
  const handleConfirmClose = async () => {
    try {
      await closeMutation.mutateAsync({ ticketId });
      setIsCloseModalOpen(false);
      refetch();
    } catch {
      // Handled by mutation toast
    }
  };

  // Reopen Ticket Action
  const handleConfirmReopen = async () => {
    try {
      await reopenMutation.mutateAsync({ ticketId });
      setIsReopenModalOpen(false);
      refetch();
    } catch {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 max-w-6xl mx-auto">
        <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        <p className="text-sm text-[#5A6A85]">Loading ticket details…</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to support tickets</span>
        </Link>
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#DC2626]" />
          <h2 className="text-base font-semibold text-[#031033]">
            Could not load ticket
          </h2>
          <p className="text-sm text-[#5A6A85]">
            This ticket may not exist or could not be retrieved.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isResolved = statusInfo.type === "resolved";
  const isClosed = statusInfo.type === "closed";
  const isWaiting = statusInfo.type === "waiting";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* ── Top Back Link ────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to support tickets</span>
        </Link>
      </div>

      {/* ── Ticket Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-[#031033]">
            {ticketNumberStr}
          </h1>
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${statusInfo.badgeClass}`} />
            {statusInfo.label}
          </span>
        </div>
        <p className="text-base font-medium text-[#031033]">
          {ticket.subject}
        </p>
        <p className="text-sm text-[#5A6A85]">
          Created {formatFullDate(ticket.date)}
        </p>
      </div>

      {/* ── Status Notice Banners (Conditional) ─────────────────────────── */}
      {isWaiting && (
        <div className="bg-[#FFF4E0] border border-[#E8900A]/25 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#E8900A] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-medium text-[#9A5B00]">
              Our support team needs more information to continue with this request.
            </h2>
            <p className="text-xs text-[#9A5B00] mt-0.5">
              Replying will return this ticket to In progress.
            </p>
          </div>
        </div>
      )}

      {isResolved && (
        <div className="bg-[#E7F6EC] border border-[#0E7C3A]/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#0E7C3A] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-medium text-[#0E7C3A]">
              Your issue has been resolved.
            </h2>
            <p className="text-xs text-[#031033] mt-0.5">
              Our support team has completed this request. If you still have questions, you can reopen it below.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Conversation Thread & Actions */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F7]">
              <h2 className="text-base font-semibold text-[#031033]">
                Conversation
              </h2>
              <span className="text-xs text-[#5A6A85]">
                You and support team
              </span>
            </div>

            <div className="p-5 flex flex-col gap-6">
            {/* Replies Thread */}
            <div className="flex flex-col gap-6">
              {ticket.replies && ticket.replies.length > 0 ? (
                ticket.replies.map((reply, idx) => (
                  <ConversationMessage
                    key={reply.id || idx}
                    reply={reply}
                    clientInitial={clientInitial}
                  />
                ))
              ) : (
                <div className="border border-dashed border-[#D5DCE6] rounded-lg px-4 py-3 text-center text-sm text-[#5A6A85]">
                  No messages yet. Our support team will respond shortly.
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            {isResolved ? (
              /* Resolved action bar: Reopen or Close */
              <div className="pt-4 border-t border-[#EEF2F7] flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="btn-reopen-ticket"
                  onClick={() => setIsReopenModalOpen(true)}
                  className="h-9 px-4 bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Reopen ticket
                </button>
                <button
                  type="button"
                  id="btn-close-ticket"
                  onClick={() => setIsCloseModalOpen(true)}
                  className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Close ticket
                </button>
              </div>
            ) : isClosed ? (
              /* Closed state: Reopen Ticket button */
              <div className="pt-4 border-t border-[#EEF2F7] flex items-center justify-between gap-3">
                <p className="text-sm text-[#5A6A85]">
                  This ticket is marked as closed.
                </p>
                <button
                  type="button"
                  id="btn-reopen-ticket"
                  onClick={() => setIsReopenModalOpen(true)}
                  className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Reopen ticket
                </button>
              </div>
            ) : (
              /* Active composer (Open / In Progress / Waiting for You) */
              <form
                onSubmit={handleSendReply}
                className="pt-4 border-t border-[#EEF2F7] flex flex-col gap-3"
              >
                <textarea
                  id="ticket-reply-textarea"
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={
                    isWaiting
                      ? "Add the requested screenshot and reply..."
                      : "Write a reply..."
                  }
                  className="w-full px-3 py-2.5 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors resize-y"
                />

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF2F7] rounded-lg text-xs text-[#031033]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5A6A85]" />
                        <span className="truncate max-w-[160px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={`Remove ${file.name}`}
                          className="text-[#5A6A85] hover:text-[#C21F1F] transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Toolbar */}
                <div className="flex items-center justify-between">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 h-8 px-3 text-sm font-medium text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                    >
                      <Paperclip className="w-4 h-4 text-[#5A6A85]" />
                      <span>Attach file</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    id="btn-send-reply"
                    disabled={replyMutation.isPending || !replyMessage.trim()}
                    className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isWaiting ? "Reply to ticket" : "Send reply"}</span>
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Information Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F7]">
              <h2 className="text-base font-semibold text-[#031033]">
                Ticket information
              </h2>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-[#5A6A85] hover:text-[#1787D4] transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                title="Refresh ticket"
                aria-label="Refresh ticket"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Fields List */}
            <div className="px-5 py-2 flex flex-col divide-y divide-[#EEF2F7] text-sm">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Ticket ID</span>
                <span className="text-[#031033] font-mono">
                  {ticketNumberStr}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Category</span>
                <span className="font-medium text-[#031033] text-right">
                  {ticket.departmentName || "General support"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Service</span>
                <span className={`font-medium text-right ${detectedService ? "text-[#031033]" : "text-[#5A6A85]"}`}>
                  {detectedService || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Priority</span>
                <span className="font-medium text-[#031033] capitalize">
                  {ticket.priority || "Normal"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Created</span>
                <span className="text-[#031033] tabular-nums text-right">
                  {formatDateTimeWithBullet(ticket.date)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Last updated</span>
                <span className="text-[#031033] tabular-nums text-right">
                  {formatDateTimeWithBullet(ticket.lastReply || ticket.date)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Assigned to</span>
                <span className="font-medium text-[#031033]">
                  Support team
                </span>
              </div>
            </div>

            {/* SLA note */}
            <div className="px-5 py-4 border-t border-[#EEF2F7] flex items-start gap-2 text-xs text-[#5A6A85]">
              <Clock className="w-4 h-4 text-[#5A6A85] shrink-0" />
              <span>Most requests receive a response within 2 hours.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <CloseTicketModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
        isPending={closeMutation.isPending}
        ticketIdStr={ticketNumberStr}
        subject={ticket.subject}
      />

      <ReopenTicketModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleConfirmReopen}
        isPending={reopenMutation.isPending}
        ticketIdStr={ticketNumberStr}
      />
    </div>
  );
}
