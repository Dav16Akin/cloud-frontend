"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
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
    verify(
      { email, code: fullCode },
      {
        onError: (err) => {
          // After 5 wrong tries (or once it expires) the code is gone, so
          // clear the boxes and let the user request a new one right away.
          if (
            err instanceof ApiError &&
            (err.code === "OTP_ATTEMPTS_EXCEEDED" || err.code === "OTP_EXPIRED")
          ) {
            setCode(["", "", "", "", "", ""]);
            setResendCooldown(0);
          }
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[420px] my-auto">
      {/* Mobile Back & Brand Header */}
      <div className="lg:hidden flex items-center justify-between mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors"
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
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#031033]">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-[#5A6A85] leading-relaxed max-w-sm mx-auto">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-[#031033]">{email || "your email"}</span>.
          Enter it below to activate your account.
        </p>
      </div>

      <form
        id="verify-otp-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* OTP inputs */}
        <fieldset>
          <legend className="sr-only">6-digit verification code</legend>
          <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 sm:w-12 sm:h-14 rounded-lg border border-[#D5DCE6] bg-white text-center text-xl font-medium tabular-nums text-[#031033] outline-none transition-colors focus:border-[#1787D4] focus:ring-4 focus:ring-[#1787D4]/15"
              />
            ))}
          </div>
        </fieldset>

        <button
          id="verify-submit"
          type="submit"
          disabled={isPending || code.join("").length < 6}
          className="h-11 w-full px-5 rounded-lg bg-[#1787D4] text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            <span>Verify email</span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#5A6A85] mt-6">
        Didn&apos;t receive the code?{" "}
        <button
          id="verify-resend"
          type="button"
          disabled={isResending || resendCooldown > 0}
          onClick={handleResend}
          className="font-medium text-[#1787D4] tabular-nums hover:text-[#1370B5] hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
        >
          {isResending
            ? "Sending…"
            : resendCooldown > 0
            ? `Resend code (${resendCooldown}s)`
            : "Resend code"}
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      <AuthLeftPanel />

      {/* Right panel */}
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
