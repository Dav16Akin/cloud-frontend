"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

const EXTENSIONS = [
  ".com",
  ".ng",
  ".africa",
  ".co",
  ".io",
  ".ai",
  ".net",
  ".org",
];

export default function DomainSearchSection() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/domains?search=${encodeURIComponent(query.trim())}`;
  };

  return (
    <section
      id="domain-search"
      className="w-full bg-[#f0f4fa] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Curvelines */}
      <div className="absolute -top-12 -right-16 pointer-events-none select-none z-0 hidden sm:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[420px] lg:w-[540px] h-auto brightness-0 opacity-[0.045] rotate-[20deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -left-20 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-[380px] lg:w-[480px] h-auto brightness-0 opacity-[0.04] -rotate-[30deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-[#031033] tracking-tight mb-3 inline-block">
            <span className="relative inline-block pb-1">
              Start with the right domain
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="text-[#5a6a85] text-sm sm:text-base">
            Find, register, and manage your domain from one simple platform.
          </p>
        </div>

        {/* Blue card */}
        <div className="bg-[#1787D4] rounded-lg overflow-hidden flex flex-col sm:flex-row items-stretch">
          {/* Left: label + SVG character */}
          {/* <div className="hidden sm:flex flex-col justify-end items-center px-6 pt-6 pb-0 shrink-0 w-[190px]">
            <p className="text-white/85 text-xs font-medium text-center mb-3 leading-snug">
              Find your perfect domain name
            </p>
            <svg
              viewBox="0 0 120 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[110px] h-auto"
            >
              <rect
                x="38"
                y="108"
                width="5"
                height="22"
                rx="2.5"
                fill="#312e81"
              />
              <rect
                x="77"
                y="108"
                width="5"
                height="22"
                rx="2.5"
                fill="#312e81"
              />
              <ellipse cx="60" cy="108" rx="22" ry="5" fill="#4338ca" />
              <path
                d="M35 95 Q30 75 40 65 L60 60 L80 65 Q90 75 85 95 Z"
                fill="#7c3aed"
              />
              <path
                d="M37 72 Q22 78 24 90"
                stroke="#7c3aed"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M83 72 Q98 78 96 90"
                stroke="#7c3aed"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <rect
                x="22"
                y="87"
                width="36"
                height="22"
                rx="3"
                fill="#1e1b4b"
              />
              <rect
                x="24"
                y="89"
                width="32"
                height="17"
                rx="2"
                fill="#38bdf8"
              />
              <rect
                x="26"
                y="92"
                width="20"
                height="2"
                rx="1"
                fill="white"
                opacity="0.4"
              />
              <rect
                x="26"
                y="96"
                width="14"
                height="2"
                rx="1"
                fill="white"
                opacity="0.3"
              />
              <rect
                x="18"
                y="109"
                width="44"
                height="4"
                rx="2"
                fill="#0f172a"
              />
              <rect
                x="55"
                y="50"
                width="10"
                height="12"
                rx="5"
                fill="#f59e0b"
              />
              <ellipse cx="60" cy="40" rx="16" ry="18" fill="#f59e0b" />
              <path
                d="M44 38 Q44 18 60 18 Q76 18 76 38 Q70 24 60 26 Q50 24 44 38Z"
                fill="#1e1b4b"
              />
              <circle
                cx="53"
                cy="40"
                r="6"
                stroke="#1e1b4b"
                strokeWidth="2"
                fill="white"
                fillOpacity="0.7"
              />
              <circle
                cx="67"
                cy="40"
                r="6"
                stroke="#1e1b4b"
                strokeWidth="2"
                fill="white"
                fillOpacity="0.7"
              />
              <line
                x1="59"
                y1="40"
                x2="61"
                y2="40"
                stroke="#1e1b4b"
                strokeWidth="1.5"
              />
              <line
                x1="44"
                y1="38"
                x2="47"
                y2="38"
                stroke="#1e1b4b"
                strokeWidth="1.5"
              />
              <line
                x1="73"
                y1="38"
                x2="76"
                y2="38"
                stroke="#1e1b4b"
                strokeWidth="1.5"
              />
              <circle cx="53" cy="40" r="3" fill="#1e1b4b" />
              <circle cx="67" cy="40" r="3" fill="#1e1b4b" />
              <path
                d="M54 47 Q60 52 66 47"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div> */}

          {/* Right: search bar + extension pills */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-7 gap-4">
            {/* Search bar — "Search Domain" button lives INSIDE the white pill */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-lg p-2 shadow-sm overflow-hidden h-16"
            >
              <div className="flex items-center gap-2 flex-1 px-4">
                <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                <input
                  id="domain-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your domain name (e.g., yourbusiness.ng)"
                  className="flex-1 text-sm text-[#031033] placeholder:text-[#9ca3af] outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                id="domain-search-btn"
                className="shrink-0 h-full bg-[#1787D4] hover:bg-[#1370B5] text-white font-bold rounded-lg text-sm px-6 transition-colors duration-200 cursor-pointer whitespace-nowrap"
              >
                Search Domain
              </button>
            </form>

            {/* Extension pills */}
            <div className="flex flex-wrap gap-2">
              {EXTENSIONS.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() =>
                    setQuery(
                      (prev) =>
                        prev.replace(/\.\w+$/, "").replace(/\.$/, "") + ext,
                    )
                  }
                  className="bg-white h-12 hover:bg-[#e8f4fc] text-[#031033] text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors duration-150 shadow-sm cursor-pointer"
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
