import { useQuery } from "@tanstack/react-query";
import { getPlans } from "@/lib/api";

export const usePlans = () =>
  useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (res) => res.data,
  });
