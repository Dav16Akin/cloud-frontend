import { useQuery } from "@tanstack/react-query";
import { getRegisteredDomains, getHosting, type RegisteredDomain } from "@/lib/api";
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
          res.data.forEach((d) => {
            if (d.domain && !seen.has(d.domain)) {
              seen.add(d.domain);
              domains.push(d);
            }
          });
        }
      } catch (err) {
        console.warn("Failed to fetch registered domains from API, falling back to local storage and hosting accounts:", err);
      }

      // 2. Fetch from user's hosting accounts to extract domains
      try {
        const hostingRes = await getHosting(token);
        if (hostingRes?.success && Array.isArray(hostingRes.data)) {
          hostingRes.data.forEach((acct, index) => {
            if (acct.domain && !seen.has(acct.domain)) {
              seen.add(acct.domain);
              domains.push({
                id: `hosting-${acct.id || index}`,
                domain: acct.domain,
                status: (acct.status === "ACTIVE" ? "ACTIVE" : "PENDING") as "ACTIVE" | "PENDING",
                registrationDate: acct.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                autoRenew: true,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Failed to fetch hosting accounts for fallback:", err);
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
