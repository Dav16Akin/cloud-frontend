"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ArrowRightLeft,
  ChevronDown,
  Copy,
  Check,
  Eye,
  EyeOff,
  Signal,
  RefreshCcw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetDomainById,
  useGetDomainDNSRecords,
  useCreateDomainDNSRecord,
  useUpdateDomainDNSRecord,
  useDeleteDomainDNSRecord,
  useUpdateNameservers,
  useGetDomainAuthCode,
  useRenewDomain,
} from "@/hooks/useDomains";
import type { DNSRecord, DNSRecordType } from "@/lib/api";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";

// ── Shared class strings ──────────────────────────────────────────────────────

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";
const btnPrimary = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;
const btnSecondary = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`;
const btnSecondarySm = `inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#031033] bg-white border border-[#D5DCE6] hover:bg-[#F2F5FC] transition-colors shrink-0 ${focusRing}`;
const btnGhostSm = `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors ${focusRing}`;
const iconBtn = `inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors ${focusRing}`;
const inputCls =
  "h-10 w-full rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none transition-colors focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15";
const labelCls = "text-sm font-medium text-[#031033] mb-1.5";
const cardCls = "rounded-xl border border-[#E2E8F0] bg-white";
const cardHeaderCls =
  "px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between gap-3";
const pillBase =
  "inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#031033] shrink-0";
const dotBase = "h-2 w-2 shrink-0 rounded-full";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toUpperCase();
  const cfg =
    s === "ACTIVE"
      ? {
          label: "Active",
          dot: "bg-[#12A150]",
          cls: "",
        }
      : s === "EXPIRED"
        ? {
            label: "Expired",
            dot: "bg-[#DC2626]",
            cls: "text-[#C21F1F]",
          }
        : {
            label: "Pending",
            dot: "bg-[#E8900A]",
            cls: "",
          };

  return (
    <span className={`${pillBase} ${cfg.cls}`}>
      <span aria-hidden className={`${dotBase} ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[#031033]/40" onClick={onCancel} />
      <div className="relative rounded-xl bg-white shadow-xl max-w-md w-full">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold text-[#031033]">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-[#5A6A85] leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onCancel} className={btnSecondary}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing} ${
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

// ── DNS Constants ─────────────────────────────────────────────────────────────

const DNS_RECORD_TYPES: DNSRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "PTR",
  "SRV",
  "CAA",
];

// Record types are a neutral tag: colour is kept for status, not categories.
const TYPE_TAG = "text-[#031033]";
const TYPE_COLORS: Record<string, string> = {
  A: TYPE_TAG,
  AAAA: TYPE_TAG,
  CNAME: TYPE_TAG,
  MX: TYPE_TAG,
  TXT: TYPE_TAG,
  NS: TYPE_TAG,
  PTR: TYPE_TAG,
  SRV: TYPE_TAG,
  CAA: TYPE_TAG,
};

const BLANK_FORM = {
  name: "",
  type: "A" as DNSRecordType,
  address: "",
  ttl: 14400,
  priority: "",
};

const needsPriority = (type: string) => type === "MX" || type === "SRV";

// ── Tab type ─────────────────────────────────────────────────────────────────
type DetailTab =
  | "overview"
  | "dns"
  | "nameservers"
  | "renewal"
  | "contact"
  | "transfer";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "dns", label: "DNS management" },
  { id: "nameservers", label: "Nameservers" },
  { id: "renewal", label: "Renewal" },
  { id: "contact", label: "Contact information" },
  { id: "transfer", label: "Transfer" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ManageDomainPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: domain,
    isLoading: loadingDomain,
    isError: errorDomain,
  } = useGetDomainById(id);
  const {
    data: records,
    isLoading,
    isError,
    refetch,
  } = useGetDomainDNSRecords(id);
  const { mutate: createRecord, isPending: creating } =
    useCreateDomainDNSRecord(id);
  const { mutate: updateRecord, isPending: updating } =
    useUpdateDomainDNSRecord(id);
  const { mutate: deleteRecord, isPending: deleting } =
    useDeleteDomainDNSRecord(id);
  const { mutate: saveNameservers, isPending: savingNS } =
    useUpdateNameservers(id);

  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("overview");
  const { mutate: renewDomain, isPending: renewing } = useRenewDomain();
  const payment = usePaymentMethod();

  // ── Transfer out state ──
  const { mutate: getAuthCode, isPending: fetchingAuthCode } =
    useGetDomainAuthCode(id);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [copiedAuthCode, setCopiedAuthCode] = useState(false);

  // Auto-mask sensitive authorization code after 30 seconds
  useEffect(() => {
    if (!showAuthCode) return;
    const timer = setTimeout(() => {
      setShowAuthCode(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, [showAuthCode]);

  const handleRequestAuthCode = () => {
    getAuthCode(undefined, {
      onSuccess: (res) => {
        if (res?.data?.authCode) {
          setAuthCode(res.data.authCode);
          setShowAuthCode(false);
        }
      },
    });
  };

  // ── Nameservers state ──
  const DEFAULT_NS = ["ns1.nupatcloud.com", "ns2.nupatcloud.com"];
  const [nsOpen, setNsOpen] = useState(false);
  const [nsFields, setNsFields] = useState<string[]>([
    "ns1.nupatcloud.com",
    "ns2.nupatcloud.com",
  ]);
  const [nsHintOpen, setNsHintOpen] = useState(false);
  const [copiedNS, setCopiedNS] = useState<string | null>(null);

  const copyNS = (ns: string) => {
    navigator.clipboard.writeText(ns).then(() => {
      setCopiedNS(ns);
      setTimeout(() => setCopiedNS(null), 1500);
    });
  };

  const openNsEdit = () => {
    const current = domain?.nameservers?.length
      ? domain.nameservers
      : DEFAULT_NS;
    setNsFields(current.length < 2 ? [...current, ""] : [...current]);
    setNsOpen(true);
  };

  const handleNsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nsFields.map((v) => v.trim()).filter(Boolean);
    if (trimmed.length < 2) {
      toast.error("At least 2 nameservers are required.");
      return;
    }
    saveNameservers(trimmed, { onSuccess: () => setNsOpen(false) });
  };

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editTarget, setEditTarget] = useState<DNSRecord | null>(null);
  const [editForm, setEditForm] = useState(BLANK_FORM);
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
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm.name.trim() || !editForm.address.trim())
      return;
    updateRecord(
      {
        line: editTarget.line,
        name: editForm.name.trim(),
        type: editForm.type,
        address: editForm.address.trim(),
        ttl: Number(editForm.ttl) || 14400,
        ...(editForm.priority ? { priority: Number(editForm.priority) } : {}),
      },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── Back link ── */}
      <div>
        <Link
          href="/dashboard/domains"
          className={`inline-flex items-center gap-1.5 rounded-md text-sm text-[#5A6A85] hover:text-[#031033] transition-colors ${focusRing}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to domains
        </Link>
      </div>

      {/* ── Domain heading ── */}
      {loadingDomain ? (
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-56 rounded bg-[#EEF2F7]" />
          <div className="h-5 w-16 rounded-full bg-[#EEF2F7]" />
        </div>
      ) : errorDomain || !domain ? (
        <div className="rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 flex items-center gap-2 text-sm text-[#C21F1F]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Could not load domain details.
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#031033] break-all">
            {domain.domain}
          </h1>
          <StatusBadge status={domain.status} />
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="flex overflow-x-auto border-b border-[#E2E8F0]">
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeDetailTab;
          return (
            <button
              key={tab.id}
              id={`domain-tab-${tab.id}`}
              onClick={() => setActiveDetailTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-3 -mb-px border-b-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:bg-[#F2F5FC] ${
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

      {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════════ */}
      {activeDetailTab === "overview" &&
        !loadingDomain &&
        !errorDomain &&
        domain && (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
            {/* Left — domain facts */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <h2 className="text-base font-semibold text-[#031033]">
                Domain overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#EEF2F7]">
                {[
                  {
                    label: "Registered",
                    value: formatDate(domain.registrationDate),
                  },
                  {
                    label: "Expires",
                    value: formatDate(domain.expiryDate),
                  },
                  {
                    label: "Auto-renew",
                    value: domain.autoRenew === undefined ? "—" : domain.autoRenew ? "On" : "Off",
                  },
                  { label: "Registrar", value: "NupatCloud" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1 bg-white p-5">
                    <p className="text-xs text-[#5A6A85]">{label}</p>
                    <p className="text-base font-semibold text-[#031033] tabular-nums">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Domain registrar lock */}
              <div className={`${cardCls} flex items-start justify-between gap-4 p-5`}>
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0 text-[#5A6A85]" />
                  <div>
                    <p className="text-sm font-medium text-[#031033]">
                      Registrar lock
                    </p>
                    <p className="text-sm text-[#5A6A85] mt-1">
                      Blocks unauthorized transfer requests. Keep it on unless
                      you plan to move this domain to another registrar.
                    </p>
                  </div>
                </div>
                {/* The API does not report lock state, so don't claim one. */}
                <span
                  className="text-sm text-[#5A6A85] shrink-0"
                  title="Lock status is not reported by the registrar API"
                >
                  —
                </span>
              </div>
            </div>

            {/* Right — quick operations */}
            <div className={`${cardCls} w-full lg:w-64 shrink-0 flex flex-col gap-3 p-5`}>
              <h3 className="text-base font-semibold text-[#031033]">
                Quick operations
              </h3>
              <button
                id="domain-quick-renew"
                onClick={() => setActiveDetailTab("renewal")}
                className={`${btnPrimary} w-full`}
              >
                Renew domain
              </button>
              <button
                id="domain-quick-dns"
                onClick={() => setActiveDetailTab("dns")}
                className={`${btnSecondary} w-full`}
              >
                Manage DNS
              </button>
              <p id="domain-quick-autorenew" className="text-sm text-[#5A6A85]">
                Auto-renew:{" "}
                <span className="font-medium text-[#031033]">
                  {domain.autoRenew === undefined ? "—" : domain.autoRenew ? "On" : "Off"}
                </span>
              </p>
              <p className="text-xs text-[#5A6A85] flex items-start gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
                Renewal is charged at the registry&apos;s standard price for
                this extension.
              </p>
            </div>
          </div>
        )}

      {/* ══ NAMESERVERS TAB ══════════════════════════════════════════════════ */}
      {activeDetailTab === "nameservers" &&
        !loadingDomain &&
        !errorDomain &&
        domain &&
        (() => {
          const currentNS: string[] =
            domain.nameservers && domain.nameservers.length > 0
              ? domain.nameservers
              : ["ns1.nupatcloud.com", "ns2.nupatcloud.com"];

          return (
            <div className={cardCls}>
              {/* Header */}
              <div className={cardHeaderCls}>
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-[#5A6A85]" />
                  <h2 className="text-base font-semibold text-[#031033]">
                    Nameservers
                  </h2>
                </div>
                <button
                  id="domain-ns-edit"
                  onClick={() => (nsOpen ? setNsOpen(false) : openNsEdit())}
                  className={btnGhostSm}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {nsOpen ? "Cancel" : "Change"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${nsOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Current nameservers display */}
              {!nsOpen && (
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-[#5A6A85]">Current nameservers</p>
                  <div className="flex flex-col gap-2">
                    {currentNS.map((ns, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#5A6A85] w-8 shrink-0">
                          NS{i + 1}
                        </span>
                        <code className="text-sm font-mono text-[#031033] bg-[#F2F5FC] rounded-md px-2.5 py-1 break-all">
                          {ns}
                        </code>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#5A6A85] mt-1">
                    <span className="font-medium text-[#9A5B00]">Note:</span>{" "}
                    Domains are usually locked for 60 days after registration.
                    The registry rejects nameserver changes during that window.
                  </p>
                </div>
              )}

              {/* Edit form */}
              {nsOpen && (
                <form onSubmit={handleNsSubmit} className="p-5 flex flex-col gap-4">
                  <p className="text-sm text-[#5A6A85]">
                    Enter between 2 and 4 nameservers.
                  </p>
                  <div className="flex flex-col gap-2">
                    {nsFields.map((val, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <label
                          htmlFor={`domain-ns-field-${i}`}
                          className="text-xs font-medium text-[#5A6A85] w-8 shrink-0"
                        >
                          NS{i + 1}
                        </label>
                        <input
                          id={`domain-ns-field-${i}`}
                          type="text"
                          value={val}
                          required={i < 2}
                          placeholder={`ns${i + 1}.yourdns.com`}
                          onChange={(e) => {
                            const next = [...nsFields];
                            next[i] = e.target.value;
                            setNsFields(next);
                          }}
                          className={`${inputCls} flex-1 font-mono`}
                        />
                        {i >= 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setNsFields((f) =>
                                f.filter((_, idx) => idx !== i),
                              )
                            }
                            aria-label={`Remove nameserver ${i + 1}`}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors ${focusRing}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {nsFields.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setNsFields((f) => [...f, ""])}
                      className={`${btnGhostSm} self-start -ml-3`}
                    >
                      <Plus className="w-4 h-4" />
                      Add nameserver
                    </button>
                  )}

                  <div className="rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] px-4 py-3 text-sm text-[#9A5B00]">
                    <span className="font-medium">60-day lock:</span> if this
                    domain was registered recently, the registry may reject the
                    change. Contact support if you see a lock error.
                  </div>

                  {/* Nupat Cloud default NS hint */}
                  <div className="rounded-lg border border-[#E2E8F0]">
                    <button
                      type="button"
                      id="domain-ns-hint-toggle"
                      onClick={() => setNsHintOpen((v) => !v)}
                      aria-expanded={nsHintOpen}
                      className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors ${focusRing}`}
                    >
                      <span className="flex items-center gap-2">
                        <Signal className="w-4 h-4 text-[#5A6A85]" />
                        Nupat Cloud nameservers (default)
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#5A6A85] transition-transform ${nsHintOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {nsHintOpen && (
                      <div className="px-4 pb-4 pt-3 flex flex-col gap-2 border-t border-[#EEF2F7]">
                        <p className="text-xs text-[#5A6A85] mb-1">
                          Use these to point your domain back to Nupat Cloud
                          hosting.
                        </p>
                        {DEFAULT_NS.map((ns, i) => (
                          <div key={ns} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#5A6A85] w-8 shrink-0">
                              NS{i + 1}
                            </span>
                            <code className="flex-1 min-w-0 text-sm font-mono text-[#031033] bg-[#F2F5FC] rounded-md px-2.5 py-1 truncate">
                              {ns}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyNS(ns)}
                              title="Copy"
                              aria-label={`Copy ${ns}`}
                              className={`${iconBtn} shrink-0`}
                            >
                              {copiedNS === ns ? (
                                <Check className="w-4 h-4 text-[#0E7C3A]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              id={`domain-ns-use-default-${i}`}
                              onClick={() => {
                                const next = [...nsFields];
                                if (i < next.length) {
                                  next[i] = ns;
                                } else {
                                  next.push(ns);
                                }
                                setNsFields(next);
                              }}
                              className={btnSecondarySm}
                            >
                              Use
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          id="domain-ns-use-all-defaults"
                          onClick={() => setNsFields([...DEFAULT_NS])}
                          className={`${btnGhostSm} self-start -ml-3 mt-1`}
                        >
                          Use both (fill all fields)
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setNsOpen(false)}
                      className={btnSecondary}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="domain-ns-save"
                      disabled={savingNS}
                      className={btnPrimary}
                    >
                      {savingNS && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save nameservers
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })()}

      {/* ══ DNS MANAGEMENT TAB ═══════════════════════════════════════════════ */}
      {activeDetailTab === "dns" && (
        <div className={`${cardCls} overflow-hidden`}>
          {/* Header */}
          <div className={cardHeaderCls}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5A6A85]" />
              <h2 className="text-base font-semibold text-[#031033]">
                DNS records
              </h2>
              {records && (
                <span className="text-sm tabular-nums text-[#5A6A85]">
                  {records.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                id="domain-dns-refresh"
                onClick={() => refetch()}
                title="Refresh DNS records"
                aria-label="Refresh DNS records"
                className={iconBtn}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                id="domain-dns-add"
                onClick={() => {
                  setShowCreate((p) => !p);
                  setEditTarget(null);
                }}
                className={btnGhostSm}
              >
                <Plus className="w-4 h-4" />
                Add record
              </button>
            </div>
          </div>

          {/* ── Create Form ── */}
          {showCreate && (
            <form
              onSubmit={handleCreate}
              className="p-5 border-b border-[#EEF2F7] bg-[#F2F5FC] flex flex-col gap-4"
            >
              <p className="text-sm font-medium text-[#031033]">
                New DNS record
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type */}
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-create-type" className={labelCls}>
                    Type
                  </label>
                  <select
                    id="domain-dns-create-type"
                    value={form.type}
                    onChange={(e) => patch("type", e.target.value)}
                    className={inputCls}
                  >
                    {DNS_RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Name */}
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-create-name" className={labelCls}>
                    Name / host
                  </label>
                  <input
                    id="domain-dns-create-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => patch("name", e.target.value)}
                    placeholder="@ or subdomain"
                    required
                    className={`${inputCls} font-mono`}
                  />
                </div>
                {/* Address */}
                <div className="flex flex-col">
                  <label
                    htmlFor="domain-dns-create-address"
                    className={labelCls}
                  >
                    {form.type === "MX"
                      ? "Mail server"
                      : form.type === "CNAME"
                        ? "Alias / target"
                        : "Value / address"}
                  </label>
                  <input
                    id="domain-dns-create-address"
                    type="text"
                    value={form.address}
                    onChange={(e) => patch("address", e.target.value)}
                    placeholder={
                      form.type === "TXT"
                        ? "v=spf1 ..."
                        : form.type === "CNAME"
                          ? "target.domain.com."
                          : "1.2.3.4"
                    }
                    required
                    className={`${inputCls} font-mono`}
                  />
                </div>
                {/* TTL */}
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-create-ttl" className={labelCls}>
                    TTL (seconds)
                  </label>
                  <input
                    id="domain-dns-create-ttl"
                    type="number"
                    min={300}
                    value={form.ttl}
                    onChange={(e) => patch("ttl", e.target.value)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                {/* Priority (MX/SRV only) */}
                {needsPriority(form.type) && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="domain-dns-create-priority"
                      className={labelCls}
                    >
                      Priority
                    </label>
                    <input
                      id="domain-dns-create-priority"
                      type="number"
                      min={0}
                      value={form.priority}
                      onChange={(e) => patch("priority", e.target.value)}
                      placeholder="10"
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setForm(BLANK_FORM);
                  }}
                  className={btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className={btnPrimary}>
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add record
                </button>
              </div>
            </form>
          )}

          {/* ── Edit Form ── */}
          {editTarget && (
            <form
              onSubmit={handleUpdate}
              className="p-5 border-b border-[#EEF2F7] bg-[#E8F4FC]/60 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#031033] min-w-0 truncate">
                  Edit record:{" "}
                  <span className="font-mono">{editTarget.name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  aria-label="Close edit form"
                  className={iconBtn}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-edit-type" className={labelCls}>
                    Type
                  </label>
                  <select
                    id="domain-dns-edit-type"
                    value={editForm.type}
                    onChange={(e) => patchEdit("type", e.target.value)}
                    className={inputCls}
                  >
                    {DNS_RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-edit-name" className={labelCls}>
                    Name / host
                  </label>
                  <input
                    id="domain-dns-edit-name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => patchEdit("name", e.target.value)}
                    required
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-edit-address" className={labelCls}>
                    Value / address
                  </label>
                  <input
                    id="domain-dns-edit-address"
                    type="text"
                    value={editForm.address}
                    onChange={(e) => patchEdit("address", e.target.value)}
                    required
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="domain-dns-edit-ttl" className={labelCls}>
                    TTL (seconds)
                  </label>
                  <input
                    id="domain-dns-edit-ttl"
                    type="number"
                    min={300}
                    value={editForm.ttl}
                    onChange={(e) => patchEdit("ttl", e.target.value)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                {needsPriority(editForm.type) && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="domain-dns-edit-priority"
                      className={labelCls}
                    >
                      Priority
                    </label>
                    <input
                      id="domain-dns-edit-priority"
                      type="number"
                      min={0}
                      value={editForm.priority}
                      onChange={(e) => patchEdit("priority", e.target.value)}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className={btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className={btnPrimary}>
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          )}

          {/* ── Records list ── */}
          {isLoading && (
            <div className="animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 px-5 py-3 border-b border-[#EEF2F7] last:border-0"
                >
                  <div className="h-5 w-12 rounded-md bg-[#EEF2F7]" />
                  <div className="h-4 w-24 rounded bg-[#EEF2F7]" />
                  <div className="h-4 flex-1 max-w-[220px] rounded bg-[#EEF2F7]" />
                  <div className="h-4 w-14 rounded bg-[#EEF2F7] ml-auto" />
                </div>
              ))}
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-[#C21F1F]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              Could not load DNS records.
              <button
                onClick={() => refetch()}
                className="font-medium text-[#1787D4] hover:underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {!isLoading && !isError && (!records || records.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <p className="text-sm font-medium text-[#031033]">
                No DNS records yet
              </p>
              <p className="text-sm text-[#5A6A85] mt-1">
                Use Add record to point this domain at a server or mail
                provider.
              </p>
            </div>
          )}
          {records && records.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#5A6A85]">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#5A6A85]">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#5A6A85]">
                      Value
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-[#5A6A85]">
                      TTL
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-[#5A6A85]">
                      Priority
                    </th>
                    <th className="px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: DNSRecord, index) => {
                    const typeCls =
                      TYPE_COLORS[r.type] ?? "text-[#031033]";
                    return (
                      <tr
                        key={index}
                        className="group border-b border-[#EEF2F7] last:border-0 hover:bg-[#F2F5FC]/60 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span
                            className={`font-mono text-xs font-medium ${typeCls}`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <code className="text-sm font-mono text-[#031033] break-all">
                            {r.name}
                          </code>
                        </td>
                        <td className="px-5 py-3 max-w-[260px]">
                          <code
                            className="text-sm font-mono text-[#5A6A85] truncate block"
                            title={r.address}
                          >
                            {r.address}
                          </code>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-[#5A6A85] whitespace-nowrap">
                          {r.ttl}s
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-[#5A6A85]">
                          {r.priority ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                            <button
                              id={`domain-dns-edit-${r.line}`}
                              onClick={() => openEdit(r)}
                              className={iconBtn}
                              aria-label={`Edit DNS record line ${r.line}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              id={`domain-dns-delete-${r.line}`}
                              onClick={() => setDeleteTarget(r)}
                              disabled={deleting}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
                              aria-label={`Delete DNS record line ${r.line}`}
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* ══ RENEWAL TAB ══════════════════════════════════════════════════════ */}
      {activeDetailTab === "renewal" &&
        !loadingDomain &&
        !errorDomain &&
        domain && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[#031033]">
              Domain renewal
            </h2>
            <div className={`${cardCls} flex flex-col gap-4 p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#031033] break-all">
                    Renew {domain.domain}
                  </p>
                  <p className="text-sm text-[#5A6A85] mt-0.5 tabular-nums">
                    Expires {formatDate(domain.expiryDate)}
                  </p>
                </div>
                <RefreshCcw className="w-4 h-4 shrink-0 text-[#5A6A85]" />
              </div>
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                Renewing extends the registration period so the domain does
                not expire. The registry&apos;s standard price for this
                extension applies.
              </p>
              <div className="max-w-sm">
                <PaymentMethodSelector {...payment} variant="compact" disabled={renewing} />
              </div>
              <button
                id="domain-renew-cta"
                type="button"
                onClick={() => renewDomain({ id, provider: payment.method })}
                disabled={renewing}
                className={`${btnPrimary} self-start`}
              >
                {renewing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                {renewing ? "Starting renewal…" : "Renew domain"}
              </button>
            </div>
            <div className={`${cardCls} flex items-center justify-between gap-4 p-5`}>
              <div>
                <p className="text-sm font-medium text-[#031033]">
                  Auto-renew
                </p>
                <p className="text-sm text-[#5A6A85] mt-0.5">
                  {domain.autoRenew === undefined
                    ? "Auto-renew status isn't available for this domain. Renew manually before the expiry date."
                    : domain.autoRenew
                      ? "Auto-renew is on. The domain renews before it expires."
                      : "Auto-renew is off. Renew manually before the expiry date."}
                </p>
                <p className="text-xs text-[#5A6A85] mt-1">
                  Changing auto-renew from the dashboard is not available yet.
                </p>
              </div>
              <span className={pillBase}>
                <span
                  aria-hidden
                  className={`${dotBase} ${
                    domain.autoRenew === undefined
                      ? "bg-[#9AA6B8]"
                      : domain.autoRenew
                        ? "bg-[#12A150]"
                        : "bg-[#E8900A]"
                  }`}
                />
                {domain.autoRenew === undefined ? "—" : domain.autoRenew ? "On" : "Off"}
              </span>
            </div>
          </div>
        )}

      {/* ══ CONTACT INFORMATION TAB ══════════════════════════════════════════ */}
      {activeDetailTab === "contact" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[#031033]">
            Contact information
          </h2>
          <div className={`${cardCls} flex flex-col items-center justify-center py-12 px-5 gap-1 text-center`}>
            <p className="text-sm font-medium text-[#031033]">
              Contact details are managed through the domain registrar.
            </p>
            <p className="text-sm text-[#5A6A85]">
              Contact{" "}
              <Link
                href="/dashboard/tickets/create"
                className={`rounded-sm font-medium text-[#1787D4] hover:underline underline-offset-2 ${focusRing}`}
              >
                support
              </Link>{" "}
              to update WHOIS information.
            </p>
          </div>
        </div>
      )}

      {/* ══ TRANSFER TAB ════════════════════════════════════════════════════ */}
      {activeDetailTab === "transfer" &&
        !loadingDomain &&
        !errorDomain &&
        domain &&
        domain.status !== "ACTIVE" && (
          <div className={`${cardCls} p-5`}>
            <p className="text-sm text-[#5A6A85]">
              {domain.status === "EXPIRED"
                ? "Transfer is unavailable because this domain has expired. Renew it first, then request the authorization code."
                : "Transfer is unavailable until this domain is active. Registration may still be in progress."}
            </p>
          </div>
        )}
      {activeDetailTab === "transfer" &&
        !loadingDomain &&
        !errorDomain &&
        domain &&
        domain.status === "ACTIVE" && (
          <div className={cardCls}>
            {/* Header */}
            <div className={cardHeaderCls}>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#5A6A85]" />
                <h2 className="text-base font-semibold text-[#031033]">
                  Transfer domain out
                </h2>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-[#5A6A85] leading-relaxed">
                To move this domain to another registrar you need its
                authorization code, also called the EPP code or transfer key.
              </p>

              {authCode ? (
                <div className="flex flex-col">
                  <label htmlFor="domain-auth-code" className={labelCls}>
                    Authorization code
                  </label>
                  <div className="flex items-center gap-2 max-w-md">
                    <div className="relative flex-1 flex items-center h-10 rounded-lg border border-[#D5DCE6] bg-[#F2F5FC] pl-3 pr-1">
                      <input
                        id="domain-auth-code"
                        type={showAuthCode ? "text" : "password"}
                        value={authCode}
                        readOnly
                        className="w-full bg-transparent border-none text-sm font-mono text-[#031033] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthCode(!showAuthCode)}
                        className={iconBtn}
                        title={
                          showAuthCode
                            ? "Hide authorization code"
                            : "Show authorization code"
                        }
                        aria-label={
                          showAuthCode
                            ? "Hide authorization code"
                            : "Show authorization code"
                        }
                      >
                        {showAuthCode ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(authCode);
                        setCopiedAuthCode(true);
                        toast.success(
                          "Authorization code copied to clipboard.",
                        );
                        setTimeout(() => setCopiedAuthCode(false), 1500);
                      }}
                      className={`${btnSecondary} h-10`}
                    >
                      {copiedAuthCode ? (
                        <>
                          <Check className="w-4 h-4 text-[#0E7C3A]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#5A6A85]" />
                          Copy code
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#5A6A85] mt-1.5">
                    Keep this code private. Anyone who has it can transfer
                    your domain.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestAuthCode}
                  disabled={fetchingAuthCode}
                  className={`${btnPrimary} self-start`}
                >
                  {fetchingAuthCode && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Request authorization (EPP) code
                </button>
              )}
            </div>
          </div>
        )}

      {/* ── Propagation notice (DNS tab only) ── */}
      {activeDetailTab === "dns" && (
        <p className="text-xs text-[#5A6A85] text-center pb-2">
          DNS changes can take 24–48 hours to propagate globally.
        </p>
      )}

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
