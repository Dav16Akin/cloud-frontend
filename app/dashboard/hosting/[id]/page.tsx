"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Database,
  Plus,
  X,
  Eye,
  EyeOff,
  XCircle,
  Network,
  Pencil,
  ShieldCheck,
  RefreshCw,
  Zap,
  Check,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";
import HostingProvisioningCard from "@/components/dashboard/HostingProvisioningCard";
import {
  useGetHosting,
  useGetHostingById,
  useSuspendHosting,
  useUnsuspendHosting,
  useDeleteHosting,
  useRenewHosting,
  useUpgradeHosting,
  useGetHostingStats,
  useGetHostingDatabases,
  useCreateHostingDatabase,
  useDeleteHostingDatabase,
  useGetHostingDatabaseUsers,
  useCreateHostingDatabaseUser,
  useDeleteHostingDatabaseUser,
  useAssignHostingDatabaseUser,
  useGetDNSRecords,
  useCreateDNSRecord,
  useUpdateDNSRecord,
  useDeleteDNSRecord,
  useGetCpanelLoginLink,
} from "@/hooks/useHosting";
import type {
  HostingStatus,
  HostingDatabase,
  HostingDatabaseUser,
  DNSRecord,
  DNSRecordType,
} from "@/lib/api";

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

// ── Status Badge (full, not imported to avoid cycle) ─────────────────────────

function StatusBadge({ status }: { status: HostingStatus }) {
  const s = (status ?? "").toUpperCase() as HostingStatus;
  if (s === "ACTIVE") {
    return <span className={statusClass("success")}>Active</span>;
  }
  if (s === "SUSPENDED") {
    return <span className={statusClass("danger")}>Suspended</span>;
  }
  if (s === "TERMINATED") {
    return <span className={statusClass("neutral")}>Terminated</span>;
  }
  return <span className={statusClass("info")}>Provisioning</span>;
}

// ── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "website" | "files" | "databases" | "dns";

const HOSTING_TABS: { id: Tab; label: string }[] = [
  { id: "overview",    label: "Overview"    },
  { id: "website",     label: "Website"     },
  { id: "files",       label: "Files"       },
  { id: "databases",   label: "Databases"   },
  { id: "dns",         label: "DNS"         },
];


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
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold text-[#031033]">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-[#5A6A85] leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
              danger
                ? "bg-[#DC2626] hover:bg-[#C21F1F]"
                : "bg-[#1787D4] hover:bg-[#1370B5]"
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

// ── Overview Tab (Figma style) ─────────────────────────────────────────────────

function OverviewTab({
  hostingId,
  account,
  resolvedPlanName,
  onRenew,
  onOpenCpanel,
  fetchingCpanel,
}: {
  hostingId: string;
  account: any;
  resolvedPlanName?: string;
  onRenew: () => void;
  onOpenCpanel: () => void;
  fetchingCpanel: boolean;
}) {
  const { data: stats } = useGetHostingStats(hostingId);
  const { data: plans } = usePlans();

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const planValue =
    resolvedPlanName ||
    account?.plan?.name ||
    (typeof account?.plan === "string" ? account.plan : null) ||
    account?.planName ||
    plans?.find((p) => p.id === account?.planId)?.name ||
    stats?.plan ||
    "—";

  const infoCards = [
    { label: "Website",      value: account?.domain ?? "—"                       },
    { label: "Hosting plan", value: planValue                                    },
    { label: "Renewal date", value: formatDate(account?.expiresAt)               },
    { label: "Status",       value: (account?.status ?? "—"), isStatus: true     },
    { label: "Storage",      value: stats?.diskUsed ? `${stats.diskUsed} used` : "—" },
    // The stats endpoint does not report bandwidth usage.
    { label: "Bandwidth",    value: "—" },
  ];

  const secondaryBtn =
    "w-full inline-flex items-center justify-center h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
      {/* Left — info grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <h3 className="text-base font-semibold text-[#031033]">Hosting overview</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          {infoCards.map(({ label, value, isStatus }, i) => {
            const statusUp = (value ?? "").toUpperCase();
            return (
              <div
                key={label}
                className={`flex flex-col gap-1 px-5 py-4 min-w-0 border-[#EEF2F7] ${
                  i > 0 ? "border-t" : ""
                } ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
              >
                <dt className="text-xs text-[#5A6A85]">{label}</dt>
                <dd className="text-base font-semibold text-[#031033] truncate">
                  {isStatus && value !== "—" ? (
                    <span
                      className={statusClass(statusUp === "ACTIVE" ? "success" : "danger")}
                    >
                      {value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "—"}
                    </span>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Right — Quick Operations sidebar */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3 p-5 rounded-xl border border-[#E2E8F0] bg-white">
        <h3 className="text-base font-semibold text-[#031033]">Quick operations</h3>
        <button
          id="hosting-quick-renew"
          onClick={onRenew}
          className="w-full inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          Renew subscription
        </button>
        <button
          id="hosting-quick-cpanel"
          onClick={onOpenCpanel}
          disabled={fetchingCpanel || (account?.status ?? "").toUpperCase() === "PENDING"}
          className={secondaryBtn}
        >
          {fetchingCpanel ? "Opening..." : "Access cPanel"}
        </button>
        {(account?.status ?? "").toUpperCase() === "PENDING" && (
          <p className="text-xs text-[#9A5B00] leading-snug">
            cPanel access unlocks once automated provisioning completes.
          </p>
        )}
        <p className="text-xs flex items-start gap-1.5 pt-1 text-[#5A6A85]">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          Renewal pricing is subject to standard plan registry fees.
        </p>
      </div>
    </div>
  );
}

// ── Website / Files tabs ──────────────────────────────────────────────────────
// No dashboard endpoint exists for site or file management yet, so these tabs
// say so and hand off to cPanel (a real, working control) instead.

function CpanelHandoffTab({
  title,
  message,
  onOpenCpanel,
  fetchingCpanel,
  cpanelDisabled,
}: {
  title: string;
  message: string;
  onOpenCpanel: () => void;
  fetchingCpanel: boolean;
  cpanelDisabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white flex flex-col items-center justify-center gap-1 py-12 px-5 text-center">
      <p className="text-sm font-medium text-[#031033]">{title}</p>
      <p className="text-sm text-[#5A6A85] max-w-md">{message}</p>
      <button
        type="button"
        onClick={onOpenCpanel}
        disabled={fetchingCpanel || cpanelDisabled}
        className="mt-4 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
      >
        {fetchingCpanel && <Loader2 className="w-4 h-4 animate-spin" />}
        {fetchingCpanel ? "Opening..." : "Open cPanel"}
      </button>
      {cpanelDisabled && (
        <p className="text-xs text-[#5A6A85] mt-2">
          cPanel access unlocks once provisioning completes.
        </p>
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
    <div className="flex flex-col gap-6">
      {/* Databases Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-[#031033]">
            Databases
          </h3>
          <button
            id="hosting-db-add"
            onClick={() => setShowCreateDb((p) => !p)}
            className="flex items-center gap-1 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            New database
          </button>
        </div>

        {showCreateDb && (
          <form
            onSubmit={handleCreateDb}
            className="px-5 py-4 border-b border-[#EEF2F7] bg-[#F2F5FC] flex flex-col gap-3"
          >
            <p className="text-sm font-medium text-[#031033]">
              Create new database
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/15 transition-colors">
                {dbPrefix && (
                  <span className="text-[#5A6A85] font-mono select-none mr-0.5">
                    {dbPrefix}
                  </span>
                )}
                <input
                  id="hosting-db-input"
                  type="text"
                  value={dbSuffix}
                  onChange={(e) => setDbSuffix(e.target.value)}
                  placeholder="database_name"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-[#031033] placeholder:text-[#5A6A85]/70"
                />
              </div>
              <button
                type="submit"
                disabled={creatingDb}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 whitespace-nowrap"
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
          <div className="divide-y divide-[#EEF2F7] animate-pulse" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-4 w-48 rounded bg-[#EEF2F7]" />
                <div className="h-3 w-20 rounded bg-[#EEF2F7] ml-auto" />
              </div>
            ))}
          </div>
        )}
        {errorDbs && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#031033]">Could not load databases.</p>
          </div>
        )}
        {!loadingDbs && !errorDbs && (!databases || databases.length === 0) && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#5A6A85]">No databases yet.</p>
          </div>
        )}
        {databases && databases.length > 0 && (
          <div className="divide-y divide-[#EEF2F7]">
            {databases.map((db: HostingDatabase) => (
              <div
                key={db.database}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F2F5FC]/60 transition-colors"
              >
                <Database className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#031033] truncate">
                    {db.database}
                  </p>
                  <p className="text-xs text-[#5A6A85] flex flex-wrap gap-1 mt-0.5 items-center">
                    {db.diskusage && <span className="mr-2">Size: {db.diskusage}</span>}
                    {db.users && db.users.length > 0 ? (
                      <>
                        <span className="text-[#5A6A85]">Users:</span>
                        {db.users.map((u) => (
                          <span key={u} className="font-mono bg-[#F2F5FC] text-[#031033] px-1.5 py-0.5 rounded-md text-xs border border-[#E2E8F0]">
                            {u}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-[#5A6A85]">No users linked</span>
                    )}
                  </p>
                </div>
                <button
                  id={`hosting-db-delete-${db.database}`}
                  onClick={() => setDeleteDbTarget(db.database)}
                  disabled={deletingDb}
                  className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-[#031033]">
            Database users
          </h3>
          <button
            id="hosting-dbuser-add"
            onClick={() => setShowCreateUser((p) => !p)}
            className="flex items-center gap-1 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            New user
          </button>
        </div>

        {showCreateUser && (
          <form
            onSubmit={handleCreateUser}
            className="px-5 py-4 border-b border-[#EEF2F7] bg-[#F2F5FC] flex flex-col gap-3"
          >
            <p className="text-sm font-medium text-[#031033]">
              Create new database user
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] focus-within:border-[#1787D4] focus-within:ring-2 focus-within:ring-[#1787D4]/15 transition-colors">
                {dbPrefix && (
                  <span className="text-[#5A6A85] font-mono select-none mr-0.5">
                    {dbPrefix}
                  </span>
                )}
                <input
                  id="hosting-dbuser-input"
                  type="text"
                  value={userSuffix}
                  onChange={(e) => setUserSuffix(e.target.value)}
                  placeholder="username"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-mono text-[#031033] placeholder:text-[#5A6A85]/70"
                />
              </div>
              <div className="relative flex-1">
                <input
                  id="hosting-dbuser-pass"
                  type={showUserPass ? "text" : "password"}
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  placeholder="Password"
                  className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPass((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6A85] hover:text-[#031033] rounded"
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
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 whitespace-nowrap"
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
          <div className="divide-y divide-[#EEF2F7] animate-pulse" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-4 w-48 rounded bg-[#EEF2F7]" />
                <div className="h-3 w-20 rounded bg-[#EEF2F7] ml-auto" />
              </div>
            ))}
          </div>
        )}
        {errorUsers && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#031033]">Could not load database users.</p>
          </div>
        )}
        {!loadingUsers && !errorUsers && (!users || users.length === 0) && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#5A6A85]">No database users yet.</p>
          </div>
        )}
        {users && users.length > 0 && (
          <div className="divide-y divide-[#EEF2F7]">
            {users.map((usr: HostingDatabaseUser) => (
              <div
                key={usr.user}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F2F5FC]/60 transition-colors"
              >
                <Network className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#031033] truncate">
                    {usr.user}
                  </p>
                </div>
                <button
                  id={`hosting-dbuser-delete-${usr.user}`}
                  onClick={() => setDeleteUserTarget(usr.user)}
                  disabled={deletingUser}
                  className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
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
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF2F7]">
            <h3 className="text-base font-semibold text-[#031033]">
              Add user to database
            </h3>
          </div>
          <form onSubmit={handleAssignUser} className="px-5 py-4 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label htmlFor="hosting-assign-user-select" className="text-sm font-medium text-[#031033]">
                User
              </label>
              <select
                id="hosting-assign-user-select"
                value={assignUserVal}
                onChange={(e) => setAssignUserVal(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
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
              <label htmlFor="hosting-assign-db-select" className="text-sm font-medium text-[#031033]">
                Database
              </label>
              <select
                id="hosting-assign-db-select"
                value={assignDb}
                onChange={(e) => setAssignDb(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
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
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 whitespace-nowrap w-full sm:w-auto h-10"
            >
              {assigningUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Assign user
            </button>
          </form>
        </div>
      )}

      {/* Delete Database Confirmation */}
      {deleteDbTarget && (
        <ConfirmModal
          title="Delete database"
          message={`Are you sure you want to permanently delete the database "${deleteDbTarget}"? All table data will be lost forever.`}
          confirmLabel="Delete database"
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
          title="Delete database user"
          message={`Are you sure you want to delete the database user "${deleteUserTarget}"? Any database permissions assigned to this user will be revoked.`}
          confirmLabel="Delete user"
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

// ── DNS Tab ───────────────────────────────────────────────────────────────────

const DNS_RECORD_TYPES: DNSRecordType[] = [
  "A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA",
];

const TYPE_COLORS: Record<string, string> = {
  A:     "text-[#031033]",
  AAAA:  "text-[#031033]",
  CNAME: "text-[#031033]",
  MX:    "text-[#031033]",
  TXT:   "text-[#031033]",
  NS:    "text-[#031033]",
  PTR:   "text-[#031033]",
  SRV:   "text-[#031033]",
  CAA:   "text-[#031033]",
};

const BLANK_FORM = {
  name: "",
  type: "A" as DNSRecordType,
  address: "",
  ttl: 14400,
  priority: "",
};

function DNSTab({ hostingId }: { hostingId: string }) {
  const { data: records, isLoading, isError } = useGetDNSRecords(hostingId);
  const { mutate: createRecord, isPending: creating } = useCreateDNSRecord(hostingId);
  const { mutate: updateRecord, isPending: updating } = useUpdateDNSRecord(hostingId);
  const { mutate: deleteRecord, isPending: deleting } = useDeleteDNSRecord(hostingId);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

  // edit state
  const [editTarget, setEditTarget] = useState<DNSRecord | null>(null);
  const [editForm, setEditForm] = useState(BLANK_FORM);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<DNSRecord | null>(null);

  const patch = (key: keyof typeof BLANK_FORM, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));
  const patchEdit = (key: keyof typeof BLANK_FORM, val: string) =>
    setEditForm((f) => ({ ...f, [key]: val }));

  const openEdit = (r: DNSRecord) => {
    setEditTarget(r);
    setEditForm({
      name: r.name,
      type: r.type as DNSRecordType,
      address: r.address ?? "",
      ttl: r.ttl,
      priority: r.priority != null ? String(r.priority) : "",
    });
    setShowCreate(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    createRecord(
      {
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        ttl: Number(form.ttl) || 14400,
        ...(form.priority ? { priority: Number(form.priority) } : {}),
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm(BLANK_FORM);
        },
      }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm.name.trim() || !editForm.address.trim()) return;
    updateRecord(
      {
        line: editTarget.line,
        name: editForm.name.trim(),
        type: editForm.type,
        address: editForm.address.trim(),
        ttl: Number(editForm.ttl) || 14400,
        ...(editForm.priority ? { priority: Number(editForm.priority) } : {}),
      },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  const needsPriority = (type: string) => type === "MX" || type === "SRV";

  return (
    <div className="flex flex-col gap-4">
      {/* Header card with add button */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5A6A85]" />
            <h3 className="text-base font-semibold text-[#031033]">DNS records</h3>
          </div>
          <button
            id="hosting-dns-add"
            onClick={() => { setShowCreate((p) => !p); setEditTarget(null); }}
            className="flex items-center gap-1 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add record
          </button>
        </div>

        {/* ── Create Form ── */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="px-5 py-4 border-b border-[#EEF2F7] bg-[#F2F5FC] flex flex-col gap-3"
          >
            <p className="text-sm font-medium text-[#031033]">New DNS record</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">Type</label>
                <select
                  id="dns-create-type"
                  value={form.type}
                  onChange={(e) => patch("type", e.target.value)}
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                >
                  {DNS_RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">Name / host</label>
                <input
                  id="dns-create-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="@ or subdomain"
                  required
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">
                  {form.type === "MX" ? "Mail server" : form.type === "CNAME" ? "Alias / target" : "Value / address"}
                </label>
                <input
                  id="dns-create-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder={form.type === "TXT" ? "v=spf1 ..." : form.type === "CNAME" ? "target.domain.com." : "1.2.3.4"}
                  required
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              {/* TTL */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">TTL (seconds)</label>
                <input
                  id="dns-create-ttl"
                  type="number"
                  min={300}
                  value={form.ttl}
                  onChange={(e) => patch("ttl", e.target.value)}
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              {/* Priority (MX / SRV only) */}
              {needsPriority(form.type) && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#031033]">Priority</label>
                  <input
                    id="dns-create-priority"
                    type="number"
                    min={0}
                    value={form.priority}
                    onChange={(e) => patch("priority", e.target.value)}
                    placeholder="10"
                    className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm(BLANK_FORM); }}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add record
              </button>
            </div>
          </form>
        )}

        {/* ── Edit Form ── */}
        {editTarget && (
          <form
            onSubmit={handleUpdate}
            className="px-5 py-4 border-b border-[#EEF2F7] bg-[#E8F4FC] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#031033]">
                Edit record — <span className="text-[#1787D4] font-mono">{editTarget.name}</span>
              </p>
              <button type="button" onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">Type</label>
                <select
                  id="dns-edit-type"
                  value={editForm.type}
                  onChange={(e) => patchEdit("type", e.target.value)}
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                >
                  {DNS_RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">Name / host</label>
                <input
                  id="dns-edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => patchEdit("name", e.target.value)}
                  required
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">Value / address</label>
                <input
                  id="dns-edit-address"
                  type="text"
                  value={editForm.address}
                  onChange={(e) => patchEdit("address", e.target.value)}
                  required
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#031033]">TTL (seconds)</label>
                <input
                  id="dns-edit-ttl"
                  type="number"
                  min={300}
                  value={editForm.ttl}
                  onChange={(e) => patchEdit("ttl", e.target.value)}
                  className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                />
              </div>
              {needsPriority(editForm.type) && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#031033]">Priority</label>
                  <input
                    id="dns-edit-priority"
                    type="number"
                    min={0}
                    value={editForm.priority}
                    onChange={(e) => patchEdit("priority", e.target.value)}
                    className="h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        )}

        {/* ── Records list ── */}
        {isLoading && (
          <div className="divide-y divide-[#EEF2F7] animate-pulse" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-4 w-48 rounded bg-[#EEF2F7]" />
                <div className="h-3 w-20 rounded bg-[#EEF2F7] ml-auto" />
              </div>
            ))}
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#031033]">Could not load DNS records.</p>
          </div>
        )}
        {!isLoading && !isError && (!records || records.length === 0) && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#5A6A85]">No DNS records found.</p>
            <p className="text-xs text-[#5A6A85] mt-1">Use &quot;Add record&quot; to create your first DNS entry.</p>
          </div>
        )}
        {records && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#5A6A85]">Type</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#5A6A85]">Name</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#5A6A85]">Value</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-[#5A6A85]">TTL</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-[#5A6A85]">Priority</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {records.map((r: DNSRecord, index) => {
                  const typeCls = TYPE_COLORS[r.type] ?? "text-[#031033]";
                  return (
                    <tr key={index} className="hover:bg-[#F2F5FC]/60 transition-colors group">
                      <td className="px-5 py-2.5">
                        <span className={`font-mono text-xs font-medium ${typeCls}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <code className="text-sm text-[#031033] font-mono break-all">{r.name}</code>
                      </td>
                      <td className="px-5 py-2.5 max-w-55">
                        <span className="font-mono text-sm text-[#5A6A85] truncate block" title={r.address}>{r.address}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-sm text-[#5A6A85] tabular-nums">{r.ttl}s</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-sm text-[#5A6A85] tabular-nums">{r.priority ?? "—"}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity justify-end">
                          <button
                            id={`hosting-dns-edit-${r.line}`}
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                            aria-label={`Edit DNS record line ${r.line}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`hosting-dns-delete-${r.line}`}
                            onClick={() => setDeleteTarget(r)}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                            aria-label={`Delete DNS record line ${r.line}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete DNS record"
          message={`Delete the ${deleteTarget.type} record for "${deleteTarget.name}"? DNS changes may take time to propagate.`}
          confirmLabel="Delete record"
          danger
          loading={deleting}
          onConfirm={() =>
            deleteRecord(deleteTarget.line, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Shared modal styles ───────────────────────────────────────────────────────

type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

// Status = dot + plain text (no pill). Dot drawn with a ::before pseudo-element.
const STATUS_DOTS: Record<PillTone, string> = {
  success: "before:bg-[#12A150]",
  warning: "before:bg-[#E8900A]",
  danger: "before:bg-[#DC2626]",
  info: "before:bg-[#1787D4]",
  neutral: "before:bg-[#9AA6B8]",
};

function statusClass(tone: PillTone) {
  return `inline-flex items-center gap-2 whitespace-nowrap text-sm ${
    tone === "danger" ? "text-[#C21F1F]" : "text-[#031033]"
  } before:content-[''] before:h-2 before:w-2 before:shrink-0 before:rounded-full ${STATUS_DOTS[tone]}`;
}

const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1787D4] text-sm font-medium text-white hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";

const iconCloseBtn =
  "p-1.5 rounded-lg text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

// ── Renew Hosting Modal ────────────────────────────────────────────────────────

function RenewHostingModal({
  hostingId,
  domain,
  currentPlan,
  expiresAt,
  onClose,
}: {
  hostingId: string;
  domain: string;
  currentPlan?: { name: string; price: number; monthlyPrice?: number; quarterlyPrice?: number };
  expiresAt?: string;
  onClose: () => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("yearly");
  const { mutate: renew, isPending: renewing } = useRenewHosting();

  const getPrice = () => {
    if (!currentPlan) return null;
    if (billingCycle === "monthly") return currentPlan.monthlyPrice ?? currentPlan.price;
    if (billingCycle === "quarterly") return currentPlan.quarterlyPrice ?? currentPlan.price;
    return currentPlan.price;
  };

  const price = getPrice();

  const handleRenew = () => {
    renew({ id: hostingId, data: { billingCycle } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-[#031033]">Renew hosting</h3>
            <p className="text-sm text-[#5A6A85] mt-0.5">{domain}</p>
          </div>
          <button onClick={onClose} className={iconCloseBtn} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          <dl className="rounded-lg border border-[#E2E8F0] divide-y divide-[#EEF2F7] text-sm">
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-[#5A6A85]">Plan</dt>
              <dd className="font-medium text-[#031033]">{currentPlan?.name ?? "Hosting Plan"}</dd>
            </div>
            {expiresAt && (
              <div className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[#5A6A85]">Current expiry</dt>
                <dd className="font-medium text-[#031033] tabular-nums">{formatDate(expiresAt)}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#031033]">Billing cycle</label>
            <div className="grid grid-cols-3 gap-1 bg-[#F2F5FC] p-1 rounded-lg">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  aria-pressed={billingCycle === cycle}
                  className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    billingCycle === cycle
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>

          {price != null && (
            <div className="flex items-baseline justify-between border-t border-[#EEF2F7] pt-4">
              <span className="text-sm text-[#5A6A85]">Total renewal amount</span>
              <span className="text-2xl font-semibold text-[#031033] tabular-nums">₦{price.toLocaleString("en-NG")}</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={renewing}
            className={btnPrimary}
          >
            {renewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {renewing ? "Initializing..." : "Pay and renew"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upgrade Hosting Modal ───────────────────────────────────────────────────────

function UpgradeHostingModal({
  hostingId,
  domain,
  currentPlanId,
  currentPlanName,
  onClose,
}: {
  hostingId: string;
  domain: string;
  currentPlanId?: string;
  currentPlanName?: string;
  onClose: () => void;
}) {
  const { data: plans, isLoading: loadingPlans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("yearly");

  const { mutate: upgrade, isPending: upgrading } = useUpgradeHosting();

  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      const otherPlan = plans.find((p) => p.id !== currentPlanId) ?? plans[0];
      if (otherPlan) setSelectedPlanId(otherPlan.id);
    }
  }, [plans, currentPlanId, selectedPlanId]);

  const targetPlan = plans?.find((p) => p.id === selectedPlanId);

  const getTargetPrice = () => {
    if (!targetPlan) return null;
    if (billingCycle === "monthly") return targetPlan.monthlyPrice ?? targetPlan.price;
    if (billingCycle === "quarterly") return targetPlan.quarterlyPrice ?? targetPlan.price;
    return targetPlan.price;
  };

  const targetPrice = getTargetPrice();

  const handleUpgrade = () => {
    if (!selectedPlanId) {
      toast.error("Please select a target plan.");
      return;
    }
    if (selectedPlanId === currentPlanId) {
      toast.error("Select a different plan to upgrade.");
      return;
    }
    upgrade({ id: hostingId, data: { planId: selectedPlanId, billingCycle } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-[#031033]">Upgrade hosting plan</h3>
            <p className="text-sm text-[#5A6A85] mt-0.5">
              {domain} · Current plan: <span className="font-medium text-[#031033]">{currentPlanName ?? "—"}</span>
            </p>
          </div>
          <button onClick={onClose} className={iconCloseBtn} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-[#031033]">Billing cycle</label>
            <div className="inline-flex gap-1 bg-[#F2F5FC] p-1 rounded-lg">
              {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  aria-pressed={billingCycle === cycle}
                  className={`h-7 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                    billingCycle === cycle
                      ? "bg-white text-[#031033] shadow-sm"
                      : "text-[#5A6A85] hover:text-[#031033]"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : cycle === "quarterly" ? "Quarterly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            <label className="text-sm font-medium text-[#031033]">Choose a plan</label>
            {loadingPlans && (
              <div className="flex flex-col gap-2 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#EEF2F7]" />
                ))}
              </div>
            )}
            {plans?.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isSelected = plan.id === selectedPlanId;
              const pPrice =
                billingCycle === "monthly"
                  ? plan.monthlyPrice
                  : billingCycle === "quarterly"
                  ? plan.quarterlyPrice
                  : plan.price;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    if (!isCurrent) setSelectedPlanId(plan.id);
                  }}
                  className={`px-4 py-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                    isCurrent
                      ? "bg-[#F2F5FC] border-[#E2E8F0] cursor-not-allowed"
                      : isSelected
                      ? "bg-[#E8F4FC] border-[#1787D4]"
                      : "bg-white border-[#E2E8F0] hover:border-[#D5DCE6] hover:bg-[#F2F5FC]/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-[#1787D4] bg-[#1787D4]"
                          : "border-[#D5DCE6] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isCurrent ? "text-[#5A6A85]" : "text-[#031033]"}`}>{plan.name}</p>
                        {isCurrent && (
                          <span className="text-xs text-[#5A6A85]">
                            Current plan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        {plan.storage} storage · {plan.bandwidth} bandwidth · {plan.websites} website{plan.websites > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#031033] tabular-nums">₦{pPrice?.toLocaleString("en-NG")}</p>
                    <p className="text-xs text-[#5A6A85]">/{billingCycle === "yearly" ? "yr" : billingCycle === "quarterly" ? "qtr" : "mo"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {targetPrice != null && (
            <div className="flex items-baseline justify-between border-t border-[#EEF2F7] pt-4">
              <span className="text-sm text-[#5A6A85]">Total upgrade amount</span>
              <span className="text-2xl font-semibold text-[#031033] tabular-nums">₦{targetPrice.toLocaleString("en-NG")}</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={upgrading || !selectedPlanId || selectedPlanId === currentPlanId}
            className={btnPrimary}
          >
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {upgrading ? "Initializing..." : "Upgrade now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Manage Page ──────────────────────────────────────────────────────────

export default function ManageHostingPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";

  const {
    data: account,
    isLoading,
    isError,
    refetch: refetchAccount,
    isFetching: fetchingAccount,
  } = useGetHostingById(id, {
    refetchInterval: (query) => {
      const s = (
        query.state.data?.data?.status ||
        query.state.data?.status ||
        ""
      ).toUpperCase();
      return s === "PENDING" ? 6000 : false;
    },
  });
  const { mutate: suspend, isPending: suspending } = useSuspendHosting();
  const { mutate: unsuspend, isPending: unsuspending } = useUnsuspendHosting();
  const { mutate: terminate, isPending: terminating } = useDeleteHosting();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { mutate: fetchCpanelLink, isPending: fetchingCpanel } = useGetCpanelLoginLink();

  const { data: plans } = usePlans();
  const { data: allHosting } = useGetHosting();
  const { data: stats } = useGetHostingStats(id);

  const handleOpenCpanel = () => {
    // Open a blank tab immediately while still inside the synchronous click
    // handler — this is required so browsers don't treat window.open as a
    // popup and block it. We then navigate the tab to the session URL once
    // the API responds.
    const newTab = window.open("", "_blank");
    fetchCpanelLink(id, {
      onSuccess: (res) => {
        const url = res?.data?.loginUrl;
        if (url && newTab) {
          newTab.location.href = url;
        } else {
          // No URL returned — close the blank tab so it doesn't linger.
          newTab?.close();
        }
      },
      onError: () => {
        newTab?.close();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-pulse" aria-busy="true">
        <div className="h-4 w-28 rounded bg-[#EEF2F7]" />
        <div>
          <div className="h-7 w-64 rounded bg-[#EEF2F7]" />
          <div className="h-4 w-48 rounded bg-[#EEF2F7] mt-2" />
        </div>
        <div className="h-10 w-full rounded bg-[#EEF2F7]" />
        <div className="h-64 w-full rounded-xl bg-[#EEF2F7]" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#031033]">
              Hosting account not found or could not be loaded.
            </p>
          </div>
          <Link
            href="/dashboard/hosting"
            className="inline-flex mt-4 text-sm font-medium text-[#1787D4] hover:underline underline-offset-2"
          >
            ← Back to hosting
          </Link>
        </div>
      </div>
    );
  }

  const status = (account.status?.toUpperCase() ?? "PENDING") as HostingStatus;
  const isActive = status === "ACTIVE";
  const isSuspended = status === "SUSPENDED";
  const isTerminated = status === "TERMINATED";
  const expiring = account.expiresAt ? isExpiringSoon(account.expiresAt) : false;

  const matchedFromList = allHosting?.find((h) => h.id === id);
  const matchedPlanFromPlans = plans?.find(
    (p) =>
      p.id === account?.planId ||
      p.id === matchedFromList?.planId ||
      p.id === (account?.plan as any)?.id ||
      (stats?.plan && p.name.toLowerCase() === stats.plan.toLowerCase())
  );

  const resolvedPlan =
    account?.plan && typeof account.plan === "object" && account.plan.name
      ? account.plan
      : matchedFromList?.plan && typeof matchedFromList.plan === "object" && matchedFromList.plan.name
      ? matchedFromList.plan
      : matchedPlanFromPlans
      ? {
          id: matchedPlanFromPlans.id,
          name: matchedPlanFromPlans.name,
          price: matchedPlanFromPlans.price,
          monthlyPrice: matchedPlanFromPlans.monthlyPrice,
          quarterlyPrice: matchedPlanFromPlans.quarterlyPrice,
          billingCycle: (account as any)?.billingCycle ?? "yearly",
        }
      : undefined;

  const resolvedPlanName =
    resolvedPlan?.name ||
    (typeof account?.plan === "string" ? account.plan : null) ||
    (account as any)?.planName ||
    (matchedFromList as any)?.planName ||
    stats?.plan ||
    (account as any)?.package ||
    (account as any)?.packageName ||
    undefined;

  return (
    <>
      {showTerminateModal && (
        <ConfirmModal
          title="Terminate hosting account"
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

      {showRenewModal && (
        <RenewHostingModal
          hostingId={id}
          domain={account.domain}
          currentPlan={resolvedPlan}
          expiresAt={account.expiresAt}
          onClose={() => setShowRenewModal(false)}
        />
      )}

      {showUpgradeModal && (
        <UpgradeHostingModal
          hostingId={id}
          domain={account.domain}
          currentPlanId={account.planId || resolvedPlan?.id}
          currentPlanName={resolvedPlanName}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/dashboard/hosting"
          id="manage-back"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to hosting
        </Link>

        {/* Domain heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#031033] truncate">
              {account.domain}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-[#5A6A85]">
              <StatusBadge status={status} />
              <span>{resolvedPlanName ?? "—"}</span>
              {account.expiresAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={`tabular-nums ${expiring ? "text-[#9A5B00] font-medium" : ""}`}>
                    {expiring ? "Expiring soon: " : "Expires "}
                    {formatDate(account.expiresAt)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Secondary admin actions */}
          <div className="flex flex-wrap gap-2">
            {!isTerminated && (
              <button
                id="manage-upgrade"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                <Zap className="w-3.5 h-3.5 text-[#5A6A85]" />
                Upgrade plan
              </button>
            )}
            {isActive && !isTerminated && (
              <button
                id="manage-suspend"
                onClick={() => suspend(id)}
                disabled={suspending}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {suspending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PauseCircle className="w-3.5 h-3.5 text-[#5A6A85]" />
                )}
                Suspend
              </button>
            )}
            {isSuspended && (
              <button
                id="manage-unsuspend"
                onClick={() => unsuspend(id)}
                disabled={unsuspending}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {unsuspending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5 text-[#5A6A85]" />
                )}
                Unsuspend
              </button>
            )}
            {!isTerminated && (
              <button
                id="manage-terminate"
                onClick={() => setShowTerminateModal(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#F3C7C7] bg-white text-sm font-medium text-[#C21F1F] hover:bg-[#FDECEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Terminate
              </button>
            )}
          </div>
        </div>

        {/* Status banners */}
        {status === "PENDING" && (
          <HostingProvisioningCard
            domain={account.domain}
            planName={resolvedPlanName}
            status={account.status}
            createdAt={account.createdAt}
            cpanelUsername={account.cpanelUsername}
            serverIp={account.serverIp}
            hostingId={account.id}
            onRefresh={() => refetchAccount()}
            isRefreshing={fetchingAccount}
          />
        )}
        {isSuspended && (
          <div className="rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#031033]">
              This hosting account is currently suspended. Unsuspend to restore access.
            </p>
          </div>
        )}
        {isTerminated && (
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] px-4 py-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#5A6A85] shrink-0" />
            <p className="text-sm text-[#5A6A85]">
              This hosting account has been terminated.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E2E8F0]" role="tablist">
          {HOSTING_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                id={`hosting-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors -mb-px border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
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

        {/* Tab content */}
        {activeTab === "overview" && (
          <OverviewTab
            hostingId={id}
            account={account}
            resolvedPlanName={resolvedPlanName}
            onRenew={() => setShowRenewModal(true)}
            onOpenCpanel={handleOpenCpanel}
            fetchingCpanel={fetchingCpanel}
          />
        )}
        {activeTab === "website" && (
          <CpanelHandoffTab
            title="Website management isn't in the dashboard yet"
            message="Manage your site, installers and subdomains from cPanel for now."
            onOpenCpanel={handleOpenCpanel}
            fetchingCpanel={fetchingCpanel}
            cpanelDisabled={(account?.status ?? "").toUpperCase() === "PENDING"}
          />
        )}
        {activeTab === "files" && (
          <CpanelHandoffTab
            title="File management isn't in the dashboard yet"
            message="Upload and edit files with the File Manager in cPanel for now."
            onOpenCpanel={handleOpenCpanel}
            fetchingCpanel={fetchingCpanel}
            cpanelDisabled={(account?.status ?? "").toUpperCase() === "PENDING"}
          />
        )}
        {activeTab === "databases" && <DatabasesTab hostingId={id} />}
        {activeTab === "dns" && <DNSTab hostingId={id} />}
      </div>
    </>
  );
}
