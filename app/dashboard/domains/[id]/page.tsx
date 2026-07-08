"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
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
} from "@/hooks/useDomains";
import type { DNSRecord, DNSRecordType } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toUpperCase();
  const cfg =
    s === "ACTIVE"
      ? { icon: CheckCircle2, label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" }
      : s === "EXPIRED"
      ? { icon: XCircle, label: "Expired", cls: "bg-red-50 text-red-500 border-red-200" }
      : { icon: Clock, label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200" };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
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

// ── DNS Constants ─────────────────────────────────────────────────────────────

const DNS_RECORD_TYPES: DNSRecordType[] = [
  "A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA",
];

const TYPE_COLORS: Record<string, string> = {
  A:     "bg-blue-50   text-blue-600   border-blue-200",
  AAAA:  "bg-indigo-50 text-indigo-600 border-indigo-200",
  CNAME: "bg-purple-50 text-purple-600 border-purple-200",
  MX:    "bg-[#fff8ee] text-[#e8900a]  border-amber-200",
  TXT:   "bg-emerald-50 text-emerald-600 border-emerald-200",
  NS:    "bg-teal-50   text-teal-600   border-teal-200",
  PTR:   "bg-pink-50   text-pink-600   border-pink-200",
  SRV:   "bg-cyan-50   text-cyan-600   border-cyan-200",
  CAA:   "bg-red-50    text-red-500    border-red-200",
};

const BLANK_FORM = {
  name: "",
  type: "A" as DNSRecordType,
  address: "",
  ttl: 14400,
  priority: "",
};

const needsPriority = (type: string) => type === "MX" || type === "SRV";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ManageDomainPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: domain, isLoading: loadingDomain, isError: errorDomain } = useGetDomainById(id);
  const { data: records, isLoading, isError, refetch } = useGetDomainDNSRecords(id);
  const { mutate: createRecord, isPending: creating } = useCreateDomainDNSRecord(id);
  const { mutate: updateRecord, isPending: updating } = useUpdateDomainDNSRecord(id);
  const { mutate: deleteRecord, isPending: deleting } = useDeleteDomainDNSRecord(id);
  const { mutate: saveNameservers, isPending: savingNS } = useUpdateNameservers(id);

  // ── Transfer out state ──
  const { mutate: getAuthCode, isPending: fetchingAuthCode } = useGetDomainAuthCode(id);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [copiedAuthCode, setCopiedAuthCode] = useState(false);

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
  const [nsFields, setNsFields] = useState<string[]>(["ns1.nupatcloud.com", "ns2.nupatcloud.com"]);
  const [nsHintOpen, setNsHintOpen] = useState(false);
  const [copiedNS, setCopiedNS] = useState<string | null>(null);

  const copyNS = (ns: string) => {
    navigator.clipboard.writeText(ns).then(() => {
      setCopiedNS(ns);
      setTimeout(() => setCopiedNS(null), 1500);
    });
  };

  const openNsEdit = () => {
    const current = domain?.nameservers?.length ? domain.nameservers : DEFAULT_NS;
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

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* ── Back link ── */}
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-sm text-[#5a6a85] hover:text-[#031033] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Domains
        </Link>
      </div>

      {/* ── Domain info card ── */}
      {loadingDomain ? (
        <div className="bg-white border border-[#e2eaff] p-6 animate-pulse flex flex-col gap-3">
          <div className="h-5 w-48 bg-[#e8edf8]" />
          <div className="h-4 w-32 bg-[#e8edf8]" />
        </div>
      ) : errorDomain || !domain ? (
        <div className="bg-white border border-[#e2eaff] p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-500">Could not load domain details.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2eaff]">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2eaff]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f2f5fc] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#e8900a]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#031033]">{domain.domain}</h1>
                <p className="text-xs text-[#9ba8c0] mt-0.5">Domain DNS Management</p>
              </div>
            </div>
            <StatusBadge status={domain.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-[#e2eaff]">
            {[
              { label: "Registered", value: formatDate(domain.registrationDate) },
              { label: "Expires", value: formatDate(domain.expiryDate) },
              { label: "Auto Renew", value: domain.autoRenew ? "Enabled" : "Disabled" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-[#031033]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Nameservers card ── */}
      {!loadingDomain && !errorDomain && domain && (() => {
        const currentNS: string[] =
          domain.nameservers && domain.nameservers.length > 0
            ? domain.nameservers
            : ["ns1.nupatcloud.com", "ns2.nupatcloud.com"];

        return (
          <div className="bg-white border border-[#e2eaff]">
            {/* Header */}
            <div className="px-6 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-[#9ba8c0]" />
                <h2 className="text-sm font-semibold text-[#031033]">Nameservers</h2>
              </div>
              <button
                id="domain-ns-edit"
                onClick={() => (nsOpen ? setNsOpen(false) : openNsEdit())}
                className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
              >
                <Pencil className="w-3 h-3" />
                {nsOpen ? "Cancel" : "Change"}
                <ChevronDown className={`w-3 h-3 transition-transform ${nsOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Current nameservers display */}
            {!nsOpen && (
              <div className="px-6 py-4 flex flex-col gap-2">
                <p className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide mb-1">
                  Current Nameservers
                </p>
                <div className="flex flex-col gap-1.5">
                  {currentNS.map((ns, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#9ba8c0] w-5 shrink-0">NS{i + 1}</span>
                      <code className="text-sm font-mono text-[#031033] bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1">
                        {ns}
                      </code>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#9ba8c0] mt-2">
                  <span className="font-semibold text-amber-600">Note:</span> Domains are typically locked for 60 days
                  after registration — nameserver changes during this window will be rejected by the registry.
                </p>
              </div>
            )}

            {/* Edit form */}
            {nsOpen && (
              <form onSubmit={handleNsSubmit} className="px-6 py-4 flex flex-col gap-4">
                <p className="text-xs text-[#5a6a85]">Enter between 2 and 4 nameservers.</p>
                <div className="flex flex-col gap-2">
                  {nsFields.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#9ba8c0] w-5 shrink-0">NS{i + 1}</span>
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
                        className="flex-1 bg-white border border-[#e2eaff] px-3 py-2 text-sm font-mono text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                      />
                      {i >= 2 && (
                        <button
                          type="button"
                          onClick={() => setNsFields((f) => f.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {nsFields.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setNsFields((f) => [...f, ""])}
                    className="self-start flex items-center gap-1 text-xs font-semibold text-[#5a6a85] hover:text-[#031033] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add nameserver
                  </button>
                )}

                <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700">
                  <span className="font-semibold">60-day lock:</span> If your domain was registered recently, the
                  registry may reject this change. Contact support if you see a lock error.
                </div>

                {/* Nupat Cloud default NS hint */}
                <div className="border border-[#e2eaff] bg-[#f6f9ff]">
                  <button
                    type="button"
                    id="domain-ns-hint-toggle"
                    onClick={() => setNsHintOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#5a6a85] hover:bg-[#eef2ff] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Signal className="w-3.5 h-3.5 text-[#e8900a]" />
                      Nupat Cloud nameservers (default)
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${nsHintOpen ? "rotate-180" : ""}`} />
                  </button>
                  {nsHintOpen && (
                    <div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t border-[#e2eaff]">
                      <p className="text-[11px] text-[#9ba8c0] mb-1">
                        Use these to point your domain back to Nupat Cloud hosting.
                      </p>
                      {DEFAULT_NS.map((ns, i) => (
                        <div key={ns} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#9ba8c0] w-5 shrink-0">NS{i + 1}</span>
                          <code className="flex-1 text-xs font-mono text-[#031033] bg-white border border-[#e2eaff] px-3 py-1 truncate">
                            {ns}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyNS(ns)}
                            title="Copy"
                            className="shrink-0 p-1.5 text-[#9ba8c0] hover:text-[#031033] hover:bg-[#e8edf8] transition-colors"
                          >
                            {copiedNS === ns
                              ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                              : <Copy className="w-3.5 h-3.5" />}
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
                            className="shrink-0 text-[10px] font-semibold text-[#e8900a] border border-[#e8900a]/30 bg-[#fff8f0] hover:bg-[#e8900a] hover:text-white px-2 py-1 transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        id="domain-ns-use-all-defaults"
                        onClick={() => setNsFields([...DEFAULT_NS])}
                        className="self-start mt-1 text-[10px] font-semibold text-[#031033] hover:text-[#e8900a] underline underline-offset-2 transition-colors"
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
                    className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="domain-ns-save"
                    disabled={savingNS}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-60"
                  >
                    {savingNS && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Nameservers
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })()}

      {/* ── DNS Records card ── */}
      <div className="bg-white border border-[#e2eaff]">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#9ba8c0]" />
            <h2 className="text-sm font-semibold text-[#031033]">DNS Records</h2>
            {records && (
              <span className="text-[10px] font-bold bg-[#f2f5fc] text-[#5a6a85] px-1.5 py-0.5 border border-[#e2eaff]">
                {records.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              id="domain-dns-refresh"
              onClick={() => refetch()}
              title="Refresh DNS records"
              className="text-[#9ba8c0] hover:text-[#031033] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              id="domain-dns-add"
              onClick={() => { setShowCreate((p) => !p); setEditTarget(null); }}
              className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] hover:underline underline-offset-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record
            </button>
          </div>
        </div>

        {/* ── Create Form ── */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#f6f9ff] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-[#031033]">New DNS Record</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Type</label>
                <select
                  id="domain-dns-create-type"
                  value={form.type}
                  onChange={(e) => patch("type", e.target.value)}
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                >
                  {DNS_RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Name / Host</label>
                <input
                  id="domain-dns-create-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="@ or subdomain"
                  required
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">
                  {form.type === "MX" ? "Mail Server" : form.type === "CNAME" ? "Alias / Target" : "Value / Address"}
                </label>
                <input
                  id="domain-dns-create-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder={
                    form.type === "TXT" ? "v=spf1 ..." :
                    form.type === "CNAME" ? "target.domain.com." :
                    "1.2.3.4"
                  }
                  required
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              {/* TTL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">TTL (seconds)</label>
                <input
                  id="domain-dns-create-ttl"
                  type="number"
                  min={300}
                  value={form.ttl}
                  onChange={(e) => patch("ttl", e.target.value)}
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              {/* Priority (MX/SRV only) */}
              {needsPriority(form.type) && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Priority</label>
                  <input
                    id="domain-dns-create-priority"
                    type="number"
                    min={0}
                    value={form.priority}
                    onChange={(e) => patch("priority", e.target.value)}
                    placeholder="10"
                    className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm(BLANK_FORM); }}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-60"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Record
              </button>
            </div>
          </form>
        )}

        {/* ── Edit Form ── */}
        {editTarget && (
          <form
            onSubmit={handleUpdate}
            className="px-5 py-4 border-b border-[#e2eaff] bg-[#fff8ee] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#031033]">
                Edit Record — <span className="text-[#e8900a] font-mono">{editTarget.name}</span>
              </p>
              <button type="button" onClick={() => setEditTarget(null)} className="text-[#9ba8c0] hover:text-[#031033]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Type</label>
                <select
                  id="domain-dns-edit-type"
                  value={editForm.type}
                  onChange={(e) => patchEdit("type", e.target.value)}
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                >
                  {DNS_RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Name / Host</label>
                <input
                  id="domain-dns-edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => patchEdit("name", e.target.value)}
                  required
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Value / Address</label>
                <input
                  id="domain-dns-edit-address"
                  type="text"
                  value={editForm.address}
                  onChange={(e) => patchEdit("address", e.target.value)}
                  required
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">TTL (seconds)</label>
                <input
                  id="domain-dns-edit-ttl"
                  type="number"
                  min={300}
                  value={editForm.ttl}
                  onChange={(e) => patchEdit("ttl", e.target.value)}
                  className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] outline-none focus:border-[#e8900a] transition-colors"
                />
              </div>
              {needsPriority(editForm.type) && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Priority</label>
                  <input
                    id="domain-dns-edit-priority"
                    type="number"
                    min={0}
                    value={editForm.priority}
                    onChange={(e) => patchEdit("priority", e.target.value)}
                    className="bg-white border border-[#e2eaff] px-3 py-2 text-sm text-[#031033] placeholder:text-[#c0cad8] outline-none focus:border-[#e8900a] transition-colors"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-xs font-semibold border border-[#e2eaff] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-60"
              >
                {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* ── Records list ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[#e8900a]" />
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 px-5 py-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-500">Could not load DNS records.</p>
          </div>
        )}
        {!isLoading && !isError && (!records || records.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <ShieldCheck className="w-8 h-8 text-[#9ba8c0] mb-2" />
            <p className="text-sm text-[#5a6a85]">No DNS records found.</p>
            <p className="text-xs text-[#9ba8c0] mt-1">Click "Add Record" to create your first DNS entry.</p>
          </div>
        )}
        {records && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[#e2eaff] bg-[#f6f9ff]">
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Type</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Name</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Value</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">TTL</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#9ba8c0] uppercase tracking-wide">Priority</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2eaff]">
                {records.map((r: DNSRecord, index) => {
                  const typeCls = TYPE_COLORS[r.type] ?? "bg-gray-100 text-gray-600 border-gray-200";
                  return (
                    <tr key={index} className="hover:bg-[#f6f9ff] transition-colors group">
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 border ${typeCls}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <code className="text-xs text-[#031033] font-mono break-all">{r.name}</code>
                      </td>
                      <td className="px-5 py-2.5 max-w-[220px]">
                        <span className="text-xs text-[#5a6a85] truncate block" title={r.address}>{r.address}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-xs text-[#9ba8c0]">{r.ttl}s</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-xs text-[#9ba8c0]">{r.priority ?? "—"}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button
                            id={`domain-dns-edit-${r.line}`}
                            onClick={() => openEdit(r)}
                            className="text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] p-1.5 transition-colors"
                            aria-label={`Edit DNS record line ${r.line}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`domain-dns-delete-${r.line}`}
                            onClick={() => setDeleteTarget(r)}
                            disabled={deleting}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors"
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

      {/* ── Transfer Out (Auth Code) Card ── */}
      {!loadingDomain && !errorDomain && domain && domain.status === "ACTIVE" && (
        <div className="bg-white border border-[#e2eaff]">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#e2eaff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#9ba8c0]" />
              <h2 className="text-sm font-semibold text-[#031033]">Transfer Domain Out</h2>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-xs text-[#5a6a85] leading-relaxed">
              If you want to transfer your domain name to another registrar, you will need an authorization code (also known as EPP code or transfer key).
            </p>

            {authCode ? (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#9ba8c0] uppercase tracking-wide">
                  Authorization Code
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <div className="relative flex-1 flex items-center border border-[#dce4f7] bg-[#f6f9ff] px-3 py-2">
                    <input
                      type={showAuthCode ? "text" : "password"}
                      value={authCode}
                      readOnly
                      className="w-full bg-transparent border-none text-sm font-mono text-[#031033] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthCode(!showAuthCode)}
                      className="text-[#9ba8c0] hover:text-[#031033] p-1.5 transition-colors"
                      title={showAuthCode ? "Hide authorization code" : "Show authorization code"}
                    >
                      {showAuthCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(authCode);
                      setCopiedAuthCode(true);
                      toast.success("Authorization code copied to clipboard.");
                      setTimeout(() => setCopiedAuthCode(false), 1500);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#e8900a] border border-[#e8900a]/30 bg-[#fff8f0] hover:bg-[#e8900a] hover:text-white px-3 py-2.5 transition-colors shrink-0"
                  >
                    {copiedAuthCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#9ba8c0] mt-1">
                  Keep this code confidential. Anyone with access to it can transfer your domain name.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestAuthCode}
                disabled={fetchingAuthCode}
                className="self-start btn-primary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-60"
              >
                {fetchingAuthCode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Request Authorization (EPP) Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Propagation notice ── */}
      <p className="text-xs text-[#9ba8c0] text-center pb-2">
        DNS changes can take up to 24–48 hours to propagate globally.
      </p>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete DNS Record"
          message={`Delete the ${deleteTarget.type} record for "${deleteTarget.name}"? DNS changes may take time to propagate.`}
          confirmLabel="Delete Record"
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
