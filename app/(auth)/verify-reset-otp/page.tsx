"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useVerifyResetOTP, useForgotPassword } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

function VerifyResetOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Email comes from URL param with sessionStorage as fallback
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: verify, isPending } = useVerifyResetOTP();
  const { mutate: resend, isPending: isResending } = useForgotPassword();

  // 20-second cooldown for resend
  const [resendCooldown, setResendCooldown] = useState(20);

  // Read email fallback from sessionStorage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email") ?? "";
    if (!emailParam && storedEmail) setEmail(storedEmail);
    if (!emailParam && !storedEmail) router.push("/forgot-password");
  }, [emailParam, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = () => {
    resend({ email });
    setResendCooldown(20);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;
    verify({ email, code: fullCode });
  };

  return (
    <div className="w-full max-w-[380px] my-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eff6fc] border border-[#d6eaf8] flex items-center justify-center text-[#1787D4] mx-auto mb-2.5 shadow-2xs">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-[17px] sm:text-[19px] font-bold text-[#031033] tracking-tight leading-snug mb-1">
          Enter Reset Code
        </h1>
        <p className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal leading-relaxed max-w-[270px] sm:max-w-xs mx-auto">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#031033]">{email || "your email"}</span>.
          Enter it below to continue.
        </p>
      </div>

      <form
        id="verify-reset-otp-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        {/* OTP inputs */}
        <div className="flex gap-2 sm:gap-2.5 justify-center" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              id={`reset-otp-input-${i}`}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 sm:w-11 h-12 sm:h-13 text-center text-lg font-bold bg-slate-50/70 border border-slate-200 focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl text-[#031033] outline-none transition-all"
            />
          ))}
        </div>

        <button
          id="verify-reset-submit"
          type="submit"
          disabled={isPending || code.join("").length < 6}
          className="w-full h-10.5 sm:h-11 bg-[#1787D4] hover:bg-[#1371B5] active:scale-[0.99] text-white font-semibold rounded-xl text-[13px] sm:text-[13.5px] transition-all duration-150 flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            <>
              <span>Verify Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[12.5px] text-slate-500 mt-5">
        Didn&apos;t receive the code?{" "}
        <button
          id="reset-otp-resend"
          type="button"
          disabled={isResending || resendCooldown > 0}
          onClick={handleResend}
          className="text-[#1787D4] font-semibold hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isResending
            ? "Sending…"
            : resendCooldown > 0
            ? `Resend Code (${resendCooldown}s)`
            : "Resend Code"}
        </button>
      </p>
    </div>
  );
}

export default function VerifyResetOTPPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel: Solid Nupat Brand Blue */}
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile Header: Pinned at the TOP */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
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
            <VerifyResetOTPContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
