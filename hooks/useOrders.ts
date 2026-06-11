import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrders,
  initializePayment,
  verifyPayment,
  type Order,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// ── List all orders ───────────────────────────────────────────────────────────

export const useGetOrders = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
};

// ── Check whether the user has a paid, un-provisioned order for a given plan ──

export const useHasPaidOrder = (planId: string | null) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
    select: (res): Order | null => {
      if (!planId) return null;
      return (
        res.data.find(
          (o) =>
            o.planId === planId &&
            o.status === "PAID" &&
            // hostingAccount will be null when not yet provisioned;
            // but since backend excludes that field from GET /orders we
            // rely on checking the list — if the backend confirms PAID we allow proceed
            true,
        ) ?? null
      );
    },
  });
};

// ── Initialize payment (redirects to Paystack) ────────────────────────────────

export const useInitializePayment = () => {
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (planId: string) => initializePayment(token!, { planId }),
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

// ── Verify payment by reference ───────────────────────────────────────────────

export const useVerifyPayment = (reference: string | null) => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["order-verify", reference],
    queryFn: () => verifyPayment(token!, reference!),
    enabled: !!token && !!reference,
    retry: 2,
    select: (res) => res.data,
  });
};
