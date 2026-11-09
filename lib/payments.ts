import { toast } from "sonner";
import { ApiError, type PaymentProvider } from "@/lib/api";

export const GATEWAY_NAME: Record<PaymentProvider, string> = {
  paystack: "Paystack",
  heleket: "Heleket",
};

/** Normalises the backend's "PAYSTACK"/"HELEKET" (or a query param) to a provider. */
export const toPaymentProvider = (value?: string | null): PaymentProvider =>
  value?.toLowerCase() === "heleket" ? "heleket" : "paystack";

/**
 * Which gateway an order or invoice was paid through. Invoices don't carry
 * `paymentProvider`, but every Heleket reference the backend creates starts
 * with "hlk_", so the reference is a reliable fallback.
 */
export const providerOf = (record: {
  paymentProvider?: string | null;
  paystackRef?: string | null;
}): PaymentProvider =>
  record.paymentProvider
    ? toPaymentProvider(record.paymentProvider)
    : record.paystackRef?.startsWith("hlk_")
      ? "heleket"
      : "paystack";

/** "Connecting to Paystack…" / "Connecting to Heleket…" */
export const connectingLabel = (provider: PaymentProvider) =>
  `Connecting to ${GATEWAY_NAME[provider]}…`;

/** "Pay ₦5,000 with Paystack" / "Pay ₦5,000 in crypto" */
export const payLabel = (provider: PaymentProvider, amount: string) =>
  provider === "heleket" ? `Pay ${amount} in crypto` : `Pay ${amount} with Paystack`;

/** Sends the browser to the gateway's hosted payment page. */
export function redirectToPayment(data: { paymentUrl?: string; provider?: PaymentProvider }) {
  if (!data.paymentUrl) {
    toast.error("Payment could not be started: no payment link was returned. Please try again.");
    return false;
  }
  toast.success(`Redirecting to ${GATEWAY_NAME[data.provider ?? "paystack"]}…`);
  window.location.href = data.paymentUrl;
  return true;
}

/**
 * Retrying an order while its crypto payment is still confirming answers
 * 409 PAYMENT_IN_PROGRESS with the current reference.
 */
export const paymentInProgressReference = (err: unknown): string | null => {
  if (!(err instanceof ApiError) || err.code !== "PAYMENT_IN_PROGRESS") return null;
  const reference = err.data?.data?.reference;
  return typeof reference === "string" ? reference : null;
};

export const verifyPath = (reference: string, provider: PaymentProvider) =>
  `/dashboard/orders/verify?${new URLSearchParams({ reference, provider })}`;
