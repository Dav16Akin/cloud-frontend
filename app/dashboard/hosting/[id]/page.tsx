"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Server,
  Globe,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  BarChart2,
  HardDrive,
  Database,
  Layers,
  Plus,
  X,
  Eye,
  EyeOff,
  Send,
  Clock,
  XCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  Network,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetHostingById,
  useSuspendHosting,
  useUnsuspendHosting,
  useDeleteHosting,
  useGetHostingStats,
  useGetHostingEmails,
  useCreateHostingEmail,
  useDeleteHostingEmail,
  useChangeHostingEmailPassword,
  useGetHostingForwarders,
  useCreateHostingForwarder,
  useDeleteHostingForwarder,
  useGetHostingDatabases,
  useCreateHostingDatabase,
  useDeleteHostingDatabase,
  useGetHostingDatabaseUsers,
  useCreateHostingDatabaseUser,
  useDeleteHostingDatabaseUser,
  useAssignHostingDatabaseUser,
} from "@/hooks/useHosting";
import type { HostingStatus, HostingEmail, HostingForwarder, HostingDatabase, HostingDatabaseUser } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isExpiringSoon(iso: string) {
  const days = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 14;
}

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() =>
    toast.success(`${label} copied!`)
  );
}

// ── Status Badge (full, not imported to avoid cycle) ─────────────────────────

function StatusBadge({ status }: { status: HostingStatus }) {
  const s = (status ?? "").toUpperCase() as HostingStatus;
  const cfg =
    s === "ACTIVE"
      ? { icon: CheckCircle2, label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" }
      : s === "SUSPENDED"
      ? { icon: PauseCircle, label: "Suspended", cls: "bg-red-50 text-red-500 border-red-200" }
      : s === "TERMINATED"
      ? { icon: XCircle, label: "Terminated", cls: "bg-gray-100 text-gray-500 border-gray-200" }
      : { icon: Clock, label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200" };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Tab pill ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "emails" | "forwarders" | "databases";

function TabPill({
  tab,
  active,
  label,
  icon: Icon,
  onClick,
}: {
  tab: Tab;
  active: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  const isActive = tab === active;
  return (
    <button
      id={`hosting-tab-${tab}`}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        isActive
          ? "border-[#e8900a] text-[#031033]"
          : "border-transparent text-[#5a6a85] hover:text-[#031033] hover:border-[#e2eaff]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-[#e2eaff] w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-bold text-[#031033]">{title}</h3>
        <p className="text-sm text-[#5a6a85] leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition-colors ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#e8900a] text-white hover:bg-[#c97a08]"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ hostingId }: { hostingId: string }) {
  const { data: stats, isLoading, isError } = useGetHostingStats(hostingId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-[#e2eaff] p-4 flex flex-col gap-3">
            <div className="w-9 h-9 bg-[#e8edf8] rounded" />
            <div className="h-4 w-16 bg-[#e8edf8] rounded" />
            <div className="h-6 w-12 bg-[#e8edf8] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center bg-white border border-[#e2eaff]">
        <AlertCircle className="w-8 h-8 text-[#9ba8c0]" />
        <p className="text-sm text-[#5a6a85]">
          Could not load hosting stats. The server may be busy — try again
          shortly.
        </p>
      </div>
    );
  }

  // Top 4 primary metric tiles
  const primaryTiles = [
    {
      icon: HardDrive,
      label: "Disk Used",
      value: stats.diskUsed,
      sub: `of ${stats.diskLimit}`,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Layers,
      label: "Inodes Used",
      value: String(stats.inodesUsed),
      sub: `limit: ${stats.inodesLimit}`,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: Mail,
      label: "Max Emails",
      value: stats.maxEmails,
      sub: `${stats.maxEmailQuotaMB} MB quota each`,
      color: "text-[#e8900a]",
      bg: "bg-[#fff8ee]",
    },
    {
      icon: Database,
      label: "Max Databases",
      value: stats.maxDatabases,
      sub: `${stats.maxFTP} FTP accounts`,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  // Secondary detail rows
  const details = [
    { label: "Plan", value: stats.plan },
    { label: "Server IP", value: stats.ip },
    { label: "Max Subdomains", value: stats.maxSubdomains },
    { label: "Max Addon Domains", value: stats.maxAddonDomains },
    { label: "Max Emails / Hour", value: stats.maxEmailPerHour },
    { label: "Account Created", value: stats.startDate },
    { label: "Suspend Reason", value: stats.suspendReason },
    { label: "Server Status", value: stats.status },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Primary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {primaryTiles.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#e2eaff] p-4 flex flex-col gap-2"
          >
            <div className={`w-9 h-9 flex items-center justify-center ${bg}`}>
              <Icon className={`w-[18px] h-[18px] ${color}`} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#9ba8c0] uppercase tracking-wide">
                {label}
              </p>
              <p className="text-xl font-extrabold text-[#031033] mt-0.5 leading-none">
                {value}
              </p>
              <p className="text-[11px] text-[#9ba8c0] mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail grid */}
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-5 py-3 border-b border-[#e2eaff] flex items-center gap-2">
          <Network className="w-4 h-4 text-[#9ba8c0]" />
          <h3 className="text-sm font-semibold text-[#031033]">Account Details</h3>
        </div>
        <div className="divide-y divide-[#e2eaff]">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-2.5"
            >
              <span className="text-xs text-[#9ba8c0] font-medium">{label}</span>
              <span
                className={`text-xs font-semibold ${
                  label === "Server Status"
                    ? value === "ACTIVE"
                      ? "text-emerald-600"
                      : "text-red-500"
                    : "text-[#031033]"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Emails Tab ────────────────────────────────────────────────────────────────

function EmailsTab({ hostingId }: { hostingId: string }) {
  const {
    data: emails,
    isLoading,
    isError,
  } = useGetHostingEmails(hostingId);
  const { mutate: createEmail, isPending: creating } =
    useCreateHostingEmail(hostingId);
  const { mutate: deleteEmail, isPending: deleting } =
    useDeleteHostingEmail(hostingId);
  const { mutate: changePass, isPending: changingPass } =
    useChangeHostingEmailPassword(hostingId);

  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  const [changeTarget, setChangeTarget] = useState<string | null>(null);
  const [changePassVal, setChangePassVal] = useState("");
  const [showChangePass, setShowChangePass] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPass.trim()) return;
    createEmail(
      { email: newEmail.trim(), password: newPass },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewEmail("");
          setNewPass("");
        },
      }
    );
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTarget || !changePassVal.trim()) return;
    changePass(
      { email: changeTarget, password: changePassVal },
      {
        onSuccess: () => {
          setChangeTarget(null);
          setChangePassVal("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Create form */}
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#031033]">
            Email Accounts
          </h3>
          <button
            id="hosting-email-add"
            onClick={() => setShowCreate((p) => !p)}
            className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New Email
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-[#031033]">
              Create Email Account
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="hosting-email-input"
                type="text"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="username (e.g. hello)"
                className="flex-1 bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
              />
              <div className="relative flex-1">
                <input
                  id="hosting-email-pass"
                  type={showNewPass ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border border-[#e2eaff] px-3 py-2 pr-9 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#031033]"
                >
                  {showNewPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
            </div>
          </form>
        )}

        {/* Email list */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">
              Could not load email accounts.
            </p>
          </div>
        )}
        {!isLoading && !isError && (!emails || emails.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Mail className="w-8 h-8 text-[#9ba8c0] mb-2" />
            <p className="text-sm text-[#5a6a85]">No email accounts yet.</p>
          </div>
        )}
        {emails && emails.length > 0 && (
          <div className="divide-y divide-[#e2eaff]">
            {emails.map((em: HostingEmail) => (
              <div
                key={em.email}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors"
              >
                <div className="w-7 h-7 bg-[#fff8ee] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#e8900a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#031033] truncate">
                    {em.email}
                  </p>
                  <p className="text-xs text-[#9ba8c0]">
                    {em.diskused} / {em.diskquota}
                  </p>
                </div>
                <button
                  id={`hosting-email-changepw-${em.email}`}
                  onClick={() => {
                    setChangeTarget(em.email);
                    setChangePassVal("");
                  }}
                  className="text-xs font-semibold text-[#5a6a85] hover:text-[#031033] px-2.5 py-1.5 border border-[#e2eaff] hover:bg-[#f2f5fc] transition-colors"
                >
                  Change Password
                </button>
                <button
                  id={`hosting-email-delete-${em.email}`}
                  onClick={() => setDeleteTarget(em.email)}
                  disabled={deleting}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors"
                  aria-label={`Delete ${em.email}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change password inline form */}
      {changeTarget && (
        <div className="bg-white border border-[#e2eaff] px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#031033]">
              Change password for{" "}
              <span className="text-[#e8900a]">{changeTarget}</span>
            </p>
            <button
              onClick={() => setChangeTarget(null)}
              className="text-[#9ba8c0] hover:text-[#031033]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleChangePass} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="hosting-email-newpass"
                type={showChangePass ? "text" : "password"}
                value={changePassVal}
                onChange={(e) => setChangePassVal(e.target.value)}
                placeholder="New password"
                className="w-full bg-[#f6f9ff] border border-[#e2eaff] px-3 py-2 pr-9 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowChangePass((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#031033]"
              >
                {showChangePass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={changingPass}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60"
            >
              {changingPass ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Update
            </button>
          </form>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Email Account"
          message={`Are you sure you want to delete ${deleteTarget}? All emails in this account will be permanently removed.`}
          confirmLabel="Delete Email"
          danger
          loading={deleting}
          onConfirm={() =>
            deleteEmail(deleteTarget, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Forwarders Tab ────────────────────────────────────────────────────────────

function ForwardersTab({ hostingId }: { hostingId: string }) {
  const { data: forwarders, isLoading, isError } = useGetHostingForwarders(hostingId);
  const { mutate: createFwd, isPending: creating } =
    useCreateHostingForwarder(hostingId);
  const { mutate: deleteFwd, isPending: deleting } =
    useDeleteHostingForwarder(hostingId);

  const [showCreate, setShowCreate] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ address: string; forwarder: string } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;
    createFwd(
      { source: source.trim(), destination: destination.trim() },
      {
        onSuccess: () => {
          setShowCreate(false);
          setSource("");
          setDestination("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#031033]">
            Email Forwarders
          </h3>
          <button
            id="hosting-forwarder-add"
            onClick={() => setShowCreate((p) => !p)}
            className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New Forwarder
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-[#031033]">
              Create Forwarder
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                id="hosting-fwd-source"
                type="email"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source address (e.g. info@domain.com)"
                className="flex-1 bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
              />
              <Send className="w-4 h-4 text-[#9ba8c0] shrink-0 hidden sm:block" />
              <input
                id="hosting-fwd-dest"
                type="email"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination address"
                className="flex-1 bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
              />
              <button
                type="submit"
                disabled={creating}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add
              </button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">Could not load forwarders.</p>
          </div>
        )}
        {!isLoading && !isError && (!forwarders || forwarders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Send className="w-8 h-8 text-[#9ba8c0] mb-2" />
            <p className="text-sm text-[#5a6a85]">No email forwarders yet.</p>
          </div>
        )}
        {forwarders && forwarders.length > 0 && (
          <div className="divide-y divide-[#e2eaff]">
            {forwarders.map((fwd: HostingForwarder) => (
              <div
                key={fwd.dest}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors"
              >
                <div className="w-7 h-7 bg-[#f2f5fc] flex items-center justify-center shrink-0">
                  <Send className="w-3.5 h-3.5 text-[#5a6a85]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#031033] truncate">
                    <span className="font-semibold">{fwd.dest}</span>
                    <ChevronRight className="w-3 h-3 inline mx-1 text-[#9ba8c0]" />
                    <span className="text-[#5a6a85]">{fwd.forward}</span>
                  </p>
                </div>
                <button
                  id={`hosting-fwd-delete-${fwd.forward}`}
                  onClick={() => setDeleteTarget({ address: fwd.dest, forwarder: fwd.forward })}
                  disabled={deleting}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors"
                  aria-label="Delete forwarder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Forwarder"
          message={`Delete forwarder ${deleteTarget.address} → ${deleteTarget.forwarder}? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deleting}
          onConfirm={() =>
            deleteFwd(
              { address: deleteTarget.address, forwarder: deleteTarget.forwarder },
              { onSuccess: () => setDeleteTarget(null) }
            )
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Databases Tab ─────────────────────────────────────────────────────────────

function DatabasesTab({ hostingId }: { hostingId: string }) {
  const { data: account } = useGetHostingById(hostingId);
  const { data: databases, isLoading: loadingDbs, isError: errorDbs } = useGetHostingDatabases(hostingId);
  const { data: users, isLoading: loadingUsers, isError: errorUsers } = useGetHostingDatabaseUsers(hostingId);

  const { mutate: createDb, isPending: creatingDb } = useCreateHostingDatabase(hostingId);
  const { mutate: deleteDb, isPending: deletingDb } = useDeleteHostingDatabase(hostingId);
  const { mutate: createUser, isPending: creatingUser } = useCreateHostingDatabaseUser(hostingId);
  const { mutate: deleteUser, isPending: deletingUser } = useDeleteHostingDatabaseUser(hostingId);
  const { mutate: assignUser, isPending: assigningUser } = useAssignHostingDatabaseUser(hostingId);

  // States
  const [showCreateDb, setShowCreateDb] = useState(false);
  const [dbSuffix, setDbSuffix] = useState("");

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userSuffix, setUserSuffix] = useState("");
  const [userPass, setUserPass] = useState("");
  const [showUserPass, setShowUserPass] = useState(false);

  const [assignDb, setAssignDb] = useState("");
  const [assignUserVal, setAssignUserVal] = useState("");

  const [deleteDbTarget, setDeleteDbTarget] = useState<string | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<string | null>(null);

  const dbPrefix = account?.cpanelUsername ? `${account.cpanelUsername}_` : "";

  const handleCreateDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbSuffix.trim()) return;
    const databaseName = `${dbPrefix}${dbSuffix.trim()}`;
    createDb(
      { database: databaseName },
      {
        onSuccess: () => {
          setShowCreateDb(false);
          setDbSuffix("");
        },
      }
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSuffix.trim() || !userPass.trim()) return;
    const username = `${dbPrefix}${userSuffix.trim()}`;
    createUser(
      { user: username, password: userPass },
      {
        onSuccess: () => {
          setShowCreateUser(false);
          setUserSuffix("");
          setUserPass("");
        },
      }
    );
  };

  const handleAssignUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDb || !assignUserVal) return;
    assignUser(
      { database: assignDb, user: assignUserVal, privileges: ["ALL PRIVILEGES"] },
      {
        onSuccess: () => {
          setAssignDb("");
          setAssignUserVal("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* Databases Card */}
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#031033]">
            Databases
          </h3>
          <button
            id="hosting-db-add"
            onClick={() => setShowCreateDb((p) => !p)}
            className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New Database
          </button>
        </div>

        {showCreateDb && (
          <form
            onSubmit={handleCreateDb}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-[#031033]">
              Create New Database
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033]">
                {dbPrefix && (
                  <span className="text-[#9ba8c0] font-semibold select-none mr-0.5">
                    {dbPrefix}
                  </span>
                )}
                <input
                  id="hosting-db-input"
                  type="text"
                  value={dbSuffix}
                  onChange={(e) => setDbSuffix(e.target.value)}
                  placeholder="database_name"
                  className="flex-1 bg-transparent border-none outline-none text-[#031033] placeholder:text-[#c0cad8]"
                />
              </div>
              <button
                type="submit"
                disabled={creatingDb}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap justify-center"
              >
                {creatingDb ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
            </div>
          </form>
        )}

        {loadingDbs && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
          </div>
        )}
        {errorDbs && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">Could not load databases.</p>
          </div>
        )}
        {!loadingDbs && !errorDbs && (!databases || databases.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Database className="w-8 h-8 text-[#9ba8c0] mb-2" />
            <p className="text-sm text-[#5a6a85]">No databases yet.</p>
          </div>
        )}
        {databases && databases.length > 0 && (
          <div className="divide-y divide-[#e2eaff]">
            {databases.map((db: HostingDatabase) => (
              <div
                key={db.database}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors"
              >
                <div className="w-7 h-7 bg-[#f6f0ff] flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5 text-[#8b5cf6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#031033] truncate">
                    {db.database}
                  </p>
                  <p className="text-xs text-[#9ba8c0] flex flex-wrap gap-1 mt-0.5 items-center">
                    {db.diskusage && <span className="mr-2">Size: {db.diskusage}</span>}
                    {db.users && db.users.length > 0 ? (
                      <>
                        <span className="text-[#5a6a85]">Users:</span>
                        {db.users.map((u) => (
                          <span key={u} className="bg-[#f0f4ff] text-[#3b82f6] px-1.5 py-0.5 text-[10px] font-semibold border border-[#dbe6ff]">
                            {u}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-[#9ba8c0] italic">No users linked</span>
                    )}
                  </p>
                </div>
                <button
                  id={`hosting-db-delete-${db.database}`}
                  onClick={() => setDeleteDbTarget(db.database)}
                  disabled={deletingDb}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors"
                  aria-label={`Delete database ${db.database}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Users Card */}
      <div className="bg-white border border-[#e2eaff]">
        <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#031033]">
            Database Users
          </h3>
          <button
            id="hosting-dbuser-add"
            onClick={() => setShowCreateUser((p) => !p)}
            className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            New User
          </button>
        </div>

        {showCreateUser && (
          <form
            onSubmit={handleCreateUser}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-[#031033]">
              Create New Database User
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033]">
                {dbPrefix && (
                  <span className="text-[#9ba8c0] font-semibold select-none mr-0.5">
                    {dbPrefix}
                  </span>
                )}
                <input
                  id="hosting-dbuser-input"
                  type="text"
                  value={userSuffix}
                  onChange={(e) => setUserSuffix(e.target.value)}
                  placeholder="username"
                  className="flex-1 bg-transparent border-none outline-none text-[#031033] placeholder:text-[#c0cad8]"
                />
              </div>
              <div className="relative flex-1">
                <input
                  id="hosting-dbuser-pass"
                  type={showUserPass ? "text" : "password"}
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border border-[#e2eaff] px-3 py-2 pr-9 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPass((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ba8c0] hover:text-[#031033]"
                >
                  {showUserPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={creatingUser}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap justify-center"
              >
                {creatingUser ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
            </div>
          </form>
        )}

        {loadingUsers && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
          </div>
        )}
        {errorUsers && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">Could not load database users.</p>
          </div>
        )}
        {!loadingUsers && !errorUsers && (!users || users.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Network className="w-8 h-8 text-[#9ba8c0] mb-2" />
            <p className="text-sm text-[#5a6a85]">No database users yet.</p>
          </div>
        )}
        {users && users.length > 0 && (
          <div className="divide-y divide-[#e2eaff]">
            {users.map((usr: HostingDatabaseUser) => (
              <div
                key={usr.user}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f6f9ff] transition-colors"
              >
                <div className="w-7 h-7 bg-[#effaf6] flex items-center justify-center shrink-0">
                  <Network className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#031033] truncate">
                    {usr.user}
                  </p>
                </div>
                <button
                  id={`hosting-dbuser-delete-${usr.user}`}
                  onClick={() => setDeleteUserTarget(usr.user)}
                  disabled={deletingUser}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors"
                  aria-label={`Delete user ${usr.user}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign User to Database Card */}
      {databases && databases.length > 0 && users && users.length > 0 && (
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-5 py-3.5 border-b border-[#e2eaff]">
            <h3 className="text-sm font-semibold text-[#031033]">
              Add User To Database
            </h3>
          </div>
          <form onSubmit={handleAssignUser} className="px-5 py-4 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label htmlFor="hosting-assign-user-select" className="text-xs font-semibold text-[#5a6a85]">
                User
              </label>
              <select
                id="hosting-assign-user-select"
                value={assignUserVal}
                onChange={(e) => setAssignUserVal(e.target.value)}
                className="w-full bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                required
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.user} value={u.user}>
                    {u.user}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label htmlFor="hosting-assign-db-select" className="text-xs font-semibold text-[#5a6a85]">
                Database
              </label>
              <select
                id="hosting-assign-db-select"
                value={assignDb}
                onChange={(e) => setAssignDb(e.target.value)}
                className="w-full bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                required
              >
                <option value="">Select a database...</option>
                {databases.map((db) => (
                  <option key={db.database} value={db.database}>
                    {db.database}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={assigningUser}
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap w-full sm:w-auto justify-center h-[38px]"
            >
              {assigningUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Assign User
            </button>
          </form>
        </div>
      )}

      {/* Delete Database Confirmation */}
      {deleteDbTarget && (
        <ConfirmModal
          title="Delete Database"
          message={`Are you sure you want to permanently delete the database "${deleteDbTarget}"? All table data will be lost forever.`}
          confirmLabel="Delete Database"
          danger
          loading={deletingDb}
          onConfirm={() =>
            deleteDb(deleteDbTarget, {
              onSuccess: () => setDeleteDbTarget(null),
            })
          }
          onCancel={() => setDeleteDbTarget(null)}
        />
      )}

      {/* Delete User Confirmation */}
      {deleteUserTarget && (
        <ConfirmModal
          title="Delete Database User"
          message={`Are you sure you want to delete the database user "${deleteUserTarget}"? Any database permissions assigned to this user will be revoked.`}
          confirmLabel="Delete User"
          danger
          loading={deletingUser}
          onConfirm={() =>
            deleteUser(deleteUserTarget, {
              onSuccess: () => setDeleteUserTarget(null),
            })
          }
          onCancel={() => setDeleteUserTarget(null)}
        />
      )}
    </div>
  );
}

// ── Main Manage Page ──────────────────────────────────────────────────────────

export default function ManageHostingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: account, isLoading, isError } = useGetHostingById(id);
  const { mutate: suspend, isPending: suspending } = useSuspendHosting();
  const { mutate: unsuspend, isPending: unsuspending } = useUnsuspendHosting();
  const { mutate: terminate, isPending: terminating } = useDeleteHosting();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8900a]" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <AlertCircle className="w-10 h-10 text-[#9ba8c0]" />
        <p className="text-sm text-[#5a6a85]">
          Hosting account not found or could not be loaded.
        </p>
        <Link
          href="/dashboard/hosting"
          className="text-sm font-semibold text-[#e8900a] hover:underline underline-offset-2"
        >
          ← Back to Hosting
        </Link>
      </div>
    );
  }

  const status = (account.status?.toUpperCase() ?? "PENDING") as HostingStatus;
  const isActive = status === "ACTIVE";
  const isSuspended = status === "SUSPENDED";
  const isTerminated = status === "TERMINATED";
  const expiring = account.expiresAt ? isExpiringSoon(account.expiresAt) : false;
  const planName = account.plan?.name ?? "—";
  const cpanelUrl = account.serverIp
    ? account.serverIp.replace("2087", "2083")
    : null;

  return (
    <>
      {showTerminateModal && (
        <ConfirmModal
          title="Terminate Hosting Account"
          message={`This will permanently delete the hosting account for ${account.domain}. All files, databases, and emails will be removed. This cannot be undone.`}
          confirmLabel="Terminate"
          danger
          loading={terminating}
          onConfirm={() =>
            terminate(id, {
              onSuccess: () => {
                setShowTerminateModal(false);
                router.push("/dashboard/hosting");
              },
            })
          }
          onCancel={() => setShowTerminateModal(false)}
        />
      )}

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/dashboard/hosting"
          id="manage-back"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hosting
        </Link>

        {/* Hero card */}
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-[#f2f5fc] border border-[#e2eaff] flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-[#031033]" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-[#031033]">
                  {account.domain}
                </h1>
                <StatusBadge status={status} />
                {expiring && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 font-semibold">
                    Expiring soon
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5a6a85]">
                <span className="flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-[#9ba8c0]" />
                  {planName} Plan
                </span>
                {account.cpanelUsername && (
                  <span className="flex items-center gap-1">
                    <span className="text-[#9ba8c0]">User:</span>
                    <code className="text-[#031033] font-mono">
                      {account.cpanelUsername}
                    </code>
                    <button
                      onClick={() =>
                        copyText(account.cpanelUsername!, "Username")
                      }
                      className="text-[#9ba8c0] hover:text-[#031033]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {account.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#9ba8c0]" />
                    Expires {formatDate(account.expiresAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {cpanelUrl && (
                <a
                  href={cpanelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="manage-cpanel-link"
                  className="flex items-center gap-1.5 text-xs font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] px-3 py-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open cPanel
                </a>
              )}

              {isActive && !isTerminated && (
                <button
                  id="manage-suspend"
                  onClick={() => suspend(id)}
                  disabled={suspending}
                  className="flex items-center gap-1.5 text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 px-3 py-2 transition-colors disabled:opacity-60"
                >
                  {suspending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PauseCircle className="w-3.5 h-3.5" />
                  )}
                  Suspend
                </button>
              )}

              {isSuspended && (
                <button
                  id="manage-unsuspend"
                  onClick={() => unsuspend(id)}
                  disabled={unsuspending}
                  className="flex items-center gap-1.5 text-xs font-semibold border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-3 py-2 transition-colors disabled:opacity-60"
                >
                  {unsuspending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlayCircle className="w-3.5 h-3.5" />
                  )}
                  Unsuspend
                </button>
              )}

              {!isTerminated && (
                <button
                  id="manage-terminate"
                  onClick={() => setShowTerminateModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 px-3 py-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Terminate
                </button>
              )}
            </div>
          </div>

          {/* Status banner */}
          {isSuspended && (
            <div className="mx-5 mb-4 bg-red-50 border border-red-200 px-4 py-2.5 flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">
                This hosting account is currently suspended. Unsuspend to
                restore access.
              </p>
            </div>
          )}
          {isTerminated && (
            <div className="mx-5 mb-4 bg-gray-100 border border-gray-200 px-4 py-2.5 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-500 shrink-0" />
              <p className="text-xs text-gray-600">
                This hosting account has been terminated.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e2eaff] flex gap-0 overflow-x-auto">
          <TabPill
            tab="overview"
            active={activeTab}
            label="Overview"
            icon={BarChart2}
            onClick={() => setActiveTab("overview")}
          />
          <TabPill
            tab="emails"
            active={activeTab}
            label="Emails"
            icon={Mail}
            onClick={() => setActiveTab("emails")}
          />
          <TabPill
            tab="forwarders"
            active={activeTab}
            label="Forwarders"
            icon={Send}
            onClick={() => setActiveTab("forwarders")}
          />
          <TabPill
            tab="databases"
            active={activeTab}
            label="Databases"
            icon={Database}
            onClick={() => setActiveTab("databases")}
          />
        </div>

        {/* Tab content */}
        {activeTab === "overview" && <OverviewTab hostingId={id} />}
        {activeTab === "emails" && <EmailsTab hostingId={id} />}
        {activeTab === "forwarders" && <ForwardersTab hostingId={id} />}
        {activeTab === "databases" && <DatabasesTab hostingId={id} />}
      </div>
    </>
  );
}
