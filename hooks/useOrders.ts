import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrders,
  getInvoiceLink,
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

// ── Verify payment by reference with safe polling & idempotency ─────────────

export interface UseVerifyPaymentOptions {
  enabled?: boolean;
  maxPolls?: number; // default 6 polls (~21s)
  pollIntervalMs?: number; // default 3500ms
}

export const useVerifyPayment = (
  reference: string | null,
  options?: UseVerifyPaymentOptions,
) => {
  const token = useAuthStore((s) => s.token);
  const maxPolls = options?.maxPolls ?? 6;
  const pollIntervalMs = options?.pollIntervalMs ?? 3500;

  const [pollCount, setPollCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);

  const query = useQuery({
    queryKey: ["order-verify", reference],
    queryFn: () => verifyPayment(token, reference!),
    enabled: (options?.enabled ?? true) && !!reference,
    // Do not let react-query retry blindly on errors; polling logic controls retry cadence
    retry: false,
    select: (res) => res.data,
    refetchInterval: (q) => {
      const data = q.state.data?.data ?? q.state.data;
      const status = (data as any)?.status;

      // Final status reached — stop polling immediately
      if (
        status === "PAID" ||
        status === "ALREADY_VERIFIED" ||
        status === "COMPLETED" ||
        status === "FAILED" ||
        status === "CANCELLED"
      ) {
        return false;
      }

      // If pending or no data yet, poll up to maxPolls safely
      if (pollCount < maxPolls) {
        return pollIntervalMs;
      }

      return false;
    },
  });

  // Increment poll count on each background fetch
  useEffect(() => {
    if (query.isFetching && !query.isLoading) {
      setPollCount((c) => c + 1);
    }
  }, [query.isFetching, query.isLoading]);

  // Reset poll count if reference changes
  useEffect(() => {
    setPollCount(0);
  }, [reference]);

  const rawStatus = (query.data as any)?.status;
  const isPaid =
    rawStatus === "PAID" ||
    rawStatus === "ALREADY_VERIFIED" ||
    rawStatus === "COMPLETED";
  const isFailed = rawStatus === "FAILED" || rawStatus === "CANCELLED";
  const isPendingStatus = rawStatus === "PENDING" || (!isPaid && !isFailed && !query.isError && !!query.data);
  const isExhausted = !isPaid && !isFailed && pollCount >= maxPolls;

  const checkStatusNow = async () => {
    if (isManualChecking) return;
    setIsManualChecking(true);
    try {
      await query.refetch();
    } finally {
      setIsManualChecking(false);
    }
  };

  return {
    ...query,
    isPaid,
    isFailed,
    isPendingStatus,
    isExhausted,
    pollCount,
    maxPolls,
    isManualChecking,
    checkStatusNow,
  };
};

// ── Invalidate orders list (call after a payment is confirmed) ────────────────

export const useInvalidateOrders = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["orders"] });
};

// ── View invoice on WHMCS ─────────────────────────────────────────────────────

export const useGetInvoiceLink = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await getInvoiceLink(orderId);
      // Open the WHMCS invoice in a new tab
      window.open(res.data.url, "_blank", "noopener,noreferrer");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to get invoice link");
    },
  });
};

