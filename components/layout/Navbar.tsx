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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useLogout } from "@/hooks/useAuth";
import { useGetMe } from "@/hooks/useUser";
import {
  activeProductsItems,
  activeResourcesItems,
  type MenuItem,
} from "@/components/layout/ProductsMegaMenu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MobileAccountPanel, UserMenu } from "@/components/layout/UserMenu";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// "Ask AI" opens the Nupat assistant on WhatsApp (same number as the chat button).
const ASK_AI_URL = `https://wa.me/2349076646154?text=${encodeURIComponent(
  "Hi, I have a question about Nupat Cloud.",
)}`;

const isExternal = (href: string) => /^https?:\/\//.test(href);

/* ─── Dropdown row (shadcn ListItem pattern) ────────────────── */
function MenuListItem({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  const external = isExternal(item.href);
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={item.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="flex select-none gap-3 rounded-lg p-3 no-underline outline-none transition-colors hover:bg-[#F2F5FC] focus:bg-[#F2F5FC] focus-visible:ring-2 focus-visible:ring-[#1787D4]"
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1787D4]" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#031033]">{item.title}</span>
            <span className="mt-0.5 line-clamp-2 block text-sm text-[#5A6A85]">
              {item.description}
            </span>
          </span>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

/* ─── Data ──────────────────────────────────────────────────── */
const productsLinks = [
  {
    title: "Domain Registration",
    href: "/domains",
    icon: Globe,
    description: "Search and register .ng, .com and other domains.",
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
    description: "cPanel hosting for websites and WordPress.",
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
    description: "Compare hosting, VPS and domain prices.",
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
    description: "Guides, references and API docs.",
  },
  {
    title: "Help Center",
    href: "/contact",
    icon: Headphones,
    description: "Talk to our support team.",
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Tag,
    description: "Plans and prices for every budget.",
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

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

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
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-white border-t border-[#E2E8F0] md:hidden"
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

  return (
    <>
      {/* ═══ Floating bar shell ══════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-xl border transition-[background-color,border-color,box-shadow] duration-200",
            // Solid at the top of the page; frosted glass once the page scrolls under it.
            scrolled
              ? "border-white/60 bg-white/70 shadow-[0_8px_24px_rgba(3,16,51,0.10)] backdrop-blur-xl backdrop-saturate-150 supports-[not(backdrop-filter:blur(0))]:bg-white"
              : "border-[#E2E8F0] bg-white",
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
              className={cn("flex items-center shrink-0 mr-4 rounded-lg", focusRing)}
            >
              <div className="relative" style={{ width: 200, height: 38 }}>
                <Image
                  src="/nupat_cloud_logo-nav.png"
                  alt="Nupat Cloud"
                  fill
                  priority
                  sizes="200px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* ── Desktop nav (centered): shadcn NavigationMenu, opens on hover, click and keyboard ── */}
            <div className="hidden md:flex justify-center items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      id="nav-products"
                      className={productsActive ? "bg-[#E8F4FC] text-[#1787D4]" : undefined}
                    >
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-1 p-3 md:w-[520px] lg:w-[620px] lg:grid-cols-[.8fr_1fr]">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/pricing"
                              className="relative flex h-full min-h-[260px] w-full select-none flex-col justify-end overflow-hidden rounded-lg bg-[#031033] p-5 no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4]"
                            >
                              <Image
                                src="/infrastructure.png"
                                alt=""
                                fill
                                sizes="240px"
                                className="object-cover object-cover"
                                aria-hidden="true"
                              />
                              <span className="absolute inset-x-0 bottom-0 h-3/5 bg-[#031033]/80" aria-hidden="true" />
                              <span className="relative text-base font-semibold text-white">
                                Nupat Cloud
                              </span>
                              <span className="relative mt-1 text-sm leading-snug text-white/80">
                                Domains, hosting and cloud servers for businesses in Nigeria and across Africa.
                              </span>
                              <span className="relative mt-4 text-sm font-medium text-[#FFC75D]">
                                Compare plans and pricing
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {activeProductsItems
                          .filter((item) => item.available && item.href !== "/pricing")
                          .map((item) => (
                            <MenuListItem key={item.title} item={item} />
                          ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href={DOCS_URL}
                        id="nav-developers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={navigationMenuTriggerStyle()}
                      >
                        Developers
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname === "/hosting"}>
                      <Link href="/hosting" id="nav-ai-websites" className={navigationMenuTriggerStyle()}>
                        AI &amp; Websites
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname === "/pricing"}>
                      <Link href="/pricing" id="nav-pricing" className={navigationMenuTriggerStyle()}>
                        Pricing
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      id="nav-resources"
                      className={pathname === "/contact" ? "bg-[#E8F4FC] text-[#1787D4]" : undefined}
                    >
                      Resources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-1 p-3 md:w-[480px] md:grid-cols-2">
                        {activeResourcesItems
                          .filter((item) => item.available)
                          .map((item) => (
                            <MenuListItem key={item.title} item={item} />
                          ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart — domains only */}
              {showCart && (
                <button
                  id="nav-cart-btn"
                  type="button"
                  onClick={handleCartClick}
                  className={cn(
                    "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors border-none bg-transparent cursor-pointer",
                    focusRing,
                  )}
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1787D4] px-1 text-xs font-medium tabular-nums text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Ask AI */}
              <a
                id="nav-ask-ai"
                href={ASK_AI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-9 items-center rounded-lg border border-[#D5DCE6] bg-white px-4 text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer",
                  focusRing,
                )}
              >
                Ask AI
              </a>

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
                    className={cn(
                      "inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-[#5A6A85] hover:text-[#031033] hover:bg-[#F2F5FC] transition-colors",
                      focusRing,
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    id="nav-get-started"
                    className={cn(
                      "inline-flex h-9 items-center rounded-lg bg-[#1787D4] px-4 text-sm font-medium text-white hover:bg-[#1370B5] transition-colors",
                      focusRing,
                    )}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile right ── */}
            <div className="flex md:hidden items-center gap-1">
              {showCart && (
                <button
                  id="nav-cart-btn-mobile"
                  type="button"
                  onClick={handleCartClick}
                  aria-label="Shopping cart"
                  className={cn(
                    "relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#5A6A85] hover:bg-[#F2F5FC] transition-colors border-none bg-transparent cursor-pointer",
                    focusRing,
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1787D4] px-1 text-xs font-medium tabular-nums text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              )}
              <button
                id="navbar-mobile-toggle"
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#5A6A85] hover:bg-[#F2F5FC] hover:text-[#031033] transition-colors border-none bg-transparent cursor-pointer",
                  focusRing,
                )}
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
          <p className="px-3 pt-1 pb-1 text-sm font-medium text-[#5A6A85]">
            Products
          </p>
          {productsLinks.map((link) => {
            const Icon = link.icon;
            if (!link.available) {
              return (
                <div
                  key={link.title}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-50 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#5A6A85]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#031033]">
                        {link.title}
                      </p>
                      <span className="text-xs text-[#5A6A85]">Coming soon</span>
                    </div>
                    <p className="text-xs text-[#5A6A85]">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  focusRing,
                  active
                    ? "bg-[#E8F4FC] text-[#1787D4]"
                    : "text-[#031033] hover:bg-[#F2F5FC]",
                )}
              >
                <Icon className="h-5 w-5 shrink-0 text-[#1787D4]" />
                <div>
                  <p className="text-sm font-medium">{link.title}</p>
                  <p className="text-xs text-[#5A6A85]">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}

          <div className="my-2 border-t border-[#E2E8F0]" />

          <p className="px-3 pb-1 text-sm font-medium text-[#5A6A85]">
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
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                focusRing,
                pathname === href
                  ? "bg-[#E8F4FC] text-[#1787D4]"
                  : "text-[#031033] hover:bg-[#F2F5FC]",
              )}
            >
              {label}
            </Link>
          ))}

          <div className="my-2 border-t border-[#E2E8F0]" />

          <p className="px-3 pb-1 text-sm font-medium text-[#5A6A85]">
            Resources
          </p>
          {resourcesLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  focusRing,
                  pathname === link.href
                    ? "bg-[#E8F4FC] text-[#1787D4]"
                    : "text-[#031033] hover:bg-[#F2F5FC]",
                )}
              >
                <Icon className="h-5 w-5 text-[#1787D4] shrink-0" />
                {link.title}
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
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
              <a
                id="nav-ask-ai-mobile"
                href={ASK_AI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#D5DCE6] bg-white px-5 text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors cursor-pointer",
                  focusRing,
                )}
              >
                Ask AI
              </a>
              <Link
                href="/login"
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-lg border border-[#D5DCE6] bg-white px-5 text-sm font-medium text-[#031033] hover:bg-[#F2F5FC] transition-colors",
                  focusRing,
                )}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-lg bg-[#1787D4] px-5 text-sm font-medium text-white hover:bg-[#1370B5] transition-colors",
                  focusRing,
                )}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </MobileMenu>
    </>
  );
}
