"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate: requestReset, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset({ email });
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden py-24 px-4 section-navy-tint">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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
              <KeyRound className="w-7 h-7 text-[#fd9f09]" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[#031033]">
                Forgot Password?
              </h1>
              <p className="text-[#5a6a85] text-sm mt-1 max-w-xs">
                Enter your verified email address and we&apos;ll send you a
                6-digit reset code.
              </p>
            </div>
          </div>

          <form
            id="forgot-password-form"
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="forgot-email"
                className="text-sm font-medium text-[#031033]"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
              />
            </div>

            <button
              id="forgot-password-submit"
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code…
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#5a6a85] mt-6">
            Remembered your password?{" "}
            <Link
              href="/login"
              id="forgot-to-login"
              className="text-[#fd9f09] font-semibold hover:underline underline-offset-4"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
