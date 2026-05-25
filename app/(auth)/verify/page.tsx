"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, MailCheck } from "lucide-react";
import { useVerifyOTP, useResendOTP } from "@/hooks/useAuth";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: verify, isPending } = useVerifyOTP();
  const { mutate: resend, isPending: isResending } = useResendOTP();


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
    <div className="bg-white rounded-2xl p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <Image
          src="/images/nupat-cloud-logo-whitebg.png"
          alt="Nupat Cloud Logo"
          width={140}
          height={40}
          className="object-contain h-auto w-auto mb-1"
        />
        <div className="w-14 h-14 rounded-full bg-[#fffaf0] border border-[#fde8c0] flex items-center justify-center">
          <MailCheck className="w-7 h-7 text-[#fd9f09]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#031033]">
            Verify Your Email
          </h1>
          <p className="text-[#5a6a85] text-sm mt-1 max-w-xs">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[#031033]">{email}</span>.
            Enter it below to activate your account.
          </p>
        </div>
      </div>

      <form
        id="verify-otp-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {/* OTP inputs */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
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
              className="w-12 h-14 text-center text-xl font-bold bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#fd9f09] focus:bg-white rounded-xl text-[#031033] outline-none transition-colors"
            />
          ))}
        </div>

        <button
          id="verify-submit"
          type="submit"
          disabled={isPending || code.join("").length < 6}
          className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify Email
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#5a6a85] mt-6">
        Didn&apos;t receive the code?{" "}
        <button
          id="verify-resend"
          type="button"
          disabled={isResending}
          onClick={() => resend({ email })}
          className="text-[#fd9f09] font-semibold hover:underline underline-offset-4 disabled:opacity-60"
        >
          {isResending ? "Sending…" : "Resend Code"}
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden py-24 px-4 section-navy-tint">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        {/* Suspense required because useSearchParams suspends during prerendering */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#fd9f09]" />
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
