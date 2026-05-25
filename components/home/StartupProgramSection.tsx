import Link from "next/link";
import { ArrowRight, Rocket, Users, Globe } from "lucide-react";

export default function StartupProgramSection() {
  return (
    <section
      id="startup"
      className="section-pad section-white relative overflow-hidden"
    >
      {/* Blue accent top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#031033]/30 to-transparent" />

      {/* Decorative blobs */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#f2f5fc] blur-[60px] pointer-events-none" />
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#fff8ee] blur-[60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-navy p-8 lg:p-14 border border-[#1e2d4a] shadow-apple overflow-hidden relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-linear-to-r from-transparent via-[#031033]/50 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              {/* <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#e8900a] mb-4 rounded-full">
                Startup Program
              </span> */}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
                Helping African Businesses{" "}
                <span className="text-[#e8900a]">Launch Online</span>
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-4">
                Through the Nupat Startup Program, selected businesses can
                access professional websites, hosting infrastructure, and
                digital tools to establish a strong online presence.
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                We believe African businesses deserve world-class digital
                infrastructure without unnecessary barriers.
              </p>
              <Link
                href="https://nupat.africa/startup-program"
                id="startup-apply-cta"
                className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 text-base"
              >
                Apply for Startup Program
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right */}
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Rocket,
                  title: "Fast Launch",
                  desc: "Get your business online in days, not months.",
                  color: "blue",
                },
                {
                  icon: Users,
                  title: "Local Support",
                  desc: "Support from a team that understands African markets.",
                  color: "orange",
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  desc: "Infrastructure built to reach customers worldwide.",
                  color: "blue",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 bg-white border border-[#e2eaff] hover:shadow-md transition-all"
                >
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center ${color === "orange" ? "bg-[#fff8ee]" : "bg-[#f2f5fc]"}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${color === "orange" ? "text-[#e8900a]" : "text-[#031033]"}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-[#031033] font-semibold text-sm mb-1">
                      {title}
                    </p>
                    <p className="text-[#5a6a85] text-xs leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
