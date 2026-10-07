"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function RegisterDomainRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const domain = searchParams.get("domain") || "";
    const step = searchParams.get("step") || "";
    const params = new URLSearchParams({ tab: "register" });
    if (domain) params.set("domain", domain);
    if (step) params.set("step", step);
    router.replace(`/dashboard/domains?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1787D4" }} />
    </div>
  );
}

export default function RegisterDomainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#1787D4" }}
          />
        </div>
      }
    >
      <RegisterDomainRedirect />
    </Suspense>
  );
}
