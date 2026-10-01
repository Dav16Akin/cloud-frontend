import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        if (error?.status === 429 || error?.name === "RateLimitError") {
          const waitSecs = error?.retryAfter || 60;
          toast.error(
            `Rate limit reached. Please wait ${waitSecs}s before retrying.`,
            { id: "rate-limit-toast" }
          );
        } else if (error?.status === 403 || error?.name === "ForbiddenError") {
          toast.error(
            error?.message || "Access denied: You do not have permission.",
            { id: "forbidden-toast" }
          );
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        if (error?.status === 429 || error?.name === "RateLimitError") {
          const waitSecs = error?.retryAfter || 60;
          toast.error(
            `Rate limit reached. Please wait ${waitSecs}s before retrying.`,
            { id: "rate-limit-toast" }
          );
        } else if (error?.status === 403 || error?.name === "ForbiddenError") {
          toast.error(
            error?.message || "Access denied: You do not have permission.",
            { id: "forbidden-toast" }
          );
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false, // Prevents request flood when switching between IDE and browser
        refetchOnReconnect: false,
        retry: (failureCount, error: any) => {
          // Never automatically retry on 401, 403, 404, or 429
          if ([401, 403, 404, 429].includes(error?.status)) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render.
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

/**
 * Completely clears all cached query data.
 * Safe to call anywhere (inside or outside React components).
 */
export function clearQueryCache(): void {
  if (browserQueryClient) {
    browserQueryClient.clear();
  }
}
