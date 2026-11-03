"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

// Only links that lead somewhere real. Removed (Nov 2026): pages that 404
// (/blog, /status, /about, /careers, /partners, /security), docs subpaths that 404,
// and /hosting#… anchors that do not exist on the hosting page.
const footerLinks = {
  Products: [
    { label: "Domains", href: "/domains" },
    { label: "Web hosting", href: "/hosting" },
    { label: "VPS hosting", href: "/vps" },
    { label: "Domain transfer", href: "/domain-transfer" },
    { label: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { label: "Documentation", href: DOCS_URL, isExternal: true },
    { label: "Help center", href: "/contact" },
    { label: "Client dashboard", href: "/dashboard" },
  ],
  Company: [{ label: "Contact", href: "/contact" }],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Cookie preferences", href: "#", isCookieTrigger: true },
  ],
};

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-[#031033] text-white pt-16 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-4">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/nupat_cloud_logo-footer.png"
                alt="Nupat Cloud"
                width={200}
                height={61}
                className="h-10 sm:h-12 w-auto object-contain object-left"
                priority
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mt-1">
              Domains, hosting and cloud servers for businesses in Nigeria and across Africa.
            </p>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col">
              <h3 className="text-white font-medium text-sm mb-4">
                {category}
              </h3>
              <ul className="flex flex-col space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"isCookieTrigger" in link && link.isCookieTrigger ? (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("nupat_open_cookie_consent")
                          );
                        }}
                        className="rounded text-white/70 hover:text-white transition-colors text-sm inline-block cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        target={
                          "isExternal" in link && link.isExternal
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          "isExternal" in link && link.isExternal
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="rounded text-white/70 hover:text-white transition-colors text-sm inline-block outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/15 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright text */}
          <p className="text-white/70 text-sm text-center md:text-left">
            © {year} Nupat Cloud. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com/nupatcloud"
              aria-label="Twitter / X"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/nupatcloud"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
