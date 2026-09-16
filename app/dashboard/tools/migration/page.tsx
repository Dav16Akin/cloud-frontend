"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function WebsiteMigrationToolPage() {
  const [currentHost, setCurrentHost] = useState("");
  const [cpanelUrl, setCpanelUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [domainToMigrate, setDomainToMigrate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainToMigrate.trim()) {
      toast.error("Please provide the domain to migrate");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Migration request received! Our engineering team will review it shortly.");
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      <div>
        <Link
          href="/dashboard/tools"
          id="btn-back-tools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tools
        </Link>
      </div>

      <div>
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Website Migration
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Request a free, seamless migration of your website and cPanel data to Nupat Cloud.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-[#e2eaff] p-8 shadow-sm text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#e6f9ed] text-[#12a150] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-2">Migration Request Submitted!</h3>
          <p className="text-sm text-[#6e6e73] max-w-md mb-6">
            Our migration specialists are preparing your transfer for <strong className="text-[#1d1d1f]">{domainToMigrate}</strong>. You will receive an update in Support Tickets.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/tickets"
              className="px-5 py-2.5 bg-[#1787D4] text-white text-xs font-semibold rounded-xl hover:bg-[#1371B5] transition-colors"
            >
              View Support Tickets
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 border border-[#e2eaff] text-[#5a6a85] text-xs font-semibold rounded-xl hover:bg-[#f8fafc] transition-colors"
            >
              Request Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2eaff] p-7 shadow-sm flex flex-col gap-5">
          <h3 className="text-[16px] font-bold text-[#1d1d1f]">Migration Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
                Domain Name to Migrate *
              </label>
              <input
                type="text"
                placeholder="mybrand.com"
                value={domainToMigrate}
                onChange={(e) => setDomainToMigrate(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                required
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
                Current Host / Provider
              </label>
              <input
                type="text"
                placeholder="e.g. GoDaddy, Bluehost, Namecheap"
                value={currentHost}
                onChange={(e) => setCurrentHost(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
                cPanel / Control Panel URL
              </label>
              <input
                type="text"
                placeholder="https://cpanel.domain.com:2083"
                value={cpanelUrl}
                onChange={(e) => setCpanelUrl(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
                cPanel Username
              </label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
                cPanel Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium text-[#1d1d1f] block mb-1">
              Additional Notes or Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Any specific databases, email accounts, or requirements..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Migration Request
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
