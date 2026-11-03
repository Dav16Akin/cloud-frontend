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
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#031033] block mb-1.5">
            Key name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. laptop"
            maxLength={50}
            className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
        </div>
        <div className="text-xs text-[#5A6A85] flex items-end pb-1.5 leading-snug">
          A public key is safe to share. We never see your private key.
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#031033] block mb-1.5">
          Public key
        </label>
        <textarea
          value={publicKey}
          onChange={(event) => setPublicKey(event.target.value)}
          rows={compact ? 2 : 3}
          placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA… you@example"
          className="w-full rounded-lg border border-[#D5DCE6] bg-white px-3 py-2 text-xs font-mono text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors resize-y"
        />
        <p className="text-xs text-[#5A6A85] mt-1.5">
          Usually found at <span className="font-mono">~/.ssh/id_ed25519.pub</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-[#C21F1F]">
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
            className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium text-[#5A6A85] hover:text-[#031033] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <label className="text-sm font-medium text-[#031033]">
          SSH key {required && <span className="text-[#C21F1F]">*</span>}
        </label>
        {!noKeys && (
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-1 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? "Close form" : "Add key"}
          </button>
        )}
      </div>

      {noKeys && (
        <div className="rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] px-4 py-3 text-sm text-[#9A5B00] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
        <div className="flex flex-col gap-2" aria-label="Loading your keys">
          <div className="h-14 rounded-lg bg-[#EEF2F7] animate-pulse" />
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
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "border-[#1787D4] bg-[#E8F4FC] ring-2 ring-[#1787D4]/15"
                    : "border-[#E2E8F0] bg-white hover:border-[#D5DCE6]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selected
                      ? "border-[#1787D4] bg-[#1787D4]"
                      : "border-[#D5DCE6] bg-white"
                  }`}
                >
                  {selected && (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <KeyRound className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#031033] truncate">
                    {key.name}
                  </span>
                  <span className="block text-xs font-mono text-[#5A6A85] truncate">
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
        className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF2F7]">
          <div className="flex items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#031033]">
                  SSH keys
                </h3>
                {keys && keys.length > 0 && (
                  <span className="text-sm tabular-nums text-[#5A6A85]">
                    {keys.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A6A85] mt-0.5">
                Keys used to access the servers you deploy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4 text-[#5A6A85]" />
            {showForm ? "Close" : "Add SSH key"}
          </button>
        </div>

        <div className="p-5">
          {showForm && (
            <div className="mb-4">
              <AddSshKeyForm
                onCancel={() => setShowForm(false)}
                onCreated={() => setShowForm(false)}
              />
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-2" aria-label="Loading SSH keys">
              <div className="h-14 rounded-lg bg-[#EEF2F7] animate-pulse" />
              <div className="h-14 rounded-lg bg-[#EEF2F7] animate-pulse" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#DC2626]" />
              <p className="text-sm text-[#5A6A85]">
                Could not load your SSH keys.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && keys && keys.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm font-semibold text-[#031033]">
                No SSH keys yet
              </p>
              <p className="text-sm text-[#5A6A85] mt-1 max-w-sm">
                Add one before deploying a server. We never store or email root
                passwords.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add your first key
              </button>
            </div>
          )}

          {!isLoading && keys && keys.length > 0 && (
            <div className="divide-y divide-[#EEF2F7] rounded-lg border border-[#EEF2F7] overflow-hidden">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F2F5FC]/60 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#5A6A85] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#031033] truncate">
                      {key.name}
                    </p>
                    <p className="text-xs font-mono text-[#5A6A85] truncate">
                      {key.fingerprint ?? key.publicKey.slice(0, 52) + "…"}
                    </p>
                  </div>
                  <span className="hidden sm:block text-xs text-[#5A6A85] tabular-nums shrink-0">
                    {formatVpsDate(key.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(key)}
                    aria-label={`Delete ${key.name}`}
                    className="p-1.5 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-[#5A6A85] mt-3 leading-relaxed">
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
          iconClassName="bg-[#FDECEC] text-[#C21F1F] border-[#DC2626]/20"
          onClose={() => setDeleteTarget(null)}
          busy={removing}
          footer={
            <>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={removing}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#C21F1F] hover:bg-[#A31919] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Remove key
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5A6A85] leading-relaxed">
            You will no longer be able to log in to servers with this key. This
            does not affect servers that were already created with it, and it
            cannot be undone.
          </p>
        </VpsModal>
      )}
    </>
  );
}
