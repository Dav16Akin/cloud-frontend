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
  Info,
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
import type { TicketReply } from "@/lib/api";
import { toast } from "sonner";

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
      label: "In Progress",
      badgeClass: "bg-[#e8fbf7] text-[#0f9f8c] border-[#b9f2e8]",
    };
  }
  if (s.includes("wait") || s.includes("customer")) {
    return {
      type: "waiting",
      label: "Waiting for You",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (s.includes("resolve") || s.includes("completed")) {
    return {
      type: "resolved",
      label: "Resolved",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (s.includes("close")) {
    return {
      type: "closed",
      label: "Closed",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }
  return {
    type: "open",
    label: "Open",
    badgeClass: "bg-blue-50 text-[#1787D4] border-blue-200",
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
  clientInitial = "A",
}: {
  reply: TicketReply;
  clientInitial?: string;
}) {
  const isStaff = !!reply.admin;
  const displayName = isStaff ? reply.admin || "Support Team" : "You";
  const displayTime = formatShortTime(reply.date);
  const cleaned = cleanMessageText(reply.message);

  return (
    <div className="flex flex-col gap-2">
      {/* Header: Avatar, Name, Timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isStaff ? (
            <div className="w-7 h-7 rounded-full bg-[#e0f5f1] text-[#0f9f8c] flex items-center justify-center shrink-0 border border-[#b9f2e8]">
              <Headphones className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#ffdcd7] text-[#c04b3a] font-bold text-xs flex items-center justify-center shrink-0">
              {clientInitial}
            </div>
          )}
          <span className="text-[13.5px] font-bold text-[#1d1d1f]">
            {displayName}
          </span>
        </div>
        <span className="text-[12px] text-[#9ba8c0]">{displayTime}</span>
      </div>

      {/* Bubble container */}
      <div
        className={`rounded-2xl p-4 text-[13.5px] leading-relaxed transition-all ${
          isStaff
            ? "bg-white border border-[#e2e8f0] text-[#1d1d1f] shadow-2xs"
            : "bg-[#fef6f5] border border-[#fde8e5] text-[#2c3e50]"
        }`}
      >
        <div
          className="whitespace-pre-wrap break-words [&_br]:leading-loose"
          dangerouslySetInnerHTML={{ __html: cleaned || reply.message }}
        />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e2eaff] flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#eaf4fd] text-[#1787D4] flex items-center justify-center shrink-0 border border-[#d2e7fa]">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#1d1d1f]">
              Close this ticket?
            </h2>
            <p className="text-[12.5px] text-[#6e6e73] mt-1 leading-relaxed">
              Are you sure you want to close this support request? You can reopen it later if you need further assistance.
            </p>
          </div>
        </div>

        {/* Ticket Summary Box */}
        <div className="bg-[#fbfcfe] border border-[#e2eaff] rounded-xl px-4 py-3 flex items-center justify-between text-[13px]">
          <span className="font-bold text-[#1d1d1f]">{ticketIdStr}</span>
          <span className="text-[#6e6e73] truncate max-w-[200px] font-medium">
            {subject}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Close Ticket</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e2eaff] flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#e6f9f6] text-[#0f9f8c] flex items-center justify-center shrink-0 border border-[#b8ece5]">
            <RefreshCw className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#1d1d1f]">
              Reopen this ticket?
            </h2>
            <p className="text-[12.5px] text-[#6e6e73] mt-1 leading-relaxed">
              If the issue hasn&apos;t been fully resolved, you can reopen this ticket and continue the conversation with support.
            </p>
          </div>
        </div>

        {/* Transition Summary Box */}
        <div className="bg-[#fbfcfe] border border-[#e2eaff] rounded-xl px-4 py-3 flex items-center justify-between text-[13px]">
          <span className="font-bold text-[#1d1d1f]">{ticketIdStr}</span>
          <span className="text-[#0f9f8c] font-semibold flex items-center gap-1.5">
            Closed → In Progress
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Reopen Ticket</span>
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
        <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        <p className="text-[13.5px] text-[#6e6e73]">Loading ticket details…</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Tickets</span>
        </Link>
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-10 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h2 className="text-[16px] font-bold text-[#1d1d1f]">
            Could not load ticket
          </h2>
          <p className="text-[13px] text-[#6e6e73]">
            This ticket may not exist or could not be retrieved.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-[#1787D4] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Try Again
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
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Tickets</span>
        </Link>
      </div>

      {/* ── Ticket Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
            style={{ letterSpacing: "-0.4px" }}
          >
            {ticketNumberStr}
          </h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </span>
        </div>
        <p className="text-[16px] font-semibold text-[#1d1d1f] mt-0.5">
          {ticket.subject}
        </p>
        <p className="text-[12px] text-[#9ba8c0]">
          Created {formatFullDate(ticket.date)}
        </p>
      </div>

      {/* ── Status Notice Banners (Conditional) ─────────────────────────── */}
      {isWaiting && (
        <div className="bg-[#fff9eb] border border-[#fde4ad] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#fde9bc] text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13.5px] font-bold text-amber-900">
              Our support team needs more information to continue with this request.
            </h2>
            <p className="text-[12.5px] text-amber-800 mt-0.5">
              Reply will return this ticket to In Progress.
            </p>
          </div>
        </div>
      )}

      {isResolved && (
        <div className="bg-[#f0fdf9] border border-[#99f6e4] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#ccfbf1] text-[#0f9f8c] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13.5px] font-bold text-[#134e4a]">
              Your issue has been resolved.
            </h2>
            <p className="text-[12.5px] text-[#0f766e] mt-0.5">
              Our support team has completed this request. If you still have questions, you can reopen it below.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Conversation Thread & Actions */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f9]">
              <h2 className="text-[15px] font-bold text-[#1d1d1f]">
                Conversation
              </h2>
              <span className="text-[12px] text-[#9ba8c0] font-medium">
                You and Support Team
              </span>
            </div>

            {/* Replies Thread */}
            <div className="flex flex-col gap-6">
              {ticket.replies && ticket.replies.length > 0 ? (
                ticket.replies.map((reply, idx) => (
                  <ConversationMessage
                    key={reply.id || idx}
                    reply={reply}
                    clientInitial="A"
                  />
                ))
              ) : (
                <div className="bg-[#fbfcfe] border border-[#e2eaff] rounded-xl p-6 text-center text-[13px] text-[#6e6e73]">
                  No messages yet. Our support team will respond shortly.
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            {isResolved ? (
              /* Resolved action bar: Reopen or Close */
              <div className="pt-4 border-t border-[#f0f4f9] flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="btn-reopen-ticket"
                  onClick={() => setIsReopenModalOpen(true)}
                  className="px-5 py-2.5 bg-white border border-[#e2eaff] hover:bg-gray-50 text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Reopen Ticket
                </button>
                <button
                  type="button"
                  id="btn-close-ticket"
                  onClick={() => setIsCloseModalOpen(true)}
                  className="px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Close Ticket
                </button>
              </div>
            ) : isClosed ? (
              /* Closed state: Reopen Ticket button */
              <div className="pt-4 border-t border-[#f0f4f9] flex items-center justify-between gap-3">
                <p className="text-[12.5px] text-[#6e6e73]">
                  This ticket is marked as closed.
                </p>
                <button
                  type="button"
                  id="btn-reopen-ticket"
                  onClick={() => setIsReopenModalOpen(true)}
                  className="px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Reopen Ticket
                </button>
              </div>
            ) : (
              /* Active composer (Open / In Progress / Waiting for You) */
              <form
                onSubmit={handleSendReply}
                className="pt-2 border-t border-[#f0f4f9] flex flex-col gap-3"
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
                  className="w-full px-4 py-3 bg-[#fbfcfe] border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] focus:bg-white transition-colors resize-y shadow-2xs"
                />

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f4f9] rounded-lg text-[12px] text-[#1d1d1f]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5a6a85]" />
                        <span className="truncate max-w-[160px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-[#6e6e73] hover:text-red-600 cursor-pointer"
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
                      className="inline-flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold text-[#5a6a85] hover:text-[#1d1d1f] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-[#9ba8c0]" />
                      <span>Attach File</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    id="btn-send-reply"
                    disabled={replyMutation.isPending || !replyMessage.trim()}
                    className="px-5 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isWaiting ? "Reply to Ticket" : "Send Reply"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Information Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f9]">
              <h2 className="text-[15px] font-bold text-[#1d1d1f]">
                Ticket Information
              </h2>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-[#9ba8c0] hover:text-[#1787D4] transition-colors cursor-pointer"
                title="Refresh ticket"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Fields List */}
            <div className="flex flex-col divide-y divide-[#f0f4f9] text-[13px]">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Ticket ID</span>
                <span className="font-bold text-[#1d1d1f] font-mono">
                  {ticketNumberStr}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Category</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {ticket.departmentName || "General Support"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Service</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {detectedService || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Priority</span>
                <span className="font-semibold text-[#1d1d1f] capitalize">
                  {ticket.priority || "Normal"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Created</span>
                <span className="text-[#1d1d1f] font-medium text-[12.5px]">
                  {formatDateTimeWithBullet(ticket.date)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Last Updated</span>
                <span className="text-[#1d1d1f] font-medium text-[12.5px]">
                  {formatDateTimeWithBullet(ticket.lastReply || ticket.date)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#6e6e73]">Assigned To</span>
                <span className="font-semibold text-[#1d1d1f]">
                  Support Team
                </span>
              </div>
            </div>

            {/* Bottom SLA Callout */}
            <div className="bg-[#f0fdf9] border border-[#99f6e4] rounded-xl p-3 flex items-start gap-2.5 text-[11.5px] text-[#0f766e]">
              <Clock className="w-4 h-4 text-[#0f9f8c] shrink-0 mt-0.5" />
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
