import { useQuery } from "@tanstack/react-query";
import { getBillingOverview } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const useGetBillingOverview = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["billing-overview"],
    queryFn: () => getBillingOverview(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 min
    select: (res) => res.data,
  });
};
