"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
                Create Your Account
              </h1>
              <p className="text-[#5a6a85] text-sm mt-1 max-w-xs">
                Access reliable hosting, domain management, and cloud
                infrastructure.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-4" id="register-form">
            {[
              {
                id: "register-name",
                label: "Full Name",
                type: "text",
                placeholder: "John Doe",
              },
              {
                id: "register-email",
                label: "Email Address",
                type: "email",
                placeholder: "you@example.com",
              },
              {
                id: "register-phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "+234 800 000 0000",
              },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-[#031033]"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
                />
              </div>
            ))}

            {[
              {
                id: "register-password",
                label: "Password",
                show: showPass,
                toggle: () => setShowPass((v) => !v),
              },
              {
                id: "register-confirm-password",
                label: "Confirm Password",
                show: showConfirm,
                toggle: () => setShowConfirm((v) => !v),
              },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-[#031033]"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.id}
                    type={field.show ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 pr-12 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
                  >
                    {field.show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <button
                type="button"
                id="register-agree-terms"
                onClick={() => setAgreed((v) => !v)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? "bg-[#fd9f09] border-[#fd9f09]" : "border-[#dce4f7] bg-[#f2f5fc]"}`}
              >
                {agreed && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </button>
              <span className="text-sm text-[#5a6a85]">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#fd9f09] hover:underline underline-offset-4"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#fd9f09] hover:underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold mt-2 flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-[#5a6a85] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              id="register-to-login"
              className="text-[#fd9f09] font-semibold hover:underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
