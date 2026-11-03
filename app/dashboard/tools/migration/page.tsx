"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useGetDepartments, useCreateTicket } from "@/hooks/useSupport";

/** Prefer a migration/technical/support department; fall back to the first one. */
function pickDepartment(departments: { id: string; name: string }[] | undefined) {
  if (!departments || departments.length === 0) return undefined;
  for (const keyword of ["migrat", "technical", "support"]) {
    const match = departments.find((d) => d.name.toLowerCase().includes(keyword));
    if (match) return match;
  }
  return departments[0];
}

export default function WebsiteMigrationToolPage() {
  const [currentHost, setCurrentHost] = useState("");
  const [cpanelUrl, setCpanelUrl] = useState("");
  const [username, setUsername] = useState("");
  const [domainToMigrate, setDomainToMigrate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [createdTicket, setCreatedTicket] = useState<{
    ticketId: string;
    ticketNumber: string;
  } | null>(null);

  const { data: departments, isLoading: loadingDepts, isError: deptsError } =
    useGetDepartments();
  const createTicket = useCreateTicket();
  const submitting = createTicket.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = domainToMigrate.trim();
    if (!domain) {
      toast.error("Please provide the domain to migrate");
      return;
    }
    const department = pickDepartment(departments);
    if (!department) {
      toast.error("Support departments could not be loaded. Please try again shortly.");
      return;
    }

    const lines = [
      "Website migration request",
      "",
      `Domain to migrate: ${domain}`,
      `Current host / provider: ${currentHost.trim() || "Not provided"}`,
      `cPanel / control panel URL: ${cpanelUrl.trim() || "Not provided"}`,
      `cPanel username: ${username.trim() || "Not provided"}`,
    ];
    if (additionalNotes.trim()) {
      lines.push("", "Additional notes:", additionalNotes.trim());
    }
    lines.push(
      "",
      "Password not included. Please request access credentials through a secure channel."
    );

    try {
      const result = await createTicket.mutateAsync({
        deptId: String(department.id),
        subject: `Website migration: ${domain}`,
        message: lines.join("\n"),
        priority: "normal",
      });
      setCreatedTicket({
        ticketId: result.data.ticketId,
        ticketNumber: result.data.ticketNumber || result.data.ticketId,
      });
    } catch {
      // Error toast is shown by useCreateTicket
    }
  };

  const resetForm = () => {
    setCreatedTicket(null);
    setDomainToMigrate("");
    setCurrentHost("");
    setCpanelUrl("");
    setUsername("");
    setAdditionalNotes("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tools
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">Website migration</h1>
        <p className="text-sm mt-1 text-[#5A6A85]">
          Request a free migration of your website and cPanel data to Nupat Cloud.
        </p>
      </div>

      {createdTicket ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] px-6 py-10 text-center flex flex-col items-center">
          <CheckCircle2 className="w-6 h-6 text-[#0E7C3A] mb-3" />
          <h3 className="text-base font-semibold text-[#031033] mb-1">
            Migration ticket #{createdTicket.ticketNumber} created
          </h3>
          <p className="text-sm text-[#5A6A85] max-w-md mb-5">
            Your request for <strong className="text-[#031033]">{domainToMigrate.trim()}</strong> is
            with our support team. They will reply in this ticket and ask for access
            through a secure channel.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/tickets/${encodeURIComponent(createdTicket.ticketId)}`}
              className="inline-flex h-9 items-center px-4 bg-[#1787D4] text-white text-sm font-medium rounded-lg hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              View ticket
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="h-9 px-4 border border-[#D5DCE6] bg-white text-[#031033] text-sm font-medium rounded-lg hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              Request another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 flex flex-col gap-4">
          <h3 className="text-base font-semibold text-[#031033]">Migration details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#031033] block mb-1.5">
                Domain name to migrate *
              </label>
              <input
                type="text"
                placeholder="mybrand.com"
                value={domainToMigrate}
                onChange={(e) => setDomainToMigrate(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#031033] block mb-1.5">
                Current host / provider
              </label>
              <input
                type="text"
                placeholder="e.g. GoDaddy, Bluehost, Namecheap"
                value={currentHost}
                onChange={(e) => setCurrentHost(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#031033] block mb-1.5">
                cPanel / control panel URL
              </label>
              <input
                type="text"
                placeholder="https://cpanel.domain.com:2083"
                value={cpanelUrl}
                onChange={(e) => setCpanelUrl(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#031033] block mb-1.5">
                cPanel username
              </label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
              />
            </div>
          </div>

          <p className="flex items-start gap-2 text-sm text-[#5A6A85]">
            <ShieldCheck className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
            Don&apos;t share your password here. Support will request access through a
            secure channel in the ticket.
          </p>

          <div>
            <label className="text-sm font-medium text-[#031033] block mb-1.5">
              Additional notes or instructions
            </label>
            <textarea
              rows={3}
              placeholder="Any specific databases, email accounts or requirements…"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || loadingDepts}
              className="h-10 px-5 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit migration request
            </button>
          </div>
          {deptsError && (
            <p className="text-sm text-[#B42318]" role="alert">
              Support departments could not be loaded, so the request can&apos;t be
              submitted yet. Refresh the page or try again shortly.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
