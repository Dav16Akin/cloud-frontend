"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function CartPage() {
  const token = useAuthStore((s) => s.token);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated) {
      if (token) {
        router.replace("/dashboard/cart");
      } else {
        router.replace("/login?redirect=/dashboard/cart");
      }
    }
  }, [_hasHydrated, token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
      <p className="text-[13px] text-[#6e6e73]">Loading cart…</p>
    </div>
  );
}
