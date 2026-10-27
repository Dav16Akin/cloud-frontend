import type { VpsStatus } from "@/lib/api";

export const VPS_LOCATION_LABELS: Record<
  string,
  { name: string; country: string; code: string }
> = {
  fsn1: { name: "Falkenstein", country: "Germany", code: "DE" },
  nbg1: { name: "Nuremberg", country: "Germany", code: "DE" },
  hel1: { name: "Helsinki", country: "Finland", code: "FI" },
};

export const VPS_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9 ._-]*$/;

export function validateVpsName(name: string): string | null {
  const value = name.trim();
  if (value.length < 3) return "Name must be at least 3 characters";
  if (value.length > 40) return "Name must be at most 40 characters";
  if (!VPS_NAME_PATTERN.test(value)) {
    return "Use letters, numbers, spaces, dots, hyphens or underscores";
  }
  return null;
}

export function formatNaira(amount: number) {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

export function formatVpsDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatVpsDateTime(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function humanizeImage(image?: string | null) {
  if (!image) return "—";
  return image
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\b(\d+)\.(\d+)\b/g, "$1.$2");
}

export function locationLabel(location?: string | null) {
  if (!location) return "—";
  const entry = VPS_LOCATION_LABELS[location];
  return entry ? `${entry.name}, ${entry.country}` : location;
}

export function locationCode(location?: string | null) {
  if (!location) return "";
  return VPS_LOCATION_LABELS[location]?.code ?? "";
}

export function daysUntil(iso?: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function vpsStatusLabel(status?: VpsStatus | string | null) {
  switch ((status ?? "").toUpperCase()) {
    case "PROVISIONING":
      return "Provisioning";
    case "RUNNING":
      return "Running";
    case "STOPPED":
      return "Stopped";
    case "REBOOTING":
      return "Rebooting";
    case "REBUILDING":
      return "Rebuilding";
    case "SUSPENDED":
      return "Suspended";
    case "FAILED":
      return "Failed";
    case "DELETING":
      return "Deleting";
    case "DELETED":
      return "Deleted";
    default:
      return status ?? "Unknown";
  }
}

export function nextBillingDate(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export const SSH_PUBLIC_KEY_PATTERN =
  /^(ssh-(rsa|ed25519)|ecdsa-sha2-nistp(256|384|521)|sk-(ssh-ed25519|ecdsa-sha2-nistp256)@openssh\.com)\s+AAAA[0-9A-Za-z+/]+=*(\s+.+)?$/;
