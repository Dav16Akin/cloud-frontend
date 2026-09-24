"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Loader2,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Smartphone,
  Laptop,
  Building2,
  MapPin,
  Mail,
  Phone,
  Hash,
  CheckCircle2,
  Calendar,
  Globe,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { useGetMe, useUpdateProfile, useChangePassword } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMe();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword();
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
      setEditCountry(user.country || "");
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
      }
    );
  };

  // Notification settings state
  const [notifications, setNotifications] = useState({
    renewalReminders: true,
    productUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Notification preferences updated.");
      return next;
    });
  };

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [show2faModal, setShow2faModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
      }
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
    user?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner Card */}
      <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1787D4] to-[#0d5588] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                className="text-[22px] font-bold tracking-tight text-[#1d1d1f]"
                style={{
                  fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                {isLoading ? "Loading profile..." : fullName || "Account Details"}
              </h2>

              {user?.role && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-blue-50 text-[#1787D4] border border-blue-200">
                  {user.role}
                </span>
              )}

              {user?.verified !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium border ${
                    user.verified
                      ? "bg-[#e6f9ed] text-[#12a150] border-[#b7eed0]"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {user.verified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unverified
                    </>
                  )}
                </span>
              )}
            </div>

            <p className="text-[13.5px] text-[#6e6e73] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{isLoading ? "—" : user?.email}</span>
              {user?.companyName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium text-[#1d1d1f]">{user.companyName}</span>
                </>
              )}
              {user?.createdAt && (
                <>
                  <span className="text-gray-300">•</span>
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
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Personal Info + Address Info + Notification Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Personal & Organization Information */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#eef2f8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1787D4] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold text-[#1d1d1f]">
                    Personal &amp; Organization Information
                  </h3>
                  <p className="text-[12px] text-[#6e6e73]">
                    Your identity and organization credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[12.5px] font-semibold text-[#1787D4] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              {/* First Name */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  First Name
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.firstName || "—"}
                </span>
              </div>

              {/* Last Name */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Last Name
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.lastName || "—"}
                </span>
              </div>

              {/* Email Address */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Email Address
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] font-medium text-[#1d1d1f]">
                    {isLoading ? "—" : user?.email || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                    <Lock className="w-2.5 h-2.5" />
                    Primary
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Phone Number
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.phoneNumber || "—"}
                </span>
              </div>

              {/* Company / Organization Name */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Company / Organization
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.companyName || "—"}
                </span>
              </div>

              {/* Role */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Account Role
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.role || "USER"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Address & Location Details */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#eef2f8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold text-[#1d1d1f]">
                    Address &amp; Location Information
                  </h3>
                  <p className="text-[12px] text-[#6e6e73]">
                    Billing and service location associated with your account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[12.5px] font-semibold text-[#1787D4] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
              {/* House Number */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  House / Unit No.
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.houseNumber || "—"}
                </span>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Street Address
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block truncate">
                  {isLoading ? "—" : user?.address || "—"}
                </span>
              </div>

              {/* City */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  City
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.city || "—"}
                </span>
              </div>

              {/* State */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  State / Province
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.state || "—"}
                </span>
              </div>

              {/* Postal Code */}
              <div>
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Postal Code
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.postcode || "—"}
                </span>
              </div>

              {/* Country */}
              <div className="sm:col-span-3">
                <span className="text-[11.5px] uppercase font-bold tracking-wider text-[#6e6e73] block">
                  Country
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : user?.country || "—"}
                </span>
              </div>
            </div>

            {/* Address Summary Preview */}
            {fullAddressString && (
              <div className="mt-5 p-3.5 bg-[#f8faff] rounded-xl border border-[#e2eaff] flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#1787D4] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1787D4] block">
                    Full Formatted Address
                  </span>
                  <p className="text-[13px] text-[#1d1d1f] font-medium mt-0.5">
                    {fullAddressString}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Notification Settings */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm">
            <h3 className="text-[15.5px] font-bold text-[#1d1d1f] mb-1">
              Notification Settings
            </h3>
            <p className="text-[12px] text-[#6e6e73] mb-4">
              Choose which emails and notifications you wish to receive.
            </p>
            <div className="border-t border-[#eef2f8] pt-4 flex flex-col gap-3.5">
              {/* Renewal reminders */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.renewalReminders}
                  onChange={() => toggleNotification("renewalReminders")}
                  className="w-4 h-4 rounded text-[#1787D4] border-gray-300 focus:ring-[#1787D4] accent-[#1787D4]"
                />
                <span className="text-[13.5px] font-medium text-[#1d1d1f]">
                  Renewal reminders (Domain &amp; hosting expiry warnings)
                </span>
              </label>

              {/* Product updates */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.productUpdates}
                  onChange={() => toggleNotification("productUpdates")}
                  className="w-4 h-4 rounded text-[#1787D4] border-gray-300 focus:ring-[#1787D4] accent-[#1787D4]"
                />
                <span className="text-[13.5px] font-medium text-[#1d1d1f]">
                  Product updates &amp; service maintenance alerts
                </span>
              </label>

              {/* Security alerts */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.securityAlerts}
                  onChange={() => toggleNotification("securityAlerts")}
                  className="w-4 h-4 rounded text-[#1787D4] border-gray-300 focus:ring-[#1787D4] accent-[#1787D4]"
                />
                <span className="text-[13.5px] font-medium text-[#1d1d1f]">
                  Security alerts &amp; new sign-in notifications
                </span>
              </label>

              {/* Marketing emails */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifications.marketingEmails}
                  onChange={() => toggleNotification("marketingEmails")}
                  className="w-4 h-4 rounded text-[#1787D4] border-gray-300 focus:ring-[#1787D4] accent-[#1787D4]"
                />
                <span className="text-[13.5px] font-medium text-[#1d1d1f]">
                  Promotional offers &amp; newsletters
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Security & Credentials + Account Overview */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 4: Account Details */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">
              Account Overview
            </h3>

            <div className="flex flex-col gap-3.5 text-[13px]">
              {/* Joined Date */}
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Member Since</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {isLoading ? "—" : formattedJoinedDate}
                </span>
              </div>

              {/* Account Status */}
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Account Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                  Active
                </span>
              </div>

              {/* Verification */}
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Email Status</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {user?.verified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Security & Credentials */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">
              Security &amp; Credentials
            </h3>

            {/* Change Password */}
            <button
              type="button"
              id="btn-change-password"
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center"
            >
              Change Password
            </button>

            {/* Two-Factor Authentication */}
            <button
              type="button"
              id="btn-2fa"
              onClick={() => setShow2faModal(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center"
            >
              Two-Factor Authentication
            </button>

            {/* Active Sessions */}
            <button
              type="button"
              id="btn-active-sessions"
              onClick={() => setShowSessionsModal(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center"
            >
              Active Sessions
            </button>
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-2xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="pb-4 border-b border-[#eef2f8]">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                Edit Profile Information
              </h3>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                Update your personal info, organization name, and billing address.
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="flex-1 overflow-y-auto py-5 pr-1 flex flex-col gap-6"
            >
              {/* Section 1: Personal & Organization */}
              <div>
                <h4 className="text-[13px] font-bold text-[#1787D4] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Personal &amp; Organization
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      First Name
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
                      className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#1787D4] transition-colors ${
                        formErrors.firstName ? "border-red-400 bg-red-50/20" : "border-[#e2eaff]"
                      }`}
                    />
                    {formErrors.firstName && (
                      <span className="text-[11px] text-red-500 mt-1 block">
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Last Name
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
                      className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#1787D4] transition-colors ${
                        formErrors.lastName ? "border-red-400 bg-red-50/20" : "border-[#e2eaff]"
                      }`}
                    />
                    {formErrors.lastName && (
                      <span className="text-[11px] text-red-500 mt-1 block">
                        {formErrors.lastName}
                      </span>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Email Address (Read-only)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-3.5 py-2 bg-gray-50 border border-[#e2eaff] rounded-xl text-sm text-gray-500 cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[11px] text-[#6e6e73] mt-1 block">
                      Email address cannot be changed from profile settings.
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => {
                        setEditPhone(e.target.value);
                        if (formErrors.phoneNumber) {
                          setFormErrors((prev) => ({ ...prev, phoneNumber: "" }));
                        }
                      }}
                      placeholder="e.g. 08140397106"
                      className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#1787D4] transition-colors ${
                        formErrors.phoneNumber ? "border-red-400 bg-red-50/20" : "border-[#e2eaff]"
                      }`}
                      required
                    />
                    {formErrors.phoneNumber && (
                      <span className="text-[11px] text-red-500 mt-1 block">
                        {formErrors.phoneNumber}
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => {
                        setEditCompanyName(e.target.value);
                        if (formErrors.companyName) {
                          setFormErrors((prev) => ({ ...prev, companyName: "" }));
                        }
                      }}
                      placeholder="e.g. DevSimplified"
                      className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#1787D4] transition-colors ${
                        formErrors.companyName ? "border-red-400 bg-red-50/20" : "border-[#e2eaff]"
                      }`}
                      required
                    />
                    {formErrors.companyName && (
                      <span className="text-[11px] text-red-500 mt-1 block">
                        {formErrors.companyName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Location */}
              <div className="pt-2 border-t border-[#eef2f8]">
                <h4 className="text-[13px] font-bold text-[#1787D4] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Address &amp; Location
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* House Number */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      House / Unit No.
                    </label>
                    <input
                      type="text"
                      value={editHouseNumber}
                      onChange={(e) => setEditHouseNumber(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. Ayodele Fanoiki Street"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Magodo G.R.A"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="e.g. Lagos"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={editPostcode}
                      onChange={(e) => setEditPostcode(e.target.value)}
                      placeholder="e.g. 100248"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>

                  {/* Country */}
                  <div className="sm:col-span-3">
                    <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="e.g. Nigeria"
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-[#eef2f8] mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormErrors({});
                  }}
                  className="px-4 py-2.5 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0]"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  New Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0]"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {changingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {show2faModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShow2faModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Add an extra layer of security to your Nupat Cloud account using an authenticator app (e.g. Google Authenticator).
            </p>

            <div className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#e2eaff] rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#1787D4]" />
                <div>
                  <div className="text-xs font-semibold text-[#1d1d1f]">Authenticator App</div>
                  <div className="text-[11px] text-[#6e6e73]">
                    {twoFactorEnabled ? "Enabled" : "Currently disabled"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(twoFactorEnabled ? "2FA disabled" : "2FA enabled successfully");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  twoFactorEnabled
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-[#1787D4] text-white hover:bg-[#1371B5]"
                }`}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShow2faModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSessionsModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Active Sessions
            </h3>
            <p className="text-xs text-[#6e6e73]">
              Devices currently signed in to your account.
            </p>

            <div className="flex flex-col gap-3">
              {/* Current device */}
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2eaff] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-[#1787D4]" />
                  <div>
                    <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                      Current Browser Session
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                        THIS DEVICE
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6e6e73] mt-0.5">
                      Mac OS · Chrome · Active now
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#eef2f8]">
              <button
                type="button"
                onClick={() => {
                  toast.success("Other sessions terminated.");
                  setShowSessionsModal(false);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Log Out Other Devices
              </button>
              <button
                type="button"
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Delete Account
            </h3>
            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Are you sure you want to delete your account? This will permanently cancel all your services, domains, and hosting accounts. This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.error("Account deletion request submitted.");
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
