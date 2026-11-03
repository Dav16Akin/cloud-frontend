"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { safeRedirectPath } from "@/lib/safeRedirect";

// Google sign-in is switched off for now; set to true to show it again.
const SHOW_GOOGLE_SIGN_IN = false;

const labelClass = "block text-sm font-medium text-[#031033] mb-1.5";
const inputClass =
  "h-11 w-full rounded-lg border border-[#D5DCE6] bg-white px-3.5 text-base sm:text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:border-[#1787D4] focus:ring-4 focus:ring-[#1787D4]/15";
const secondaryButtonClass =
  "h-11 flex items-center justify-center gap-2 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/15 cursor-pointer";

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
  const redirect = safeRedirectPath(searchParams.get("redirect"));

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending } = useLogin(redirect);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      <AuthLeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <Link href="/" className="relative w-28 h-7">
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
        <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12 lg:px-16 py-8 overflow-y-auto">
          <div className="w-full max-w-[420px] my-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#031033]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#5A6A85]">
                Sign in to your Nupat Cloud account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#031033]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#5A6A85] hover:text-[#031033] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/40"
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

              <button
                type="submit"
                disabled={isPending}
                id="login-submit-btn"
                className="h-11 w-full px-5 rounded-lg bg-[#1787D4] text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {SHOW_GOOGLE_SIGN_IN && (
            <>
              {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E2E8F0]" />
                  </div>
                  <span className="relative bg-white px-3 text-sm text-[#5A6A85]">
                    Or continue with
                  </span>
                </div>

                {/* Alternate sign-in */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL || "https://cloud-backend-chi.vercel.app/api"}/auth/google`)}
                    className={secondaryButtonClass}
                  >
                    <GoogleIcon />
                    <span>Google</span>
                  </button>
                </div>

            </>
          )}

            <p className="text-center text-sm text-[#5A6A85] mt-8">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
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
