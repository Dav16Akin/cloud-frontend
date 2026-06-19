"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useLogout } from "@/hooks/useAuth";
import { useGetMe } from "@/hooks/useUser";
import CartDrawer from "@/components/layout/CartDrawer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Hosting", href: "/hosting" },
  { label: "Domains", href: "/domains" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const token = useAuthStore((s) => s.token);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: me } = useGetMe();
  const { itemCount, toggleDrawer } = useCartStore();
  const cartCount = itemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = me?.data?.firstName ?? "";
  const lastName  = me?.data?.lastName  ?? "";
  const initials  = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-[#dce4f7] shadow-sm"
          : "bg-white/95 backdrop-blur-md border-b border-[#dce4f7]/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center" id="navbar-logo">
            <Image
              src="/images/nupat-cloud-logo-whitebg.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                className={`px-4 py-5 text-sm font-medium transition-colors border-b-2 ${
                  pathname === link.href
                    ? "text-[#e8900a] border-[#e8900a]"
                    : "text-[#5a6a85] border-transparent hover:text-[#031033]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon with badge */}
            <button
              id="nav-cart-btn"
              onClick={toggleDrawer}
              className="relative p-2 text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e8900a] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {token ? (
              /* Logged-in: profile dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  id="nav-profile-btn"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#e2eaff] bg-white hover:bg-[#f2f5fc] transition-colors text-sm font-medium text-[#031033]"
                >
                  {/* Avatar — solid orange, no gradient */}
                  <div className="w-7 h-7 bg-[#e8900a] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {firstName || "Account"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#5a6a85] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e2eaff] shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-[#e2eaff]">
                      <p className="text-xs font-semibold text-[#031033] truncate">{firstName} {lastName}</p>
                      <p className="text-xs text-[#5a6a85] truncate mt-0.5">{me?.data?.email ?? ""}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      id="nav-go-to-dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#031033] hover:bg-[#f2f5fc] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#5a6a85]" />
                      Go to Dashboard
                    </Link>
                    <button
                      id="nav-logout"
                      onClick={() => { logout(); setProfileOpen(false); }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <LogOut className="w-4 h-4" />
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
                  className="text-sm font-medium text-[#5a6a85] hover:text-[#031033] transition-colors px-4 py-2"
                >
                  Login
                </Link>
                {/* Orange flat CTA — no rounding, no gradient */}
                <Link
                  href="/register"
                  id="nav-get-started"
                  className="btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile cart icon */}
            <button
              id="nav-cart-btn-mobile"
              onClick={toggleDrawer}
              className="relative p-2 text-[#5a6a85] hover:text-[#031033] transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e8900a] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button
              id="navbar-mobile-toggle"
              className="p-2 text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-b border-[#dce4f7] px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                pathname === link.href
                  ? "text-[#e8900a] border-[#e8900a] bg-[#fff8ee]"
                  : "text-[#5a6a85] border-transparent hover:text-[#031033] hover:bg-[#f2f5fc]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#dce4f7]">
            {token ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 bg-[#e8900a] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#031033] truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-[#5a6a85] truncate">{me?.data?.email ?? ""}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#031033] hover:bg-[#f2f5fc] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#5a6a85]" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-center py-2.5 text-sm font-medium text-[#5a6a85] hover:text-[#031033] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-center py-2.5 justify-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    <CartDrawer />
  </>);
}
