import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Server,
  Sparkles,
  Cpu,
  HardDrive,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const products = [
  {
    icon: Globe,
    title: "Domains",
    description:
      "Register and manage .ng, .africa and international domains, with DNS included.",
    href: "/domains",
    cta: "Search domains",
  },
  {
    icon: Server,
    title: "Hosting",
    description:
      "Web hosting set up for visitors in Nigeria and across Africa.",
    href: "/hosting",
    cta: "See hosting plans",
  },
  {
    icon: Sparkles,
    title: "AI website builder",
    description:
      "Describe your business and get a responsive website you can edit.",
    href: "/hosting",
    cta: "Build a website",
  },
  {
    icon: Cpu,
    title: "Cloud",
    description:
      "Deploy applications on servers in Africa or further afield.",
    href: "/hosting",
    cta: "See cloud hosting",
  },
  {
    icon: HardDrive,
    title: "VPS",
    description:
      "Virtual private servers with root access for apps that need their own resources.",
    href: "/vps",
    cta: "See VPS plans",
  },
  {
    icon: Briefcase,
    title: "Business tools",
    description:
      "Manage customers, operations and billing from the same account.",
    href: "/dashboard",
    cta: "See business tools",
  },
];

export default function WhyNupatSection() {
  return (
    <section
      id="products-ecosystem"
      className="py-16 sm:py-24 bg-[#F2F5FC] relative overflow-hidden"
    >
      {/* Background curvelines */}
      <div className="absolute top-10 -right-24 pointer-events-none select-none z-0 hidden md:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-120 lg:w-160 h-auto brightness-0 opacity-[0.04] rotate-[26deg]"
          aria-hidden
        />
      </div>
      <div className="absolute bottom-6 -left-28 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-110 lg:w-145 h-auto brightness-0 opacity-[0.04] -rotate-[32deg]"
          aria-hidden
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-12 flex flex-col items-center">
          <h2 className="type-h2 text-[#031033] mb-4 max-w-3xl">
            <span className="relative inline-block pb-1">
              Your digital business, connected
              <span
                className="absolute left-0 bottom-0 w-full h-1 bg-[#1787D4] rounded-full"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="type-lead text-[#5A6A85] max-w-2xl mx-auto">
            Run your website, servers and business operations from one
            account instead of piecing together separate providers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col justify-between h-full rounded-xl border border-[#E2E8F0] bg-white p-6 hover:border-[#1787D4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                <div>
                  <Icon className="w-6 h-6 text-[#1787D4] mb-5" aria-hidden="true" />
                  <h3 className="type-h3 text-[#031033] mb-2">{item.title}</h3>
                  <p className="text-base text-[#5A6A85] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-sm font-medium text-[#1787D4] group-hover:text-[#1370B5]">
                  <span>{item.cta}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Link
            href="/hosting"
            id="explore-all-products-btn"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#1787D4] hover:bg-[#1370B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
          >
            Compare hosting plans
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
