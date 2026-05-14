"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Hosting", href: "/hosting" },
  { label: "Domains", href: "/domains" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-[#dce4f7] shadow-sm shadow-[#031033]/5"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            id="navbar-logo"
          >
            <Image
              src="/images/nupat-cloud-logo-whitebg.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-[#fd9f09] bg-[#fffaf0]"
                    : "text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              id="nav-login"
              className="text-sm font-medium text-[#5a6a85] hover:text-[#031033] transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              id="nav-get-started"
              className="btn-primary text-sm py-2.5 px-5 rounded-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            id="navbar-mobile-toggle"
            className="md:hidden p-2 rounded-lg text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-b border-[#dce4f7] px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[#fd9f09] bg-[#fffaf0]"
                  : "text-[#5a6a85] hover:text-[#031033] hover:bg-[#f2f5fc]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#dce4f7]">
            <Link
              href="/login"
              className="text-center py-2.5 text-sm font-medium text-[#5a6a85] hover:text-[#031033] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm text-center py-2.5 rounded-lg justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
