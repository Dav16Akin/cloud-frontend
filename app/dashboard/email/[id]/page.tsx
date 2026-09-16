"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  HardDrive,
  Settings,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Mail,
  Plus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "aliases" | "autoresponders" | "spam";

export default function MailboxOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Decode the mailbox identifier from the URL
  const decodedEmail = decodeURIComponent(resolvedParams.id);
  const domainPart = decodedEmail.includes("@")
    ? decodedEmail.split("@")[1]
    : "acme.com";

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [showStorageModal, setShowStorageModal] = useState(false);
  const [storageQuota, setStorageQuota] = useState("10.0");
  const [savingStorage, setSavingStorage] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Aliases state
  const [aliases, setAliases] = useState<string[]>([
    `support@${domainPart}`,
    `contact@${domainPart}`,
  ]);
  const [newAlias, setNewAlias] = useState("");

  // Autoresponder state
  const [autoresponderEnabled, setAutoresponderEnabled] = useState(false);
  const [autoresponderSubject, setAutoresponderSubject] = useState(
    "Out of office reply"
  );
  const [autoresponderBody, setAutoresponderBody] = useState(
    "Thank you for contacting me. I am currently away and will reply upon my return."
  );

  // Spam Settings state
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(true);
  const [spamScore, setSpamScore] = useState(5);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Mailbox password updated successfully");
    }, 800);
  };

  const handleUpdateStorage = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStorage(true);
    setTimeout(() => {
      setSavingStorage(false);
      setShowStorageModal(false);
      toast.success("Storage quota updated successfully");
    }, 600);
  };

  const handleDeleteMailbox = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setShowDeleteModal(false);
      toast.success("Mailbox deleted successfully");
      router.push("/dashboard/email");
    }, 800);
  };

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlias.trim()) return;
    const fullAlias = newAlias.includes("@")
      ? newAlias.trim()
      : `${newAlias.trim()}@${domainPart}`;
    if (aliases.includes(fullAlias)) {
      toast.error("Alias already exists");
      return;
    }
    setAliases([...aliases, fullAlias]);
    setNewAlias("");
    toast.success("Alias added successfully");
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
    toast.success("Alias removed");
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/email"
          id="btn-back-private-email"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1787D4] hover:text-[#1371B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Private Email
        </Link>
      </div>

      {/* Header with Title and Active Badge */}
      <div className="flex items-center gap-3">
        <h2
          className="text-[26px] font-bold text-[#1d1d1f] tracking-tight"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Mailbox Overview
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-[#e6f9ed] text-[#12a150] border border-[#b7eed0]">
          Active
        </span>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-[#e8e8ed]"
        style={{ borderBottomWidth: "2px" }}
      >
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "aliases", label: "Aliases" },
            { id: "autoresponders", label: "Autoresponders" },
            { id: "spam", label: "Spam Settings" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors -mb-[2px] border-b-2"
              style={{
                color: isActive ? "#1787D4" : "#6e6e73",
                borderBottomColor: isActive ? "#1787D4" : "transparent",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Content Area & Quick Operations Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Column: Tab specific content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                Mailbox Settings
              </h3>

              {/* 2x2 Grid of Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
                  <span className="text-[12px] font-medium text-[#6e6e73]">
                    Email Address
                  </span>
                  <div className="text-[14px] font-bold text-[#1d1d1f] mt-1">
                    {decodedEmail}
                  </div>
                </div>

                {/* Domain */}
                <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
                  <span className="text-[12px] font-medium text-[#6e6e73]">
                    Domain
                  </span>
                  <div className="text-[14px] font-bold text-[#1d1d1f] mt-1">
                    {domainPart}
                  </div>
                </div>

                {/* Mailbox Storage */}
                <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
                  <span className="text-[12px] font-medium text-[#6e6e73]">
                    Mailbox Storage
                  </span>
                  <div className="text-[14px] font-bold text-[#1d1d1f] mt-1">
                    2.4 GB used of {storageQuota} GB
                  </div>
                </div>

                {/* Created Date */}
                <div className="bg-white rounded-xl border border-[#e2eaff] p-5 shadow-sm">
                  <span className="text-[12px] font-medium text-[#6e6e73]">
                    Created Date
                  </span>
                  <div className="text-[14px] font-bold text-[#1d1d1f] mt-1">
                    Jan 15, 2026
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "aliases" && (
            <div className="bg-white rounded-xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    Email Aliases
                  </h3>
                  <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                    Incoming mail sent to these aliases will be forwarded to {decodedEmail}.
                  </p>
                </div>
              </div>

              {/* Add Alias Form */}
              <form onSubmit={handleAddAlias} className="flex gap-2">
                <div className="flex-1 flex items-center border border-[#e2eaff] rounded-xl overflow-hidden focus-within:border-[#1787D4] transition-colors">
                  <input
                    type="text"
                    placeholder="alias-name"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    className="flex-1 px-3 py-2 text-[13px] text-[#1d1d1f] focus:outline-none"
                  />
                  <span className="px-3 text-[13px] text-[#6e6e73] bg-[#f8fafc] border-l border-[#e2eaff]">
                    @{domainPart}
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors shrink-0"
                >
                  Add Alias
                </button>
              </form>

              {/* Aliases List */}
              <div className="divide-y divide-[#f2f5fc] border-t border-[#eef2f8] mt-2">
                {aliases.map((alias) => (
                  <div
                    key={alias}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-[13px] font-medium text-[#1d1d1f]">
                      {alias}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlias(alias)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "autoresponders" && (
            <div className="bg-white rounded-xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    Autoresponder
                  </h3>
                  <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                    Automatically reply to incoming messages when away.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoresponderEnabled}
                    onChange={(e) => {
                      setAutoresponderEnabled(e.target.checked);
                      toast.success(
                        e.target.checked
                          ? "Autoresponder enabled"
                          : "Autoresponder disabled"
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1787D4]"></div>
                </label>
              </div>

              {autoresponderEnabled && (
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <label className="text-[12.5px] font-medium text-[#5a6a85] block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={autoresponderSubject}
                      onChange={(e) => setAutoresponderSubject(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] font-medium text-[#5a6a85] block mb-1">
                      Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={autoresponderBody}
                      onChange={(e) => setAutoresponderBody(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Autoresponder settings saved")}
                    className="self-start px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors"
                  >
                    Save Autoresponder
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "spam" && (
            <div className="bg-white rounded-xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                    Spam Filtering
                  </h3>
                  <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                    Automated email scanning to detect and quarantine spam.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spamFilterEnabled}
                    onChange={(e) => {
                      setSpamFilterEnabled(e.target.checked);
                      toast.success(
                        e.target.checked
                          ? "Spam filter enabled"
                          : "Spam filter disabled"
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1787D4]"></div>
                </label>
              </div>

              {spamFilterEnabled && (
                <div className="flex flex-col gap-4 border-t border-[#eef2f8] pt-4">
                  <div>
                    <div className="flex justify-between text-[12.5px] font-medium text-[#5a6a85] mb-1">
                      <span>Sensitivity Level</span>
                      <span>Score: {spamScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={spamScore}
                      onChange={(e) => setSpamScore(Number(e.target.value))}
                      className="w-full accent-[#1787D4]"
                    />
                    <div className="flex justify-between text-[11px] text-[#9ba8c0] mt-1">
                      <span>Aggressive (1)</span>
                      <span>Balanced (5)</span>
                      <span>Lenient (10)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Spam settings saved")}
                    className="self-start px-4 py-2 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors"
                  >
                    Save Spam Rules
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Quick Operations Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#e2eaff] p-6 shadow-sm flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">
            Quick Operations
          </h3>

          {/* Change Password */}
          <button
            type="button"
            id="op-change-password"
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-2.5 px-4 bg-[#1787D4] hover:bg-[#1371B5] text-white text-[13px] font-semibold rounded-xl transition-colors text-center shadow-sm"
          >
            Change Password
          </button>

          {/* Storage Settings */}
          <button
            type="button"
            id="op-storage-settings"
            onClick={() => setShowStorageModal(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center"
          >
            Storage Settings
          </button>

          {/* Email Settings */}
          <button
            type="button"
            id="op-email-settings"
            onClick={() => {
              toast.info(
                `IMAP/SMTP Settings: Server: mail.${domainPart}, Port: 993 (SSL)`
              );
            }}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafc] border border-[#e2eaff] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors text-center"
          >
            Email Settings
          </button>

          {/* Delete Mailbox */}
          <button
            type="button"
            id="op-delete-mailbox"
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-red-50 border border-[#1787D4] text-[#1787D4] hover:border-red-400 hover:text-red-600 text-[13px] font-semibold rounded-xl transition-colors text-center mt-1"
          >
            Delete Mailbox
          </button>
        </div>
      </div>

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
            <h3 className="text-base font-bold text-[#031033]">
              Change Mailbox Password
            </h3>
            <p className="text-xs text-[#5a6a85]">
              Update the login password for{" "}
              <strong className="text-[#1d1d1f]">{decodedEmail}</strong>.
            </p>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#031033] block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 pr-10 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba8c0]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#031033] block mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPassword && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage Settings Modal */}
      {showStorageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowStorageModal(false)}
          />
          <div className="relative bg-white border border-[#e2eaff] rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#031033]">
              Storage Settings
            </h3>
            <p className="text-xs text-[#5a6a85]">
              Adjust quota for{" "}
              <strong className="text-[#1d1d1f]">{decodedEmail}</strong>.
            </p>

            <form onSubmit={handleUpdateStorage} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#031033] block mb-1">
                  Storage Limit (GB)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  value={storageQuota}
                  onChange={(e) => setStorageQuota(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#e2eaff] rounded-xl text-sm focus:outline-none focus:border-[#1787D4]"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setShowStorageModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] rounded-xl text-[#5a6a85] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStorage}
                  className="px-4 py-2 text-xs font-semibold bg-[#1787D4] hover:bg-[#1371B5] text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingStorage && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save Quota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
            <h3 className="text-base font-bold text-[#031033]">
              Delete Mailbox
            </h3>
            <p className="text-xs text-[#5a6a85] leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[#1d1d1f]">{decodedEmail}</strong>? This
              will permanently delete all stored emails and mailbox data.
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
                onClick={handleDeleteMailbox}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Mailbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
