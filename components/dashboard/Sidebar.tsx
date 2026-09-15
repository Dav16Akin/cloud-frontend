"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  User,
  ChevronDown,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

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
  { label: "Dashboard",        href: "/dashboard",            exact: true },
  { label: "Domain List",      href: "/dashboard/domains",    subItems: [
      { label: "Register / Search",  href: "/dashboard/domains?tab=register"  },
      { label: "Registered Domains", href: "/dashboard/domains?tab=registered"},
      { label: "Hosted Domains",     href: "/dashboard/domains?tab=hosted"    },
      { label: "Domain Transfer",    href: "/dashboard/domain-transfer"       },
  ]},
  { label: "Hosting List",     href: "/dashboard/hosting"    },
  { label: "Private Email",    href: "/dashboard/hosting"    },
  { label: "SSL Certificates", href: "/dashboard/ssl"        },
  { label: "Orders",           href: "/dashboard/orders"     },
  { label: "Invoices",         href: "/dashboard/invoices"   },
  { label: "Support Tickets",  href: "/dashboard/tickets"    },
  { label: "Profile",          href: "/dashboard/settings"   },
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

  const firstName = me?.data?.firstName ?? "";
  const lastName  = me?.data?.lastName  ?? "";
  const username  = [firstName, lastName].filter(Boolean).join(" ") || "Account";

  const isDomainsActive =
    pathname.startsWith("/dashboard/domains") ||
    pathname.startsWith("/dashboard/domain-transfer");

  const [domainsOpen, setDomainsOpen] = useState(isDomainsActive);

  useEffect(() => {
    if (isDomainsActive) setDomainsOpen(true);
  }, [pathname, isDomainsActive]);

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

      {/* ── User chip ─────────────────────────────────────────── */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full cursor-default"
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

          <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: S.textMuted }} />
        </div>
      </div>

      {/* ── Nav list ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-px">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href.split("?")[0]) &&
              // Prevent "Hosting List" from being active on /dashboard/hosting/... when "Private Email" is also /dashboard/hosting
              // Both map to same route — just highlight Hosting List
              !(item.label === "Private Email" && pathname.startsWith("/dashboard/hosting"));

          // Domain List with sub-items
          if (item.subItems) {
            const domainActive =
              pathname.startsWith("/dashboard/domains") ||
              pathname.startsWith("/dashboard/domain-transfer");

            return (
              <div key={item.href}>
                <div
                  className="flex items-center justify-between rounded-lg transition-colors duration-150"
                  style={{ background: domainActive ? S.bgActive : "transparent" }}
                >
                  <Link
                    href={item.href}
                    id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    className="flex-1 px-3 py-2 text-[13.5px] transition-colors duration-150"
                    style={{
                      color: domainActive ? S.textPrimary : S.textInactive,
                      fontWeight: domainActive ? 500 : 400,
                      letterSpacing: "-0.1px",
                    }}
                  >
                    {item.label}
                  </Link>
                  <button
                    onClick={() => setDomainsOpen((v) => !v)}
                    className="px-2 py-2 transition-colors"
                    style={{ color: domainActive ? S.textPrimary : S.textMuted }}
                    aria-label="Toggle domain sub-menu"
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${domainsOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                {domainsOpen && (
                  <Suspense fallback={null}>
                    <SubItems
                      items={item.subItems}
                      onClose={onClose}
                      pathname={pathname}
                    />
                  </Suspense>
                )}
              </div>
            );
          }

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
