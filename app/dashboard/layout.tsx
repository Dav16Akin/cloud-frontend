"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ExpiryBanner from "@/components/dashboard/ExpiryBanner";
import SearchModal from "@/components/dashboard/SearchModal";
import { refresh } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setToken = useAuthStore((s) => s.setToken);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Wait until Zustand has finished reading from localStorage.
    // This prevents a false logout on hard reloads (e.g. after a Paystack redirect)
    // where the store briefly shows token = null before hydration completes.
    if (!hasHydrated) return;

    if (token) {
      // Token is present and hydration is complete — user is authenticated.
      setAuthStatus("authenticated");
      return;
    }

    // No token after hydration — try a silent refresh using the httpOnly cookie.
    refresh()
      .then((res) => {
        const newToken: string =
          res?.accessToken ??
          res?.data?.accessToken ??
          res?.token ??
          res?.data?.token;
        if (newToken) {
          setToken(newToken);
          setAuthStatus("authenticated");
        } else {
          queryClient.clear();
          logout();
          setAuthStatus("unauthenticated");
        }
      })
      .catch(() => {
        // Refresh token expired or missing — redirect to login
        queryClient.clear();
        logout();
        setAuthStatus("unauthenticated");
      });
    // Re-run whenever hydration completes; token changes mid-session are handled
    // by fetchWithRefresh in api.ts which updates the store directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, queryClient]);

  // If the token is cleared mid-session (e.g. both tokens expired), redirect to home screen.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      queryClient.clear();
      router.replace("/");
    }
  }, [authStatus, router, queryClient]);

  // Global keydown listener for Cmd+K / Ctrl+K search toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show spinner while we're determining auth state
  if (authStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F2F5FC]">
        <Loader2
          className="w-5 h-5 animate-spin text-[#1787D4]"
          aria-label="Loading"
        />
      </div>
    );
  }

  // Redirect in flight
  if (authStatus === "unauthenticated") return null;

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#F2F5FC]">
        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>

        {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-[#031033]/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 flex h-full">
              <Sidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navbar — visible on all screen sizes */}
          <DashboardNavbar
            onMobileMenuOpen={() => setMobileSidebarOpen(true)}
            onSearchOpen={() => setIsSearchOpen(true)}
          />

          {/* Full-width thin dark expiry banner directly under navbar */}
          <ExpiryBanner />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
