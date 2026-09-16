"use client";

import { useState, useMemo } from "react";
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

export default function CreateMailboxPage() {
  const router = useRouter();
  const { data: hostingAccounts } = useGetHosting();

  // Domains available for mailbox creation
  const availableDomains = useMemo(() => {
    const fromHosting = (hostingAccounts || [])
      .map((h) => h.domain)
      .filter(Boolean);
    const defaults = ["acme.com", "nupatcloud.com"];
    return Array.from(new Set([...fromHosting, ...defaults]));
  }, [hostingAccounts]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Address Setup
  const [selectedDomain, setSelectedDomain] = useState("acme.com");
  const [emailName, setEmailName] = useState("sales");

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
    { num: 1, label: "Choose Domain" },
    { num: 2, label: "Create Password" },
    { num: 3, label: "Confirm Summary" },
    { num: 4, label: "Mailbox Created" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Page Heading */}
      <div>
        <h2
          className="text-[26px] font-bold tracking-tight"
          style={{
            color: "#1d1d1f",
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Create Mailbox
        </h2>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap border-b border-[#eef2f8] pb-5">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isUpcoming = currentStep < step.num;

          return (
            <div key={step.num} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {/* Step Circle */}
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#12a150] flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-[#1787D4] flex items-center justify-center text-white text-[11px] font-bold">
                    {step.num}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#d1d5db] text-[#9ba8c0] flex items-center justify-center text-[11px] font-medium">
                    {step.num}
                  </div>
                )}

                {/* Step Label */}
                <span
                  className={`text-[13px] ${
                    isCurrent
                      ? "font-semibold text-[#1787D4]"
                      : isCompleted
                      ? "font-medium text-[#12a150]"
                      : "text-[#9ba8c0]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Chevron separator */}
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#9ba8c0]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Wizard Form Container */}
      <div className="w-full max-w-xl">
        {/* ── STEP 1: Address Setup ───────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-7 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">
              1. Address Setup
            </h3>

            <form onSubmit={handleStep1Continue} className="flex flex-col gap-5">
              {/* Choose Domain */}
              <div>
                <label className="text-[13px] font-medium text-[#1d1d1f] block mb-1.5">
                  Choose Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
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
                <label className="text-[13px] font-medium text-[#1d1d1f] block mb-1.5">
                  Enter Email Name
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. sales"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
                      required
                    />
                  </div>
                  <span className="text-[14px] font-medium text-[#6e6e73]">@</span>
                  <div className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2eaff] rounded-xl text-[13.5px] text-[#6e6e73] font-medium min-w-[140px]">
                    {selectedDomain}
                  </div>
                </div>
              </div>

              {/* Submit / Continue */}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  id="btn-step1-continue"
                  className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 2: Choose Password ──────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-7 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">
              2. Choose Password
            </h3>

            <form onSubmit={handleStep2Continue} className="flex flex-col gap-5">
              {/* Password */}
              <div>
                <label className="text-[13px] font-medium text-[#1d1d1f] block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85]"
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
                <label className="text-[13px] font-medium text-[#1d1d1f] block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#e2eaff] rounded-xl text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85]"
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
                <div className="flex items-center gap-2 text-[12.5px]">
                  {hasMinLength ? (
                    <Check className="w-4 h-4 text-[#12a150] stroke-[2.5]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#d1d5db] flex items-center justify-center text-[10px] text-[#9ba8c0]" />
                  )}
                  <span
                    className={hasMinLength ? "text-[#12a150] font-medium" : "text-[#6e6e73]"}
                  >
                    At least 8 characters long
                  </span>
                </div>

                {/* Rule 2 */}
                <div className="flex items-center gap-2 text-[12.5px]">
                  {hasUppercase ? (
                    <Check className="w-4 h-4 text-[#12a150] stroke-[2.5]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#d1d5db] flex items-center justify-center text-[10px] text-[#9ba8c0]" />
                  )}
                  <span
                    className={hasUppercase ? "text-[#12a150] font-medium" : "text-[#6e6e73]"}
                  >
                    At least one uppercase letter
                  </span>
                </div>

                {/* Rule 3 */}
                <div className="flex items-center gap-2 text-[12.5px]">
                  {hasNumberOrSpecial ? (
                    <Check className="w-4 h-4 text-[#12a150] stroke-[2.5]" />
                  ) : (
                    <Info className="w-4 h-4 text-[#9ba8c0]" />
                  )}
                  <span
                    className={
                      hasNumberOrSpecial
                        ? "text-[#12a150] font-medium"
                        : "text-[#6e6e73]"
                    }
                  >
                    At least one number or special character
                  </span>
                </div>

                {/* Match validation notice */}
                {password && confirmPassword && (
                  <div className="flex items-center gap-2 text-[12.5px] mt-1">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-[#12a150] stroke-[2.5]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-red-300 text-red-500 flex items-center justify-center text-[10px]" />
                    )}
                    <span
                      className={
                        passwordsMatch ? "text-[#12a150] font-medium" : "text-red-500"
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
                  className="px-5 py-2 border border-[#e2eaff] hover:bg-[#f8fafc] text-[#5a6a85] text-[13.5px] font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  id="btn-step2-continue"
                  disabled={!isPasswordValid}
                  className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-50 disabled:pointer-events-none text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Confirm Mailbox ──────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-7 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">
              3. Confirm Mailbox
            </h3>

            {/* Summary Details Box */}
            <div className="bg-[#fcfdfe] border border-[#eef2f8] rounded-xl p-5 flex flex-col gap-3.5 mb-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6e6e73]">Email Address</span>
                <span className="font-semibold text-[#1d1d1f]">{fullEmail}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6e6e73]">Domain</span>
                <span className="font-semibold text-[#1d1d1f]">{selectedDomain}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6e6e73]">Storage Limit</span>
                <span className="font-semibold text-[#1d1d1f]">10 GB (Standard)</span>
              </div>
            </div>

            <p className="text-[12.5px] text-[#6e6e73] mb-6">
              Review the details above before creating this mailbox.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 border border-[#e2eaff] hover:bg-[#f8fafc] text-[#5a6a85] text-[13.5px] font-semibold rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                id="btn-create-mailbox-submit"
                onClick={handleCreateMailbox}
                disabled={isCreating}
                className="px-6 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] disabled:opacity-60 text-white text-[13.5px] font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Mailbox
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Mailbox Created ──────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-9 shadow-sm flex flex-col items-center text-center">
            {/* Success Icon */}
            <div className="w-12 h-12 rounded-full bg-[#e6f9ed] border border-[#b7eed0] flex items-center justify-center text-[#12a150] mb-4">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <h3 className="text-[20px] font-bold text-[#1d1d1f] mb-2">
              Mailbox Created!
            </h3>
            <p className="text-[13.5px] text-[#6e6e73] max-w-sm mb-7">
              The professional address <strong className="text-[#1d1d1f]">{fullEmail}</strong> is ready to send and receive emails.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link
                href={`/dashboard/email/${encodeURIComponent(fullEmail)}`}
                id="btn-goto-mailbox"
                className="w-full py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13.5px] font-semibold rounded-xl transition-colors text-center shadow-sm"
              >
                Go to Mailbox
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 text-[#5a6a85] hover:text-[#1d1d1f] text-[13px] font-medium transition-colors text-center"
              >
                Create Another Mailbox
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
