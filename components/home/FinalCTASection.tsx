import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section id="final-cta" className="section-pad-lg relative overflow-hidden">
      {/* Flat navy background */}
      <div className="absolute inset-0 bg-[#031033]" />
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

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
          <span style={{ color: "#fd9f09" }}>with Confidence</span>
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Get reliable hosting, domain registration, business emails, and
          digital infrastructure designed for African businesses and developers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            id="final-cta-get-started"
            className="inline-flex items-center justify-center gap-2 py-4 px-10 rounded-xl text-base font-semibold bg-white text-[#031033] hover:bg-gray-100 transition-all shadow-xl w-full sm:w-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/domains"
            id="final-cta-search-domain"
            className="inline-flex items-center justify-center gap-2 py-4 px-10 rounded-xl text-base font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-all w-full sm:w-auto"
          >
            <Search className="w-5 h-5" />
            Search Domain
          </Link>
        </div>
      </div>
    </section>
  );
}
