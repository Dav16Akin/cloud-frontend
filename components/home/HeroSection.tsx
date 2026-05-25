import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#e8900a] pt-24 pb-16 min-h-[90vh] flex flex-col justify-center"
    >
      {/* Subtle white grid background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Abstract concentric wavy lines on the right side */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-45 select-none hidden lg:block overflow-hidden">
        <svg
          viewBox="0 0 500 500"
          fill="none"
          className="w-full h-full object-cover scale-125 origin-right"
        >
          {/* White wave lines */}
          <path d="M500 0 C450 100, 350 150, 300 250 C250 350, 450 400, 500 500" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M500 20 C440 110, 340 160, 290 260 C240 360, 440 410, 500 520" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
          <path d="M500 40 C430 120, 330 170, 280 270 C230 370, 430 420, 500 540" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.2" />
          <path d="M500 60 C420 130, 320 180, 270 280 C220 380, 420 430, 500 560" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.1" />
          
          {/* Navy wave lines */}
          <path d="M500 100 C300 120, 200 220, 150 320 C100 420, 300 450, 500 600" stroke="#031033" strokeWidth="1.5" strokeOpacity="0.3" />
          <path d="M500 120 C290 130, 190 230, 140 330 C90 430, 290 460, 500 620" stroke="#031033" strokeWidth="1.5" strokeOpacity="0.2" />
          <path d="M500 140 C280 140, 180 240, 130 340 C80 440, 280 470, 500 640" stroke="#031033" strokeWidth="1.5" strokeOpacity="0.15" />
          <path d="M500 160 C270 150, 170 250, 120 350 C70 450, 270 480, 500 660" stroke="#031033" strokeWidth="1.5" strokeOpacity="0.08" />
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 flex flex-col justify-between flex-1">
        
        {/* Main hero body */}
        <div className="max-w-3xl text-center mx-auto mt-8 mb-16 flex flex-col items-center">
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-1.5 mb-8 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <span className="w-1.5 h-1.5 bg-[#031033] block" />
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              Cloud Infrastructure for Africa
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-6 animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Cloud Infrastructure<br />
            <span className="text-[#031033]">Built for African</span> Businesses
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/90 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10 animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Launch, host, and grow your business online with reliable hosting,
            domain registration, business emails, and developer-friendly
            infrastructure designed for Africa.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up w-full"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/domains"
              id="hero-get-started"
              className="btn-navy text-base py-3.5 px-8 w-full sm:w-auto justify-center"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hosting"
              id="hero-view-plans"
              className="btn-white font-semibold text-base py-3.5 px-8 w-full sm:w-auto text-center"
            >
              View Hosting Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
