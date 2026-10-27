import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSshKey,
  createVpsServer,
  deleteSshKey,
  deleteVpsServer,
  getSshKeys,
  getVpsActions,
  getVpsFirewall,
  getVpsImages,
  getVpsLocations,
  getVpsPlans,
  getVpsServer,
  getVpsServers,
  rebootVpsServer,
  rebuildVpsServer,
  renameVpsServer,
  renewVpsServer,
  resizeVpsServer,
  startVpsServer,
  stopVpsServer,
  updateVpsFirewall,
  type CreateVpsPayload,
  type VpsFirewallRule,
  type VpsServer,
  type VpsStatus,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const ACTIVE_STATUSES: VpsStatus[] = [
  "PROVISIONING",
  "REBOOTING",
  "REBUILDING",
  "DELETING",
];

const isBusy = (status?: string | null) =>
  ACTIVE_STATUSES.includes((status ?? "").toUpperCase() as VpsStatus);

// ── Recent VPS purchase marker ────────────────────────────────────────────────
//
// Paystack returns to /dashboard/orders/verify. We keep the plan summary here
// so the VPS dashboard can greet the customer with a setup card immediately,
// even before the orders query has settled.

export interface RecentVpsPurchase {
  reference: string;
  planId?: string;
  planName?: string;
  image?: string;
  location?: string;
  name?: string;
  timestamp: number;
}

const RECENT_VPS_KEY = "recent_vps_purchase";
const RECENT_VPS_TTL_MS = 60 * 60 * 1000;

export function getRecentVpsPurchase(): RecentVpsPurchase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECENT_VPS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecentVpsPurchase;
    if (!parsed?.reference || Date.now() - parsed.timestamp > RECENT_VPS_TTL_MS) {
      sessionStorage.removeItem(RECENT_VPS_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setRecentVpsPurchase(
  data: Omit<RecentVpsPurchase, "timestamp">,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      RECENT_VPS_KEY,
      JSON.stringify({ ...data, timestamp: Date.now() }),
    );
  } catch {
    // Session storage can be unavailable in hardened browsers.
  }
}

export function clearRecentVpsPurchase() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECENT_VPS_KEY);
  } catch {
    // Ignore.
  }
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export const useVpsPlans = () => {
  // The catalogue is public so the marketing page can show live prices.
  // Checkout and the dashboard reuse the same query key.
  return useQuery({
    queryKey: ["vps-plans"],
    queryFn: () => getVpsPlans(),
    staleTime: 60 * 1000,
    select: (res) => res.data ?? [],
  });
};

export const useVpsImages = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps-images"],
    queryFn: () => getVpsImages(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data ?? [],
  });
};

export const useVpsLocations = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps-locations"],
    queryFn: () => getVpsLocations(),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    select: (res) => res.data ?? [],
  });
};

// ── Servers ───────────────────────────────────────────────────────────────────

export const useGetVpsServers = (options?: {
  refetchInterval?: number | false;
}) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps"],
    queryFn: () => getVpsServers({ limit: 50 }),
    enabled: !!token,
    staleTime: 15 * 1000,
    select: (res) => res.data?.items ?? [],
    refetchInterval:
      options?.refetchInterval ??
      ((query) => {
        const items: VpsServer[] = query.state.data?.data?.items ?? [];
        return items.some((server) => isBusy(server.status)) ? 7000 : false;
      }),
  });
};

export const useGetVpsServer = (
  id: string,
  options?: { refetchInterval?: number | false },
) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps", id],
    queryFn: () => getVpsServer(id),
    enabled: !!token && !!id,
    staleTime: 10 * 1000,
    select: (res) => res.data,
    refetchInterval:
      options?.refetchInterval ??
      ((query) => {
        const server = query.state.data?.data;
        return isBusy(server?.status) ? 6000 : false;
      }),
  });
};

export const useGetVpsActions = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps", id, "actions"],
    queryFn: () => getVpsActions(id, { limit: 25 }),
    enabled: !!token && !!id,
    staleTime: 15 * 1000,
    select: (res) => res.data?.items ?? [],
  });
};

export const useGetVpsFirewall = (id: string, enabled = true) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps", id, "firewall"],
    queryFn: () => getVpsFirewall(id),
    enabled: !!token && !!id && enabled,
    staleTime: 30 * 1000,
    select: (res) => res.data,
  });
};

export const useGetSshKeys = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["vps-ssh-keys"],
    queryFn: () => getSshKeys(),
    enabled: !!token,
    staleTime: 60 * 1000,
    select: (res) => res.data ?? [],
  });
};

// ── Server mutations ──────────────────────────────────────────────────────────

type CreateVpsResult = Awaited<ReturnType<typeof createVpsServer>>;

export const useCreateVps = (options?: {
  onSuccess?: (res: CreateVpsResult) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVpsPayload) => createVpsServer(data),
    onSuccess: (res) => {
      toast.success(res?.message || "Your server is being created.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      options?.onSuccess?.(res);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useStartVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startVpsServer(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Server is starting.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useStopVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      stopVpsServer(id, { force: options?.force }),
    onSuccess: (res) => {
      toast.success(res?.message || "Server is stopping.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useRebootVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rebootVpsServer(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Server is rebooting.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useRebuildVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (image: string) => rebuildVpsServer(id, image),
    onSuccess: (res) => {
      toast.success(res?.message || "Server is rebuilding.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useResizeVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => resizeVpsServer(id, planId),
    onSuccess: (res) => {
      toast.success(res?.message || "Server is being resized.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useRenameVps = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => renameVpsServer(id, name),
    onSuccess: (res) => {
      toast.success(res?.message || "Server renamed.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteVps = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVpsServer(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Server deleted.");
      queryClient.invalidateQueries({ queryKey: ["vps"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      options?.onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useRenewVps = () => {
  return useMutation({
    mutationFn: (id: string) => renewVpsServer(id),
    onSuccess: (res) => {
      if (res.data?.paymentUrl) {
        toast.success("Redirecting to payment…");
        window.location.href = res.data.paymentUrl;
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateVpsFirewall = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rules: VpsFirewallRule[]) => updateVpsFirewall(id, rules),
    onSuccess: (res) => {
      toast.success(res?.message || "Firewall updated.");
      queryClient.setQueryData(["vps", id, "firewall"], res);
      queryClient.invalidateQueries({ queryKey: ["vps", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

// ── SSH keys ──────────────────────────────────────────────────────────────────

export const useCreateSshKey = (options?: {
  onSuccess?: (res: Awaited<ReturnType<typeof createSshKey>>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; publicKey: string }) =>
      createSshKey(data),
    onSuccess: (res) => {
      toast.success(res?.message || "SSH key added.");
      queryClient.invalidateQueries({ queryKey: ["vps-ssh-keys"] });
      options?.onSuccess?.(res);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteSshKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSshKey(id),
    onSuccess: (res) => {
      toast.success(res?.message || "SSH key removed.");
      queryClient.invalidateQueries({ queryKey: ["vps-ssh-keys"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
