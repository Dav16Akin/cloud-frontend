"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Mail, KeyRound } from "lucide-react";
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
      {/* Left Panel: Solid Nupat Brand Blue with Stacked White & Yellow Logo */}
      <AuthLeftPanel />

      {/* Right Panel: Full height flex column */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile Header: Pinned at the VERY TOP of the viewport */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <Link
            href="/"
            id="forgot-mobile-back-home"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
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

        {/* Form Container: vertically centered in remaining space */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 overflow-y-auto">
          <div className="w-full max-w-[380px] my-auto">
            {/* Header: compact icon, small crisp heading */}
            <div className="text-center mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eff6fc] border border-[#d6eaf8] flex items-center justify-center text-[#1787D4] mx-auto mb-2.5 shadow-2xs">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              {/* Refined, compact heading so it's never too big on mobile */}
              <h2 className="text-[12px] font-bold text-[#031033] tracking-tight leading-snug mb-1">
                Forgot Password?
              </h2>
              <p className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal leading-relaxed max-w-[270px] sm:max-w-xs mx-auto">
                Enter your registered email address and we&apos;ll send you a
                6-digit recovery code.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[12px] sm:text-[12.5px] font-medium text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-[13.5px] text-[#031033] placeholder:text-slate-400 focus:bg-white focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                id="forgot-password-submit"
                type="submit"
                disabled={isPending}
                className="w-full h-10.5 sm:h-11 bg-[#1787D4] hover:bg-[#1371B5] active:scale-[0.99] text-white font-semibold rounded-xl text-[13px] sm:text-[13.5px] transition-all duration-150 flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Code…</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Footer */}
            <div className="mt-6 text-center pt-3 border-t border-slate-100">
              <p className="text-[12.5px] text-slate-500">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  id="forgot-to-login"
                  className="font-semibold text-[#1787D4] hover:text-[#1371B5] transition-colors"
                >
                  Back to Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
