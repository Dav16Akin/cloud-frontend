"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCw,
  ShieldAlert,
  Square,
  Terminal,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  useDeleteVps,
  useRebuildVps,
  useRenameVps,
  useRebootVps,
  useRenewVps,
  useResizeVps,
  useStopVps,
  useVpsImages,
  useVpsPlans,
} from "@/hooks/useVps";
import type { VpsServer } from "@/lib/api";
import VpsModal from "./VpsModal";
import {
  daysUntil,
  formatNaira,
  formatVpsDate,
  humanizeImage,
  locationLabel,
  validateVpsName,
} from "./vps-utils";

const secondaryButton =
  "px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e8e8ed] text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50";
const primaryButton =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors disabled:opacity-60";
const dangerButton =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors disabled:opacity-60";

const checkboxClass =
  "mt-0.5 h-4 w-4 rounded border-[#c8c8cc] text-[#1787D4] accent-[#1787D4]";

// ── Stop ──────────────────────────────────────────────────────────────────────

export function StopVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const [force, setForce] = useState(false);
  const { mutate, isPending } = useStopVps(server.id);

  return (
    <VpsModal
      title="Stop this server?"
      description={server.name}
      icon={Square}
      iconClassName="bg-slate-100 text-slate-600 border-slate-200"
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutate({ force }, { onSuccess: onClose })}
            disabled={isPending}
            className={dangerButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Stopping…" : force ? "Force stop" : "Stop server"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-[#5a6a85] leading-relaxed">
          The server will be powered off and your services will go offline.
          You can start it again at any time from this page.
        </p>

        <label className="flex items-start gap-2.5 rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] px-3.5 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={force}
            onChange={(event) => setForce(event.target.checked)}
            className={checkboxClass}
          />
          <span>
            <span className="block text-[12.5px] font-semibold text-[#1d1d1f]">
              Force power off
            </span>
            <span className="block text-[11.5px] text-[#6e6e73] mt-0.5 leading-snug">
              Cuts power immediately instead of a graceful shutdown. Unsaved
              data may be lost.
            </span>
          </span>
        </label>
      </div>
    </VpsModal>
  );
}

// ── Reboot ────────────────────────────────────────────────────────────────────

export function RebootVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const { mutate, isPending } = useRebootVps(server.id);

  return (
    <VpsModal
      title="Reboot this server?"
      description={server.name}
      icon={RotateCw}
      iconClassName="bg-amber-50 text-amber-600 border-amber-200"
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutate(undefined, { onSuccess: onClose })}
            disabled={isPending}
            className={primaryButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Rebooting…" : "Reboot server"}
          </button>
        </>
      }
    >
      <p className="text-[13px] text-[#5a6a85] leading-relaxed">
        The server will restart and be unavailable for a short time. Any
        processes that are not saved will be lost.
      </p>
    </VpsModal>
  );
}

// ── Rename ────────────────────────────────────────────────────────────────────

export function RenameVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const [name, setName] = useState(server.name);
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useRenameVps(server.id);

  const submit = () => {
    const validationError = validateVpsName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (name.trim() === server.name) {
      setError("Enter a different name.");
      return;
    }

    setError(null);
    mutate(name.trim(), { onSuccess: onClose });
  };

  return (
    <VpsModal
      title="Rename server"
      description="The new label appears only in your Nupat dashboard."
      icon={Pencil}
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className={primaryButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Saving…" : "Save name"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-semibold text-[#1d1d1f]">
          Server name
        </label>
        <input
          type="text"
          id="vps-rename-input"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          maxLength={40}
          autoFocus
          className={`w-full rounded-lg border px-3 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none transition-colors ${
            error
              ? "border-red-300 focus:border-red-400"
              : "border-[#e8e8ed] focus:border-[#1787D4]"
          }`}
        />
        {error ? (
          <p className="text-[11.5px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-[#8a9bb2]">
            3–40 characters. Letters, numbers, spaces, dots, hyphens and
            underscores.
          </p>
        )}
      </div>
    </VpsModal>
  );
}

// ── Rebuild ───────────────────────────────────────────────────────────────────

export function RebuildVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const imagesQuery = useVpsImages();
  const [image, setImage] = useState(server.image);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useRebuildVps(server.id);

  const images = imagesQuery.data ?? [];

  const submit = () => {
    if (!image) {
      setError("Select an operating system.");
      return;
    }
    if (!confirmed) {
      setError("Confirm that you understand all data will be erased.");
      return;
    }
    setError(null);
    mutate(image, { onSuccess: onClose });
  };

  return (
    <VpsModal
      title="Rebuild this server?"
      description={`${server.name} will be reinstalled from a fresh image.`}
      icon={RefreshCw}
      iconClassName="bg-amber-50 text-amber-600 border-amber-200"
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !confirmed || !image}
            className={dangerButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Rebuilding…" : "Rebuild server"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            All data, applications and configuration on this server will be
            erased. This cannot be undone.
          </span>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#1d1d1f] block mb-2">
            New operating system
          </label>

          {imagesQuery.isLoading && (
            <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1787D4]" />
              Loading images…
            </div>
          )}

          {imagesQuery.isError && (
            <p className="text-[12px] text-red-600 py-2">
              Could not load operating systems. Close this dialog and try again.
            </p>
          )}

          {!imagesQuery.isLoading && images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {images.map((entry) => {
                const selected = entry.providerImage === image;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setImage(entry.providerImage);
                      setError(null);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                      selected
                        ? "border-[#1787D4] bg-[#f6fbff] ring-2 ring-[#1787D4]/10"
                        : "border-[#e8e8ed] hover:border-[#c9d8e8]"
                    }`}
                  >
                    <Terminal
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selected ? "text-[#1787D4]" : "text-[#8a9bb2]"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-[#1d1d1f] truncate">
                        {entry.label}
                      </span>
                      <span className="block text-[10px] font-mono text-[#8a9bb2] truncate">
                        {entry.providerImage}
                      </span>
                    </span>
                    {selected && (
                      <Check className="w-3.5 h-3.5 text-[#1787D4] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => {
              setConfirmed(event.target.checked);
              setError(null);
            }}
            className={checkboxClass}
          />
          <span className="text-[12px] text-[#5a6a85] leading-relaxed">
            I understand that everything on this server will be permanently
            erased.
          </span>
        </label>

        {error && (
          <p className="text-[11.5px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>
    </VpsModal>
  );
}

// ── Resize ────────────────────────────────────────────────────────────────────

export function ResizeVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const plansQuery = useVpsPlans();
  const [targetPlanId, setTargetPlanId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useResizeVps(server.id);

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const currentPlan = server.plan;
  const targetPlan = useMemo(
    () => plans.find((plan) => plan.id === targetPlanId),
    [plans, targetPlanId],
  );

  const submit = () => {
    if (!targetPlanId) {
      setError("Select a plan.");
      return;
    }
    if (currentPlan && targetPlanId === currentPlan.id) {
      setError("The server is already on this plan.");
      return;
    }
    setError(null);
    mutate(targetPlanId, { onSuccess: onClose });
  };

  return (
    <VpsModal
      title="Resize server"
      description={server.name}
      icon={TrendingUp}
      onClose={onClose}
      busy={isPending}
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={
              isPending ||
              !targetPlanId ||
              targetPlanId === currentPlan?.id
            }
            className={primaryButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Resizing…" : "Resize server"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {currentPlan && (
          <div className="rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
              Current plan
            </span>
            <p className="text-[12.5px] font-semibold text-[#1d1d1f] mt-0.5">
              {currentPlan.name}
            </p>
            <p className="text-[11px] text-[#6e6e73]">
              {currentPlan.cpu} vCPU · {currentPlan.ramGb} GB RAM ·{" "}
              {currentPlan.diskGb} GB disk
            </p>
          </div>
        )}

        {plansQuery.isLoading && (
          <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] py-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1787D4]" />
            Loading plans…
          </div>
        )}

        {plansQuery.isError && (
          <p className="text-[12px] text-red-600">
            Could not load plans. Close this dialog and try again.
          </p>
        )}

        {!plansQuery.isLoading && plans.length > 0 && (
          <div className="flex flex-col gap-2">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id;
              const shrinksDisk = !!currentPlan && plan.diskGb < currentPlan.diskGb;
              const disabled = isCurrent || shrinksDisk;
              const selected = plan.id === targetPlanId;

              return (
                <button
                  key={plan.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setTargetPlanId(plan.id);
                    setError(null);
                  }}
                  className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all ${
                    selected
                      ? "border-[#1787D4] bg-[#f6fbff] ring-2 ring-[#1787D4]/10"
                      : disabled
                        ? "border-[#e8e8ed] bg-[#fbfcfe] opacity-60 cursor-not-allowed"
                        : "border-[#e8e8ed] hover:border-[#c9d8e8]"
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

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12.5px] font-semibold text-[#1d1d1f]">
                        {plan.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9.5px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                      {shrinksDisk && (
                        <span className="text-[9.5px] font-bold uppercase tracking-wide bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                          Cannot shrink disk
                        </span>
                      )}
                    </span>
                    <span className="block text-[10.5px] text-[#6e6e73] mt-0.5">
                      {plan.cpu} vCPU · {plan.ramGb} GB RAM · {plan.diskGb} GB
                      disk
                    </span>
                  </span>

                  <span className="text-[12px] font-bold text-[#1d1d1f] shrink-0">
                    {formatNaira(plan.priceNgnMonthly)}
                    <span className="block text-[9.5px] font-normal text-[#8a9bb2] text-right">
                      /month
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-lg border border-[#eef2f8] bg-[#f8fafc] px-3.5 py-2.5 text-[11px] text-[#5a6a85] leading-relaxed">
          Resizing requires the server to be stopped. Your next renewal uses the
          new plan price; no prorated difference is charged now. Disks cannot be
          shrunk later.
        </div>

        {targetPlan && currentPlan && (
          <p className="text-[11.5px] text-[#5a6a85]">
            New monthly price:{" "}
            <strong className="text-[#1d1d1f]">
              {formatNaira(targetPlan.priceNgnMonthly)}
            </strong>{" "}
            (
            {targetPlan.priceNgnMonthly >= currentPlan.priceNgnMonthly
              ? "+"
              : ""}
            {formatNaira(
              targetPlan.priceNgnMonthly - currentPlan.priceNgnMonthly,
            )}{" "}
            vs current)
          </p>
        )}

        {error && (
          <p className="text-[11.5px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>
    </VpsModal>
  );
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function DeleteVpsModal({
  server,
  onClose,
  onDeleted,
}: {
  server: VpsServer;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const { mutate, isPending } = useDeleteVps({
    onSuccess: () => {
      onClose();
      onDeleted();
    },
  });

  const canDelete = confirmation.trim() === server.name && !isPending;

  return (
    <VpsModal
      title="Delete this server?"
      description="This action is permanent."
      icon={Trash2}
      iconClassName="bg-red-50 text-red-600 border-red-200"
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Keep server
          </button>
          <button
            type="button"
            onClick={() => mutate(server.id)}
            disabled={!canDelete}
            className={dangerButton}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "Deleting…" : "Delete permanently"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            The server and all of its data will be destroyed. This cancels
            future billing and cannot be undone.
          </span>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#1d1d1f] block mb-1.5">
            Type <span className="font-mono">{server.name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border border-[#e8e8ed] px-3 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>
      </div>
    </VpsModal>
  );
}

// ── Renew ─────────────────────────────────────────────────────────────────────

export function RenewVpsModal({
  server,
  onClose,
}: {
  server: VpsServer;
  onClose: () => void;
}) {
  const { mutate, isPending } = useRenewVps();

  const price = server.plan?.priceNgnMonthly ?? 0;
  const daysRemaining = daysUntil(server.nextBillingAt);
  const newBillingAt =
    server.nextBillingAt && daysRemaining !== null && daysRemaining > 0
      ? new Date(
          new Date(server.nextBillingAt).getTime() +
            30 * 24 * 60 * 60 * 1000,
        )
      : null;

  return (
    <VpsModal
      title="Renew server"
      description={server.name}
      icon={CalendarClock}
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutate(server.id)}
            disabled={isPending || price <= 0}
            className={primaryButton}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>Pay {formatNaira(price)}</>
            )}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] divide-y divide-[#eef2f8]">
          <div className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px]">
            <span className="text-[#6e6e73]">Plan</span>
            <span className="font-semibold text-[#1d1d1f]">
              {server.plan?.name ?? "VPS"}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px]">
            <span className="text-[#6e6e73]">Current paid until</span>
            <span className="text-[#1d1d1f]">
              {formatVpsDate(server.nextBillingAt)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px]">
            <span className="text-[#6e6e73]">New paid until</span>
            <span className="font-semibold text-[#1d1d1f]">
              {newBillingAt
                ? formatVpsDate(newBillingAt.toISOString())
                : "30 days after payment"}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[12.5px] text-[#6e6e73]">Amount due</span>
            <span className="text-[15px] font-bold text-[#1787D4]">
              {formatNaira(price)}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-[#5a6a85] leading-relaxed">
          Adds 30 days to your current billing period. You will complete the
          payment securely on Paystack, and the renewal is applied as soon as
          payment is confirmed.
        </p>

        <p className="text-[11px] text-[#8a9bb2] leading-relaxed">
          {humanizeImage(server.image)} · {locationLabel(server.location)}
        </p>

        {server.status === "SUSPENDED" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11.5px] text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              This server was suspended for non-payment. It will be powered back
              on automatically after the payment is confirmed.
            </span>
          </div>
        )}

        {price <= 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              This server has no plan attached, so renewal is unavailable.
              Please contact support.
            </span>
          </div>
        )}
      </div>
    </VpsModal>
  );
}
