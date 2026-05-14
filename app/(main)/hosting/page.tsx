import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Lock,
  RefreshCw,
  Mail,
  Shield,
  Activity,
  Server,
  Globe,
  Layout,
  Cloud,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hosting — Nupat Cloud",
  description:
    "Fast, secure, and reliable hosting for African businesses. Shared, WordPress, and Agency hosting with 99.9% uptime guarantee.",
};

const features = [
  {
    icon: Zap,
    title: "SSD Storage",
    desc: "High-performance SSD infrastructure for faster website loading speeds.",
    color: "blue",
  },
  {
    icon: Lock,
    title: "Free SSL Certificates",
    desc: "Protect your website and customer data with free SSL encryption.",
    color: "orange",
  },
  {
    icon: RefreshCw,
    title: "Daily Backups",
    desc: "Automatic backups help protect your data from unexpected issues.",
    color: "blue",
  },
  {
    icon: Mail,
    title: "Business Emails",
    desc: "Create professional email accounts for your business.",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Advanced Security",
    desc: "Protection against malware, attacks, and unauthorized access.",
    color: "blue",
  },
  {
    icon: Activity,
    title: "99.9% Uptime",
    desc: "Reliable infrastructure built for stability and availability.",
    color: "orange",
  },
];

const hostingTypes = [
  {
    icon: Server,
    title: "Shared Hosting",
    desc: "Affordable hosting for small businesses and websites.",
    available: true,
  },
  {
    icon: Globe,
    title: "WordPress Hosting",
    desc: "Optimized hosting environment for WordPress websites.",
    available: true,
  },
  {
    icon: Layout,
    title: "Agency Hosting",
    desc: "Designed for agencies and developers managing multiple clients.",
    available: true,
  },
  {
    icon: Cloud,
    title: "VPS Hosting",
    desc: "Scalable virtual servers for advanced workloads.",
    available: false,
  },
];

export default function HostingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden section-navy-tint">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4 bg-[#fffaf0] border border-[#f9d59f] rounded-full px-4 py-1.5">Web Hosting</span> */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#031033] mb-5 leading-tight">
            Fast, Secure &amp; Reliable{" "}
            <span className="gradient-text">Hosting</span>
          </h1>
          <p className="text-[#5a6a85] text-lg mb-10 max-w-xl mx-auto">
            Host your websites and applications on cloud infrastructure designed
            for performance, security, and growth.
          </p>
          <Link
            href="/pricing"
            id="hosting-get-hosting-cta"
            className="btn-primary inline-flex items-center gap-2 py-4 px-10 rounded-xl text-base"
          >
            Get Hosting <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="section-pad section-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#031033] mb-3">Features</span> */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] mb-4">
              Powerful <span className="gradient-text">Hosting Features</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              const isOrange = feat.color === "orange";
              return (
                <div
                  key={feat.title}
                  className="feature-card p-7 flex flex-col gap-4 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOrange ? "bg-[#fffaf0] border border-[#f9d59f]" : "bg-[#f2f5fc] border border-[#dce4f7]"} group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`w-6 h-6 ${isOrange ? "text-[#fd9f09]" : "text-[#031033]"}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <h3 className="text-[#031033] font-bold text-lg mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-[#5a6a85] text-sm leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hosting types */}
      <section className="section-pad section-light relative">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#031033] mb-3">
              Hosting <span className="gradient-text">Types</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {hostingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className={`feature-card p-6 flex items-start gap-4 ${!type.available ? "opacity-60" : ""}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f2f5fc] border border-[#dce4f7] flex items-center justify-center shrink-0">
                    <Icon
                      className="w-6 h-6 text-[#031033]"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#031033] font-bold">{type.title}</h3>
                      {!type.available && (
                        <span className="text-[10px] bg-[#fffaf0] text-[#fd9f09] border border-[#f9d59f] px-2 py-0.5 rounded-full font-semibold">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-[#5a6a85] text-sm">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Nupat */}
      <section className="section-pad section-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="bg-[#031033] rounded-3xl p-10 lg:p-14 text-center overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/nupat-cloud-logo-blackbg-removebg-preview.png"
                alt="Nupat Cloud Logo"
                width={140}
                height={40}
                className="object-contain h-auto w-auto"
              />
            </div>
            {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4">
              Why Nupat Cloud
            </span> */}
            <h2 className="text-3xl font-extrabold text-white mb-5">
              Built for{" "}
              <span style={{ color: "#fd9f09" }}>African Businesses</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Nupat Cloud combines reliable infrastructure, local support,
              modern hosting tools, and affordable pricing to help businesses
              grow online confidently.
            </p>
            <Link
              href="/pricing"
              id="hosting-choose-plan-cta"
              className="inline-flex items-center gap-2 py-4 px-10 rounded-xl text-base font-semibold bg-white text-[#031033] hover:bg-gray-100 transition-all shadow-xl"
            >
              Choose Hosting Plan <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
