"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthLeftPanel() {
  const router = useRouter();

  return (
    <div className="hidden lg:flex w-full lg:w-[40%] xl:w-[38%] bg-[#1787D4] h-screen items-center justify-center relative p-8 select-none shrink-0">
      {/* Back to home */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to home"
          className="w-10 h-10 rounded-full border border-white/25 bg-white/10 text-white flex items-center justify-center transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Stacked Nupat Cloud logo */}
      <div className="flex flex-col items-center justify-center text-center max-w-[280px] w-full">
        <Link
          href="/"
          aria-label="Go to Nupat Cloud homepage"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Image
            src="/images/auth-nupat-logo-stacked.png"
            alt="Nupat Cloud"
            width={280}
            height={130}
            priority
            className="w-auto h-24 sm:h-28 lg:h-32 object-contain"
          />
        </Link>
      </div>
    </div>
  );
}
