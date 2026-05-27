"use client";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, LockKeyhole } from "lucide-react";
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
  const [mismatch, setMismatch] = useState(false);

  const { mutate: reset, isPending } = useResetPassword();

  // Redirect if no reset token
  useEffect(() => {
    if (!resetToken) router.push("/forgot-password");
  }, [resetToken, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
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
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
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
                setMismatch(false);
              }}
              required
              minLength={8}
              className={`w-full bg-[#f2f5fc] border ${
                mismatch ? "border-red-400" : "border-[#dce4f7]"
              } focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors`}
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
          {mismatch && (
            <p className="text-red-500 text-xs mt-0.5">
              Passwords do not match.
            </p>
          )}
        </div>

        <button
          id="reset-password-submit"
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
