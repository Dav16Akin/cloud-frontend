"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useRegister } from "@/hooks/useAuth";
import { MeshGradient } from "@/components/ui/mesh-gradient";

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
        "Enter a valid 11-digit phone number starting with 0 (e.g. 08140397106)"
      ),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().min(3, "Street address is required"),
    houseNumber: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^\d+$/.test(v),
        "House / unit number must be a number"
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
  "w-full px-3.5 py-2.5 sm:py-3 border rounded-xl outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 bg-white";

const inputClass = (err?: string) =>
  `${inputBase} ${
    err
      ? "border-red-400 focus:ring-2 focus:ring-red-400 focus:border-transparent"
      : "border-gray-200 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
  }`;

const labelClass = "block text-xs font-semibold text-[#031033] mb-1.5";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
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
        "Please check the 'I agree to Terms and Conditions' box to complete registration."
      );
      return;
    }

    const { confirmPassword: _, ...payload } = result.data;
    register(payload);
  };

  return (
    <div className="h-screen w-full bg-[#f8faff] flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left Panel - Image Section with Shader Background (STATIONARY/FIXED) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden h-screen border-r border-[#e2eaff] select-none">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Back to home"
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-[#031033] shadow-md border border-[#e2eaff] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* White mixed with soft azure/pearl shader background */}
        <MeshGradient
          colors={["#FFFFFF", "#F0F6FF", "#E0ECFF", "#CCE2FE"]}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <div className="relative w-full h-full max-w-lg max-h-[600px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <Image
              src="/register.png"
              alt="Nupat Cloud Register"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain drop-shadow-xl"
            />
          </div>
        </MeshGradient>
      </div>

      {/* Right Panel - Form Section (ONLY THIS SCROLLS) */}
      <div className="flex-1 flex justify-center bg-white px-6 py-8 sm:px-10 lg:px-14 h-screen overflow-y-auto">
        <div className="w-full max-w-xl py-6 my-auto">
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Brand Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block" aria-label="Go to home">
              <div className="relative" style={{ width: 170, height: 32 }}>
                <Image
                  src="/nupat_cloud_logo-nav.png"
                  alt="Nupat Cloud"
                  fill
                  priority
                  sizes="170px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Create your account
            </h1>
            <p className="text-gray-600 text-sm">
              Already registered?{" "}
              <Link
                href="/login"
                id="register-to-login"
                className="text-[#3B82F6] hover:text-blue-700 font-semibold hover:underline"
              >
                Sign in to your account
              </Link>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <User className="w-4 h-4 text-[#3B82F6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  1. Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-first-name" className={labelClass}>
                    First Name
                  </label>
                  <input
                    id="register-first-name"
                    type="text"
                    placeholder="John"
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
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={() => validateField("lastName")}
                    className={inputClass(errors.lastName)}
                  />
                  <FieldError msg={errors.lastName} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="john@example.com"
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
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-[#3B82F6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  2. Business & Address Details
                </h2>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Lock className="w-4 h-4 text-[#3B82F6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#031033]">
                  3. Account Security
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
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
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          ok ? "text-emerald-600 font-bold" : "text-gray-300"
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
              className={`p-3 rounded-xl border transition-all ${
                submitted && !agreed
                  ? "bg-red-50/60 border-red-200"
                  : "bg-slate-50/50 border-slate-100"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="register-agree-terms"
                  checked={agreed}
                  required
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4.5 h-4.5 mt-0.5 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm text-gray-700 leading-snug">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-[#3B82F6] hover:text-blue-700 font-semibold underline underline-offset-2"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-[#3B82F6] hover:text-blue-700 font-semibold underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {submitted && !agreed && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-2 pl-7.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  You must check and agree to the Terms and Conditions before completing registration.
                </p>
              )}
            </div>

            {/* ════════ Submit Button ════════ */}
            <button
              id="register-submit"
              type="submit"
              disabled={isPending}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                !agreed
                  ? "bg-[#031033]/80 hover:bg-[#031033] text-white"
                  : "bg-[#031033] hover:bg-[#061c52] text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
        </div>
      </div>
    </div>
  );
}
