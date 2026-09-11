"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function BottomCart() {
  const { itemCount, isDrawerOpen, openDrawer } = useCartStore();
  const pathname = usePathname();
  const [isScrolling, setIsScrolling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const count = itemCount();
  const hideRoutes = ["/cart", "/cart/checkout", "/cart/success"];
  const shouldHide = count === 0 || isDrawerOpen || isScrolling || hideRoutes.includes(pathname);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[440px] max-w-lg bg-[#031033]/95 backdrop-blur-md border border-[#1787D4]/30 rounded-2xl shadow-2xl shadow-[#031033]/40 transition-all duration-300 transform ${
        shouldHide ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={openDrawer}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
          aria-label="Open cart drawer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1787D4] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#1370B5] transition-colors">
            <ShoppingCart className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-white text-xs sm:text-sm font-bold leading-tight">
              {count} {count === 1 ? "item" : "items"} in cart
            </p>
            <span className="text-[#1787D4] group-hover:text-white text-[11px] font-medium transition-colors">
              Open drawer &rarr;
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            id="bottom-cart-view-link"
            className="text-white/80 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            View Cart
          </Link>
          <Link
            href="/cart/checkout"
            id="bottom-cart-checkout-link"
            className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl shadow-xs shrink-0"
          >
            Checkout &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
