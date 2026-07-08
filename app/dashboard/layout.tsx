"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CartDrawer from "@/components/layout/CartDrawer";
import SearchModal from "@/components/dashboard/SearchModal";
import { refresh } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          res?.accessToken ?? res?.data?.accessToken ?? res?.token ?? res?.data?.token;
        if (newToken) {
          setToken(newToken);
          setAuthStatus("authenticated");
        } else {
          logout();
          setAuthStatus("unauthenticated");
        }
      })
      .catch(() => {
        // Refresh token expired or missing — redirect to login
        logout();
        setAuthStatus("unauthenticated");
      });
    // Re-run whenever hydration completes; token changes mid-session are handled
    // by fetchWithRefresh in api.ts which updates the store directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // If the token is cleared mid-session (e.g. both tokens expired), redirect.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

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
      <div className="flex h-screen items-center justify-center bg-[#f6f9ff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8900a]" />
      </div>
    );
  }

  // Redirect in flight
  if (authStatus === "unauthenticated") return null;

  return (
    <>
      <div className="flex h-screen bg-[#f6f9ff] overflow-hidden">

        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>

        {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
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

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
