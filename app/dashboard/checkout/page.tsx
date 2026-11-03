"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Shield,
  Server,
  ArrowRightLeft,
  Trash2,
  Lock,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { useCartStore, getCartItemKey, cartItemLabel, type CartItem } from "@/store/cartStore";
import { useGetMe } from "@/hooks/useUser";
import { initializeCartPayment, type BackendCartItem } from "@/lib/api";
import { setRecentHostingPurchase } from "@/hooks/useHosting";
import { toast } from "sonner";

/** Real term in years for a cart item, if the item carries one (never assumed). */
function itemYears(item: CartItem): number | null {
  const raw = item as { period?: unknown; years?: unknown };
  const n = Number(raw.period ?? raw.years);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function DashboardCheckoutContent() {
  const router = useRouter();
  const { items, removeItem, clearCart, grandTotal, toBackendItems } = useCartStore();
  const { data: meData, isLoading: isLoadingUser } = useGetMe();
  const userProfile = meData?.data;

  // Contact / Billing form state (pre-filled from real account profile)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Sync profile data once loaded
  useEffect(() => {
    if (userProfile) {
      if (userProfile.firstName) setFirstName(userProfile.firstName);
      if (userProfile.lastName) setLastName(userProfile.lastName);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phoneNumber) setPhone(userProfile.phoneNumber);
      if (userProfile.companyName) setOrganization(userProfile.companyName);
      const addr = [userProfile.houseNumber, userProfile.address].filter(Boolean).join(" ");
      if (addr) setStreetAddress(addr);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.state) setState(userProfile.state);
      if (userProfile.postcode) setPostalCode(userProfile.postcode);
      if (userProfile.country) setCountry(userProfile.country);
    }
  }, [userProfile]);

  const totalAmount = grandTotal();

  // Paystack Direct Checkout Handler
  const handlePaystackCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Add services before proceeding.");
      return;
    }

    // Pre-flight cart validation
    for (const item of items) {
      if (item.type === "HOSTING" && !item.planId) {
        const msg = `Hosting item is missing a plan ID. Please re-add it.`;
        setError(msg);
        toast.error(msg);
        return;
      }
      if (item.type === "DOMAIN" && (!item.domainName || !item.extension)) {
        const msg = `Domain item "${item.domainName || "Unknown"}" is incomplete. Please re-add it.`;
        setError(msg);
        toast.error(msg);
        return;
      }
      if (item.type === "DOMAIN_TRANSFER") {
        if (!item.domainName || !item.extension) {
          const msg = `Transfer item is incomplete. Please re-add it.`;
          setError(msg);
          toast.error(msg);
          return;
        }
        if (!item.authCode) {
          const msg = `Domain transfer for "${item.domainName}.${item.extension}" requires an authorization (EPP) code.`;
          setError(msg);
          toast.error(msg);
          return;
        }
      }
      if (item.type === "SSL" && !item.domainName) {
        const msg = `SSL Certificate is missing its assigned domain name.`;
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setIsProcessing(true);
    setError("");

    try {
      // Map all stacked cart items into BackendCartItem format
      const backendItems: BackendCartItem[] = toBackendItems();

      // Call real backend endpoint POST /orders/initialize
      const res = await initializeCartPayment({ items: backendItems });

      if (res?.data?.paymentUrl) {
        // Save official order reference in sessionStorage for post-payment verification
        sessionStorage.setItem("cart_order_ref", res.data.reference);

        // Record hosting purchase for provisioning workflow if applicable
        const hostingItem = items.find((i) => i.type === "HOSTING");
        if (hostingItem && hostingItem.type === "HOSTING") {
          const domainItem = items.find((i) => i.type === "DOMAIN");
          setRecentHostingPurchase({
            domain:
              domainItem && domainItem.type === "DOMAIN"
                ? `${domainItem.domainName}.${domainItem.extension}`
                : undefined,
            planName: hostingItem.planName,
            reference: res.data.reference,
          });
        }

        // Direct user straight to Paystack
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error(res?.message || "No payment URL returned from server.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment initialisation failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-[#D5DCE6] bg-white text-sm text-[#031033] placeholder:text-[#5A6A85]/70 outline-none focus:border-[#1787D4] focus:ring-2 focus:ring-[#1787D4]/15";
  const labelCls = "text-sm font-medium text-[#031033] block mb-1.5";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Breadcrumb / Back Link ───────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to domains
        </Link>
      </div>

      {/* ── Title and Subtitle ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-[#031033]">Review and complete payment</h1>
        <p className="text-sm text-[#5A6A85] mt-1">
          Check your domains, SSL certificates, and hosting, confirm your account details, then pay through Paystack.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-[#FDECEC] border border-[#DC2626]/20 px-4 py-3 text-[#C21F1F] text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
          <div>
            <p className="font-medium">Unable to proceed with payment</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Stacked Items + Registrant / Billing Details + Paystack Gateway */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Stacked Order Items */}
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F7]">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Order items <span className="text-[#5A6A85] font-normal tabular-nums">({items.length})</span>
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  All domains, SSL certificates, and cloud services in your cart
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="h-8 px-3 rounded-lg text-sm font-medium text-[#C21F1F] hover:bg-[#FDECEC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                >
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
                <h4 className="text-base font-semibold text-[#031033]">
                  Your cart is empty
                </h4>
                <p className="text-sm text-[#5A6A85] mt-1 max-w-sm">
                  Add a domain registration, an SSL certificate, or a hosting plan to continue to payment.
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <Link
                    href="/dashboard/domains"
                    className="inline-flex h-9 items-center px-4 rounded-lg font-medium text-white text-sm bg-[#1787D4] hover:bg-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Search domains
                  </Link>
                  <Link
                    href="/dashboard/hosting"
                    className="inline-flex h-9 items-center px-4 rounded-lg font-medium text-[#031033] text-sm border border-[#D5DCE6] bg-white hover:bg-[#F2F5FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                  >
                    Browse hosting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#EEF2F7]">
                {items.map((item) => {
                  const key = getCartItemKey(item);

                  let Icon = Globe;
                  let itemBadge = "Domain registration";
                  let title = "";
                  let subtitle = "";

                  if (item.type === "DOMAIN") {
                    Icon = Globe;
                    itemBadge = "Domain";
                    title = `${item.domainName}.${item.extension}`;
                    const years = itemYears(item);
                    subtitle = `${years ? `${years}-year domain registration` : "Domain registration"} · Privacy protection included`;
                  } else if (item.type === "SSL") {
                    Icon = Shield;
                    itemBadge = "SSL certificate";
                    title = item.productName || "SSL certificate";
                    const years = itemYears(item);
                    subtitle = `For ${item.domainName} · ${years ? `${years}-year ` : ""}HTTPS encryption`;
                  } else if (item.type === "HOSTING") {
                    Icon = Server;
                    itemBadge = "Web hosting";
                    title = `${item.planName} Hosting Plan`;
                    subtitle = `Billed ${item.billingCycle || "yearly"} · NVMe cloud storage`;
                  } else if (item.type === "DOMAIN_TRANSFER") {
                    Icon = ArrowRightLeft;
                    itemBadge = "Transfer";
                    title = `${item.domainName}.${item.extension}`;
                    const years = itemYears(item);
                    subtitle = years
                      ? `Domain transfer with ${years}-year renewal extension`
                      : "Domain transfer";
                  }

                  return (
                    <div
                      key={key}
                      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#031033] truncate">
                              {title}
                            </span>
                            <span className="text-xs text-[#5A6A85] whitespace-nowrap">
                              {itemBadge}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A6A85] mt-1">
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-7 sm:pl-0">
                        <span className="text-sm font-semibold text-[#031033] tabular-nums text-right">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          className="p-2 rounded-lg text-[#5A6A85] hover:text-[#C21F1F] hover:bg-[#FDECEC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
                          aria-label={`Remove ${title}`}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Confirm Your Information (Real Backend User Profile) */}
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#EEF2F7]">
              <div>
                <h3 className="text-base font-semibold text-[#031033]">
                  Account and registrant information
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  Legal contact details used for domain ownership records and billing
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-[#1787D4] hover:bg-[#E8F4FC] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingInfo ? "Done editing" : "Edit details"}
              </button>
            </div>

            {isLoadingUser && !userProfile ? (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <span className="block h-4 w-32 animate-pulse rounded bg-[#EEF2F7]" />
                    <span className="block h-4 w-40 animate-pulse rounded bg-[#EEF2F7]" />
                    <span className="block h-4 w-36 animate-pulse rounded bg-[#EEF2F7]" />
                  </div>
                ))}
              </div>
            ) : isEditingInfo ? (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Organization / company</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Street address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>City and state</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Postal code and country</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1.5 text-[#5A6A85]">
                  <p className="font-medium text-[#031033]">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Account Holder"}
                  </p>
                  <p>{organization || "Individual Registrant"}</p>
                  <p className="text-[#031033]">{email || userProfile?.email || "—"}</p>
                </div>
                <div className="space-y-1.5 text-[#5A6A85]">
                  <p>{phone || userProfile?.phoneNumber || "No phone added"}</p>
                  <p>{streetAddress || "Address on file"}</p>
                  <p>
                    {[city, state, postalCode, country].filter(Boolean).join(", ") || "Nigeria"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Payment Method (Official Paystack Gateway) */}
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h3 className="text-base font-semibold text-[#031033]">Payment method</h3>
              <p className="text-xs text-[#5A6A85] mt-0.5">
                Your payment is processed directly by Paystack.
              </p>
            </div>

            <div className="p-5">
              {/* Paystack Primary Card */}
              <div className="px-4 py-4 rounded-lg border border-[#1787D4] ring-1 ring-[#1787D4] bg-[#E8F4FC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-[5px] border-[#1787D4] bg-white shrink-0" />
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-[110px] flex items-center shrink-0">
                      <Image
                        src="/paystack-logo.png"
                        alt="Paystack"
                        width={110}
                        height={28}
                        className="h-7 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#031033]">Paystack</p>
                      <p className="text-xs text-[#5A6A85]">
                        Pay with debit/credit card, bank transfer, USSD, or Apple Pay
                      </p>
                    </div>
                  </div>
                </div>

                <span className="self-start sm:self-center text-xs text-[#5A6A85] whitespace-nowrap shrink-0">
                  Primary gateway
                </span>
              </div>

              {/* Direct & Secure Checkout Note */}
              <div className="mt-4 px-4 py-3 rounded-lg bg-[#F2F5FC] flex items-start gap-3 text-sm text-[#5A6A85]">
                <Shield className="w-4 h-4 text-[#5A6A85] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#031033]">Direct Paystack checkout</p>
                  <p className="mt-0.5 text-xs">
                    &ldquo;Pay with Paystack&rdquo; takes you to Paystack&apos;s payment page to complete the transaction. Card details are never stored on our servers.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#5A6A85]">
                <Lock className="w-4 h-4 text-[#5A6A85] shrink-0" />
                <span>Payments are processed over an encrypted 256-bit SSL connection.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary & Direct Pay Button */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="w-full bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-5 py-4 border-b border-[#EEF2F7]">
              <h4 className="text-base font-semibold text-[#031033]">Order summary</h4>
            </div>

            <div className="p-5">
              {items.length === 0 ? (
                <p className="text-sm text-[#5A6A85]">No items in order</p>
              ) : (
                <dl className="flex flex-col text-sm">
                  {items.map((item) => (
                    <div
                      key={getCartItemKey(item)}
                      className="flex justify-between items-start gap-4 py-1.5 first:pt-0"
                    >
                      <dt className="text-[#5A6A85] truncate">{cartItemLabel(item)}</dt>
                      <dd className="text-[#031033] tabular-nums text-right shrink-0">
                        ₦{item.price.toLocaleString()}
                      </dd>
                    </div>
                  ))}

                  <div className="flex justify-between items-center gap-4 pt-3 mt-1.5 border-t border-[#EEF2F7]">
                    <dt className="text-[#5A6A85]">Subtotal</dt>
                    <dd className="text-[#031033] tabular-nums text-right">
                      ₦{totalAmount.toLocaleString()}
                    </dd>
                  </div>

                  {/* Tax commented out as requested */}
                  {/* <div className="flex justify-between items-center">
                    <span>Tax (7.5%)</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div> */}

                  <div className="flex justify-between items-baseline gap-4 pt-3 mt-3 border-t border-[#E2E8F0]">
                    <dt className="font-semibold text-[#031033]">Total due today</dt>
                    <dd className="text-lg font-semibold text-[#031033] tabular-nums text-right">
                      ₦{totalAmount.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              )}

              {/* Terms Agreement Checkbox */}
              <div className="mt-5 pt-4 border-t border-[#EEF2F7]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5A6A85]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1787D4] focus:ring-[#1787D4] border-[#D5DCE6] mt-0.5 cursor-pointer"
                  />
                  <span>
                    I confirm these details are accurate and agree to the Terms of Service.
                  </span>
                </label>
              </div>

              {/* Pay with Paystack Action Button */}
              <button
                type="button"
                disabled={isProcessing || items.length === 0 || !agreedToTerms}
                onClick={handlePaystackCheckout}
                className="w-full mt-5 h-10 rounded-lg font-medium text-white text-sm bg-[#1787D4] hover:bg-[#1370B5] transition-colors cursor-pointer flex items-center justify-center gap-2 tabular-nums disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Paystack…
                  </>
                ) : (
                  `Pay ₦${totalAmount.toLocaleString()} with Paystack`
                )}
              </button>

              <p className="text-center text-xs text-[#5A6A85] mt-3">
                By paying, you authorise this charge and agree to the service registration terms.
              </p>
            </div>
          </div>

          {/* Reserved Notice */}
          <div className="rounded-lg border border-[#1787D4]/20 bg-[#E8F4FC] px-4 py-3 text-sm text-[#031033] flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#1787D4]" />
            <span>
              Your services stay reserved for 15 minutes while you complete setup.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DashboardCheckoutContent />
    </Suspense>
  );
}
