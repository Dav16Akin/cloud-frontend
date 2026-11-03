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
  title: "Web Hosting | Nupat Cloud",
  description:
    "Fast, secure web hosting for Nigerian businesses and creators, with free SSL, NVMe storage and a simple dashboard to manage your site.",
};

const coreFeatures = [
  {
    icon: Zap,
    title: "Fast performance",
    desc: "NVMe storage keeps pages quick for your visitors.",
  },
  {
    icon: Shield,
    title: "Reliable infrastructure",
    desc: "Your site runs on dependable cloud servers.",
  },
  {
    icon: LayoutGrid,
    title: "Easy management",
    desc: "Manage your hosting from one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Room to grow",
    desc: "Upgrade your plan as your website and business grow.",
  },
];

const steps = [
  {
    number: "1",
    title: "Choose a plan",
    desc: "Select the hosting package that fits your site.",
  },
  {
    number: "2",
    title: "Connect your domain",
    desc: "Use a domain you already own or register one with Nupat.",
  },
  {
    number: "3",
    title: "Launch your website",
    desc: "Upload your files or install the platform you prefer.",
  },
];

const heroBadges = [
  {
    icon: Activity,
    title: "99.9% uptime",
    sub: "Your site stays online",
    position: "top-2 sm:top-6 -left-2 sm:-left-4 lg:-left-6",
  },
  {
    icon: ShieldCheck,
    title: "Free SSL included",
    sub: "HTTPS from day one",
    position: "top-8 sm:top-12 -right-2 sm:-right-4",
  },
  {
    icon: Zap,
    title: "One-click setup",
    sub: "Live in minutes",
    position: "bottom-12 sm:bottom-16 right-0 sm:right-4 lg:-right-2",
  },
];

const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1787D4] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2";

export default function HostingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-6 text-left">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#031033] mb-5 max-w-2xl">
                Reliable hosting for everything you want to build
              </h1>
              <p className="text-lg text-[#5A6A85] leading-relaxed mb-8 max-w-lg">
                Put your website on fast, secure hosting that keeps it online, so you can focus on
                your business instead of your server.
              </p>
              <Link href="#plans" id="view-hosting-plan-hero-cta" className={primaryBtn}>
                See hosting plans
              </Link>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[500px] lg:max-w-[560px]">
                <Image
                  src="/web-hosting.png"
                  alt="Website running on Nupat Cloud hosting"
                  width={560}
                  height={391}
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 500px, 100vw"
                  style={{ height: "auto" }}
                  className="w-full h-auto object-contain select-none"
                />

                {heroBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.title}
                      className={`absolute ${badge.position} bg-white rounded-lg py-2 px-3 sm:py-2.5 sm:px-3.5 border border-[#E2E8F0] flex items-center gap-2.5 z-10`}
                    >
                      <Icon className="w-5 h-5 text-[#1787D4] shrink-0" aria-hidden="true" />
                      <div className="text-left">
                        <div className="text-xs sm:text-sm font-semibold text-[#031033] leading-tight">
                          {badge.title}
                        </div>
                        <div className="text-xs text-[#5A6A85]">{badge.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing plans (shared with the homepage and live cart) */}
      <PricingPreviewSection
        id="plans"
        title="Choose the hosting that fits your website"
        subtitle="Every plan includes fast NVMe storage, free SSL certificates and 99.9% uptime."
        showFooterLink={true}
        className="py-16 sm:py-24 bg-[#F2F5FC] relative overflow-hidden scroll-mt-24 border-y border-[#E2E8F0]"
      />

      {/* Core features */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              Everything your website needs to stay online
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-6 border border-[#E2E8F0] flex flex-col items-start"
                >
                  <Icon className="w-6 h-6 text-[#1787D4] mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-[#031033] mb-1.5">{item.title}</h3>
                  <p className="text-sm text-[#5A6A85] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-16 sm:py-24 bg-[#F2F5FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-3">
              Your hosting under control
            </h2>
            <p className="text-lg text-[#5A6A85]">
              See your website resources, domains and hosting services in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E8F0]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                  <div className="bg-[#F2F5FC] rounded-lg p-4">
                    <div className="text-xs font-medium text-[#5A6A85] mb-1">Performance</div>
                    <div className="text-xl font-semibold text-[#031033] tabular-nums">82%</div>
                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden mt-3">
                      <div className="w-[82%] bg-[#1787D4] h-full rounded-full" />
                    </div>
                  </div>

                  <div className="bg-[#F2F5FC] rounded-lg p-4">
                    <div className="text-xs font-medium text-[#5A6A85] mb-1">Storage usage</div>
                    <div className="text-xl font-semibold text-[#031033] tabular-nums">
                      4.2 GB <span className="text-sm font-normal text-[#5A6A85]">/ 10 GB</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden mt-3">
                      <div className="w-[42%] bg-[#1787D4] h-full rounded-full" />
                    </div>
                  </div>

                  <div className="bg-[#F2F5FC] rounded-lg p-4">
                    <div className="text-xs font-medium text-[#5A6A85] mb-1">Bandwidth</div>
                    <div className="text-xl font-semibold text-[#031033] tabular-nums">32 GB</div>
                    <div className="text-xs text-[#5A6A85] mt-2">Unmetered traffic</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-[#F2F5FC] rounded-lg p-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6A85]">SSL certificate</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0E7C3A]">
                      <span className="w-2 h-2 rounded-full bg-[#12A150]" aria-hidden="true" />
                      Active
                    </span>
                  </div>

                  <div className="bg-[#F2F5FC] rounded-lg p-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6A85]">Next renewal</span>
                    <span className="text-xs font-semibold text-[#031033]">Aug 24, 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <Image
                src="/web-hosting-1.png"
                alt="Customer managing her website from the Nupat dashboard"
                width={420}
                height={420}
                sizes="(min-width: 640px) 400px, 360px"
                style={{ height: "auto" }}
                className="w-full max-w-[360px] sm:max-w-[400px] h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033]">
              From sign-up to online in minutes
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {steps.map((step, idx) => (
              <li
                key={step.number}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 flex flex-col justify-start relative"
              >
                <div className="text-lg font-semibold text-[#1787D4] mb-3">{step.number}</div>
                <h3 className="text-lg font-semibold text-[#031033] mb-2">{step.title}</h3>
                <p className="text-sm text-[#5A6A85] leading-relaxed">{step.desc}</p>

                {idx < steps.length - 1 && (
                  <div
                    className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#E2E8F0] items-center justify-center text-[#1787D4] z-10"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#1787D4] py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
            Ready to put your website online?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
            Pick a plan today and have your site live in minutes.
          </p>
          <Link
            href="/register"
            id="cta-get-started-btn"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1787D4]"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}
