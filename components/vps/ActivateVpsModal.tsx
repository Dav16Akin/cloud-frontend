"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Cloud,
  Loader2,
  MapPin,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useCreateVps } from "@/hooks/useVps";
import type { OrderItem, VpsServer } from "@/lib/api";
import { SshKeyPicker } from "./SshKeyManager";
import VpsModal from "./VpsModal";
import {
  humanizeImage,
  locationLabel,
  validateVpsName,
} from "./vps-utils";

/**
 * Completes a VPS purchase that was paid for but not provisioned yet.
 * The OS and location are locked to the paid order configuration.
 */
export default function ActivateVpsModal({
  item,
  onClose,
  onActivated,
}: {
  item: OrderItem;
  onClose: () => void;
  onActivated: (server: VpsServer) => void;
}) {
  const config = item.vpsConfig;
  const suggestedName =
    config?.name?.trim() || `${item.vpsPlan?.name ?? "New"} server`;

  const [name, setName] = useState(suggestedName.slice(0, 40));
  const [sshKeyId, setSshKeyId] = useState(config?.sshKeyId ?? "");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateVps({
    onSuccess: (res) => {
      if (res?.data) onActivated(res.data);
    },
  });

  const canProvision = !!item.vpsPlanId && !!config;

  const submit = () => {
    const nameError = validateVpsName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    if (!sshKeyId) {
      setError("Select or add an SSH key. Root passwords are never stored.");
      return;
    }
    if (!item.vpsPlanId || !config) {
      setError(
        "This order is missing its server configuration. Please contact support.",
      );
      return;
    }

    setError(null);
    mutate({
      planId: item.vpsPlanId,
      image: config.image,
      location: config.location,
      name: name.trim(),
      sshKeyId,
      orderItemId: item.id,
    });
  };

  return (
    <VpsModal
      title="Finish setting up your VPS"
      description="Your payment is already confirmed. Creating the server will not charge you again."
      icon={Cloud}
      onClose={onClose}
      busy={isPending}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !canProvision}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Server className="w-3.5 h-3.5" />
            )}
            {isPending ? "Creating server…" : "Create server"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {!canProvision && (
          <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              We could not read the configuration for this order. Please contact
              support with your payment reference before trying again.
            </span>
          </div>
        )}

        <div className="rounded-lg border border-[#E2E8F0] bg-[#F2F5FC] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-[#5A6A85] block">
              Plan
            </span>
            <span className="text-sm font-semibold text-[#031033] block mt-0.5">
              {item.vpsPlan?.name ?? "VPS plan"}
            </span>
            {item.vpsPlan && (
              <span className="text-xs text-[#5A6A85]">
                {item.vpsPlan.cpu} vCPU · {item.vpsPlan.ramGb} GB RAM ·{" "}
                {item.vpsPlan.diskGb} GB disk
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-[#5A6A85] block">
              Paid
            </span>
            <span className="text-sm font-semibold text-[#031033] tabular-nums block mt-0.5">
              ₦{item.price.toLocaleString("en-NG")}
            </span>
            <span className="text-xs text-[#5A6A85] inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-[#12A150]" /> Covered by your order
            </span>
          </div>
          <div>
            <span className="text-xs text-[#5A6A85] block">
              Operating system
            </span>
            <span className="text-sm font-medium text-[#031033] block mt-0.5">
              {humanizeImage(config?.image)}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#5A6A85] block">
              Location
            </span>
            <span className="text-sm font-medium text-[#031033] mt-0.5 inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5A6A85]" />
              {locationLabel(config?.location)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#031033] block mb-1.5">
            Server name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            maxLength={40}
            className="w-full h-10 rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15 transition-colors"
          />
          <p className="text-xs text-[#5A6A85] mt-1.5">
            3–40 characters. Shown only in your dashboard.
          </p>
        </div>

        <SshKeyPicker selectedId={sshKeyId} onSelect={setSshKeyId} />

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-[#FDECEC] px-4 py-3 text-sm text-[#C21F1F]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-[#5A6A85] bg-[#F2F5FC] border border-[#EEF2F7] rounded-lg px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-[#5A6A85] shrink-0" />
          <span>
            Your selected SSH key is attached to the server. Nupat never stores
            or emails the provider&apos;s root password.
          </span>
        </div>
      </div>
    </VpsModal>
  );
}
