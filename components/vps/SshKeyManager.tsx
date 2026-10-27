"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useCreateSshKey,
  useDeleteSshKey,
  useGetSshKeys,
} from "@/hooks/useVps";
import type { SshKey } from "@/lib/api";
import { SSH_PUBLIC_KEY_PATTERN, formatVpsDate } from "./vps-utils";
import VpsModal from "./VpsModal";

// ── Add key form ─────────────────────────────────────────────────────────────

function AddSshKeyForm({
  onCreated,
  onCancel,
  compact = false,
}: {
  onCreated: (key: SshKey) => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateSshKey({
    onSuccess: (res) => {
      if (res?.data) onCreated(res.data);
      setName("");
      setPublicKey("");
      setError(null);
    },
  });

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedKey = publicKey.trim();

    if (!trimmedName) {
      setError("Give this key a name so you can recognise it later.");
      return;
    }
    if (!SSH_PUBLIC_KEY_PATTERN.test(trimmedKey)) {
      setError("Paste a valid OpenSSH public key, for example ssh-ed25519 AAAA…");
      return;
    }

    setError(null);
    mutate({ name: trimmedName, publicKey: trimmedKey });
  };

  return (
    <div className="rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] p-3.5 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11.5px] font-semibold text-[#1d1d1f] block mb-1.5">
            Key name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. laptop"
            maxLength={50}
            className="w-full rounded-lg border border-[#e8e8ed] bg-white px-3 py-2 text-[13px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
        </div>
        <div className="text-[11px] text-[#6e6e73] flex items-end pb-1.5 leading-snug">
          A public key is safe to share. We never see your private key.
        </div>
      </div>

      <div>
        <label className="text-[11.5px] font-semibold text-[#1d1d1f] block mb-1.5">
          Public key
        </label>
        <textarea
          value={publicKey}
          onChange={(event) => setPublicKey(event.target.value)}
          rows={compact ? 2 : 3}
          placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA… you@example"
          className="w-full rounded-lg border border-[#e8e8ed] bg-white px-3 py-2 text-[12px] font-mono text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#1787D4] transition-colors resize-y"
        />
        <p className="text-[10.5px] text-[#8a9bb2] mt-1">
          Usually found at ~/.ssh/id_ed25519.pub
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-[11.5px] text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {isPending ? "Adding…" : "Add key"}
        </button>
      </div>
    </div>
  );
}

// ── Picker used by purchase + activation flows ───────────────────────────────

export function SshKeyPicker({
  selectedId,
  onSelect,
  required = true,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  required?: boolean;
}) {
  const { data: keys, isLoading } = useGetSshKeys();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!selectedId && keys?.length === 1) {
      onSelect(keys[0].id);
    }
    // Only auto-select the first time a single key is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys?.length, selectedId]);

  // No keys means no way in, so the form opens on its own instead of via effect.
  const noKeys = !isLoading && keys?.length === 0;
  const formVisible = showForm || noKeys;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[12px] font-semibold text-[#1d1d1f]">
          SSH key {required && <span className="text-red-500">*</span>}
        </label>
        {!noKeys && (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#1787D4] hover:text-[#1371B5]"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? "Close form" : "Add key"}
          </button>
        )}
      </div>

      {noKeys && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11.5px] text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Add an SSH key to continue. We never store root passwords, so a key
            is the only way to log in to your server.
          </span>
        </div>
      )}

      {formVisible && (
        <AddSshKeyForm
          compact
          onCancel={keys?.length ? () => setShowForm(false) : undefined}
          onCreated={(key) => {
            onSelect(key.id);
            setShowForm(false);
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1787D4]" />
          Loading your keys…
        </div>
      )}

      {!isLoading && keys && keys.length > 0 && !formVisible && (
        <div className="flex flex-col gap-2">
          {keys.map((key) => {
            const selected = key.id === selectedId;
            return (
              <button
                key={key.id}
                type="button"
                onClick={() => onSelect(key.id)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  selected
                    ? "border-[#1787D4] bg-[#f6fbff] ring-2 ring-[#1787D4]/10"
                    : "border-[#e8e8ed] bg-white hover:border-[#c9d8e8]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selected
                      ? "border-[#1787D4] bg-[#1787D4]"
                      : "border-[#c8c8cc] bg-white"
                  }`}
                >
                  {selected && (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <KeyRound className="w-4 h-4 text-[#1787D4] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold text-[#1d1d1f] truncate">
                    {key.name}
                  </span>
                  <span className="block text-[10.5px] font-mono text-[#8a9bb2] truncate">
                    {key.fingerprint ?? key.publicKey.slice(0, 42) + "…"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}

// ── Full manager shown on the VPS dashboard ─────────────────────────────────

export function SshKeyManager() {
  const { data: keys, isLoading, isError, refetch } = useGetSshKeys();
  const { mutate: removeKey, isPending: removing } = useDeleteSshKey();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SshKey | null>(null);

  return (
    <>
      <div
        id="ssh-keys"
        className="bg-white rounded-[14px] border border-[#e8e8ed] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#eef2f8]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#eff6fc] border border-[#d6eaf8] text-[#1787D4] flex items-center justify-center shrink-0">
              <KeyRound className="w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">
                  SSH Keys
                </h3>
                {keys && keys.length > 0 && (
                  <span className="text-[10.5px] font-bold text-[#1787D4] bg-[#eff6fc] border border-[#d6eaf8] px-2 py-0.5 rounded-full">
                    {keys.length}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#6e6e73] mt-0.5">
                Keys used to access the servers you deploy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e8e8ed] bg-white hover:bg-[#f8fafc] text-[12.5px] font-semibold text-[#1d1d1f] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#1787D4]" />
            {showForm ? "Close" : "Add SSH key"}
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {showForm && (
            <div className="mb-4">
              <AddSshKeyForm
                onCancel={() => setShowForm(false)}
                onCreated={() => setShowForm(false)}
              />
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-[12.5px] text-[#6e6e73]">
              <Loader2 className="w-4 h-4 animate-spin text-[#1787D4]" />
              Loading SSH keys…
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-[12.5px] text-[#6e6e73]">
                Could not load your SSH keys.
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

          {!isLoading && !isError && keys && keys.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-11 h-11 rounded-lg bg-[#f5f5f7] flex items-center justify-center mb-2.5">
                <KeyRound className="w-5 h-5 text-[#aeaeb2]" />
              </div>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">
                No SSH keys yet
              </p>
              <p className="text-[12px] text-[#6e6e73] mt-0.5 max-w-sm">
                Add one before deploying a server. We never store or email root
                passwords.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12px] font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add your first key
              </button>
            </div>
          )}

          {!isLoading && keys && keys.length > 0 && (
            <div className="divide-y divide-[#f2f5fc] rounded-lg border border-[#eef2f8] overflow-hidden">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-3 px-3.5 py-3 bg-white hover:bg-[#fbfcfe] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f6fbff] border border-[#e2eefb] text-[#1787D4] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                      {key.name}
                    </p>
                    <p className="text-[10.5px] font-mono text-[#8a9bb2] truncate">
                      {key.fingerprint ?? key.publicKey.slice(0, 52) + "…"}
                    </p>
                  </div>
                  <span className="hidden sm:block text-[11.5px] text-[#8a9bb2] shrink-0">
                    {formatVpsDate(key.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(key)}
                    aria-label={`Delete ${key.name}`}
                    className="p-1.5 rounded-lg text-[#8a9bb2] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10.5px] text-[#8a9bb2] mt-3 leading-relaxed">
            Removing a key prevents future logins with it, but servers already
            built with the key keep it on their authorised-key list.
          </p>
        </div>
      </div>

      {deleteTarget && (
        <VpsModal
          title="Remove SSH key?"
          description={deleteTarget.name}
          icon={Trash2}
          iconClassName="bg-red-50 text-red-600 border-red-200"
          onClose={() => setDeleteTarget(null)}
          busy={removing}
          footer={
            <>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={removing}
                className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e8e8ed] text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
              >
                Keep key
              </button>
              <button
                type="button"
                onClick={() => {
                  removeKey(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }}
                disabled={removing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors disabled:opacity-60"
              >
                {removing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Remove key
              </button>
            </>
          }
        >
          <p className="text-[13px] text-[#5a6a85] leading-relaxed">
            You will no longer be able to log in to servers with this key. This
            does not affect servers that were already created with it, and it
            cannot be undone.
          </p>
        </VpsModal>
      )}
    </>
  );
}
