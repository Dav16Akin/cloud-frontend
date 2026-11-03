import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function VpsHeroSection() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 text-left">
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#031033] mb-5 max-w-3xl">
              Virtual servers with dedicated resources and full root access
            </h1>

            <p className="text-lg text-[#5A6A85] leading-relaxed mb-8 max-w-xl">
              Run websites, applications and heavier workloads on a VPS you configure yourself.
              Your vCPU and RAM are reserved for you, and you can scale up when traffic grows.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#pricing"
                id="hero-choose-plan-cta"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1787D4] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1370B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                See VPS plans
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                href="#use-cases"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D5DCE6] bg-white px-5 text-sm font-medium text-[#031033] transition-colors hover:bg-[#F2F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
              >
                Browse use cases
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
              <Image
                src="/vps-hero.png"
                alt="Nupat Cloud VPS hosting illustration"
                width={460}
                height={610}
                priority
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 420px, 100vw"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
