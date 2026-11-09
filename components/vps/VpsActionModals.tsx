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
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { GATEWAY_NAME, payLabel } from "@/lib/payments";
import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";
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
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButton =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";
const dangerButton =
  "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#C21F1F] hover:bg-[#A31919] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed";

const checkboxClass =
  "mt-0.5 h-4 w-4 shrink-0 rounded border-[#D5DCE6] text-[#1787D4] accent-[#1787D4]";

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
      iconClassName="bg-[#F2F5FC] text-[#5A6A85] border-[#E2E8F0]"
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
        <p className="text-sm text-[#5A6A85] leading-relaxed">
          The server will be powered off and your services will go offline.
          You can start it again at any time from this page.
        </p>

        <label className="flex items-start gap-2.5 rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={force}
            onChange={(event) => setForce(event.target.checked)}
            className={checkboxClass}
          />
          <span>
            <span className="block text-sm font-medium text-[#031033]">
              Force power off
            </span>
            <span className="block text-xs text-[#5A6A85] mt-0.5 leading-snug">
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
      iconClassName="bg-[#FFF4E0] text-[#9A5B00] border-[#E8900A]/25"
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
      <p className="text-sm text-[#5A6A85] leading-relaxed">
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="vps-rename-input" className="text-sm font-medium text-[#031033]">
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
          className={`w-full h-10 rounded-lg border bg-white px-3 text-sm text-[#031033] outline-none focus:ring-2 transition-colors ${
            error
              ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
              : "border-[#D5DCE6] focus:border-[#1787D4] focus:ring-[#1787D4]/15"
          }`}
        />
        {error ? (
          <p className="text-xs text-[#C21F1F] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        ) : (
          <p className="text-xs text-[#5A6A85]">
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
      iconClassName="bg-[#FFF4E0] text-[#9A5B00] border-[#E8900A]/25"
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
        <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            All data, applications and configuration on this server will be
            erased. This cannot be undone.
          </span>
        </div>

        <div>
          <label className="text-sm font-medium text-[#031033] block mb-1.5">
            New operating system
          </label>

          {imagesQuery.isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Loading images">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="h-14 rounded-lg bg-[#EEF2F7] animate-pulse" />
              ))}
            </div>
          )}

          {imagesQuery.isError && (
            <p className="text-xs text-[#C21F1F] py-2">
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
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-[#1787D4] bg-[#E8F4FC] ring-2 ring-[#1787D4]/15"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6]"
                    }`}
                  >
                    <Terminal
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selected ? "text-[#1787D4]" : "text-[#5A6A85]"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#031033] truncate">
                        {entry.label}
                      </span>
                      <span className="block text-xs font-mono text-[#5A6A85] truncate">
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
          <span className="text-sm text-[#5A6A85] leading-relaxed">
            I understand that everything on this server will be permanently
            erased.
          </span>
        </label>

        {error && (
          <p className="text-xs text-[#C21F1F] flex items-center gap-1">
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
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] px-4 py-3">
            <span className="text-xs text-[#5A6A85] block">
              Current plan
            </span>
            <p className="text-sm font-medium text-[#031033] mt-0.5">
              {currentPlan.name}
            </p>
            <p className="text-xs text-[#5A6A85]">
              {currentPlan.cpu} vCPU · {currentPlan.ramGb} GB RAM ·{" "}
              {currentPlan.diskGb} GB disk
            </p>
          </div>
        )}

        {plansQuery.isLoading && (
          <div className="flex flex-col gap-2" aria-label="Loading plans">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-16 rounded-lg bg-[#EEF2F7] animate-pulse" />
            ))}
          </div>
        )}

        {plansQuery.isError && (
          <p className="text-xs text-[#C21F1F]">
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
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-[#1787D4] bg-[#E8F4FC] ring-2 ring-[#1787D4]/15"
                      : disabled
                        ? "border-[#E2E8F0] bg-[#F2F5FC] opacity-60 cursor-not-allowed"
                        : "border-[#E2E8F0] hover:border-[#D5DCE6]"
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

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#031033]">
                        {plan.name}
                      </span>
                      {isCurrent && (
                        <span className="whitespace-nowrap text-xs font-medium text-[#5A6A85]">
                          Current
                        </span>
                      )}
                      {shrinksDisk && (
                        <span className="whitespace-nowrap text-xs font-medium text-[#C21F1F]">
                          Cannot shrink disk
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-[#5A6A85] mt-0.5">
                      {plan.cpu} vCPU · {plan.ramGb} GB RAM · {plan.diskGb} GB
                      disk
                    </span>
                  </span>

                  <span className="text-sm font-semibold text-[#031033] tabular-nums text-right shrink-0">
                    {formatNaira(plan.priceNgnMonthly)}
                    <span className="block text-xs font-normal text-[#5A6A85] text-right">
                      /month
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-lg border border-[#EEF2F7] bg-[#F2F5FC] px-4 py-3 text-xs text-[#5A6A85] leading-relaxed">
          Resizing requires the server to be stopped. Your next renewal uses the
          new plan price; no prorated difference is charged now. Disks cannot be
          shrunk later.
        </div>

        {targetPlan && currentPlan && (
          <p className="text-xs text-[#5A6A85]">
            New monthly price:{" "}
            <strong className="font-semibold text-[#031033] tabular-nums">
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
          <p className="text-xs text-[#C21F1F] flex items-center gap-1">
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
      iconClassName="bg-[#FDECEC] text-[#C21F1F] border-[#DC2626]/20"
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
        <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            The server and all of its data will be destroyed. This cancels
            future billing and cannot be undone.
          </span>
        </div>

        <div>
          <label className="text-sm font-medium text-[#031033] block mb-1.5">
            Type <span className="font-mono">{server.name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15 transition-colors"
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
  const payment = usePaymentMethod();

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
            onClick={() => mutate({ id: server.id, provider: payment.method })}
            disabled={isPending || price <= 0}
            className={primaryButton}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Redirecting…
              </>
            ) : (
              payLabel(payment.method, formatNaira(price))
            )}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] divide-y divide-[#EEF2F7]">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-[#5A6A85]">Plan</span>
            <span className="font-medium text-[#031033]">
              {server.plan?.name ?? "VPS"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-[#5A6A85]">Current paid until</span>
            <span className="text-[#031033] tabular-nums">
              {formatVpsDate(server.nextBillingAt)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-[#5A6A85]">New paid until</span>
            <span className="font-medium text-[#031033] tabular-nums">
              {newBillingAt
                ? formatVpsDate(newBillingAt.toISOString())
                : "30 days after payment"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#5A6A85]">Amount due</span>
            <span className="text-lg font-semibold text-[#031033] tabular-nums">
              {formatNaira(price)}
            </span>
          </div>
        </div>

        <PaymentMethodSelector {...payment} variant="compact" disabled={isPending} />

        <p className="text-xs text-[#5A6A85] leading-relaxed">
          Adds 30 days to your current billing period. You will complete the
          payment securely on {GATEWAY_NAME[payment.method]}, and the renewal is
          applied as soon as payment is confirmed.
        </p>

        <p className="text-xs text-[#5A6A85] leading-relaxed">
          {humanizeImage(server.image)} · {locationLabel(server.location)}
        </p>

        {server.status === "SUSPENDED" && (
          <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This server was suspended for non-payment. It will be powered back
              on automatically after the payment is confirmed.
            </span>
          </div>
        )}

        {price <= 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] px-4 py-3 text-sm text-[#9A5B00]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
