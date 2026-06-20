import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrders,
  initializeCartPayment,
  verifyPayment,
  type Order,
  type BackendCartItem,
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

// ── Initialize cart payment (redirects to Paystack) ───────────────────────────

export const useInitializeCartPayment = () => {
  return useMutation({
    mutationFn: (items: BackendCartItem[]) =>
      initializeCartPayment({ items }),
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

// ── Invalidate orders list (call after a payment is confirmed) ────────────────

export const useInvalidateOrders = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["orders"] });
};
