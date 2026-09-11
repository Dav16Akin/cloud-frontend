import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ShieldCheck,
  Shield,
  Zap,
  ArrowRight,
  LayoutGrid,
  BarChart3,
} from "lucide-react";

import PricingPreviewSection from "@/components/home/PricingPreviewSection";

export const metadata: Metadata = {
  title: "Web Hosting — Nupat Cloud",
  description:
    "Reliable hosting for everything you want to build. Launch your website on fast, secure and reliable hosting designed to keep your online presence running smoothly.",
};

const coreFeatures = [
  {
    icon: Zap,
    title: "Fast Performance",
    desc: "Keep your website responsive for your visitors",
  },
  {
    icon: Shield,
    title: "Reliable Infrastructure",
    desc: "Built on dependable cloud infrastructure",
  },
  {
    icon: LayoutGrid,
    title: "Easy Management",
    desc: "Manage your hosting from one simple dashboard",
  },
  {
    icon: BarChart3,
    title: "Scalable Resources",
    desc: "Upgrade as your website and business grow",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a plan",
    desc: "Select the hosting package that fits your needs",
  },
  {
    number: "02",
    title: "Connect your domain",
    desc: "Use your existing domain or register one with Nupat",
  },
  {
    number: "03",
    title: "Launch your website",
    desc: "Upload your website or install your preferred platform",
  },
];

export default function HostingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-30 lg:pb-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 text-left">
              <h1 className="type-display text-[#031033] mb-5">
                Reliable hosting for
                <br />
                everything you want to
                <br />
                build
              </h1>
              <p className="type-lead text-[#5a6a85] leading-relaxed mb-8 max-w-lg">
                Launch your website on fast, secure and reliable hosting designed
                to keep your online presence running smoothly.
              </p>
              <Link
                href="#plans"
                id="view-hosting-plan-hero-cta"
                className="btn-primary !rounded-full px-7 py-3 text-[14px] sm:text-[15px] font-medium"
              >
                View Hosting Plan
              </Link>
            </div>

            {/* Right Visual with Floating Badges */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[500px] lg:max-w-[560px]">
                {/* Hero Image */}
                <Image
                  src="/web-hosting.png"
                  alt="Reliable web hosting - Nupat Cloud"
                  width={560}
                  height={500}
                  priority
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />

                {/* Badge 1: 99.9% Uptime (Top Left) */}
                <div className="absolute top-2 sm:top-6 -left-2 sm:-left-4 lg:-left-6 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      99.9% Uptime
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      Always stay online
                    </div>
                  </div>
                </div>

                {/* Badge 2: Free SSL included (Top Right) */}
                <div className="absolute top-8 sm:top-12 -right-2 sm:-right-4 lg:-right-4 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      Free SSL included
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      Security by default
                    </div>
                  </div>
                </div>

                {/* Badge 3: 1-Click Setup (Bottom Right) */}
                <div className="absolute bottom-12 sm:bottom-16 right-0 sm:right-4 lg:-right-2 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-lg shadow-black/[0.06] border border-gray-100 flex items-center gap-2.5 sm:gap-3 z-10 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      1-Click Setup
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">
                      Go live instantly
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Pricing Plans Section (Unified with Homepage & Live Cart) ── */}
      <PricingPreviewSection
        id="plans"
        title="Choose the hosting that fits your website"
        subtitle="Scale seamlessly with fast NVMe storage, free SSL certificates, and 99.9% uptime."
        showFooterLink={true}
        className="py-14 sm:py-18 lg:py-22 bg-[#f8faff] relative overflow-hidden scroll-mt-24 border-y border-slate-100"
      />

      {/* ── 3. Core Features Grid Section ── */}
      <section className="py-10 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="type-h2 text-[#031033]">
              Everything your website needs to stay online
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col items-start hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1787D4] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="type-h3 text-[#031033] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Dashboard Preview Section ("Your hosting under control") ── */}
      <section className="py-10 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
            <h2 className="type-h2 text-[#031033] mb-3">
              Your hosting under control
            </h2>
            <p className="type-lead text-[#5a6a85]">
              Manage your website resources, domains and hosting services from one
              connected dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Dashboard Mockup Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
                {/* Window top dots */}
                <div className="flex items-center gap-1.5 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fbbd23]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#36d399]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                </div>

                {/* Top metrics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                  {/* Performance */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                    <div className="text-[11px] font-medium text-gray-400 mb-1">
                      Performance
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                      82%
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-3">
                      <div className="w-[82%] bg-[#1787D4] h-full rounded-full" />
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                    <div className="text-[11px] font-medium text-gray-400 mb-1">
                      Storage Usage
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                      4.2 GB <span className="text-xs sm:text-sm font-normal text-gray-400">/ 10 GB</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-3">
                      <div className="w-[42%] bg-[#1787D4] h-full rounded-full" />
                    </div>
                  </div>

                  {/* Bandwidth */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                    <div className="text-[11px] font-medium text-gray-400 mb-1">
                      Bandwidth
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                      32 GB
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2">
                      Unmetered traffic
                    </div>
                  </div>
                </div>

                {/* Bottom status row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* SSL Certificate */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      SSL Certificate
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Active &amp; Secure
                    </span>
                  </div>

                  {/* Next Renewal */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Next Renewal
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      Aug 24, 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Graphic / Woman Celebrating Image */}
            <div className="lg:col-span-5 flex justify-center">
              <Image
                src="/web-hosting-1.png"
                alt="Hosting dashboard control"
                width={420}
                height={420}
                style={{ height: "auto" }}
                className="w-full max-w-[360px] sm:max-w-[400px] h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works Section ("From sign-up to online in minutes") ── */}
      <section className="py-10 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="type-h2 text-[#031033]">
              From sign-up to online in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-start relative group hover:border-blue-200 transition-colors"
              >
                <div className="text-3xl font-extrabold text-[#1787D4] mb-4">
                  {step.number}
                </div>
                <h3 className="type-h3 text-[#031033] mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  {step.desc}
                </p>

                {/* Arrow to next step on desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-[#1787D4] z-10">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Call to Action (CTA) ── */}
      <section className="bg-[#1787D4] py-10 sm:py-12 text-center px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="type-h2 text-white mb-2.5">
            Ready to put your website online?
          </h2>
          <p className="type-lead text-white/90 mb-6 max-w-md mx-auto">
            Reliable hosting for your next website or business.
          </p>
          <Link
            href="/pricing"
            id="cta-get-started-btn"
            className="btn-white !rounded-full px-8 py-3 text-[15px] font-semibold shadow-md cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
