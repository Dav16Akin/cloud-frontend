"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  User,
  ChevronDown,
  LogOut,
  X,
  ChevronRight,
  Settings,
  LayoutDashboard,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// ── Sidebar design tokens — dark teal, matching screenshot ───────────────────
const S = {
  // Surfaces — brand navy palette
  bg: "#031033",                     // brand navy
  bgActive: "#1787D4",               // brand blue active pill
  bgUser: "rgba(255,255,255,0.07)",  // subtle user chip

  // Text
  textPrimary: "#ffffff",
  textInactive: "rgba(255,255,255,0.58)",
  textMuted: "rgba(255,255,255,0.32)",

  // Structural
  divider: "rgba(255,255,255,0.08)",
};

// ── Nav items — flat list matching picture structure ──────────────────────────
type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
  subItems?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",        href: "/dashboard",                   exact: true },
  { label: "Domain List",      href: "/dashboard/domains"                        },
  { label: "Hosting List",     href: "/dashboard/hosting"                        },
  { label: "Private Email",    href: "/dashboard/email"                          },
  { label: "SSL Certificates", href: "/dashboard/ssl"                            },
  { label: "Orders",           href: "/dashboard/orders"                         },
  { label: "Invoices",         href: "/dashboard/invoices"                       },
  { label: "Expired Services", href: "/dashboard/expired-services"               },
  { label: "Support Tickets",  href: "/dashboard/tickets"                        },
  { label: "Profile",          href: "/dashboard/settings"                       },
  { label: "Tools",            href: "/dashboard/tools"                          },
];


// ── Sub-items (Domains expand) ─────────────────────────────────────────────
function SubItems({
  items,
  onClose,
  pathname,
}: {
  items: { label: string; href: string }[];
  onClose?: () => void;
  pathname: string;
}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "registered";

  return (
    <div
      className="flex flex-col pl-4 mt-0.5 gap-px"
      style={{ borderLeft: `1px solid ${S.divider}`, marginLeft: "16px" }}
    >
      {items.map(({ label, href }) => {
        const isTransfer = href.includes("domain-transfer");
        let isActive = false;
        if (isTransfer) {
          isActive = pathname.startsWith("/dashboard/domain-transfer");
        } else {
          const tabMatch = href.match(/tab=([^&]+)/);
          const tabName = tabMatch ? tabMatch[1] : "registered";
          isActive = pathname === "/dashboard/domains" && activeTab === tabName;
        }

        return (
          <Link
            key={href}
            href={href}
            id={`sidebar-sub-${label.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={onClose}
            className="py-1.5 px-3 rounded-md text-[12.5px] transition-colors duration-150"
            style={{
              color: isActive ? S.textPrimary : S.textInactive,
              background: isActive ? "rgba(27,107,120,0.5)" : "transparent",
              fontWeight: isActive ? 500 : 400,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: me, isLoading } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const firstName = me?.data?.firstName ?? "";
  const lastName  = me?.data?.lastName  ?? "";
  const email     = me?.data?.email     ?? "";
  const username  = [firstName, lastName].filter(Boolean).join(" ") || "Account";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0"
      style={{ background: S.bg }}
    >
      {/* ── Mobile close (no logo — logo lives in the topbar) ─── */}
      {onClose && (
        <div
          className="flex items-center justify-end px-3 shrink-0 md:hidden"
          style={{ height: "48px", borderBottom: `1px solid ${S.divider}` }}
        >
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: S.textMuted }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── User chip & Dropdown ─────────────────────────────────── */}
      <div className="relative px-3 pt-4 pb-2 shrink-0" ref={userMenuRef}>
        <button
          type="button"
          id="sidebar-user-chip"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full cursor-pointer text-left transition-colors hover:bg-white/10"
          style={{ background: S.bgUser }}
        >
          {/* Avatar icon */}
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.8)" }} />
          </span>

          {/* Name */}
          {isLoading ? (
            <div
              className="flex-1 h-3 rounded animate-pulse"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />
          ) : (
            <span
              className="flex-1 text-[13px] font-medium truncate"
              style={{ color: S.textPrimary, letterSpacing: "-0.1px" }}
            >
              {username}
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              userMenuOpen ? "rotate-180" : ""
            }`}
            style={{ color: S.textMuted }}
          />
        </button>

        {/* User Dropdown Popover */}
        {userMenuOpen && (
          <div
            className="absolute left-3 right-3 top-full mt-1.5 py-1 z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: "#01283d",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* User Info Header */}
            <div
              className="px-3.5 py-2.5 border-b"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <p
                className="text-[12.5px] font-semibold truncate"
                style={{ color: S.textPrimary }}
              >
                {username}
              </p>
              {email && (
                <p
                  className="text-[11px] truncate mt-0.5"
                  style={{ color: S.textMuted }}
                >
                  {email}
                </p>
              )}
            </div>

            {/* Menu Links */}
            <div className="p-1 flex flex-col gap-0.5">
              <Link
                href="/dashboard/settings"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-colors hover:bg-white/10"
                style={{ color: S.textPrimary }}
              >
                <Settings className="w-3.5 h-3.5" style={{ color: S.textMuted }} />
                Profile Settings
              </Link>
              <Link
                href="/dashboard"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-colors hover:bg-white/10"
                style={{ color: S.textPrimary }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" style={{ color: S.textMuted }} />
                Client Area Overview
              </Link>
              <Link
                href="/"
                onClick={() => {
                  setUserMenuOpen(false);
                  onClose?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-colors hover:bg-white/10"
                style={{ color: S.textPrimary }}
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: S.textMuted }} />
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-colors hover:bg-white/10"
                style={{ color: S.textPrimary }}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
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
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50 text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Nav list ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-px">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href.split("?")[0]);

          // Regular item
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-[13.5px] transition-colors duration-150"
              style={{
                color: isActive ? S.textPrimary : S.textInactive,
                background: isActive ? S.bgActive : "transparent",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "-0.1px",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div
        className="px-3 pb-4 pt-2 shrink-0 flex flex-col gap-px"
        style={{ borderTop: `1px solid ${S.divider}` }}
      >
        <Link
          href="/dashboard/tickets"
          id="sidebar-feedback-support"
          className="px-3 py-2 rounded-lg text-[13px] transition-colors duration-150"
          style={{ color: S.textInactive }}
        >
          Feedback &amp; Support
        </Link>
        <button
          id="sidebar-logout"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors duration-150 group disabled:opacity-50 w-full text-left"
          style={{ color: S.textMuted }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:text-red-400 transition-colors" />
          <span className="group-hover:text-red-400 transition-colors">
            {isLoggingOut ? "Logging out…" : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}
