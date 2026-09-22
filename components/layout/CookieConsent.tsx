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
      aria-label="Privacy & Cookie Preferences"
      className="fixed z-[990] bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_20px_45px_rgba(3,16,51,0.16)] p-5 text-[#031033]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8f4fc] border border-[#d0e6f9] flex items-center justify-center text-[#1787D4] shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#031033] tracking-tight leading-snug">
                Privacy & Cookie Choices
              </h3>
              <p className="text-[11px] text-[#5a6a85] font-medium">
                Nupat Cloud Experience
              </p>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors cursor-pointer"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-[#5a6a85] leading-relaxed mb-4">
          We use cookies to maintain your session security, analyze site traffic,
          and ensure smooth hosting operations. You can customize your preferences
          or read our{" "}
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
          <div className="mb-4 pt-3.5 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            {/* Essential */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[12px] font-semibold text-[#031033]">
                    Strictly Necessary
                  </span>
                </div>
                <p className="text-[11px] text-[#5a6a85] mt-0.5 leading-snug">
                  Required for authentication, security, and cart checkout.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                Active
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex-1 pr-2">
                <span className="text-[12px] font-semibold text-[#031033]">
                  Analytics & Speed
                </span>
                <p className="text-[11px] text-[#5a6a85] mt-0.5 leading-snug">
                  Anonymous metrics to measure performance and optimize user flows.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.analytics}
                onClick={() =>
                  setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  preferences.analytics ? "bg-[#1787D4]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform absolute top-[3px] left-[3px] ${
                    preferences.analytics ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex-1 pr-2">
                <span className="text-[12px] font-semibold text-[#031033]">
                  Personalization & Marketing
                </span>
                <p className="text-[11px] text-[#5a6a85] mt-0.5 leading-snug">
                  Tailored suggestions and updates for domains and cloud servers.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.marketing}
                onClick={() =>
                  setPreferences((p) => ({ ...p, marketing: !p.marketing }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  preferences.marketing ? "bg-[#1787D4]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform absolute top-[3px] left-[3px] ${
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
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1787D4] hover:text-[#1370B5] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {showPreferences ? "Hide Preferences" : "Customize Preferences"}
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
              className="flex-1 py-2 px-3 text-[12.5px] font-semibold bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-xl shadow-[0_2px_8px_rgba(23,135,212,0.25)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              id="cookie-accept-all-pref"
              className="py-2 px-3 text-[12.5px] font-semibold bg-[#f2f5fc] hover:bg-[#e4ebf8] text-[#031033] border border-[#dce5f5] rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              Accept All
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              id="cookie-accept-all"
              className="flex-1 py-2 px-3 text-[12.5px] font-semibold bg-[#1787D4] hover:bg-[#1370B5] text-white rounded-xl shadow-[0_2px_8px_rgba(23,135,212,0.25)] transition-all active:scale-[0.98] cursor-pointer text-center"
            >
              Accept All
            </button>
            <button
              onClick={handleAcceptEssential}
              id="cookie-accept-essential"
              className="flex-1 py-2 px-3 text-[12.5px] font-semibold bg-[#f2f5fc] hover:bg-[#e4ebf8] text-[#031033] border border-[#dce5f5] rounded-xl transition-all active:scale-[0.98] cursor-pointer text-center"
            >
              Essential Only
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
