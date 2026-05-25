"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  address: string;
  city: string;
  country: string;
  postcode: string;
  password: string;
  confirmPassword: string;
};

const inputClass =
  "w-full bg-[#f2f5fc] border border-[#dce4f7] focus:border-[#031033] focus:bg-white rounded-xl px-4 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors";
const labelClass = "text-sm font-medium text-[#031033]";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    address: "",
    city: "",
    country: "",
    postcode: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate: register, isPending } = useRegister();

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    if (!agreed) return;
    const { confirmPassword: _, ...payload } = form;
    register(payload);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden py-24 px-4 section-navy-tint">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-2xl p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <Image
              src="/images/nupat-cloud-logo-whitebg.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
            <h1 className="text-2xl font-extrabold text-[#031033] mt-1">
              Create Your Account
            </h1>
            <p className="text-[#5a6a85] text-sm">
              Access reliable hosting, domain management, and cloud infrastructure.
            </p>
          </div>

          <form id="register-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* ── Row 1: Name ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-first-name" className={labelClass}>First Name</label>
                <input
                  id="register-first-name"
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-last-name" className={labelClass}>Last Name</label>
                <input
                  id="register-last-name"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Row 2: Email + Phone ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-email" className={labelClass}>Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-phone" className={labelClass}>Phone Number</label>
                <input
                  id="register-phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Row 3: Company + Address ──────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-company" className={labelClass}>Company Name</label>
                <input
                  id="register-company"
                  type="text"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-address" className={labelClass}>Address</label>
                <input
                  id="register-address"
                  type="text"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Row 4: City + Country + Postcode ─────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-city" className={labelClass}>City</label>
                <input
                  id="register-city"
                  type="text"
                  placeholder="Lagos"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-country" className={labelClass}>Country</label>
                <input
                  id="register-country"
                  type="text"
                  placeholder="Nigeria"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-postcode" className={labelClass}>Postcode</label>
                <input
                  id="register-postcode"
                  type="text"
                  placeholder="100001"
                  value={form.postcode}
                  onChange={(e) => set("postcode", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* ── Row 5: Password + Confirm ─────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: "register-password",
                  key: "password" as const,
                  label: "Password",
                  show: showPass,
                  toggle: () => setShowPass((v) => !v),
                },
                {
                  id: "register-confirm-password",
                  key: "confirmPassword" as const,
                  label: "Confirm Password",
                  show: showConfirm,
                  toggle: () => setShowConfirm((v) => !v),
                },
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label htmlFor={field.id} className={labelClass}>{field.label}</label>
                  <div className="relative">
                    <input
                      id={field.id}
                      type={field.show ? "text" : "password"}
                      placeholder="••••••••"
                      value={form[field.key]}
                      onChange={(e) => set(field.key, e.target.value)}
                      required
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
                    >
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Password mismatch hint */}
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-500 -mt-2">Passwords do not match.</p>
            )}

            {/* ── Terms ────────────────────────────────────────────────────── */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <button
                type="button"
                id="register-agree-terms"
                onClick={() => setAgreed((v) => !v)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  agreed
                    ? "bg-[#fd9f09] border-[#fd9f09]"
                    : "border-[#dce4f7] bg-[#f2f5fc]"
                }`}
              >
                {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span className="text-sm text-[#5a6a85]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#fd9f09] hover:underline underline-offset-4">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#fd9f09] hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* ── Submit ───────────────────────────────────────────────────── */}
            <button
              id="register-submit"
              type="submit"
              disabled={
                isPending ||
                !agreed ||
                (!!form.confirmPassword && form.password !== form.confirmPassword)
              }
              className="btn-primary w-full py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
