"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Paperclip,
  ShieldCheck,
  Headphones,
  Sparkles,
  Loader2,
  Check,
  Clock,
  X,
  FileText,
} from "lucide-react";
import {
  useGetDepartments,
  useCreateTicket,
} from "@/hooks/useSupport";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";
import { toast } from "sonner";

const QUICK_CATEGORIES = [
  "Domain",
  "Web Hosting",
  "VPS",
  "Cloud Hosting",
  "SSL Certificate",
  "Account",
  "Billing & Payments",
  "Other",
];

const PRIORITIES = ["Low", "Normal", "High", "Urgent"] as const;

function CreateTicketContent() {
  const searchParams = useSearchParams();
  const isFromAi = searchParams.get("from") === "ai";

  const { data: departments, isLoading: loadingDepts } = useGetDepartments();
  const { data: hostingAccounts } = useGetHosting();
  const { data: registeredDomains } = useGetRegisteredDomains();
  const createMutation = useCreateTicket();

  // Form State
  const [subject, setSubject] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>("Normal");
  const [description, setDescription] = useState("");
  const [activeCategoryChip, setActiveCategoryChip] = useState<string | null>(
    null
  );
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Post-creation success state
  const [createdTicket, setCreatedTicket] = useState<{
    ticketId: string;
    ticketNumber?: string;
    tid?: string;
    subject: string;
  } | null>(null);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error("Some files exceed the 10MB limit and were skipped.");
      }
      setAttachedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Category pill selection logic
  const handleCategoryChipClick = (catName: string) => {
    setActiveCategoryChip(catName);
    // Find matching department if any
    if (departments && departments.length > 0) {
      const match = departments.find(
        (d) =>
          d.name.toLowerCase().includes(catName.toLowerCase()) ||
          catName.toLowerCase().includes(d.name.toLowerCase())
      );
      if (match) {
        setSelectedDeptId(match.id);
      }
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const deptId = selectedDeptId || (departments && departments[0]?.id) || "1";

    if (!description.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    // Build message including service if selected
    let fullMessage = description.trim();
    if (selectedService) {
      fullMessage = `[Service: ${selectedService}]\n\n${fullMessage}`;
    }
    if (attachedFiles.length > 0) {
      fullMessage += `\n\n[Attachments: ${attachedFiles.map((f) => f.name).join(", ")}]`;
    }

    try {
      const result = await createMutation.mutateAsync({
        deptId: String(deptId),
        subject: subject.trim(),
        message: fullMessage,
        priority: priority.toLowerCase(),
        service: selectedService || undefined,
      });

      if (result?.success && result?.data?.ticketId) {
        setCreatedTicket({
          ticketId: result.data.ticketId,
          ticketNumber: result.data.ticketNumber || result.data.ticketId,
          tid: result.data.ticketNumber || result.data.ticketId,
          subject: subject.trim(),
        });
      } else {
        // Never invent a ticket: tell the user to check the list instead.
        toast.error(
          result?.message ||
            "We couldn't confirm your ticket. Check your tickets list before submitting again."
        );
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  // ── SUCCESS STATE (Screenshot 1 Screen 3) ──────────────────────────────────
  if (createdTicket) {
    const displayTicketId = createdTicket.tid || createdTicket.ticketNumber || createdTicket.ticketId;
    const formattedId = displayTicketId.startsWith("#")
      ? displayTicketId
      : displayTicketId.startsWith("TKT-")
      ? `#${displayTicketId}`
      : `#TKT-${displayTicketId}`;

    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16 pt-2">
        {/* Back Link */}
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to support tickets</span>
        </Link>

        {/* Success Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 sm:p-10 text-center flex flex-col items-center">
          <Check className="w-6 h-6 text-[#0E7C3A] mb-4" />

          <h1 className="text-2xl font-semibold text-[#031033]">
            Your support ticket has been created
          </h1>
          <p className="text-sm text-[#5A6A85] mt-2 max-w-md mx-auto">
            We&apos;ve received your request. Our support team will review it and send updates to your account email.
          </p>

          {/* Ticket Information */}
          <div className="w-full max-w-md mt-6 border border-[#E2E8F0] rounded-lg px-4 py-1 text-left divide-y divide-[#EEF2F7]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-[#5A6A85]">
                Ticket ID
              </span>
              <span className="text-sm font-mono text-[#031033]">
                {formattedId}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-[#5A6A85]">
                Subject
              </span>
              <span className="text-sm font-medium text-[#031033] truncate max-w-[240px]">
                {createdTicket.subject}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-[#5A6A85]">
                Status
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#1787D4]" />
                Open
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6 w-full max-w-md">
            <Link
              href={`/dashboard/tickets/${encodeURIComponent(createdTicket.ticketId)}`}
              className="flex-1 inline-flex items-center justify-center h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              View ticket
            </Link>
            <Link
              href="/dashboard/tickets"
              className="flex-1 inline-flex items-center justify-center h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Back to support
            </Link>
          </div>

          {/* Response time */}
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#5A6A85]">
            <Clock className="w-3.5 h-3.5" />
            <span>Typical response time: within 2 hours.</span>
          </div>
        </div>
      </div>
    );
  }

  // ── AI HANDOFF BANNER (Screenshot 4) ───────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={isFromAi ? "/dashboard" : "/dashboard/tickets"}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFromAi ? "Back to conversation" : "Back to support tickets"}</span>
        </Link>
      </div>

      {/* AI Alert Banner if from AI */}
      {isFromAi && (
        <div className="bg-[#E8F4FC] border border-[#1787D4]/20 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-medium text-[#031033]">
                Prepared from your Ask AI conversation
              </h2>
              <p className="text-xs text-[#5A6A85] mt-0.5">
                Add the details from your conversation below, then submit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">
          {isFromAi ? "Create support ticket" : "How can we help?"}
        </h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          {isFromAi
            ? "Describe the issue below, then submit it to Support."
            : "Tell us what's happening and we'll connect you with the right support specialist."}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6">
          {/* Subheader inside card if AI */}
          {isFromAi && (
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EEF2F7]">
              <div>
                <h2 className="text-base font-semibold text-[#031033]">
                  Request details
                </h2>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Fill in the subject and description to continue.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ticket-subject"
                className="text-sm font-medium text-[#031033]"
              >
                Subject
              </label>
              <input
                id="ticket-subject"
                type="text"
                placeholder="Briefly describe the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
              />
            </div>

            {/* Category and Service Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-category"
                  className="text-sm font-medium text-[#031033]"
                >
                  Category
                </label>
                <select
                  id="ticket-category"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors cursor-pointer"
                >
                  <option value="">
                    {loadingDepts ? "Loading departments..." : "Select a category"}
                  </option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                  {/* Fallback standard departments if API returns empty */}
                  {(!departments || departments.length === 0) && (
                    <>
                      <option value="1">Technical Support</option>
                      <option value="2">Billing & Invoices</option>
                      <option value="3">Sales & Inquiries</option>
                    </>
                  )}
                </select>

                {/* Quick Category Chips */}
                {!isFromAi && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {QUICK_CATEGORIES.map((cat) => {
                      const isSelected = activeCategoryChip === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryChipClick(cat)}
                          className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                            isSelected
                              ? "bg-[#E8F4FC] text-[#1370B5] border-[#1787D4]"
                              : "bg-white text-[#5A6A85] border-[#E2E8F0] hover:bg-[#F2F5FC] hover:text-[#031033]"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Service */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-service"
                  className="text-sm font-medium text-[#031033]"
                >
                  Service
                </label>
                <select
                  id="ticket-service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors cursor-pointer"
                >
                  <option value="">Select connected service (optional)</option>
                  {hostingAccounts?.map((h) => (
                    <option key={h.id} value={h.domain}>
                      {h.domain} {h.plan?.name ? `— ${h.plan.name}` : "— Web Hosting"}
                    </option>
                  ))}
                  {registeredDomains?.map((d) => (
                    <option key={d.id} value={d.domain}>
                      {d.domain} — Domain
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#5A6A85]">
                  Account-level services linked to your profile
                </p>
              </div>
            </div>

            {/* Priority */}
            {!isFromAi && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-priority"
                  className="text-sm font-medium text-[#031033]"
                >
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors cursor-pointer"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 pt-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`h-7 px-3 rounded-md text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                        priority === p
                          ? "bg-[#E8F4FC] text-[#1370B5] border-[#1787D4]"
                          : "bg-white text-[#5A6A85] border-[#E2E8F0] hover:bg-[#F2F5FC] hover:text-[#031033]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ticket-description"
                className="text-sm font-medium text-[#031033]"
              >
                Description
              </label>
              <textarea
                id="ticket-description"
                rows={5}
                placeholder="Share the steps you've tried, any error messages, and when the issue started."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors resize-y"
              />
            </div>

            {/* File upload (no conversation transcript is attached to the ticket) */}
              <div className="flex flex-col gap-2">
                <label className="border border-dashed border-[#D5DCE6] hover:border-[#1787D4] rounded-lg p-6 text-center cursor-pointer transition-colors bg-white hover:bg-[#F2F5FC] flex flex-col items-center justify-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Paperclip className="w-4 h-4 text-[#5A6A85]" />
                  <div>
                    <span className="text-sm font-medium text-[#1787D4]">
                      Drop files here or choose files
                    </span>
                    <p className="text-xs text-[#5A6A85] mt-0.5">
                      Screenshots and documents up to 10MB each
                    </p>
                  </div>
                </label>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF2F7] rounded-lg text-xs text-[#031033]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5A6A85]" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={`Remove ${file.name}`}
                          className="text-[#5A6A85] hover:text-[#C21F1F] transition-colors cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                id="btn-submit-support-ticket"
                disabled={createMutation.isPending}
                className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>Submit ticket</span>
              </button>

              <Link
                href="/dashboard/tickets"
                className="inline-flex items-center h-9 px-4 text-sm font-medium text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Information Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {(
            /* Get the fastest help card (shown for every entry point) */
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-[#031033]">
                  <Headphones className="w-4 h-4 text-[#5A6A85]" />
                  Get the fastest help
                </h3>
                <p className="text-sm text-[#5A6A85] mt-1">
                  Choose the service connected to your issue and include a screenshot when possible.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-[#EEF2F7] text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#5A6A85]">Typical response</span>
                  <span className="font-medium text-[#031033]">Within 2 hours</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#5A6A85]">Updates</span>
                  <span className="font-medium text-[#031033]">Account email</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#5A6A85]">Attachments</span>
                  <span className="font-medium text-[#031033]">Secure and private</span>
                </div>
              </div>

              {/* Privacy note */}
              <div className="bg-[#E8F4FC] border border-[#1787D4]/20 rounded-lg px-4 py-3 flex items-start gap-2.5 text-xs text-[#031033]">
                <ShieldCheck className="w-4 h-4 text-[#1787D4] shrink-0" />
                <span>Only authorized support staff can view your ticket.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading ticket form…</p>
        </div>
      }
    >
      <CreateTicketContent />
    </Suspense>
  );
}
