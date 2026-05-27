import type { Metadata } from "next";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Nupat Cloud",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f2f5fc] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />

      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#e8900a]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* 404 number */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[10rem] md:text-[13rem] font-extrabold leading-none text-[#e2eaff] tracking-tighter"
            aria-hidden="true"
          >
            404
          </span>
          {/* Orange accent behind the icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[#e8900a] flex items-center justify-center shadow-lg">
              <Search className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#031033] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#5a6a85] text-sm md:text-base leading-relaxed mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or head back to safety.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            id="not-found-home"
            className="btn-primary text-sm py-3 px-6 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link
            href="javascript:history.back()"
            id="not-found-back"
            className="btn-outline text-sm py-3 px-6 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>

        {/* Helpful links */}
        {/* <div className="mt-12 w-full border-t border-[#dce4f7] pt-8">
          <p className="text-xs font-semibold text-[#9ba8c0] uppercase tracking-widest mb-4">
            You might be looking for
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Hosting", href: "/dashboard/hosting" },
              { label: "Domains", href: "/dashboard/domains" },
              { label: "Emails", href: "/dashboard/emails" },
              { label: "Support", href: "/dashboard/tickets" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 text-sm font-medium text-[#5a6a85] bg-white border border-[#e2eaff] hover:border-[#e8900a] hover:text-[#e8900a] transition-all duration-150 text-center"
              >
                {label}
              </Link>
            ))}
          </div>
        </div> */}

        {/* Branding footer */}
        <p className="mt-10 text-xs text-[#9ba8c0]">
          &copy; {new Date().getFullYear()} Nupat Cloud. All rights reserved.
        </p>
      </div>
    </div>
  );
}
