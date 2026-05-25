"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, LogOut, LayoutDashboard, ExternalLink, Menu } from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

type DashboardNavbarProps = {
  onMobileMenuOpen?: () => void;
};

export default function DashboardNavbar({ onMobileMenuOpen }: DashboardNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: me } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";
  const email = me?.data?.email ?? "";
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-[#e2eaff] shrink-0 flex items-center px-5 gap-4">

      {/* Mobile menu toggle */}
      <button
        id="dashboard-mobile-menu"
        onClick={onMobileMenuOpen}
        className="md:hidden p-1.5 text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-[#f6f9ff] border border-[#e2eaff] px-3 py-1.5 text-sm text-[#9ba8c0]">
        <Search className="w-4 h-4 shrink-0" />
        <span className="select-none">Search…</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 bg-white border border-[#e2eaff] px-1.5 py-0.5 text-[10px] font-mono text-[#9ba8c0]">
          ⌘ K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Visit main site — desktop only */}
        <Link
          href="/"
          id="dashboard-nav-main-site"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[#5a6a85] hover:text-[#031033] transition-colors px-3 py-1.5 hover:bg-[#f2f5fc]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Main Site
        </Link>

        {/* Bell */}
        <button
          id="dashboard-nav-notifications"
          className="relative p-2 text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#e8900a]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#e2eaff]" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="dashboard-nav-profile"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#f2f5fc] transition-colors"
          >
            <div className="w-7 h-7 bg-[#e8900a] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs font-semibold text-[#031033] truncate max-w-[90px]">
                {firstName} {lastName}
              </p>
              <p className="text-[10px] text-[#9ba8c0] truncate max-w-[90px]">{email}</p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#9ba8c0] transition-transform duration-200 shrink-0 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e2eaff] shadow-lg shadow-[#031033]/8 py-1 z-50">
              <div className="px-4 py-3 border-b border-[#e2eaff]">
                <p className="text-xs font-semibold text-[#031033] truncate">
                  {firstName} {lastName}
                </p>
                <p className="text-[10px] text-[#5a6a85] truncate mt-0.5">{email}</p>
              </div>
              <Link
                href="/dashboard"
                id="dashboard-nav-overview-link"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#5a6a85]" />
                Dashboard Overview
              </Link>
              <Link
                href="/"
                id="dashboard-nav-goto-main"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#5a6a85]" />
                Visit Main Site
              </Link>
              <div className="my-1 border-t border-[#e2eaff]" />
              <button
                id="dashboard-nav-logout"
                onClick={() => { logout(); setProfileOpen(false); }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
