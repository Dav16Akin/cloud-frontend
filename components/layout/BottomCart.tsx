"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const noopSubscribe = () => () => {};

export default function BottomCart() {
  const count = useCartStore((s) => s.items.length);
  const { isDrawerOpen, openDrawer } = useCartStore();
  const pathname = usePathname();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Avoid hydration mismatch: false during SSR and hydration, true afterwards.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 250); // Show 250ms after scrolling stops
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  if (!mounted) return null;
  const hideRoutes = [
    "/cart",
    "/cart/checkout",
    "/cart/success",
    "/dashboard/checkout",
    "/dashboard/hosting/purchase",
  ];
  const shouldHide =
    count === 0 || isDrawerOpen || isScrolling || hideRoutes.includes(pathname);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[440px] max-w-lg bg-[#031033] border border-white/10 rounded-xl shadow-[0_12px_32px_rgba(3,16,51,0.3)] transition-[opacity,translate] duration-300 ${
        shouldHide
          ? "translate-y-28 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={openDrawer}
          className="flex items-center gap-2.5 rounded-lg text-left cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Open cart drawer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#1787D4] flex items-center justify-center shrink-0 group-hover:bg-[#1370B5] transition-colors">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">
              {count} {count === 1 ? "item" : "items"} in cart
            </p>
            <span className="text-white/70 group-hover:text-white text-xs transition-colors">
              Show items
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            id="bottom-cart-view-link"
            className="inline-flex h-9 items-center text-white/70 hover:text-white text-sm font-medium px-3 rounded-lg hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            View cart
          </Link>
          <Link
            href="/dashboard/checkout"
            id="bottom-cart-checkout-link"
            className="inline-flex h-9 items-center px-4 text-sm font-medium text-white bg-[#1787D4] hover:bg-[#1370B5] rounded-lg shrink-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
