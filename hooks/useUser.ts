import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const useGetMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(token!),
    enabled: !!token, // only runs if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};