import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section id="final-cta" className="section-pad-lg relative overflow-hidden bg-[#031033]">
      {/* Amber top accent line — solid, no gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#e8900a]" />
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-[0.06] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/nupat-cloud-logo-blackbg-removebg-preview.png"
            alt="Nupat Cloud Logo"
            width={160}
            height={50}
            className="object-contain h-auto w-auto"
          />
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
          Start Building Online{" "}
          <span className="text-[#e8900a]">with Confidence</span>
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Get reliable hosting, domain registration, business emails, and
          digital infrastructure designed for African businesses and developers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            id="final-cta-get-started"
            className="btn-primary text-base py-4 px-10 w-full sm:w-auto justify-center"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/domains"
            id="final-cta-search-domain"
            className="btn-outline-white justify-center gap-2 py-4 px-10 text-base font-semibold w-full sm:w-auto"
          >
            <Search className="w-5 h-5" />
            Search Domain
          </Link>
        </div>
      </div>
    </section>
  );
}
