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
} from "lucide-react";
import { toast } from "sonner";
import { useGetMe, useUpdateProfile, useChangePassword } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMe();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword();
  const { mutate: logout } = useLogout();

  // User fields from API with sensible fallbacks
  const user = me?.data;
  const firstName = user?.firstName || "Alex";
  const lastName = user?.lastName || "Prokhorov";
  const email = user?.email || "alex.prokhorov@example.com";
  const phoneNumber = user?.phoneNumber || "+1234908765432";

  // Form state for Edit Profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState(firstName);
  const [editLastName, setEditLastName] = useState(lastName);
  const [editPhone, setEditPhone] = useState(phoneNumber);

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || "");
      setEditLastName(user.lastName || "");
      setEditPhone(user.phoneNumber || "");
    }
  }, [user]);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    updateProfile(
      {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phoneNumber: editPhone.trim(),
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
        },
      }
    );
  };

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

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2
          className="text-[26px] font-bold tracking-tight text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Profile
        </h2>
        <p className="text-[14px] mt-1 text-[#6e6e73]">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-1">
        {/* Left Column (8 cols): Personal Info + Notification Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Personal Information */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Personal Information
              </h3>
              <button
                type="button"
                id="btn-edit-profile"
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-1.5 border border-[#e2eaff] hover:bg-[#f8fafc] text-[#1d1d1f] text-[12.5px] font-semibold rounded-xl transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {/* First Name */}
              <div>
                <span className="text-[12px] font-medium text-[#6e6e73] block">
                  First Name
                </span>
                <span className="text-[14.5px] font-bold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : firstName}
                </span>
              </div>

              {/* Last Name */}
              <div>
                <span className="text-[12px] font-medium text-[#6e6e73] block">
                  Last Name
                </span>
                <span className="text-[14.5px] font-bold text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : lastName}
                </span>
              </div>

              {/* Email Address */}
              <div>
                <span className="text-[12px] font-medium text-[#6e6e73] block">
                  Email Address
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : email}
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <span className="text-[12px] font-medium text-[#6e6e73] block">
                  Phone Number
                </span>
                <span className="text-[14px] font-medium text-[#1d1d1f] mt-1 block">
                  {isLoading ? "—" : phoneNumber || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Notification Settings */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
              Notification Settings
            </h3>
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
                  Renewal reminders
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
                  Product updates
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
                  Security alerts
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
                  Marketing emails
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Security & Credentials + Account Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 3: Security & Credentials */}
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

          {/* Card 4: Account Details */}
          <div className="bg-white rounded-2xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">
              Account Details
            </h3>

            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Created Date</span>
                <span className="font-bold text-[#1d1d1f]">September 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e73]">Account Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
                  Active
                </span>
              </div>
            </div>

            {/* Delete Account */}
            <div className="pt-2 border-t border-[#eef2f8]">
              <button
                type="button"
                id="btn-delete-account"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-4 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-[13px] font-semibold rounded-xl transition-colors text-center"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#1d1d1f]">
              Edit Personal Information
            </h3>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1d1d1f] block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50"
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
