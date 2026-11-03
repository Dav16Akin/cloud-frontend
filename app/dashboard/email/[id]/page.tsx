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
  const [storageQuota, setStorageQuota] = useState("");
  const [savingStorage, setSavingStorage] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Aliases state
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");

  // Autoresponder state
  const [autoresponderEnabled, setAutoresponderEnabled] = useState(false);
  const [autoresponderSubject, setAutoresponderSubject] = useState("");
  const [autoresponderBody, setAutoresponderBody] = useState("");

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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Private Email
        </Link>
      </div>

      {/* Header with Title and Active Badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-[#031033]">
          Mailbox overview
        </h1>
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033]">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#12A150]" />
          Active
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "aliases", label: "Aliases" },
            { id: "autoresponders", label: "Autoresponders" },
            { id: "spam", label: "Spam settings" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors -mb-px border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                isActive
                  ? "text-[#031033] border-[#1787D4]"
                  : "text-[#5A6A85] border-transparent hover:text-[#031033]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Content Area & Quick Operations Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tab specific content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-[#031033]">
                Mailbox settings
              </h3>

              {/* 2x2 grid in one card, split by hairlines */}
              <div className="rounded-xl border border-[#E2E8F0] overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#EEF2F7]">
                {/* Email Address */}
                <div className="bg-white p-5">
                  <span className="text-xs text-[#5A6A85]">
                    Email address
                  </span>
                  <div className="text-sm font-medium text-[#031033] mt-1">
                    {decodedEmail}
                  </div>
                </div>

                {/* Domain */}
                <div className="bg-white p-5">
                  <span className="text-xs text-[#5A6A85]">
                    Domain
                  </span>
                  <div className="text-sm font-medium text-[#031033] mt-1">
                    {domainPart}
                  </div>
                </div>

                {/* Mailbox Storage */}
                <div className="bg-white p-5">
                  <span className="text-xs text-[#5A6A85]">
                    Mailbox storage
                  </span>
                  <div className="text-sm font-medium text-[#031033] mt-1">
                    {storageQuota ? `Custom (${storageQuota} GB)` : "Default quota (10 GB)"}
                  </div>
                </div>

                {/* Created Date */}
                <div className="bg-white p-5">
                  <span className="text-xs text-[#5A6A85]">
                    Created date
                  </span>
                  <div className="text-sm font-medium text-[#031033] mt-1">
                    Jan 15, 2026
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "aliases" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Email aliases
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
                    Incoming mail sent to these aliases will be forwarded to {decodedEmail}.
                  </p>
                </div>
              </div>

              {/* Add Alias Form */}
              <form onSubmit={handleAddAlias} className="flex gap-2">
                <div className="flex-1 flex items-center h-10 border border-[#D5DCE6] rounded-lg overflow-hidden focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/15 transition-colors">
                  <input
                    type="text"
                    placeholder="alias-name"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    className="flex-1 min-w-0 h-full px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none"
                  />
                  <span className="h-full inline-flex items-center px-3 text-sm text-[#5A6A85] bg-[#F2F5FC] border-l border-[#E2E8F0]">
                    @{domainPart}
                  </span>
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Add alias
                </button>
              </form>

              {/* Aliases List */}
              <div className="divide-y divide-[#EEF2F7] border-t border-[#EEF2F7]">
                {aliases.length === 0 ? (
                  <p className="py-4 text-sm text-[#5A6A85] text-center">
                    No aliases configured yet. Add your first alias above.
                  </p>
                ) : (
                  aliases.map((alias) => (
                    <div
                      key={alias}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm font-medium text-[#031033]">
                        {alias}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlias(alias)}
                        className="h-8 px-3 text-sm font-medium text-[#C21F1F] hover:bg-[#FDECEC] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "autoresponders" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Autoresponder
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
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
                  <div className="w-9 h-5 bg-[#D5DCE6] rounded-full peer transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1787D4]/30 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-[#0E7C3A]"></div>
                </label>
              </div>

              {autoresponderEnabled && (
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={autoresponderSubject}
                      onChange={(e) => setAutoresponderSubject(e.target.value)}
                      placeholder="e.g. Out of office reply"
                      className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#031033] block mb-1.5">
                      Message body
                    </label>
                    <textarea
                      rows={4}
                      value={autoresponderBody}
                      onChange={(e) => setAutoresponderBody(e.target.value)}
                      placeholder="e.g. Thank you for contacting me. I am currently away and will reply upon my return."
                      className="w-full px-3 py-2.5 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors resize-y"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Autoresponder settings saved")}
                    className="self-start h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Save autoresponder
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "spam" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#031033]">
                    Spam filtering
                  </h3>
                  <p className="text-xs text-[#5A6A85] mt-0.5">
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
                  <div className="w-9 h-5 bg-[#D5DCE6] rounded-full peer transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1787D4]/30 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-[#0E7C3A]"></div>
                </label>
              </div>

              {spamFilterEnabled && (
                <div className="flex flex-col gap-4 border-t border-[#EEF2F7] pt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-[#031033]">Sensitivity level</span>
                      <span className="text-[#5A6A85] tabular-nums">Score: {spamScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={spamScore}
                      onChange={(e) => setSpamScore(Number(e.target.value))}
                      className="w-full accent-[#1787D4]"
                    />
                    <div className="flex justify-between text-xs text-[#5A6A85] mt-1">
                      <span>Aggressive (1)</span>
                      <span>Balanced (5)</span>
                      <span>Lenient (10)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Spam settings saved")}
                    className="self-start h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Save spam rules
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Quick Operations Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-3">
          <h3 className="text-base font-semibold text-[#031033] mb-1">
            Quick operations
          </h3>

          {/* Change Password */}
          <button
            type="button"
            id="op-change-password"
            onClick={() => setShowPasswordModal(true)}
            className="w-full h-9 px-4 bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium rounded-lg transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Change password
          </button>

          {/* Storage Settings */}
          <button
            type="button"
            id="op-storage-settings"
            onClick={() => setShowStorageModal(true)}
            className="w-full h-9 px-4 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Storage settings
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
            className="w-full h-9 px-4 bg-white hover:bg-[#F2F5FC] border border-[#D5DCE6] text-[#031033] text-sm font-medium rounded-lg transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Email settings
          </button>

          {/* Delete Mailbox */}
          <button
            type="button"
            id="op-delete-mailbox"
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-9 px-4 bg-white hover:bg-[#FDECEC] border border-[#F3C7C7] text-[#C21F1F] text-sm font-medium rounded-lg transition-colors text-center mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30"
          >
            Delete mailbox
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
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Change mailbox password
            </h3>
            <p className="text-sm text-[#5A6A85]">
              Update the login password for{" "}
              <strong className="font-medium text-[#031033]">{decodedEmail}</strong>.
            </p>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-10 pl-3 pr-10 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Confirm password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors tabular-nums"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {savingPassword && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save password
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
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowStorageModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Storage settings
            </h3>
            <p className="text-sm text-[#5A6A85]">
              Adjust quota for{" "}
              <strong className="font-medium text-[#031033]">{decodedEmail}</strong>.
            </p>

            <form onSubmit={handleUpdateStorage} className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-[#031033] block mb-1.5">
                  Storage limit (GB)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  value={storageQuota}
                  onChange={(e) => setStorageQuota(e.target.value)}
                  placeholder="e.g. 10.0"
                  className="w-full h-10 px-3 bg-white border border-[#D5DCE6] rounded-lg text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors tabular-nums"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setShowStorageModal(false)}
                  className="h-9 px-4 text-sm font-medium border border-[#D5DCE6] bg-white rounded-lg text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStorage}
                  className="h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  {savingStorage && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save quota
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
            className="absolute inset-0 bg-[#031033]/40"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#031033]">
              Delete mailbox
            </h3>
            <p className="text-sm text-[#5A6A85]">
              Are you sure you want to delete{" "}
              <strong className="font-medium text-[#031033]">{decodedEmail}</strong>? This
              will permanently delete all stored emails and mailbox data.
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
                onClick={handleDeleteMailbox}
                disabled={deleting}
                className="h-9 px-4 text-sm font-medium bg-[#DC2626] hover:bg-[#C21F1F] text-white rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete mailbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
