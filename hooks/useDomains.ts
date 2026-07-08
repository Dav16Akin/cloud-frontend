import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRegisteredDomains,
  getDomainById,
  getDomainDNSRecords,
  createDomainDNSRecord,
  updateDomainDNSRecord,
  deleteDomainDNSRecord,
  updateNameservers,
  checkTransferEligibility,
  getTransfers,
  getTransferStatus,
  getDomainAuthCode,
  type RegisteredDomain,
  type CreateDNSRecordPayload,
  type UpdateDNSRecordPayload,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const useGetRegisteredDomains = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["registered-domains"],
    queryFn: async () => {
      if (!token) return [];

      const domains: RegisteredDomain[] = [];
      const seen = new Set<string>();

      // 1. Try to fetch from real /domains endpoint
      try {
        const res = await getRegisteredDomains(token);
        if (res?.success && Array.isArray(res.data)) {
          res.data.forEach((d: any) => {
            const domainName = d.name ?? d.domain;
            if (domainName && !seen.has(domainName)) {
              seen.add(domainName);
              domains.push({
                id: d.id,
                domain: domainName,
                status: d.status,
                registrationDate: d.registeredAt ?? d.registrationDate,
                expiryDate: d.expiresAt ?? d.expiryDate,
                autoRenew: d.autoRenew ?? true,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Failed to fetch registered domains from API, falling back to local storage:", err);
      }

      // 3. Load from localStorage (for newly purchased domains in the current browser session)
      try {
        const localData = localStorage.getItem("nupat-registered-domains");
        if (localData) {
          const list: string[] = JSON.parse(localData);
          list.forEach((domainStr, index) => {
            if (domainStr && !seen.has(domainStr)) {
              seen.add(domainStr);
              domains.push({
                id: `local-${index}`,
                domain: domainStr,
                status: "ACTIVE",
                registrationDate: new Date().toISOString().split("T")[0],
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                autoRenew: true,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Failed to read registered domains from localStorage:", err);
      }

      return domains;
    },
    enabled: !!token,
    staleTime: 60 * 1000,
  });
};

export const useGetDomainById = (id: string | null) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["registered-domain", id],
    queryFn: () => getDomainById(token!, id!),
    enabled: !!token && !!id,
    staleTime: 60 * 1000,
    select: (res): RegisteredDomain => {
      const d = res.data as any;
      return {
        id: d.id,
        domain: d.name ?? d.domain,
        status: d.status,
        // Backend may return registeredAt/expiresAt — normalise to our type
        registrationDate: d.registeredAt ?? d.registrationDate ?? "",
        expiryDate: d.expiresAt ?? d.expiryDate ?? "",
        autoRenew: d.autoRenew ?? true,
        // Pass through nameservers array if present
        nameservers: Array.isArray(d.nameservers) ? d.nameservers : undefined,
      };
    },
  });
};

// ── Domain DNS Records ────────────────────────────────────────────────────────

export const useGetDomainDNSRecords = (id: string) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["domain-dns", id],
    queryFn: () => getDomainDNSRecords(id),
    enabled: !!token && !!id,
    staleTime: 30 * 1000,
    select: (res) => res.data,
  });
};

export const useCreateDomainDNSRecord = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDNSRecordPayload) => createDomainDNSRecord(id, data),
    onSuccess: () => {
      toast.success("DNS record created.");
      queryClient.invalidateQueries({ queryKey: ["domain-dns", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useUpdateDomainDNSRecord = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ line, ...data }: UpdateDNSRecordPayload) =>
      updateDomainDNSRecord(id, line, { line, ...data }),
    onSuccess: () => {
      toast.success("DNS record updated.");
      queryClient.invalidateQueries({ queryKey: ["domain-dns", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteDomainDNSRecord = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (line: number) => deleteDomainDNSRecord(id, line),
    onSuccess: () => {
      toast.success("DNS record deleted.");
      queryClient.invalidateQueries({ queryKey: ["domain-dns", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Update Nameservers ──────────────────────────────────────────────────────

export const useUpdateNameservers = (domainId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nameservers: string[]) => updateNameservers(domainId, nameservers),
    onSuccess: () => {
      toast.success("Nameservers updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["registered-domain", domainId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Domain Transfer Hooks ───────────────────────────────────────────────────

export const useCheckTransferEligibility = () => {
  return useMutation({
    mutationFn: (data: { domainName: string; authCode: string }) => checkTransferEligibility(data),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to check domain transfer eligibility.");
    },
  });
};

export const useGetTransfers = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["domain-transfers"],
    queryFn: () => getTransfers(),
    enabled: !!token,
    staleTime: 30 * 1000,
    select: (res) => res.data || [],
  });
};

export const useGetTransferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getTransferStatus(id),
    onSuccess: () => {
      toast.success("Transfer status updated.");
      queryClient.invalidateQueries({ queryKey: ["domain-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["registered-domains"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to check transfer status.");
    },
  });
};

export const useGetDomainAuthCode = (domainId: string) => {
  return useMutation({
    mutationFn: () => getDomainAuthCode(domainId),
    onSuccess: () => {
      toast.success("Authorization code retrieved successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to retrieve authorization code.");
    },
  });
};

