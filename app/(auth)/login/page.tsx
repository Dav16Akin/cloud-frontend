"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2, Mail } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { mutate: login, isPending } = useLogin(redirect);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel: Solid Nupat Brand Blue with Stacked White & Yellow Logo */}
      <AuthLeftPanel />

      {/* Right Panel: Clean Form Container (Scrolls independently) */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12 lg:px-16 py-8 h-screen overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto">
          {/* Mobile Back & Brand Header (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
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
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#031033] tracking-tight mb-1.5">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 font-normal">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-sm text-[#031033] placeholder:text-slate-400 focus:bg-white focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 sm:py-3 pr-10 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-sm text-[#031033] placeholder:text-slate-400 focus:bg-white focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1787D4] focus:ring-[#1787D4]/20 cursor-pointer accent-[#1787D4]"
                />
                <span className="text-[13px] text-slate-600">Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-[13px] font-medium text-[#1787D4] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              id="login-submit-btn"
              className="w-full mt-2 py-3 px-4 bg-[#1787D4] hover:bg-[#1370B5] active:scale-[0.99] text-white font-semibold text-[14.5px] rounded-xl shadow-md shadow-[#1787D4]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[12px] text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>

          {/* Social / Alternate Auth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL || "https://cloud-backend-chi.vercel.app/api"}/auth/google`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-[13px] font-medium text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("email");
                el?.focus();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-[13px] font-medium text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Mail className="w-4 h-4 text-[#1787D4]" />
              <span>Email</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-[13px] text-slate-500 mt-7">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#1787D4] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
