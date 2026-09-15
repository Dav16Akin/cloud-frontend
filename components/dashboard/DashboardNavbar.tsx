"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  ExternalLink,
  Menu,
  BookOpen,
  Globe,
  Server,
  Shield,
  Mail,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { FluidOrb } from "@/components/ui/fluid-orb";
import { usePathname } from "next/navigation";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// ── Navbar tokens — white surface ──────────────────────────────────────────────
const N = {
  bg: "#ffffff",
  hairline: "#e8e8ed",
  ink: "#1d1d1f",
  inkMuted: "#6e6e73",
  inkSubtle: "#aeaeb2",
  blue: "#1787D4",
  blueLight: "#e8f4fc",
  orange: "#e8900a",
};

type NavService = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

const NAV_SERVICES: NavService[] = [
  { id: "nav-domains",  label: "Domains",   href: "/dashboard/domains",  icon: Globe  },
  { id: "nav-hosting",  label: "Hosting",   href: "/dashboard/hosting",  icon: Server },
  { id: "nav-security", label: "Security",  href: "/dashboard/ssl",      icon: Shield },
  { id: "nav-email",    label: "Email",     href: "/dashboard/hosting",  icon: Mail,  badge: "NEW" },
];

type DashboardNavbarProps = {
  onMobileMenuOpen?: () => void;
  onSearchOpen?: () => void;
};

export default function DashboardNavbar({ onMobileMenuOpen, onSearchOpen }: DashboardNavbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: me } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const firstName  = me?.data?.firstName ?? "";
  const lastName   = me?.data?.lastName  ?? "";
  const email      = me?.data?.email     ?? "";
  const initials   = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  const { itemCount, toggleDrawer } = useCartStore();
  const [cartCount, setCartCount] = useState(0);
  const [shortcut, setShortcut] = useState("⌘ K");

  useEffect(() => { setCartCount(itemCount()); }, [itemCount]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShortcut(navigator.userAgent.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K");
    }
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header
      className="shrink-0 flex items-center gap-3 px-5"
      style={{
        height: "56px",
        background: N.bg,
        borderBottom: `1px solid ${N.hairline}`,
      }}
    >
      {/* Mobile hamburger */}
      <button
        id="dashboard-mobile-menu"
        onClick={onMobileMenuOpen}
        className="md:hidden p-1.5 rounded-lg transition-colors"
        style={{ color: N.inkMuted }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo — left anchor on desktop */}
      <Link
        href="/"
        id="dashboard-nav-logo"
        className="flex items-center shrink-0 mr-4"
      >
        <Image
          src="/images/nupat-cloud-logo-whitebg.png"
          alt="Nupat Cloud"
          width={124}
          height={34}
          className="h-auto w-auto object-contain"
          priority
        />
      </Link>

      {/* ── Service nav links — desktop ────────────────────────── */}
      <nav className="hidden md:flex items-center gap-0.5">
        {NAV_SERVICES.map((s) => {
          const active =
            s.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(s.href.split("?")[0]);

          return (
            <Link
              key={s.id}
              href={s.href}
              id={s.id}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap"
              style={{
                color: active ? N.blue : N.inkMuted,
                background: active ? N.blueLight : "transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              {s.label}
              {s.badge && (
                <span
                  className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold tracking-wider text-white"
                  style={{ background: N.blue }}
                >
                  {s.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Right cluster ──────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-2">

        {/* Search */}
        <button
          id="dashboard-search-trigger"
          onClick={onSearchOpen}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-150 cursor-pointer"
          style={{
            color: N.inkSubtle,
            border: `1px solid ${N.hairline}`,
            background: "#fafafa",
          }}
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: N.blue }} />
          <span className="hidden lg:inline select-none">Search...</span>
          <kbd
            className="hidden lg:inline-flex items-center rounded px-1.5 py-px text-[10px] font-mono ml-1"
            style={{
              background: N.bg,
              border: `1px solid ${N.hairline}`,
              color: N.inkSubtle,
            }}
          >
            {shortcut}
          </kbd>
        </button>

        {/* Docs */}
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="dashboard-nav-docs"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
          style={{ color: N.blue, background: N.blueLight }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Docs</span>
        </a>

        {/* Cart */}
        <button
          id="dashboard-nav-cart"
          onClick={toggleDrawer}
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: N.inkMuted }}
          aria-label="Shopping cart"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {cartCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 text-white text-[8px] font-extrabold flex items-center justify-center rounded-full"
              style={{ background: N.blue }}
            >
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Hairline divider */}
        <div className="w-px h-5 shrink-0" style={{ background: N.hairline }} />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            id="dashboard-nav-profile"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: N.ink }}
          >
            {/* Avatar */}
            <div className="relative flex w-7 h-7 rounded-full overflow-hidden items-center justify-center shrink-0">
              <FluidOrb size={28} color="#1787D4" className="absolute inset-0 w-full h-full pointer-events-none" />
              <span className="relative z-10 text-white text-[10px] font-bold select-none">{initials}</span>
            </div>
            {/* Name */}
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-[12px] font-semibold truncate max-w-[88px]" style={{ color: N.ink }}>
                {firstName} {lastName}
              </p>
              <p className="text-[10px] truncate max-w-[88px]" style={{ color: N.inkSubtle }}>{email}</p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              style={{ color: N.inkSubtle }}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 py-1 z-50"
              style={{
                background: N.bg,
                border: `1px solid ${N.hairline}`,
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${N.hairline}` }}>
                <p className="text-[12px] font-semibold truncate" style={{ color: N.ink }}>
                  {firstName} {lastName}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: N.inkMuted }}>{email}</p>
              </div>

              <div className="p-1">
                <Link
                  href="/dashboard"
                  id="dashboard-nav-overview-link"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ color: N.ink }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" style={{ color: N.inkMuted }} />
                  Client Area Overview
                </Link>
                <Link
                  href="/"
                  id="dashboard-nav-goto-main"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ color: N.ink }}
                >
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: N.inkMuted }} />
                  Visit Main Site
                </Link>
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="dashboard-nav-goto-docs"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors"
                  style={{ color: N.ink }}
                >
                  <BookOpen className="w-3.5 h-3.5" style={{ color: N.orange }} />
                  Help &amp; Documentation ↗
                </a>

                <div className="my-1 h-px mx-1" style={{ background: N.hairline }} />

                <button
                  id="dashboard-nav-logout"
                  onClick={() => { logout(); setProfileOpen(false); }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-red-50 disabled:opacity-50"
                  style={{ color: "#dc2626" }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
