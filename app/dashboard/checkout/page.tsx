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
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { useCartStore, getCartItemKey, cartItemLabel, type CartItem } from "@/store/cartStore";
import { useGetMe } from "@/hooks/useUser";
import { initializeCartPayment, type BackendCartItem } from "@/lib/api";
import { setRecentHostingPurchase } from "@/hooks/useHosting";
import { toast } from "sonner";

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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Breadcrumb / Back Link ───────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to domains
        </Link>
      </div>

      {/* ── Title and Subtitle ────────────────────────────────────────── */}
      <div>
        <h1
          className="text-[24px] sm:text-[26px] font-bold text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.4px",
          }}
        >
          Review &amp; Complete Payment
        </h1>
        <p className="text-[14px] text-[#6e6e73] mt-1">
          Review your stacked domains, SSL certificates, and hosting services, confirm your account details, and complete payment directly via Paystack.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13.5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to proceed with payment</p>
            <p className="text-[12.5px] mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout (Wizard Design System) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Stacked Items + Registrant / Billing Details + Paystack Gateway */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Card 1: Stacked Order Items */}
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f3]">
              <div>
                <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                  Order items ({items.length})
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                  All domains, SSL certificates, and cloud services in your cart
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[12.5px] font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1787D4] flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="text-[15px] font-bold text-[#1d1d1f]">
                  Your cart is empty
                </h4>
                <p className="text-[13px] text-[#6e6e73] mt-1 max-w-sm">
                  Add domain registrations, PositiveSSL certificates, or hosting packages to process payment.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/dashboard/domains"
                    className="px-4 py-2 rounded-lg font-semibold text-white text-[13px] bg-[#1787D4] hover:bg-[#1578bd] transition-colors"
                  >
                    Search Domains
                  </Link>
                  <Link
                    href="/dashboard/hosting"
                    className="px-4 py-2 rounded-lg font-semibold text-[#1d1d1f] text-[13px] bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Browse Hosting
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f3]">
                {items.map((item) => {
                  const key = getCartItemKey(item);

                  let Icon = Globe;
                  let iconBg = "bg-emerald-50 text-emerald-600";
                  let itemBadge = "Domain Registration";
                  let title = "";
                  let subtitle = "";

                  if (item.type === "DOMAIN") {
                    Icon = Globe;
                    iconBg = "bg-emerald-50 text-emerald-600";
                    itemBadge = "Domain";
                    title = `${item.domainName}.${item.extension}`;
                    subtitle = "1-year domain registration • Privacy protection included";
                  } else if (item.type === "SSL") {
                    Icon = Shield;
                    iconBg = "bg-blue-50 text-[#1787D4]";
                    itemBadge = "SSL Certificate";
                    title = item.productName || "PositiveSSL Certificate";
                    subtitle = `For ${item.domainName} • ${item.period || 1}-year HTTPS encryption`;
                  } else if (item.type === "HOSTING") {
                    Icon = Server;
                    iconBg = "bg-indigo-50 text-indigo-600";
                    itemBadge = "Web Hosting";
                    title = `${item.planName} Hosting Plan`;
                    subtitle = `Billed ${item.billingCycle || "yearly"} • High-speed NVMe cloud`;
                  } else if (item.type === "DOMAIN_TRANSFER") {
                    Icon = ArrowRightLeft;
                    iconBg = "bg-amber-50 text-amber-600";
                    itemBadge = "Transfer";
                    title = `${item.domainName}.${item.extension}`;
                    subtitle = `Domain transfer with 1-year renewal extension`;
                  }

                  return (
                    <div
                      key={key}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14.5px] font-bold text-[#1d1d1f] truncate">
                              {title}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-[#4b5563] border border-slate-200">
                              {itemBadge}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#6e6e73] mt-0.5">
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                        <span className="text-[15px] font-bold text-[#1d1d1f]">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          className="p-1.5 rounded-md text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f3]">
              <div>
                <h3 className="text-[16px] font-bold text-[#1d1d1f]">
                  Account &amp; registrant information
                </h3>
                <p className="text-[12.5px] text-[#6e6e73] mt-0.5">
                  Legal contact details used for domain ownership records and billing
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1787D4] hover:text-[#136eb0] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingInfo ? "Done editing" : "Edit details"}
              </button>
            </div>

            {isLoadingUser && !userProfile ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
              </div>
            ) : isEditingInfo ? (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    City &amp; State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] block mb-1">
                    Postal Code &amp; Country
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#d1d5db] text-[13px] text-[#1d1d1f] outline-none focus:border-[#1787D4]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="space-y-1.5 text-[#6e6e73]">
                  <p className="font-bold text-[#1d1d1f] text-[14px]">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Account Holder"}
                  </p>
                  <p>{organization || "Individual Registrant"}</p>
                  <p className="text-[#1787D4] font-medium">{email || userProfile?.email || "—"}</p>
                </div>
                <div className="space-y-1.5 text-[#6e6e73]">
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
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <h3 className="text-[16px] font-bold text-[#1d1d1f]">
              Payment method
            </h3>
            <p className="text-[13px] text-[#6e6e73] mt-0.5 mb-5">
              Your transaction is processed directly through our certified payment gateway.
            </p>

            {/* Paystack Primary Card */}
            <div className="p-4 sm:p-5 rounded-lg border-2 border-[#1787D4] bg-[#f8fbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-4 border-[#1787D4] bg-white flex items-center justify-center shrink-0" />
                <div className="flex items-center gap-3">
                  <div className="h-7 w-auto flex items-center shrink-0">
                    <Image
                      src="/paystack-logo.png"
                      alt="Paystack"
                      width={110}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1d1d1f]">
                      Paystack
                    </p>
                    <p className="text-[12px] text-[#6e6e73]">
                      Pay with debit/credit card, bank transfer, USSD, or Apple Pay
                    </p>
                  </div>
                </div>
              </div>

              <span className="self-start sm:self-center text-[11.5px] font-bold text-[#1787D4] bg-[#e6f4fc] px-2.5 py-1 rounded-full shrink-0">
                Primary Gateway
              </span>
            </div>

            {/* Direct & Secure Checkout Note */}
            <div className="mt-5 p-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-start gap-3 text-[12.5px] text-[#6e6e73]">
              <Shield className="w-5 h-5 text-[#1787D4] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1d1d1f]">
                  Direct &amp; Secure Paystack Checkout
                </p>
                <p className="mt-0.5">
                  Clicking &ldquo;Pay with Paystack&rdquo; will direct you straight to Paystack&apos;s certified payment gateway to complete the transaction. No card details are ever stored on our servers.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#6e6e73]">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Secured with 256-bit SSL encrypted payment processing.</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary & Direct Pay Button */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="w-full bg-white rounded-lg border border-[#e8e8ed] p-5 sm:p-6 shadow-xs">
            <h4 className="text-[16px] font-bold text-[#1d1d1f] mb-4">
              Order summary
            </h4>

            {items.length === 0 ? (
              <p className="text-[13px] text-[#8a9bb2] py-2">
                No items in order
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 text-[13px] text-[#6e6e73]">
                {items.map((item) => (
                  <div key={getCartItemKey(item)} className="flex justify-between items-start">
                    <span className="font-medium text-[#1d1d1f] truncate pr-2">
                      {cartItemLabel(item)}
                    </span>
                    <span className="font-semibold text-[#1d1d1f] shrink-0">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Tax commented out as requested */}
                {/* <div className="flex justify-between items-center">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div> */}

                <div className="my-2 border-t border-[#f0f0f3]" />

                <div className="flex justify-between items-center text-[16px] font-bold text-[#1d1d1f]">
                  <span>Total due today</span>
                  <span className="text-[#1787D4]">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Terms Agreement Checkbox */}
            <div className="mt-5 pt-4 border-t border-[#f0f0f3]">
              <label className="flex items-start gap-2.5 cursor-pointer text-[12px] text-[#6e6e73] leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1787D4] focus:ring-[#1787D4] border-gray-300 mt-0.5 cursor-pointer"
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
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white text-[14px] bg-[#1787D4] hover:bg-[#1578bd] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

            <p className="text-center text-[11.5px] text-[#8a9bb2] mt-3 leading-relaxed">
              By paying, you authorise this charge and agree to the service registration terms.
            </p>
          </div>

          {/* Reserved Notice Banner */}
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-3.5 text-[#0369a1] text-[12px] flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 shrink-0 text-[#0284c7]" />
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
        </div>
      }
    >
      <DashboardCheckoutContent />
    </Suspense>
  );
}
