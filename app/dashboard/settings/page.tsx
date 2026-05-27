"use client";
import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Loader2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  MapPin,
  Globe,
  Mail,
} from "lucide-react";
import { useGetMe, useUpdateProfile, useChangePassword } from "@/hooks/useUser";

// ── Shared field component ─────────────────────────────────────────────────────

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
  readOnly,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ba8c0]">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full bg-[#f2f5fc] border border-[#dce4f7] ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2.5 text-sm text-[#031033] placeholder-[#9ba8c0] outline-none transition-colors ${
            readOnly
              ? "opacity-60 cursor-not-allowed"
              : "focus:border-[#031033] focus:bg-white"
          }`}
        />
      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e2eaff]">
      <div className="px-6 py-4 border-b border-[#e2eaff] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#fff8ee] border border-[#fde8c0] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#e8900a]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#031033]">{title}</h2>
          <p className="text-xs text-[#9ba8c0] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonField() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-3 w-20 bg-[#e8edf8] animate-pulse" />
      <div className="h-10 w-full bg-[#e8edf8] animate-pulse" />
    </div>
  );
}

// ── Profile Section ────────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: me, isLoading } = useGetMe();
  const { mutate: update, isPending } = useUpdateProfile();

  const user = me?.data ?? me?.user ?? me;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    companyName: "",
    address: "",
    country: "",
    city: "",
    postcode: "",
  });

  // Populate form once user data arrives
  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      companyName: user.companyName ?? "",
      address: user.address ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      postcode: user.postcode ?? "",
    });
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(form);
  };

  return (
    <Section icon={User} title="Personal Information" subtitle="Update your name, contact and company details">
      <form id="settings-profile-form" onSubmit={handleSubmit}>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonField key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Read-only email banner */}
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-[#f2f5fc] border border-[#dce4f7]">
              <Mail className="w-4 h-4 text-[#9ba8c0] shrink-0" />
              <span className="text-sm text-[#5a6a85]">
                Email address:{" "}
                <span className="font-semibold text-[#031033]">
                  {user?.email ?? "—"}
                </span>
              </span>
              <span className="ml-auto text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide border border-[#dce4f7] px-2 py-0.5">
                Read-only
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="settings-first-name" label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="John" icon={User} />
              <Field id="settings-last-name" label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Doe" icon={User} />
              <Field id="settings-phone" label="Phone Number" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+234 800 000 0000" icon={Phone} />
              <Field id="settings-company" label="Company Name" value={form.companyName} onChange={set("companyName")} placeholder="Acme Ltd" icon={Building2} />
              <Field id="settings-address" label="Address" value={form.address} onChange={set("address")} placeholder="123 Main St" icon={MapPin} />
              <Field id="settings-country" label="Country" value={form.country} onChange={set("country")} placeholder="Nigeria" icon={Globe} />
              <Field id="settings-city" label="City" value={form.city} onChange={set("city")} placeholder="Lagos" icon={MapPin} />
              <Field id="settings-postcode" label="Postcode" value={form.postcode} onChange={set("postcode")} placeholder="100001" icon={MapPin} />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            id="settings-profile-save"
            type="submit"
            disabled={isPending || isLoading}
            className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Section>
  );
}

// ── Password field — stable top-level component (never defined inside another) ─
type PwFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  showPw: boolean;
  onToggleShow: () => void;
  error?: boolean;
};

function PasswordField({ id, label, value, onChange, showPw, onToggleShow, error }: PwFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#5a6a85] uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ba8c0]" />
        <input
          id={id}
          type={showPw ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full bg-[#f2f5fc] border ${
            error ? "border-red-400" : "border-[#dce4f7]"
          } pl-10 pr-11 py-2.5 text-sm text-[#031033] placeholder-[#9ba8c0] focus:border-[#031033] focus:bg-white outline-none transition-colors`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#5a6a85] transition-colors"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
          <AlertCircle className="w-3 h-3" /> Passwords do not match.
        </p>
      )}
    </div>
  );
}

// ── Change Password Section ────────────────────────────────────────────────────

function ChangePasswordSection() {
  const { mutate: changePw, isPending } = useChangePassword();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [mismatch, setMismatch] = useState(false);
  const [strength, setStrength] = useState(0);

  const calcStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const handleChange = (key: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (key === "confirmPassword") setMismatch(false);
    if (key === "newPassword") setStrength(calcStrength(v));
  };

  const toggleShow = (key: keyof typeof show) => () =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-500"][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMismatch(true);
      return;
    }
    changePw(
      { oldPassword: form.oldPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
          setStrength(0);
        },
      }
    );
  };

  return (
    <Section icon={Lock} title="Change Password" subtitle="Choose a strong password to keep your account secure">
      <form id="settings-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        <PasswordField
          id="settings-current-pw"
          label="Current Password"
          value={form.oldPassword}
          onChange={handleChange("oldPassword")}
          showPw={show.current}
          onToggleShow={toggleShow("current")}
        />
        <PasswordField
          id="settings-new-pw"
          label="New Password"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          showPw={show.next}
          onToggleShow={toggleShow("next")}
        />

        {/* Strength bar */}
        {form.newPassword.length > 0 && (
          <div className="flex items-center gap-3 -mt-1">
            <div className="flex-1 flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`flex-1 transition-all duration-300 ${
                    n <= strength ? strengthColor : "bg-[#e2eaff]"
                  }`}
                />
              ))}
            </div>
            <span
              className={`text-xs font-semibold ${
                strength <= 1
                  ? "text-red-500"
                  : strength === 2
                  ? "text-yellow-500"
                  : strength === 3
                  ? "text-blue-500"
                  : "text-emerald-600"
              }`}
            >
              {strengthLabel}
            </span>
          </div>
        )}

        <PasswordField
          id="settings-confirm-pw"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          showPw={show.confirm}
          onToggleShow={toggleShow("confirm")}
          error={mismatch}
        />

        {/* Requirements hint */}
        <ul className="grid sm:grid-cols-2 gap-1 mt-1">
          {[
            { label: "At least 8 characters", ok: form.newPassword.length >= 8 },
            { label: "One uppercase letter", ok: /[A-Z]/.test(form.newPassword) },
            { label: "One number", ok: /[0-9]/.test(form.newPassword) },
            { label: "One special character", ok: /[^A-Za-z0-9]/.test(form.newPassword) },
          ].map(({ label, ok }) => (
            <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-[#9ba8c0]"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${ok ? "text-emerald-500" : "text-[#dce4f7]"}`} />
              {label}
            </li>
          ))}
        </ul>

        <div className="flex justify-end mt-2">
          <button
            id="settings-password-save"
            type="submit"
            disabled={isPending || !form.oldPassword || !form.newPassword || !form.confirmPassword}
            className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </Section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#031033]">Account Settings</h1>
          <p className="text-[#5a6a85] text-sm mt-1">
            Manage your profile, contact details and password.
          </p>
        </div>
      </div>

      <ProfileSection />
      <ChangePasswordSection />
    </div>
  );
}
