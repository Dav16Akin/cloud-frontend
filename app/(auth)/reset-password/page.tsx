"use client";

import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

const inputBase =
  "h-11 w-full rounded-lg border bg-white px-3.5 pr-11 text-base sm:text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:ring-4";

const toggleClass =
  "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#5A6A85] hover:text-[#031033] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/40";

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
    "bg-[#DC2626]",
    "bg-[#E8900A]",
    "bg-[#1787D4]",
    "bg-[#12A150]",
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

  const rules = [
    { ok: hasMinLength, label: "At least 8 characters" },
    { ok: hasUpper, label: "At least one uppercase letter (A-Z)" },
    { ok: hasNumber, label: "At least one number (0-9)" },
  ];

  const confirmBorder =
    confirmPassword && !passwordsMatch
      ? "border-[#C21F1F] focus:border-[#C21F1F] focus:ring-[#C21F1F]/15"
      : passwordsMatch
        ? "border-[#12A150] focus:border-[#12A150] focus:ring-[#12A150]/15"
        : "border-[#D5DCE6] focus:border-[#1787D4] focus:ring-[#1787D4]/15";

  return (
    <div className="w-full max-w-[400px] my-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#031033]">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-[#5A6A85] leading-relaxed">
          Choose a new password for your Nupat Cloud account.
        </p>
      </div>

      <form
        id="reset-password-form"
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        {/* New password */}
        <div>
          <label
            htmlFor="reset-new-password"
            className="block text-sm font-medium text-[#031033] mb-1.5"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="reset-new-password"
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setTouched(true);
              }}
              required
              className={`${inputBase} border-[#D5DCE6] focus:border-[#1787D4] focus:ring-[#1787D4]/15`}
            />
            <button
              type="button"
              id="reset-toggle-new-password"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className={toggleClass}
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
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A6A85]">Password strength</span>
                <span className="font-medium text-[#031033]">
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-colors duration-300 ${
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

        {/* Requirements */}
        <div className="rounded-lg bg-[#F2F5FC] p-4">
          <p className="text-sm font-medium text-[#031033]">
            Your password needs
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {rules.map(({ ok, label }) => (
              <li
                key={label}
                className={`flex items-center gap-2 ${
                  ok ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                }`}
              >
                <Check
                  className={`w-4 h-4 shrink-0 ${
                    ok ? "text-[#12A150]" : "text-[#D5DCE6]"
                  }`}
                />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="block text-sm font-medium text-[#031033] mb-1.5"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              required
              aria-invalid={!!confirmPassword && !passwordsMatch}
              className={`${inputBase} ${confirmBorder}`}
            />
            <button
              type="button"
              id="reset-toggle-confirm-password"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className={toggleClass}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1.5 text-sm text-[#C21F1F]">
              Passwords do not match.
            </p>
          )}
          {passwordsMatch && (
            <p className="mt-1.5 text-sm text-[#0E7C3A]">Passwords match.</p>
          )}
        </div>

        <button
          id="reset-password-submit"
          type="submit"
          disabled={isPending || !allRulesPassed}
          className="h-11 w-full px-5 rounded-lg bg-[#1787D4] text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Resetting…</span>
            </>
          ) : (
            <span>Reset password</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      <AuthLeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-white">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors"
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

        {/* Form container */}
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
