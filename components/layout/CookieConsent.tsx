// components/layout/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cookie,
  X,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

const CONSENT_KEY = "nupat_cloud_cookie_consent";
const CONSENT_TIME_KEY = "nupat_cloud_cookie_consent_time";
const CONSENT_SETTINGS_KEY = "nupat_cloud_cookie_settings";
const EXPIRY_DAYS = 180; // Standard 6-month re-prompt window

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user has a valid, non-expired consent choice
    const checkValidConsent = () => {
      try {
        const consent = localStorage.getItem(CONSENT_KEY);
        const consentTime = localStorage.getItem(CONSENT_TIME_KEY);
        if (consent && consentTime) {
          const consentDate = new Date(consentTime).getTime();
          const now = Date.now();
          const diffDays = (now - consentDate) / (1000 * 60 * 60 * 24);
          if (diffDays < EXPIRY_DAYS) {
            return true;
          }
        }
      } catch {}
      return false;
    };

    if (!checkValidConsent()) {
      // Industry standard polite delay: 1800ms after initial load
      let triggered = false;
      const displayConsent = () => {
        if (!triggered) {
          triggered = true;
          setIsVisible(true);
        }
      };

      const timer = setTimeout(displayConsent, 1800);

      // Trigger politely if user actively scrolls before the timer expires
      const handleScroll = () => {
        if (window.scrollY > 140) {
          displayConsent();
          window.removeEventListener("scroll", handleScroll);
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Listen for re-open trigger (e.g., from Footer "Cookie Preferences" link)
  useEffect(() => {
    const handleReopen = () => {
      try {
        const savedSettings = localStorage.getItem(CONSENT_SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setPreferences({
            necessary: true,
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
          });
        }
      } catch {}
      setShowPreferences(true);
      setIsVisible(true);
    };

    window.addEventListener("nupat_open_cookie_consent", handleReopen);
    return () => window.removeEventListener("nupat_open_cookie_consent", handleReopen);
  }, []);

  const saveConsent = (
    type: "all" | "essential" | "custom",
    settings: CookiePreferences
  ) => {
    try {
      localStorage.setItem(CONSENT_KEY, type);
      localStorage.setItem(CONSENT_TIME_KEY, new Date().toISOString());
      localStorage.setItem(CONSENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, analytics: true, marketing: true };
    setPreferences(all);
    saveConsent("all", all);
  };

  const handleAcceptEssential = () => {
    const essential = { necessary: true, analytics: false, marketing: false };
    setPreferences(essential);
    saveConsent("essential", essential);
  };

  const handleSaveCustom = () => {
    saveConsent("custom", preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal="false"
      aria-label="Cookie preferences"
      className="fixed z-[990] bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[420px] max-w-[calc(100vw-2rem)] animate-in fade-in duration-200"
    >
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_12px_32px_rgba(3,16,51,0.12)] p-5 text-[#031033]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <Cookie className="w-5 h-5 text-[#1787D4] shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-[#031033] leading-snug">
                Cookie preferences
              </h3>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] rounded-lg p-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-[#5A6A85] leading-relaxed mb-4">
          We use cookies to keep you signed in securely, measure site traffic
          and run checkout. You can choose which ones we use, or read our
          {" "}
          <Link
            href="/privacy"
            className="text-[#1787D4] font-medium hover:underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* Detailed Preferences Accordion */}
        {showPreferences && (
          <div className="mb-4 pt-3.5 border-t border-[#E2E8F0] space-y-3">
            {/* Essential */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F2F5FC]">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#12A150]" />
                  <span className="text-sm font-medium text-[#031033]">
                    Strictly necessary
                  </span>
                </div>
                <p className="text-xs text-[#5A6A85] mt-0.5 leading-snug">
                  Required for sign-in, security and checkout.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0E7C3A] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#12A150]" aria-hidden="true" />
                Always on
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F2F5FC]">
              <div className="flex-1 pr-2">
                <span className="text-sm font-medium text-[#031033]">
                  Analytics
                </span>
                <p className="text-xs text-[#5A6A85] mt-0.5 leading-snug">
                  Anonymous usage data that shows us which pages are slow or confusing.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.analytics}
                onClick={() =>
                  setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 ${
                  preferences.analytics ? "bg-[#1787D4]" : "bg-[#D5DCE6]"
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-[3px] left-[3px] ${
                    preferences.analytics ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F2F5FC]">
              <div className="flex-1 pr-2">
                <span className="text-sm font-medium text-[#031033]">
                  Personalisation and marketing
                </span>
                <p className="text-xs text-[#5A6A85] mt-0.5 leading-snug">
                  Offers and updates about domains and servers based on what you view.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.marketing}
                onClick={() =>
                  setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 ${
                  preferences.marketing ? "bg-[#1787D4]" : "bg-[#D5DCE6]"
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-[3px] left-[3px] ${
                    preferences.marketing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Toggle Customization Trigger */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPreferences((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {showPreferences ? "Hide options" : "Choose cookies"}
            </span>
            {showPreferences ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        {showPreferences ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveCustom}
              id="cookie-save-preferences"
              className="flex-1 h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save choices
            </button>
            <button
              onClick={handleAcceptAll}
              id="cookie-accept-all-pref"
              className="h-9 px-4 text-sm font-medium bg-white hover:bg-[#F2F5FC] text-[#031033] border border-[#D5DCE6] rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
            >
              Accept all
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              id="cookie-accept-all"
              className="flex-1 h-9 px-4 text-sm font-medium bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 text-center"
            >
              Accept all
            </button>
            <button
              onClick={handleAcceptEssential}
              id="cookie-accept-essential"
              className="flex-1 h-9 px-4 text-sm font-medium bg-white hover:bg-[#F2F5FC] text-[#031033] border border-[#D5DCE6] rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 text-center"
            >
              Essential only
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
