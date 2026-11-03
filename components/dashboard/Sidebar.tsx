"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  X,
  LogOut,
  LayoutGrid,
  Clock,
  Globe,
  Server,
  Shield,
  Wrench,
  Receipt,
  Headphones,
  Cpu,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

// ── Sidebar palette: brand navy, matching the rest of the dashboard ──────────
// bg #031033 (brand ink) · active fill white/10 · active icon #1787D4 (brand primary)

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

type NavGroup = { label?: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid, exact: true }],
  },
  {
    label: "Services",
    items: [
      { label: "Domain list", href: "/dashboard/domains", icon: Globe },
      { label: "Hosting list", href: "/dashboard/hosting", icon: Server },
      { label: "VPS servers", href: "/dashboard/vps", icon: Cpu },
      { label: "SSL certificates", href: "/dashboard/ssl", icon: Shield },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
      { label: "Expired", href: "/dashboard/expired-services", icon: Clock },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Support tickets", href: "/dashboard/tickets", icon: Headphones },
      { label: "Tools", href: "/dashboard/tools", icon: Wrench },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/dashboard/settings", icon: User }],
  },
];

const ROW =
  "flex h-9 shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/60";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <aside className="flex h-full w-60 shrink-0 select-none flex-col bg-[#031033]">
      {/* Mobile close header */}
      {onClose && (
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-white/10 px-3 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]/60"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grouped nav */}
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-5" aria-label="Dashboard">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? gi} className="flex flex-col gap-0.5">
            {group.label && (
              <p className="mb-1 px-3 text-xs font-medium text-white/50">{group.label}</p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href.split("?")[0]);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`${ROW} ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1787D4]" : ""}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Log out */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          id="sidebar-logout"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className={`${ROW} w-full text-white/70 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
