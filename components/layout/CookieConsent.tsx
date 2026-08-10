// components/layout/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or configured cookie preferences
    const consent = localStorage.getItem("nupat_cloud_cookie_consent");
    if (!consent) {
      // Delay slightly for smooth entrance after page load
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }

    // Listener to re-open cookie banner when triggered (e.g. from footer)
    const handleReopen = () => setIsVisible(true);
    window.addEventListener("nupat_open_cookie_consent", handleReopen);
    return () => window.removeEventListener("nupat_open_cookie_consent", handleReopen);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("nupat_cloud_cookie_consent", "all");
    localStorage.setItem("nupat_cloud_cookie_consent_time", new Date().toISOString());
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("nupat_cloud_cookie_consent", "essential");
    localStorage.setItem("nupat_cloud_cookie_consent_time", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-lg z-[998] bg-[#031033] text-white border border-[#e8900a]/40 shadow-2xl shadow-[#031033]/50 p-5 md:p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#e8900a]/15 border border-[#e8900a]/30 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-[#e8900a]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              We Value Your Privacy
            </h3>
            <p className="text-[11px] text-[#9ba8c0]">
              Nupat Cloud Cookie Preferences
            </p>
          </div>
        </div>
        <button
          onClick={handleAcceptEssential}
          className="text-[#9ba8c0] hover:text-white transition-colors p-1"
          aria-label="Close cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-[#c0cad8] leading-relaxed mb-4">
        We use cookies to improve your browsing experience, analyze website traffic,
        and assist in our marketing efforts. By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our{" "}
        <Link href="/privacy" className="text-[#e8900a] underline underline-offset-2 hover:text-white transition-colors">
          Privacy Policy
        </Link>{" "}
        to learn more.
      </p>

      {/* Expandable Category Details */}
      {showDetails && (
        <div className="mb-4 pt-3 border-t border-white/10 space-y-2.5 text-xs text-[#9ba8c0] animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Strictly Necessary Cookies
              </span>
              <p className="text-[11px] text-[#9ba8c0] mt-0.5">
                Required for core website functionality, authentication, and secure checkout.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 shrink-0">
              Always Active
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 pt-2 border-t border-white/5">
            <div>
              <span className="font-semibold text-white">Analytics & Performance</span>
              <p className="text-[11px] text-[#9ba8c0] mt-0.5">
                Helps us understand site usage to optimize speed and user experience.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowDetails((p) => !p)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#e8900a] hover:underline underline-offset-2"
        >
          {showDetails ? (
            <>
              Hide Cookie Preferences <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Customize Preferences <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={handleAcceptAll}
          id="cookie-accept-all"
          className="w-full sm:flex-1 py-2.5 px-4 text-xs font-bold bg-[#e8900a] text-white hover:bg-[#c97a08] transition-colors text-center"
        >
          Accept All Cookies
        </button>
        <button
          onClick={handleAcceptEssential}
          id="cookie-accept-essential"
          className="w-full sm:flex-1 py-2.5 px-4 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors text-center"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
