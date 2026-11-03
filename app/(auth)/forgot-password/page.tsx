"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate: requestReset, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    requestReset({ email: email.trim() });
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      <AuthLeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-white">
          <Link
            href="/"
            id="forgot-mobile-back-home"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
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
          <div className="w-full max-w-[400px] my-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#031033]">
                Forgot your password?
              </h1>
              <p className="mt-2 text-sm text-[#5A6A85] leading-relaxed">
                Enter the email address on your account and we&apos;ll send you
                a 6-digit reset code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-[#031033] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-[#D5DCE6] bg-white px-3.5 text-base sm:text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:border-[#1787D4] focus:ring-4 focus:ring-[#1787D4]/15"
                />
              </div>

              <button
                id="forgot-password-submit"
                type="submit"
                disabled={isPending}
                className="h-11 w-full px-5 rounded-lg bg-[#1787D4] text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending code…</span>
                  </>
                ) : (
                  <span>Send reset code</span>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#5A6A85]">
              Remembered your password?{" "}
              <Link
                href="/login"
                id="forgot-to-login"
                className="font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
