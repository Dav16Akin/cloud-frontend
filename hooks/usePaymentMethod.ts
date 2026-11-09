import { useQuery } from "@tanstack/react-query";
import { getPaymentAvailability, type PaymentProvider } from "@/lib/api";
import { usePaymentStore } from "@/store/paymentStore";

export type PaymentMethodState = {
  /** The gateway to send with the payment request. */
  method: PaymentProvider;
  setMethod: (provider: PaymentProvider) => void;
  /** False until the backend confirms Heleket is configured. */
  cryptoAvailable: boolean;
};

/**
 * The customer's chosen gateway, remembered across checkouts. Falls back to
 * Paystack whenever crypto isn't available (or availability is unknown).
 */
export const usePaymentMethod = (): PaymentMethodState => {
  const { data } = useQuery({
    queryKey: ["payment-availability"],
    queryFn: getPaymentAvailability,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const preferred = usePaymentStore((s) => s.preferred);
  const setMethod = usePaymentStore((s) => s.setPreferred);
  const cryptoAvailable = data?.heleket === true;

  return {
    method: cryptoAvailable && preferred === "heleket" ? "heleket" : "paystack",
    setMethod,
    cryptoAvailable,
  };
};
