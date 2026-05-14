import Link from "next/link";
import { Check, ArrowRight, Terminal } from "lucide-react";

const devFeatures = [
  "cPanel Hosting",
  "WordPress Hosting",
  "VPS Hosting (Coming Soon)",
  "Agency Hosting",
  "API Infrastructure (Coming Soon)",
  "Scalable Hosting Solutions",
];

export default function DeveloperSection() {
  return (
    <section id="developer" className="section-pad section-navy-tint relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: text */}
          <div>
            {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#fd9f09] mb-4">
              For Developers
            </span> */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#031033] mb-5 leading-tight">
              Hosting Infrastructure{" "}
              <span className="text-[#fd9f09]">for Developers</span>
            </h2>
            <p className="text-[#5a6a85] text-base leading-relaxed mb-4">
              Nupat Cloud gives developers and agencies reliable infrastructure to deploy websites, manage projects, host applications, and scale digital products efficiently.
            </p>
            <p className="text-[#5a6a85] text-sm leading-relaxed mb-8">
              Whether you are building websites for clients or launching startup products, our platform is designed to support your workflow.
            </p>

            <ul className="flex flex-col gap-3 mb-10">
              {devFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#fffaf0] border border-[#f9d59f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#fd9f09]" strokeWidth={2.5} />
                  </div>
                  <span className={`text-sm ${feat.includes("Coming Soon") ? "text-[#9ba8c0]" : "text-[#5a6a85]"}`}>{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="/hosting" id="developer-start-building" className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 rounded-xl text-base">
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: terminal mockup */}
          <div className="relative">
            <div className="bg-[#031033] rounded-2xl overflow-hidden border border-[#1e2d4a] shadow-2xl shadow-[#031033]/20">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111d35] border-b border-[#1e2d4a]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-[#4a6080] font-mono">nupat-cloud — terminal</span>
                </div>
                <Terminal className="w-3.5 h-3.5 text-[#4a6080]" />
              </div>
              {/* Terminal body */}
              <div className="p-6 font-mono text-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#fd9f09]">$</span>
                    <span className="text-[#8fa8d8]">nupat deploy --env production</span>
                  </div>
                  <div className="text-[#4a6080] text-xs pl-4">Deploying to Nupat Cloud...</div>
                  <div className="text-green-400 text-xs pl-4">✓ SSL configured</div>
                  <div className="text-green-400 text-xs pl-4">✓ DNS propagated</div>
                  <div className="text-green-400 text-xs pl-4">✓ CDN active</div>
                  <div className="text-green-400 text-xs pl-4">✓ Backups enabled</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[#fd9f09]">→</span>
                    <span className="text-white text-xs font-semibold">Live at: yourdomain.com</span>
                    <span className="w-1.5 h-4 bg-[#fd9f09] animate-pulse inline-block" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#1e2d4a]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#fd9f09]">$</span>
                      <span className="text-[#8fa8d8]">nupat status</span>
                    </div>
                    <div className="text-xs pl-4 mt-1 text-[#4a6080]">
                      Uptime: <span className="text-green-400">99.9%</span> | Region: <span className="text-[#fd9f09]">Lagos, NG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow under card */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#031033]/15 blur-xl rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
