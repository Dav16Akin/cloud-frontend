"use client";

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { ApiError, RateLimitError } from "@/lib/api";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (
              error instanceof RateLimitError ||
              (error instanceof ApiError && error.status === 429)
            ) {
              const waitSecs = (error as RateLimitError).retryAfter || 60;
              toast.error(
                `Rate limit reached. Please wait ${waitSecs}s before retrying.`,
                { id: "rate-limit-toast" }
              );
            } else if (error instanceof ApiError && error.status === 403) {
              toast.error(
                error.message || "Access denied: You do not have permission.",
                { id: "forbidden-toast" }
              );
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (
              error instanceof RateLimitError ||
              (error instanceof ApiError && error.status === 429)
            ) {
              const waitSecs = (error as RateLimitError).retryAfter || 60;
              toast.error(
                `Rate limit reached. Please wait ${waitSecs}s before retrying.`,
                { id: "rate-limit-toast" }
              );
            } else if (error instanceof ApiError && error.status === 403) {
              toast.error(
                error.message || "Access denied: You do not have permission.",
                { id: "forbidden-toast" }
              );
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              // Never automatically retry on 401, 403, 404, or 429
              if (error instanceof ApiError) {
                if ([401, 403, 404, 429].includes(error.status)) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: { fontFamily: "var(--font-sans)" },
        }}
      />
    </QueryClientProvider>
  );
}
