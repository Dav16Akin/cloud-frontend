"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending } = useLogin();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
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
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[#031033]">
                Welcome Back
              </h1>
              <p className="text-[#5a6a85] text-sm mt-1">
                Login to manage your hosting, domains, and support.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-5" id="login-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-[#031033]"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-[#031033]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  id="login-toggle-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#dce4f7] accent-[#fd9f09]"
                />
                <span className="text-sm text-[#5a6a85]">Remember Me</span>
              </label>
              <Link
                href="/forgot-password"
                id="forgot-password-link"
                className="text-sm text-[#fd9f09] hover:underline underline-offset-4"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#dce4f7]" />
            <span className="text-[#9ba8c0] text-xs">or</span>
            <div className="flex-1 h-px bg-[#dce4f7]" />
          </div>

          <p className="text-center text-sm text-[#5a6a85]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              id="login-to-register"
              className="text-[#fd9f09] font-semibold hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
