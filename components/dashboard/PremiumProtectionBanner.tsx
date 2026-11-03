"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

// Dismissal is persisted per browser (same key the sidebar promo used).
const PREMIUM_PROMO_KEY = "nupat:dismissed-premium-protection";
const PREMIUM_PROMO_EVENT = "nupat:premium-promo-change";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREMIUM_PROMO_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREMIUM_PROMO_EVENT, onChange);
  };
};

const getSnapshot = () => {
  try {
    return window.localStorage.getItem(PREMIUM_PROMO_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Compact, dismissible Premium Protection strip for page content
 * (moved out of the sidebar, where it took too much room).
 */
export default function PremiumProtectionBanner({ className = "" }: { className?: string }) {
  const dismissedStored = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const [closed, setClosed] = useState(false);
  if (closed || dismissedStored) return null;

  const dismiss = () => {
    setClosed(true);
    try {
      window.localStorage.setItem(PREMIUM_PROMO_KEY, "1");
      window.dispatchEvent(new Event(PREMIUM_PROMO_EVENT));
    } catch {
      // Storage unavailable (private mode); stays hidden for this session.
    }
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-3 pr-4 ${className}`}
      role="region"
      aria-label="Premium Protection"
    >
      <div className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#033B5C] sm:block">
        <Image
          src="/premiuimprotection.png"
          alt="Premium Protection"
          fill
          sizes="80px"
          className="object-cover object-top"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#031033]">Premium Protection</p>
        <p className="text-sm text-[#5A6A85]">
          Keep expired domains out of redemption with automatic renewal and priority support.
        </p>
      </div>
      <Link
        href="/dashboard/expired-services"
        className="hidden h-8 shrink-0 items-center rounded-lg border border-[#D5DCE6] bg-white px-3 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 sm:inline-flex"
      >
        Learn more
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Premium Protection"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#5A6A85] transition-colors hover:bg-[#F2F5FC] hover:text-[#031033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
