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
      className="w-full bg-[#f0f4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Curvelines */}
      <div className="absolute -top-12 -right-16 pointer-events-none select-none z-0 hidden sm:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-105 lg:w-135 h-auto brightness-0 opacity-[0.045] rotate-20"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -left-20 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-95 lg:w-120 h-auto brightness-0 opacity-[0.04] rotate-[-30deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="type-h2 text-[#031033] mb-3 inline-block">
            <span className="relative inline-block pb-1">
              Start with the right domain
              <span
                className="absolute left-0 bottom-0 w-full h-[3.5px] bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="type-lead text-[#5a6a85] max-w-xl mx-auto">
            Find, register, and manage your domain from one simple platform.
          </p>
        </div>

        {/* Blue card */}
        <div className="bg-[#1787D4] rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch shadow-md">
          {/* Right: search bar + extension pills */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-7 gap-4">
            {/* Search bar — Apple pill container */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-full p-1.5 shadow-sm overflow-hidden h-14 border border-white/40"
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
                className="shrink-0 h-full bg-[#1787D4] hover:bg-[#1370B5] text-white font-medium rounded-full text-sm px-6 transition-colors duration-200 cursor-pointer whitespace-nowrap active:scale-95"
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
                  className="bg-white/95 hover:bg-white text-[#031033] text-[13px] font-semibold px-4 py-2 rounded-full transition-all duration-150 shadow-xs cursor-pointer active:scale-95"
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
