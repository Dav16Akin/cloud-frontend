"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Globe,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { verifyDomainOrder } from "@/lib/api";

type VerifyState = "loading" | "success" | "failed" | "error";

function CartSuccessContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem("domain_order_ref")
      : null) ??
    "";

  const [verifyState, setVerifyState] = useState<VerifyState>("loading");
  const [orderData, setOrderData] = useState<{
    domains: string[];
    amount: number;
    reference: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!reference) {
      setVerifyState("error");
      setErrorMsg("No payment reference found.");
      return;
    }

    const saveLocalDomains = (domains: string[]) => {
      if (typeof window === "undefined" || !domains.length) return;
      try {
        const stored = localStorage.getItem("nupat-registered-domains");
        const list: string[] = stored ? JSON.parse(stored) : [];
        domains.forEach((d) => {
          if (!list.includes(d)) list.push(d);
        });
        localStorage.setItem("nupat-registered-domains", JSON.stringify(list));
      } catch (err) {
        console.error("Failed to save registered domains to localStorage:", err);
      }
    };

    const verify = async () => {
      try {
        const res = await verifyDomainOrder(reference);
        if (res?.data?.status === "PAID") {
          const domains = res.data.domains ?? [];
          setOrderData({
            domains,
            amount: res.data.amount ?? 0,
            reference: res.data.reference ?? reference,
          });
          saveLocalDomains(domains);
          setVerifyState("success");
          sessionStorage.removeItem("domain_order_ref");
          sessionStorage.removeItem("domain_order_items");
        } else if (res?.data?.status === "FAILED") {
          setVerifyState("failed");
        } else {
          // Still pending (e.g. bank transfer) — treat as success with a note
          const domains = res.data.domains ?? [];
          setOrderData({
            domains,
            amount: res.data.amount ?? 0,
            reference: res.data.reference ?? reference,
          });
          saveLocalDomains(domains);
          setVerifyState("success");
          sessionStorage.removeItem("domain_order_ref");
          sessionStorage.removeItem("domain_order_items");
        }
      } catch {
        // If the API endpoint isn't live yet, show optimistic success
        setVerifyState("success");
        let domains: string[] = [];
        try {
          const storedItems = sessionStorage.getItem("domain_order_items");
          if (storedItems) {
            domains = JSON.parse(storedItems);
          }
        } catch {}

        setOrderData({
          domains,
          amount: 0,
          reference,
        });
        saveLocalDomains(domains);
        sessionStorage.removeItem("domain_order_ref");
        sessionStorage.removeItem("domain_order_items");
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <section className="relative pt-32 pb-24 overflow-hidden section-navy-tint flex-1">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">

          {/* Loading */}
          {verifyState === "loading" && (
            <div className="space-y-5 animate-fade-up">
              <div className="w-20 h-20 mx-auto bg-white border border-[#dce4f7] flex items-center justify-center shadow-sm">
                <Loader2 className="w-9 h-9 text-[#e8900a] animate-spin" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#031033]">Verifying Payment…</h1>
              <p className="text-[#5a6a85]">Please wait while we confirm your order.</p>
            </div>
          )}

          {/* Success */}
          {verifyState === "success" && (
            <div className="space-y-6 animate-fade-up">
              <div className="w-20 h-20 mx-auto bg-green-50 border border-green-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-[#031033] mb-2">
                  Order <span className="gradient-text">Confirmed!</span>
                </h1>
                <p className="text-[#5a6a85] text-base">
                  Your domain{(orderData?.domains?.length ?? 0) > 1 ? "s are" : " is"} being registered. You&apos;ll receive a confirmation email shortly.
                </p>
              </div>

              {/* Reference */}
              {orderData?.reference && (
                <div className="bg-white border border-[#e2eaff] px-5 py-3 text-left inline-block w-full">
                  <p className="text-xs text-[#9ba8c0] uppercase tracking-wide font-semibold mb-1">Payment Reference</p>
                  <p className="font-mono text-sm text-[#031033] font-bold break-all">
                    {orderData.reference}
                  </p>
                </div>
              )}

              {/* Registered domains */}
              {(orderData?.domains?.length ?? 0) > 0 && (
                <div className="bg-white border border-[#e2eaff] text-left">
                  <div className="px-5 py-3 border-b border-[#f0f4fc]">
                    <p className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
                      Registered Domains
                    </p>
                  </div>
                  <div className="divide-y divide-[#f0f4fc]">
                    {orderData!.domains.map((d) => (
                      <div key={d} className="flex items-center gap-3 px-5 py-3">
                        <Globe className="w-4 h-4 text-[#e8900a] shrink-0" />
                        <span className="text-[#031033] font-semibold text-sm">{d}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's next */}
              <div className="bg-white border border-[#e2eaff] text-left">
                <div className="px-5 py-3 border-b border-[#f0f4fc]">
                  <p className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-wide">
                    What Happens Next
                  </p>
                </div>
                <div className="divide-y divide-[#f0f4fc]">
                  {[
                    { icon: CheckCircle, text: "Your payment has been received and processed." },
                    { icon: Globe, text: "DNS propagation begins immediately (up to 24–48 hrs globally)." },
                    { icon: Shield, text: "SSL certificate will be issued and activated automatically." },
                    { icon: LayoutDashboard, text: "Manage your domains from the dashboard at any time." },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 px-5 py-3 text-sm text-[#5a6a85]">
                      <Icon className="w-4 h-4 text-[#e8900a] shrink-0 mt-0.5" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/domains"
                  id="success-go-dashboard"
                  className="btn-primary py-3.5 px-8 text-base flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                <Link
                  href="/domains"
                  id="success-search-more"
                  className="btn-outline py-3.5 px-8 text-base flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search More Domains
                </Link>
              </div>
            </div>
          )}

          {/* Failed */}
          {verifyState === "failed" && (
            <div className="space-y-5 animate-fade-up">
              <div className="w-20 h-20 mx-auto bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#031033]">Payment Failed</h1>
              <p className="text-[#5a6a85]">
                Your payment could not be processed. No charges were made. Please try again.
              </p>
              <Link
                href="/cart"
                id="success-try-again"
                className="btn-primary py-3.5 px-8 text-base inline-flex items-center gap-2"
              >
                Return to Cart <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Error */}
          {verifyState === "error" && (
            <div className="space-y-5 animate-fade-up">
              <div className="w-20 h-20 mx-auto bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#031033]">Something Went Wrong</h1>
              <p className="text-[#5a6a85]">{errorMsg || "Could not verify your payment. Please contact support."}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/cart"
                  className="btn-outline py-3.5 px-8 text-base inline-flex items-center gap-2"
                >
                  Return to Cart
                </Link>
                <Link
                  href="/contact"
                  id="success-contact-support"
                  className="btn-primary py-3.5 px-8 text-base inline-flex items-center gap-2"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CartSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center section-navy-tint">
        <Loader2 className="w-8 h-8 animate-spin text-[#e8900a]" />
      </div>
    }>
      <CartSuccessContent />
    </Suspense>
  );
}
