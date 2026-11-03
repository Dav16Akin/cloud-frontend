"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useGetHosting } from "@/hooks/useHosting";
import { useGetRegisteredDomains } from "@/hooks/useDomains";

export default function CreateMailboxPage() {
  const router = useRouter();
  const { data: hostingAccounts } = useGetHosting();
  const { data: registeredDomains } = useGetRegisteredDomains();

  // Domains available for mailbox creation from real user accounts
  const availableDomains = useMemo(() => {
    const fromHosting = (hostingAccounts || [])
      .map((h) => h.domain)
      .filter(Boolean);
    const fromDomains = (registeredDomains || [])
      .map((d) => d.domain)
      .filter(Boolean);
    return Array.from(new Set([...fromHosting, ...fromDomains]));
  }, [hostingAccounts, registeredDomains]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Address Setup — never auto-fill dummy values
  const [selectedDomain, setSelectedDomain] = useState("");
  const [emailName, setEmailName] = useState("");

  useEffect(() => {
    if (!selectedDomain && availableDomains.length > 0) {
      setSelectedDomain(availableDomains[0]);
    }
  }, [availableDomains, selectedDomain]);

  // Step 2: Password Setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3: Loading
  const [isCreating, setIsCreating] = useState(false);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
    password
  );
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUppercase && hasNumberOrSpecial && passwordsMatch;

  const fullEmail = `${emailName.trim().toLowerCase()}@${selectedDomain}`;

  // Handle Step 1 continue
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailName.trim()) {
      toast.error("Please enter an email username");
      return;
    }
    // Basic format validation
    if (!/^[a-zA-Z0-9._-]+$/.test(emailName.trim())) {
      toast.error("Email name can only contain letters, numbers, dots, and hyphens");
      return;
    }
    setCurrentStep(2);
  };

  // Handle Step 2 continue
  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please satisfy all password security requirements");
      return;
    }
    setCurrentStep(3);
  };

  // Handle Step 3 submit
  const handleCreateMailbox = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);

      // Save to localStorage so it appears in the list
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("nupat_private_mailboxes");
          const currentList = stored ? JSON.parse(stored) : [];
          const newMailbox = {
            id: fullEmail.replace(/[@.]/g, "-"),
            email: fullEmail,
            domain: selectedDomain,
            storage: "0.0 GB",
            status: "Active",
          };
          // Prepend new mailbox
          localStorage.setItem(
            "nupat_private_mailboxes",
            JSON.stringify([
              newMailbox,
              ...currentList.filter((m: any) => m.email !== fullEmail),
            ])
          );
        } catch {
          // ignore
        }
      }

      toast.success(`Mailbox ${fullEmail} created successfully!`);
      setCurrentStep(4);
    }, 900);
  };

  // Reset to create another mailbox
  const handleReset = () => {
    setEmailName("");
    setPassword("");
    setConfirmPassword("");
    setCurrentStep(1);
  };

  const steps = [
    { num: 1, label: "Choose domain" },
    { num: 2, label: "Create password" },
    { num: 3, label: "Confirm summary" },
    { num: 4, label: "Mailbox created" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">
          Create mailbox
        </h1>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap border-b border-[#E2E8F0] pb-5">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isUpcoming = currentStep < step.num;

          return (
            <div key={step.num} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {/* Step Circle */}
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#0E7C3A] flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-[#1787D4] flex items-center justify-center text-white text-xs font-medium tabular-nums">
                    {step.num}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#D5DCE6] text-[#5A6A85] flex items-center justify-center text-xs font-medium tabular-nums">
                    {step.num}
                  </div>
                )}

                {/* Step Label */}
                <span
                  className={`text-sm ${
                    isCurrent
                      ? "font-medium text-[#031033]"
                      : isCompleted
                      ? "text-[#031033]"
                      : "text-[#5A6A85]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Chevron separator */}
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#5A6A85]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Wizard Form Container */}
      <div className="w-full max-w-xl">
        {/* ── STEP 1: Address Setup ───────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[#031033] mb-5">
              Address setup
            </h3>

            <form onSubmit={handleStep1Continue} className="flex flex-col gap-5">
              {/* Choose Domain */}
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Choose domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                >
                  {availableDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enter Email Name */}
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Email name
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. sales"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                      required
                    />
                  </div>
                  <span className="text-sm text-[#5A6A85]">@</span>
                  <div className="h-10 inline-flex items-center px-3 bg-[#F2F5FC] border border-[#E2E8F0] rounded-lg text-sm text-[#5A6A85] min-w-[140px]">
                    {selectedDomain}
                  </div>
                </div>
              </div>

              {/* Submit / Continue */}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  id="btn-step1-continue"
                  className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 2: Choose Password ──────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[#031033] mb-5">
              Choose password
            </h3>

            <form onSubmit={handleStep2Continue} className="flex flex-col gap-5">
              {/* Password */}
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password"
                    className="w-full h-10 pl-3 pr-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full h-10 pl-3 pr-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Checklist Rules */}
              <div className="flex flex-col gap-2 pt-1">
                {/* Rule 1 */}
                <div className="flex items-center gap-2 text-xs">
                  {hasMinLength ? (
                    <Check className="w-4 h-4 text-[#0E7C3A]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D5DCE6]" />
                  )}
                  <span
                    className={hasMinLength ? "text-[#0E7C3A]" : "text-[#5A6A85]"}
                  >
                    At least 8 characters long
                  </span>
                </div>

                {/* Rule 2 */}
                <div className="flex items-center gap-2 text-xs">
                  {hasUppercase ? (
                    <Check className="w-4 h-4 text-[#0E7C3A]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D5DCE6]" />
                  )}
                  <span
                    className={hasUppercase ? "text-[#0E7C3A]" : "text-[#5A6A85]"}
                  >
                    At least one uppercase letter
                  </span>
                </div>

                {/* Rule 3 */}
                <div className="flex items-center gap-2 text-xs">
                  {hasNumberOrSpecial ? (
                    <Check className="w-4 h-4 text-[#0E7C3A]" />
                  ) : (
                    <Info className="w-4 h-4 text-[#5A6A85]" />
                  )}
                  <span
                    className={
                      hasNumberOrSpecial
                        ? "text-[#0E7C3A]"
                        : "text-[#5A6A85]"
                    }
                  >
                    At least one number or special character
                  </span>
                </div>

                {/* Match validation notice */}
                {password && confirmPassword && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-[#0E7C3A]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#DC2626]" />
                    )}
                    <span
                      className={
                        passwordsMatch ? "text-[#0E7C3A]" : "text-[#C21F1F]"
                      }
                    >
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Back
                </button>
                <button
                  type="submit"
                  id="btn-step2-continue"
                  disabled={!isPasswordValid}
                  className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Confirm Mailbox ──────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-[#031033] mb-5">
              Confirm mailbox
            </h3>

            {/* Summary Details Box */}
            <div className="border border-[#E2E8F0] rounded-lg px-4 py-1 flex flex-col divide-y divide-[#EEF2F7] mb-5">
              <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-[#5A6A85]">Email address</span>
                <span className="font-medium text-[#031033] text-right break-all">{fullEmail}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-[#5A6A85]">Domain</span>
                <span className="font-medium text-[#031033] text-right">{selectedDomain}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-[#5A6A85]">Storage limit</span>
                <span className="font-medium text-[#031033] tabular-nums">10 GB (Standard)</span>
              </div>
            </div>

            <p className="text-xs text-[#5A6A85] mb-6">
              Review the details above before creating this mailbox.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-9 px-4 border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Back
              </button>
              <button
                type="button"
                id="btn-create-mailbox-submit"
                onClick={handleCreateMailbox}
                disabled={isCreating}
                className="h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create mailbox
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Mailbox Created ──────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col items-center text-center">
            <Check className="w-6 h-6 text-[#0E7C3A] mb-4" />

            <h3 className="text-lg font-semibold text-[#031033] mb-2">
              Mailbox created
            </h3>
            <p className="text-sm text-[#5A6A85] max-w-sm mb-6">
              The professional address <strong className="font-medium text-[#031033]">{fullEmail}</strong> is ready to send and receive emails.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Link
                href={`/dashboard/email/${encodeURIComponent(fullEmail)}`}
                id="btn-goto-mailbox"
                className="w-full inline-flex items-center justify-center h-9 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Go to mailbox
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="w-full h-9 text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Create another mailbox
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
