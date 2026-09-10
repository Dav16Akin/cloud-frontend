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
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to home"
          className="w-10 h-10 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Stacked Nupat Cloud Logo */}
      <div className="flex flex-col items-center justify-center text-center max-w-[280px] w-full animate-in fade-in zoom-in-95 duration-500">
        <Link href="/" aria-label="Go to Nupat Cloud homepage">
          <Image
            src="/images/auth-nupat-logo-stacked.png"
            alt="Nupat Cloud"
            width={280}
            height={130}
            priority
            className="w-auto h-24 sm:h-28 lg:h-32 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
        </Link>
      </div>
    </div>
  );
}
