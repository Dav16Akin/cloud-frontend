"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  XCircle,
  ArrowRight,
  Globe,
  Shield,
  Star,
} from "lucide-react";

const extensions = [
  {
    ext: ".com",
    desc: "Perfect for global businesses and startups.",
    popular: true,
  },
  {
    ext: ".com.ng",
    desc: "Ideal for Nigerian businesses and brands.",
    popular: true,
  },
  { ext: ".ng", desc: "Short, modern, and locally trusted.", popular: false },
  {
    ext: ".africa",
    desc: "Built for African brands and businesses.",
    popular: false,
  },
  { ext: ".net", desc: "Great for tech-focused projects.", popular: false },
  { ext: ".org", desc: "For organisations and non-profits.", popular: false },
];

type SearchState = "idle" | "searching" | "available" | "unavailable";

export default function DomainsPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setState("searching");
    setTimeout(() => {
      setState(Math.random() > 0.4 ? "available" : "unavailable");
    }, 1200);
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4 bg-[#fffaf0] border border-[#f9d59f] rounded-full px-4 py-1.5">Domain Registration</span> */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] mb-5 leading-tight">
            Find the <span className="gradient-text">Perfect Domain Name</span>
          </h1>
          <p className="text-[#5a6a85] text-lg mb-10">
            Search and register domains for your business, startup, brand, or
            project.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} id="domain-search-form">
            <div className="flex items-center bg-white rounded-2xl border-2 border-[#dce4f7] focus-within:border-[#fd9f09] transition-all overflow-hidden shadow-lg shadow-gray-200/50">
              <div className="pl-5 shrink-0">
                <Search className="w-5 h-5 text-[#9ba8c0]" />
              </div>
              <input
                id="domain-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setState("idle");
                }}
                placeholder="Search your domain name..."
                className="flex-1 bg-transparent px-4 py-4 text-[#031033] placeholder-[#9ba8c0] text-base outline-none"
              />
              <button
                id="domain-search-btn"
                type="submit"
                className="btn-primary m-2 py-3 px-6 rounded-xl text-sm shrink-0"
              >
                Search Domain
              </button>
            </div>
          </form>

          {/* Results */}
          {state === "searching" && (
            <div className="mt-6 bg-white rounded-xl p-5 border-none shadow-apple flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#fd9f09] border-t-transparent animate-spin" />
              <span className="text-[#5a6a85] text-sm">
                Checking availability for{" "}
                <span className="text-[#031033] font-semibold">{query}</span>...
              </span>
            </div>
          )}
          {state === "available" && (
            <div className="mt-6 bg-white rounded-xl p-5 border-none shadow-apple flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div className="text-left">
                  <p className="text-green-600 font-semibold text-sm">
                    Great news! This domain is available.
                  </p>
                  <p className="text-[#031033] font-bold">
                    {query.includes(".") ? query : `${query}.com`}
                  </p>
                </div>
              </div>
              <button
                id="domain-register-now"
                className="btn-primary py-2.5 px-5 rounded-lg text-sm shrink-0"
              >
                Register Now
              </button>
            </div>
          )}
          {state === "unavailable" && (
            <div className="mt-6 bg-white rounded-xl p-5 border-none shadow-apple">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-500 font-semibold text-sm">
                  This domain is already registered.
                </p>
              </div>
              <p className="text-[#5a6a85] text-xs mb-2">
                Try these alternatives:
              </p>
              <div className="flex flex-wrap gap-2">
                {[".com.ng", ".ng", ".africa", ".net"].map((ext) => (
                  <span
                    key={ext}
                    className="trust-badge cursor-pointer hover:border-[#fd9f09] transition-colors"
                  >
                    {query.split(".")[0]}
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Extensions */}
      <section className="section-pad section-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-3">Extensions</span> */}
            <h2 className="text-3xl font-extrabold text-[#031033] mb-3">
              Popular <span className="gradient-text">Extensions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {extensions.map((ext) => (
              <div
                key={ext.ext}
                className="feature-card p-6 flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0 font-bold text-[#031033] text-sm group-hover:scale-110 transition-transform">
                  {ext.ext}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#031033] font-semibold">{ext.ext}</h3>
                    {ext.popular && (
                      <span className="text-[10px] bg-[#fffaf0] text-[#fd9f09] border border-[#f9d59f] px-2 py-0.5 rounded-full font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[#5a6a85] text-sm">{ext.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why domain matters */}
      <section className="section-pad section-light relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4">Why It Matters</span> */}
              <h2 className="text-3xl font-extrabold text-[#031033] mb-5">
                Why Your <span className="gradient-text">Domain Matters</span>
              </h2>
              <p className="text-[#5a6a85] leading-relaxed mb-4">
                A professional domain name builds trust, improves credibility,
                and helps customers find your business online.
              </p>
              <p className="text-[#5a6a85] leading-relaxed mb-8">
                Your domain is the foundation of your digital identity.
              </p>
              <Link
                href="#hero"
                id="domain-why-search"
                className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 rounded-xl text-base"
              >
                Search Domain <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Globe,
                  title: "Brand Identity",
                  desc: "Your domain defines how the world sees your business.",
                  color: "blue",
                },
                {
                  icon: Shield,
                  title: "Trust & Credibility",
                  desc: "Customers trust businesses with professional domain names.",
                  color: "orange",
                },
                {
                  icon: Star,
                  title: "SEO Advantage",
                  desc: "A .ng or .africa domain can rank better for local searches.",
                  color: "blue",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="feature-card p-4 flex items-start gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${color === "orange" ? "bg-[#fffaf0]" : "bg-[#f2f5fc]"}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${color === "orange" ? "text-[#fd9f09]" : "text-[#031033]"}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-[#031033] font-semibold text-sm mb-1">
                      {title}
                    </p>
                    <p className="text-[#5a6a85] text-xs leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-pad relative overflow-hidden">
        <div className="absolute inset-0 bg-[#031033]" />
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Image 
              src="/images/nupat-cloud-logo-blackbg-removebg-preview.png"
              alt="Nupat Cloud Logo"
              width={140}
              height={40}
              className="object-contain h-auto w-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Secure Your Domain{" "}
            <span style={{ color: "#fd9f09" }}>Before Someone Else Does</span>
          </h2>
          <Link
            href="#"
            id="domain-final-search"
            className="inline-flex items-center gap-2 py-4 px-10 rounded-xl text-base font-semibold bg-white text-[#031033] hover:bg-gray-100 transition-all shadow-xl mt-4"
          >
            <Search className="w-5 h-5" />
            Search Domain
          </Link>
        </div>
      </section>
    </div>
  );
}
