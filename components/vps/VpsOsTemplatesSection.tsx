import Link from "next/link";
import { ArrowRight } from "lucide-react";

// OS and runtime logos (brand colours kept)
function UbuntuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#E95420" />
      <circle cx="12" cy="6.2" r="1.3" fill="#ffffff" />
      <circle cx="6.8" cy="15" r="1.3" fill="#ffffff" />
      <circle cx="17.2" cy="15" r="1.3" fill="#ffffff" />
      <path
        d="M12 8.5a3.5 3.5 0 0 0-3 1.7m6.1 0a3.5 3.5 0 0 0-1.8-1.5m-3.9 6.6a3.5 3.5 0 0 0 5.2 0"
        stroke="#ffffff"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function CentosIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#262577" />
      <path d="M12 4v16M4 12h16" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M7 7l10 10M17 7L7 17" stroke="#FFA500" strokeWidth="1.5" />
    </svg>
  );
}

function DebianIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#D70A53" />
      <path
        d="M13.5 8c-2.5 0-4.5 1.8-4.5 4.1 0 2.2 1.6 3.6 3.4 3.6 1.4 0 2.6-.9 2.6-2.1 0-1.2-.9-1.9-2-1.9-.9 0-1.5.5-1.5 1.2"
        stroke="#ffffff"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WordpressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#21759B" />
      <path
        d="M6.5 12c0 2.4 1.5 4.5 3.6 5.4L7 10.1c-.3.6-.5 1.2-.5 1.9zm8.9 4.9c.7-.6 1.2-1.5 1.2-2.7 0-1.3-.7-2.2-1.3-3.1-.6-.9-1.1-1.6-1.1-2.4 0-.9.7-1.8 1.7-1.8.1 0 .2 0 .3.1-1.2-1.1-2.7-1.7-4.4-1.7-2.4 0-4.5 1.2-5.7 3.1l4 11.5 1.4-4.2-1.2-3.8c.4 0 .8-.1.8-.1.4 0 .4-.6 0-.6 0 0-1.2.1-1.9.1-.7 0-1.9-.1-1.9-.1-.4 0-.4.6 0 .6 0 0 .5.1.8.1l2.5 7.4c.5-.1 1-.3 1.5-.6l-2-6 1.9-5.7c.4 0 .8-.1.8-.1.4 0 .4-.6 0-.6 0 0-1.2.1-1.9.1-.4 0-1-.1-1.5-.1l3.5 9.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

function DockerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#1D63ED" />
      <path
        d="M7 11h1.5v1.5H7zm2 0h1.5v1.5H9zm2 0h1.5v1.5H11zm-4-2h1.5v1.5H7zm2 0h1.5v1.5H9zm2 0h1.5v1.5H11zm2 2h1.5v1.5H13zm2 0h1.5v1.5H15zm-4-4h1.5v1.5H11z"
        fill="#ffffff"
      />
      <path
        d="M18.5 11.5c-.3-.2-1.2-.3-1.8.1-.1-.7-.6-1.3-1.3-1.6l-.4.3c.3.5.3 1.2.1 1.7H5c-.1.7.1 1.9 1 2.8 1 1 2.5 1.2 5.5 1.2 3.6 0 5.4-1.2 6.5-3.5.3 0 .7-.3.8-.6l-.3-.4z"
        fill="#ffffff"
      />
    </svg>
  );
}

function NodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#539E43" />
      <path
        d="M12 6.5l5 2.9v5.8l-5 2.9-5-2.9V9.4l5-2.9z"
        stroke="#ffffff"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M12 9.5v5M9.5 11l5 2.8M14.5 11l-5 2.8"
        stroke="#ffffff"
        strokeWidth="1"
      />
    </svg>
  );
}

const templates = [
  {
    name: "Ubuntu Server",
    version: "22.04 LTS / 24.04 LTS",
    icon: UbuntuIcon,
    tag: "Popular",
  },
  {
    name: "CentOS Linux",
    version: "Stream 9 / AlmaLinux 9",
    icon: CentosIcon,
    tag: "Enterprise",
  },
  {
    name: "Debian",
    version: "Debian 12 Bookworm",
    icon: DebianIcon,
    tag: "Stable",
  },
  {
    name: "WordPress",
    version: "LEMP + FastCGI cache",
    icon: WordpressIcon,
    tag: "One-click",
  },
  {
    name: "Docker",
    version: "Engine + Compose v2",
    icon: DockerIcon,
    tag: "DevOps",
  },
  {
    name: "Node.js",
    version: "v20 / v22 LTS + PM2",
    icon: NodeIcon,
    tag: "Runtime",
  },
];

export default function VpsOsTemplatesSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#F2F5FC] border-y border-[#E2E8F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#031033] mb-4">
            Ready-to-deploy OS templates
          </h2>
          <p className="text-lg text-[#5A6A85] leading-relaxed">
            Skip the base install. Pick an operating system or a Docker image and your server
            boots with it ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.name}
                className="bg-white rounded-xl p-5 border border-[#E2E8F0] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-9 h-9 shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-[#031033]">{tpl.name}</h3>
                    <p className="text-xs text-[#5A6A85] mt-0.5">{tpl.version}</p>
                  </div>
                </div>

                <span className="text-xs font-medium text-[#1787D4] bg-[#E8F4FC] px-2.5 py-0.5 rounded-full shrink-0">
                  {tpl.tag}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-12 rounded-xl bg-white border border-[#E2E8F0] p-6 sm:p-8 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-[#031033] mb-2">
            More runtimes and frameworks
          </h3>
          <p className="text-sm text-[#5A6A85] leading-relaxed max-w-xl mx-auto mb-5">
            Choose from over 120 pre-built application runtimes, databases and development
            frameworks, and have your app live on the web in a click.
          </p>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-[#1787D4] hover:text-[#1370B5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1787D4] focus-visible:ring-offset-2"
          >
            See VPS plans
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
