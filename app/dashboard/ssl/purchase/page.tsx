"use client";

import { Suspense } from "react";
import SslPurchaseWizard from "@/components/dashboard/SslPurchaseWizard";
import { Loader2 } from "lucide-react";

export default function SslPurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1787D4]" />
          <p className="text-sm text-[#6e6e73]">Loading SSL setup wizard...</p>
        </div>
      }
    >
      <SslPurchaseWizard />
    </Suspense>
  );
}
