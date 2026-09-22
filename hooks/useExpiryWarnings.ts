import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpiryWarnings,
  type ExpiryWarning,
  type ExpiryWarningsResponse,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const DISMISSED_WARNINGS_SESSION_KEY = "nupat_dismissed_expiry_warnings";

export const useGetExpiryWarnings = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["expiry-warnings"],
    queryFn: async () => {
      const res = await getExpiryWarnings();
      let payload: ExpiryWarningsResponse = { count: 0, warnings: [] };

      if ((res as any)?.data && typeof (res as any).data === "object") {
        payload = (res as any).data;
      } else if (res && typeof res === "object" && "warnings" in res) {
        payload = res as ExpiryWarningsResponse;
      }

      const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
      const count = typeof payload.count === "number" ? payload.count : warnings.length;

      return { count, warnings };
    },
    enabled: !!token,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // background refresh every 5 min
  });
};

/**
 * Session-only dismissal hook for expiry warnings.
 * Uses sessionStorage with key "nupat_dismissed_expiry_warnings".
 * Stores keys in format: HOSTING:<id> and DOMAIN:<id>
 */
export const useDismissedWarnings = () => {
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(DISMISSED_WARNINGS_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDismissedKeys(parsed);
        }
      }
    } catch {}
  }, []);

  const dismissWarning = useCallback((type: "HOSTING" | "DOMAIN", id: string) => {
    const key = `${type}:${id}`;
    setDismissedKeys((prev) => {
      if (prev.includes(key)) return prev;
      const updated = [...prev, key];
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            DISMISSED_WARNINGS_SESSION_KEY,
            JSON.stringify(updated)
          );
        } catch {}
      }
      return updated;
    });
  }, []);

  const isDismissed = useCallback(
    (type: "HOSTING" | "DOMAIN", id: string) => {
      return dismissedKeys.includes(`${type}:${id}`);
    },
    [dismissedKeys]
  );

  return { dismissedKeys, dismissWarning, isDismissed };
};

export const useInvalidateExpiryWarnings = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["expiry-warnings"] });
};
