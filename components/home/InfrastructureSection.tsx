import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  features: string[];
  isFeatured?: boolean;
  href: string;
}

const serviceCards: ServiceCard[] = [
  {
    id: "web-hosting",
    title: "Web hosting",
    subtitle: "Dependable hosting for business websites.",
    features: [
      "Unmetered bandwidth",
      "Free .africa domain",
      "One-click app installer",
      "SSL certificate",
    ],
    href: "/hosting",
  },
  {
    id: "vps",
    title: "VPS",
    subtitle: "More control with dedicated resources.",
    features: [
      "Dedicated CPU and RAM",
      "Full root SSH access",
      "SSD cloud storage",
      "Automated daily backups",
    ],
    isFeatured: true,
    href: "/hosting#vps",
  },
  {
    id: "cloud-hosting",
    title: "Cloud hosting",
    subtitle: "Flexible infrastructure that scales with you.",
    features: [
      "Isolated environments",
      "Scale resources as you grow",
      "Priority support",
      "Global anycast DNS",
    ],
    href: "/hosting#cloud",
  },
  {
    id: "managed-wordpress",
    title: "Managed WordPress",
    subtitle: "WordPress hosting that we keep tuned and updated.",
    features: [
      "Built-in caching",
      "Automatic core and plugin updates",
      "Staging environments",
      "Threat protection",
    ],
    href: "/hosting#wordpress",
  },
];

export default function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left column: heading and description */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <h2 className="type-h2 text-[#031033] mb-4 text-balance">
              Infrastructure that grows with you
            </h2>
            <p className="type-lead text-[#5A6A85] leading-relaxed max-w-md">
              Whether you&apos;re launching a website or running a growing
              application, you can start small and add resources as your
              traffic grows.
            </p>
          </div>

          {/* Middle column: server rack image */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative w-full max-w-[360px] lg:max-w-[400px] aspect-square rounded-xl overflow-hidden bg-[#031033]">
              <Image
                src="/infrastructure.png"
                alt="Server racks in a data centre"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 360px, 400px"
              />
            </div>
          </div>

          {/* Right column: service cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {serviceCards.map((card) => {
              const featured = card.isFeatured;
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className={`block rounded-xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2 ${
                    featured
                      ? "bg-[#1787D4] hover:bg-[#1370B5] text-white"
                      : "bg-white border border-[#E2E8F0] hover:border-[#1787D4]"
                  }`}
                >
                  <div className="mb-3">
                    <h3 className={`type-h3 ${featured ? "text-white" : "text-[#031033]"}`}>
                      {card.title}
                    </h3>
                    <p className={`text-sm mt-0.5 ${featured ? "text-white/80" : "text-[#5A6A85]"}`}>
                      {card.subtitle}
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {card.features.map((feat) => (
                      <li
                        key={feat}
                        className={`flex items-center gap-2 text-sm ${
                          featured ? "text-white" : "text-[#031033]"
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 shrink-0 ${featured ? "text-white" : "text-[#12A150]"}`}
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
