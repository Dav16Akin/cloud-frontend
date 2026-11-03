import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section
      id="final-cta"
      className="py-16 sm:py-24 relative overflow-hidden bg-[#031033]"
    >
      {/* Background curvelines */}
      <div className="absolute -top-12 -left-20 pointer-events-none select-none z-0 hidden sm:block">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-120 lg:w-162.5 h-auto opacity-15 rotate-[-15deg]"
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-16 -right-24 pointer-events-none select-none z-0">
        <Image
          src="/curveline.png"
          alt=""
          width={500}
          height={200}
          className="w-105 lg:w-145 h-auto opacity-12 rotate-30"
          aria-hidden
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="type-h2 text-white mb-3">
          Get your business online with Nupat Cloud
        </h2>

        <p className="type-lead text-white/70 leading-relaxed mb-8 max-w-2xl mx-auto">
          NVMe hosting, domain registration and African cloud infrastructure,
          backed by 24/7 technical support.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            id="final-cta-get-started"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-white hover:bg-[#F2F5FC] text-[#031033] text-sm font-medium transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
          >
            Create a free account
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href="/domains"
            id="final-cta-search-domain"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-white/25 text-white hover:bg-white/10 text-sm font-medium transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#031033]"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Search domains
          </Link>
        </div>
      </div>
    </section>
  );
}
