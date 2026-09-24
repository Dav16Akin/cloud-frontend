"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: verify, isPending } = useVerifyOTP();
  const { mutate: resend, isPending: isResending } = useResendOTP();

  // 20-second cooldown for resend button
  const [resendCooldown, setResendCooldown] = useState(20);

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

  // Redirect to login if no email param
  useEffect(() => {
    if (!email) router.push("/login");
  }, [email, router]);

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
    <div className="w-full max-w-[420px] my-auto">
      {/* Mobile Back & Brand Header */}
      <div className="lg:hidden flex items-center justify-between mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Login
        </Link>
        <div className="relative w-28 h-7">
          <Image
            src="/nupat_cloud_logo-nav.png"
            alt="Nupat Cloud"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#eff6fc] border border-[#d6eaf8] flex items-center justify-center text-[#1787D4] mx-auto mb-4 shadow-xs">
          <MailCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#031033] tracking-tight mb-1.5">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-500 font-normal max-w-sm mx-auto">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#031033]">{email || "your email"}</span>.
          Enter it below to activate your account.
        </p>
      </div>

      <form
        id="verify-otp-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* OTP inputs */}
        <div className="flex gap-2 sm:gap-2.5 justify-center" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              id={`otp-input-${i}`}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold bg-slate-50/70 border border-slate-200 focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 focus:bg-white rounded-xl text-[#031033] outline-none transition-all"
            />
          ))}
        </div>

        <button
          id="verify-submit"
          type="submit"
          disabled={isPending || code.join("").length < 6}
          className="w-full py-3 sm:py-3.5 bg-[#1787D4] hover:bg-[#1371B5] active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            <>
              <span>Verify Email</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Didn&apos;t receive the code?{" "}
        <button
          id="verify-resend"
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

export default function VerifyPage() {
  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel: Solid Nupat Brand Blue */}
      <AuthLeftPanel />

      {/* Right Panel: Clean Form Container */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12 lg:px-16 py-8 h-screen overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#1787D4]" />
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
