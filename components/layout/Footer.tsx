import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L2.058 2.25H8.08l4.265 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInSvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WebGlobeSvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const footerLinks = {
  Products: [
    { label: "Web Hosting", href: "/hosting" },
    { label: "Domain Registration", href: "/domains" },
    { label: "Business Email", href: "/hosting#email" },
    { label: "Pricing", href: "/pricing" },
    { label: "Startup Program", href: "/#startup" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Status Page", href: "/status" },
    { label: "Documentation", href: "/docs" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f2f5fc] border-t border-[#dce4f7] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Image 
                src="/images/nupat-cloud-logo-whitebg.png"
                alt="Nupat Cloud Logo"
                width={140}
                height={40}
                className="object-contain h-auto w-auto"
              />
            </Link>
            <p className="text-[#5a6a85] text-sm leading-relaxed max-w-xs mb-6">
              Reliable cloud infrastructure, hosting, domains, and digital tools
              designed for African businesses and developers.
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-sm text-[#5a6a85]">
                <Mail className="w-4 h-4 text-[#031033]" />
                <span>hello@nupatcloud.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#5a6a85]">
                <MapPin className="w-4 h-4 text-[#fd9f09]" />
                <span>Lagos, Nigeria 🇳🇬</span>
              </div>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/nupatcloud"
                aria-label="X / Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-[#dce4f7] flex items-center justify-center text-[#5a6a85] hover:text-[#031033] hover:border-[#031033] transition-all shadow-sm"
              >
                <XTwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/nupatcloud"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-[#dce4f7] flex items-center justify-center text-[#5a6a85] hover:text-[#031033] hover:border-[#031033] transition-all shadow-sm"
              >
                <LinkedInSvgIcon className="w-4 h-4" />
              </a>
              <a
                href="https://nupatcloud.com"
                aria-label="Website"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-[#dce4f7] flex items-center justify-center text-[#5a6a85] hover:text-[#031033] hover:border-[#031033] transition-all shadow-sm"
              >
                <WebGlobeSvgIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[#031033] font-semibold text-sm mb-4 tracking-wide">
                {category}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#5a6a85] text-sm hover:text-[#fd9f09] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#dce4f7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5a6a85] text-sm">
            © {year} Nupat Cloud. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
