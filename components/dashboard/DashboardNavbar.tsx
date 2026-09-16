"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Menu,
  BookOpen,
  Globe,
  Server,
  Shield,
  Mail,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
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
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const NAV_SERVICES: NavService[] = [
  { id: "nav-domains",  label: "Domains",   href: "/dashboard/domains",  icon: Globe },
  { id: "nav-hosting",  label: "Hosting",   href: "/dashboard/hosting",  icon: Server },
  { id: "nav-security", label: "Security",  href: "/dashboard/ssl",      icon: Shield },
  // Email service temporarily disabled as requested (code preserved)
  // { id: "nav-email",    label: "Email",     href: "/dashboard/email",    icon: Mail,  badge: "NEW" },
];

type DashboardNavbarProps = {
  onMobileMenuOpen?: () => void;
  onSearchOpen?: () => void;
};

export default function DashboardNavbar({ onMobileMenuOpen, onSearchOpen }: DashboardNavbarProps) {
  const pathname = usePathname();
  const { itemCount, toggleDrawer } = useCartStore();
  const [cartCount, setCartCount] = useState(0);
  const [shortcut, setShortcut] = useState("⌘ K");

  useEffect(() => { setCartCount(itemCount()); }, [itemCount]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShortcut(navigator.userAgent.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K");
    }
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
          src="/nupat_cloud_logo-nav.png"
          alt="Nupat Cloud"
          width={130}
          height={32}
          className="h-7 sm:h-8 w-auto object-contain cursor-pointer"
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
      </div>
    </header>
  );
}
