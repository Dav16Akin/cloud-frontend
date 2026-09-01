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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.nupatcloud.com";

const footerLinks = {
  Products: [
    { label: "Domains", href: "/domains" },
    { label: "Web Hosting", href: "/hosting" },
    { label: "VPS", href: "/hosting#vps" },
    { label: "Cloud Hosting", href: "/hosting#cloud" },
    { label: "AI Website Builder", href: "/hosting#ai" },
    { label: "Managed WordPress", href: "/hosting#wordpress" },
    { label: "Business Email", href: "/hosting#email" },
    { label: "Developer Cloud", href: "/dashboard" },
    { label: "Storage", href: "/hosting#storage" },
  ],
  Developers: [
    { label: "Developer Platform", href: DOCS_URL, isExternal: true },
    {
      label: "Cloud Infrastructure",
      href: `${DOCS_URL}/infrastructure`,
      isExternal: true,
    },
    { label: "API Docs", href: `${DOCS_URL}/api`, isExternal: true },
    { label: "Kubernetes", href: `${DOCS_URL}/kubernetes`, isExternal: true },
    { label: "Serverless", href: `${DOCS_URL}/serverless`, isExternal: true },
    { label: "Databases", href: `${DOCS_URL}/databases`, isExternal: true },
    { label: "Object Storage", href: `${DOCS_URL}/storage`, isExternal: true },
    { label: "CI/CD", href: `${DOCS_URL}/cicd`, isExternal: true },
    { label: "Documentation", href: DOCS_URL, isExternal: true },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: `${DOCS_URL}/guides`, isExternal: true },
    { label: "Documentation", href: DOCS_URL, isExternal: true },
    { label: "Help Center", href: "/contact" },
    { label: "Contact Support", href: "/contact" },
    { label: "System Status", href: "/status" },
  ],
  Company: [
    { label: "About Nupat", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Partners", href: "/partners" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-[#005B8A] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-6 mb-16">
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
            <p className="text-white/80 text-sm leading-relaxed max-w-xs mt-1">
              The digital infrastructure platform built for Africa.
            </p>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col">
              <h3 className="text-white font-bold text-sm tracking-wide mb-4">
                {category}
              </h3>
              <ul className="flex flex-col space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
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
                      className="text-white/75 hover:text-white transition-colors text-sm inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright text */}
          <p className="text-white/75 text-xs sm:text-sm text-center md:text-left">
            © {year} Nupat Cloud. All rights reserved. Built with pride for
            Africa and global businesses.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com/nupatcloud"
              aria-label="Twitter / X"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#1EA1E6] hover:bg-[#1787D4] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm cursor-pointer"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/nupatcloud"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#1EA1E6] hover:bg-[#1787D4] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm cursor-pointer"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/nupatcloud"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#1EA1E6] hover:bg-[#1787D4] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm cursor-pointer"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/nupatcloud"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#1EA1E6] hover:bg-[#1787D4] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
