"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { refresh } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // If there's already a token in the store we're good immediately.
    if (token) {
      setAuthStatus("authenticated");
      return;
    }

    // No token — try a silent refresh before giving up.
    // The refresh endpoint uses the httpOnly cookie, so no token needed.
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
    // Only run once on mount; token changes are handled by the authStatus watch below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the token is cleared mid-session (e.g. both tokens expired), redirect.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

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
        <DashboardNavbar onMobileMenuOpen={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
