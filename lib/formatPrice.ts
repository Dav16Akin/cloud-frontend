/**
 * Format a price in the currency the API returned it in, with en-NG
 * separators (₦15,000 for NGN). No conversion is done here. When the API
 * gives no currency code, the number is shown without a symbol rather than
 * guessing one.
 */
export function formatApiPrice(amount: number, currency: string | null | undefined): string {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  };
  if (!currency) return new Intl.NumberFormat("en-NG", options).format(amount);
  try {
    return new Intl.NumberFormat("en-NG", {
      ...options,
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Unknown currency code: show the code next to the number.
    return `${currency} ${new Intl.NumberFormat("en-NG", options).format(amount)}`;
  }
}
