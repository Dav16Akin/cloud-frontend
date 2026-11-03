import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Home, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Nupat Cloud",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F5FC] flex flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center max-w-lg w-full">
        <p
          className="text-8xl sm:text-9xl font-semibold leading-none text-[#D5DCE6] tabular-nums mb-6 select-none"
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-3">
          Page not found
        </h1>
        <p className="text-base text-[#5A6A85] leading-relaxed mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the address, or go back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            id="not-found-home"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium bg-[#1787D4] text-white hover:bg-[#1370B5] transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            Go to homepage
          </Link>
          <BackButton
            id="not-found-back"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-sm font-medium border border-[#D5DCE6] bg-white text-[#031033] hover:bg-[#F2F5FC] transition-colors w-full sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </BackButton>
        </div>

        <p className="mt-10 text-xs text-[#5A6A85]">
          &copy; {new Date().getFullYear()} Nupat Cloud. All rights reserved.
        </p>
      </div>
    </div>
  );
}
