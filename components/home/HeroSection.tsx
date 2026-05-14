"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, Clock, Lock, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { WorldMap } from "../ui/world-map";

/* ─── Lazy-load the heavy WebGL globe after page paint ─── */
const DynamicWorld = dynamic(
  () => import("@/components/ui/globe").then((m) => ({ default: m.World })),
  { ssr: false, loading: () => <GlobePlaceholder /> },
);

/* ─── Globe config — orange / grey / white mix ─── */
const globeConfig = {
  pointSize: 4,
  globeColor: "#ffffff",
  showAtmosphere: false,
  atmosphereColor: "#fd9f09",
  atmosphereAltitude: 0.1,
  emissive: "#1a202c",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "#1a202c",
  ambientLight: "#9ca3af",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#fd9f09",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

/* ─── Arcs: orange, grey, white ─── */
const sampleArcs = [
  {
    order: 1,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: 40.7128,
    endLng: -74.006,
    arcAlt: 0.35,
    color: "#fd9f09",
  },
  {
    order: 2,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: 51.5074,
    endLng: -0.1278,
    arcAlt: 0.3,
    color: "#9ca3af",
  },
  {
    order: 3,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: 48.8566,
    endLng: 2.3522,
    arcAlt: 0.28,
    color: "#031033",
  },
  {
    order: 4,
    startLat: -1.2921,
    startLng: 36.8219,
    endLat: 6.5244,
    endLng: 3.3792,
    arcAlt: 0.18,
    color: "#fd9f09",
  },
  {
    order: 5,
    startLat: 9.0579,
    startLng: 7.4951,
    endLat: 6.5244,
    endLng: 3.3792,
    arcAlt: 0.12,
    color: "#9ca3af",
  },
  {
    order: 6,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: 25.2048,
    endLng: 55.2708,
    arcAlt: 0.4,
    color: "#031033",
  },
  {
    order: 7,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: -33.8688,
    endLng: 151.2093,
    arcAlt: 0.5,
    color: "#fd9f09",
  },
  {
    order: 8,
    startLat: 5.6037,
    startLng: -0.187,
    endLat: 6.5244,
    endLng: 3.3792,
    arcAlt: 0.1,
    color: "#9ca3af",
  },
  {
    order: 9,
    startLat: 6.5244,
    startLng: 3.3792,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.48,
    color: "#031033",
  },
];

const trustBadges = [
  { icon: Zap, label: "Fast & Secure Hosting" },
  { icon: Clock, label: "99.9% Uptime" },
  { icon: Shield, label: "Free SSL Certificates" },
  { icon: Lock, label: "Instant Deployment" },
];

/* ─── CSS-only placeholder shown while globe loads or on slow connections ─── */
function GlobePlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <div className="relative flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-[#fd9f09]/5 border border-[#fd9f09]/10" />
        <div className="absolute w-80 h-80 rounded-full border border-[#9ca3af]/20 animate-spin-slow" />
        <div
          className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-white/10 animate-spin-slow"
          style={{ animationDuration: "22s", animationDirection: "reverse" }}
        />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [showGlobe, setShowGlobe] = useState(true);
  const [globeInView, setGlobeInView] = useState(false);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  /* Connection-aware: skip WebGL on slow connections */
  useEffect(() => {
    const conn = (navigator as any).connection;
    if (
      conn &&
      (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")
    ) {
      setShowGlobe(false);
    }
  }, []);

  /* IntersectionObserver: only mount Canvas when globe container is in view */
  useEffect(() => {
    const el = globeContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setGlobeInView(true);
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white"
    >
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Nupat Cloud infrastructure"
          fill
          priority
          className="object-cover object-center"
          quality={85}
        />
        {/* White fade from TOP — bottom half of image stays visible */}
        <div className="absolute inset-0 hero-top-fade" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div className="absolute inset-0 z-2 grid-bg opacity-30 pointer-events-none" />

      {/* ── Centered content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center pt-48 pb-64">
        {/* Headline */}
        <div
          className="animate-fade-up mb-6"
          style={{ animationDelay: "80ms" }}
        >
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#031033]">
            Cloud Infrastructure{" "}
            <span className="text-[#fd9f09]">Built for African</span> Businesses
            &amp; Developers
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="animate-fade-up mb-10"
          style={{ animationDelay: "150ms" }}
        >
          <p className="text-[#5a6a85] text-lg leading-relaxed max-w-2xl mx-auto">
            Launch, host, and grow your business online with reliable hosting,
            domain registration, business emails, and developer-friendly
            infrastructure designed for Africa.
          </p>
        </div>

        {/* CTAs — two clean buttons */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          style={{ animationDelay: "220ms" }}
        >
          <Link
            href="/domains"
            id="hero-get-started"
            className="btn-primary inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 rounded-xl"
          >
            Search Domains
            <Search className="w-4 h-4" />
          </Link>
          <Link
            href="/hosting"
            id="hero-view-plans"
            className="btn-outline-navy inline-flex items-center justify-center gap-2 text-base py-3.5 px-8"
          >
            View Hosting Plans
          </Link>
        </div>
      </div>

      {/* <div className="absolute bottom-[-10%] sm:bottom-[-20%] left-1/2 -translate-x-1/2 w-full z-3 pointer-events-none opacity-80">
        <WorldMap
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              }, // Alaska (Fairbanks)
              end: {
                lat: 34.0522,
                lng: -118.2437,
              }, // Los Angeles
            },
            {
              start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
              end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            },
            {
              start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
              end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 28.6139, lng: 77.209 }, // New Delhi
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
            },
          ]}
        />
      </div> */}
      <div
        ref={globeContainerRef}
        className="absolute bottom-[-340px] left-1/2 -translate-x-1/2 w-[780px] h-[780px] z-[3] pointer-events-none"
      >
        {showGlobe && globeInView ? (
          <DynamicWorld globeConfig={globeConfig} data={sampleArcs} />
        ) : (
          <GlobePlaceholder />
        )}
      </div>

      {/* ── Bottom white fade — blends globe into the page ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[4] h-56 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #ffffff)",
        }}
      />
    </section>
  );
}
