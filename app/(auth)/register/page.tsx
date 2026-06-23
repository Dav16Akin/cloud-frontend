"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useRegister } from "@/hooks/useAuth";

// ── Zod Schema ────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .min(7, "Phone number is too short")
      .regex(/^\+?[\d\s\-().]+$/, "Enter a valid phone number"),
    companyName: z.string().min(1, "Company name is required"),
    address: z.string().min(3, "Street address is required"),
    houseNumber: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), "House / unit number must be a number"),
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

// ── Styles ────────────────────────────────────────────────────────────────────

const inputBase =
  "w-full bg-[#f2f5fc] border focus:bg-white rounded-xl px-4 py-3 text-[#031033] placeholder-[#9ba8c0] text-sm outline-none transition-colors";

const inputClass = (err?: string) =>
  `${inputBase} ${err ? "border-red-400 focus:border-red-500" : "border-[#dce4f7] focus:border-[#031033]"}`;

const labelClass = "text-sm font-medium text-[#031033]";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
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
    country: "",
    postcode: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate: register, isPending } = useRegister();

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change if already submitted
    if (submitted && errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  /** Validate a single field on blur */
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

    if (!agreed) return;

    const { confirmPassword: _, ...payload } = result.data;
    // houseNumber is already a string (digits only) — API expects a string
    register(payload);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden py-16 sm:py-24 px-4 section-navy-tint">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white p-5 sm:p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-7 sm:mb-8">
            <Image
              src="/images/nupat-cloud-logo-whitebg.png"
              alt="Nupat Cloud Logo"
              width={120}
              height={36}
              className="object-contain h-auto w-auto"
            />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#031033] mt-1 text-center">
              Create Your Account
            </h1>
            <p className="text-[#5a6a85] text-xs sm:text-sm text-center">
              Access reliable hosting, domain management, and cloud infrastructure.
            </p>
          </div>

          <form id="register-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">

            {/* ── Row 1: Name ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-first-name" className={labelClass}>First Name</label>
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-last-name" className={labelClass}>Last Name</label>
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

            {/* ── Row 2: Email + Phone ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-email" className={labelClass}>Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => validateField("email")}
                  className={inputClass(errors.email)}
                />
                <FieldError msg={errors.email} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-phone" className={labelClass}>Phone Number</label>
                <input
                  id="register-phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  onBlur={() => validateField("phoneNumber")}
                  className={inputClass(errors.phoneNumber)}
                />
                <FieldError msg={errors.phoneNumber} />
              </div>
            </div>

            {/* ── Row 3: Company + Address ──────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-company" className={labelClass}>Company Name</label>
                <input
                  id="register-company"
                  type="text"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  onBlur={() => validateField("companyName")}
                  className={inputClass(errors.companyName)}
                />
                <FieldError msg={errors.companyName} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-address" className={labelClass}>Street Address</label>
                <input
                  id="register-address"
                  type="text"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  onBlur={() => validateField("address")}
                  className={inputClass(errors.address)}
                />
                <FieldError msg={errors.address} />
              </div>
            </div>

            {/* ── Row 4: House Number + City + State ───────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-house-number" className={labelClass}>
                  House / Unit No.
                  <span className="ml-1 text-xs text-[#9ba8c0] font-normal">(numbers only)</span>
                </label>
                <input
                  id="register-house-number"
                  type="text"
                  inputMode="numeric"
                  placeholder="12"
                  value={form.houseNumber}
                  onChange={(e) => {
                    // Allow only digits while typing
                    const val = e.target.value.replace(/\D/g, "");
                    set("houseNumber", val);
                  }}
                  onBlur={() => validateField("houseNumber")}
                  className={inputClass(errors.houseNumber)}
                />
                <FieldError msg={errors.houseNumber} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-city" className={labelClass}>City</label>
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
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label htmlFor="register-state" className={labelClass}>State / Province</label>
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
            </div>

            {/* ── Row 5: Country + Postcode ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-country" className={labelClass}>Country</label>
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-postcode" className={labelClass}>Postcode</label>
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

            {/* ── Row 6: Password + Confirm ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onBlur={() => validateField(field.key)}
                      className={`${inputClass(errors[field.key])} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
                    >
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError msg={errors[field.key]} />
                </div>
              ))}
            </div>

            {/* Password strength hints */}
            {form.password.length > 0 && (
              <ul className="grid sm:grid-cols-2 gap-1 -mt-1">
                {[
                  { label: "At least 8 characters", ok: form.password.length >= 8 },
                  { label: "One uppercase letter", ok: /[A-Z]/.test(form.password) },
                  { label: "One number", ok: /[0-9]/.test(form.password) },
                ].map(({ label, ok }) => (
                  <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-[#9ba8c0]"}`}>
                    <Check className={`w-3 h-3 shrink-0 ${ok ? "text-emerald-500" : "text-[#dce4f7]"}`} />
                    {label}
                  </li>
                ))}
              </ul>
            )}

            {/* ── Terms ────────────────────────────────────────────────── */}
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
              <span className="text-sm text-[#5a6a85] leading-snug">
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
            {submitted && !agreed && (
              <p className="flex items-center gap-1 text-xs text-red-500 -mt-2">
                <AlertCircle className="w-3 h-3 shrink-0" />
                You must agree to the terms to continue.
              </p>
            )}

            {/* ── Submit ───────────────────────────────────────────────── */}
            <button
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
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
