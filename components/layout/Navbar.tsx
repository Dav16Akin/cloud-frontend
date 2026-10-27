"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  Globe,
  ArrowRightLeft,
  ShoppingCart,
  Server,
  Headphones,
  BookOpen,
  Tag,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useLogout } from "@/hooks/useAuth";
import { useGetMe } from "@/hooks/useUser";
import { ProductsMegaMenu, ResourcesMegaMenu } from "@/components/layout/ProductsMegaMenu";
import { MobileAccountPanel, UserMenu } from "@/components/layout/UserMenu";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

/* ─── Data ──────────────────────────────────────────────────── */
const productsLinks = [
  {
    title: "Domain Registration",
    href: "/domains",
    icon: Globe,
    description: "Find and register your perfect domain.",
    available: true,
  },
  {
    title: "Domain Transfer",
    href: "/domain-transfer",
    icon: ArrowRightLeft,
    description: "Move your domain to Nupat.",
    available: true,
  },
  {
    title: "Web Hosting",
    href: "/hosting",
    icon: Server,
    description: "Reliable hosting for websites.",
    available: true,
  },
  {
    title: "VPS Hosting",
    href: "/vps",
    icon: Server,
    description: "Dedicated resources with full root control.",
    available: true,
  },
  {
    title: "Pricing & Plans",
    href: "/pricing",
    icon: Tag,
    description: "Transparent hosting packages.",
    available: true,
  },
  /* Commented out unused items:
  {
    title: "Domain Management",
    href: "#",
    icon: Globe,
    description: "Manage your domains in one place.",
    available: false,
  },
  {
    title: "AI Website Builder",
    href: "#",
    icon: Zap,
    description: "Create professional websites with AI.",
    available: false,
  },
  */
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
    title: "Pricing",
    href: "/pricing",
    icon: Tag,
    description: "Transparent plans for every budget.",
  },
  /* Commented out until /blog route exists:
  {
    title: "Blog",
    href: "/blog",
    icon: FileText,
    description: "News, tips and product updates.",
  },
  */
];

/* ─── Scroll hook ───────────────────────────────────────────── */
function useScroll(threshold: number) {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

/* ─── Mobile portal ─────────────────────────────────────────── */
function MobileMenu({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div
      id="mobile-menu"
      onClick={onClose}
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
  const pathname = usePathname();
  const scrolled = useScroll(10);

  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: me } = useGetMe();
  const cartCount = useCartStore((s) => s.items.length);

  const handleCartClick = () => {
    if (token) {
      router.push("/dashboard/cart");
    } else {
      router.push("/login?redirect=/dashboard/cart");
    }
  };

  /* Cart visible on domain/hosting pages OR whenever user has items in cart */
  const showCart =
    cartCount > 0 ||
    pathname.startsWith("/domains") ||
    pathname.startsWith("/hosting") ||
    pathname.startsWith("/dashboard/domain");

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const productsActive =
    pathname.startsWith("/hosting") ||
    pathname.startsWith("/domains") ||
    pathname.startsWith("/dashboard/ssl") ||
    pathname.startsWith("/dashboard/domain");

  /* ── shared link styles ── */
  const navLink = (active: boolean) =>
    cn(
      "inline-flex h-8.5 items-center px-3.5 text-[13.5px] font-medium rounded-full transition-all duration-150",
      active
        ? "text-[#1787D4] bg-[#1787D4]/10 font-semibold"
        : "text-[#5a6a85] hover:text-[#1787D4] hover:bg-[#1787D4]/8",
    );

  const triggerBtn = (active: boolean) =>
    cn(
      "inline-flex h-8.5 items-center gap-1 px-3.5 text-[13.5px] font-medium rounded-full transition-all duration-150 bg-transparent border-none cursor-pointer",
      active
        ? "text-[#1787D4] bg-[#1787D4]/10 font-semibold"
        : "text-[#5a6a85] hover:text-[#1787D4] hover:bg-[#1787D4]/8",
    );

  return (
    <>
      {/* ═══ Floating pill shell ═════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-lg border border-[#e2eaff] bg-white/95 backdrop-blur-xl",
            "transition-all duration-300",
            scrolled
              ? "bg-white/90 shadow-[0_12px_36px_rgba(23,135,212,0.14),0_2px_8px_rgba(0,0,0,0.06)]"
              : "shadow-[0_4px_20px_rgba(23,135,212,0.08),0_1px_4px_rgba(0,0,0,0.04)]",
          )}
        >
          {/* 3-col grid: logo | center nav | actions */}
          <div
            className="grid items-center px-4 sm:px-5"
            style={{ gridTemplateColumns: "auto 1fr auto", height: 66 }}
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
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ba8c0] transition-all duration-200 group-hover:rotate-180 group-hover:text-[#1787D4]" />
                </button>
                {/* Mega dropdown */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50
                                opacity-0 invisible translate-y-1 pointer-events-none
                                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto
                                transition-all duration-200"
                >
                  <ProductsMegaMenu />
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
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ba8c0] transition-all duration-200 group-hover:rotate-180 group-hover:text-[#1787D4]" />
                </button>
                {/* dropdown */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50
                                opacity-0 invisible translate-y-1 pointer-events-none
                                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto
                                transition-all duration-200"
                >
                  <ResourcesMegaMenu />
                </div>
              </div>
            </div>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart — domains only */}
              {showCart && (
                <button
                  id="nav-cart-btn"
                  onClick={handleCartClick}
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
                <UserMenu
                  account={me?.data}
                  isLoggingOut={isLoggingOut}
                  onLogout={() => logout()}
                />
              ) : (
                <>
                  <Link
                    href="/login"
                    id="nav-login"
                    className="px-4 py-[7px] text-[13px] font-medium text-[#5a6a85] hover:text-[#031033] transition-colors rounded-full hover:bg-[#f2f5fc]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    id="nav-get-started"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1787D4] px-4 py-[7px] text-[13px] font-semibold text-white hover:bg-[#1370B5] transition-colors shadow-[0_2px_8px_rgba(23,135,212,0.35)]"
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
                  onClick={handleCartClick}
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
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {/* Nav links */}
        <div className="flex flex-col gap-1">
          <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9ba8c0]">
            Products
          </p>
          {productsLinks.map((link) => {
            const Icon = link.icon;
            if (!link.available) {
              return (
                <div
                  key={link.title}
                  className="flex items-center gap-3 !rounded-[10px] px-3 py-2.5 opacity-40 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center !rounded-[8px] border border-gray-200 bg-gray-50 shrink-0 text-gray-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-gray-600">
                        {link.title}
                      </p>
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        Soon
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400">
                      {link.description}
                    </p>
                  </div>
                </div>
              );
            }

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
            <MobileAccountPanel
              account={me?.data}
              isLoggingOut={isLoggingOut}
              onLogout={() => {
                setMobileOpen(false);
                logout();
              }}
            />
          ) : (
            <>
              <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#e2eaff] bg-white px-4 py-3 text-[14px] font-semibold text-[#031033] hover:border-[#1787D4] hover:text-[#1787D4] transition-colors cursor-pointer">
                Ask AI
              </button>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-full border border-[#e2eaff] px-4 py-3 text-[14px] font-medium text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1787D4] px-4 py-3 text-[14px] font-semibold text-white hover:bg-[#1370B5] transition-colors shadow-[0_2px_8px_rgba(23,135,212,0.35)]"
              >
                <Zap className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>
      </MobileMenu>
    </>
  );
}
