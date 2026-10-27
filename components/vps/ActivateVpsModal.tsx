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
            className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e8e8ed] text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !canProvision}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1787D4] hover:bg-[#1371B5] text-white text-[12.5px] font-semibold transition-colors disabled:opacity-60"
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
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              We could not read the configuration for this order. Please contact
              support with your payment reference before trying again.
            </span>
          </div>
        )}

        <div className="rounded-lg border border-[#e8e8ed] bg-[#fbfcfe] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
              Plan
            </span>
            <span className="text-[13px] font-semibold text-[#1d1d1f] block mt-0.5">
              {item.vpsPlan?.name ?? "VPS plan"}
            </span>
            {item.vpsPlan && (
              <span className="text-[11px] text-[#6e6e73]">
                {item.vpsPlan.cpu} vCPU · {item.vpsPlan.ramGb} GB RAM ·{" "}
                {item.vpsPlan.diskGb} GB disk
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
              Paid
            </span>
            <span className="text-[13px] font-semibold text-[#1d1d1f] block mt-0.5">
              ₦{item.price.toLocaleString("en-NG")}
            </span>
            <span className="text-[11px] text-emerald-700 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Covered by your order
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
              Operating system
            </span>
            <span className="text-[12.5px] font-medium text-[#1d1d1f] block mt-0.5">
              {humanizeImage(config?.image)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9bb2] block">
              Location
            </span>
            <span className="text-[12.5px] font-medium text-[#1d1d1f] mt-0.5 inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1787D4]" />
              {locationLabel(config?.location)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#1d1d1f] block mb-1.5">
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
            className="w-full rounded-lg border border-[#e8e8ed] bg-white px-3 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#1787D4] transition-colors"
          />
          <p className="text-[10.5px] text-[#8a9bb2] mt-1">
            3–40 characters. Shown only in your dashboard.
          </p>
        </div>

        <SshKeyPicker selectedId={sshKeyId} onSelect={setSshKeyId} />

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-[#6e6e73] bg-[#f8fafc] border border-[#eef2f8] rounded-lg px-3.5 py-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1787D4] shrink-0" />
          <span>
            Your selected SSH key is attached to the server. Nupat never stores
            or emails the provider&apos;s root password.
          </span>
        </div>
      </div>
    </VpsModal>
  );
}
