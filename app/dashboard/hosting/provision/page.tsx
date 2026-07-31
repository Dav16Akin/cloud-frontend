"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HostingProvisionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/hosting/purchase");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
      <Loader2 className="w-7 h-7 animate-spin text-[#e8900a]" />
      <p className="text-sm text-[#5a6a85]">Redirecting to hosting purchase...</p>
    </div>
  );
}
