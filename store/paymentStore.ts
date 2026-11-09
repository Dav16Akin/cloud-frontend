import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentProvider } from "@/lib/api";

type PaymentStore = {
  /** The gateway the customer last picked. Read it through usePaymentMethod. */
  preferred: PaymentProvider;
  setPreferred: (provider: PaymentProvider) => void;
};

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      preferred: "paystack",
      setPreferred: (preferred) => set({ preferred }),
    }),
    { name: "payment-method" },
  ),
);
