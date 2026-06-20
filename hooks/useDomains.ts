import { useQuery } from "@tanstack/react-query";
import { getRegisteredDomains, getDomainById, getHosting, type RegisteredDomain } from "@/lib/api";
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
    select: (res) => res.data,
  });
};
