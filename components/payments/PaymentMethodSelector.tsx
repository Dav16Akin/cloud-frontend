"use client";

import Image from "next/image";
import { Coins, CreditCard } from "lucide-react";
import type { PaymentProvider } from "@/lib/api";
import type { PaymentMethodState } from "@/hooks/usePaymentMethod";

type Option = {
  id: PaymentProvider;
  title: string;
  description: string;
};

const OPTIONS: Option[] = [
  {
    id: "paystack",
    title: "Paystack",
    description: "Debit/credit card, bank transfer, or USSD in naira",
  },
  {
    id: "heleket",
    title: "Crypto",
    description: "Pay the USD equivalent in a cryptocurrency of your choice, via Heleket",
  },
];

const SELECTED = "border-[#1787D4] ring-1 ring-[#1787D4] bg-[#E8F4FC]";
const IDLE = "border-[#D5DCE6] bg-white hover:bg-[#F2F5FC]";

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`w-4 h-4 rounded-full shrink-0 bg-white ${
        checked ? "border-[5px] border-[#1787D4]" : "border border-[#9AA6B8]"
      }`}
    />
  );
}

function OptionMark({ id, size }: { id: PaymentProvider; size: "full" | "compact" }) {
  if (id === "paystack" && size === "full") {
    return (
      <div className="h-7 w-[110px] flex items-center shrink-0">
        <Image
          src="/paystack-logo.png"
          alt=""
          width={110}
          height={28}
          className="h-7 w-auto object-contain"
        />
      </div>
    );
  }
  const Icon = id === "paystack" ? CreditCard : Coins;
  return <Icon aria-hidden className="w-4 h-4 text-[#5A6A85] shrink-0" />;
}

/** Shown under the picker when crypto is selected. */
export function CryptoPaymentNote({ className = "" }: { className?: string }) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border border-[#E8900A]/25 bg-[#FFF4E0] text-xs text-[#9A5B00] ${className}`}
    >
      <p className="font-medium text-sm mb-0.5">Before you pay with crypto</p>
      <p>
        Heleket shows the exact amount and network after you continue. Send
        that amount on that network: an underpayment is held for review. Your
        order activates once the network confirms the payment, usually within
        a few minutes. Crypto payments can&apos;t be refunded automatically.
      </p>
    </div>
  );
}

/**
 * Lets the customer pick Paystack or crypto (Heleket).
 *
 * - `full`: the checkout-page card. With crypto unavailable it shows the
 *   single Paystack option, as before.
 * - `compact`: for modals. Renders nothing when Paystack is the only option.
 */
export function PaymentMethodSelector({
  method,
  setMethod,
  cryptoAvailable,
  variant = "full",
  disabled = false,
}: PaymentMethodState & { variant?: "full" | "compact"; disabled?: boolean }) {
  const options = cryptoAvailable ? OPTIONS : OPTIONS.slice(0, 1);

  if (variant === "compact") {
    if (!cryptoAvailable) return null;
    return (
      <fieldset className="flex flex-col gap-2" disabled={disabled}>
        <legend className="text-sm font-medium text-[#031033] mb-2">Pay with</legend>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const checked = method === option.id;
            return (
              <label
                key={option.id}
                className={`flex items-center gap-2.5 h-10 px-3 rounded-lg border text-sm text-[#031033] cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1787D4]/30 ${
                  checked ? SELECTED : IDLE
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={option.id}
                  checked={checked}
                  onChange={() => setMethod(option.id)}
                  className="sr-only"
                />
                <RadioDot checked={checked} />
                <OptionMark id={option.id} size="compact" />
                <span className="font-medium">
                  {option.id === "paystack" ? "Card / bank" : "Crypto"}
                </span>
              </label>
            );
          })}
        </div>
        {method === "heleket" && <CryptoPaymentNote className="mt-1" />}
      </fieldset>
    );
  }

  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="sr-only">Payment method</legend>
      {options.map((option) => {
        const checked = method === option.id;
        return (
          <label
            key={option.id}
            className={`px-4 py-4 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#1787D4]/30 ${
              checked ? SELECTED : IDLE
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={option.id}
              checked={checked}
              onChange={() => setMethod(option.id)}
              className="sr-only"
            />
            <RadioDot checked={checked} />
            <OptionMark id={option.id} size="full" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[#031033]">{option.title}</span>
              <span className="block text-xs text-[#5A6A85]">{option.description}</span>
            </span>
          </label>
        );
      })}
      {method === "heleket" && <CryptoPaymentNote />}
    </fieldset>
  );
}
