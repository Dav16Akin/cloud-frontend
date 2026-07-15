"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Globe,
  ArrowRightLeft,
  Receipt,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  ExternalLink,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { useGetMe } from "@/hooks/useUser";
import { useLogout } from "@/hooks/useAuth";

type LinkItem = {
  label: string;
  href: string;
  icon: any;
  subLinks?: { label: string; href: string }[];
};

type NavGroup = {
  label: string;
  links: LinkItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "GENERAL",
    links: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    label: "SERVICES",
    links: [
      { label: "Hosting", href: "/dashboard/hosting", icon: Server },
      {
        label: "Domains",
        href: "/dashboard/domains",
        icon: Globe,
        subLinks: [
          { label: "Register / Search", href: "/dashboard/domains?tab=register" },
          { label: "Registered Domains", href: "/dashboard/domains?tab=registered" },
          { label: "Hosted Domains", href: "/dashboard/domains?tab=hosted" },
          { label: "Domain Transfer", href: "/dashboard/domain-transfer" },
        ],
      },
    ],
  },
  {
    label: "BILLING & SUPPORT",
    links: [
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
      { label: "Support Tickets", href: "/dashboard/tickets", icon: LifeBuoy },
    ],
  },
];

function SidebarSubLinks({
  subLinks,
  onClose,
  pathname,
}: {
  subLinks: { label: string; href: string }[];
  onClose?: () => void;
  pathname: string;
}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "registered";

  return (
    <div className="flex flex-col gap-0.5 ml-6 pl-3 border-l border-[#e2eaff] mt-0.5 mb-1.5">
      {subLinks.map(({ label, href }) => {
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
            className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 rounded ${
              isActive
                ? "bg-[#fff8ee] text-[#e8900a] font-semibold"
                : "text-[#5a6a85] hover:bg-[#f2f5fc] hover:text-[#031033]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: me, isLoading } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";
  const email = me?.data?.email ?? "";
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  const isDomainsPath =
    pathname.startsWith("/dashboard/domains") || pathname.startsWith("/dashboard/domain-transfer");
  const [domainsExpanded, setDomainsExpanded] = useState(isDomainsPath);

  useEffect(() => {
    if (isDomainsPath) {
      setDomainsExpanded(true);
    }
  }, [pathname, isDomainsPath]);

  return (
    <aside className="flex flex-col h-full bg-white border-r border-[#e2eaff] w-64 shrink-0">

      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[#e2eaff] shrink-0">
        <Link href="/dashboard" id="sidebar-logo">
          <Image
            src="/images/nupat-cloud-logo-whitebg.png"
            alt="Nupat Cloud"
            width={120}
            height={34}
            className="h-auto w-auto object-contain"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-[#9ba8c0] uppercase select-none">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.links.map((link) => {
                const { label, href, icon: Icon, subLinks } = link;

                const isParentActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href) ||
                      (subLinks &&
                        subLinks.some((sub) =>
                          pathname.startsWith(sub.href.split("?")[0])
                        ));

                if (subLinks) {
                  return (
                    <div key={href} className="flex flex-col">
                      <div
                        className={`flex items-center w-full transition-all duration-150 border-l-2 rounded-r ${
                          isParentActive
                            ? "border-[#e8900a] bg-[#fff8ee]"
                            : "border-transparent hover:bg-[#f2f5fc]"
                        }`}
                      >
                        <Link
                          href={href}
                          id={`sidebar-${label.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={onClose}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium ${
                            isParentActive ? "text-[#031033]" : "text-[#5a6a85] hover:text-[#031033]"
                          }`}
                        >
                          <Icon
                            className={`w-[17px] h-[17px] shrink-0 ${
                              isParentActive ? "text-[#e8900a]" : "text-[#9ba8c0]"
                            }`}
                          />
                          <span className="flex-1">{label}</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDomainsExpanded(!domainsExpanded);
                          }}
                          className={`p-2 transition-colors shrink-0 rounded-r ${
                            isParentActive
                              ? "text-[#e8900a] hover:bg-[#ffeacf]/50"
                              : "text-[#9ba8c0] hover:text-[#031033] hover:bg-gray-200/50"
                          }`}
                          aria-label="Toggle sub-menu"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              domainsExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {domainsExpanded && (
                        <Suspense
                          fallback={
                            <div className="ml-6 pl-3 text-xs text-[#9ba8c0] animate-pulse py-1.5">
                              Loading...
                            </div>
                          }
                        >
                          <SidebarSubLinks
                            subLinks={subLinks}
                            onClose={onClose}
                            pathname={pathname}
                          />
                        </Suspense>
                      )}
                    </div>
                  );
                }

                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    id={`sidebar-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-150 border-l-2 ${
                      isActive
                        ? "border-[#e8900a] bg-[#fff8ee] text-[#031033]"
                        : "border-transparent text-[#5a6a85] hover:bg-[#f2f5fc] hover:text-[#031033] hover:border-[#e2eaff]"
                    }`}
                  >
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        isActive ? "text-[#e8900a]" : "text-[#9ba8c0]"
                      }`}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Visit main site */}
      <div className="px-3 pt-3 border-t border-[#e2eaff] shrink-0">
        {/* <Link
          href="/"
          id="sidebar-visit-main"
          className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#5a6a85] hover:bg-[#f2f5fc] hover:text-[#031033] transition-colors"
        >
          <ExternalLink className="w-[17px] h-[17px] shrink-0 text-[#9ba8c0]" />
          Visit Main Site
        </Link> */}
      </div>

      {/* User section */}
      <div className="px-3 py-3 shrink-0">
        {isLoading ? (
          <div className="px-3 py-2">
            <div className="h-4 w-28 bg-[#f2f5fc] rounded animate-pulse mb-1.5" />
            <div className="h-3 w-36 bg-[#f2f5fc] rounded animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {/* Gradient avatar */}
            <div className="w-8 h-8 bg-[#e8900a] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#031033] truncate">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-[#5a6a85] truncate">{email}</p>
            </div>
          </div>
        )}

        <button
          id="sidebar-logout"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#5a6a85] hover:bg-red-50 hover:text-red-500 transition-all duration-150 disabled:opacity-60"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          {isLoggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
