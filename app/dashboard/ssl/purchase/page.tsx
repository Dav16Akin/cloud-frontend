"use client";

import { Suspense } from "react";
import SslPurchaseWizard from "@/components/dashboard/SslPurchaseWizard";
import { Loader2 } from "lucide-react";

export default function SslPurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#5A6A85]">Loading SSL setup…</p>
        </div>
      }
    >
      <SslPurchaseWizard />
    </Suspense>
  );
}
