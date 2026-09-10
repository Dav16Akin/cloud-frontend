"use client";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, LockKeyhole, Check, X } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { useEffect } from "react";

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
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allRulesPassed = hasMinLength && hasUpper && hasNumber && passwordsMatch;

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
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

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
    <div className="bg-white rounded-2xl p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <Image
          src="/images/nupat-cloud-logo-whitebg.png"
          alt="Nupat Cloud Logo"
          width={140}
          height={40}
          className="object-contain h-auto w-auto mb-1"
        />
        <div className="w-14 h-14 rounded-full bg-[#fffaf0] border border-[#fde8c0] flex items-center justify-center">
          <LockKeyhole className="w-7 h-7 text-[#fd9f09]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#031033]">
            Set New Password
          </h1>
          <p className="text-[#5a6a85] text-sm mt-1 max-w-xs">
            Choose a strong new password for your account.
          </p>
        </div>
      </div>

      <form
        id="reset-password-form"
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-new-password"
            className="text-sm font-medium text-[#031033]"
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
              className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-base sm:text-sm outline-none transition-all"
            />
            <button
              type="button"
              id="reset-toggle-new-password"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
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
            <div className="space-y-1 mt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9ba8c0]">Password strength:</span>
                <span className="font-semibold text-[#031033]">
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-[#f2f5fc] rounded-full overflow-hidden">
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

        {/* Backend Password Rules Checklist */}
        <div className="bg-[#f8faff] border border-[#e2eaff] rounded-xl p-3.5 space-y-2 text-xs">
          <p className="font-semibold text-[#031033] text-[11px] uppercase tracking-wider">
            Password Requirements:
          </p>
          <div className="space-y-1.5 text-[#5a6a85]">
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-[#c2d0eb] shrink-0" />
              )}
              <span className={hasMinLength ? "text-emerald-700 font-medium" : ""}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasUpper ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-[#c2d0eb] shrink-0" />
              )}
              <span className={hasUpper ? "text-emerald-700 font-medium" : ""}>
                At least one uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-[#c2d0eb] shrink-0" />
              )}
              <span className={hasNumber ? "text-emerald-700 font-medium" : ""}>
                At least one number (0-9)
              </span>
            </div>
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-confirm-password"
            className="text-sm font-medium text-[#031033]"
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
              className={`w-full bg-[#f2f5fc] border ${
                confirmPassword && !passwordsMatch
                  ? "border-red-400"
                  : passwordsMatch
                  ? "border-emerald-400"
                  : "border-[#dce4f7]"
              } focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-base sm:text-sm outline-none transition-all`}
            />
            <button
              type="button"
              id="reset-toggle-confirm-password"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
              <X className="w-3 h-3 shrink-0" />
              Passwords do not match.
            </p>
          )}
          {passwordsMatch && (
            <p className="text-emerald-600 text-xs mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3 shrink-0" />
              Passwords match.
            </p>
          )}
        </div>

        <button
          id="reset-password-submit"
          type="submit"
          disabled={isPending || !allRulesPassed}
          className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting…
            </>
          ) : (
            <>
              Reset Password
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
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden py-24 px-4 section-navy-tint">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#fd9f09]" />
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
