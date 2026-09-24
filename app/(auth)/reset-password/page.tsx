"use client";

import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  LockKeyhole,
  Check,
  X,
} from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetToken = searchParams.get("resetToken") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);

  const { mutate: reset, isPending } = useResetPassword();

  // Redirect if no reset token
  useEffect(() => {
    if (!resetToken) router.push("/forgot-password");
  }, [resetToken, router]);

  // Backend password rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const allRulesPassed =
    hasMinLength && hasUpper && hasNumber && passwordsMatch;

  // Strength calculation
  const calcStrength = (pw: string) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = calcStrength(newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-emerald-500",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!hasMinLength || !hasUpper || !hasNumber) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    reset({ resetToken, newPassword });
  };

  return (
    <div className="w-full max-w-[380px] my-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eff6fc] border border-[#d6eaf8] flex items-center justify-center text-[#1787D4] mx-auto mb-2.5 shadow-2xs">
          <LockKeyhole className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-[17px] sm:text-[19px] font-bold text-[#031033] tracking-tight leading-snug mb-1">
          Set New Password
        </h1>
        <p className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal leading-relaxed max-w-[270px] sm:max-w-xs mx-auto">
          Choose a secure new password for your account.
        </p>
      </div>

      <form
        id="reset-password-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        {/* New password */}
        <div>
          <label
            htmlFor="reset-new-password"
            className="block text-[13px] font-medium text-slate-700 mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-new-password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setTouched(true);
              }}
              required
              className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/70 border border-slate-200 focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl pr-12 text-[#031033] placeholder:text-slate-400 text-base sm:text-sm outline-none transition-all"
            />
            <button
              type="button"
              id="reset-toggle-new-password"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Strength meter */}
          {newPassword && (
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Password strength:</span>
                <span className="font-semibold text-[#031033]">
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all duration-300 ${
                      strength >= step
                        ? strengthColors[strength]
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Requirements Checklist */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
          <p className="font-semibold text-[#031033] text-[11px] uppercase tracking-wider">
            Password Requirements:
          </p>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className={hasMinLength ? "text-emerald-700 font-medium" : ""}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasUpper ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className={hasUpper ? "text-emerald-700 font-medium" : ""}>
                At least one uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className={hasNumber ? "text-emerald-700 font-medium" : ""}>
                At least one number (0-9)
              </span>
            </div>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="block text-[13px] font-medium text-slate-700 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              required
              className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/70 border ${
                confirmPassword && !passwordsMatch
                  ? "border-red-400"
                  : passwordsMatch
                  ? "border-emerald-400"
                  : "border-slate-200"
              } focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl pr-12 text-[#031033] placeholder:text-slate-400 text-base sm:text-sm outline-none transition-all`}
            />
            <button
              type="button"
              id="reset-toggle-confirm-password"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <X className="w-3 h-3 shrink-0" />
              Passwords do not match.
            </p>
          )}
          {passwordsMatch && (
            <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
              <Check className="w-3 h-3 shrink-0" />
              Passwords match.
            </p>
          )}
        </div>

        <button
          id="reset-password-submit"
          type="submit"
          disabled={isPending || !allRulesPassed}
          className="w-full py-3 sm:py-3.5 bg-[#1787D4] hover:bg-[#1371B5] active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting…</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel: Solid Nupat Brand Blue */}
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile Header: Pinned at the TOP */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Login</span>
          </Link>
          <Link href="/" className="relative w-24 h-6">
            <Image
              src="/nupat_cloud_logo-nav.png"
              alt="Nupat Cloud"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
