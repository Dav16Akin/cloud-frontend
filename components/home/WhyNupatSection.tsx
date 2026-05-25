import { Server, Globe, Mail, Code, Headphones, Shield } from "lucide-react";

const features = [
  { icon: Server, title: "Reliable Hosting", description: "Experience fast and secure hosting infrastructure optimized for performance, uptime, and scalability.", color: "blue" },
  { icon: Globe, title: "Domain Registration", description: "Search and register premium domains for your business, startup, or brand in minutes.", color: "orange" },
  { icon: Mail, title: "Business Emails", description: "Create professional business email addresses that improve credibility and communication.", color: "blue" },
  { icon: Code, title: "Developer Friendly", description: "Built for developers, agencies, and startups that need flexibility, speed, and reliability.", color: "orange" },
  { icon: Headphones, title: "Local Support", description: "Get responsive support from a team that understands African businesses and digital challenges.", color: "blue" },
  { icon: Shield, title: "Secure Infrastructure", description: "Enterprise-grade security powered by Cloudflare, firewalls, malware protection, and automated backups.", color: "orange" },
];

export default function WhyNupatSection() {
  return (
    <section id="why-nupat" className="section-pad section-light relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#e8900a] mb-3">
            Why Nupat Cloud
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031033] mb-5">
            Everything You Need to{" "}
            <span className="text-[#e8900a]">Build Online</span>
          </h2>
          <p className="text-[#5a6a85] text-lg max-w-2xl mx-auto leading-relaxed">
            Nupat Cloud provides modern cloud infrastructure for businesses, startups, agencies, and developers looking to launch reliable digital products.
          </p>
        </div>

        {/* Feature cards — Vesper style: sharp corners, left accent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#e2eaff]">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isOrange = feat.color === "orange";
            // Create grid-line effect: add right + bottom borders on cards
            const isLastRow = idx >= features.length - (features.length % 3 || 3);
            const isLastCol = (idx + 1) % 3 === 0;
            return (
              <div
                key={feat.title}
                className={`feature-card p-7 flex flex-col gap-4 group ${
                  !isLastCol ? "border-r border-[#e2eaff]" : ""
                } ${
                  !isLastRow ? "border-b border-[#e2eaff]" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center ${
                    isOrange ? "bg-[#fff8ee] border border-[#f5d38a]" : "bg-[#f2f5fc] border border-[#dce4f7]"
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${isOrange ? "text-[#e8900a]" : "text-[#031033]"}`} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[#031033] font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-[#5a6a85] text-sm leading-relaxed">{feat.description}</p>
                </div>
                {/* Animated underline */}
                <div className={`h-[2px] w-0 group-hover:w-full transition-all duration-500 ${isOrange ? "bg-[#e8900a]" : "bg-[#031033]"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
