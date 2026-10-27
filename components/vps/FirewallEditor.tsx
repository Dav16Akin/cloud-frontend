"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useGetVpsFirewall,
  useUpdateVpsFirewall,
} from "@/hooks/useVps";
import type {
  VpsFirewallProtocol,
  VpsFirewallRule,
} from "@/lib/api";

type EditableRule = {
  key: string;
  direction: "in" | "out";
  protocol: VpsFirewallProtocol;
  port: string;
  ips: string;
  description: string;
};

const PROTOCOLS: { value: VpsFirewallProtocol; label: string }[] = [
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "icmp", label: "ICMP" },
  { value: "esp", label: "ESP" },
  { value: "gre", label: "GRE" },
];

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function toEditable(rules: VpsFirewallRule[]): EditableRule[] {
  return rules.map((rule) => ({
    key: newKey(),
    direction: rule.direction,
    protocol: rule.protocol,
    port: rule.port ?? "",
    ips:
      rule.direction === "in"
        ? (rule.sourceIps ?? []).join(", ")
        : (rule.destinationIps ?? []).join(", "),
    description: rule.description ?? "",
  }));
}

function isValidCidr(value: string) {
  const parts = value.split("/");
  if (parts.length !== 2) return false;

  const [address, prefix] = parts;
  const prefixNumber = Number(prefix);

  if (!/^\d+$/.test(prefix) || !Number.isInteger(prefixNumber)) return false;

  if (address.includes(":")) {
    const hasDoubleColon = address.includes("::");
    const groups = address.split(":");
    if (!/^[0-9a-fA-F:]+$/.test(address)) return false;
    if (groups.length > 8 && !hasDoubleColon) return false;
    if (groups.some((group) => group.length > 4)) return false;
    return prefixNumber <= 128;
  }

  const octets = address.split(".");
  if (octets.length !== 4) return false;
  if (
    !octets.every(
      (octet) => /^\d+$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255,
    )
  ) {
    return false;
  }
  return prefixNumber <= 32;
}

function isValidPort(value: string) {
  const match = /^(\d+)(?:-(\d+))?$/.exec(value.trim());
  if (!match) return false;

  const start = Number(match[1]);
  const end = match[2] === undefined ? start : Number(match[2]);

  return start >= 1 && start <= 65535 && end >= start && end <= 65535;
}

function validateRules(rules: EditableRule[]): string | null {
  if (rules.length === 0) return "Add at least one firewall rule.";
  if (rules.length > 50) return "A firewall can have at most 50 rules.";

  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    const label = `Rule ${index + 1}`;
    const needsPort = rule.protocol === "tcp" || rule.protocol === "udp";

    if (!needsPort && rule.port.trim()) {
      return `${label}: ${rule.protocol.toUpperCase()} rules cannot specify a port.`;
    }
    if (needsPort && rule.direction === "in" && !rule.port.trim()) {
      return `${label}: inbound ${rule.protocol.toUpperCase()} needs a port.`;
    }
    if (rule.port.trim() && !isValidPort(rule.port)) {
      return `${label}: enter a port from 1-65535 or a range like 8000-8100.`;
    }

    const ips = rule.ips
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);

    if (ips.length === 0) {
      return rule.direction === "in"
        ? `${label}: add at least one source IP.`
        : `${label}: add at least one destination IP.`;
    }
    if (ips.length > 50) {
      return `${label}: a rule can contain at most 50 IP ranges.`;
    }
    const invalid = ips.find((ip) => !isValidCidr(ip));
    if (invalid) {
      return `${label}: "${invalid}" is not a valid CIDR block (for example 203.0.113.0/24).`;
    }
  }

  return null;
}

function toPayload(rules: EditableRule[]): VpsFirewallRule[] {
  return rules.map((rule) => {
    const ips = rule.ips
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);

    return {
      direction: rule.direction,
      protocol: rule.protocol,
      ...(rule.port.trim() ? { port: rule.port.trim() } : {}),
      ...(rule.direction === "in"
        ? { sourceIps: ips }
        : { destinationIps: ips }),
      ...(rule.description.trim()
        ? { description: rule.description.trim() }
        : {}),
    };
  });
}

const inputClass =
  "w-full rounded-lg border border-[#e8e8ed] bg-white px-2.5 py-2 text-[12.5px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#1787D4] transition-colors";

export default function FirewallEditor({
  vpsId,
  disabled = false,
}: {
  vpsId: string;
  disabled?: boolean;
}) {
  const { data, isLoading, isError, refetch } = useGetVpsFirewall(
    vpsId,
    !disabled,
  );
  const { mutate, isPending } = useUpdateVpsFirewall(vpsId);

  // A null draft means "show what the server has"; edits live in local state.
  const [draft, setDraft] = useState<EditableRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rules = useMemo(
    () => draft ?? (data ? toEditable(data.rules) : []),
    [draft, data],
  );
  const dirty = draft !== null;

  const editRules = (updater: (current: EditableRule[]) => EditableRule[]) => {
    setError(null);
    setDraft((current) => updater(current ?? rules));
  };

  const updateRule = (key: string, patch: Partial<EditableRule>) => {
    editRules((current) =>
      current.map((rule) => (rule.key === key ? { ...rule, ...patch } : rule)),
    );
  };

  const addRule = () => {
    editRules((current) => [
      ...current,
      {
        key: newKey(),
        direction: "in",
        protocol: "tcp",
        port: "22",
        ips: "0.0.0.0/0",
        description: "",
      },
    ]);
  };

  const removeRule = (key: string) => {
    editRules((current) => current.filter((rule) => rule.key !== key));
  };

  const save = () => {
    const validationError = validateRules(rules);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    mutate(toPayload(rules), {
      onSuccess: () => setDraft(null),
    });
  };

  const reset = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-[#1d1d1f]">Firewall</h3>
              {data?.applied ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Applied
                </span>
              ) : (
                <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Not applied
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#6e6e73] mt-0.5">
              Control which traffic can reach your server.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e8e8ed] bg-white hover:bg-[#f8fafc] text-[12px] font-semibold text-[#6e6e73] transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={addRule}
            disabled={disabled || isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e8e8ed] bg-white hover:bg-[#f8fafc] text-[12px] font-semibold text-[#1d1d1f] transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-[#1787D4]" />
            Add rule
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {disabled && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] px-3.5 py-2.5 text-[12px] text-[#6e6e73]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#8a9bb2] mt-0.5" />
            The firewall can be changed once your server has finished
            provisioning.
          </div>
        )}

        {!disabled && isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-[12.5px] text-[#6e6e73]">
            <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
            Loading firewall rules…
          </div>
        )}

        {!disabled && isError && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-[12.5px] text-[#6e6e73]">
              Could not load the firewall.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-[12px] font-semibold text-[#1787D4] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!disabled && !isLoading && !isError && (
          <div className="flex flex-col gap-3">
            {data && !data.applied && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  This server does not have a firewall attached right now. These
                  are the recommended defaults. Saving applies them at the
                  provider.
                </span>
              </div>
            )}

            {rules.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#d9d9de] bg-[#fbfcfe] px-4 py-8 text-center">
                <p className="text-[12.5px] text-[#6e6e73]">
                  No rules yet. Add at least one rule to protect the server.
                </p>
              </div>
            )}

            {rules.map((rule, index) => {
              const needsPort = rule.protocol === "tcp" || rule.protocol === "udp";
              const inbound = rule.direction === "in";

              return (
                <div
                  key={rule.key}
                  className="rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          inbound
                            ? "bg-[#eff6fc] text-[#1787D4] border-[#d6eaf8]"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {inbound ? "Inbound" : "Outbound"}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8a9bb2]">
                        Rule {index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRule(rule.key)}
                      aria-label={`Remove rule ${index + 1}`}
                      className="p-1.5 rounded-lg text-[#8a9bb2] hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1">
                        Direction
                      </label>
                      <select
                        value={rule.direction}
                        onChange={(event) => {
                          const direction = event.target.value as "in" | "out";
                          updateRule(rule.key, { direction, ips: "" });
                        }}
                        className={inputClass}
                      >
                        <option value="in">Inbound</option>
                        <option value="out">Outbound</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1">
                        Protocol
                      </label>
                      <select
                        value={rule.protocol}
                        onChange={(event) => {
                          const protocol = event.target.value as VpsFirewallProtocol;
                          updateRule(rule.key, {
                            protocol,
                            ...(protocol === "tcp" || protocol === "udp"
                              ? {}
                              : { port: "" }),
                          });
                        }}
                        className={inputClass}
                      >
                        {PROTOCOLS.map((protocol) => (
                          <option key={protocol.value} value={protocol.value}>
                            {protocol.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1">
                        Port {needsPort && inbound ? "*" : "(optional)"}
                      </label>
                      <input
                        type="text"
                        value={rule.port}
                        onChange={(event) =>
                          updateRule(rule.key, { port: event.target.value })
                        }
                        disabled={!needsPort}
                        placeholder={needsPort ? "22 or 8000-8100" : "—"}
                        className={`${inputClass} disabled:bg-[#f3f4f6] disabled:text-[#9ba8c0]`}
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={rule.description}
                        onChange={(event) =>
                          updateRule(rule.key, { description: event.target.value })
                        }
                        maxLength={100}
                        placeholder="SSH, HTTP…"
                        className={inputClass}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-4">
                      <label className="text-[10.5px] font-semibold text-[#6e6e73] block mb-1">
                        {inbound ? "Source IPs" : "Destination IPs"} *
                      </label>
                      <input
                        type="text"
                        value={rule.ips}
                        onChange={(event) =>
                          updateRule(rule.key, { ips: event.target.value })
                        }
                        placeholder="0.0.0.0/0, ::/0"
                        className={`${inputClass} font-mono`}
                      />
                      <p className="text-[10px] text-[#8a9bb2] mt-1">
                        Comma-separated CIDR blocks. Use 0.0.0.0/0 for all IPv4
                        and ::/0 for all IPv6.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[10.5px] text-[#8a9bb2]">
                Changes are applied to the provider firewall immediately.
              </p>
              <button
                type="button"
                onClick={save}
                disabled={isPending || !dirty}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold transition-colors disabled:opacity-50 shrink-0"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {isPending ? "Saving…" : "Save rules"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
