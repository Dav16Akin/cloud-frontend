import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";

const rootFeatures = [
  {
    title: "SSH and SFTP access",
    description:
      "Log in as root, install what you need and manage files directly.",
  },
  {
    title: "Your choice of OS",
    description:
      "Deploy Ubuntu Server, Debian, AlmaLinux or other templates, or reinstall at any time.",
  },
  {
    title: "No overcommitting",
    description:
      "The vCPU and RAM in your plan are allocated to your server alone.",
  },
];

export default function VpsRootAccessSection() {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[360px] lg:max-w-[380px]">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F2F5FC]">
                <Image
                  src="/vps-2.png"
                  alt="Developer working on a Nupat Cloud VPS"
                  fill
                  sizes="(min-width: 1024px) 380px, 360px"
                  className="object-cover select-none"
                />
              </div>

              <div className="absolute -bottom-4 -right-3 sm:-right-4 bg-[#031033] text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold leading-tight">99.9% uptime</div>
                  <div className="text-xs text-white/70 leading-tight">Under 20ms ping</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-4">
              Full root access to your server
            </h2>

            <p className="text-lg text-[#5A6A85] leading-relaxed mb-8 max-w-xl">
              Servers arrive ready to use, and you can change anything from the kernel up.
              We never lock you out of your own machine.
            </p>

            <ul className="space-y-5">
              {rootFeatures.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#1787D4] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-semibold text-[#031033] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5A6A85] leading-relaxed max-w-lg">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
