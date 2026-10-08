"use client";

import { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
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
  "Private Email",
  "SSL Certificate",
  "Account",
  "Billing & Payments",
  "Other",
];

const PRIORITIES = ["Low", "Normal", "High", "Urgent"] as const;

function CreateTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromAi = searchParams.get("from") === "ai";

  const { data: departments, isLoading: loadingDepts } = useGetDepartments();
  const { data: hostingAccounts } = useGetHosting();
  const { data: registeredDomains } = useGetRegisteredDomains();
  const createMutation = useCreateTicket();

  // Form State
  const [subject, setSubject] = useState(
    isFromAi ? "Website not loading" : ""
  );
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedService, setSelectedService] = useState(
    isFromAi ? "acme.com" : ""
  );
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>("Normal");
  const [description, setDescription] = useState(
    isFromAi
      ? "AI summary: acme.com is not loading. DNS resolves correctly, but the website returns a connection timeout. The user restarted the hosting service and cleared the site cache; the issue continues on multiple networks."
      : ""
  );
  const [activeCategoryChip, setActiveCategoryChip] = useState<string | null>(
    isFromAi ? "Web Hosting" : null
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

      if (result?.success && result?.data) {
        setCreatedTicket({
          ticketId: result.data.ticketId,
          ticketNumber: result.data.ticketNumber || result.data.ticketId,
          tid: result.data.ticketNumber || result.data.ticketId,
          subject: subject.trim(),
        });
      } else {
        // Fallback for safety
        setCreatedTicket({
          ticketId: "1",
          ticketNumber: "10246",
          tid: "10246",
          subject: subject.trim(),
        });
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
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Tickets</span>
        </Link>

        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 sm:p-12 shadow-xs text-center flex flex-col items-center">
          {/* Green Check Icon */}
          <div className="w-14 h-14 rounded-full bg-[#e6f9f6] text-[#0f9f8c] border border-[#b9f2e8] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1d1d1f] tracking-tight">
            Your support ticket has been created
          </h1>
          <p className="text-[13.5px] text-[#6e6e73] mt-2 max-w-md mx-auto leading-relaxed">
            We&apos;ve received your request. Our support team will review it and send updates to your account email.
          </p>

          {/* Ticket Information Table/Card */}
          <div className="w-full max-w-md mt-6 bg-[#fbfcfe] border border-[#e2eaff] rounded-xl p-4 text-left divide-y divide-[#f0f4f9]">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[12.5px] font-medium text-[#6e6e73]">
                Ticket ID
              </span>
              <span className="text-[13.5px] font-bold text-[#1d1d1f]">
                {formattedId}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-[12.5px] font-medium text-[#6e6e73]">
                Subject
              </span>
              <span className="text-[13px] font-semibold text-[#1d1d1f] truncate max-w-[240px]">
                {createdTicket.subject}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-[12.5px] font-medium text-[#6e6e73]">
                Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1787D4] border border-blue-200">
                Open
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6 w-full max-w-md">
            <Link
              href={`/dashboard/tickets/${encodeURIComponent(createdTicket.ticketId)}`}
              className="flex-1 py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl text-center shadow-xs transition-colors"
            >
              View Ticket
            </Link>
            <Link
              href="/dashboard/tickets"
              className="flex-1 py-2.5 px-4 border border-[#e2eaff] bg-white hover:bg-gray-50 text-[#1d1d1f] text-[13px] font-semibold rounded-xl text-center transition-colors shadow-2xs"
            >
              Back to Support
            </Link>
          </div>

          {/* Bottom Response Time Pill */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0fdf9] border border-[#99f6e4] text-[#0f9f8c] text-[12px] font-medium">
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
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#1787D4] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFromAi ? "Back to conversation" : "Back to Support Tickets"}</span>
        </Link>
      </div>

      {/* AI Alert Banner if from AI */}
      {isFromAi && (
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#059669] flex items-center justify-center shrink-0 border border-[#a7f3d0] shadow-2xs">
              <Sparkles className="w-4.5 h-4.5 text-[#10b981]" />
            </div>
            <div>
              <h2 className="text-[13.5px] font-bold text-[#065f46]">
                Prepared from your Ask AI conversation
              </h2>
              <p className="text-[12.5px] text-[#047857] mt-0.5">
                AI attached the troubleshooting context. You only need to confirm the details before submitting.
              </p>
            </div>
          </div>
          <span className="text-[11.5px] font-semibold text-[#065f46] px-3 py-1 rounded-full bg-white/80 border border-[#a7f3d0] shrink-0 self-start sm:self-auto">
            Source: Website help
          </span>
        </div>
      )}

      {/* Heading */}
      <div>
        <h1
          className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
          style={{ letterSpacing: "-0.4px" }}
        >
          {isFromAi ? "Create Support Ticket" : "How can we help?"}
        </h1>
        <p className="text-[13.5px] text-[#6e6e73] mt-1">
          {isFromAi
            ? "Review the AI-generated request below, then submit it to Support."
            : "Tell us what's happening and we'll connect you with the right support specialist."}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2eaff] p-6 sm:p-7 shadow-xs">
          {/* Subheader inside card if AI */}
          {isFromAi && (
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#f0f4f9]">
              <div>
                <h2 className="text-[15px] font-bold text-[#1d1d1f]">
                  Request details
                </h2>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                  Everything is ready for your confirmation.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e6f9f6] text-[#0f9f8c] border border-[#b9f2e8]">
                Ready to submit
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ticket-subject"
                className="text-[13px] font-semibold text-[#1d1d1f]"
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
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-2xs"
              />
            </div>

            {/* Category and Service Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-category"
                  className="text-[13px] font-semibold text-[#1d1d1f]"
                >
                  Category
                </label>
                <select
                  id="ticket-category"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors shadow-2xs cursor-pointer"
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
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                            isSelected
                              ? "bg-[#1787D4] text-white border-[#1787D4]"
                              : "bg-[#f8faff] text-[#5a6a85] border-[#e2eaff] hover:bg-[#eef4ff] hover:text-[#1787D4]"
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
                  className="text-[13px] font-semibold text-[#1d1d1f]"
                >
                  Service
                </label>
                <select
                  id="ticket-service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors shadow-2xs cursor-pointer"
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
                <p className="text-[11.5px] text-[#6e6e73]">
                  Account-level services linked to your profile
                </p>
              </div>
            </div>

            {/* Priority */}
            {!isFromAi && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ticket-priority"
                  className="text-[13px] font-semibold text-[#1d1d1f]"
                >
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors shadow-2xs cursor-pointer"
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
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        priority === p
                          ? "bg-[#1787D4] text-white border-[#1787D4]"
                          : "bg-[#f8faff] text-[#5a6a85] border-[#e2eaff] hover:bg-[#eef4ff]"
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
                className="text-[13px] font-semibold text-[#1d1d1f]"
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
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] placeholder:text-[#9ba8c0] focus:outline-none focus:border-[#1787D4] transition-colors shadow-2xs resize-y"
              />
            </div>

            {/* AI Mode: Conversation Attached Box */}
            {isFromAi ? (
              <div className="bg-[#f0fdf9] border border-[#99f6e4] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] text-[#0f9f8c] flex items-center justify-center shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#134e4a]">
                      Conversation attached
                    </h3>
                    <p className="text-[11.5px] text-[#0f766e]">
                      Includes messages, checks completed, and the AI-generated summary.
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#0f9f8c] shrink-0" />
              </div>
            ) : (
              /* Drag & Drop File Upload Area */
              <div className="flex flex-col gap-2">
                <label className="border-2 border-dashed border-[#d2defa] hover:border-[#1787D4] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#fbfcfe] hover:bg-[#f6f9ff] flex flex-col items-center justify-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-[#1787D4] hover:underline">
                      Drop files here or choose files
                    </span>
                    <p className="text-[11.5px] text-[#6e6e73] mt-0.5">
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f4f9] rounded-lg text-[12px] text-[#1d1d1f]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5a6a85]" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-[#6e6e73] hover:text-red-600 cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                id="btn-submit-support-ticket"
                disabled={createMutation.isPending}
                className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>Submit Ticket</span>
              </button>

              <Link
                href="/dashboard/tickets"
                className="px-5 py-2.5 text-[13px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Information Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {isFromAi ? (
            /* AI Handoff Summary Card */
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-[14.5px] font-bold text-[#1d1d1f]">
                Handoff summary
              </h3>

              <div className="flex flex-col gap-3 py-1 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AI attempted help</span>
                  </div>
                  <span className="font-semibold text-emerald-700">Completed</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Issue unresolved</span>
                  </div>
                  <span className="font-semibold text-blue-700">Confirmed</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-[#0f9f8c] shrink-0" />
                    <span>Routed to support</span>
                  </div>
                  <span className="font-semibold text-[#0f9f8c]">Ready</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0f4f9] text-[12px] text-[#6e6e73] flex flex-col gap-1">
                <span className="font-medium text-[#1d1d1f]">Typical response</span>
                <span className="font-bold text-[#1d1d1f] text-[13px]">
                  Within 2 hours
                </span>
                <span className="text-[#6e6e73] text-[11.5px] mt-0.5">
                  Updates will be sent to your account email.
                </span>
              </div>
            </div>
          ) : (
            /* Standard: Get the fastest help card */
            <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-xs flex flex-col gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f9f6] text-[#4AC3B4] flex items-center justify-center border border-[#b8ece5]">
                <Headphones className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                  Get the fastest help
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-1 leading-relaxed">
                  Choose the service connected to your issue and include a screenshot when possible.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-[#f0f4f9] text-[12.5px] py-1">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#6e6e73]">Typical response</span>
                  <span className="font-bold text-[#1d1d1f]">Within 2 hours</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#6e6e73]">Updates</span>
                  <span className="font-semibold text-[#1d1d1f]">Account email</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#6e6e73]">Attachments</span>
                  <span className="font-semibold text-[#1d1d1f]">Secure and private</span>
                </div>
              </div>

              {/* Bottom Green Callout */}
              <div className="bg-[#f0fdf9] border border-[#99f6e4] rounded-xl p-3 flex items-start gap-2.5 text-[11.5px] text-[#0f766e]">
                <ShieldCheck className="w-4 h-4 text-[#0f9f8c] shrink-0 mt-0.5" />
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading ticket form…</p>
        </div>
      }
    >
      <CreateTicketContent />
    </Suspense>
  );
}
