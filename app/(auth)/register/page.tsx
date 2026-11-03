"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { toast } from "sonner";
import { useRegister } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

// Google sign-in is switched off for now; set to true to show it again.
const SHOW_GOOGLE_SIGN_IN = false;

// ── Zod Schema ────────────────────────────────────────────────────────────────

countries.registerLocale(en);
const countryNames = countries.getNames("en");
const countryOptions = Object.entries(countryNames)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name is too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phoneNumber: z.string().min(7, "Enter a valid phone number"),
    companyName: z
      .string()
      .max(200, "Company name must be 200 characters or fewer"),
    address: z
      .string()
      .min(3, "Street address is required")
      .max(255, "Street address is too long"),
    houseNumber: z
      .string()
      .max(50, "Unit / suite must be 50 characters or fewer"),
    city: z.string().min(1, "City is required").max(100, "City is too long"),
    state: z
      .string()
      .min(1, "State / Province is required")
      .max(100, "State / Province is too long"),
    country: z.string().regex(/^[A-Z]{2}$/, "Select a country"),
    postcode: z
      .string()
      .min(1, "Postcode is required")
      .max(20, "Postcode is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    const parsed = parsePhoneNumberFromString(
      data.phoneNumber,
      data.country as CountryCode,
    );
    if (!parsed || !parsed.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Enter a valid phone number for the selected country",
      });
    }
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormState = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

const inputBase =
  "h-11 w-full rounded-lg border bg-white px-3.5 text-base sm:text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:ring-4";

const inputClass = (err?: string) =>
  `${inputBase} ${
    err
      ? "border-[#C21F1F] focus:border-[#C21F1F] focus:ring-[#C21F1F]/15"
      : "border-[#D5DCE6] focus:border-[#1787D4] focus:ring-[#1787D4]/15"
  }`;

const labelClass = "block text-sm font-medium text-[#031033] mb-1.5";

const sectionHeadingClass = "text-base font-semibold text-[#031033]";

const secondaryButtonClass =
  "h-11 flex items-center justify-center gap-2 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/15 cursor-pointer";

function Required() {
  return (
    <span aria-hidden="true" className="text-[#C21F1F] ml-0.5">
      *
    </span>
  );
}

function Optional() {
  return <span className="font-normal text-[#5A6A85]">(optional)</span>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-sm text-[#C21F1F]">{msg}</p>;
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
  const [addressSuggestions, setAddressSuggestions] = useState<
    Array<{ display_name: string; address?: Record<string, string> }>
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);

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
    country: "NG",
    postcode: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate: register, isPending } = useRegister();

  const countryName = useMemo(
    () =>
      countryOptions.find((country) => country.code === form.country)?.name ??
      form.country,
    [form.country],
  );

  useEffect(() => {
    const query = [form.address, form.city, form.state, countryName]
      .filter(Boolean)
      .join(", ");

    if (form.address.trim().length < 3) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal, headers: { "Accept-Language": "en" } },
        );
        if (response.ok) setAddressSuggestions(await response.json());
      } catch {
        if (!controller.signal.aborted) setAddressSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setAddressLoading(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [countryName, form.address, form.city, form.state]);

  const selectAddress = (suggestion: (typeof addressSuggestions)[number]) => {
    const address = suggestion.address ?? {};
    const selectedCountry = (
      address.country_code ?? form.country
    ).toUpperCase();
    setForm((previous) => ({
      ...previous,
      address: address.road ?? suggestion.display_name,
      houseNumber: address.house_number ?? previous.houseNumber,
      city:
        address.city ??
        address.town ??
        address.village ??
        address.municipality ??
        previous.city,
      state: address.state ?? previous.state,
      postcode: address.postcode ?? previous.postcode,
      country: selectedCountry,
    }));
    setAddressSuggestions([]);
  };

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "address" && value.trim().length < 3) {
      setAddressSuggestions([]);
    }
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
    register(payload, {
      onError: (error) => {
        if (!(error instanceof ApiError) || !error.fieldErrors) return;
        const serverErrors: FieldErrors = {};
        (Object.keys(error.fieldErrors) as (keyof FormState)[]).forEach(
          (key) => {
            if (key === "confirmPassword") return;
            serverErrors[key] = error.fieldErrors?.[key]?.[0];
          },
        );
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      },
    });
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row lg:overflow-hidden">
      <AuthLeftPanel />

      {/* Right panel: form (scrolls independently) */}
      <div className="flex-1 flex justify-center bg-white px-6 sm:px-10 lg:px-14 py-8 h-screen overflow-y-auto">
        <div className="w-full max-w-xl my-auto py-4">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] hover:text-[#031033] transition-colors"
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

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#031033]">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[#5A6A85]">
              One Nupat Cloud account for your domains, hosting and servers.
            </p>
            <p className="mt-2 text-sm text-[#5A6A85]">
              Fields marked <Required /> are required.
            </p>
          </div>

          <form
            id="register-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-8"
          >
            {/* Personal information */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>Personal information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-first-name" className={labelClass}>
                    First name <Required />
                  </label>
                  <input
                    id="register-first-name"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Adaeze"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    onBlur={() => validateField("firstName")}
                    aria-invalid={!!errors.firstName}
                    className={inputClass(errors.firstName)}
                  />
                  <FieldError msg={errors.firstName} />
                </div>
                <div>
                  <label htmlFor="register-last-name" className={labelClass}>
                    Last name <Required />
                  </label>
                  <input
                    id="register-last-name"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Okafor"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={() => validateField("lastName")}
                    aria-invalid={!!errors.lastName}
                    className={inputClass(errors.lastName)}
                  />
                  <FieldError msg={errors.lastName} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-email" className={labelClass}>
                    Email address <Required />
                  </label>
                  <input
                    id="register-email"
                    required
                    aria-required="true"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => validateField("email")}
                    aria-invalid={!!errors.email}
                    className={inputClass(errors.email)}
                  />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label htmlFor="register-phone" className={labelClass}>
                    Phone number <Required />
                  </label>
                  <input
                    id="register-phone"
                    required
                    aria-required="true"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+234 803 123 4567"
                    value={form.phoneNumber}
                    onChange={(e) => {
                      set("phoneNumber", e.target.value);
                    }}
                    onBlur={() => validateField("phoneNumber")}
                    aria-invalid={!!errors.phoneNumber}
                    className={inputClass(errors.phoneNumber)}
                  />
                  <FieldError msg={errors.phoneNumber} />
                </div>
              </div>
            </section>

            {/* Business and address */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>Business and address</h2>

              <div>
                <label htmlFor="register-company" className={labelClass}>
                  Company or organisation name <Optional />
                </label>
                <input
                  id="register-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Acme Innovations Ltd."
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  onBlur={() => validateField("companyName")}
                  aria-invalid={!!errors.companyName}
                  className={inputClass(errors.companyName)}
                />
                <FieldError msg={errors.companyName} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="register-address" className={labelClass}>
                    Street address <Required />
                  </label>
                  <input
                    id="register-address"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="address-line1"
                    placeholder="12 Adeola Odeku Street"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    onBlur={() => validateField("address")}
                    aria-invalid={!!errors.address}
                    className={inputClass(errors.address)}
                  />
                  {(addressLoading || addressSuggestions.length > 0) && (
                    <div className="relative z-20">
                      <div className="absolute left-0 right-0 mt-1 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                        {addressLoading && (
                          <p className="px-3 py-2 text-sm text-[#5A6A85]">
                            Searching addresses...
                          </p>
                        )}
                        {addressSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.display_name}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectAddress(suggestion)}
                            className="block w-full px-3 py-2 text-left text-sm text-[#031033] hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:bg-[#F2F5FC]"
                          >
                            {suggestion.display_name}
                          </button>
                        ))}
                        <p className="border-t border-[#E2E8F0] px-3 py-1.5 text-xs text-[#5A6A85]">
                          Address data © OpenStreetMap contributors
                        </p>
                      </div>
                    </div>
                  )}
                  <FieldError msg={errors.address} />
                </div>
                <div>
                  <label htmlFor="register-house-number" className={labelClass}>
                    Unit or suite <Optional />
                  </label>
                  <input
                    id="register-house-number"
                    type="text"
                    autoComplete="address-line2"
                    placeholder="Suite 4B"
                    value={form.houseNumber}
                    onChange={(e) => set("houseNumber", e.target.value)}
                    onBlur={() => validateField("houseNumber")}
                    aria-invalid={!!errors.houseNumber}
                    className={inputClass(errors.houseNumber)}
                  />
                  <FieldError msg={errors.houseNumber} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="register-city" className={labelClass}>
                    City <Required />
                  </label>
                  <input
                    id="register-city"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Lagos"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    onBlur={() => validateField("city")}
                    aria-invalid={!!errors.city}
                    className={inputClass(errors.city)}
                  />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label htmlFor="register-state" className={labelClass}>
                    State or province <Required />
                  </label>
                  <input
                    id="register-state"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="Lagos State"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    onBlur={() => validateField("state")}
                    aria-invalid={!!errors.state}
                    className={inputClass(errors.state)}
                  />
                  <FieldError msg={errors.state} />
                </div>
                <div>
                  <label htmlFor="register-postcode" className={labelClass}>
                    Postal code <Required />
                  </label>
                  <input
                    id="register-postcode"
                    required
                    aria-required="true"
                    type="text"
                    autoComplete="postal-code"
                    placeholder="100001"
                    value={form.postcode}
                    onChange={(e) => set("postcode", e.target.value)}
                    onBlur={() => validateField("postcode")}
                    aria-invalid={!!errors.postcode}
                    className={inputClass(errors.postcode)}
                  />
                  <FieldError msg={errors.postcode} />
                </div>
              </div>

              <div>
                <label htmlFor="register-country" className={labelClass}>
                  Country <Required />
                </label>
                <select
                  id="register-country"
                  required
                  aria-required="true"
                  aria-label="Country"
                  autoComplete="country"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  onBlur={() => validateField("country")}
                  aria-invalid={!!errors.country}
                  className={inputClass(errors.country)}
                >
                  <option value="">Select a country</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.country} />
              </div>
            </section>

            {/* Account security */}
            <section className="space-y-4">
              <h2 className={sectionHeadingClass}>Account security</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-password" className={labelClass}>
                    Password <Required />
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      required
                      aria-required="true"
                      type={showPass ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onBlur={() => validateField("password")}
                      aria-invalid={!!errors.password}
                      className={`${inputClass(errors.password)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#5A6A85] hover:text-[#031033] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/40"
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
                    Confirm password <Required />
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      required
                      aria-required="true"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      onBlur={() => validateField("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                      className={`${inputClass(errors.confirmPassword)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#5A6A85] hover:text-[#031033] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/40"
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
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  {[
                    { label: "At least 8 characters", ok: form.password.length >= 8 },
                    { label: "One uppercase letter", ok: /[A-Z]/.test(form.password) },
                    { label: "One number", ok: /[0-9]/.test(form.password) },
                  ].map(({ label, ok }) => (
                    <li
                      key={label}
                      className={`flex items-center gap-1.5 ${
                        ok ? "text-[#0E7C3A]" : "text-[#5A6A85]"
                      }`}
                    >
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          ok ? "text-[#12A150]" : "text-[#D5DCE6]"
                        }`}
                      />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Terms agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="register-agree-terms"
                  checked={agreed}
                  required
                  onChange={(e) => setAgreed(e.target.checked)}
                  aria-invalid={submitted && !agreed}
                  className="w-4 h-4 mt-0.5 rounded border-[#D5DCE6] accent-[#1787D4] cursor-pointer shrink-0"
                />
                <span className="text-sm text-[#031033] leading-snug">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . <Required />
                </span>
              </label>
              {submitted && !agreed && (
                <p className="mt-1.5 pl-7 text-sm text-[#C21F1F]">
                  Agree to the Terms and Conditions and Privacy Policy to
                  create your account.
                </p>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isPending}
              className="h-11 w-full px-5 rounded-lg bg-[#1787D4] text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1787D4]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating your account…</span>
                </>
              ) : (
                <span>Create account</span>
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

              {/* Alternate sign-up */}
              <div className="grid grid-cols-1 gap-3">
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
                  className={secondaryButtonClass}
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>
              </div>

            </>
          )}

          <p className="text-center text-sm text-[#5A6A85] mt-8 pb-2">
            Already have an account?{" "}
            <Link
              href="/login"
              id="register-to-login"
              className="font-medium text-[#1787D4] hover:text-[#1370B5] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
