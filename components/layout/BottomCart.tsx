"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function BottomCart() {
  const { itemCount, isDrawerOpen } = useCartStore();
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
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#031033] border-t border-[#1a2d5a] shadow-2xl transition-all duration-300 transform ${
        shouldHide ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e8900a] flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-sm font-semibold">
            {count} item{count !== 1 ? "s" : ""} in cart
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            id="bottom-cart-view-link"
            className="text-[#e8900a] text-sm font-semibold hover:underline underline-offset-4 transition"
          >
            View Cart
          </Link>
          <Link
            href="/cart/checkout"
            id="bottom-cart-checkout-link"
            className="btn-primary py-2 px-5 text-xs font-semibold rounded"
          >
            Checkout →
          </Link>
        </div>
      </div>
    </div>
  );
}
