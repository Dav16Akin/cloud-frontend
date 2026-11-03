"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  ChevronDown,
  Settings,
  ShoppingBag,
  Receipt,
  Headphones,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/dashboard/NotificationBell";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// Shared class for the icon buttons in the right cluster (36px square).
const ICON_BUTTON =
  "relative flex h-9 w-9 items-center justify-center rounded-lg text-[#5A6A85] transition-colors hover:bg-[#F2F5FC] hover:text-[#031033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30";

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
];

const noopSubscribe = () => () => {};

type DashboardNavbarProps = {
  onMobileMenuOpen?: () => void;
  onSearchOpen?: () => void;
};

export default function DashboardNavbar({ onMobileMenuOpen, onSearchOpen }: DashboardNavbarProps) {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);
  // Client-only values (cart lives in localStorage; the shortcut depends on the OS).
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const shortcut = useSyncExternalStore(
    noopSubscribe,
    () => (navigator.userAgent.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K"),
    () => "⌘ K",
  );

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
      {/* Mobile hamburger */}
      <button
        type="button"
        id="dashboard-mobile-menu"
        onClick={onMobileMenuOpen}
        className={`md:hidden -ml-1.5 ${ICON_BUTTON}`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo — left anchor on desktop */}
      <Link
        href="/"
        id="dashboard-nav-logo"
        className="mr-4 flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
      >
        <Image
          src="/nupat_cloud_logo-nav.png"
          alt="Nupat Cloud"
          width={130}
          height={32}
          className="h-7 w-auto cursor-pointer object-contain sm:h-8"
          priority
        />
      </Link>

      {/* ── Service nav links — desktop ────────────────────────── */}
      <nav className="hidden items-center gap-1 md:flex">
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
              aria-current={active ? "page" : undefined}
              className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 ${
                active
                  ? "bg-[#F2F5FC] font-medium text-[#031033]"
                  : "text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033]"
              }`}
            >
              {s.label}
              {s.badge && (
                <span className="inline-flex items-center rounded-full bg-[#E8F4FC] px-2 py-0.5 text-xs font-medium text-[#1787D4]">
                  {s.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Right cluster ──────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}
        <button
          type="button"
          id="dashboard-search-trigger"
          onClick={onSearchOpen}
          className="flex h-9 w-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#D5DCE6] bg-white text-sm text-[#5A6A85] transition-colors hover:border-[#C3CCD9] hover:text-[#031033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 sm:w-auto sm:min-w-56 sm:justify-start sm:px-3"
          aria-label="Search"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden select-none sm:inline">Search…</span>
          <kbd className="ml-auto hidden items-center rounded border border-[#E2E8F0] bg-[#F2F5FC] px-1.5 py-px font-sans text-xs text-[#5A6A85] lg:inline-flex">
            {shortcut}
          </kbd>
        </button>

        {/* Docs */}
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="dashboard-nav-docs"
          className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[#1787D4] transition-colors hover:bg-[#E8F4FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30 sm:flex"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden lg:inline">Docs</span>
        </a>

        {/* Expiry notification bell */}
        <NotificationBell />

        {/* Cart */}
        <Link
          href="/dashboard/cart"
          id="dashboard-nav-cart"
          className={`cursor-pointer ${ICON_BUTTON}`}
          aria-label="Shopping cart"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {mounted && cartCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#1787D4] px-1 text-xs font-medium leading-none tabular-nums text-white ring-2 ring-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>

        <span className="mx-1.5 hidden h-6 w-px bg-[#E2E8F0] sm:block" aria-hidden />

        <AccountMenu />
      </div>
    </header>
  );
}

// ── Account dropdown (far right of the top bar) ──────────────────────────────
const MENU_ITEM =
  "flex h-9 items-center gap-3 px-4 text-sm text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:bg-[#F2F5FC] focus-visible:outline-none";
const MENU_ICON = "h-4 w-4 shrink-0 text-[#5A6A85]";

function AccountMenu() {
  const { data: me, isLoading } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";
  const email = me?.data?.email ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || (email ? email.split("@")[0] : "Account");
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || (email[0] ?? "").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="navbar-account-menu"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/30"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#031033] text-xs font-medium text-white">
          {isLoading ? "" : initials || <Settings className="h-3.5 w-3.5" />}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-[#031033] md:block">
          {isLoading ? "…" : name}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#5A6A85] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg"
        >
          <div className="border-b border-[#EEF2F7] px-4 py-3">
            <p className="truncate text-sm font-medium text-[#031033]">{name}</p>
            {email && <p className="truncate text-xs text-[#5A6A85]">{email}</p>}
          </div>
          <div className="py-1">
            <Link href="/dashboard/settings" role="menuitem" onClick={close} className={MENU_ITEM}>
              <Settings className={MENU_ICON} />
              Profile settings
            </Link>
            <Link href="/dashboard/orders" role="menuitem" onClick={close} className={MENU_ITEM}>
              <ShoppingBag className={MENU_ICON} />
              Orders
            </Link>
            <Link href="/dashboard/invoices" role="menuitem" onClick={close} className={MENU_ITEM}>
              <Receipt className={MENU_ICON} />
              Invoices
            </Link>
            <Link href="/dashboard/tickets" role="menuitem" onClick={close} className={MENU_ITEM}>
              <Headphones className={MENU_ICON} />
              Support tickets
            </Link>
            <Link href="/" role="menuitem" onClick={close} className={MENU_ITEM}>
              <ExternalLink className={MENU_ICON} />
              Visit main site
            </Link>
          </div>
          <div className="border-t border-[#EEF2F7] py-1">
            <button
              type="button"
              role="menuitem"
              id="navbar-logout"
              onClick={() => {
                close();
                logout();
              }}
              disabled={isLoggingOut}
              className={`${MENU_ITEM} w-full text-left text-[#C21F1F] disabled:opacity-50`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
