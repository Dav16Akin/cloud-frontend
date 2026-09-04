"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  Globe,
  ArrowRightLeft,
  Shield,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Server,
  Headphones,
  BookOpen,
  Tag,
  ChevronDown,
  Zap,
  BotMessageSquare,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { FluidOrb } from "@/components/ui/fluid-orb";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useLogout } from "@/hooks/useAuth";
import { useGetMe } from "@/hooks/useUser";
import CartDrawer from "@/components/layout/CartDrawer";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

/* ─── Data ──────────────────────────────────────────────────── */
const productsLinks = [
  {
    title: "Web Hosting",
    href: "/hosting",
    icon: Server,
    description: "Fast, reliable hosting for every site.",
  },
  {
    title: "Domain Names",
    href: "/domains",
    icon: Globe,
    description: "Find and register your perfect domain.",
  },
  {
    title: "Domain Transfer",
    href: "/domain-transfer",
    icon: ArrowRightLeft,
    description: "Move your domain to Nupat Cloud.",
  },
  {
    title: "SSL Certificates",
    href: "/dashboard/ssl",
    icon: Shield,
    description: "Secure visitors with 256-bit encryption.",
  },
];

const resourcesLinks = [
  {
    title: "Documentation",
    href: DOCS_URL,
    icon: BookOpen,
    description: "Guides, references & API docs.",
  },
  {
    title: "Help Center",
    href: "/contact",
    icon: Headphones,
    description: "Our team is ready to help.",
  },
  {
    title: "Blog",
    href: "/blog",
    icon: FileText,
    description: "News, tips and product updates.",
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Tag,
    description: "Transparent plans for every budget.",
  },
];

/* ─── Scroll hook ───────────────────────────────────────────── */
function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const fn = React.useCallback(
    () => setScrolled(window.scrollY > threshold),
    [threshold],
  );
  React.useEffect(() => {
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [fn]);
  React.useEffect(() => {
    fn();
  }, [fn]);
  return scrolled;
}

/* ─── Dropdown card item ────────────────────────────────────── */
function DropdownItem({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-2.5 !rounded-[8px] transition-colors hover:bg-[#eff6ff] group"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center !rounded-[8px] border border-[#e2eaff] bg-white shadow-sm">
        <Icon className="h-4 w-4 text-[#1787D4]" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#031033] leading-none mb-1">
          {title}
        </p>
        {description && (
          <p className="text-[11.5px] text-[#5a6a85] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ─── Mobile portal ─────────────────────────────────────────── */
function MobileMenu({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div
      id="mobile-menu"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-white/95 backdrop-blur-xl border-t border-[#e2eaff] md:hidden animate-in fade-in-0 slide-in-from-top-2"
      style={{ top: 88 }}
    >
      <div className="flex flex-col justify-between gap-4 p-4 min-h-full">
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ═══ NAVBAR ════════════════════════════════════════════════════ */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const scrolled = useScroll(10);

  const token = useAuthStore((s) => s.token);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: me } = useGetMe();
  const { itemCount, toggleDrawer } = useCartStore();
  const cartCount = itemCount();

  /* Cart only on domain pages */
  const showCart =
    pathname.startsWith("/domains") || pathname.startsWith("/dashboard/domain");

  const firstName = me?.data?.firstName ?? "";
  const lastName = me?.data?.lastName ?? "";
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const productsActive =
    pathname.startsWith("/hosting") ||
    pathname.startsWith("/domains") ||
    pathname.startsWith("/dashboard/ssl") ||
    pathname.startsWith("/dashboard/domain");

  /* ── shared link styles ── */
  const navLink = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center px-3.5 text-[14px] font-medium !rounded-[8px] transition-colors hover:bg-[#f2f5fc] hover:text-[#031033]",
      active ? "text-[#1787D4]" : "text-[#5a6a85]",
    );

  const triggerBtn = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1 px-3.5 text-[14px] font-medium !rounded-[8px] transition-colors bg-transparent border-none cursor-pointer hover:bg-[#f2f5fc] hover:text-[#031033]",
      active ? "text-[#1787D4]" : "text-[#5a6a85]",
    );

  return (
    <>
      {/* ═══ Floating pill shell ═════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-xl border border-[#e2eaff] bg-white backdrop-blur-xl",
            "transition-all duration-300",
            scrolled
              ? "bg-white/85 shadow-[0_8px_32px_rgba(23,135,212,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
              : "shadow-[0_4px_20px_rgba(23,135,212,0.08),0_1px_4px_rgba(0,0,0,0.04)]",
          )}
        >
          {/* 3-col grid: logo | center nav | actions */}
          <div
            className="grid items-center px-4 sm:px-5"
            style={{ gridTemplateColumns: "auto 1fr auto", height: 72 }}
          >
            {/* ── Logo ── */}
            <Link
              href="/"
              id="navbar-logo"
              className="flex items-center shrink-0 mr-4"
            >
              <div className="relative" style={{ width: 200, height: 38 }}>
                <Image
                  src="/nupat_cloud_logo-nav.png"
                  alt="Nupat Cloud"
                  fill
                  priority
                  sizes="500px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* ── Desktop nav (centered) ── */}
            <div className="hidden md:flex justify-center items-center gap-0.5">
              {/* ─ Products ▾ ─ */}
              <div className="relative group">
                <button
                  className={triggerBtn(productsActive)}
                  id="nav-products"
                >
                  Products
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ba8c0] transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {/* dropdown */}
                <div
                  className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50
                                opacity-0 invisible translate-y-1
                                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                                transition-all duration-200"
                >
                  <div
                    className="rounded-lg border border-[#e2eaff] bg-white
                                  shadow-[0_10px_40px_rgba(23,135,212,0.12),0_2px_8px_rgba(0,0,0,0.06)]
                                  grid grid-cols-2 gap-1 p-3"
                    style={{ width: 480 }}
                  >
                    {productsLinks.map((item) => (
                      <DropdownItem key={item.href} {...item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* ─ Developers ─ */}
              <Link
                href={DOCS_URL}
                id="nav-developers"
                target="_blank"
                rel="noopener noreferrer"
                className={navLink(false)}
              >
                Developers
              </Link>

              {/* ─ AI & Websites ─ */}
              <Link
                href="/hosting"
                id="nav-ai-websites"
                className={navLink(pathname === "/hosting")}
              >
                AI &amp; Websites
              </Link>

              {/* ─ Pricing ─ */}
              <Link
                href="/pricing"
                id="nav-pricing"
                className={navLink(pathname === "/pricing")}
              >
                Pricing
              </Link>

              {/* ─ Resources ▾ ─ */}
              <div className="relative group">
                <button
                  className={triggerBtn(pathname === "/contact")}
                  id="nav-resources"
                >
                  Resources
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ba8c0] transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {/* dropdown */}
                <div
                  className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50
                                opacity-0 invisible translate-y-1
                                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                                transition-all duration-200"
                >
                  <div
                    className="rounded-lg border border-[#e2eaff] bg-white
                                  shadow-[0_10px_40px_rgba(23,135,212,0.12),0_2px_8px_rgba(0,0,0,0.06)]
                                  grid grid-cols-2 gap-1 p-3"
                    style={{ width: 440 }}
                  >
                    {resourcesLinks.map((item) => (
                      <DropdownItem key={item.href} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart — domains only */}
              {showCart && (
                <button
                  id="nav-cart-btn"
                  onClick={toggleDrawer}
                  className="relative p-2 rounded-md text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors border-none bg-transparent cursor-pointer"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1787D4] text-[9px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Ask AI */}
              <button
                id="nav-ask-ai"
                className="inline-flex items-center gap-1.5 rounded-full  border border-[#e2eaff] bg-white px-3.5 py-1 text-[13px] font-semibold text-[#031033] hover:border-[#1787D4] hover:text-[#1787D4] transition-colors shadow-sm cursor-pointer"
              >
                Ask AI
              </button>

              {token ? (
                /* ── Profile dropdown ── */
                <div className="relative" ref={profileRef}>
                  <button
                    id="nav-profile-btn"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-md border border-[#e2eaff] bg-white px-2.5 py-[5px] text-[13px] font-medium text-[#031033] hover:bg-[#f2f5fc] transition-colors shadow-sm cursor-pointer"
                  >
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-full overflow-hidden shrink-0 shadow-xs">
                      <FluidOrb
                        size={28}
                        color="#1787D4"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                      <span className="relative z-10 text-[11px] font-bold text-white drop-shadow-sm select-none">
                        {initials}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-[#9ba8c0] transition-transform duration-200",
                        profileOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-lg border border-[#e2eaff] bg-white shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e2eaff]">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden shrink-0 shadow-xs">
                          <FluidOrb
                            size={36}
                            color="#1787D4"
                            className="absolute inset-0 w-full h-full pointer-events-none"
                          />
                          <span className="relative z-10 text-[12px] font-bold text-white drop-shadow-sm select-none">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#031033] truncate">
                            {firstName} {lastName}
                          </p>
                          <p className="text-[11px] text-[#5a6a85] mt-0.5 truncate">
                            {me?.data?.email ?? ""}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        id="nav-go-to-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#031033] hover:bg-[#f2f5fc] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#5a6a85]" />
                        Client Area
                      </Link>
                      <button
                        id="nav-logout"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px]  hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer border-none bg-transparent text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Logging out…" : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    id="nav-login"
                    className="px-3.5 py-[7px] text-[13px] font-medium text-[#5a6a85] hover:text-[#031033] transition-colors !rounded-[6px] hover:bg-[#f2f5fc]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    id="nav-get-started"
                    className="inline-flex items-center gap-1.5 rounded-[6px]! bg-[#1787D4] px-4 py-[7px] text-[13px] font-semibold text-white hover:bg-[#1370B5] transition-colors shadow-[0_2px_8px_rgba(23,135,212,0.35)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile right ── */}
            <div className="flex md:hidden items-center gap-1">
              {showCart && (
                <button
                  id="nav-cart-btn-mobile"
                  onClick={toggleDrawer}
                  className="relative p-2 !rounded-[8px] text-[#5a6a85] hover:bg-[#f2f5fc] transition-colors border-none bg-transparent cursor-pointer"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center !rounded-full bg-[#1787D4] text-[9px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              )}
              <button
                id="navbar-mobile-toggle"
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 !rounded-[8px] text-[#5a6a85] hover:bg-[#f2f5fc] hover:text-[#031033] transition-colors border-none bg-transparent cursor-pointer"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <MenuToggleIcon open={mobileOpen} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile menu ════════════════════════════════════════ */}
      <MobileMenu open={mobileOpen}>
        {/* Nav links */}
        <div className="flex flex-col gap-1">
          <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9ba8c0]">
            Products
          </p>
          {productsLinks.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 !rounded-[10px] px-3 py-2.5 transition-colors",
                  active
                    ? "bg-[#eff6ff] text-[#1787D4]"
                    : "text-[#031033] hover:bg-[#f2f5fc]",
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center !rounded-[8px] border border-[#e2eaff] bg-white shadow-sm shrink-0">
                  <Icon className="h-4 w-4 text-[#1787D4]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{link.title}</p>
                  <p className="text-[12px] text-[#5a6a85]">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}

          <div className="my-2 border-t border-[#e2eaff]" />

          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9ba8c0]">
            Explore
          </p>
          {[
            { label: "Developers", href: DOCS_URL, external: true },
            { label: "AI & Websites", href: "/hosting", external: false },
            { label: "Pricing", href: "/pricing", external: false },
          ].map(({ label, href, external }) => (
            <Link
              key={href}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(
                "flex items-center !rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                pathname === href
                  ? "bg-[#eff6ff] text-[#1787D4]"
                  : "text-[#031033] hover:bg-[#f2f5fc]",
              )}
            >
              {label}
            </Link>
          ))}

          <div className="my-2 border-t border-[#e2eaff]" />

          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9ba8c0]">
            Resources
          </p>
          {resourcesLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 !rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#eff6ff] text-[#1787D4]"
                    : "text-[#031033] hover:bg-[#f2f5fc]",
                )}
              >
                <Icon className="h-4 w-4 text-[#1787D4] shrink-0" />
                {link.title}
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col gap-2 border-t border-[#e2eaff] pt-4">
          {token ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 !rounded-[10px] bg-[#f2f5fc]">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden shrink-0 shadow-xs">
                  <FluidOrb
                    size={36}
                    color="#1787D4"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  <span className="relative z-10 text-[12px] font-bold text-white drop-shadow-sm select-none">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#031033] truncate">
                    {firstName} {lastName}
                  </p>
                  <p className="text-[12px] text-[#5a6a85] truncate">
                    {me?.data?.email ?? ""}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 !rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-[#5a6a85]" />
                Go to Client Area
              </Link>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex items-center gap-2.5 !rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 cursor-pointer border-none bg-transparent w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-[100%]! border border-[#e2eaff] bg-white px-4 py-3 text-[14px] font-semibold text-[#031033] hover:border-[#1787D4] hover:text-[#1787D4] transition-colors cursor-pointer">
                Ask AI
              </button>
              <Link
                href="/login"
                className="flex w-full items-center justify-center !rounded-[6px] border border-[#e2eaff] px-4 py-3 text-[14px] font-medium text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-1.5 !rounded-[6px] bg-[#1787D4] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[#1370B5] transition-colors shadow-[0_2px_8px_rgba(23,135,212,0.35)]"
              >
                <Zap className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>
      </MobileMenu>

      <CartDrawer />
    </>
  );
}
