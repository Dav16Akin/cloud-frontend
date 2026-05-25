"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // isMounted guarantees we're on the client and Zustand has read localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.replace("/login");
    }
  }, [isMounted, token, router]);

  // Show spinner until client JS has run
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f9ff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#e8900a]" />
      </div>
    );
  }

  // Mounted but no token — redirect is in flight
  if (!token) return null;

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
