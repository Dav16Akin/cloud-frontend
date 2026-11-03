"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
  User,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Laptop,
  MapPin,
  CheckCircle2,
  Globe,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { useGetMe, useUpdateProfile, useChangePassword } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

countries.registerLocale(en);
const countryNames = countries.getNames("en");
const countryOptions = Object.entries(countryNames)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const getCountryName = (codeOrName?: string) => {
  if (!codeOrName) return "—";
  if (codeOrName.length === 2) {
    return countries.getName(codeOrName.toUpperCase(), "en") || codeOrName;
  }
  return codeOrName;
};

// ── This-device description (client-only, from navigator.userAgent) ─────────

const noopSubscribe = () => () => {};
const getUserAgent = () => navigator.userAgent;
const getServerUserAgent = () => "";

function describeUserAgent(ua: string): string {
  if (!ua) return "—";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/i.test(ua)
      ? "iOS"
      : /Android/i.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macOS"
          : /CrOS/i.test(ua)
            ? "ChromeOS"
            : /Linux/i.test(ua)
              ? "Linux"
              : null;
  // Order matters: Edge/Opera UAs also contain "Chrome", Chrome's contains "Safari".
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /Firefox\/|FxiOS/i.test(ua)
        ? "Firefox"
        : /Chrome\/|CriOS/i.test(ua)
          ? "Chrome"
          : /Safari\//i.test(ua)
            ? "Safari"
            : null;
  return [os ?? "Unknown OS", browser ?? "Unknown browser"].join(" · ");
}

const getCountryCode = (codeOrName?: string) => {
  if (!codeOrName) return "";
  if (codeOrName.length === 2) {
    return codeOrName.toUpperCase();
  }
  return countries.getAlpha2Code(codeOrName, "en") || codeOrName;
};

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMe();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } =
    useChangePassword();
  const { mutate: logout } = useLogout();

  // User fields from API
  const user = me?.data;

  // Form state for Edit Profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editHouseNumber, setEditHouseNumber] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPostcode, setEditPostcode] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || "");
      setEditLastName(user.lastName || "");
      setEditPhone(user.phoneNumber || "");
      setEditCompanyName(user.companyName || "");
      setEditHouseNumber(user.houseNumber || "");
      setEditAddress(user.address || "");
      setEditCity(user.city || "");
      setEditState(user.state || "");
      setEditCountry(getCountryCode(user.country) || user.country || "");
      setEditPostcode(user.postcode || "");
    }
  }, [user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (editFirstName.trim() && editFirstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    }
    if (editLastName.trim() && editLastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters.";
    }
    if (!editPhone.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (editPhone.trim().replace(/\s+/g, "").length < 10) {
      errors.phoneNumber = "Phone number must be at least 10 characters.";
    }
    if (!editCompanyName.trim()) {
      errors.companyName = "Company or organization name is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }

    updateProfile(
      {
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        phoneNumber: editPhone.trim(),
        companyName: editCompanyName.trim(),
        houseNumber: editHouseNumber.trim() || undefined,
        address: editAddress.trim() || undefined,
        city: editCity.trim() || undefined,
        state: editState.trim() || undefined,
        country: editCountry.trim() || undefined,
        postcode: editPostcode.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setFormErrors({});
        },
      },
    );
  };

  const userAgent = useSyncExternalStore(
    noopSubscribe,
    getUserAgent,
    getServerUserAgent,
  );
  const thisDevice = describeUserAgent(userAgent);

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    changePassword(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setShowPasswordModal(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    (user?.email?.[0] || "U").toUpperCase();

  const formattedJoinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const fullAddressString = [
    user?.houseNumber ? `#${user.houseNumber}` : null,
    user?.address,
    user?.city,
    user?.state,
    user?.postcode,
    user?.country ? getCountryName(user.country) : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1787D4] text-white flex items-center justify-center font-semibold text-lg shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-[#031033]">
                {isLoading
                  ? "Loading profile..."
                  : fullName || "Account details"}
              </h1>

              {user?.verified !== undefined && (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#5A6A85]">
                  {user.verified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#12A150]" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#E8900A]" />
                      Unverified
                    </>
                  )}
                </span>
              )}
            </div>

            <p className="text-sm text-[#5A6A85] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{isLoading ? "—" : user?.email}</span>
              {user?.companyName && (
                <>
                  <span className="text-[#D5DCE6]" aria-hidden="true">•</span>
                  <span className="font-medium text-[#031033]">
                    {user.companyName}
                  </span>
                </>
              )}
              {user?.createdAt && (
                <>
                  <span className="text-[#D5DCE6]" aria-hidden="true">•</span>
                  <span>Joined {formattedJoinedDate}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            id="btn-edit-profile"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit profile
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Personal Info + Address Info + Notification Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Personal & Organization Information */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Personal &amp; organization information
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Your identity and organization credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="h-8 px-3 text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Edit
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              {/* First Name */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  First name
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.firstName || "—"}
                </span>
              </div>

              {/* Last Name */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  Last name
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.lastName || "—"}
                </span>
              </div>

              {/* Email Address */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  Email address
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-[#031033]">
                    {isLoading ? "—" : user?.email || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-[#5A6A85]">
                    <Lock className="w-3 h-3" />
                    Primary
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  Phone number
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.phoneNumber || "—"}
                </span>
              </div>

              {/* Company / Organization Name */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  Company / organization
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.companyName || "—"}
                </span>
              </div>

            </div>
          </div>

          {/* Card 2: Address & Location Details */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Address &amp; location information
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Billing and service location associated with your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="h-8 px-3 text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Edit
              </button>
            </div>

            <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
              {/* House Number */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  House / unit no.
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.houseNumber || "—"}
                </span>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <span className="text-xs text-[#5A6A85] block">
                  Street address
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block truncate">
                  {isLoading ? "—" : user?.address || "—"}
                </span>
              </div>

              {/* City */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  City
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.city || "—"}
                </span>
              </div>

              {/* State */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  State / province
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.state || "—"}
                </span>
              </div>

              {/* Postal Code */}
              <div>
                <span className="text-xs text-[#5A6A85] block">
                  Postal code
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : user?.postcode || "—"}
                </span>
              </div>

              {/* Country */}
              <div className="sm:col-span-3">
                <span className="text-xs text-[#5A6A85] block">
                  Country
                </span>
                <span className="text-sm font-medium text-[#031033] mt-1 block">
                  {isLoading ? "—" : getCountryName(user?.country)}
                </span>
              </div>
            </div>

            {/* Address Summary Preview */}
            {fullAddressString && (
              <div className="mt-5 px-4 py-3 bg-[#F2F5FC] rounded-lg flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#5A6A85] block">
                    Full formatted address
                  </span>
                  <p className="text-sm text-[#031033] mt-0.5">
                    {fullAddressString}
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Card 3: Notification Settings */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h3 className="text-base font-semibold text-[#031033]">
                Notification settings
              </h3>
              <p className="text-xs text-[#5A6A85] mt-0.5">
                Choose which emails and notifications you wish to receive.
              </p>
            </div>
            <div className="p-5 flex flex-col gap-3.5">
              <p className="text-xs text-[#5A6A85]">
                Not available yet: notification preferences can&apos;t be saved
                from the dashboard.
              </p>
              {/* Renewal reminders */}
              <label className="flex items-center gap-3 cursor-not-allowed select-none opacity-60">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  readOnly
                  className="w-4 h-4 rounded border-[#D5DCE6] accent-[#1787D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                />
                <span className="text-sm text-[#031033]">
                  Renewal reminders (Domain &amp; hosting expiry warnings)
                </span>
              </label>

              {/* Product updates */}
              <label className="flex items-center gap-3 cursor-not-allowed select-none opacity-60">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  readOnly
                  className="w-4 h-4 rounded border-[#D5DCE6] accent-[#1787D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                />
                <span className="text-sm text-[#031033]">
                  Product updates &amp; service maintenance alerts
                </span>
              </label>

              {/* Security alerts */}
              <label className="flex items-center gap-3 cursor-not-allowed select-none opacity-60">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  readOnly
                  className="w-4 h-4 rounded border-[#D5DCE6] accent-[#1787D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                />
                <span className="text-sm text-[#031033]">
                  Security alerts &amp; new sign-in notifications
                </span>
              </label>

              {/* Marketing emails */}
              <label className="flex items-center gap-3 cursor-not-allowed select-none opacity-60">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  readOnly
                  className="w-4 h-4 rounded border-[#D5DCE6] accent-[#1787D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                />
                <span className="text-sm text-[#031033]">
                  Promotional offers &amp; newsletters
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Security & Credentials + Account Overview */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 4: Account Details */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h3 className="text-base font-semibold text-[#031033]">
                Account overview
              </h3>
            </div>

            <div className="px-5 py-2 flex flex-col divide-y divide-[#EEF2F7] text-sm">
              {/* Joined Date */}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Member since</span>
                <span className="font-medium text-[#031033] text-right tabular-nums">
                  {isLoading ? "—" : formattedJoinedDate}
                </span>
              </div>

              {/* Account Status */}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Account status</span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
                  Active
                </span>
              </div>

              {/* Verification */}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[#5A6A85]">Email status</span>
                <span className="font-medium text-[#031033]">
                  {user?.verified ? "Verified" : "Pending verification"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Security & Credentials */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h3 className="text-base font-semibold text-[#031033]">
                Security &amp; credentials
              </h3>
            </div>
            <div className="p-5 flex flex-col gap-3">

            {/* Change Password */}
            <button
              type="button"
              id="btn-change-password"
              onClick={() => setShowPasswordModal(true)}
              className="w-full h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 text-center"
            >
              Change password
            </button>

            {/* Two-Factor Authentication */}
            <button
              type="button"
              id="btn-2fa"
              disabled
              aria-describedby="btn-2fa-note"
              className="w-full h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Two-factor authentication
            </button>
            <p id="btn-2fa-note" className="-mt-1 text-xs text-[#5A6A85]">
              Not available yet.
            </p>

            {/* Active Sessions */}
            <button
              type="button"
              id="btn-active-sessions"
              onClick={() => setShowSessionsModal(true)}
              className="w-full h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 text-center"
            >
              Active sessions
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal (matches updateUserSchema) ───────────────────── */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-xl p-6 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="pb-4 border-b border-[#EEF2F7]">
              <h3 className="text-lg font-semibold text-[#031033]">
                Edit profile information
              </h3>
              <p className="text-sm text-[#5A6A85] mt-1">
                Update your personal info, organization name, and billing
                address.
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="flex-1 overflow-y-auto py-5 pr-1 flex flex-col gap-6"
            >
              {/* Section 1: Personal & Organization */}
              <div>
                <h4 className="text-base font-semibold text-[#031033] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5A6A85]" />
                  Personal &amp; organization
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => {
                        setEditFirstName(e.target.value);
                        if (formErrors.firstName) {
                          setFormErrors((prev) => ({ ...prev, firstName: "" }));
                        }
                      }}
                      placeholder="e.g. Akinloluwa"
                      className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors ${
                        formErrors.firstName
                          ? "border-[#C21F1F]"
                          : "border-[#D5DCE6]"
                      }`}
                    />
                    {formErrors.firstName && (
                      <span className="text-xs text-[#C21F1F] mt-1.5 block">
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => {
                        setEditLastName(e.target.value);
                        if (formErrors.lastName) {
                          setFormErrors((prev) => ({ ...prev, lastName: "" }));
                        }
                      }}
                      placeholder="e.g. Oluwaleye"
                      className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors ${
                        formErrors.lastName
                          ? "border-[#C21F1F]"
                          : "border-[#D5DCE6]"
                      }`}
                    />
                    {formErrors.lastName && (
                      <span className="text-xs text-[#C21F1F] mt-1.5 block">
                        {formErrors.lastName}
                      </span>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Email address (read-only)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full h-10 px-3 pr-9 bg-[#F2F5FC] border border-[#E2E8F0] rounded-lg text-sm text-[#5A6A85] cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-[#5A6A85] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-xs text-[#5A6A85] mt-1 block">
                      Email address cannot be changed from profile settings.
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => {
                        setEditPhone(e.target.value);
                        if (formErrors.phoneNumber) {
                          setFormErrors((prev) => ({
                            ...prev,
                            phoneNumber: "",
                          }));
                        }
                      }}
                      placeholder="e.g. 08140300000"
                      className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors ${
                        formErrors.phoneNumber
                          ? "border-[#C21F1F]"
                          : "border-[#D5DCE6]"
                      }`}
                      required
                    />
                    {formErrors.phoneNumber && (
                      <span className="text-xs text-[#C21F1F] mt-1.5 block">
                        {formErrors.phoneNumber}
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Company / organization *
                    </label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => {
                        setEditCompanyName(e.target.value);
                        if (formErrors.companyName) {
                          setFormErrors((prev) => ({
                            ...prev,
                            companyName: "",
                          }));
                        }
                      }}
                      placeholder="e.g. DevSimplified"
                      className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors ${
                        formErrors.companyName
                          ? "border-[#C21F1F]"
                          : "border-[#D5DCE6]"
                      }`}
                      required
                    />
                    {formErrors.companyName && (
                      <span className="text-xs text-[#C21F1F] mt-1.5 block">
                        {formErrors.companyName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Location */}
              <div className="pt-2 border-t border-[#EEF2F7]">
                <h4 className="text-base font-semibold text-[#031033] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5A6A85]" />
                  Address &amp; location
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* House Number */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      House / unit no.
                    </label>
                    <input
                      type="text"
                      value={editHouseNumber}
                      onChange={(e) => setEditHouseNumber(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. Ayodele Fanoiki Street"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Magodo G.R.A"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      State / province
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="e.g. Lagos"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={editPostcode}
                      onChange={(e) => setEditPostcode(e.target.value)}
                      placeholder="e.g. 100248"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>

                  {/* Country */}
                  <div className="sm:col-span-3">
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Country
                    </label>
                    <select
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors cursor-pointer"
                    >
                      <option value="">Select a country</option>
                      {countryOptions.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-[#EEF2F7] mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormErrors({});
                  }}
                  className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Change password
            </h3>

            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-3.5"
            >
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {showOldPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  New password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    {showNewPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Confirm new password
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {changingPassword && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Update password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowSessionsModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Active sessions
            </h3>
            <p className="text-sm text-[#5A6A85]">
              This browser&apos;s session. Other devices aren&apos;t listed yet.
            </p>

            <div className="flex flex-col gap-3">
              {/* Current device */}
              <div className="px-4 py-3 border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-[#5A6A85]" />
                  <div>
                    <div className="text-sm font-medium text-[#031033] flex items-center gap-2">
                      Current browser session
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-normal text-[#5A6A85]">
                        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#12A150]" />
                        This device
                      </span>
                    </div>
                    <div className="text-xs text-[#5A6A85] mt-0.5">
                      {thisDevice} · Active now
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 mt-2 pt-4 border-t border-[#EEF2F7]">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled
                  aria-describedby="logout-others-note"
                  className="h-9 px-4 border border-[#F3C7C7] bg-white text-sm font-medium text-[#C21F1F] hover:bg-[#FDECEC] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Log out other devices
                </button>
                <span id="logout-others-note" className="text-xs text-[#5A6A85]">
                  Not available yet.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionsModal(false)}
                className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Delete account
            </h3>
            <p className="text-sm text-[#5A6A85]">
              Are you sure you want to delete your Nupat Cloud account? This will
              permanently cancel all your services, domains, and hosting
              accounts. This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.error("Account deletion request submitted.");
                  setShowDeleteModal(false);
                }}
                className="h-9 px-4 text-sm font-medium bg-[#DC2626] hover:bg-[#C21F1F] text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
