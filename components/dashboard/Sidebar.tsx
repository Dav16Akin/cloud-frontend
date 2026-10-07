"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ChevronDown,
  LogOut,
  X,
  Settings,
  LayoutDashboard,
  ExternalLink,
  BookOpen,
  LayoutGrid,
  Clock,
  Globe,
  Server,
  Mail,
  Shield,
  Wrench,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Receipt,
  Headphones,
} from "lucide-react";
import Image from "next/image";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// ── Sidebar design tokens ──────────────────────────────────────────────────────
const S = {
  bg: "#033B5C", // user-specified dark oceanic background
  active: "#4AC3B4", // user-specified bright teal-cyan active state
  activeBg: "#054972", // active container fill matching mockup
  inactiveText: "#93b7cd", // soft muted slate-blue
  hoverBg: "rgba(255, 255, 255, 0.05)",
  userChipBg: "#02283f", // dark pill container
  cardBg: "#022a42", // bottom promo card background
  cardBorder: "rgba(255, 255, 255, 0.09)",
  divider: "rgba(255, 255, 255, 0.08)",
};

// ── Nav items strictly matching the shared screenshot ─────────────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  exact?: boolean;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    exact: true,
  },
  {
    label: "Expired",
    href: "/dashboard/expired-services",
    icon: Clock,
  },
  {
    label: "Domain List",
    href: "/dashboard/domains",
    icon: Globe,
  },
  {
    label: "Hosting List",
    href: "/dashboard/hosting",
    icon: Server,
  },
  {
    label: "Private Email",
    href: "/dashboard/email",
    icon: Mail,
    disabled: true,
  },
  {
    label: "SSL Certificates",
    href: "/dashboard/ssl",
    icon: Shield,
  },
  {
    label: "Profile",
    href: "/dashboard/settings",
    icon: User,
  },
  {
    label: "Tools",
    href: "/dashboard/tools",
    icon: Wrench,
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: me, isLoading } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";
  const email = me?.data?.email ?? "";
  const username =
    [firstName, lastName].filter(Boolean).join(" ") ||
    (email ? email.split("@")[0] : "alexprokhorov");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0 select-none"
      style={{ background: S.bg }}
    >
      {/* ── Mobile Close Header ────────────────────────────────────────────── */}
      {onClose && (
        <div
          className="flex items-center justify-end px-3 shrink-0 md:hidden"
          style={{ height: "48px", borderBottom: `1px solid ${S.divider}` }}
        >
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-white/70 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top User Pill / Dropdown ───────────────────────────────────────── */}
      <div className="relative px-3.5 pt-4 pb-2.5 shrink-0" ref={userMenuRef}>
        <button
          type="button"
          id="sidebar-user-chip"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl w-full cursor-pointer text-left transition-all border border-white/5 hover:border-white/15"
          style={{ background: S.userChipBg }}
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 bg-white/10 text-white/90">
            <User className="w-3.5 h-3.5" />
          </span>

          {isLoading ? (
            <div className="flex-1 h-3 rounded bg-white/15 animate-pulse" />
          ) : (
            <span className="flex-1 text-[13px] font-medium text-white truncate tracking-[-0.1px]">
              {username}
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-white/70 shrink-0 transition-transform duration-200 ${
              userMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div
            className="absolute left-3.5 right-3.5 top-full mt-1.5 py-1.5 z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: "#01243a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 14px 34px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header info */}
            <div
              className="px-3.5 py-2 border-b"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <p className="text-[12.5px] font-semibold text-white truncate">
                {username}
              </p>
              {email && (
                <p
                  className="text-[11px] truncate mt-0.5"
                  style={{ color: S.inactiveText }}
                >
                  {email}
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div className="p-1 flex flex-col gap-0.5">
              <Link
                href="/dashboard/settings"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-white/60" />
                Profile Settings
              </Link>
              <Link
                href="/dashboard/orders"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white/60" />
                Orders
              </Link>
              <Link
                href="/dashboard/invoices"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-white/60" />
                Invoices
              </Link>
              <Link
                href="/dashboard/tickets"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5 text-white/60" />
                Support Tickets
              </Link>
              <Link
                href="/dashboard"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-white/60" />
                Client Area Overview
              </Link>
              <Link
                href="/"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                Visit Main Site
              </Link>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-white/90 hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-white/60" />
                Help &amp; Docs ↗
              </a>

              <div
                className="my-1 h-px mx-1"
                style={{ background: "rgba(255, 255, 255, 0.08)" }}
              />

              <button
                type="button"
                id="sidebar-dropdown-logout"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50 text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Nav List ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-1.5 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={`${item.href}-${item.label}`}
                id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] opacity-40 cursor-not-allowed select-none"
                style={{ color: S.inactiveText }}
                title={`${item.label} is coming soon`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                  Soon
                </span>
              </div>
            );
          }

          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href.split("?")[0]);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-150 ${
                isActive
                  ? "font-medium shadow-xs"
                  : "hover:text-white"
              }`}
              style={{
                color: isActive ? S.active : S.inactiveText,
                background: isActive ? S.activeBg : "transparent",
              }}
            >
              {/* Active left indicator pill matching the mockup screenshot */}
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-full"
                  style={{ background: S.active }}
                />
              )}

              <Icon
                className="w-[18px] h-[18px] shrink-0 transition-colors"
                style={{ color: isActive ? S.active : S.inactiveText }}
              />

              <span className="truncate tracking-[-0.1px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Premium Protection Promo Card (matches screenshot) ─────────────── */}
      <div className="px-3.5 pt-2 pb-3.5 shrink-0">
        <div
          className="rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden"
          style={{
            background: S.cardBg,
            border: `1px solid ${S.cardBorder}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: S.active }} />
            <span className="text-[12px] font-semibold text-white tracking-[-0.1px]">
              Premium Protection
            </span>
          </div>

          {/* Photo Banner */}
          <div className="relative w-full h-[88px] rounded-xl overflow-hidden bg-[#044c77]">
            <Image
              src="/premium-protection-banner.png"
              alt="Premium Protection"
              fill
              className="object-cover object-center"
              sizes="200px"
            />
          </div>

          {/* Body Copy */}
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: S.inactiveText }}
          >
            Keep expired domains from entering redemption with automatic
            renewal and priority support.
          </p>

          {/* Action Link */}
          <Link
            href="/dashboard/expired-services"
            onClick={onClose}
            className="text-[11.5px] font-semibold text-white hover:text-[#4AC3B4] transition-colors flex items-center justify-between mt-0.5 group"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
