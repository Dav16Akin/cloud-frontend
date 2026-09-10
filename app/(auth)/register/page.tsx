"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  User,
  MapPin,
  Lock,
  Mail,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useRegister } from "@/hooks/useAuth";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

// ── Zod Schema ────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .min(11, "Phone number must be exactly 11 digits")
      .max(11, "Phone number must be exactly 11 digits")
      .regex(
        /^0\d{10}$/,
        "Enter a valid 11-digit phone number starting with 0 (e.g. 08140397106)",
      ),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().min(3, "Street address is required"),
    houseNumber: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^\d+$/.test(v),
        "House / unit number must be a number",
      ),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    postcode: z.string().min(1, "Postcode is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormState = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

const inputBase =
  "w-full px-3.5 py-2.5 bg-slate-50/70 border rounded-xl outline-none text-sm text-[#031033] placeholder:text-slate-400 focus:bg-white transition-all";

const inputClass = (err?: string) =>
  `${inputBase} ${
    err
      ? "border-red-400 focus:ring-2 focus:ring-red-400/20 focus:border-red-400"
      : "border-slate-200 focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15"
  }`;

const labelClass = "block text-[13px] font-medium text-slate-700 mb-1";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    address: "",
    houseNumber: "",
    city: "",
    state: "",
    country: "Nigeria",
    postcode: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate: register, isPending } = useRegister();

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted && errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateField = (key: keyof FormState) => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErr = result.error.flatten().fieldErrors[key]?.[0];
      setErrors((prev) => ({ ...prev, [key]: fieldErr }));
    } else {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const errs: FieldErrors = {};
      (Object.keys(flat) as (keyof FormState)[]).forEach((k) => {
        errs[k] = flat[k]?.[0];
      });
      setErrors(errs);
      return;
    }

    if (!agreed) {
      toast.error(
        "Please check the 'I agree to Terms and Conditions' box to complete registration.",
      );
      return;
    }

    const { confirmPassword: _, ...payload } = result.data;
    register(payload);
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel: Solid Nupat Brand Blue with Stacked White & Yellow Logo */}
      <AuthLeftPanel />

      {/* Right Panel: Form Section (Scrolls independently) */}
      <div className="flex-1 flex justify-center bg-white px-6 sm:px-10 lg:px-14 py-8 h-screen overflow-y-auto">
        <div className="w-full max-w-xl my-auto py-4">
          {/* Mobile Back & Brand Header (hidden on desktop) */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="relative w-28 h-6">
              <Image
                src="/nupat_cloud_logo-nav.png"
                alt="Nupat Cloud"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#031033]">
              Create Account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Start your cloud journey with Nupat Cloud today
            </p>
          </div>

          {/* Form */}
          <form
            id="register-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6"
          >
            {/* ════════ Section 1: Personal Information ════════ */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-[#1787D4]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  1. Personal Information
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="register-first-name" className={labelClass}>
                    First Name
                  </label>
                  <input
                    id="register-first-name"
                    type="text"
                    placeholder="Alex"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    onBlur={() => validateField("firstName")}
                    className={inputClass(errors.firstName)}
                  />
                  <FieldError msg={errors.firstName} />
                </div>
                <div>
                  <label htmlFor="register-last-name" className={labelClass}>
                    Last Name
                  </label>
                  <input
                    id="register-last-name"
                    type="text"
                    placeholder="Morgan"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={() => validateField("lastName")}
                    className={inputClass(errors.lastName)}
                  />
                  <FieldError msg={errors.lastName} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="register-email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="alex.morgan@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => validateField("email")}
                    className={inputClass(errors.email)}
                  />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label htmlFor="register-phone" className={labelClass}>
                    Phone Number
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    placeholder="08140397106"
                    value={form.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      set("phoneNumber", val);
                    }}
                    onBlur={() => validateField("phoneNumber")}
                    className={inputClass(errors.phoneNumber)}
                  />
                  <FieldError msg={errors.phoneNumber} />
                </div>
              </div>
            </div>

            {/* ════════ Section 2: Business & Billing Address ════════ */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#1787D4]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  2. Business & Address Details
                </h5>
              </div>

              <div>
                <label htmlFor="register-company" className={labelClass}>
                  Company / Organization Name
                </label>
                <input
                  id="register-company"
                  type="text"
                  placeholder="Acme Innovations Ltd."
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  onBlur={() => validateField("companyName")}
                  className={inputClass(errors.companyName)}
                />
                <FieldError msg={errors.companyName} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label htmlFor="register-address" className={labelClass}>
                    Street Address
                  </label>
                  <input
                    id="register-address"
                    type="text"
                    placeholder="123 Commercial Avenue"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    onBlur={() => validateField("address")}
                    className={inputClass(errors.address)}
                  />
                  <FieldError msg={errors.address} />
                </div>
                <div>
                  <label htmlFor="register-house-number" className={labelClass}>
                    Unit / Suite No.
                  </label>
                  <input
                    id="register-house-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="Suite 4B"
                    value={form.houseNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      set("houseNumber", val);
                    }}
                    onBlur={() => validateField("houseNumber")}
                    className={inputClass(errors.houseNumber)}
                  />
                  <FieldError msg={errors.houseNumber} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="register-city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="register-city"
                    type="text"
                    placeholder="Lagos"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    onBlur={() => validateField("city")}
                    className={inputClass(errors.city)}
                  />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label htmlFor="register-state" className={labelClass}>
                    State / Province
                  </label>
                  <input
                    id="register-state"
                    type="text"
                    placeholder="Lagos State"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    onBlur={() => validateField("state")}
                    className={inputClass(errors.state)}
                  />
                  <FieldError msg={errors.state} />
                </div>
                <div>
                  <label htmlFor="register-postcode" className={labelClass}>
                    Postal / Zip Code
                  </label>
                  <input
                    id="register-postcode"
                    type="text"
                    placeholder="100001"
                    value={form.postcode}
                    onChange={(e) => set("postcode", e.target.value)}
                    onBlur={() => validateField("postcode")}
                    className={inputClass(errors.postcode)}
                  />
                  <FieldError msg={errors.postcode} />
                </div>
              </div>

              <div>
                <label htmlFor="register-country" className={labelClass}>
                  Country
                </label>
                <input
                  id="register-country"
                  type="text"
                  placeholder="Nigeria"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  onBlur={() => validateField("country")}
                  className={inputClass(errors.country)}
                />
                <FieldError msg={errors.country} />
              </div>
            </div>

            {/* ════════ Section 3: Account Security ════════ */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Lock className="w-4 h-4 text-[#1787D4]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  3. Account Security
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="register-password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onBlur={() => validateField("password")}
                      className={`${inputClass(errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError msg={errors.password} />
                </div>

                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className={labelClass}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      onBlur={() => validateField("confirmPassword")}
                      className={`${inputClass(errors.confirmPassword)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError msg={errors.confirmPassword} />
                </div>
              </div>

              {/* Password checklist */}
              {form.password.length > 0 && (
                <ul className="grid grid-cols-3 gap-2 text-xs pt-1">
                  {[
                    { label: "Min 8 chars", ok: form.password.length >= 8 },
                    { label: "One uppercase", ok: /[A-Z]/.test(form.password) },
                    { label: "One number", ok: /[0-9]/.test(form.password) },
                  ].map(({ label, ok }) => (
                    <li
                      key={label}
                      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 border transition-colors ${
                        ok
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-400 border-slate-100"
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          ok ? "text-emerald-600 font-bold" : "text-slate-300"
                        }`}
                      />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ════════ Terms Agreement ════════ */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                submitted && !agreed
                  ? "bg-red-50/60 border-red-200"
                  : "bg-slate-50/70 border-slate-200/80"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="register-agree-terms"
                  checked={agreed}
                  required
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#1787D4] border-slate-300 rounded focus:ring-[#1787D4] cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-[#1787D4] hover:underline font-semibold"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[#1787D4] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {submitted && !agreed && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-2 pl-7">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  You must check and agree to the Terms and Conditions before
                  completing registration.
                </p>
              )}
            </div>

            {/* ════════ Submit Button ════════ */}
            <button
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-[#1787D4] hover:bg-[#1370B5] active:scale-[0.99] text-white font-semibold text-[14.5px] rounded-xl shadow-md shadow-[#1787D4]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating your account…</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
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
              onClick={() =>
                router.push(
                  `${
                    process.env.NEXT_PUBLIC_API_URL ||
                    "https://cloud-backend-chi.vercel.app/api"
                  }/auth/google`,
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-[13px] font-medium text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("register-email");
                el?.focus();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-xl text-[13px] font-medium text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Mail className="w-4 h-4 text-[#1787D4]" />
              <span>Email</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-[13px] text-slate-500 mt-6 pb-2">
            Already have an account?{" "}
            <Link
              href="/login"
              id="register-to-login"
              className="font-semibold text-[#1787D4] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
